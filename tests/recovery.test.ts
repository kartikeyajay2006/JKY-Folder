import { it, expect } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../server/store';
import { backup, restore } from '../server/backup';
import { digest } from '../server/rule-packs';
import { emptyProfile } from '../shared/model';
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
