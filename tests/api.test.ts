import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server/app';
import { emptyProfile } from '../shared/model';
let runtime: ReturnType<typeof createApp>, directory: string;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'jky-test-'));
  // Mirror the default hidden .data path so private-original serving is exercised.
  runtime = createApp({ dataDir: join(directory, '.data'), jobs: false });
});
afterEach(() => {
  runtime.close();
  rmSync(directory, { recursive: true, force: true });
});
async function account(email = 'one@example.test') {
  const agent = request.agent(runtime.app);
  const response = await agent.post('/api/auth/register').send({
    name: 'Test Applicant',
    email,
    password: 'a-strong-test-password',
    adult: true,
    consent: true,
  });
  expect(response.status).toBe(201);
  return { agent, csrf: response.body.csrf };
}
async function packet(a: Awaited<ReturnType<typeof account>>) {
  const response = await a.agent
    .post('/api/packets')
    .set('x-csrf-token', a.csrf)
    .send({ title: 'Test packet', packId: 'uceed-2027-reference' });
  expect(response.status).toBe(201);
  return response.body;
}
describe('private API boundary', () => {
  it('denies anonymous reads and cross-origin account creation', async () => {
    expect((await request(runtime.app).get('/api/packets')).status).toBe(401);
    expect(
      (
        await request(runtime.app)
          .post('/api/auth/demo')
          .set('Origin', 'https://evil.example')
          .send({})
      ).status,
    ).toBe(403);
  });
  it('requires adult and processing consent during registration', async () => {
    expect(
      (
        await request(runtime.app).post('/api/auth/register').send({
          name: 'Applicant',
          email: 'x@example.test',
          password: 'a-strong-test-password',
          adult: false,
          consent: true,
        })
      ).status,
    ).toBe(400);
  });
  it('requires CSRF and denies every cross-owner packet operation', async () => {
    const a = await account(),
      b = await account('two@example.test'),
      p = await packet(a);
    expect(
      (await a.agent.post('/api/packets').send({ title: 'Bad', packId: p.packId })).status,
    ).toBe(403);
    expect((await b.agent.get(`/api/packets/${p.id}`)).status).toBe(404);
    expect(
      (
        await b.agent
          .delete(`/api/packets/${p.id}`)
          .set('x-csrf-token', b.csrf)
          .send({ expectedRevision: 1 })
      ).status,
    ).toBe(404);
    expect(
      (
        await b.agent
          .post(`/api/packets/${p.id}/evaluate`)
          .set('x-csrf-token', b.csrf)
          .send({ expectedRevision: 1 })
      ).status,
    ).toBe(404);
  });
  it('rejects stale writes and marks previous reports historical', async () => {
    const a = await account(),
      p = await packet(a);
    const run = await a.agent
      .post(`/api/packets/${p.id}/evaluate`)
      .set('x-csrf-token', a.csrf)
      .send({ expectedRevision: 1 });
    expect(run.status).toBe(201);
    expect(
      (
        await a.agent
          .patch(`/api/packets/${p.id}/profile`)
          .set('x-csrf-token', a.csrf)
          .send({ expectedRevision: 1, profile: { ...emptyProfile, nameChanged: 'yes' } })
      ).status,
    ).toBe(200);
    expect(
      (
        await a.agent
          .patch(`/api/packets/${p.id}/profile`)
          .set('x-csrf-token', a.csrf)
          .send({ expectedRevision: 1, profile: emptyProfile })
      ).status,
    ).toBe(409);
    const report = await a.agent.get(`/api/packets/${p.id}/reports/${run.body.id}`);
    expect(report.body.stale).toBe(true);
  });
  it('does not create duplicate evaluation runs on retries', async () => {
    const a = await account(),
      p = await packet(a);
    const first = await a.agent
      .post(`/api/packets/${p.id}/evaluate`)
      .set('x-csrf-token', a.csrf)
      .send({ expectedRevision: 1 });
    const second = await a.agent
      .post(`/api/packets/${p.id}/evaluate`)
      .set('x-csrf-token', a.csrf)
      .send({ expectedRevision: 1 });
    expect(first.body.id).toBe(second.body.id);
  });
  it('rejects disguised content and keeps quarantine private', async () => {
    const a = await account(),
      p = await packet(a);
    const fake = await a.agent
      .post(`/api/packets/${p.id}/documents`)
      .set('x-csrf-token', a.csrf)
      .attach('file', Buffer.from('malicious plain text'), 'fake.pdf');
    expect(fake.status).toBe(400);
    const queued = await a.agent
      .post(`/api/packets/${p.id}/documents`)
      .set('x-csrf-token', a.csrf)
      .attach('file', Buffer.from('%PDF-1.4\nnot-yet-inspected'), 'example.pdf');
    expect(queued.status).toBe(202);
    expect(
      (await a.agent.get(`/api/packets/${p.id}/documents/${queued.body.document.id}/content`))
        .status,
    ).toBe(409);
  });
  it('deduplicates upload retries within a packet', async () => {
    const a = await account(),
      p = await packet(a);
    const send = () =>
      a.agent
        .post(`/api/packets/${p.id}/documents`)
        .set('x-csrf-token', a.csrf)
        .attach('file', Buffer.from('%PDF-1.4\nfixture'), 'same.pdf');
    const one = await send(),
      two = await send();
    expect(two.body.duplicate).toBe(true);
    expect(two.body.document.id).toBe(one.body.document.id);
  });
  it('deletes files, evidence, runs and pending jobs with the packet', async () => {
    const a = await account(),
      p = await packet(a);
    await a.agent
      .post(`/api/packets/${p.id}/documents`)
      .set('x-csrf-token', a.csrf)
      .attach('file', Buffer.from('%PDF-1.4\nfixture'), 'delete.pdf');
    const detail = await a.agent.get(`/api/packets/${p.id}`);
    expect(readdirSync(runtime.store.objects)).toHaveLength(1);
    const deleted = await a.agent
      .delete(`/api/packets/${p.id}`)
      .set('x-csrf-token', a.csrf)
      .send({ expectedRevision: detail.body.packet.revision });
    expect(deleted.status).toBe(200);
    expect(readdirSync(runtime.store.objects)).toHaveLength(0);
    expect(runtime.store.db.prepare('SELECT * FROM jobs').all()).toHaveLength(0);
    expect((await a.agent.get(`/api/packets/${p.id}`)).status).toBe(404);
  });
  it('creates an isolated synthetic demo with real downloadable fixture files', async () => {
    const agent = request.agent(runtime.app);
    const result = await agent.post('/api/auth/demo').send({});
    expect(result.status).toBe(201);
    const detail = await agent.get(`/api/packets/${result.body.packetId}`);
    expect(detail.body.documents).toHaveLength(4);
    expect(detail.body.runs[0].counts.fail).toBe(2);
    const other = await account('other@example.test');
    for (const document of detail.body.documents) {
      const url = `/api/packets/${result.body.packetId}/documents/${document.id}/content`;
      const original = await agent.get(url);
      expect(original.status).toBe(200);
      expect(original.headers['content-type']).toContain(document.mime);
      expect(original.headers['cache-control']).toBe('no-store');
      expect(original.body.length).toBe(document.size);
      expect((await other.agent.get(url)).status).toBe(404);
      expect((await request(runtime.app).get(url)).status).toBe(401);
    }
  });
  it('erases an account and invalidates the active session', async () => {
    const a = await account();
    await packet(a);
    expect(
      (
        await a.agent
          .delete('/api/account')
          .set('x-csrf-token', a.csrf)
          .send({ confirmation: 'DELETE' })
      ).status,
    ).toBe(200);
    expect((await a.agent.get('/api/me')).status).toBe(401);
    expect(runtime.store.db.prepare('SELECT * FROM users').all()).toHaveLength(0);
  });
});
describe('server-owned product catalog', () => {
  it('serves limits, questions, conditions, starters and packs without a session', async () => {
    const response = await request(runtime.app).get('/api/catalog');
    expect(response.status).toBe(200);
    expect(response.body.limits).toMatchObject({ packetFiles: 10, fileBytes: 10 * 1024 * 1024 });
    expect(response.body.questions.map((q: { field: string }) => q.field)).toContain('category');
    expect(response.body.conditions[0]).toEqual({ value: 'always', label: 'Always required' });
    expect(response.body.conditions).toContainEqual({
      value: 'nameChanged:yes',
      label: 'When names differ',
    });
    const job = response.body.templates.find((t: { id: string }) => t.id === 'job');
    expect(job.starter[0]).toMatchObject({ title: 'Resume', mime: 'application/pdf' });
    expect(response.body.packs[0]).toMatchObject({
      id: 'uceed-2027-reference',
      requirementCount: 18,
      assurance: 'reference',
    });
    expect(response.body.packs[0].requirements).toBeUndefined();
    expect(response.body.packs[0].items[0]).toEqual({
      id: 'photo',
      title: 'Recent photograph',
      group: 'Identity',
      mime: 'image/jpeg',
      conditional: false,
      dependsOn: [],
    });
  });
  it('returns the resolved checklist and a live evaluation with packet details', async () => {
    const a = await account();
    const p = await packet(a);
    const detail = await a.agent.get(`/api/packets/${p.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.pack.id).toBe('uceed-2027-reference');
    expect(detail.body.live.packetRevision).toBe(p.revision);
    expect(detail.body.live.checks).toHaveLength(18);
    expect(detail.body.evaluatorVersion).toMatch(/^\d+\.\d+\.\d+$/);
    const list = await a.agent.get('/api/packets');
    expect(list.body[0].checklist).toEqual({ title: 'UCEED 2027', assurance: 'reference' });
  });
  it('rejects profile answers that the catalog does not offer', async () => {
    const a = await account();
    const p = await packet(a);
    const response = await a.agent
      .patch(`/api/packets/${p.id}/profile`)
      .set('x-csrf-token', a.csrf)
      .send({
        expectedRevision: p.revision,
        profile: { ...emptyProfile, category: 'not-a-category' },
      });
    expect(response.status).toBe(400);
  });
});
