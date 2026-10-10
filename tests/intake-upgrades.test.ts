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
  const r = await agent.post('/api/auth/register').send({
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
const put = (a: Awaited<ReturnType<typeof account>>, id: string, offset: number, chunk: Buffer) =>
  a.agent
    .put(`/api/uploads/${id}`)
    .set('x-csrf-token', a.csrf)
    .set('Content-Type', 'application/octet-stream')
    .set('upload-offset', String(offset))
    .send(chunk);
it('stores each chunk once, lists unfinished uploads by checksum and keeps them private', async () => {
  const a = await account(),
    b = await account('lister@example.test'),
    bytes = Buffer.from('%PDF-chunked original for listing'),
    sha256 = createHash('sha256').update(bytes).digest('hex'),
    id = (await begin(a, bytes)).body.id;
  expect((await put(a, id, 0, bytes.subarray(0, 10))).body.offset).toBe(10);
  // A duplicate retry of an acknowledged chunk is rejected instead of appending bytes twice.
  expect((await put(a, id, 0, bytes.subarray(0, 10))).status).toBe(409);
  const chunks = runtime.store.db
    .prepare('SELECT offset,length(data) AS n FROM upload_chunks WHERE uploadId=?')
    .all(id);
  expect(chunks).toEqual([{ offset: 0, n: 10 }]);
  const list = await a.agent.get('/api/uploads');
  expect(list.body).toHaveLength(1);
  expect(list.body[0]).toMatchObject({ id, name: 'instructions.pdf', offset: 10, sha256 });
  expect((await a.agent.get(`/api/uploads?sha256=${sha256}`)).body).toHaveLength(1);
  expect((await a.agent.get(`/api/uploads?sha256=${'0'.repeat(64)}`)).body).toEqual([]);
  expect((await b.agent.get('/api/uploads')).body).toEqual([]);
  expect((await put(a, id, 10, bytes.subarray(10))).status).toBe(200);
  const done = await a.agent.post(`/api/uploads/${id}/complete`).set('x-csrf-token', a.csrf);
  expect(done.status).toBe(202);
  expect((await a.agent.get('/api/uploads')).body).toEqual([]);
  expect(
    runtime.store.db.prepare('SELECT COUNT(*) AS n FROM upload_chunks WHERE uploadId=?').get(id),
  ).toEqual({ n: 0 });
  const doc = (await a.agent.get(`/api/packets/${done.body.packetId}`)).body.documents[0];
  expect(doc.size).toBe(bytes.length);
});
it('moves partial bytes saved by the earlier single-blob format into chunk rows', async () => {
  const a = await account(),
    bytes = Buffer.from('%PDF-legacy partial upload bytes'),
    id = (await begin(a, bytes)).body.id;
  // Simulate a session written before chunk rows existed.
  const row = runtime.store.db.prepare('SELECT payload FROM uploads WHERE id=?').get(id) as {
    payload: string;
  };
  const meta = JSON.parse(row.payload);
  delete meta.received;
  runtime.store.db
    .prepare('UPDATE uploads SET payload=?,data=? WHERE id=?')
    .run(JSON.stringify(meta), bytes.subarray(0, 12), id);
  runtime.close();
  runtime = createApp({ dataDir: dir, jobs: false });
  const agent = request.agent(runtime.app),
    login = await agent
      .post('/api/auth/login')
      .send({ email: 'resume@example.test', password: 'a-strong-test-password' });
  const again = { agent, csrf: login.body.csrf };
  expect((await again.agent.get(`/api/uploads/${id}`)).body.offset).toBe(12);
  expect((await put(again, id, 12, bytes.subarray(12))).status).toBe(200);
  const done = await again.agent
    .post(`/api/uploads/${id}/complete`)
    .set('x-csrf-token', again.csrf);
  expect(done.status).toBe(202);
});
