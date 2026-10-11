import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server/app';
import { verifyDeployment } from '../server/readiness';
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0)) await close();
});
it('refuses HTTP internet targets, URL credentials, paths and fragments before creating data', async () => {
  for (const origin of [
    'http://example.test',
    'https://user:password@example.test',
    'https://example.test/path',
    'https://example.test/#private',
  ])
    await expect(verifyDeployment(origin)).rejects.toThrow('HTTPS origin');
});
it.runIf(process.env.TEST_DEPLOYMENT_SMOKE === '1')(
  'runs an actual production-mode intake journey and erases the synthetic account',
  async () => {
    const directory = mkdtempSync(join(tmpdir(), 'jky-deploy-test-'));
    const runtime = createApp({
      dataDir: directory,
      production: true,
      origin: 'https://example.test',
      background: false,
      scan: async () => ({ status: 'clean' }),
      inspectionMode: 'bubblewrap',
    });
    const server = runtime.app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    cleanup.push(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      runtime.close();
      rmSync(directory, { recursive: true, force: true });
    });
    const port = (server.address() as { port: number }).port;
    const report = await verifyDeployment(`http://127.0.0.1:${port}`, {
      journey: true,
      allowLocal: true,
      expectedOrigin: 'https://example.test',
    });
    expect(report.checks.find((c) => c.id === 'https_transport')?.status).toBe('pending');
    expect(report.checks.find((c) => c.id === 'synthetic_journey')?.status).toBe('passed');
    expect(report.checks.find((c) => c.id === 'synthetic_cleanup')?.status).toBe('passed');
    expect(runtime.store.db.prepare('SELECT * FROM users').all()).toEqual([]);
    expect(runtime.store.db.prepare('SELECT * FROM documents').all()).toEqual([]);
  },
  45000,
);
it.runIf(process.env.TEST_DEPLOYMENT_SMOKE === '1')(
  'cleans up the synthetic account even when inspection fails',
  async () => {
    const directory = mkdtempSync(join(tmpdir(), 'jky-deploy-failure-'));
    const runtime = createApp({
      dataDir: directory,
      production: true,
      origin: 'https://example.test',
      background: false,
      scan: async () => ({ status: 'error', reason: 'Synthetic scanner failure' }),
      inspectionMode: 'bubblewrap',
    });
    const server = runtime.app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    cleanup.push(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      runtime.close();
      rmSync(directory, { recursive: true, force: true });
    });
    const port = (server.address() as { port: number }).port;
    await expect(
      verifyDeployment(`http://127.0.0.1:${port}`, {
        journey: true,
        allowLocal: true,
        expectedOrigin: 'https://example.test',
      }),
    ).rejects.toThrow('inspection failed');
    expect(runtime.store.db.prepare('SELECT * FROM users').all()).toEqual([]);
  },
  45000,
);
