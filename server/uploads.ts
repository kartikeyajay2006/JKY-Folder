import express, { type Express, type Request } from 'express';
import { randomUUID, createHash } from 'node:crypto';
import { z } from 'zod';
import type { Store } from './store';
import { limits } from '../shared/limits';

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
  store.db
    .exec(`CREATE TABLE IF NOT EXISTS uploads(id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,packetId TEXT REFERENCES packets(id) ON DELETE CASCADE,documentId TEXT REFERENCES documents(id) ON DELETE CASCADE,payload TEXT NOT NULL,data BLOB NOT NULL);
    CREATE INDEX IF NOT EXISTS uploads_owner ON uploads(userId);`);
  const sweep = () =>
    store.db
      .prepare("DELETE FROM uploads WHERE json_extract(payload,'$.expiresAt')<?")
      .run(Date.now());
  sweep();
  function load(req: Request) {
    sweep();
    const row = store.db
      .prepare('SELECT * FROM uploads WHERE id=? AND userId=?')
      .get(String(req.params.id), owner(req)) as
      { id: string; packetId: string | null; payload: string; data: Buffer } | undefined;
    if (!row) throw fail(404, 'Upload session expired or unavailable. Select the file again.');
    return {
      ...row,
      meta: JSON.parse(row.payload) as {
        name: string;
        size: number;
        sha256: string;
        intakeId?: string;
        expiresAt: number;
        result?: unknown;
      },
    };
  }
  const view = (row: ReturnType<typeof load>) => ({
    id: row.id,
    offset: row.meta.result ? row.meta.size : row.data.length,
    size: row.meta.size,
    expiresAt: row.meta.expiresAt,
    result: row.meta.result,
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
        'Too many unfinished uploads. Cancel an old session or wait for its 24-hour expiry.',
      );
    const id = randomUUID(),
      meta = { ...input, expiresAt: Date.now() + 86400000 };
    store.db
      .prepare('INSERT INTO uploads VALUES(?,?,?,NULL,?,?)')
      .run(id, owner(req), input.packetId || null, JSON.stringify(meta), Buffer.alloc(0));
    res.status(201).json({ id, offset: 0, size: input.size, expiresAt: meta.expiresAt });
  });
  app.get('/api/uploads/:id', (req, res) => res.json(view(load(req))));
  app.put(
    '/api/uploads/:id',
    express.raw({ type: 'application/octet-stream', limit: '512kb' }),
    (req, res) => {
      const row = load(req),
        offset = Number(req.get('upload-offset'));
      if (row.meta.result) throw fail(409, 'This upload has already completed.');
      if (!/^\d+$/.test(req.get('upload-offset') || '') || offset !== row.data.length)
        throw fail(409, 'Upload offset changed. Resume from the saved offset.');
      if (
        !Buffer.isBuffer(req.body) ||
        !req.body.length ||
        row.data.length + req.body.length > row.meta.size
      )
        throw fail(400, 'Invalid upload chunk.');
      const data = Buffer.concat([row.data, req.body]);
      const update = store.db
        .prepare('UPDATE uploads SET data=? WHERE id=? AND length(data)=?')
        .run(data, row.id, offset);
      if (!update.changes) throw fail(409, 'Upload offset changed.');
      res.json({ ...view(row), offset: data.length });
    },
  );
  app.post('/api/uploads/:id/complete', (req, res) => {
    const row = load(req);
    if (row.meta.result) return res.json(row.meta.result);
    if (row.data.length !== row.meta.size)
      throw fail(409, 'Upload is incomplete. Resume the remaining chunks.');
    if (createHash('sha256').update(row.data).digest('hex') !== row.meta.sha256)
      throw fail(
        400,
        'Upload checksum mismatch. Cancel this session and select the original again.',
      );
    const result = store.db.transaction(() => {
      const accepted = accept(
        req,
        {
          originalname: row.meta.name,
          buffer: row.data,
          size: row.data.length,
        } as Express.Multer.File,
        row.packetId || undefined,
        row.meta.intakeId,
      ) as { packetId: string; document: { id: string } };
      store.db
        .prepare('UPDATE uploads SET payload=?,data=?,packetId=?,documentId=? WHERE id=?')
        .run(
          JSON.stringify({ ...row.meta, result: accepted }),
          Buffer.alloc(0),
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
