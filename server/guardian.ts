import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Express, Request, RequestHandler } from 'express';
import type { Store } from './store';
import type { MailComposer } from './mail-service';
import type { GuardianState } from '../shared/model';

const hash = (v: string) => createHash('sha256').update(v).digest('hex');
const DAY = 86400000;
export const guardianRules = {
  /** Younger applicants need a parent or guardian to hold the account instead. */
  minimumAge: 13,
  /** An account that is never approved is erased after this many days. */
  approvalDays: 14,
  /** How long an approval link works. */
  linkDays: 7,
  /** The guardian's manage link keeps working this long after the applicant turns 18. */
  manageGraceDays: 30,
  resendPerDay: 5,
};
const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
const today = (now = Date.now()) =>
  new Date(now).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

/**
 * From a month of birth (YYYY-MM), the first day on which the applicant is certainly a given
 * age: the first day of the month after their birth month. Only this date is stored.
 */
export function certainlyAged(birthMonth: string, years: number) {
  const [y, m] = birthMonth.split('-').map(Number);
  return new Date(Date.UTC(y + years, m, 1)).toISOString().slice(0, 10);
}

interface GuardianRecord extends GuardianState {
  requestId: string;
  sentOn?: string;
  sentToday?: number;
  lastSentAt?: number;
}

/**
 * Under-18 applicants (plan JF-04-06). The account exists, but no documents, applications or
 * other personal processing are possible until a parent or guardian approves by email. The
 * guardian can withdraw later, which erases the account. Approval lapses when the applicant
 * turns 18; accounts never approved are erased after `approvalDays`.
 */
export function createGuardianService(
  store: Store,
  deps: {
    origin: string;
    mail: {
      configured: boolean;
      queue: (userId: string, kind: string, payload: Record<string, unknown>) => unknown;
      register: (kind: string, composer: MailComposer) => void;
    };
    eraseAccount: (userId: string) => void;
  },
) {
  store.db.exec(
    'CREATE TABLE IF NOT EXISTS guardianship(userId TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,status TEXT NOT NULL,payload TEXT NOT NULL)',
  );
  const origin = new URL(deps.origin).origin;
  function load(userId: string): GuardianRecord | undefined {
    const row = store.db.prepare('SELECT payload FROM guardianship WHERE userId=?').get(userId) as
      { payload: string } | undefined;
    return row && JSON.parse(row.payload);
  }
  function save(userId: string, record: GuardianRecord) {
    store.db
      .prepare(
        'INSERT INTO guardianship VALUES(?,?,?) ON CONFLICT(userId) DO UPDATE SET status=excluded.status,payload=excluded.payload',
      )
      .run(userId, record.status, JSON.stringify(record));
  }
  const applicant = (userId: string) =>
    store.db.prepare('SELECT name,email FROM users WHERE id=?').get(userId) as
      { name: string; email: string } | undefined;
  /** The applicant's guardian state, or undefined once they are 18 (approval then lapses). */
  function describe(userId: string, now = Date.now()): GuardianState | undefined {
    const record = load(userId);
    if (!record) return undefined;
    if (record.adultOn <= today(now)) {
      store.db.transaction(() => {
        store.db.prepare('DELETE FROM guardianship WHERE userId=?').run(userId);
        store.db
          .prepare("DELETE FROM account_tokens WHERE userId=? AND purpose LIKE 'guardian%'")
          .run(userId);
        store.audit(userId, 'guardian.ended.adult', userId);
      })();
      return undefined;
    }
    const { requestId: _r, sentOn: _s, sentToday: _t, lastSentAt: _l, ...state } = record;
    return state;
  }
  const blocks = (userId: string) => {
    const state = describe(userId);
    return !!state && state.status !== 'approved';
  };
  /** Queues the approval email. A new address may be used at once; resends wait a minute. */
  function request(userId: string, record: GuardianRecord, now = Date.now(), resend = false) {
    const day = today(now);
    const sentToday = record.sentOn === day ? record.sentToday || 0 : 0;
    if (resend && record.lastSentAt && now - record.lastSentAt < 60000)
      throw Object.assign(Error('Wait a minute before sending the request again.'), {
        status: 429,
      });
    if (sentToday >= guardianRules.resendPerDay)
      throw Object.assign(Error('That is enough requests for today. Try again tomorrow.'), {
        status: 429,
      });
    save(userId, { ...record, sentOn: day, sentToday: sentToday + 1, lastSentAt: now });
    deps.mail.queue(userId, 'guardian_request', {
      requestId: record.requestId,
      expiresAt: now + guardianRules.linkDays * DAY,
    });
  }
  function create(
    userId: string,
    input: { birthMonth: string; guardianEmail: string },
    now = Date.now(),
  ) {
    const record: GuardianRecord = {
      status: 'pending',
      guardianEmail: input.guardianEmail,
      adultOn: certainlyAged(input.birthMonth, 18),
      requestedAt: new Date(now).toISOString(),
      deleteAfter: today(now + guardianRules.approvalDays * DAY),
      requestId: randomUUID(),
    };
    save(userId, record);
    store.audit(userId, 'guardian.requested', userId);
    request(userId, record, now);
  }
  /** Checks a month of birth for an under-18 registration; returns an error message or ''. */
  function eligibility(birthMonth: string, now = Date.now()) {
    if (certainlyAged(birthMonth, guardianRules.minimumAge) > today(now))
      return `JKY-Folder is for applicants aged ${guardianRules.minimumAge} and over. A parent or guardian can create an account and add your documents instead.`;
    if (certainlyAged(birthMonth, 18) <= today(now))
      return 'From that month of birth you are already 18. Choose “I am 18 or older”.';
    return '';
  }
  function issue(userId: string, purpose: string, expiresAt: number, fingerprint: string) {
    const token = randomBytes(32).toString('hex');
    store.db
      .prepare('INSERT INTO account_tokens VALUES(?,?,?,?,?)')
      .run(hash(token), userId, purpose, expiresAt, fingerprint);
    return { token, tokenHash: hash(token) };
  }
  const first = (name: string) => name.split(/\s+/)[0];
  deps.mail.register('guardian_request', (row, now) => {
    const record = load(row.userId),
      who = applicant(row.userId);
    if (
      !record ||
      !who ||
      record.status !== 'pending' ||
      record.requestId !== row.payload.requestId
    )
      return null;
    const { token, tokenHash } = issue(
      row.userId,
      'guardian_approve',
      Math.min(Number(row.payload.expiresAt), now + guardianRules.linkDays * DAY),
      record.requestId,
    );
    return {
      to: record.guardianEmail,
      subject: `Please approve ${first(who.name)}’s JKY-Folder account`,
      tokenHash,
      text: [
        `${who.name} (${who.email}) created a JKY-Folder account and named you as their parent or guardian.`,
        '',
        `JKY-Folder helps students prepare the documents for college, scholarship and job applications. Because ${first(who.name)} is under 18, they can add documents only after you approve.`,
        '',
        `Review the request, then approve or decline it: ${origin}/#guardian=${token}`,
        '',
        `This link works for ${guardianRules.linkDays} days. If you do not recognise this request, ignore this email or choose “Don’t approve”. Accounts that are not approved are deleted after ${guardianRules.approvalDays} days.`,
      ].join('\n'),
    };
  });
  deps.mail.register('guardian_confirmed', (row) => {
    const record = load(row.userId),
      who = applicant(row.userId);
    if (
      !record ||
      !who ||
      record.status !== 'approved' ||
      record.requestId !== row.payload.requestId
    )
      return null;
    const { token, tokenHash } = issue(
      row.userId,
      'guardian_manage',
      Date.parse(record.adultOn) + guardianRules.manageGraceDays * DAY,
      record.requestId,
    );
    return {
      to: record.guardianEmail,
      subject: `You approved ${first(who.name)}’s JKY-Folder account`,
      tokenHash,
      text: [
        `Thank you. ${who.name} can now add their application documents to JKY-Folder.`,
        '',
        `Keep this email. Until ${first(who.name)} turns 18, this link shows your approval and lets you withdraw it: ${origin}/#guardian-manage=${token}`,
        '',
        `Withdrawing deletes ${first(who.name)}’s account and every document in it. That cannot be undone.`,
      ].join('\n'),
    };
  });
  function byToken(token: string, purpose: 'guardian_approve' | 'guardian_manage') {
    const row = store.db
      .prepare(
        'SELECT userId,passwordFingerprint FROM account_tokens WHERE hash=? AND purpose=? AND expiresAt>?',
      )
      .get(hash(token), purpose, Date.now()) as
      { userId: string; passwordFingerprint: string } | undefined;
    const state = row && describe(row.userId);
    const record = row && load(row.userId);
    if (!row || !state || !record || record.requestId !== row.passwordFingerprint) return null;
    return { userId: row.userId, record, who: applicant(row.userId)! };
  }
  const view = (found: NonNullable<ReturnType<typeof byToken>>) => ({
    applicant: { name: found.who.name, email: found.who.email },
    status: found.record.status,
    adultOn: found.record.adultOn,
    requestedAt: found.record.requestedAt,
    decidedAt: found.record.decidedAt || null,
    guardianName: found.record.guardianName || null,
    relationship: found.record.relationship || null,
  });
  function publicRoutes(
    app: Express,
    limit: RequestHandler,
    fail: (s: number, m: string) => Error,
  ) {
    const expired = 'This link is invalid or has expired. Ask the applicant to send a new request.';
    app.post('/api/guardian/lookup', limit, (req, res) => {
      const { token, purpose } = z
        .object({ token: tokenSchema, purpose: z.enum(['approve', 'manage']) })
        .strict()
        .parse(req.body);
      const found = byToken(token, purpose === 'approve' ? 'guardian_approve' : 'guardian_manage');
      if (!found) throw fail(400, expired);
      res.json(view(found));
    });
    app.post('/api/guardian/approve', limit, (req, res) => {
      const input = z
        .object({
          token: tokenSchema,
          guardianName: z.string().trim().min(2).max(80),
          relationship: z.enum(['parent', 'guardian']),
          consent: z.literal(true),
        })
        .strict()
        .parse(req.body);
      const found = byToken(input.token, 'guardian_approve');
      if (!found || found.record.status !== 'pending') throw fail(400, expired);
      const record: GuardianRecord = {
        ...found.record,
        status: 'approved',
        guardianName: input.guardianName,
        relationship: input.relationship,
        decidedAt: new Date().toISOString(),
      };
      store.db.transaction(() => {
        save(found.userId, record);
        store.db
          .prepare("DELETE FROM account_tokens WHERE userId=? AND purpose='guardian_approve'")
          .run(found.userId);
        store.audit(found.userId, 'guardian.approved', found.userId);
      })();
      deps.mail.queue(found.userId, 'guardian_confirmed', {
        requestId: record.requestId,
        expiresAt: Date.now() + guardianRules.linkDays * DAY,
      });
      res.json({
        ...view({ ...found, record }),
        message: `Approved. ${first(found.who.name)} can now add documents. We have emailed you a link to manage or withdraw this approval.`,
      });
    });
    app.post('/api/guardian/decline', limit, (req, res) => {
      const { token } = z.object({ token: tokenSchema }).strict().parse(req.body);
      const found = byToken(token, 'guardian_approve');
      if (!found || found.record.status !== 'pending') throw fail(400, expired);
      store.db.transaction(() => {
        save(found.userId, {
          ...found.record,
          status: 'declined',
          decidedAt: new Date().toISOString(),
        });
        store.db
          .prepare("DELETE FROM account_tokens WHERE userId=? AND purpose='guardian_approve'")
          .run(found.userId);
        store.audit(found.userId, 'guardian.declined', found.userId);
      })();
      res.json({
        message: `You did not approve this account. ${first(found.who.name)} cannot add documents, and the account is deleted on ${found.record.deleteAfter} unless another parent or guardian approves it.`,
      });
    });
    app.post('/api/guardian/withdraw', limit, (req, res) => {
      const { token } = z
        .object({ token: tokenSchema, confirmation: z.literal('WITHDRAW') })
        .strict()
        .parse(req.body);
      const found = byToken(token, 'guardian_manage');
      if (!found || found.record.status !== 'approved') throw fail(400, expired);
      deps.eraseAccount(found.userId);
      res.json({
        message: `Consent withdrawn. ${first(found.who.name)}’s account and all of its documents have been deleted.`,
      });
    });
  }
  function privateRoutes(
    app: Express,
    owner: (req: Request) => string,
    fail: (s: number, m: string) => Error,
  ) {
    app.get('/api/guardian', (req, res) => res.json(describe(owner(req)) || null));
    const send = (userId: string, record: GuardianRecord, resend: boolean) => {
      try {
        request(userId, record, Date.now(), resend);
      } catch (error) {
        const status = (error as { status?: number }).status;
        if (status) throw fail(status, (error as Error).message);
        throw error;
      }
    };
    app.post('/api/guardian/resend', (req, res) => {
      const userId = owner(req);
      const record = describe(userId) && load(userId);
      if (!record || record.status !== 'pending')
        throw fail(400, 'There is no request waiting for approval.');
      send(userId, record, true);
      res.json({ ...describe(userId), message: `Request sent again to ${record.guardianEmail}.` });
    });
    app.put('/api/guardian/email', (req, res) => {
      const userId = owner(req);
      const { guardianEmail } = z
        .object({
          guardianEmail: z
            .email()
            .max(254)
            .transform((v) => v.toLowerCase().trim()),
        })
        .strict()
        .parse(req.body);
      const record = describe(userId) && load(userId);
      if (!record || record.status === 'approved')
        throw fail(400, 'Your account is already approved.');
      if (guardianEmail === applicant(userId)?.email)
        throw fail(400, 'Use your parent’s or guardian’s own email address, not yours.');
      // A new address starts a new request; links already sent stop working.
      const next: GuardianRecord = {
        ...record,
        status: 'pending',
        guardianEmail,
        requestId: randomUUID(),
        decidedAt: undefined,
      };
      store.db
        .prepare("DELETE FROM account_tokens WHERE userId=? AND purpose='guardian_approve'")
        .run(userId);
      store.audit(userId, 'guardian.requested', userId);
      send(userId, next, false);
      res.json({ ...describe(userId), message: `Request sent to ${guardianEmail}.` });
    });
  }
  /** Erases accounts whose approval never came. */
  function sweep(now = Date.now()) {
    const rows = store.db
      .prepare("SELECT userId,payload FROM guardianship WHERE status<>'approved'")
      .all() as { userId: string; payload: string }[];
    for (const row of rows)
      if ((JSON.parse(row.payload) as GuardianRecord).deleteAfter <= today(now))
        deps.eraseAccount(row.userId);
  }
  /** What a waiting applicant may still do: see their status, manage or delete the account. */
  function allowedWhileWaiting(req: Request) {
    const path = req.path.replace(/^\/api/, '');
    if (path === '/guardian' || path.startsWith('/guardian/')) return true;
    if (req.method === 'GET')
      return ['/me', '/activity', '/account/email-status', '/packets', '/library'].includes(path);
    return (
      (req.method === 'POST' &&
        ['/auth/logout', '/account/password', '/account/signout-others'].includes(path)) ||
      (req.method === 'PATCH' && path === '/account') ||
      (req.method === 'DELETE' && path === '/account')
    );
  }
  return {
    describe,
    blocks,
    create,
    eligibility,
    sweep,
    publicRoutes,
    privateRoutes,
    allowedWhileWaiting,
    configured: deps.mail.configured,
  };
}
