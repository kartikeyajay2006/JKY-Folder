import { randomBytes, randomUUID, createHash, scrypt as rawScrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { z } from 'zod';
import type { Express, Request, RequestHandler } from 'express';
import type { Store } from './store';
import type { MailTransport } from './mail';
import { preferences, refreshReminders } from './reminders';
import { limits } from '../shared/limits';
import type { Packet, Reminder } from '../shared/model';
const hash = (v: string) => createHash('sha256').update(v).digest('hex'),
  scrypt = promisify(rawScrypt);
const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
interface QueueRow {
  id: string;
  userId: string;
  packetId: string | null;
  kind: 'reset' | 'verify' | 'reminder';
  payload: string;
  attempts: number;
}
export function createMailService(
  store: Store,
  transport: MailTransport | undefined,
  origin: string,
  background = true,
) {
  const url = new URL(origin);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/'
  )
    throw Error('Email links need an HTTP(S) application origin without a path.');
  store.db
    .exec(`CREATE TABLE IF NOT EXISTS email_verifications(userId TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,email TEXT NOT NULL,verifiedAt TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS account_tokens(hash TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,purpose TEXT NOT NULL,expiresAt INTEGER NOT NULL,passwordFingerprint TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS mail_queue(id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,packetId TEXT REFERENCES packets(id) ON DELETE CASCADE,kind TEXT NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL,attempts INTEGER NOT NULL,nextAttempt INTEGER NOT NULL,leaseUntil INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS mail_due ON mail_queue(status,nextAttempt);`);
  let stopped = false,
    busy = false,
    cursor = 0;
  const verified = (id: string) =>
    !!store.db
      .prepare(
        'SELECT v.userId FROM email_verifications v JOIN users u ON u.id=v.userId AND u.email=v.email WHERE v.userId=?',
      )
      .get(id);
  function enqueue(
    userId: string,
    kind: QueueRow['kind'],
    payload: unknown,
    packetId?: string,
    id: string = randomUUID(),
  ) {
    store.db
      .prepare("INSERT OR IGNORE INTO mail_queue VALUES(?,?,?,?,?,'queued',0,?,0)")
      .run(id, userId, packetId || null, kind, JSON.stringify(payload), Date.now());
    return id;
  }
  function requestLink(userId: string, kind: 'reset' | 'verify') {
    if (!transport) return;
    const recent = store.db
      .prepare(
        "SELECT id FROM mail_queue WHERE userId=? AND kind=? AND json_extract(payload,'$.createdAt')>?",
      )
      .get(userId, kind, Date.now() - 60000);
    if (recent) return;
    const row = store.db.prepare('SELECT password FROM users WHERE id=?').get(userId) as
      { password: string } | undefined;
    if (row)
      enqueue(userId, kind, {
        createdAt: Date.now(),
        expiresAt: Date.now() + 1800000,
        passwordFingerprint: hash(row.password),
      });
  }
  async function tick(now = Date.now()) {
    if (stopped || busy) return;
    busy = true;
    try {
      store.db.prepare('DELETE FROM account_tokens WHERE expiresAt<?').run(now);
      // Bounded keyset batches also generate in-app reminders with every browser closed.
      const users = store.db
        .prepare('SELECT rowid,id FROM users WHERE demo=0 AND rowid>? ORDER BY rowid LIMIT 100')
        .all(cursor) as { rowid: number; id: string }[];
      if (!users.length) cursor = 0;
      for (const u of users) {
        cursor = u.rowid;
        const reminders = refreshReminders(store, u.id, new Date(now)),
          prefs = preferences(store, u.id);
        if (!transport || !prefs.email || !verified(u.id)) continue;
        for (const r of reminders.filter((r) => !r.readAt))
          enqueue(
            u.id,
            'reminder',
            { reminderId: r.id, createdAt: now, expiresAt: now + 86400000 },
            r.packetId,
            'reminder:' + r.id,
          );
      }
      if (!transport) return;
      for (let n = 0; n < 10 && !stopped; n++) {
        const row = store.db
          .prepare(
            "SELECT * FROM mail_queue WHERE (status='queued' OR (status='sending' AND leaseUntil<?)) AND nextAttempt<=? ORDER BY nextAttempt,rowid LIMIT 1",
          )
          .get(now, now) as QueueRow | undefined;
        if (!row) break;
        const claimed = store.db
          .prepare(
            "UPDATE mail_queue SET status='sending',leaseUntil=?,attempts=attempts+1 WHERE id=? AND (status='queued' OR (status='sending' AND leaseUntil<?))",
          )
          .run(now + 120000, row.id, now);
        if (!claimed.changes) continue;
        const payload = JSON.parse(row.payload) as {
          expiresAt: number;
          passwordFingerprint?: string;
          reminderId?: string;
        };
        const u = store.db
          .prepare('SELECT email,password,demo FROM users WHERE id=?')
          .get(row.userId) as { email: string; password: string; demo: number } | undefined;
        let tokenHash: string | undefined;
        const cancel = () => store.db.prepare('DELETE FROM mail_queue WHERE id=?').run(row.id);
        if (!u || u.demo || payload.expiresAt <= now) {
          cancel();
          continue;
        }
        let subject: string, text: string;
        if (row.kind === 'reminder') {
          const prefs = preferences(store, row.userId),
            p = row.packetId && store.packet(row.packetId, row.userId),
            rr = store.db
              .prepare('SELECT payload FROM reminders WHERE id=? AND userId=?')
              .get(payload.reminderId, row.userId) as { payload: string } | undefined;
          const r = rr && (JSON.parse(rr.payload) as Reminder | undefined);
          const today = new Date(now).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
          if (
            !prefs.email ||
            !verified(row.userId) ||
            !p ||
            p.archived ||
            !store.documents(p.id).length ||
            !r ||
            r.readAt ||
            !(r.kind === 'deadline' ? prefs.deadlines : prefs.sourceChanges) ||
            (r.kind === 'deadline' &&
              (!p.deadline || p.deadline < today || !r.id.includes(p.deadline)))
          ) {
            cancel();
            continue;
          }
          subject =
            r.kind === 'deadline'
              ? 'JKY-Folder: application deadline reminder'
              : 'JKY-Folder: instructions changed';
          text =
            (r.kind === 'deadline'
              ? `A saved application deadline is approaching (${p.deadline}, Asia/Kolkata).`
              : 'A saved checklist or captured source changed. Review the updated instructions.') +
            `\nSign in to your private workspace: ${url.origin}/?view=applications\nChange email preferences in Settings. This reminder does not certify application readiness.`;
        } else {
          if (
            hash(u.password) !== payload.passwordFingerprint ||
            (row.kind === 'verify' && verified(row.userId))
          ) {
            cancel();
            continue;
          }
          const token = randomBytes(32).toString('hex');
          tokenHash = hash(token);
          store.db
            .prepare('INSERT INTO account_tokens VALUES(?,?,?,?,?)')
            .run(
              tokenHash,
              row.userId,
              row.kind,
              Math.min(payload.expiresAt, now + 1800000),
              hash(u.password),
            );
          const action = row.kind === 'reset' ? 'reset' : 'verify';
          subject =
            row.kind === 'reset'
              ? 'Reset your JKY-Folder password'
              : 'Verify your JKY-Folder email';
          text = `${row.kind === 'reset' ? 'Choose a new password' : 'Verify this email address'}: ${url.origin}/#${action}=${token}\nThis single-use link expires in 30 minutes. If you did not request this, ignore the email. No documents are included.`;
        }
        try {
          await transport.send({
            to: u.email,
            subject,
            text,
            messageId: `<jky-${hash(row.id)}-${row.attempts + 1}@${url.hostname}>`,
          });
          if (stopped) return;
          store.db
            .prepare("UPDATE mail_queue SET status='sent',payload=?,leaseUntil=0 WHERE id=?")
            .run(
              JSON.stringify({
                createdAt: JSON.parse(row.payload).createdAt,
                deliveredAt: new Date(now).toISOString(),
              }),
              row.id,
            );
        } catch {
          if (stopped) return;
          // A retry uses a new link. Never persist raw bearer tokens or message bodies.
          if (tokenHash) store.db.prepare('DELETE FROM account_tokens WHERE hash=?').run(tokenHash);
          const attempts = row.attempts + 1;
          store.db
            .prepare('UPDATE mail_queue SET status=?,nextAttempt=?,leaseUntil=0 WHERE id=?')
            .run(
              attempts >= 5 ? 'failed' : 'queued',
              now + Math.min(3600000, 60000 * 2 ** attempts),
              row.id,
            );
        }
      }
    } finally {
      busy = false;
    }
  }
  const timer = background
    ? setInterval(() => void tick().catch(() => console.error('mail.worker_failed')), 60000)
    : undefined;
  timer?.unref();
  function publicRoutes(
    app: Express,
    limit: RequestHandler,
    fail: (s: number, m: string) => Error,
  ) {
    app.get('/api/auth/recovery-status', (_req, res) => res.json({ enabled: !!transport }));
    app.post('/api/auth/forgot-password', limit, (req, res) => {
      const { email } = z
        .object({
          email: z
            .email()
            .max(254)
            .transform((v) => v.toLowerCase().trim()),
        })
        .strict()
        .parse(req.body);
      if (!transport)
        throw fail(
          503,
          'Email recovery is unavailable until the administrator configures email delivery.',
        );
      const u = store.db.prepare('SELECT id FROM users WHERE email=? AND demo=0').get(email) as
        { id: string } | undefined;
      if (u) requestLink(u.id, 'reset');
      res.json({
        ok: true,
        message:
          'If that account exists, a password reset link will arrive shortly. Check your inbox and spam folder.',
      });
    });
    app.post('/api/auth/reset-password', limit, async (req, res) => {
      const { token, password } = z
          .object({
            token: tokenSchema,
            password: z.string().min(limits.passwordMin).max(limits.passwordMax),
          })
          .strict()
          .parse(req.body),
        digest = hash(token);
      const lookup = () =>
        store.db
          .prepare(
            "SELECT t.userId,t.passwordFingerprint,u.password FROM account_tokens t JOIN users u ON u.id=t.userId WHERE t.hash=? AND t.purpose='reset' AND t.expiresAt>?",
          )
          .get(digest, Date.now()) as
          { userId: string; passwordFingerprint: string; password: string } | undefined;
      const original = lookup();
      if (!original || original.passwordFingerprint !== hash(original.password))
        throw fail(400, 'This reset link is invalid or expired. Request a new link.');
      const salt = randomBytes(16).toString('hex'),
        key = (await scrypt(password, salt, 64)) as Buffer;
      store.db.transaction(() => {
        const latest = lookup();
        if (!latest || latest.password !== original.password)
          throw fail(400, 'This reset link has already been used or expired.');
        store.db
          .prepare('UPDATE users SET password=? WHERE id=?')
          .run(salt + ':' + key.toString('hex'), latest.userId);
        store.db.prepare('DELETE FROM account_tokens WHERE userId=?').run(latest.userId);
        store.db
          .prepare("DELETE FROM mail_queue WHERE userId=? AND kind IN ('reset','verify')")
          .run(latest.userId);
        store.db.prepare('DELETE FROM sessions WHERE userId=?').run(latest.userId);
        store.audit(latest.userId, 'account.password.recovered', latest.userId);
      })();
      res.clearCookie('jky_session', { path: '/' });
      res.json({ ok: true, message: 'Password changed. Sign in with your new password.' });
    });
    app.post('/api/auth/verify-email', limit, (req, res) => {
      const { token } = z.object({ token: tokenSchema }).strict().parse(req.body);
      store.db.transaction(() => {
        const row = store.db
          .prepare(
            "SELECT t.userId,t.passwordFingerprint,u.email,u.password FROM account_tokens t JOIN users u ON u.id=t.userId WHERE t.hash=? AND t.purpose='verify' AND t.expiresAt>?",
          )
          .get(hash(token), Date.now()) as
          | { userId: string; passwordFingerprint: string; email: string; password: string }
          | undefined;
        if (!row || hash(row.password) !== row.passwordFingerprint)
          throw fail(
            400,
            'This verification link is invalid or expired. Request another from Settings.',
          );
        store.db
          .prepare(
            'INSERT INTO email_verifications VALUES(?,?,?) ON CONFLICT(userId) DO UPDATE SET email=excluded.email,verifiedAt=excluded.verifiedAt',
          )
          .run(row.userId, row.email, new Date().toISOString());
        store.db
          .prepare("DELETE FROM account_tokens WHERE userId=? AND purpose='verify'")
          .run(row.userId);
        store.audit(row.userId, 'account.email.verified', row.userId);
      })();
      res.json({ ok: true, message: 'Email verified. Enable email reminders in Settings.' });
    });
  }
  function privateRoutes(
    app: Express,
    owner: (req: Request) => string,
    limit: RequestHandler,
    fail: (s: number, m: string) => Error,
  ) {
    app.get('/api/account/email-status', (req, res) =>
      res.json({
        configured: !!transport,
        verified: verified(owner(req)),
        failed: (
          store.db
            .prepare("SELECT COUNT(*) AS n FROM mail_queue WHERE userId=? AND status='failed'")
            .get(owner(req)) as { n: number }
        ).n,
      }),
    );
    app.post('/api/account/verify-email', limit, (req, res) => {
      if (!transport) throw fail(503, 'Email delivery is not configured.');
      const u = store.db.prepare('SELECT demo FROM users WHERE id=?').get(owner(req)) as {
        demo: number;
      };
      if (u.demo) throw fail(400, 'Email delivery is unavailable for demo accounts.');
      if (!verified(owner(req))) requestLink(owner(req), 'verify');
      res.json({ ok: true, message: 'A verification link will arrive shortly.' });
    });
  }
  return {
    tick,
    publicRoutes,
    privateRoutes,
    verified,
    configured: !!transport,
    stop: () => {
      stopped = true;
      if (timer) clearInterval(timer);
      transport?.close?.();
    },
  };
}
