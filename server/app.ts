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
import { existsSync, writeFileSync, unlinkSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createStore } from './store';
import { createMailService } from './mail-service';
import { createPushService } from './push';
import type { PushSender } from './web-push';
import type { MailTransport } from './mail';
import { registerUploads } from './uploads';
import { registerInstructionDrafts } from './instruction-drafts';
import { startJobs } from './jobs';
import { seedDemo } from './demo';
import { packs, findPack } from '../shared/packs';
import {
  emptyProfile,
  type Profile,
  type Packet,
  type DocumentRecord,
  type User,
  type EvaluationRun,
} from '../shared/model';
import { evaluate, EVALUATOR_VERSION } from '../shared/evaluate';
import { makeCustomPack, starterRequirements, templates } from '../shared/templates';
import {
  requirementSchema,
  requirementsSchema,
  sourceUrlSchema,
  deadlineSchema,
  applicationMetaSchema,
} from './application-schema';
import { zipSync, strToU8 } from 'fflate';
import { limits } from '../shared/limits';
import { evidenceAnchors } from '../shared/model';
import { suggestEvidence, consistencyConcerns } from '../shared/facts';
import { availablePacks, resolvePack, sourceChanged, isUploadPacket } from './rule-packs';
import { preferences, refreshReminders } from './reminders';
import {
  profileQuestions,
  profileAnswers,
  conditionOptions,
  conditionFields,
} from '../shared/profile';
const scrypt = promisify(rawScrypt);
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const answer = <F extends keyof Profile>(field: F) =>
  z
    .string()
    .refine((value) => profileAnswers[field]!.includes(value), 'Choose a supported answer.')
    .transform((value) => value as Profile[F]);
const profileSchema = z
  .object({
    education: answer('education'),
    educationBoard: answer('educationBoard').optional().default('unknown'),
    scribe: answer('scribe').optional().default('unknown'),
    scribeRoute: answer('scribeRoute').optional().default('unknown'),
    category: answer('category'),
    nameChanged: answer('nameChanged'),
    disability: answer('disability'),
    accommodation: answer('accommodation'),
    nationality: answer('nationality'),
  })
  .strict();
const revision = z.number().int().positive();
const authSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((s) => s.toLowerCase().trim()),
  password: z.string().min(limits.passwordMin).max(limits.passwordMax),
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
  mail?: MailTransport;
  background?: boolean;
  /** Replaces real push delivery, for tests. */
  push?: PushSender;
}) {
  const store = createStore(resolve(options.dataDir));
  const pushService = createPushService(store, {
    dataDir: resolve(options.dataDir),
    background: options.background !== false,
    send: options.push,
  });
  const packetPack = (p: Packet) => {
    if (isUploadPacket(p))
      for (const doc of store.documents(p.id))
        p.links['upload-' + doc.id] ||= {
          documentId: doc.id,
          pageFrom: 1,
          pageTo: Math.max(1, doc.pageCount),
          review: 'unreviewed',
          note: '',
        };
    return resolvePack(store, p);
  };
  const mailService = createMailService(
    store,
    options.mail,
    options.origin || 'http://localhost:5173',
    options.background !== false,
  );
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
  app.use(express.json({ limit: '128kb' }));
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
  mailService.publicRoutes(app, authLimit, (status, message) => new HttpError(status, message));
  function setSession(res: Response, userId: string) {
    const token = randomBytes(32).toString('hex'),
      csrf = randomBytes(32).toString('hex');
    store.db
      .prepare('INSERT INTO sessions VALUES(?,?,?,?)')
      .run(hash(token), userId, csrf, Date.now() + limits.sessionHours * 60 * 60000);
    res.cookie('jky_session', token, {
      httpOnly: true,
      secure: prod,
      sameSite: 'strict',
      maxAge: limits.sessionHours * 60 * 60000,
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
    const current = store.db.prepare('SELECT password FROM users WHERE id=?').get(row.id) as
      { password: string } | undefined;
    if (!current || current.password !== row.password)
      throw new HttpError(401, 'Your account credentials changed. Please sign in again.');
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
  // Public, non-personal product catalog: the client renders checklists, questions and limits from it.
  app.get('/api/catalog', (_req, res) =>
    res.json({
      limits,
      evaluatorVersion: EVALUATOR_VERSION,
      questions: profileQuestions,
      conditions: conditionOptions(),
      templates: templates.map((t) => ({
        id: t.id,
        kind: t.kind,
        title: t.title,
        label: t.label,
        description: t.description,
        starter: starterRequirements(t.id),
      })),
      packs: availablePacks(store).map((p) => ({
        id: p.id,
        version: p.version,
        title: p.title,
        cycle: p.cycle,
        sourceUrl: p.sourceUrl,
        checkedAt: p.checkedAt,
        assurance: p.assurance,
        requirementCount: p.requirements.length,
        conditionalCount: p.requirements.filter((r) => r.condition.op !== 'always').length,
        groups: [...new Set(p.requirements.map((r) => r.group))],
        items: p.requirements.map((r) => ({
          id: r.id,
          title: r.title,
          group: r.group,
          mime: r.mime,
          conditional: r.condition.op !== 'always',
          dependsOn: conditionFields(r.condition),
        })),
      })),
    }),
  );
  app.use('/api', authenticated);
  const user = (req: Request) => (req as AuthRequest).user;
  mailService.privateRoutes(
    app,
    (req) => user(req).id,
    authLimit,
    (status, message) => new HttpError(status, message),
  );
  pushService.routes(
    app,
    user,
    (userId, action, objectId) => store.audit(userId, action, objectId),
    (status, message) => new HttpError(status, message),
  );
  function owned(req: Request): Packet {
    const p = store.packet(String(req.params.packetId), user(req).id);
    if (!p) throw new HttpError(404, 'Packet not found.');
    if (isUploadPacket(p))
      for (const doc of store.documents(p.id))
        p.links['upload-' + doc.id] ||= {
          documentId: doc.id,
          pageFrom: 1,
          pageTo: Math.max(1, doc.pageCount),
          review: 'unreviewed',
          note: '',
        };
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
  registerInstructionDrafts(
    app,
    store,
    owned,
    (req) => user(req).id,
    touch,
    (status, message) => new HttpError(status, message),
  );
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
  app.get('/api/packs', (_req, res) => res.json(availablePacks(store)));
  app.get('/api/templates', (_req, res) => res.json(templates));
  app.get('/api/activity', (req, res) => {
    res.json(
      store.db
        .prepare(
          "SELECT id,action,objectId,createdAt FROM audit WHERE userId=? AND action<>'consent.development-review.accepted' ORDER BY rowid DESC LIMIT 80",
        )
        .all(user(req).id),
    );
  });
  app.patch('/api/account', (req, res) => {
    const input = z
      .object({ name: z.string().trim().min(2).max(80) })
      .strict()
      .parse(req.body);
    store.db.prepare('UPDATE users SET name=? WHERE id=?').run(input.name, user(req).id);
    store.audit(user(req).id, 'account.updated', user(req).id);
    res.json({ ...user(req), name: input.name });
  });
  app.post('/api/account/password', authLimit, async (req, res) => {
    if (user(req).demo)
      throw new HttpError(400, 'Create a personal account to use password settings.');
    const input = z
      .object({
        currentPassword: z.string().min(1).max(128),
        password: z.string().min(limits.passwordMin).max(limits.passwordMax),
      })
      .strict()
      .parse(req.body);
    const row = store.db.prepare('SELECT password FROM users WHERE id=?').get(user(req).id) as {
      password: string;
    };
    const [salt, stored] = row.password.split(':');
    const current = (await scrypt(input.currentPassword, salt, 64)) as Buffer;
    if (!timingSafeEqual(current, Buffer.from(stored, 'hex')))
      throw new HttpError(400, 'Your current password is incorrect.');
    const newSalt = randomBytes(16).toString('hex');
    const key = (await scrypt(input.password, newSalt, 64)) as Buffer;
    const latest = store.db.prepare('SELECT password FROM users WHERE id=?').get(user(req).id) as
      { password: string } | undefined;
    if (!latest || latest.password !== row.password)
      throw new HttpError(409, 'Your credentials changed. Refresh and try again.');
    store.db.transaction(() => {
      store.db
        .prepare('UPDATE users SET password=? WHERE id=?')
        .run(newSalt + ':' + key.toString('hex'), user(req).id);
      store.db.prepare('DELETE FROM sessions WHERE userId=?').run(user(req).id);
      store.db.prepare('DELETE FROM account_tokens WHERE userId=?').run(user(req).id);
      store.db
        .prepare("DELETE FROM mail_queue WHERE userId=? AND kind IN ('reset','verify')")
        .run(user(req).id);
      store.audit(user(req).id, 'account.password.changed', user(req).id);
    })();
    const csrf = setSession(res, user(req).id);
    res.json({ csrf });
  });
  app.post('/api/account/signout-others', (req, res) => {
    store.db
      .prepare('DELETE FROM sessions WHERE userId=? AND csrf<>?')
      .run(user(req).id, (req as AuthRequest).csrf);
    store.audit(user(req).id, 'account.sessions.revoked', user(req).id);
    res.json({ ok: true });
  });
  app.get('/api/notifications', (req, res) => res.json(refreshReminders(store, user(req).id)));
  app.get('/api/notification-preferences', (req, res) =>
    res.json(preferences(store, user(req).id)),
  );
  app.put('/api/notification-preferences', (req, res) => {
    const prefs = z
      .object({
        deadlines: z.boolean(),
        sourceChanges: z.boolean(),
        email: z.boolean().optional().default(false),
      })
      .strict()
      .parse(req.body);
    if (prefs.email && (!mailService.configured || !mailService.verified(user(req).id)))
      throw new HttpError(400, 'Verify your email before enabling email reminders.');
    store.db
      .prepare(
        'INSERT INTO notification_preferences VALUES(?,?) ON CONFLICT(userId) DO UPDATE SET payload=excluded.payload',
      )
      .run(user(req).id, JSON.stringify(prefs));
    res.json(prefs);
  });
  app.post('/api/notifications/:notificationId/read', (req, res) => {
    const row = store.db
      .prepare('SELECT payload FROM reminders WHERE id=? AND userId=?')
      .get(String(req.params.notificationId), user(req).id) as { payload: string } | undefined;
    if (!row) throw new HttpError(404, 'Reminder not found.');
    const reminder = { ...JSON.parse(row.payload), readAt: new Date().toISOString() };
    store.db
      .prepare('UPDATE reminders SET payload=? WHERE id=? AND userId=?')
      .run(JSON.stringify(reminder), String(req.params.notificationId), user(req).id);
    res.json(reminder);
  });
  app.get('/api/packets/:packetId/sources', (req, res) => {
    const p = owned(req);
    res.json({ pack: packetPack(p), changed: sourceChanged(store, p) });
  });
  app.put('/api/packets/:packetId/instructions', (req, res) => {
    const input = z
      .object({
        expectedRevision: revision,
        packId: z.string().optional(),
        templateId: z.enum(['college', 'scholarship', 'job', 'custom']).optional(),
        requirements: requirementsSchema.optional(),
        sourceUrl: sourceUrlSchema.optional(),
        instructionText: z.string().max(limits.instructionChars).optional(),
        title: z.string().trim().min(2).max(100).optional(),
        destination: z.string().trim().max(160).optional(),
        deadline: deadlineSchema.optional(),
      })
      .strict()
      .parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    if (!store.documents(p.id).length)
      throw new HttpError(400, 'Upload your documents before adding application instructions.');
    if (input.packId) {
      const pack = availablePacks(store).find((pack) => pack.id === input.packId);
      if (!pack) throw new HttpError(400, 'Choose a supported reference.');
      p.packId = pack.id;
      p.packSnapshot = structuredClone(pack);
      delete p.customPack;
    } else {
      if (!input.templateId || !input.requirements?.length)
        throw new HttpError(400, 'Confirm your actual requirements.');
      p.customPack = makeCustomPack({
        id: 'custom-' + p.id,
        title: p.title,
        sourceUrl: input.sourceUrl,
        requirements: input.requirements,
      });
      p.packId = p.customPack.id;
    }
    p.mode = 'instructions';
    p.title = input.title || p.title;
    if (p.customPack) p.customPack.title = p.title;
    p.destination = input.destination ?? p.destination;
    p.deadline = input.deadline ?? p.deadline;
    p.links = {};
    p.notes = input.instructionText || '';
    touch(p);
    store.audit(user(req).id, 'checklist.updated', p.id);
    res.json(p);
  });
  app.post('/api/packets/:packetId/accept-checklist-update', (req, res) => {
    const input = z.object({ expectedRevision: revision }).strict().parse(req.body),
      p = owned(req);
    checkRevision(p, input.expectedRevision);
    if (p.customPack) throw new HttpError(400, 'Edit your custom checklist directly.');
    const current = availablePacks(store).find((pack) => pack.id === p.packId);
    if (!current) throw new HttpError(409, 'No current published checklist is available.');
    // A changed source cannot be accepted until it is incorporated into a new reviewed publication.
    const selected = { ...p, packSnapshot: current };
    if (sourceChanged(store, selected))
      throw new HttpError(409, 'The source change still requires curator review.');
    p.packSnapshot = structuredClone(current);
    p.links = {};
    touch(p);
    store.audit(user(req).id, 'checklist.update.accepted', p.id);
    res.json(p);
  });
  app.post('/api/packets/:packetId/documents/:documentId/facts', (req, res) => {
    const input = z
      .object({
        expectedRevision: revision,
        kind: z.enum(['name', 'birth_date', 'issue_date', 'expiry_date']),
        page: z.number().int().min(1).max(20),
        value: z.string().trim().min(1).max(160),
        reason: z.string().trim().min(10).max(1000),
      })
      .strict()
      .parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    const doc = store.documents(p.id).find((d) => d.id === req.params.documentId);
    if (!doc || doc.status !== 'ready' || input.page > doc.pageCount)
      throw new HttpError(400, 'Choose an inspected document and available page.');
    if ((doc.facts || []).length >= 100)
      throw new HttpError(400, 'The document fact limit has been reached.');
    const fact = {
      id: randomUUID(),
      kind: input.kind,
      page: input.page,
      value: input.value,
      originalText: '',
      origin: 'manual' as const,
      confidence: 0,
      history: [
        {
          revision: 1,
          value: input.value,
          confirmed: true,
          actor: user(req).id,
          reason: input.reason,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    doc.facts = [...(doc.facts || []), fact];
    store.db.transaction(() => {
      store.db
        .prepare('UPDATE documents SET payload=? WHERE id=? AND packetId=?')
        .run(JSON.stringify(doc), doc.id, p.id);
      for (const link of Object.values(p.links))
        for (const a of evidenceAnchors(link)) if (a.documentId === doc.id) a.review = 'unreviewed';
      touch(p);
      store.audit(user(req).id, 'fact.corrected', doc.id);
    })();
    res.status(201).json(doc);
  });
  app.put('/api/packets/:packetId/documents/:documentId/facts/:factId', (req, res) => {
    const input = z
      .object({
        expectedRevision: revision,
        expectedFactRevision: z.number().int().nonnegative(),
        value: z.string().trim().min(1).max(160),
        confirmed: z.boolean(),
        reason: z.string().trim().min(10).max(1000),
      })
      .strict()
      .parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    const doc = store.documents(p.id).find((d) => d.id === req.params.documentId);
    const fact = doc?.facts?.find((f) => f.id === req.params.factId);
    if (!doc || doc.status !== 'ready' || !fact)
      throw new HttpError(404, 'Inspected fact not found.');
    if ((fact.history.at(-1)?.revision || 0) !== input.expectedFactRevision)
      throw new HttpError(409, 'This fact changed. Refresh before confirming it.');
    fact.value = input.value;
    fact.history.push({
      revision: input.expectedFactRevision + 1,
      value: input.value,
      confirmed: input.confirmed,
      reason: input.reason,
      actor: user(req).id,
      createdAt: new Date().toISOString(),
    });
    store.db.transaction(() => {
      store.db
        .prepare('UPDATE documents SET payload=? WHERE id=? AND packetId=?')
        .run(JSON.stringify(doc), doc.id, p.id);
      for (const link of Object.values(p.links))
        for (const a of evidenceAnchors(link)) if (a.documentId === doc.id) a.review = 'unreviewed';
      touch(p);
      store.audit(user(req).id, 'fact.corrected', doc.id);
    })();
    res.json(doc);
  });
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
          currentCounts: evaluate(p, store.documents(p.id), packetPack(p), 'summary').counts,
          requirementCount: packetPack(p).requirements.length,
          checklist: {
            title: packetPack(p).title,
            assurance: packetPack(p).assurance,
          },
        };
      }),
    );
  });
  app.post('/api/packets', (req, res) => {
    const input = z
      .object({
        title: z.string().trim().min(2).max(100),
        packId: z.string().optional(),
        templateId: z.enum(['college', 'scholarship', 'job', 'custom']).optional(),
        requirements: requirementsSchema.optional(),
        sourceUrl: sourceUrlSchema.optional(),
        instructionText: z.string().max(limits.instructionChars).optional(),
        destination: z.string().trim().max(160).optional(),
        deadline: deadlineSchema.optional(),
      })
      .parse(req.body);
    if (
      !input.templateId &&
      (!input.packId || !availablePacks(store).find((p) => p.id === input.packId))
    )
      throw new HttpError(400, 'Choose a supported checklist or starter.');
    const customRequirements = input.templateId
      ? input.requirements || starterRequirements(input.templateId)
      : undefined;
    if (customRequirements && !customRequirements.length)
      throw new HttpError(400, 'Add at least one requirement to your custom application.');
    if (
      (
        store.db.prepare('SELECT COUNT(*) AS n FROM packets WHERE userId=?').get(user(req).id) as {
          n: number;
        }
      ).n >= limits.packets
    )
      throw new HttpError(
        400,
        `This release supports up to ${limits.packets} packets per workspace.`,
      );
    const now = new Date().toISOString();
    const p: Packet = {
      id: randomUUID(),
      mode: 'instructions',
      title: input.title,
      packId: input.packId || 'custom',
      revision: 1,
      profile: { ...emptyProfile },
      links: {},
      createdAt: now,
      updatedAt: now,
      kind: input.templateId || 'college',
      destination: input.destination || '',
      deadline: input.deadline || '',
      notes: input.instructionText || '',
      archived: false,
    };
    if (customRequirements) {
      p.customPack = makeCustomPack({
        id: 'custom-' + p.id,
        title: input.title,
        sourceUrl: input.sourceUrl,
        requirements: customRequirements,
      });
      p.packId = p.customPack.id;
    }
    if (!p.customPack)
      p.packSnapshot = structuredClone(availablePacks(store).find((pack) => pack.id === p.packId)!);
    store.db
      .prepare('INSERT INTO packets VALUES(?,?,?)')
      .run(p.id, user(req).id, JSON.stringify(p));
    store.audit(user(req).id, 'packet.created', p.id);
    res.status(201).json(p);
  });
  app.get('/api/packets/:packetId', (req, res) => {
    const p = owned(req);
    const documents = store.documents(p.id);
    const pack = packetPack(p);
    res.json({
      packet: p,
      documents,
      runs: store.runs(p.id),
      pack,
      live: {
        ...evaluate(p, documents, pack, 'live-preview'),
        ...(sourceChanged(store, p) ? { summary: 'review_required' } : {}),
      },
      evaluatorVersion: EVALUATOR_VERSION,
      sourceChanged: sourceChanged(store, p),
      suggestions: suggestEvidence(p, documents, pack),
      consistencyConcerns: consistencyConcerns(documents),
    });
  });
  app.patch('/api/packets/:packetId', (req, res) => {
    const input = z
      .object({ expectedRevision: revision, details: applicationMetaSchema })
      .strict()
      .parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    if (p.customPack && input.details.notes !== undefined && input.details.notes !== p.notes) {
      for (const link of Object.values(p.links))
        for (const anchor of evidenceAnchors(link)) anchor.review = 'unreviewed';
      p.customPack.version = `custom.${p.revision + 1}`;
    }
    Object.assign(p, input.details);
    if (p.customPack) p.customPack.title = p.title;
    touch(p);
    store.audit(user(req).id, 'packet.updated', p.id);
    res.json(p);
  });
  app.put('/api/packets/:packetId/checklist', (req, res) => {
    const input = z
      .object({
        expectedRevision: revision,
        requirements: requirementsSchema,
        sourceUrl: sourceUrlSchema,
        notes: z.string().max(limits.instructionChars).optional(),
      })
      .strict()
      .parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    if (!p.customPack)
      throw new HttpError(
        400,
        'Reference checklists are versioned. Create a custom application to edit the requirements.',
      );
    const oldRequirements = new Map(
      p.customPack.requirements.map((r) => [r.id, JSON.stringify(r)]),
    );
    const sourceChanged =
      p.customPack.sourceUrl !== input.sourceUrl ||
      (input.notes !== undefined && p.notes !== input.notes);
    p.customPack = {
      ...p.customPack,
      requirements: input.requirements,
      sourceUrl: input.sourceUrl,
      checkedAt: new Date().toISOString(),
      version: `custom.${p.revision + 1}`,
    };
    if (input.notes !== undefined) p.notes = input.notes;
    const ids = new Set(input.requirements.map((r) => r.id));
    for (const id of Object.keys(p.links)) if (!ids.has(id)) delete p.links[id];
    for (const requirement of input.requirements)
      if (
        p.links[requirement.id] &&
        (sourceChanged || oldRequirements.get(requirement.id) !== JSON.stringify(requirement))
      )
        for (const anchor of evidenceAnchors(p.links[requirement.id])) anchor.review = 'unreviewed';
    touch(p);
    store.audit(user(req).id, 'checklist.updated', p.id);
    res.json(p);
  });
  app.get('/api/packets/:packetId/download', (req, res) => {
    const p = owned(req),
      pack = packetPack(p),
      documents = store.documents(p.id);
    const files: Record<string, Uint8Array> = {};
    for (const d of documents.filter((d) => d.status === 'ready')) {
      const row = store.db
        .prepare('SELECT objectKey FROM documents WHERE id=? AND packetId=?')
        .get(d.id, p.id) as { objectKey: string };
      const safeName = d.name.replace(/[^a-zA-Z0-9._ -]/g, '_').replace(/^\.+/, '');
      files[`documents/${d.id.slice(0, 8)}-${safeName || 'evidence'}`] = new Uint8Array(
        readFileSync(join(store.objects, row.objectKey)),
      );
    }
    const report = evaluate(p, documents, pack, 'export-' + randomUUID());
    files['checklist-and-review.json'] = strToU8(
      JSON.stringify(
        {
          application: p.title,
          deadline: p.deadline,
          destination: p.destination,
          instructions: p.notes,
          profile: p.profile,
          checklist: pack,
          review: report,
        },
        null,
        2,
      ),
    );
    files['READ-ME.txt'] = strToU8(
      'JKY-Folder private application export\nThis archive contains inspected originals and a current review. Processing and failed files are excluded. Personal content confirmations do not guarantee institutional acceptance.\n',
    );
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="jky-folder-application.zip"');
    store.audit(user(req).id, 'packet.exported', p.id);
    res.send(Buffer.from(zipSync(files, { level: 0 })));
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
    limits: { fileSize: limits.fileBytes, files: 1, fields: 0, parts: 1 },
  });
  function acceptDocument(req: Request, p: Packet, file: Express.Multer.File) {
    const name = file.originalname.normalize('NFKC');
    if (name.length > 160 || /[\x00-\x1f\x7f/\\]/.test(name) || !/^.+\.(pdf|jpg|jpeg)$/i.test(name))
      throw new HttpError(400, 'Use a PDF or JPEG file with a simple filename.');
    const signature = file.buffer.subarray(0, 5).toString();
    const jpeg = file.buffer[0] === 255 && file.buffer[1] === 216 && file.buffer[2] === 255;
    if (signature !== '%PDF-' && !jpeg)
      throw new HttpError(400, 'This is not a supported PDF or JPEG file.');
    const docs = store.documents(p.id),
      digest = hash(file.buffer);
    const duplicate = docs.find((d) => d.hash === digest);
    if (duplicate) return { document: duplicate, duplicate: true, packetId: p.id };
    if (
      docs.length >= limits.packetFiles ||
      docs.reduce((n, d) => n + d.size, 0) + file.size > limits.packetBytes
    )
      throw new HttpError(
        400,
        `Packet limit reached: ${limits.packetFiles} files or ${limits.packetBytes / 1024 / 1024} MB.`,
      );
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
        if (isUploadPacket(p))
          p.links['upload-' + id] = {
            documentId: id,
            pageFrom: 1,
            pageTo: 1,
            review: 'unreviewed',
            note: '',
          };
        touch(p);
        store.audit(user(req).id, 'document.uploaded', id);
      })();
    } catch (error) {
      unlinkSync(join(store.objects, key));
      throw error;
    }
    return { document: doc, duplicate: false, packetId: p.id };
  }
  function intakeOriginal(req: Request, file: Express.Multer.File, intakeId?: string) {
    if (intakeId) {
      const existing = store.db
        .prepare("SELECT id FROM packets WHERE userId=? AND json_extract(payload, '$.intakeId')=?")
        .get(user(req).id, intakeId) as { id: string } | undefined;
      if (existing) {
        return acceptDocument(req, store.packet(existing.id, user(req).id)!, file);
      }
    }
    const count = store.db
      .prepare(
        'SELECT COUNT(*) AS n FROM packets WHERE userId=? AND EXISTS (SELECT 1 FROM documents WHERE packetId=packets.id)',
      )
      .get(user(req).id) as { n: number };
    if (count.n >= limits.packets) throw new HttpError(400, 'Your folder limit has been reached.');
    const now = new Date().toISOString();
    const p: Packet = {
      id: randomUUID(),
      mode: 'uploads',
      intakeId,
      title: file.originalname.replace(/\.[^.]+$/, '').slice(0, 100) || 'Uploaded documents',
      packId: 'uploads',
      revision: 1,
      profile: { ...emptyProfile },
      links: {},
      createdAt: now,
      updatedAt: now,
      kind: 'custom',
    };
    // Metadata and original acceptance commit together. An invalid first file creates no folder.
    const result = store.db.transaction(() => {
      store.db
        .prepare('INSERT INTO packets VALUES(?,?,?)')
        .run(p.id, user(req).id, JSON.stringify(p));
      const result = acceptDocument(req, p, file);
      store.audit(user(req).id, 'packet.created', p.id);
      return result;
    })();
    return result;
  }
  app.post('/api/intake', upload.single('file'), (req, res) => {
    if (!req.file) throw new HttpError(400, 'Choose one PDF or JPEG file.');
    res
      .status(202)
      .json(
        intakeOriginal(req, req.file, z.string().uuid().optional().parse(req.get('x-intake-id'))),
      );
  });
  const sweepUploads = registerUploads(
    app,
    store,
    (req) => user(req).id,
    (req, file, packetId, intakeId) => {
      if (!packetId) return intakeOriginal(req, file, intakeId);
      const p = store.packet(packetId, user(req).id);
      if (!p) throw new HttpError(404, 'Packet not found.');
      return acceptDocument(req, p, file);
    },
    (status, message) => new HttpError(status, message),
  );
  app.post(
    '/api/packets/:packetId/documents',
    (req, res, next) => {
      owned(req);
      next();
    },
    upload.single('file'),
    (req, res) => {
      if (!req.file) throw new HttpError(400, 'Choose one PDF or JPEG file.');
      res.status(202).json(acceptDocument(req, owned(req), req.file));
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
        slot: z.string().trim().max(80).optional(),
        additional: z
          .array(
            z
              .object({
                documentId: z.string(),
                pageFrom: z.number().int().min(1).max(20),
                pageTo: z.number().int().min(1).max(20),
                review: z.enum(['unreviewed', 'confirmed', 'concern']),
                note: z.string().trim().max(1500),
                slot: z.string().trim().max(80).optional(),
              })
              .strict(),
          )
          .max(9)
          .optional(),
      })
      .parse(req.body);
    const p = owned(req);
    checkRevision(p, input.expectedRevision);
    const pack = packetPack(p);
    if (!pack.requirements.some((r) => r.id === req.params.requirementId))
      throw new HttpError(404, 'Requirement not found.');
    const documents = store.documents(p.id);
    const requirement = pack.requirements.find((r) => r.id === req.params.requirementId)!;
    const anchors = [input, ...(input.additional || [])];
    const keys = new Set<string>();
    for (const a of anchors) {
      const doc = documents.find((d) => d.id === a.documentId);
      if (!doc || doc.status !== 'ready')
        throw new HttpError(400, 'Choose an inspected document from this packet.');
      if (a.pageTo < a.pageFrom || a.pageTo > doc.pageCount)
        throw new HttpError(400, 'Choose an available page range.');
      if (a.review !== 'unreviewed' && a.note.length < 10)
        throw new HttpError(400, 'Add a review note with at least 10 characters.');
      if (a.slot && !requirement.evidenceSlots?.includes(a.slot))
        throw new HttpError(400, 'Choose a component from this requirement.');
      const key = `${a.documentId}:${a.pageFrom}:${a.pageTo}:${a.slot || ''}`;
      if (keys.has(key))
        throw new HttpError(400, 'The same evidence range and component cannot be linked twice.');
      keys.add(key);
    }
    const { expectedRevision, ...link } = input;
    p.links[String(req.params.requirementId)] = {
      ...link,
      actor: user(req).id,
      reviewedAt: new Date().toISOString(),
      additional: input.additional?.map((a) => ({
        ...a,
        actor: user(req).id,
        reviewedAt: new Date().toISOString(),
      })),
    };
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
    store.recordDeletion('document', String(req.params.documentId));
    store.db.transaction(() => {
      store.db
        .prepare('DELETE FROM documents WHERE id=? AND packetId=?')
        .run(String(req.params.documentId), p.id);
      for (const [rid, link] of Object.entries(p.links))
        if (evidenceAnchors(link).some((a) => a.documentId === req.params.documentId))
          delete p.links[rid];
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
    if (isUploadPacket(p) && !store.documents(p.id).length)
      throw new HttpError(400, 'Upload an original before saving a document review.');
    checkRevision(p, input.expectedRevision);
    if (sourceChanged(store, p))
      throw new HttpError(
        409,
        'The source or checklist changed. Review and accept the current checklist before saving a new report.',
      );
    const prior = store
      .runs(p.id)
      .find(
        (r) =>
          r.packetRevision === p.revision &&
          r.packVersion === packetPack(p).version &&
          r.evaluatorVersion === EVALUATOR_VERSION,
      );
    if (prior) return res.json(prior);
    const run = evaluate(p, store.documents(p.id), packetPack(p), randomUUID());
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
    const pack = packetPack(p);
    const report = {
      product: 'JKY-Folder',
      packetTitle: p.title,
      application: run.checklist?.title || pack.title,
      sourceUrl: run.checklist?.sourceUrl ?? pack.sourceUrl,
      stale:
        sourceChanged(store, p) ||
        run.packetRevision !== p.revision ||
        run.packVersion !== pack.version ||
        run.evaluatorVersion !== EVALUATOR_VERSION,
      run,
    };
    res.setHeader('Content-Disposition', 'attachment; filename="jky-folder-report.json"');
    res.json(report);
  });
  function erasePacket(p: Packet, userId: string) {
    const rows = store.db.prepare('SELECT objectKey FROM documents WHERE packetId=?').all(p.id) as {
      objectKey: string;
    }[];
    store.recordDeletion('packet', p.id);
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
    store.recordDeletion('account', id);
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
            ? `This release supports files up to ${limits.fileBytes / 1024 / 1024} MB.`
            : 'Upload exactly one file at a time.',
      });
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
    if (error instanceof SyntaxError)
      return res.status(400).json({ error: 'The request body is not valid JSON.' });
    if ((error as { type?: string })?.type === 'entity.too.large')
      return res.status(413).json({ error: 'Request exceeds the supported size.' });
    console.error('api.internal_error');
    res.status(500).json({ error: 'Something went wrong. Please retry or refresh the workspace.' });
  });
  const stopJobs =
    options.jobs === false ? Object.assign(() => {}, { isIdle: () => true }) : startJobs(store);
  function expireDemo() {
    sweepUploads();
    store.db.prepare('DELETE FROM sessions WHERE expiresAt<?').run(Date.now());
    const rows = store.db
      .prepare('SELECT id FROM users WHERE demo=1 AND createdAt<?')
      .all(new Date(Date.now() - limits.sessionHours * 60 * 60000).toISOString()) as {
      id: string;
    }[];
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
    jobsIdle: stopJobs.isIdle,
    mail: mailService,
    push: pushService,
    close: () => {
      clearInterval(cleanup);
      stopJobs();
      mailService.stop();
      pushService.stop();
      store.db.close();
    },
  };
}
