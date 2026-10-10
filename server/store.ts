import Database from 'better-sqlite3';
import { mkdirSync, chmodSync, readdirSync, unlinkSync } from 'node:fs';
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
  reconcile();
  return { db, objects, packet, documents, runs, savePacket, audit, reconcile };
}
export type Store = ReturnType<typeof createStore>;
