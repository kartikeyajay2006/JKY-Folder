import { beforeEach, afterEach, it, expect } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { createHash } from 'node:crypto';
import { createApp } from '../server/app';
import { starterRequirements, importInstructionLines, packetPack } from '../shared/templates';
import { evaluate, EVALUATOR_VERSION } from '../shared/evaluate';
let runtime: ReturnType<typeof createApp>, directory: string;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'jky-applications-'));
  runtime = createApp({ dataDir: join(directory, '.data'), jobs: false });
});
afterEach(() => {
  runtime.close();
  rmSync(directory, { recursive: true, force: true });
});
async function account(email = 'applicant@example.test') {
  const agent = request.agent(runtime.app);
  const auth = await agent.post('/api/auth/register').send({
    name: 'Synthetic Applicant',
    email,
    password: 'synthetic-starting-password',
    adult: true,
    consent: true,
  });
  expect(auth.status).toBe(201);
  return { agent, csrf: auth.body.csrf };
}
async function application(a: Awaited<ReturnType<typeof account>>, extra = {}) {
  const result = await a.agent
    .post('/api/packets')
    .set('x-csrf-token', a.csrf)
    .send({
      title: 'Design internship',
      templateId: 'job',
      destination: 'Example Employer',
      deadline: '2026-12-15',
      ...extra,
    });
  expect(result.status).toBe(201);
  return result.body;
}
it('creates independent editable application starters with real current counts', async () => {
  const a = await account();
  const p = await application(a);
  expect(p.customPack.assurance).toBe('user_defined');
  expect(p.customPack.requirements).toHaveLength(4);
  expect(packetPack(p).requirements[0].title).toBe('Resume');
  const list = await a.agent.get('/api/packets');
  expect(list.body[0].currentCounts.fail).toBe(1);
  expect(list.body[0].currentCounts.not_applicable).toBe(3);
  expect(list.body[0].documentCount).toBe(0);
});
it('imports instruction lines as editable items without inventing interpretations', () => {
  const rows = importInstructionLines(
    '1. Resume as PDF\n- Certificate if applicable\n\n• Supporting evidence',
  );
  expect(rows.map((r) => r.title)).toEqual([
    'Resume as PDF',
    'Certificate if applicable',
    'Supporting evidence',
  ]);
  expect(rows.every((r) => r.condition.op === 'always' && r.mime === 'any')).toBe(true);
});
it('rejects empty custom lists, duplicate identifiers, unsafe sources and invalid dates', async () => {
  const a = await account();
  for (const extra of [
    { requirements: [] },
    { requirements: [starterRequirements('job')[0], starterRequirements('job')[0]] },
    { sourceUrl: 'javascript:alert(1)' },
    { deadline: '2026-02-30' },
  ]) {
    expect(
      (
        await a.agent
          .post('/api/packets')
          .set('x-csrf-token', a.csrf)
          .send({ title: 'Custom test', templateId: 'custom', ...extra })
      ).status,
    ).toBe(400);
  }
});
it('persists application details and archive state with ownership and revision conflicts', async () => {
  const a = await account(),
    b = await account('other@example.test'),
    p = await application(a);
  const payload = {
    expectedRevision: 1,
    details: {
      title: 'Updated internship',
      destination: 'Example Team',
      deadline: '2027-01-12',
      archived: true,
      notes: 'Actual instructions retained.',
    },
  };
  expect(
    (await b.agent.patch(`/api/packets/${p.id}`).set('x-csrf-token', b.csrf).send(payload)).status,
  ).toBe(404);
  expect(
    (await a.agent.patch(`/api/packets/${p.id}`).set('x-csrf-token', a.csrf).send(payload)).status,
  ).toBe(200);
  expect(
    (await a.agent.patch(`/api/packets/${p.id}`).set('x-csrf-token', a.csrf).send(payload)).status,
  ).toBe(409);
  const saved = await a.agent.get(`/api/packets/${p.id}`);
  expect(saved.body.packet.archived).toBe(true);
  expect(saved.body.packet.notes).toBe('Actual instructions retained.');
});
it('updates custom checklist versions and keeps old report source provenance', async () => {
  const a = await account(),
    p = await application(a, { sourceUrl: 'https://example.test/original' });
  const first = await a.agent
    .post(`/api/packets/${p.id}/evaluate`)
    .set('x-csrf-token', a.csrf)
    .send({ expectedRevision: 1 });
  const update = await a.agent
    .put(`/api/packets/${p.id}/checklist`)
    .set('x-csrf-token', a.csrf)
    .send({
      expectedRevision: 1,
      requirements: starterRequirements('college'),
      sourceUrl: 'https://example.test/new',
      notes: 'Updated source instructions',
    });
  expect(update.status).toBe(200);
  expect(update.body.customPack.version).not.toBe(p.customPack.version);
  const report = await a.agent.get(`/api/packets/${p.id}/reports/${first.body.id}`);
  expect(report.body.sourceUrl).toBe('https://example.test/original');
  expect(report.body.stale).toBe(true);
});
it('preserves an older evaluator snapshot and creates a current review once per input version', async () => {
  const a = await account(),
    p = await application(a);
  const old = evaluate(p, [], packetPack(p), 'old-evaluator-snapshot');
  old.evaluatorVersion = '1.0.0';
  runtime.store.db
    .prepare('INSERT INTO runs VALUES(?,?,?,?)')
    .run(old.id, p.id, old.createdAt, JSON.stringify(old));
  const historical = await a.agent.get(`/api/packets/${p.id}/reports/${old.id}`);
  expect(historical.body.stale).toBe(true);
  const current = await a.agent
    .post(`/api/packets/${p.id}/evaluate`)
    .set('x-csrf-token', a.csrf)
    .send({ expectedRevision: p.revision });
  expect(current.status).toBe(201);
  expect(current.body.evaluatorVersion).toBe(EVALUATOR_VERSION);
  expect(current.body.id).not.toBe(old.id);
  const retry = await a.agent
    .post(`/api/packets/${p.id}/evaluate`)
    .set('x-csrf-token', a.csrf)
    .send({ expectedRevision: p.revision });
  expect(retry.status).toBe(200);
  expect(retry.body.id).toBe(current.body.id);
});
it('invalidates content confirmations when a custom requirement changes', async () => {
  const a = await account(),
    p = await application(a);
  p.links['requirement-1'] = {
    documentId: 'fixture-id',
    pageFrom: 1,
    pageTo: 1,
    review: 'confirmed',
    note: 'Previously reviewed content.',
  };
  runtime.store.savePacket(p);
  const changed = starterRequirements('job');
  changed[0].description = 'A new instruction requiring different content.';
  const result = await a.agent
    .put(`/api/packets/${p.id}/checklist`)
    .set('x-csrf-token', a.csrf)
    .send({ expectedRevision: 1, requirements: changed, sourceUrl: '' });
  expect(result.status).toBe(200);
  expect(result.body.links['requirement-1'].review).toBe('unreviewed');
});
it('exports exact private originals and a readable manifest without leaking cross-account access', async () => {
  const agent = request.agent(runtime.app);
  const auth = await agent.post('/api/auth/demo').send({});
  const other = await account('zip-other@example.test');
  const pid = auth.body.packetId;
  const detail = await agent.get(`/api/packets/${pid}`);
  const zipped = await agent
    .get(`/api/packets/${pid}/download`)
    .buffer(true)
    .parse((res, callback) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => callback(null, Buffer.concat(chunks)));
    });
  expect(zipped.status).toBe(200);
  expect(zipped.headers['cache-control']).toBe('no-store');
  const files = unzipSync(zipped.body);
  expect(Object.keys(files).filter((k) => k.startsWith('documents/'))).toHaveLength(4);
  for (const doc of detail.body.documents) {
    const name = Object.keys(files).find((k) => k.includes(doc.id.slice(0, 8)))!;
    expect(createHash('sha256').update(files[name]).digest('hex')).toBe(doc.hash);
  }
  expect(JSON.parse(strFromU8(files['checklist-and-review.json'])).review.checks).toHaveLength(18);
  expect((await other.agent.get(`/api/packets/${pid}/download`)).status).toBe(404);
  expect((await request(runtime.app).get(`/api/packets/${pid}/download`)).status).toBe(401);
});
it('updates a password, revokes old sessions and preserves the refreshed session', async () => {
  const a = await account();
  const second = request.agent(runtime.app);
  expect(
    (
      await second
        .post('/api/auth/login')
        .send({ email: 'applicant@example.test', password: 'synthetic-starting-password' })
    ).status,
  ).toBe(200);
  expect(
    (
      await a.agent
        .post('/api/account/password')
        .set('x-csrf-token', a.csrf)
        .send({ currentPassword: 'wrong', password: 'synthetic-new-password' })
    ).status,
  ).toBe(400);
  expect((await a.agent.get('/api/me')).status).toBe(200);
  const changed = await a.agent
    .post('/api/account/password')
    .set('x-csrf-token', a.csrf)
    .send({ currentPassword: 'synthetic-starting-password', password: 'synthetic-new-password' });
  expect(changed.status).toBe(200);
  expect((await second.get('/api/me')).status).toBe(401);
  expect((await a.agent.get('/api/me')).status).toBe(200);
  expect(
    (
      await request(runtime.app)
        .post('/api/auth/login')
        .send({ email: 'applicant@example.test', password: 'synthetic-starting-password' })
    ).status,
  ).toBe(401);
  expect(
    (
      await a.agent
        .patch('/api/account')
        .set('x-csrf-token', changed.body.csrf)
        .send({ name: 'New Display Name' })
    ).body.name,
  ).toBe('New Display Name');
});
it('keeps account activity private and records application operations', async () => {
  const a = await account(),
    b = await account('activity-other@example.test');
  const p = await application(a);
  const activity = await a.agent.get('/api/activity');
  expect(
    activity.body.some(
      (e: { action: string; objectId: string }) =>
        e.action === 'packet.created' && e.objectId === p.id,
    ),
  ).toBe(true);
  expect(
    (await b.agent.get('/api/activity')).body.some(
      (e: { objectId: string }) => e.objectId === p.id,
    ),
  ).toBe(false);
  expect((await request(runtime.app).get('/api/activity')).status).toBe(401);
});
