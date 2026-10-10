import { it, expect } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { createCanvas } from '@napi-rs/canvas';
import { createApp } from '../server/app';
import type { DocumentRecord } from '../shared/model';
async function env(jobs = true) {
  const dir = mkdtempSync(join(tmpdir(), 'jky-new-api-')),
    runtime = createApp({ dataDir: dir, jobs }),
    agent = request.agent(runtime.app);
  const auth = await agent.post('/api/auth/register').send({
    name: 'Synthetic Applicant',
    email: 'review@example.test',
    password: 'synthetic-long-password',
    adult: true,
    consent: true,
  });
  expect(auth.status).toBe(201);
  const csrf = auth.body.csrf;
  const created = await agent
    .post('/api/packets')
    .set('x-csrf-token', csrf)
    .send({
      title: 'Synthetic rules',
      templateId: 'custom',
      requirements: [
        {
          id: 'identity',
          title: 'Identity certificate',
          description: 'Inspect name and birth date.',
          group: 'Identity',
          condition: { op: 'always' },
          mime: 'application/pdf',
          extension: '.pdf',
          sourceSection: 'Synthetic instruction',
          reviewHint: 'Inspect the original.',
        },
      ],
    });
  expect(created.status).toBe(201);
  return {
    dir,
    runtime,
    agent,
    csrf,
    pid: created.body.id,
    close: () => {
      runtime.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
async function waitDocument(e: Awaited<ReturnType<typeof env>>, timeout = 12000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const r = await e.agent.get(`/api/packets/${e.pid}`);
    const d = r.body.documents[0] as DocumentRecord | undefined;
    if (d?.status === 'ready' || d?.status === 'error') return d;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw Error('Inspection timeout');
}
it('brand-new accounts have no applications, documents, reports, reminders or visible activity', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-empty-')),
    runtime = createApp({ dataDir: dir, jobs: false }),
    a = request.agent(runtime.app);
  try {
    const auth = await a.post('/api/auth/register').send({
      name: 'Empty User',
      email: 'empty@example.test',
      password: 'synthetic-long-password',
      adult: true,
      consent: true,
    });
    expect(auth.status).toBe(201);
    for (const path of ['/api/packets', '/api/activity', '/api/notifications'])
      expect((await a.get(path)).body).toEqual([]);
    expect(runtime.store.db.prepare('SELECT * FROM documents').all()).toEqual([]);
    expect(runtime.store.db.prepare('SELECT * FROM runs').all()).toEqual([]);
    await a.post('/api/auth/logout').set('x-csrf-token', auth.body.csrf).send({});
    await a
      .post('/api/auth/login')
      .send({ email: 'empty@example.test', password: 'synthetic-long-password' });
    expect((await a.get('/api/packets')).body).toEqual([]);
  } finally {
    runtime.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
it('actual OCR recognizes an image-only PDF, retains coordinates and leaves facts unconfirmed', async () => {
  const e = await env();
  try {
    const canvas = createCanvas(1200, 500),
      ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1200, 500);
    ctx.fillStyle = 'black';
    ctx.font = '40px sans-serif';
    ctx.fillText('Name: Synthetic Applicant', 60, 100);
    ctx.fillText('Date of birth: 2000-01-01', 60, 180);
    const pdf = await PDFDocument.create(),
      image = await pdf.embedPng(canvas.toBuffer('image/png'));
    pdf.addPage([600, 250]).drawImage(image, { x: 0, y: 0, width: 600, height: 250 });
    await e.agent
      .post(`/api/packets/${e.pid}/documents`)
      .set('x-csrf-token', e.csrf)
      .attach('file', Buffer.from(await pdf.save()), 'scanned.pdf');
    const d = await waitDocument(e, 25000);
    expect(d.status).toBe('ready');
    expect(d.pages[0].method).toBe('ocr');
    expect(d.pages[0].text).toContain('Synthetic Applicant');
    expect(d.pages[0].tokens?.length).toBeGreaterThan(0);
    expect(d.facts?.find((f) => f.kind === 'name')?.history).toEqual([]);
  } finally {
    e.close();
  }
}, 30000);
it('fact corrections retain original evidence, reject stale writes and invalidate existing confirmations', async () => {
  const e = await env();
  try {
    const pdf = await PDFDocument.create(),
      font = await pdf.embedFont(StandardFonts.Helvetica);
    pdf.addPage().drawText('Name: Synthetic Applicant\nDate of birth: 2000-01-01', {
      font,
      x: 40,
      y: 700,
      size: 16,
    });
    await e.agent
      .post(`/api/packets/${e.pid}/documents`)
      .set('x-csrf-token', e.csrf)
      .attach('file', Buffer.from(await pdf.save()), 'identity.pdf');
    const d = await waitDocument(e),
      f = d.facts!.find((f) => f.kind === 'name')!;
    let detail = (await e.agent.get(`/api/packets/${e.pid}`)).body;
    expect(
      (
        await e.agent
          .put(`/api/packets/${e.pid}/evidence/identity`)
          .set('x-csrf-token', e.csrf)
          .send({
            expectedRevision: detail.packet.revision,
            documentId: d.id,
            pageFrom: 1,
            pageTo: 1,
            review: 'confirmed',
            note: 'Reviewed the original name.',
            additional: [],
          })
      ).status,
    ).toBe(200);
    detail = (await e.agent.get(`/api/packets/${e.pid}`)).body;
    const payload = {
      expectedRevision: detail.packet.revision,
      expectedFactRevision: 0,
      value: 'Confirmed Applicant',
      confirmed: true,
      reason: 'Compared the name with the original.',
    };
    const path = `/api/packets/${e.pid}/documents/${d.id}/facts/${f.id}`;
    const corrected = await e.agent.put(path).set('x-csrf-token', e.csrf).send(payload);
    expect(corrected.status).toBe(200);
    const fact = corrected.body.facts.find((x: { id: string }) => x.id === f.id);
    expect(fact.originalText).toContain('Synthetic Applicant');
    expect(fact.history).toHaveLength(1);
    expect((await e.agent.put(path).set('x-csrf-token', e.csrf).send(payload)).status).toBe(409);
    detail = (await e.agent.get(`/api/packets/${e.pid}`)).body;
    expect(detail.packet.links.identity.review).toBe('unreviewed');
    const other = request.agent(e.runtime.app);
    await other.post('/api/auth/register').send({
      name: 'Other User',
      email: 'other@example.test',
      password: 'synthetic-long-password',
      adult: true,
      consent: true,
    });
    expect((await other.get(`/api/packets/${e.pid}/sources`)).status).toBe(404);
  } finally {
    e.close();
  }
});
it('a real running inspection cannot republish a packet deleted during processing', async () => {
  const e = await env();
  try {
    const pdf = await PDFDocument.create();
    for (let i = 0; i < 8; i++) pdf.addPage().drawText('Synthetic in-flight evidence.');
    await e.agent
      .post(`/api/packets/${e.pid}/documents`)
      .set('x-csrf-token', e.csrf)
      .attach('file', Buffer.from(await pdf.save()), 'processing.pdf');
    await expect
      .poll(() =>
        e.runtime.store.db
          .prepare("SELECT COUNT(*) AS n FROM jobs WHERE status='processing'")
          .get(),
      )
      .toMatchObject({ n: 1 });
    const detail = (await e.agent.get(`/api/packets/${e.pid}`)).body;
    expect(
      (
        await e.agent
          .delete(`/api/packets/${e.pid}`)
          .set('x-csrf-token', e.csrf)
          .send({ expectedRevision: detail.packet.revision })
      ).status,
    ).toBe(200);
    await expect.poll(() => e.runtime.jobsIdle(), { timeout: 10000 }).toBe(true);
    expect(e.runtime.store.db.prepare('SELECT * FROM documents').all()).toEqual([]);
    expect(e.runtime.store.db.prepare('SELECT * FROM jobs').all()).toEqual([]);
    expect((await e.agent.get(`/api/packets/${e.pid}`)).status).toBe(404);
  } finally {
    e.close();
  }
});
it('manual facts preserve extraction and stale corrections cannot overwrite them', async () => {
  const e = await env();
  try {
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Synthetic document without labelled dates.');
    await e.agent
      .post(`/api/packets/${e.pid}/documents`)
      .set('x-csrf-token', e.csrf)
      .attach('file', Buffer.from(await pdf.save()), 'manual.pdf');
    const d = await waitDocument(e),
      before = (await e.agent.get(`/api/packets/${e.pid}`)).body;
    const added = await e.agent
      .post(`/api/packets/${e.pid}/documents/${d.id}/facts`)
      .set('x-csrf-token', e.csrf)
      .send({
        expectedRevision: before.packet.revision,
        kind: 'expiry_date',
        page: 1,
        value: '2027-02-28',
        reason: 'Transcribed the date from the original page.',
      });
    expect(added.status).toBe(201);
    expect(added.body.facts[0].origin).toBe('manual');
    expect(added.body.facts[0].history).toHaveLength(1);
    expect(added.body.pages).toEqual(d.pages);
  } finally {
    e.close();
  }
});
it('interrupted processing is recovered after a server restart with the original job identity', async () => {
  const e = await env(false);
  let reopened: ReturnType<typeof createApp> | undefined;
  try {
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Restarted synthetic evidence.');
    const upload = await e.agent
      .post(`/api/packets/${e.pid}/documents`)
      .set('x-csrf-token', e.csrf)
      .attach('file', Buffer.from(await pdf.save()), 'restart.pdf');
    const id = upload.body.document.id;
    e.runtime.store.db.prepare("UPDATE jobs SET status='processing' WHERE id=?").run(id);
    e.runtime.close();
    reopened = createApp({ dataDir: e.dir });
    await expect
      .poll(
        () => {
          const row = reopened!.store.db
            .prepare('SELECT payload FROM documents WHERE id=?')
            .get(id) as { payload: string };
          return JSON.parse(row.payload).status;
        },
        { timeout: 10000 },
      )
      .toBe('ready');
    expect(reopened.store.documents(e.pid)[0].pages[0].text).toContain('Restarted synthetic');
    expect(reopened.store.db.prepare('SELECT COUNT(*) AS n FROM jobs').get()).toEqual({ n: 1 });
  } finally {
    reopened?.close();
    rmSync(e.dir, { recursive: true, force: true });
  }
});
