import { it, expect } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../server/store';
import { backup, restore } from '../server/backup';
import { digest } from '../server/rule-packs';
import { emptyProfile } from '../shared/model';
import { createApp } from '../server/app';
import { createECDH } from 'node:crypto';
it('preserves push keys but never revives withdrawn delivery, support or guardian authority', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-consent-recovery-')),
    active = join(dir, 'active'),
    target = join(dir, 'recovered'),
    archive = join(dir, 'backup.jky');
  const runtime = createApp({ dataDir: active, jobs: false, background: false });
  const db = runtime.store.db;
  try {
    db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?)').run(
      'u',
      'Synthetic',
      'u@example.test',
      'hash',
      0,
      '2026-10-11',
    );
    db.prepare('INSERT INTO packets VALUES(?,?,?)').run('p', 'u', '{}');
    db.prepare('INSERT INTO notification_preferences VALUES(?,?)').run(
      'u',
      '{"deadlines":true,"sourceChanges":true,"email":true}',
    );
    db.prepare('INSERT INTO email_verifications VALUES(?,?,?)').run(
      'u',
      'u@example.test',
      '2026-10-11',
    );
    db.prepare('INSERT INTO mail_queue VALUES(?,?,?,?,?,?,?,?,?)').run(
      'm',
      'u',
      null,
      'deadline',
      '{}',
      'queued',
      0,
      Date.now(),
      0,
    );
    db.prepare('INSERT INTO push_subscriptions VALUES(?,?,?,?,?,?,0)').run(
      's',
      'u',
      'https://example.test/push',
      'key',
      'auth',
      '2026-10-11',
    );
    db.prepare('INSERT INTO support_tickets VALUES(?,?,?,?)').run('t', 'u', 'p', '{}');
    db.prepare('INSERT INTO support_grants VALUES(?,?,?,?,?,NULL)').run(
      'g',
      'u',
      't',
      'p',
      Date.now() + 86400000,
    );
    db.prepare('INSERT INTO guardianship VALUES(?,?,?)').run(
      'u',
      'approved',
      JSON.stringify({
        status: 'approved',
        guardianEmail: 'parent@example.test',
        adultOn: '2100-01-01',
        requestId: 'old',
        deleteAfter: '2100-01-01',
      }),
    );
    const curve = createECDH('prime256v1');
    curve.generateKeys();
    const keys = JSON.stringify({
      publicKey: curve.getPublicKey().toString('base64url'),
      privateKey: curve.getPrivateKey().toString('base64url'),
    });
    writeFileSync(join(active, 'vapid.json'), keys, { mode: 0o600 });
    await backup(active, archive, 'synthetic-backup-password');
    restore(archive, target, 'synthetic-backup-password');
    const recovered = createStore(target);
    try {
      for (const table of ['mail_queue', 'email_verifications', 'push_subscriptions'])
        expect(recovered.db.prepare(`SELECT * FROM ${table}`).all()).toEqual([]);
      expect(
        (
          recovered.db.prepare('SELECT revokedAt FROM support_grants').get() as {
            revokedAt: number;
          }
        ).revokedAt,
      ).toBeGreaterThan(0);
      expect(
        JSON.parse(
          (
            recovered.db.prepare('SELECT payload FROM notification_preferences').get() as {
              payload: string;
            }
          ).payload,
        ).email,
      ).toBe(false);
      expect(
        (recovered.db.prepare('SELECT status FROM guardianship').get() as { status: string })
          .status,
      ).toBe('pending');
      expect(readFileSync(join(target, 'vapid.json'), 'utf8')).toBe(keys);
    } finally {
      recovered.db.close();
    }
  } finally {
    runtime.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
it('cleans reserved and partial archives on integrity failure without overwriting an existing backup', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-stream-backup-')),
    active = join(dir, 'active'),
    file = join(dir, 'backup.jky');
  const store = createStore(active);
  try {
    store.db
      .prepare('INSERT INTO users VALUES(?,?,?,?,?,?)')
      .run('u', 'Synthetic', 'u@example.test', '', 0, '2026-10-11');
    store.db.prepare('INSERT INTO packets VALUES(?,?,?)').run('p', 'u', '{}');
    writeFileSync(join(store.objects, 'obj'), 'wrong synthetic bytes');
    store.db
      .prepare('INSERT INTO documents VALUES(?,?,?,?)')
      .run('d', 'p', 'obj', JSON.stringify({ hash: digest('expected bytes') }));
    await expect(backup(active, file, 'synthetic-backup-password')).rejects.toThrow(
      'integrity mismatch',
    );
    expect(existsSync(file)).toBe(false);
    expect(readdirSync(dir).some((name) => name.includes('.part-'))).toBe(false);
    writeFileSync(file, 'existing');
    await expect(backup(active, file, 'synthetic-backup-password')).rejects.toThrow();
    expect(readFileSync(file, 'utf8')).toBe('existing');
  } finally {
    store.db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
it('never publishes a partial recovery when the deletion ledger is invalid', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-atomic-recovery-'));
  const active = join(dir, 'active'),
    target = join(dir, 'restored'),
    archive = join(dir, 'backup.jky');
  const store = createStore(active);
  try {
    await backup(active, archive, 'synthetic-backup-password');
    const ledger = join(dir, 'invalid-ledger');
    writeFileSync(ledger, JSON.stringify({ kind: 'invalid', id: 'synthetic' }) + '\n');
    expect(() => restore(archive, target, 'synthetic-backup-password', ledger)).toThrow(
      'Invalid deletion',
    );
    expect(existsSync(target)).toBe(false);
    expect(readdirSync(dir).some((name) => name.startsWith('.jky-restore-'))).toBe(false);
  } finally {
    store.db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
it('encrypted recovery restores exact objects and replays document and account erasure after backup', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-recovery-')),
    active = join(dir, 'active'),
    file = join(dir, 'backup.jky'),
    target = join(dir, 'restored');
  const store = createStore(active);
  try {
    store.db
      .prepare('INSERT INTO users VALUES(?,?,?,?,?,?)')
      .run('u', 'Synthetic', 'u@example.test', '', 0, '2026-10-10');
    store.db.prepare('INSERT INTO packets VALUES(?,?,?)').run(
      'p',
      'u',
      JSON.stringify({
        id: 'p',
        title: 'Recovery',
        revision: 1,
        profile: emptyProfile,
        links: {
          r: {
            documentId: 'd',
            pageFrom: 1,
            pageTo: 1,
            review: 'confirmed',
            note: 'Reviewed original.',
          },
        },
        createdAt: '2026-10-10',
        updatedAt: '2026-10-10',
      }),
    );
    const bytes = Buffer.from('synthetic private bytes');
    writeFileSync(join(store.objects, 'obj'), bytes);
    store.db
      .prepare('INSERT INTO documents VALUES(?,?,?,?)')
      .run('d', 'p', 'obj', JSON.stringify({ id: 'd', hash: digest(bytes) }));
    await backup(active, file, 'synthetic-backup-password');
    expect(readFileSync(file).includes(bytes)).toBe(false);
    restore(file, target, 'synthetic-backup-password');
    expect(readFileSync(join(target, 'objects', 'obj'))).toEqual(bytes);
    expect(() => restore(file, join(dir, 'wrong'), 'incorrect-backup-password')).toThrow();
    store.recordDeletion('document', 'd');
    const deleted = join(dir, 'deleted-restore');
    restore(file, deleted, 'synthetic-backup-password', join(active, 'deletions.jsonl'));
    const restored = createStore(deleted);
    try {
      expect(restored.db.prepare('SELECT * FROM documents').all()).toEqual([]);
      expect(readdirSync(restored.objects)).toEqual([]);
      const p = restored.packet('p', 'u')!;
      expect(p.links).toEqual({});
    } finally {
      restored.db.close();
    }
    store.recordDeletion('account', 'u');
    const erased = join(dir, 'account-restore');
    restore(file, erased, 'synthetic-backup-password', join(active, 'deletions.jsonl'));
    const after = createStore(erased);
    try {
      expect(after.db.prepare('SELECT * FROM users').all()).toEqual([]);
    } finally {
      after.db.close();
    }
  } finally {
    store.db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
it('restores durable chunks but clears resurrected sessions and account links', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-account-recovery-')),
    active = join(dir, 'active'),
    target = join(dir, 'restore'),
    file = join(dir, 'backup.jky');
  const store = createStore(active);
  try {
    store.db
      .prepare('INSERT INTO users VALUES(?,?,?,?,?,?)')
      .run('u', 'Synthetic', 'u@example.test', 'hash', 0, '2026-10-10');
    store.db
      .prepare('INSERT INTO sessions VALUES(?,?,?,?)')
      .run('session', 'u', 'csrf', Date.now() + 100000);
    store.db.exec(
      'CREATE TABLE account_tokens(hash TEXT PRIMARY KEY,userId TEXT REFERENCES users(id),purpose TEXT,expiresAt INTEGER,passwordFingerprint TEXT);CREATE TABLE mail_queue(id TEXT PRIMARY KEY,userId TEXT REFERENCES users(id),kind TEXT);CREATE TABLE uploads(id TEXT PRIMARY KEY,userId TEXT REFERENCES users(id),data BLOB);',
    );
    store.db
      .prepare('INSERT INTO account_tokens VALUES(?,?,?,?,?)')
      .run('used-token', 'u', 'reset', Date.now() + 100000, 'fingerprint');
    store.db.prepare('INSERT INTO mail_queue VALUES(?,?,?)').run('reset', 'u', 'reset');
    store.db
      .prepare('INSERT INTO uploads VALUES(?,?,?)')
      .run('partial', 'u', Buffer.from('saved chunk'));
    await backup(active, file, 'synthetic-backup-password');
    restore(file, target, 'synthetic-backup-password');
    const restored = createStore(target);
    try {
      expect(restored.db.prepare('SELECT * FROM sessions').all()).toEqual([]);
      expect(restored.db.prepare('SELECT * FROM account_tokens').all()).toEqual([]);
      expect(restored.db.prepare('SELECT * FROM mail_queue').all()).toEqual([]);
      expect(
        (restored.db.prepare('SELECT data FROM uploads').get() as { data: Buffer }).data.toString(),
      ).toBe('saved chunk');
    } finally {
      restored.db.close();
    }
  } finally {
    store.db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
