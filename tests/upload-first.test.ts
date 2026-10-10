import { it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { PDFDocument } from 'pdf-lib';
import { createApp } from '../server/app';
async function setup() {
  const directory = mkdtempSync(join(tmpdir(), 'jky-upload-first-')),
    runtime = createApp({ dataDir: directory, jobs: false }),
    agent = request.agent(runtime.app);
  const auth = await agent.post('/api/auth/register').send({
    name: 'Upload User',
    email: 'upload@example.test',
    password: 'synthetic-long-password',
    adult: true,
    consent: true,
  });
  return {
    runtime,
    agent,
    csrf: auth.body.csrf,
    close: () => {
      runtime.close();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}
it('creates no folder for rejected intake, then builds a checklist only from supplied originals', async () => {
  const e = await setup();
  try {
    expect(
      (
        await e.agent
          .post('/api/intake')
          .set('x-csrf-token', e.csrf)
          .attach('file', Buffer.from('invalid'), 'bad.pdf')
      ).status,
    ).toBe(400);
    expect((await e.agent.get('/api/packets')).body).toEqual([]);
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Synthetic handwriting.');
    const bytes = Buffer.from(await pdf.save());
    const first = await e.agent
      .post('/api/intake')
      .set('x-csrf-token', e.csrf)
      .attach('file', bytes, 'handwriting.pdf');
    expect(first.status).toBe(202);
    let detail = (await e.agent.get(`/api/packets/${first.body.packetId}`)).body;
    expect(detail.packet.mode).toBe('uploads');
    expect(detail.pack.requirements.map((r: { title: string }) => r.title)).toEqual([
      'handwriting.pdf',
    ]);
    expect(detail.live.checks[0].state).toBe('pending');
    expect(detail.pack.sourceUrl).toBe('');
    expect(
      (
        await e.agent
          .post(`/api/packets/${first.body.packetId}/documents`)
          .set('x-csrf-token', e.csrf)
          .attach('file', bytes, 'duplicate.pdf')
      ).body.duplicate,
    ).toBe(true);
    detail = (await e.agent.get(`/api/packets/${first.body.packetId}`)).body;
    expect(detail.pack.requirements).toHaveLength(1);
    await e.agent
      .delete(`/api/packets/${first.body.packetId}/documents/${first.body.document.id}`)
      .set('x-csrf-token', e.csrf)
      .send({ expectedRevision: detail.packet.revision });
    detail = (await e.agent.get(`/api/packets/${first.body.packetId}`)).body;
    expect(detail.pack.requirements).toEqual([]);
    expect(
      (
        await e.agent
          .post(`/api/packets/${first.body.packetId}/evaluate`)
          .set('x-csrf-token', e.csrf)
          .send({ expectedRevision: detail.packet.revision })
      ).status,
    ).toBe(400);
  } finally {
    e.close();
  }
});
it('first-upload retries reuse the original folder and remain private to each account', async () => {
  const e = await setup();
  try {
    const intakeId = crypto.randomUUID();
    const bytes = Buffer.from('%PDF-1.4\nsynthetic retry');
    const first = await e.agent
      .post('/api/intake')
      .set('x-csrf-token', e.csrf)
      .set('x-intake-id', intakeId)
      .attach('file', bytes, 'retry.pdf');
    const retry = await e.agent
      .post('/api/intake')
      .set('x-csrf-token', e.csrf)
      .set('x-intake-id', intakeId)
      .attach('file', bytes, 'retry.pdf');
    expect(retry.status).toBe(202);
    expect(retry.body.duplicate).toBe(true);
    expect(retry.body.packetId).toBe(first.body.packetId);
    expect((await e.agent.get('/api/packets')).body).toHaveLength(1);
    const other = request.agent(e.runtime.app);
    const auth = await other.post('/api/auth/register').send({
      name: 'Another User',
      email: 'other@example.test',
      password: 'synthetic-long-password',
      adult: true,
      consent: true,
    });
    const separate = await other
      .post('/api/intake')
      .set('x-csrf-token', auth.body.csrf)
      .set('x-intake-id', intakeId)
      .attach('file', bytes, 'retry.pdf');
    expect(separate.status).toBe(202);
    expect(separate.body.packetId).not.toBe(first.body.packetId);
    expect((await other.get(`/api/packets/${first.body.packetId}`)).status).toBe(404);
  } finally {
    e.close();
  }
});
it('legacy reference folders show uploaded files without modifying preserved rules or reports', async () => {
  const e = await setup();
  try {
    const created = await e.agent
      .post('/api/packets')
      .set('x-csrf-token', e.csrf)
      .send({ title: 'My handwriting', packId: 'uceed-2027-reference' });
    const p = created.body;
    const history = (
      await e.agent
        .post(`/api/packets/${p.id}/evaluate`)
        .set('x-csrf-token', e.csrf)
        .send({ expectedRevision: p.revision })
    ).body;
    delete p.mode;
    p.profile.category = 'sc';
    e.runtime.store.savePacket(p);
    await e.agent
      .post(`/api/packets/${p.id}/documents`)
      .set('x-csrf-token', e.csrf)
      .attach('file', Buffer.from('%PDF-1.4\nsynthetic'), 'handwriting.pdf');
    const detail = (await e.agent.get(`/api/packets/${p.id}`)).body;
    expect(detail.pack.requirements.map((r: { title: string }) => r.title)).toEqual([
      'handwriting.pdf',
    ]);
    expect(detail.packet.packSnapshot.id).toBe('uceed-2027-reference');
    expect(detail.packet.profile.category).toBe('sc');
    expect(detail.runs[0].id).toBe(history.id);
  } finally {
    e.close();
  }
});
it('application requirements activate only after explicit instructions while originals remain in the same folder', async () => {
  const e = await setup();
  try {
    const bytes = Buffer.from('%PDF-1.4\nsynthetic upload');
    const intake = await e.agent
      .post('/api/intake')
      .set('x-csrf-token', e.csrf)
      .attach('file', bytes, 'notes.pdf');
    const before = (await e.agent.get(`/api/packets/${intake.body.packetId}`)).body;
    expect(before.pack.requirements.map((r: { title: string }) => r.title)).toEqual(['notes.pdf']);
    const configured = await e.agent
      .put(`/api/packets/${intake.body.packetId}/instructions`)
      .set('x-csrf-token', e.csrf)
      .send({ expectedRevision: before.packet.revision, packId: 'uceed-2027-reference' });
    expect(configured.status).toBe(200);
    const after = (await e.agent.get(`/api/packets/${intake.body.packetId}`)).body;
    expect(after.packet.mode).toBe('instructions');
    expect(after.pack.requirements.some((r: { title: string }) => r.title === 'Proof of age')).toBe(
      true,
    );
    expect(after.documents[0].id).toBe(intake.body.document.id);
    expect((await e.agent.get('/api/packets')).body).toHaveLength(1);
  } finally {
    e.close();
  }
});
