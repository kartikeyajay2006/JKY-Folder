import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';
import {
  randomUUID,
  randomBytes,
  createHash,
  scrypt as rawScrypt,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { existsSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createStore } from './store';
import { startJobs } from './jobs';
import { seedDemo } from './demo';
import { packs, findPack } from '../shared/packs';
import {
  emptyProfile,
  type Packet,
  type DocumentRecord,
  type User,
  type EvaluationRun,
} from '../shared/model';
import { evaluate } from '../shared/evaluate';
const scrypt = promisify(rawScrypt);
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const profileSchema = z
  .object({
    education: z.enum(['completed', 'appearing', 'unknown']),
    category: z.enum(['general', 'ews', 'obc', 'sc', 'st', 'unknown']),
    nameChanged: z.enum(['yes', 'no', 'unknown']),
    disability: z.enum(['none', 'pwd', 'dyslexia', 'unknown']),
    accommodation: z.enum(['yes', 'no', 'unknown']),
    nationality: z.enum(['indian', 'foreign_before', 'foreign_after', 'unknown']),
  })
  .strict();
const revision = z.number().int().positive();
const authSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((s) => s.toLowerCase().trim()),
  password: z.string().min(12).max(128),
});
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
interface AuthRequest extends Request {
  user: User;
  csrf: string;
}
export function createApp(options: {
  dataDir: string;
  origin?: string;
  jobs?: boolean;
  production?: boolean;
}) {
  const store = createStore(resolve(options.dataDir));
  const app = express();
  const prod = options.production || false;
  const allowedOrigins = new Set([
    options.origin || 'http://localhost:5173',
    ...(!prod ? ['http://127.0.0.1:5173'] : []),
  ]);
  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'blob:', 'data:'],
          'style-src': ["'self'", "'unsafe-inline'"],
          'script-src': ["'self'"],
          'object-src': ["'none'"],
          'frame-src': ["'none'"],
        },
      },
    }),
  );
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(
    '/api',
    rateLimit({
      windowMs: 60000,
      limit: 240,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Too many requests. Please wait a minute.' },
    }),
  );
  app.use(express.json({ limit: '64kb' }));
  app.use('/api', (req, res, next) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.headers.origin &&
      !allowedOrigins.has(req.headers.origin)
    )
      return res.status(403).json({ error: 'This request origin is not allowed.' });
    next();
  });
  const authLimit = rateLimit({
    windowMs: 15 * 60000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many sign-in attempts. Please try later.' },
  });
  function setSession(res: Response, userId: string) {
    const token = randomBytes(32).toString('hex'),
      csrf = randomBytes(32).toString('hex');
    store.db
      .prepare('INSERT INTO sessions VALUES(?,?,?,?)')
      .run(hash(token), userId, csrf, Date.now() + 24 * 60 * 60000);
    res.cookie('jky_session', token, {
      httpOnly: true,
      secure: prod,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60000,
      path: '/',
    });
    return csrf;
  }
  function readUser(row: { id: string; name: string; email: string; demo: number }): User {
    return { id: row.id, name: row.name, email: row.email, demo: !!row.demo };
  }
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: '0.1.0' }));
  app.post('/api/auth/register', authLimit, async (req, res) => {
    const input = authSchema
      .extend({
        name: z.string().trim().min(2).max(80),
        adult: z.literal(true),
        consent: z.literal(true),
      })
      .parse(req.body);
    const salt = randomBytes(16).toString('hex');
    const key = (await scrypt(input.password, salt, 64)) as Buffer;
    const id = randomUUID();
    try {
      store.db
        .prepare('INSERT INTO users VALUES(?,?,?,?,?,?)')
        .run(
          id,
          input.name,
          input.email,
          salt + ':' + key.toString('hex'),
          0,
          new Date().toISOString(),
        );
    } catch (error) {
      if ((error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE')
        throw new HttpError(409, 'An account already uses this email. Sign in instead.');
      throw error;
    }
    store.audit(id, 'consent.development-review.accepted', id);
    const csrf = setSession(res, id);
    res.status(201).json({ user: { id, name: input.name, email: input.email, demo: false }, csrf });
  });
  app.post('/api/auth/login', authLimit, async (req, res) => {
    const input = authSchema.parse(req.body);
    const row = store.db
      .prepare('SELECT * FROM users WHERE email=? AND demo=0')
      .get(input.email) as
      { id: string; name: string; email: string; demo: number; password: string } | undefined;
    const [salt, stored] = row?.password.split(':') || ['dummy-salt', '0'.repeat(128)];
    const key = (await scrypt(input.password, salt, 64)) as Buffer;
    if (!row || !timingSafeEqual(key, Buffer.from(stored, 'hex')))
      throw new HttpError(401, 'The email or password is incorrect.');
    const csrf = setSession(res, row.id);
    res.json({ user: readUser(row), csrf });
  });
  app.post('/api/auth/demo', authLimit, async (req, res) => {
    if (!req.is('application/json')) throw new HttpError(415, 'Send an application/json request.');
    const id = randomUUID();
    store.db
      .prepare('INSERT INTO users VALUES(?,?,?,?,?,?)')
      .run(id, 'Aanya Mehra', id + '@demo.invalid', '', 1, new Date().toISOString());
    try {
      const packetId = await seedDemo(store, id);
      const csrf = setSession(res, id);
      res.status(201).json({
        user: { id, name: 'Aanya Mehra', email: 'Synthetic demo', demo: true },
        csrf,
        packetId,
      });
    } catch (error) {
      store.db.prepare('DELETE FROM users WHERE id=?').run(id);
      throw error;
    }
  });
  function authenticated(req: Request, res: Response, next: NextFunction) {
    const token = (req.headers.cookie || '')
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('jky_session='))
      ?.slice(12);
    const row =
      token &&
      (store.db
        .prepare(
          'SELECT u.id,u.name,u.email,u.demo,s.csrf FROM sessions s JOIN users u ON u.id=s.userId WHERE s.hash=? AND s.expiresAt>?',
        )
        .get(hash(token), Date.now()) as
        { id: string; name: string; email: string; demo: number; csrf: string } | undefined);
    if (!row) return res.status(401).json({ error: 'Sign in to access your private workspace.' });
    const auth = req as AuthRequest;
    auth.user = readUser(row);
    auth.csrf = row.csrf;
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.headers['x-csrf-token'] !== row.csrf
    )
      return res
        .status(403)
        .json({ error: 'The request could not be verified. Refresh and try again.' });
    next();
  }
  app.use('/api', authenticated);
  const user = (req: Request) => (req as AuthRequest).user;
  function owned(req: Request): Packet {
    const p = store.packet(String(req.params.packetId), user(req).id);
    if (!p) throw new HttpError(404, 'Packet not found.');
    return p;
  }
  function checkRevision(p: Packet, expected: number) {
    if (p.revision !== expected)
      throw new HttpError(409, 'This packet changed. Refresh before saving your update.');
  }
  function touch(p: Packet) {
    p.revision++;
    p.updatedAt = new Date().toISOString();
    store.savePacket(p);
  }
  app.get('/api/me', (req, res) => res.json({ user: user(req), csrf: (req as AuthRequest).csrf }));
  app.post('/api/auth/logout', (req, res) => {
    const token = (req.headers.cookie || '')
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('jky_session='))
      ?.slice(12);
    if (token) store.db.prepare('DELETE FROM sessions WHERE hash=?').run(hash(token));
    res.clearCookie('jky_session', { path: '/' });
    res.json({ ok: true });
  });
  app.get('/api/packs', (_req, res) => res.json(packs));
  app.get('/api/packets', (req, res) => {
    const rows = store.db
      .prepare('SELECT payload FROM packets WHERE userId=? ORDER BY rowid DESC')
      .all(user(req).id) as { payload: string }[];
    res.json(
      rows.map((r) => {
        const p: Packet = JSON.parse(r.payload);
        return {
          packet: p,
          documentCount: store.documents(p.id).length,
          latestRun: store.runs(p.id)[0] || null,
        };
      }),
    );
  });
  app.post('/api/packets', (req, res) => {
    const input = z
      .object({ title: z.string().trim().min(2).max(100), packId: z.string() })
      .parse(req.body);
    if (!findPack(input.packId)) throw new HttpError(400, 'Unsupported application pack.');
    if (
      (
        store.db.prepare('SELECT COUNT(*) AS n FROM packets WHERE userId=?').get(user(req).id) as {
          n: number;
        }
      ).n >= 20
    )
      throw new HttpError(400, 'This release supports up to 20 packets per workspace.');
    const now = new Date().toISOString();
    const p: Packet = {
      id: randomUUID(),
      title: input.title,
      packId: input.packId,
      revision: 1,
      profile: { ...emptyProfile },
      links: {},
      createdAt: now,
      updatedAt: now,
    };
    store.db
      .prepare('INSERT INTO packets VALUES(?,?,?)')
      .run(p.id, user(req).id, JSON.stringify(p));
    store.audit(user(req).id, 'packet.created', p.id);
    res.status(201).json(p);
  });
  app.get('/api/packets/:packetId', (req, res) => {
    const p = owned(req);
    res.json({ packet: p, documents: store.documents(p.id), runs: store.runs(p.id) });
  });
  app.patch('/api/packets/:packetId/profile', (req, res) => {
    const input = z.object({ expectedRevision: revision, profile: profileSchema }).parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    p.profile = input.profile;
    touch(p);
    store.audit(user(req).id, 'profile.confirmed', p.id);
    res.json(p);
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
  });
  app.post(
    '/api/packets/:packetId/documents',
    (req, res, next) => {
      owned(req);
      next();
    },
    upload.single('file'),
    (req, res) => {
      const p = owned(req);
      if (!req.file) throw new HttpError(400, 'Choose one PDF or JPEG file.');
      const file = req.file;
      const name = file.originalname.normalize('NFKC');
      if (
        name.length > 160 ||
        /[\x00-\x1f\x7f/\\]/.test(name) ||
        !/^.+\.(pdf|jpg|jpeg)$/i.test(name)
      )
        throw new HttpError(400, 'Use a PDF or JPEG file with a simple filename.');
      const signature = file.buffer.subarray(0, 5).toString();
      const jpeg = file.buffer[0] === 255 && file.buffer[1] === 216 && file.buffer[2] === 255;
      if (signature !== '%PDF-' && !jpeg)
        throw new HttpError(400, 'This is not a supported PDF or JPEG file.');
      const docs = store.documents(p.id),
        digest = hash(file.buffer);
      const duplicate = docs.find((d) => d.hash === digest);
      if (duplicate) return res.json({ document: duplicate, duplicate: true });
      if (docs.length >= 10 || docs.reduce((n, d) => n + d.size, 0) + file.size > 30 * 1024 * 1024)
        throw new HttpError(400, 'Packet limit reached: 10 files or 30 MB.');
      const id = randomUUID(),
        key = randomUUID();
      writeFileSync(join(store.objects, key), file.buffer, { mode: 0o600 });
      const doc: DocumentRecord = {
        id,
        packetId: p.id,
        name,
        size: file.size,
        hash: digest,
        mime: 'application/octet-stream',
        status: 'processing',
        pageCount: 0,
        pages: [],
        createdAt: new Date().toISOString(),
      };
      try {
        store.db.transaction(() => {
          store.db
            .prepare('INSERT INTO documents VALUES(?,?,?,?)')
            .run(id, p.id, key, JSON.stringify(doc));
          store.db.prepare("INSERT INTO jobs VALUES(?,?,'queued')").run(id, p.id);
          touch(p);
          store.audit(user(req).id, 'document.uploaded', id);
        })();
      } catch (error) {
        unlinkSync(join(store.objects, key));
        throw error;
      }
      res.status(202).json({ document: doc, duplicate: false });
    },
  );
  app.put('/api/packets/:packetId/evidence/:requirementId', (req, res) => {
    const input = z
      .object({
        expectedRevision: revision,
        documentId: z.string(),
        pageFrom: z.number().int().min(1).max(20),
        pageTo: z.number().int().min(1).max(20),
        review: z.enum(['unreviewed', 'confirmed', 'concern']),
        note: z.string().trim().max(1500),
      })
      .parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    const pack = findPack(p.packId)!;
    if (!pack.requirements.some((r) => r.id === req.params.requirementId))
      throw new HttpError(404, 'Requirement not found.');
    const doc = store.documents(p.id).find((d) => d.id === input.documentId);
    if (!doc || doc.status !== 'ready')
      throw new HttpError(400, 'Choose an inspected document from this packet.');
    if (input.pageTo < input.pageFrom || input.pageTo > doc.pageCount)
      throw new HttpError(400, 'Choose an available page range.');
    if (input.review !== 'unreviewed' && input.note.length < 10)
      throw new HttpError(400, 'Add a review note with at least 10 characters.');
    const { expectedRevision, ...link } = input;
    p.links[String(req.params.requirementId)] = link;
    touch(p);
    store.audit(user(req).id, 'evidence.linked', p.id);
    res.json(p);
  });
  app.delete('/api/packets/:packetId/evidence/:requirementId', (req, res) => {
    const input = z.object({ expectedRevision: revision }).parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    delete p.links[String(req.params.requirementId)];
    touch(p);
    res.json(p);
  });
  app.delete('/api/packets/:packetId/documents/:documentId', (req, res) => {
    const input = z.object({ expectedRevision: revision }).parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    const row = store.db
      .prepare('SELECT objectKey FROM documents WHERE id=? AND packetId=?')
      .get(String(req.params.documentId), p.id) as { objectKey: string } | undefined;
    if (!row) throw new HttpError(404, 'Document not found.');
    store.db.transaction(() => {
      store.db
        .prepare('DELETE FROM documents WHERE id=? AND packetId=?')
        .run(String(req.params.documentId), p.id);
      for (const [rid, link] of Object.entries(p.links))
        if (link.documentId === req.params.documentId) delete p.links[rid];
      store.db.prepare('DELETE FROM runs WHERE packetId=?').run(p.id);
      touch(p);
      store.audit(user(req).id, 'document.deleted', String(req.params.documentId));
    })();
    if (existsSync(join(store.objects, row.objectKey)))
      unlinkSync(join(store.objects, row.objectKey));
    res.json({ ok: true });
  });
  app.post('/api/packets/:packetId/documents/:documentId/retry', (req, res) => {
    const input = z.object({ expectedRevision: revision }).parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    const doc = store.documents(p.id).find((d) => d.id === req.params.documentId);
    if (!doc) throw new HttpError(404, 'Document not found.');
    if (doc.status !== 'error') throw new HttpError(409, 'Only failed inspection can be retried.');
    store.db.transaction(() => {
      doc.status = 'processing';
      delete doc.error;
      store.db
        .prepare('UPDATE documents SET payload=? WHERE id=? AND packetId=?')
        .run(JSON.stringify(doc), doc.id, p.id);
      store.db.prepare("UPDATE jobs SET status='queued' WHERE id=?").run(doc.id);
      touch(p);
      store.audit(user(req).id, 'inspection.retried', doc.id);
    })();
    res.status(202).json(doc);
  });
  app.get('/api/packets/:packetId/documents/:documentId/content', (req, res) => {
    const p = owned(req);
    const row = store.db
      .prepare('SELECT objectKey,payload FROM documents WHERE id=? AND packetId=?')
      .get(String(req.params.documentId), p.id) as
      { objectKey: string; payload: string } | undefined;
    if (!row) throw new HttpError(404, 'Document not found.');
    const doc: DocumentRecord = JSON.parse(row.payload);
    if (doc.status !== 'ready')
      throw new HttpError(409, 'This file is not available until inspection succeeds.');
    res.setHeader('Content-Type', doc.mime);
    res.setHeader(
      'Content-Disposition',
      `${doc.mime === 'image/jpeg' ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(doc.name)}`,
    );
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    // Resolve only the database-owned object key beneath the private root. This
    // supports the default hidden .data directory without exposing a static mount.
    res.sendFile(row.objectKey, { root: store.objects });
  });
  app.post('/api/packets/:packetId/evaluate', (req, res) => {
    const input = z.object({ expectedRevision: revision }).parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    const prior = store
      .runs(p.id)
      .find(
        (r) => r.packetRevision === p.revision && r.packVersion === findPack(p.packId)!.version,
      );
    if (prior) return res.json(prior);
    const run = evaluate(p, store.documents(p.id), findPack(p.packId)!, randomUUID());
    store.db
      .prepare('INSERT INTO runs VALUES(?,?,?,?)')
      .run(run.id, p.id, run.createdAt, JSON.stringify(run));
    store.audit(user(req).id, 'packet.evaluated', p.id);
    res.status(201).json(run);
  });
  app.get('/api/packets/:packetId/reports/:runId', (req, res) => {
    const p = owned(req);
    const row = store.db
      .prepare('SELECT payload FROM runs WHERE id=? AND packetId=?')
      .get(String(req.params.runId), p.id) as { payload: string } | undefined;
    if (!row) throw new HttpError(404, 'Report not found.');
    const run: EvaluationRun = JSON.parse(row.payload);
    const pack = findPack(p.packId)!;
    const report = {
      product: 'JKY-Folder',
      packetTitle: p.title,
      application: pack.title,
      sourceUrl: pack.sourceUrl,
      stale: run.packetRevision !== p.revision,
      run,
    };
    res.setHeader('Content-Disposition', 'attachment; filename="jky-folder-report.json"');
    res.json(report);
  });
  function erasePacket(p: Packet, userId: string) {
    const rows = store.db.prepare('SELECT objectKey FROM documents WHERE packetId=?').all(p.id) as {
      objectKey: string;
    }[];
    store.db.transaction(() => {
      store.db.prepare('DELETE FROM packets WHERE id=? AND userId=?').run(p.id, userId);
      store.audit(userId, 'packet.deleted', p.id);
    })();
    for (const row of rows)
      if (existsSync(join(store.objects, row.objectKey)))
        unlinkSync(join(store.objects, row.objectKey));
  }
  app.delete('/api/packets/:packetId', (req, res) => {
    const input = z.object({ expectedRevision: revision }).parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    erasePacket(p, user(req).id);
    res.json({ ok: true });
  });
  app.delete('/api/account', (req, res) => {
    const input = z.object({ confirmation: z.literal('DELETE') }).parse(req.body);
    void input;
    const id = user(req).id;
    const rows = store.db.prepare('SELECT payload FROM packets WHERE userId=?').all(id) as {
      payload: string;
    }[];
    for (const row of rows) erasePacket(JSON.parse(row.payload), id);
    store.db.prepare('DELETE FROM users WHERE id=?').run(id);
    res.clearCookie('jky_session', { path: '/' });
    res.json({ ok: true });
  });
  const dist = resolve('dist');
  if (existsSync(dist)) {
    app.use(express.static(dist, { index: false }));
    app.get('/{*path}', (req, res, next) =>
      req.path.startsWith('/api/') ? next() : res.sendFile(join(dist, 'index.html')),
    );
  }
  app.use((_req, res) => res.status(404).json({ error: 'This route is not available.' }));
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof z.ZodError)
      return res
        .status(400)
        .json({ error: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') });
    if (error instanceof multer.MulterError)
      return res.status(400).json({
        error:
          error.code === 'LIMIT_FILE_SIZE'
            ? 'This release supports files up to 10 MB.'
            : 'Upload exactly one file at a time.',
      });
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
    if (error instanceof SyntaxError)
      return res.status(400).json({ error: 'The request body is not valid JSON.' });
    console.error('api.internal_error');
    res.status(500).json({ error: 'Something went wrong. Please retry or refresh the workspace.' });
  });
  const stopJobs = options.jobs === false ? () => {} : startJobs(store);
  function expireDemo() {
    store.db.prepare('DELETE FROM sessions WHERE expiresAt<?').run(Date.now());
    const rows = store.db
      .prepare('SELECT id FROM users WHERE demo=1 AND createdAt<?')
      .all(new Date(Date.now() - 24 * 60 * 60000).toISOString()) as { id: string }[];
    for (const row of rows) {
      const ps = store.db.prepare('SELECT payload FROM packets WHERE userId=?').all(row.id) as {
        payload: string;
      }[];
      for (const p of ps) erasePacket(JSON.parse(p.payload), row.id);
      store.db.prepare('DELETE FROM users WHERE id=?').run(row.id);
    }
  }
  expireDemo();
  const cleanup = setInterval(expireDemo, 60 * 60000);
  cleanup.unref();
  return {
    app,
    store,
    close: () => {
      clearInterval(cleanup);
      stopJobs();
      store.db.close();
    },
  };
}
