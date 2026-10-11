import { afterEach, expect, it } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createApp } from '../server/app';
import { createMonitoring } from '../server/monitoring';
const dirs: string[] = [],
  close: (() => void)[] = [];
afterEach(() => {
  close.splice(0).forEach((f) => f());
  dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true }));
});
function fixture(token?: string) {
  const dir = mkdtempSync(join(tmpdir(), 'jky-monitor-'));
  dirs.push(dir);
  const runtime = createApp({
    dataDir: dir,
    jobs: false,
    background: false,
    monitoring: { token },
  });
  close.push(runtime.close);
  return runtime;
}
it('protects metrics with a separate token and disables the endpoint when unset', async () => {
  const absent = fixture();
  expect((await request(absent.app).get('/api/ops/metrics')).status).toBe(404);
  const runtime = fixture('m'.repeat(48));
  for (const authorization of ['', 'Bearer wrong', 'Bearer ' + 'x'.repeat(48)])
    expect(
      (await request(runtime.app).get('/api/ops/metrics').set('Authorization', authorization))
        .status,
    ).toBe(401);
  const response = await request(runtime.app)
    .get('/api/ops/metrics')
    .set('Authorization', 'Bearer ' + 'm'.repeat(48));
  expect(response.status).toBe(200);
  expect(response.headers['cache-control']).toBe('no-store');
  expect(response.text).toContain('jky_inspections{status="queued"} 0');
});
it('keeps request identifiers and secrets out of metric labels while exposing actual errors', async () => {
  const runtime = fixture('t'.repeat(48));
  await request(runtime.app).get('/api/packets/private-person-document?email=secret@example.test');
  const metrics = (
    await request(runtime.app)
      .get('/api/ops/metrics')
      .set('Authorization', 'Bearer ' + 't'.repeat(48))
  ).text;
  expect(metrics).toContain('route="packets",method="GET",status="4xx"');
  for (const secret of [
    'private-person-document',
    'secret@example.test',
    't'.repeat(48),
    'jky_session',
  ])
    expect(metrics).not.toContain(secret);
});
it('distinguishes missing, successful, stale and failed recovery evidence', () => {
  const runtime = fixture(),
    dir = runtime.store.directory;
  const monitor = createMonitoring(runtime.store, {
    backupDir: dir,
    offsite: true,
    sampleProcess: false,
  });
  close.push(monitor.stop);
  monitor.event('inspection_error', 2, true);
  monitor.event('scan_unavailable');
  expect(monitor.render()).toContain('jky_backup_success_age_seconds -1');
  writeFileSync(
    join(dir, 'backup-status.json'),
    JSON.stringify({ status: 'failed', completedAt: '2026-10-10T00:00:00Z' }),
  );
  const metrics = monitor.render(Date.parse('2026-10-11T00:00:00Z'));
  expect(metrics).toContain('jky_backup_last_attempt_failed 1');
  expect(metrics).toContain('jky_backup_success_age_seconds 86400');
  expect(metrics).toContain('jky_inspection_duration_seconds_count{method="ocr"} 1');
  expect(metrics).toContain('event="scan_unavailable"} 1');
});
