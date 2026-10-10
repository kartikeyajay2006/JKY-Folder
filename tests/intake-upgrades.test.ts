import { beforeEach, afterEach, expect, it } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { createApp } from '../server/app';
import { draftInstructions } from '../shared/instruction-draft';
import type { DocumentRecord } from '../shared/model';
let runtime: ReturnType<typeof createApp>, dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'jky-intake-'));
  runtime = createApp({ dataDir: dir, jobs: false });
});
afterEach(() => {
  runtime.close();
  rmSync(dir, { recursive: true, force: true });
});
async function account(email = 'resume@example.test') {
  const agent = request.agent(runtime.app);
  const r = await agent
    .post('/api/auth/register')
    .send({
      name: 'Test Applicant',
      email,
      password: 'a-strong-test-password',
      adult: true,
      consent: true,
    });
  expect(r.status).toBe(201);
  return { agent, csrf: r.body.csrf };
}
async function begin(a: Awaited<ReturnType<typeof account>>, bytes: Buffer) {
  return a.agent
    .post('/api/uploads')
    .set('x-csrf-token', a.csrf)
    .send({
      name: 'instructions.pdf',
      size: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      intakeId: randomUUID(),
    });
}
it('persists chunks across restart, prevents out-of-order data and creates only one folder after completion', async () => {
  let a = await account();
  const bytes = Buffer.from('%PDF-test resumable original'),
    start = await begin(a, bytes),
    id = start.body.id;
  expect(start.status).toBe(201);
  expect((await a.agent.get('/api/packets')).body).toEqual([]);
  expect(
    (
      await a.agent
        .put(`/api/uploads/${id}`)
        .set('x-csrf-token', a.csrf)
        .set('Content-Type', 'application/octet-stream')
        .set('upload-offset', '0')
        .send(bytes.subarray(0, 8))
    ).status,
  ).toBe(200);
  runtime.close();
  runtime = createApp({ dataDir: dir, jobs: false });
  const agent = request.agent(runtime.app),
    login = await agent
      .post('/api/auth/login')
      .send({ email: 'resume@example.test', password: 'a-strong-test-password' });
  a = { agent, csrf: login.body.csrf };
  expect((await a.agent.get(`/api/uploads/${id}`)).body.offset).toBe(8);
  expect(
    (
      await a.agent
        .put(`/api/uploads/${id}`)
        .set('x-csrf-token', a.csrf)
        .set('Content-Type', 'application/octet-stream')
        .set('upload-offset', '0')
        .send(bytes.subarray(8))
    ).status,
  ).toBe(409);
  expect(
    (await a.agent.post(`/api/uploads/${id}/complete`).set('x-csrf-token', a.csrf).send({})).status,
  ).toBe(409);
  expect(
    (
      await a.agent
        .put(`/api/uploads/${id}`)
        .set('x-csrf-token', a.csrf)
        .set('Content-Type', 'application/octet-stream')
        .set('upload-offset', '8')
        .send(bytes.subarray(8))
    ).status,
  ).toBe(200);
  const complete = await a.agent
    .post(`/api/uploads/${id}/complete`)
    .set('x-csrf-token', a.csrf)
    .send({});
  expect(complete.status).toBe(202);
  const retry = await a.agent
    .post(`/api/uploads/${id}/complete`)
    .set('x-csrf-token', a.csrf)
    .send({});
  expect(retry.body.document.id).toBe(complete.body.document.id);
  expect((await a.agent.get('/api/packets')).body).toHaveLength(1);
});
it('isolates sessions, requires CSRF and rejects mismatched hashes without creating data', async () => {
  const a = await account(),
    b = await account('other@example.test'),
    bytes = Buffer.from('%PDF-original');
  const start = await begin(a, bytes),
    id = start.body.id;
  expect((await b.agent.get(`/api/uploads/${id}`)).status).toBe(404);
  expect((await a.agent.delete(`/api/uploads/${id}`)).status).toBe(403);
  await a.agent
    .put(`/api/uploads/${id}`)
    .set('x-csrf-token', a.csrf)
    .set('Content-Type', 'application/octet-stream')
    .set('upload-offset', '0')
    .send(Buffer.from('%PDF-tampered'));
  expect(
    (await a.agent.post(`/api/uploads/${id}/complete`).set('x-csrf-token', a.csrf).send({})).status,
  ).toBe(400);
  expect((await a.agent.get('/api/packets')).body).toEqual([]);
});
it('requires explicit source decisions and preserves page anchors; deleting the source blocks new evaluations', async () => {
  const a = await account(),
    upload = await a.agent
      .post('/api/intake')
      .set('x-csrf-token', a.csrf)
      .attach('file', Buffer.from('%PDF-instructions'), 'instructions.pdf'),
    pid = upload.body.packetId;
  const doc: DocumentRecord = {
    ...upload.body.document,
    mime: 'application/pdf',
    status: 'ready',
    pageCount: 2,
    pages: [
      { number: 1, text: 'Upload passport as PDF.\nProvide photograph as JPG.', method: 'native' },
      {
        number: 2,
        text: 'If applying for a scholarship, submit category certificate.',
        method: 'ocr',
        confidence: 60,
      },
    ],
  };
  runtime.store.db
    .prepare('UPDATE documents SET payload=? WHERE id=?')
    .run(JSON.stringify(doc), doc.id);
  const packet = (await a.agent.get(`/api/packets/${pid}`)).body.packet;
  const d = await a.agent
    .post(`/api/packets/${pid}/instruction-drafts`)
    .set('x-csrf-token', a.csrf)
    .send({ expectedRevision: packet.revision, documentId: doc.id });
  expect(d.status).toBe(201);
  expect(d.body.candidates).toHaveLength(3);
  expect(d.body.candidates[2].uncertain).toBe(true);
  expect((await a.agent.get(`/api/packets/${pid}`)).body.packet.mode).toBe('uploads');
  const input = {
    expectedRevision: packet.revision,
    requirements: d.body.candidates.map((c: any) => ({ ...c.requirement, optional: false })),
    decisions: [],
    completenessConfirmed: true,
  };
  const path = `/api/packets/${pid}/instruction-drafts/${d.body.id}/confirm`;
  expect((await a.agent.post(path).set('x-csrf-token', a.csrf).send(input)).status).toBe(400);
  input.decisions = d.body.candidates.map((c: any) => ({
    id: c.id,
    accepted: true,
    note: 'Compared source wording and conditions with each original page.',
  }));
  const confirmed = await a.agent.post(path).set('x-csrf-token', a.csrf).send(input);
  expect(confirmed.status).toBe(200);
  expect(confirmed.body.customPack.requirements[0].sourceAnchor).toContain(':1:');
  await a.agent
    .delete(`/api/packets/${pid}/documents/${doc.id}`)
    .set('x-csrf-token', a.csrf)
    .send({ expectedRevision: confirmed.body.revision });
  const detail = (await a.agent.get(`/api/packets/${pid}`)).body;
  expect(detail.sourceChanged).toBe(true);
  expect(
    (
      await a.agent
        .post(`/api/packets/${pid}/evaluate`)
        .set('x-csrf-token', a.csrf)
        .send({ expectedRevision: detail.packet.revision })
    ).status,
  ).toBe(409);
});
it('does not convert incidental prose into requirements and keeps exact page character spans', () => {
  const doc = {
    id: 'id',
    name: 'instructions.pdf',
    hash: 'hash',
    pages: [
      {
        number: 3,
        text: 'Welcome to the application.\n  Submit passport PDF.\nOur team explains certificates.',
        method: 'native',
      },
    ],
  } as DocumentRecord;
  const d = draftInstructions(doc);
  expect(d.candidates).toHaveLength(1);
  const c = d.candidates[0];
  expect(doc.pages[0].text.slice(c.start, c.start + c.length)).toBe(c.quote);
  expect(c.page).toBe(3);
  expect(c.requirement.optional).toBe(true);
});
