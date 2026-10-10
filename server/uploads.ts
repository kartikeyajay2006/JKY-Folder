import express, { type Express, type Request } from 'express';
import { randomUUID, createHash } from 'node:crypto';
import { z } from 'zod';
import type { Store } from './store';
import { limits } from '../shared/limits';

export const CHUNK_BYTES = 512 * 1024;
const SESSION_MS = 86400000;

interface SessionMeta {
  name: string;
  size: number;
  sha256: string;
  intakeId?: string;
  expiresAt: number;
  createdAt?: number;
  /** Bytes acknowledged so far. Legacy sessions kept bytes in uploads.data instead. */
  received?: number;
  result?: unknown;
}

export function registerUploads(
  app: Express,
  store: Store,
  owner: (req: Request) => string,
  accept: (
    req: Request,
    file: Express.Multer.File,
    packetId?: string,
    intakeId?: string,
  ) => unknown,
  fail: (status: number, message: string) => Error,
) {
  // Each acknowledged chunk is its own row, so a chunk write never rewrites earlier bytes.
  store.db
    .exec(`CREATE TABLE IF NOT EXISTS uploads(id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,packetId TEXT REFERENCES packets(id) ON DELETE CASCADE,documentId TEXT REFERENCES documents(id) ON DELETE CASCADE,payload TEXT NOT NULL,data BLOB NOT NULL);
    CREATE INDEX IF NOT EXISTS uploads_owner ON uploads(userId);
    CREATE TABLE IF NOT EXISTS upload_chunks(uploadId TEXT NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,offset INTEGER NOT NULL,data BLOB NOT NULL,PRIMARY KEY(uploadId,offset));`);
  // Move bytes of sessions created before chunk rows existed into the chunk table.
  store.db.transaction(() => {
    const legacy = store.db
      .prepare(
        "SELECT id,payload,data FROM uploads WHERE length(data)>0 AND json_extract(payload,'$.received') IS NULL",
      )
      .all() as { id: string; payload: string; data: Buffer }[];
    for (const row of legacy) {
      store.db.prepare('INSERT OR IGNORE INTO upload_chunks VALUES(?,0,?)').run(row.id, row.data);
      store.db
        .prepare('UPDATE uploads SET payload=?,data=? WHERE id=?')
        .run(
          JSON.stringify({ ...JSON.parse(row.payload), received: row.data.length }),
          Buffer.alloc(0),
          row.id,
        );
    }
  })();
  const sweep = () =>
    store.db
      .prepare("DELETE FROM uploads WHERE json_extract(payload,'$.expiresAt')<?")
      .run(Date.now());
  sweep();
  const received = (meta: SessionMeta) => (meta.result ? meta.size : meta.received || 0);
  function load(req: Request) {
    sweep();
    const row = store.db
      .prepare('SELECT id,packetId,payload FROM uploads WHERE id=? AND userId=?')
      .get(String(req.params.id), owner(req)) as
      { id: string; packetId: string | null; payload: string } | undefined;
    if (!row) throw fail(404, 'Upload session expired or unavailable. Select the file again.');
    return { ...row, meta: JSON.parse(row.payload) as SessionMeta };
  }
  const view = (row: { id: string; packetId: string | null; meta: SessionMeta }) => ({
    id: row.id,
    name: row.meta.name,
    size: row.meta.size,
    sha256: row.meta.sha256,
    packetId: row.packetId,
    offset: received(row.meta),
    createdAt: row.meta.createdAt,
    expiresAt: row.meta.expiresAt,
    result: row.meta.result,
  });
  // Unfinished uploads for this account, so an interrupted transfer can be finished later,
  // from this or another device holding the same original.
  app.get('/api/uploads', (req, res) => {
    sweep();
    const filter = z
      .object({
        sha256: z
          .string()
          .regex(/^[a-f0-9]{64}$/)
          .optional(),
      })
      .parse(req.query);
    const rows = store.db
      .prepare(
        'SELECT id,packetId,payload FROM uploads WHERE userId=? AND documentId IS NULL ORDER BY rowid DESC LIMIT 20',
      )
      .all(owner(req)) as { id: string; packetId: string | null; payload: string }[];
    res.json(
      rows
        .map((r) => ({ ...r, meta: JSON.parse(r.payload) as SessionMeta }))
        .filter((r) => !r.meta.result && (!filter.sha256 || r.meta.sha256 === filter.sha256))
        .filter((r) => !r.packetId || store.packet(r.packetId, owner(req)))
        .map(view),
    );
  });
  app.post('/api/uploads', (req, res) => {
    sweep();
    const input = z
      .object({
        name: z
          .string()
          .min(1)
          .max(160)
          .regex(/^.+\.(pdf|jpg|jpeg)$/i)
          .refine((v) => !/[\x00-\x1f\x7f/\\]/.test(v)),
        size: z.number().int().positive().max(limits.fileBytes),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        packetId: z.string().uuid().optional(),
        intakeId: z.string().uuid().optional(),
      })
      .strict()
      .parse(req.body);
    if (input.packetId && !store.packet(input.packetId, owner(req)))
      throw fail(404, 'Packet not found.');
    const pending = store.db
      .prepare(
        "SELECT COUNT(*) AS n,COALESCE(SUM(json_extract(payload,'$.size')),0) AS bytes FROM uploads WHERE userId=? AND documentId IS NULL",
      )
      .get(owner(req)) as { n: number; bytes: number };
    if (pending.n >= 10 || pending.bytes + input.size > limits.packetBytes)
      throw fail(
        400,
        'Too many unfinished uploads. Finish or discard one in Documents, or wait for its 24-hour expiry.',
      );
    const id = randomUUID(),
      now = Date.now(),
      meta: SessionMeta = { ...input, createdAt: now, expiresAt: now + SESSION_MS, received: 0 };
    store.db
      .prepare('INSERT INTO uploads VALUES(?,?,?,NULL,?,?)')
      .run(id, owner(req), input.packetId || null, JSON.stringify(meta), Buffer.alloc(0));
    res.status(201).json(view({ id, packetId: input.packetId || null, meta }));
  });
  app.get('/api/uploads/:id', (req, res) => res.json(view(load(req))));
  app.put(
    '/api/uploads/:id',
    express.raw({ type: 'application/octet-stream', limit: CHUNK_BYTES }),
    (req, res) => {
      const row = load(req),
        offset = Number(req.get('upload-offset'));
      if (row.meta.result) throw fail(409, 'This upload has already completed.');
      if (!/^\d+$/.test(req.get('upload-offset') || '') || offset !== received(row.meta))
        throw fail(409, 'Upload offset changed. Resume from the saved offset.');
      if (
        !Buffer.isBuffer(req.body) ||
        !req.body.length ||
        offset + req.body.length > row.meta.size
      )
        throw fail(400, 'Invalid upload chunk.');
      const next = offset + req.body.length;
      // Compare-and-set on the acknowledged offset keeps concurrent retries from duplicating bytes.
      const saved = store.db.transaction(() => {
        const update = store.db
          .prepare(
            "UPDATE uploads SET payload=json_set(payload,'$.received',?,'$.expiresAt',?) WHERE id=? AND COALESCE(json_extract(payload,'$.received'),0)=?",
          )
          .run(next, Date.now() + SESSION_MS, row.id, offset);
        if (!update.changes) return false;
        store.db.prepare('INSERT INTO upload_chunks VALUES(?,?,?)').run(row.id, offset, req.body);
        return true;
      })();
      if (!saved) throw fail(409, 'Upload offset changed.');
      res.json(view({ ...row, meta: { ...row.meta, received: next } }));
    },
  );
  app.post('/api/uploads/:id/complete', (req, res) => {
    const row = load(req);
    if (row.meta.result) return res.json(row.meta.result);
    if (received(row.meta) !== row.meta.size)
      throw fail(409, 'Upload is incomplete. Resume the remaining chunks.');
    const chunks = store.db
      .prepare('SELECT offset,data FROM upload_chunks WHERE uploadId=? ORDER BY offset')
      .all(row.id) as { offset: number; data: Buffer }[];
    let expected = 0;
    for (const chunk of chunks) {
      if (chunk.offset !== expected) throw fail(409, 'Upload chunks are incomplete.');
      expected += chunk.data.length;
    }
    const data = Buffer.concat(chunks.map((c) => c.data));
    if (
      data.length !== row.meta.size ||
      createHash('sha256').update(data).digest('hex') !== row.meta.sha256
    )
      throw fail(
        400,
        'Upload checksum mismatch. Cancel this session and select the original again.',
      );
    const result = store.db.transaction(() => {
      const accepted = accept(
        req,
        { originalname: row.meta.name, buffer: data, size: data.length } as Express.Multer.File,
        row.packetId || undefined,
        row.meta.intakeId,
      ) as { packetId: string; document: { id: string } };
      store.db.prepare('DELETE FROM upload_chunks WHERE uploadId=?').run(row.id);
      store.db
        .prepare('UPDATE uploads SET payload=?,packetId=?,documentId=? WHERE id=?')
        .run(
          JSON.stringify({ ...row.meta, result: accepted }),
          accepted.packetId,
          accepted.document.id,
          row.id,
        );
      return accepted;
    })();
    res.status(202).json(result);
  });
  app.delete('/api/uploads/:id', (req, res) => {
    const row = load(req);
    store.db.prepare('DELETE FROM uploads WHERE id=?').run(row.id);
    res.json({ ok: true });
  });
  return sweep;
}
