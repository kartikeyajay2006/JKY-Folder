import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Express, Request } from 'express';
import type { Store } from './store';
import { refreshReminders } from './reminders';
import type { Reminder } from '../shared/model';
import {
  allowedEndpoint,
  fetchSender,
  fromB64url,
  loadVapidKeys,
  type PushSender,
  type PushSubscription,
} from './web-push';

interface SubscriptionRow extends PushSubscription {
  id: string;
  userId: string;
  failures: number;
}
const MAX_DEVICES = 10;
const RECENT_MS = 7 * 86400000;
const key = (bytes: number) =>
  z
    .string()
    .max(200)
    .refine((v) => /^[A-Za-z0-9_-]+$/.test(v) && fromB64url(v).length === bytes, 'Invalid key.');
const subscriptionSchema = z
  .object({
    endpoint: z.string().max(2048).refine(allowedEndpoint, 'Unsupported push service.'),
    expirationTime: z.number().nullable().optional(),
    keys: z.object({ p256dh: key(65), auth: key(16) }).strict(),
  })
  .strict();

/** Lock-screen text stays generic: no application titles, filenames or extracted facts. */
export function pushMessage(reminder: Pick<Reminder, 'kind' | 'packetId' | 'id'>) {
  return JSON.stringify({
    title: 'JKY-Folder reminder',
    body:
      reminder.kind === 'deadline'
        ? 'An application deadline is coming up. Open JKY-Folder to see which one.'
        : 'A checklist or its official source changed. Review it before you continue.',
    url: `/?application=${reminder.packetId}`,
    tag: reminder.id,
  });
}

export function createPushService(
  store: Store,
  options: { dataDir: string; background?: boolean; send?: PushSender },
) {
  store.db
    .exec(`CREATE TABLE IF NOT EXISTS push_subscriptions(id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,endpoint TEXT NOT NULL UNIQUE,p256dh TEXT NOT NULL,auth TEXT NOT NULL,createdAt TEXT NOT NULL,failures INTEGER NOT NULL DEFAULT 0);
  CREATE INDEX IF NOT EXISTS push_owner ON push_subscriptions(userId);
  CREATE TABLE IF NOT EXISTS push_deliveries(reminderId TEXT NOT NULL,subscriptionId TEXT NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,sentAt TEXT NOT NULL,PRIMARY KEY(reminderId,subscriptionId));`);
  const keys = loadVapidKeys(options.dataDir);
  const send = options.send || fetchSender(keys);
  let stopped = false,
    busy = false;
  const devices = (userId: string) =>
    store.db
      .prepare(
        'SELECT id,userId,endpoint,p256dh,auth,failures FROM push_subscriptions WHERE userId=?',
      )
      .all(userId) as SubscriptionRow[];
  /** Delivers to one device and records the outcome. Returns whether it was delivered. */
  async function deliver(device: SubscriptionRow, payload: string, topic: string) {
    let status = 0;
    try {
      status = await send(device, payload, { ttl: 86400, urgency: 'normal', topic });
    } catch {
      status = 0;
    }
    if (status === 404 || status === 410) {
      // The browser revoked this subscription; forget it.
      store.db.prepare('DELETE FROM push_subscriptions WHERE id=?').run(device.id);
      return false;
    }
    if (status >= 200 && status < 300) {
      store.db.prepare('UPDATE push_subscriptions SET failures=0 WHERE id=?').run(device.id);
      return true;
    }
    const failures = device.failures + 1;
    if (failures >= 5) store.db.prepare('DELETE FROM push_subscriptions WHERE id=?').run(device.id);
    else
      store.db
        .prepare('UPDATE push_subscriptions SET failures=? WHERE id=?')
        .run(failures, device.id);
    return false;
  }
  /** One worker pass: every unread, current reminder reaches each subscribed device once. */
  async function tick(now = Date.now()) {
    if (stopped || busy) return;
    busy = true;
    try {
      const users = store.db.prepare('SELECT DISTINCT userId FROM push_subscriptions').all() as {
        userId: string;
      }[];
      for (const { userId } of users) {
        if (stopped) break;
        const reminders = refreshReminders(store, userId, new Date(now)).filter(
          (r) => !r.readAt && now - Date.parse(r.createdAt) < RECENT_MS,
        );
        for (const reminder of reminders)
          for (const device of devices(userId)) {
            const done = store.db
              .prepare('SELECT 1 FROM push_deliveries WHERE reminderId=? AND subscriptionId=?')
              .get(reminder.id, device.id);
            if (done) continue;
            const topic = createHash('sha256').update(reminder.id).digest('base64url').slice(0, 32);
            if (await deliver(device, pushMessage(reminder), topic))
              store.db
                .prepare('INSERT OR IGNORE INTO push_deliveries VALUES(?,?,?)')
                .run(reminder.id, device.id, new Date(now).toISOString());
          }
      }
    } finally {
      busy = false;
    }
  }
  const timer =
    options.background !== false
      ? setInterval(() => void tick().catch(() => console.error('push.worker_failed')), 60000)
      : undefined;
  timer?.unref();
  function routes(
    app: Express,
    user: (req: Request) => { id: string },
    audit: (userId: string, action: string, objectId: string) => void,
    fail: (status: number, message: string) => Error,
  ) {
    app.get('/api/push', (req, res) =>
      res.json({ publicKey: keys.publicKey, devices: devices(user(req).id).length }),
    );
    app.post('/api/push/subscriptions', (req, res) => {
      const input = subscriptionSchema.parse(req.body),
        userId = user(req).id;
      const existing = store.db
        .prepare('SELECT id,userId FROM push_subscriptions WHERE endpoint=?')
        .get(input.endpoint) as { id: string; userId: string } | undefined;
      if (!existing && devices(userId).length >= MAX_DEVICES)
        throw fail(400, `Notifications can be on for up to ${MAX_DEVICES} browsers.`);
      store.db.transaction(() => {
        // A browser signed into a different account here belongs to the current account now.
        if (existing)
          store.db.prepare('DELETE FROM push_subscriptions WHERE id=?').run(existing.id);
        store.db
          .prepare('INSERT INTO push_subscriptions VALUES(?,?,?,?,?,?,0)')
          .run(
            existing?.userId === userId ? existing.id : randomUUID(),
            userId,
            input.endpoint,
            input.keys.p256dh,
            input.keys.auth,
            new Date().toISOString(),
          );
      })();
      audit(userId, 'push.subscribed', userId);
      res.status(201).json({ devices: devices(userId).length });
    });
    app.delete('/api/push/subscriptions', (req, res) => {
      const { endpoint } = z
        .object({ endpoint: z.string().max(2048) })
        .strict()
        .parse(req.body);
      const removed = store.db
        .prepare('DELETE FROM push_subscriptions WHERE endpoint=? AND userId=?')
        .run(endpoint, user(req).id).changes;
      if (removed) audit(user(req).id, 'push.unsubscribed', user(req).id);
      res.json({ devices: devices(user(req).id).length });
    });
    app.post('/api/push/test', async (req, res) => {
      const list = devices(user(req).id);
      if (!list.length) throw fail(400, 'Turn on notifications in this browser first.');
      let sent = 0;
      for (const device of list)
        if (
          await deliver(
            device,
            JSON.stringify({
              title: 'JKY-Folder notifications are on',
              body: 'Reminders will reach this browser even when JKY-Folder is closed.',
              url: '/?view=settings',
              tag: 'test',
            }),
            'test',
          )
        )
          sent++;
      res.json({ sent, failed: list.length - sent });
    });
  }
  return {
    publicKey: keys.publicKey,
    tick,
    routes,
    stop: () => {
      stopped = true;
      if (timer) clearInterval(timer);
    },
  };
}
