import Database from 'better-sqlite3';
import {
  mkdirSync,
  chmodSync,
  readdirSync,
  unlinkSync,
  appendFileSync,
  existsSync,
  readFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Packet, DocumentRecord, EvaluationRun } from '../shared/model';
export function createStore(directory: string) {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const objects = join(directory, 'objects');
  mkdirSync(objects, { recursive: true, mode: 0o700 });
  const db = new Database(join(directory, 'metadata.sqlite'));
  chmodSync(join(directory, 'metadata.sqlite'), 0o600);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,demo INTEGER NOT NULL,createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expiresAt INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS packets(id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,packetId TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,objectKey TEXT NOT NULL UNIQUE,payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY,packetId TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,createdAt TEXT NOT NULL,payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,packetId TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,status TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS audit(id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,action TEXT NOT NULL,objectId TEXT NOT NULL,createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS pack_revisions(id TEXT NOT NULL,version TEXT NOT NULL,state TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(id,version));
 CREATE TABLE IF NOT EXISTS source_snapshots(id TEXT PRIMARY KEY,payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS notification_preferences(userId TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS reminders(id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,packetId TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,payload TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS packets_owner ON packets(userId);
 CREATE INDEX IF NOT EXISTS documents_packet ON documents(packetId);
 CREATE INDEX IF NOT EXISTS runs_packet ON runs(packetId,createdAt);
 CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expiresAt);`);
  function packet(id: string, userId: string): Packet | undefined {
    const row = db
      .prepare('SELECT payload FROM packets WHERE id=? AND userId=?')
      .get(id, userId) as { payload: string } | undefined;
    return row && JSON.parse(row.payload);
  }
  function documents(packetId: string): DocumentRecord[] {
    return (
      db.prepare('SELECT payload FROM documents WHERE packetId=? ORDER BY rowid').all(packetId) as {
        payload: string;
      }[]
    ).map((r) => JSON.parse(r.payload));
  }
  function runs(packetId: string): EvaluationRun[] {
    return (
      db
        .prepare('SELECT payload FROM runs WHERE packetId=? ORDER BY rowid DESC LIMIT 30')
        .all(packetId) as { payload: string }[]
    ).map((r) => JSON.parse(r.payload));
  }
  function savePacket(p: Packet) {
    db.prepare('UPDATE packets SET payload=? WHERE id=?').run(JSON.stringify(p), p.id);
  }
  function audit(userId: string, action: string, objectId: string) {
    db.prepare('INSERT INTO audit VALUES(?,?,?,?,?)').run(
      randomUUID(),
      userId,
      action,
      objectId,
      new Date().toISOString(),
    );
  }
  function reconcile() {
    const keys = new Set(
      (db.prepare('SELECT objectKey FROM documents').all() as { objectKey: string }[]).map(
        (r) => r.objectKey,
      ),
    );
    for (const file of readdirSync(objects)) if (!keys.has(file)) unlinkSync(join(objects, file));
  }
  const deletionLedger = join(directory, 'deletions.jsonl');
  function recordDeletion(kind: 'packet' | 'account' | 'document', id: string) {
    appendFileSync(
      deletionLedger,
      JSON.stringify({ kind, id, at: new Date().toISOString() }) + '\n',
      { mode: 0o600 },
    );
  }
  // The ledger lives outside the database so a restored old database cannot undo erasure.
  function replayDeletions() {
    if (!existsSync(deletionLedger)) return;
    db.transaction(() => {
      for (const line of readFileSync(deletionLedger, 'utf8').split('\n').filter(Boolean)) {
        const entry = JSON.parse(line) as { kind: string; id: string };
        if (entry.kind === 'account') db.prepare('DELETE FROM users WHERE id=?').run(entry.id);
        else if (entry.kind === 'packet')
          db.prepare('DELETE FROM packets WHERE id=?').run(entry.id);
        else if (entry.kind === 'document') {
          const row = db.prepare('SELECT packetId FROM documents WHERE id=?').get(entry.id) as
            { packetId: string } | undefined;
          if (row) {
            db.prepare('DELETE FROM runs WHERE packetId=?').run(row.packetId);
            const pr = db.prepare('SELECT payload FROM packets WHERE id=?').get(row.packetId) as
              { payload: string } | undefined;
            if (pr) {
              const p: Packet = JSON.parse(pr.payload);
              for (const [key, link] of Object.entries(p.links)) {
                if ([link, ...(link.additional || [])].some((a) => a.documentId === entry.id))
                  delete p.links[key];
              }
              p.revision++;
              savePacket(p);
            }
          }
          db.prepare('DELETE FROM documents WHERE id=?').run(entry.id);
        } else throw new Error('Invalid deletion ledger entry; recovery must be reviewed.');
      }
    })();
  }
  replayDeletions();
  reconcile();
  return {
    db,
    objects,
    packet,
    documents,
    runs,
    savePacket,
    audit,
    reconcile,
    recordDeletion,
    replayDeletions,
    directory,
  };
}
export type Store = ReturnType<typeof createStore>;
