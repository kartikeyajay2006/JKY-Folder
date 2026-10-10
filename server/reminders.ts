import type { Store } from './store';
import type { NotificationPreferences, Packet, Reminder } from '../shared/model';
import { digest, resolvePack, sourceChanged } from './rule-packs';
export function preferences(store: Store, userId: string): NotificationPreferences {
  const row = store.db
    .prepare('SELECT payload FROM notification_preferences WHERE userId=?')
    .get(userId) as { payload: string } | undefined;
  return row ? JSON.parse(row.payload) : { deadlines: true, sourceChanges: true };
}
export function refreshReminders(store: Store, userId: string, now = new Date()) {
  const prefs = preferences(store, userId);
  const today = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const packets = (
    store.db.prepare('SELECT payload FROM packets WHERE userId=?').all(userId) as {
      payload: string;
    }[]
  ).map((r) => JSON.parse(r.payload) as Packet);
  for (const p of packets.filter((p) => !p.archived)) {
    const save = (kind: Reminder['kind'], key: string, message: string) => {
      const id = `${p.id}:${kind}:${key}`;
      const reminder: Reminder = {
        id,
        packetId: p.id,
        kind,
        title: p.title,
        message,
        createdAt: now.toISOString(),
      };
      store.db
        .prepare('INSERT OR IGNORE INTO reminders VALUES(?,?,?,?)')
        .run(id, userId, p.id, JSON.stringify(reminder));
    };
    if (prefs.deadlines && p.deadline) {
      const days = Math.round((Date.parse(p.deadline) - Date.parse(today)) / 86400000);
      if (days >= 0 && days <= 7)
        save(
          'deadline',
          `${p.deadline}:${days === 0 ? 'today' : days === 1 ? 'tomorrow' : 'week'}`,
          `Application deadline: ${p.deadline} (Asia/Kolkata). ${days === 0 ? 'Due today.' : days === 1 ? 'Due tomorrow.' : 'Due within seven days.'}`,
        );
    }
    if (prefs.sourceChanges && sourceChanged(store, p))
      save(
        'source_changed',
        digest(
          JSON.stringify([
            resolvePack(store, p).version,
            store.db.prepare('SELECT id,payload FROM source_snapshots ORDER BY id').all(),
          ]),
        ).slice(0, 16),
        'The checklist or its captured official source changed. Your earlier reports are historical; review the source update before continuing.',
      );
  }
  return (
    store.db
      .prepare('SELECT payload FROM reminders WHERE userId=? ORDER BY rowid DESC LIMIT 100')
      .all(userId) as { payload: string }[]
  )
    .map((r) => JSON.parse(r.payload) as Reminder)
    .filter((r) => (r.kind === 'deadline' ? prefs.deadlines : prefs.sourceChanges));
}
