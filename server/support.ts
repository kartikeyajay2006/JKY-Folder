import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Express, Request } from 'express';
import type { Store } from './store';
import type { EvaluationRun, Packet } from '../shared/model';

/**
 * Support requests with applicant-controlled access (plan JF-05-04). A request carries a
 * reference to the application, never document attachments. Support can read a redacted
 * summary only while the applicant's time-limited grant for that application is active, and
 * every read is recorded in the applicant's own activity.
 */
export const SUPPORT_CATEGORIES = {
  result_wrong: { label: 'A checklist result looks wrong', priority: 'high' },
  privacy: { label: 'Privacy, deletion or a security concern', priority: 'high' },
  technical: { label: 'Something is not working', priority: 'normal' },
  rules_question: { label: 'A question about requirements or instructions', priority: 'normal' },
  account: { label: 'Account or sign-in', priority: 'normal' },
} as const;
export type SupportCategory = keyof typeof SUPPORT_CATEGORIES;
const GRANT_HOURS = [24, 72] as const;

export interface SupportTicket {
  id: string;
  reference: string;
  category: SupportCategory;
  priority: 'high' | 'normal';
  summary: string;
  details: string;
  packetId: string | null;
  runId: string | null;
  status: 'open' | 'closed';
  createdAt: string;
  closedAt?: string;
  grant?: { id: string; expiresAt: string; revokedAt?: string; active: boolean };
}

export function registerSupport(store: Store) {
  store.db
    .exec(`CREATE TABLE IF NOT EXISTS support_tickets(id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,packetId TEXT REFERENCES packets(id) ON DELETE SET NULL,payload TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS support_owner ON support_tickets(userId);
  CREATE TABLE IF NOT EXISTS support_grants(id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,ticketId TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,packetId TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,expiresAt INTEGER NOT NULL,revokedAt INTEGER);`);
  const grantFor = (ticketId: string, now = Date.now()) => {
    const row = store.db
      .prepare(
        'SELECT id,expiresAt,revokedAt FROM support_grants WHERE ticketId=? ORDER BY rowid DESC LIMIT 1',
      )
      .get(ticketId) as { id: string; expiresAt: number; revokedAt: number | null } | undefined;
    return row
      ? {
          id: row.id,
          expiresAt: new Date(row.expiresAt).toISOString(),
          ...(row.revokedAt ? { revokedAt: new Date(row.revokedAt).toISOString() } : {}),
          active: !row.revokedAt && row.expiresAt > now,
        }
      : undefined;
  };
  const tickets = (userId: string) =>
    (
      store.db
        .prepare('SELECT payload FROM support_tickets WHERE userId=? ORDER BY rowid DESC LIMIT 50')
        .all(userId) as { payload: string }[]
    ).map((r) => {
      const t = JSON.parse(r.payload) as SupportTicket;
      return { ...t, grant: grantFor(t.id) };
    });
  function routes(
    app: Express,
    user: (req: Request) => { id: string; demo: boolean },
    owned: (userId: string, packetId: string) => Packet | undefined,
    audit: (userId: string, action: string, objectId: string) => void,
    fail: (status: number, message: string) => Error,
  ) {
    app.get('/api/support/tickets', (req, res) => res.json(tickets(user(req).id)));
    app.post('/api/support/tickets', (req, res) => {
      const input = z
        .object({
          category: z.enum(
            Object.keys(SUPPORT_CATEGORIES) as [SupportCategory, ...SupportCategory[]],
          ),
          summary: z.string().trim().min(5).max(140),
          details: z.string().trim().max(2000).default(''),
          packetId: z.string().uuid().optional(),
          runId: z.string().max(80).optional(),
          grantHours: z.union([z.literal(0), ...GRANT_HOURS.map((h) => z.literal(h))]).default(0),
        })
        .strict()
        .parse(req.body);
      const me = user(req);
      if (
        (
          store.db
            .prepare(
              "SELECT COUNT(*) AS n FROM support_tickets WHERE userId=? AND json_extract(payload,'$.status')='open'",
            )
            .get(me.id) as { n: number }
        ).n >= 10
      )
        throw fail(400, 'You have ten open requests. Wait for an answer before adding more.');
      const packet = input.packetId ? owned(me.id, input.packetId) : undefined;
      if (input.packetId && !packet) throw fail(404, 'Application not found.');
      if (input.grantHours && !packet) throw fail(400, 'Choose the application support may view.');
      if (input.grantHours && me.demo)
        throw fail(400, 'Demo workspaces cannot share access. Describe the problem instead.');
      if (
        input.runId &&
        !store.runs(packet?.id || '').some((r: EvaluationRun) => r.id === input.runId)
      )
        throw fail(400, 'That report does not belong to this application.');
      const id = randomUUID();
      const ticket: SupportTicket = {
        id,
        reference: 'JKY-' + id.slice(0, 8).toUpperCase(),
        category: input.category,
        priority: SUPPORT_CATEGORIES[input.category].priority,
        summary: input.summary,
        details: input.details,
        packetId: packet?.id || null,
        runId: input.runId || null,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      store.db.transaction(() => {
        store.db
          .prepare('INSERT INTO support_tickets VALUES(?,?,?,?)')
          .run(id, me.id, ticket.packetId, JSON.stringify(ticket));
        audit(me.id, 'support.requested', id);
        if (input.grantHours && packet) {
          store.db
            .prepare('INSERT INTO support_grants VALUES(?,?,?,?,?,NULL)')
            .run(randomUUID(), me.id, id, packet.id, Date.now() + input.grantHours * 3600000);
          audit(me.id, 'support.access.granted', packet.id);
        }
      })();
      res.status(201).json({ ...ticket, grant: grantFor(id) });
    });
    app.post('/api/support/tickets/:ticketId/revoke', (req, res) => {
      const me = user(req);
      const row = store.db
        .prepare('SELECT id FROM support_tickets WHERE id=? AND userId=?')
        .get(String(req.params.ticketId), me.id);
      if (!row) throw fail(404, 'Support request not found.');
      const changed = store.db
        .prepare(
          'UPDATE support_grants SET revokedAt=? WHERE ticketId=? AND revokedAt IS NULL AND expiresAt>?',
        )
        .run(Date.now(), String(req.params.ticketId), Date.now()).changes;
      if (changed) audit(me.id, 'support.access.revoked', String(req.params.ticketId));
      res.json(tickets(me.id).find((t) => t.id === req.params.ticketId));
    });
  }
  return { routes, grantFor };
}

/**
 * The redacted view an operator may read for one request. Without an active grant only the
 * request itself is available. With one: checklist states, file metadata and the latest report
 * summary — never extracted text, review notes, facts or file bytes.
 */
export function supportView(store: Store, ticketId: string, operator: string, now = Date.now()) {
  if (operator.trim().length < 2) throw Error('Name the operator reading this request.');
  const row = store.db
    .prepare(
      "SELECT userId,payload FROM support_tickets WHERE id=? OR json_extract(payload,'$.reference')=?",
    )
    .get(ticketId, ticketId) as { userId: string; payload: string } | undefined;
  if (!row) throw Error('No such support request.');
  const ticket = JSON.parse(row.payload) as SupportTicket;
  const grant = store.db
    .prepare(
      'SELECT packetId,expiresAt FROM support_grants WHERE ticketId=? AND revokedAt IS NULL AND expiresAt>? ORDER BY rowid DESC LIMIT 1',
    )
    .get(ticket.id, now) as { packetId: string; expiresAt: number } | undefined;
  const request = {
    reference: ticket.reference,
    category: SUPPORT_CATEGORIES[ticket.category].label,
    priority: ticket.priority,
    status: ticket.status,
    summary: ticket.summary,
    details: ticket.details,
    createdAt: ticket.createdAt,
  };
  if (!grant) return { request, access: 'none' as const };
  const packet = store.packet(grant.packetId, row.userId);
  if (!packet) return { request, access: 'none' as const };
  const documents = store.documents(packet.id);
  const run = store.runs(packet.id)[0];
  store.audit(row.userId, 'support.access.used', packet.id);
  return {
    request,
    access: 'granted' as const,
    accessExpiresAt: new Date(grant.expiresAt).toISOString(),
    application: {
      title: packet.title,
      deadline: packet.deadline || null,
      revision: packet.revision,
      documents: documents.map((d) => ({
        name: d.name,
        mime: d.mime,
        size: d.size,
        status: d.status,
        pageCount: d.pageCount,
      })),
      latestReport: run
        ? {
            createdAt: run.createdAt,
            summary: run.summary,
            counts: run.counts,
            checks: run.checks.map((c) => ({ title: c.title, state: c.state, reason: c.reason })),
          }
        : null,
    },
  };
}

/** Closes a request and ends any access that is still open for it. */
export function closeTicket(store: Store, ticketId: string, operator: string) {
  if (operator.trim().length < 2) throw Error('Name the operator closing this request.');
  const row = store.db
    .prepare(
      "SELECT id,userId,payload FROM support_tickets WHERE id=? OR json_extract(payload,'$.reference')=?",
    )
    .get(ticketId, ticketId) as { id: string; userId: string; payload: string } | undefined;
  if (!row) throw Error('No such support request.');
  const ticket = {
    ...(JSON.parse(row.payload) as SupportTicket),
    status: 'closed' as const,
    closedAt: new Date().toISOString(),
  };
  store.db.transaction(() => {
    store.db
      .prepare('UPDATE support_tickets SET payload=? WHERE id=?')
      .run(JSON.stringify(ticket), row.id);
    store.db
      .prepare('UPDATE support_grants SET revokedAt=? WHERE ticketId=? AND revokedAt IS NULL')
      .run(Date.now(), row.id);
    store.audit(row.userId, 'support.closed', row.id);
  })();
  return ticket;
}

/** Open requests, most urgent first, without any application content. */
export function supportQueue(store: Store) {
  return (store.db.prepare('SELECT payload FROM support_tickets').all() as { payload: string }[])
    .map((r) => JSON.parse(r.payload) as SupportTicket)
    .filter((t) => t.status === 'open')
    .sort((a, b) =>
      a.priority === b.priority
        ? a.createdAt.localeCompare(b.createdAt)
        : a.priority === 'high'
          ? -1
          : 1,
    )
    .map((t) => ({
      reference: t.reference,
      priority: t.priority,
      category: SUPPORT_CATEGORIES[t.category].label,
      summary: t.summary,
      createdAt: t.createdAt,
    }));
}
