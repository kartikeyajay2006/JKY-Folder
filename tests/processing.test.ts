import { it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import request from 'supertest';
import { createApp } from '../server/app';
it('bounds crash recovery attempts and lets an explicit retry inspect the original again', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'jky-crash-recovery-'));
  let runtime = createApp({ dataDir: directory, jobs: false, background: false });
  try {
    let agent = request.agent(runtime.app);
    const auth = await agent
      .post('/api/auth/register')
      .send({
        name: 'Synthetic recovery',
        email: 'recovery@example.test',
        password: 'synthetic-strong-password',
        adult: true,
        consent: true,
      });
    const cookie = auth.headers['set-cookie'];
    const pdf = await PDFDocument.create(),
      font = await pdf.embedFont(StandardFonts.Helvetica);
    pdf.addPage().drawText('Synthetic restart evidence', { font, x: 40, y: 700 });
    const intake = await agent
      .post('/api/intake')
      .set('x-csrf-token', auth.body.csrf)
      .attach('file', Buffer.from(await pdf.save()), 'restart.pdf');
    const id = intake.body.document.id,
      packetId = intake.body.packetId;
    runtime.store.db.prepare('INSERT INTO job_attempts VALUES(?,3)').run(id);
    runtime.store.db.prepare("UPDATE jobs SET status='processing' WHERE id=?").run(id);
    runtime.close();
    runtime = createApp({ dataDir: directory, background: false });
    agent = request.agent(runtime.app);
    const detail = await agent.get(`/api/packets/${packetId}`).set('Cookie', cookie);
    expect(detail.body.documents[0].status).toBe('error');
    expect(detail.body.documents[0].error).toContain('interrupted repeatedly');
    const retry = await agent
      .post(`/api/packets/${packetId}/documents/${id}/retry`)
      .set('Cookie', cookie)
      .set('x-csrf-token', auth.body.csrf)
      .send({ expectedRevision: detail.body.packet.revision });
    expect(retry.status).toBe(202);
    let ready = false;
    for (let i = 0; i < 80; i++) {
      const result = await agent.get(`/api/packets/${packetId}`).set('Cookie', cookie);
      if (result.body.documents[0].status === 'ready') {
        ready = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    expect(ready).toBe(true);
  } finally {
    runtime.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
async function setup() {
  const directory = mkdtempSync(join(tmpdir(), 'jky-worker-'));
  const runtime = createApp({ dataDir: directory });
  const agent = request.agent(runtime.app);
  const auth = await agent.post('/api/auth/register').send({
    name: 'Worker Test',
    email: 'worker@example.test',
    password: 'a-strong-test-password',
    adult: true,
    consent: true,
  });
  const csrf = auth.body.csrf;
  const created = await agent
    .post('/api/packets')
    .set('x-csrf-token', csrf)
    .send({ title: 'Worker test', packId: 'uceed-2027-reference' });
  return {
    runtime,
    agent,
    csrf,
    pid: created.body.id,
    close: () => {
      runtime.close();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}
async function waitForDocument(env: Awaited<ReturnType<typeof setup>>) {
  for (let i = 0; i < 80; i++) {
    const result = await env.agent.get(`/api/packets/${env.pid}`);
    const doc = result.body.documents[0];
    if (doc && doc.status !== 'processing') return doc;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw Error('Worker did not complete within the test budget');
}
it('inspects a real multi-page PDF and preserves original page text', async () => {
  const env = await setup();
  try {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    pdf.addPage().drawText('First synthetic evidence page', { x: 40, y: 700, font, size: 12 });
    pdf.addPage().drawText('Second synthetic evidence page', { x: 40, y: 700, font, size: 12 });
    const upload = await env.agent
      .post(`/api/packets/${env.pid}/documents`)
      .set('x-csrf-token', env.csrf)
      .attach('file', Buffer.from(await pdf.save()), 'two-pages.pdf');
    expect(upload.status).toBe(202);
    const doc = await waitForDocument(env);
    expect(doc.status).toBe('ready');
    expect(doc.pageCount).toBe(2);
    expect(doc.pages[1].text).toContain('Second synthetic evidence page');
    expect(
      (await env.agent.get(`/api/packets/${env.pid}/documents/${doc.id}/content`)).status,
    ).toBe(200);
  } finally {
    env.close();
  }
});
it('rejects malformed PDF inspection and denies original download', async () => {
  const env = await setup();
  try {
    await env.agent
      .post(`/api/packets/${env.pid}/documents`)
      .set('x-csrf-token', env.csrf)
      .attach('file', Buffer.from('%PDF-1.4\nmalformed fixture'), 'broken.pdf');
    const doc = await waitForDocument(env);
    expect(doc.status).toBe('error');
    expect(
      (await env.agent.get(`/api/packets/${env.pid}/documents/${doc.id}/content`)).status,
    ).toBe(409);
    const detail = await env.agent.get(`/api/packets/${env.pid}`);
    expect(
      (
        await env.agent
          .post(`/api/packets/${env.pid}/documents/${doc.id}/retry`)
          .set('x-csrf-token', env.csrf)
          .send({ expectedRevision: detail.body.packet.revision })
      ).status,
    ).toBe(202);
    expect((await waitForDocument(env)).status).toBe('error');
  } finally {
    env.close();
  }
});
it('bounds the number of extracted PDF pages', async () => {
  const env = await setup();
  try {
    const pdf = await PDFDocument.create();
    for (let i = 0; i < 21; i++) pdf.addPage();
    await env.agent
      .post(`/api/packets/${env.pid}/documents`)
      .set('x-csrf-token', env.csrf)
      .attach('file', Buffer.from(await pdf.save()), 'too-many-pages.pdf');
    const doc = await waitForDocument(env);
    expect(doc.status).toBe('error');
    expect(doc.error).toContain('20 pages');
  } finally {
    env.close();
  }
});
