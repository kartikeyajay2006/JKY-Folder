import { useEffect, useState } from 'react';
import { api, body } from '../api';
import type { NotificationPreferences, Reminder } from '../../shared/model';
import { PushSettings } from './PushSettings';
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
    [busy, setBusy] = useState(false),
    [delivery, setDelivery] = useState<{
      configured: boolean;
      delivery?: 'smtp' | 'outbox' | null;
      verified: boolean;
      failed: number;
    } | null>(null),
    [message, setMessage] = useState('');
  useEffect(() => {
    let alive = true;
    Promise.all([
      api<Reminder[]>('/notifications'),
      api<NotificationPreferences>('/notification-preferences'),
      api<{ configured: boolean; verified: boolean; failed: number }>('/account/email-status'),
    ])
      .then(([items, prefs, status]) => {
        if (alive) {
          setItems(items);
          setPrefs(prefs);
          setDelivery(status);
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
            Reminders are generated in the background while the server is running. Deadlines use
            Asia/Kolkata. Enable email delivery below to receive them with the browser closed.
          </p>
        </fieldset>
      )}
      {preferences && prefs && <PushSettings />}
      {preferences && prefs && delivery && (
        <fieldset>
          <legend>Background email reminders</legend>
          <p className="field-help">
            {delivery.delivery === 'outbox'
              ? 'Development mode: emails are saved to this server’s local outbox instead of being sent. Read them with npm run outbox.'
              : !delivery.configured
                ? 'Email delivery needs administrator configuration.'
                : delivery.verified
                  ? 'Your email is verified.'
                  : 'Verify your email address before enabling delivery.'}
          </p>
          {delivery.configured && !delivery.verified && (
            <button
              className="outline"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                setError('');
                void api('/account/verify-email', { method: 'POST', body: body({}) })
                  .then(() =>
                    setMessage('Verification link queued. Check your inbox and spam folder.'),
                  )
                  .catch((e) => setError(e.message))
                  .finally(() => setBusy(false));
              }}
            >
              Send verification link
            </button>
          )}
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={!!prefs.email}
              disabled={busy || !delivery.configured || !delivery.verified}
              onChange={(e) => void save({ ...prefs, email: e.target.checked })}
            />
            Email my enabled reminders
          </label>
          <button
            className="text-link"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void api<{ configured: boolean; verified: boolean; failed: number }>(
                '/account/email-status',
              )
                .then(setDelivery)
                .catch((e) => setError(e.message))
                .finally(() => setBusy(false));
            }}
          >
            Refresh verification status
          </button>
          {!!delivery.failed && (
            <p className="field-help">
              A delivery could not complete after retries. In-app reminders remain available;
              contact the administrator to check email delivery.
            </p>
          )}
          {message && <p role="status">{message}</p>}
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
