import { afterEach, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import request from 'supertest';
import { PDFDocument } from 'pdf-lib';
import { createApp } from '../server/app';
const state = vi.hoisted(() => ({ full: false }));
vi.mock('node:fs', async (original) => {
  const actual = await original<typeof import('node:fs')>();
  return {
    ...actual,
    statfsSync: (path: Parameters<typeof actual.statfsSync>[0]) => {
      const stats = actual.statfsSync(path);
      return state.full ? { ...stats, bavail: 0 } : stats;
    },
  };
});
const cleanup: (() => void)[] = [];
afterEach(() => {
  state.full = false;
  cleanup.splice(0).forEach((f) => f());
});
async function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'jky-storage-intake-')),
    runtime = createApp({ dataDir: dir, jobs: false, background: false });
  cleanup.push(() => {
    runtime.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const agent = request.agent(runtime.app),
    registered = await agent
      .post('/api/auth/register')
      .send({
        name: 'Synthetic Storage',
        email: 'storage@example.test',
        password: 'Synthetic-Password-42!',
        adult: true,
        consent: true,
      });
  expect(registered.status).toBe(201);
  const pdf = await PDFDocument.create();
  pdf.addPage().drawText('Synthetic storage test');
  const bytes = Buffer.from(await pdf.save());
  return { runtime, agent, csrf: registered.body.csrf, bytes };
}
it('storage exhaustion creates no empty folder or partially accepted original', async () => {
  const f = await fixture();
  state.full = true;
  const response = await f.agent
    .post('/api/intake')
    .set('x-csrf-token', f.csrf)
    .attach('file', f.bytes, 'synthetic.pdf');
  expect(response.status).toBe(507);
  expect((await f.agent.get('/api/packets')).body).toEqual([]);
  expect(readdirSync(f.runtime.store.objects)).toEqual([]);
});
it('refused chunks keep their saved offset and can resume after storage recovers', async () => {
  const f = await fixture(),
    created = await f.agent
      .post('/api/uploads')
      .set('x-csrf-token', f.csrf)
      .send({
        name: 'synthetic.pdf',
        size: f.bytes.length,
        sha256: createHash('sha256').update(f.bytes).digest('hex'),
      });
  expect(created.status).toBe(201);
  state.full = true;
  const chunk = () =>
    f.agent
      .put('/api/uploads/' + created.body.id)
      .set('x-csrf-token', f.csrf)
      .set('upload-offset', '0')
      .set('Content-Type', 'application/octet-stream')
      .send(f.bytes);
  expect((await chunk()).status).toBe(507);
  expect((await f.agent.get('/api/uploads/' + created.body.id)).body.offset).toBe(0);
  state.full = false;
  const retried = await chunk();
  expect(retried.status).toBe(200);
  expect(retried.body.offset).toBe(f.bytes.length);
});
