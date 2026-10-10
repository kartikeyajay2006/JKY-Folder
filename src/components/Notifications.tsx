import { useEffect, useState } from 'react';
import { api, body } from '../api';
import type { NotificationPreferences, Reminder } from '../../shared/model';
export function Notifications({
  userId,
  preferences = false,
  onOpen,
}: {
  userId: string;
  preferences?: boolean;
  onOpen?: (id: string) => void;
}) {
  const [items, setItems] = useState<Reminder[]>([]),
    [prefs, setPrefs] = useState<NotificationPreferences | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all([
      api<Reminder[]>('/notifications'),
      api<NotificationPreferences>('/notification-preferences'),
    ])
      .then(([items, prefs]) => {
        if (alive) {
          setItems(items);
          setPrefs(prefs);
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [userId]);
  if (!preferences && !items.some((i) => !i.readAt) && !error) return null;
  async function save(next: NotificationPreferences) {
    const previous = prefs;
    setBusy(true);
    setError('');
    setPrefs(next);
    try {
      await api('/notification-preferences', { method: 'PUT', body: body(next) });
      setPrefs(next);
      setItems(await api('/notifications'));
    } catch (e) {
      setPrefs(previous);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="sheet reminders">
      <h2>{preferences ? 'Reminder preferences' : 'Reminders'}</h2>
      {preferences && prefs && (
        <fieldset>
          <legend>Show in-app reminders</legend>
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={prefs.deadlines}
              disabled={busy}
              onChange={(e) => void save({ ...prefs, deadlines: e.target.checked })}
            />
            Application deadlines
          </label>
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={prefs.sourceChanges}
              disabled={busy}
              onChange={(e) => void save({ ...prefs, sourceChanges: e.target.checked })}
            />
            Source and checklist changes
          </label>
          <p className="field-help">
            Reminders appear when you open your workspace. Deadlines use Asia/Kolkata. Email and
            push delivery are not enabled.
          </p>
        </fieldset>
      )}
      <ul>
        {items
          .filter((i) => !i.readAt)
          .map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
              {onOpen && (
                <button className="text-link" onClick={() => onOpen(item.packetId)}>
                  Open application
                </button>
              )}
              <button
                className="text-link"
                onClick={async () => {
                  try {
                    await api(`/notifications/${encodeURIComponent(item.id)}/read`, {
                      method: 'POST',
                      body: body({}),
                    });
                    setItems((previous) =>
                      previous.map((i) =>
                        i.id === item.id ? { ...i, readAt: new Date().toISOString() } : i,
                      ),
                    );
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Mark read
              </button>
            </li>
          ))}
      </ul>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
