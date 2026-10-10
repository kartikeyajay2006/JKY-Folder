import { useEffect, useState } from 'react';
import { disablePush, enablePush, pushState, sendTestPush, type PushState } from '../push';

/** Browser notifications for this device: reminders arrive even when JKY-Folder is closed. */
export function PushSettings() {
  const [state, setState] = useState<PushState | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    void pushState()
      .then(setState)
      .catch(() => setState('unsupported'));
  }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      setState(await pushState());
    } catch (e) {
      setError((e as Error).message);
      setState(await pushState().catch(() => 'unsupported' as const));
    } finally {
      setBusy(false);
    }
  }
  if (!state) return null;
  return (
    <fieldset className="push-settings">
      <legend>Notifications on this device</legend>
      <p className="field-help">
        {state === 'unsupported'
          ? 'This browser cannot receive notifications. Email reminders still work once your address is verified.'
          : state === 'blocked'
            ? 'Notifications are blocked for this site. Allow them in your browser’s site settings, then return here.'
            : state === 'on'
              ? 'On. Deadline and checklist reminders reach this browser even when JKY-Folder is closed, as long as the browser can run in the background.'
              : 'Get deadline and checklist reminders on this device even when JKY-Folder is closed. Notifications never show application names or file names.'}
      </p>
      <div className="button-row">
        {state === 'off' && (
          <button className="outline" disabled={busy} onClick={() => void run(enablePush)}>
            Turn on notifications
          </button>
        )}
        {state === 'on' && (
          <>
            <button
              className="outline"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const result = await sendTestPush();
                  setMessage(
                    result.sent
                      ? 'Test notification sent. It should appear within a few seconds.'
                      : 'The push service did not accept the test. Turn notifications off and on again.',
                  );
                })
              }
            >
              Send a test notification
            </button>
            <button className="quiet" disabled={busy} onClick={() => void run(disablePush)}>
              Turn off
            </button>
          </>
        )}
      </div>
      {message && <p role="status">{message}</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
