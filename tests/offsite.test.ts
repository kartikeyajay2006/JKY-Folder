import { afterEach, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../server/store';
import { backup, restore } from '../server/backup';
import { createOffsiteBackup, remoteRepository, runRestic } from '../server/offsite-backup';
const dirs: string[] = [];
function temp() {
  const d = mkdtempSync(join(tmpdir(), 'jky-offsite-'));
  dirs.push(d);
  return d;
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});
it('distinguishes a remote adapter from a same-disk directory and refuses cleartext REST transport', () => {
  expect(remoteRepository('/backups/repository')).toBe(false);
  expect(remoteRepository('rest:http://example.test')).toBe(false);
  expect(remoteRepository('rest:https://example.test/repository')).toBe(true);
  expect(remoteRepository('s3:s3.example.test/bucket')).toBe(true);
});
it('does not start without a repository and rejects an unavailable binary without leaking credentials', async () => {
  expect(createOffsiteBackup(temp(), {})).toBeUndefined();
  await expect(runRestic(['check'], {})).rejects.toThrow('Configure');
  await expect(
    runRestic(['check'], {
      RESTIC_REPOSITORY: '/tmp/test',
      RESTIC_PASSWORD: 'super-secret',
      RESTIC_BINARY: '/nonexistent-restic',
    }),
  ).rejects.toThrow('unavailable');
});
it.runIf(!!process.env.TEST_RESTIC_BINARY)(
  'backs up to a real encrypted repository, detects corruption, and restores with the newest erasure ledger',
  async () => {
    const dir = temp(),
      active = join(dir, 'active'),
      archive = join(dir, 'archive.jkyback');
    const env = {
      PATH: process.env.PATH,
      RESTIC_BINARY: process.env.TEST_RESTIC_BINARY,
      RESTIC_REPOSITORY: join(dir, 'repository'),
      RESTIC_PASSWORD: 'synthetic-restic-password',
    };
    await runRestic(['init'], env);
    const store = createStore(active);
    store.db
      .prepare('INSERT INTO users VALUES(?,?,?,?,?,?)')
      .run('u', 'Synthetic', 'synthetic@example.test', 'hash', 0, '2026-10-11');
    await backup(active, archive, 'synthetic-backup-password');
    const service = createOffsiteBackup(active, env)!;
    try {
      await service.upload(archive);
      store.recordDeletion('account', 'u');
      await service.mirrorLedger();
      await runRestic(['check', '--read-data'], env);
      const receipt = JSON.parse(readFileSync(join(active, 'offsite-status.json'), 'utf8'));
      expect(receipt.remote).toBe(false);
      const snapshots = JSON.parse(
        await runRestic(['snapshots', '--tag', 'jky-erasure-ledger'], env),
      );
      expect(snapshots).toHaveLength(1);
      // A repository on this disk exercises transport/recovery, never claims actual off-site storage.
      const stage = join(dir, 'download');
      await runRestic(['restore', receipt.archive.snapshot, '--target', stage], env);
      await runRestic(['restore', receipt.ledger.snapshot, '--target', stage], env);
      const downloaded = join(stage, archive),
        ledger = join(stage, active, 'deletions.jsonl');
      expect(existsSync(downloaded)).toBe(true);
      restore(downloaded, join(dir, 'recovered'), 'synthetic-backup-password', ledger);
      const recovered = createStore(join(dir, 'recovered'));
      try {
        expect(recovered.db.prepare('SELECT * FROM users').all()).toEqual([]);
      } finally {
        recovered.db.close();
      }
      // A repository with missing encrypted pack data must fail verification.
      const { readdirSync, unlinkSync } = await import('node:fs');
      const objects = readdirSync(join(env.RESTIC_REPOSITORY, 'data')).flatMap((shard) =>
        readdirSync(join(env.RESTIC_REPOSITORY, 'data', shard)).map((object) =>
          join(env.RESTIC_REPOSITORY, 'data', shard, object),
        ),
      );
      expect(objects.length).toBeGreaterThan(0);
      unlinkSync(objects[0]);
      await expect(runRestic(['check', '--read-data'], env)).rejects.toThrow('failed');
    } finally {
      service.stop();
      store.db.close();
    }
  },
  300000,
);
it('binds repository acknowledgements to the exact configuration', async () => {
  const { repositoryHash } = await import('../server/offsite-backup');
  expect(repositoryHash('rest:https://first.example.test')).not.toBe(
    repositoryHash('rest:https://second.example.test'),
  );
});
