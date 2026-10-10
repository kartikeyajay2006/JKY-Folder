import { useEffect, useState } from 'react';
import { api, body } from '../api';
import { limits } from '../../shared/limits';
import { Wordmark } from './Brand';
export interface AccountAction {
  kind: 'reset' | 'verify';
  token: string;
}
export function readAccountAction(): AccountAction | null {
  const match = window.location.hash.match(/^#(reset|verify)=([a-f0-9]{64})$/);
  return match ? { kind: match[1] as AccountAction['kind'], token: match[2] } : null;
}
export function AccountLink({ action }: { action: AccountAction }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  useEffect(() => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);
  async function submit(password?: string) {
    setBusy(true);
    setError('');
    try {
      const r = await api<{ message: string }>(
        action.kind === 'reset' ? '/auth/reset-password' : '/auth/verify-email',
        { method: 'POST', body: body({ token: action.token, ...(password ? { password } : {}) }) },
      );
      setMessage(r.message);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="landing">
      <header className="landing-nav">
        <a href="/" aria-label="JKY-Folder home">
          <Wordmark />
        </a>
      </header>
      <main>
        <section className="account-section">
          <div className="account-copy">
            <h1>{action.kind === 'reset' ? 'Choose a new password' : 'Verify your email'}</h1>
            <p>
              {action.kind === 'reset'
                ? 'This changes your password and signs out all existing sessions. Your documents stay in your private workspace.'
                : 'Verify this address before enabling background email reminders.'}
            </p>
          </div>
          <div className="auth-card">
            {message ? (
              <>
                <p role="status">{message}</p>
                <a className="primary full" href="/">
                  Continue to workspace
                </a>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  if (action.kind === 'reset' && d.get('password') !== d.get('confirmPassword')) {
                    setError('Passwords must match.');
                    return;
                  }
                  void submit(action.kind === 'reset' ? String(d.get('password')) : undefined);
                }}
              >
                {action.kind === 'reset' && (
                  <>
                    <label>
                      New password
                      <input
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        minLength={limits.passwordMin}
                        maxLength={limits.passwordMax}
                        required
                      />
                    </label>
                    <label>
                      Confirm new password
                      <input
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        minLength={limits.passwordMin}
                        maxLength={limits.passwordMax}
                        required
                      />
                    </label>
                  </>
                )}
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="primary full" disabled={busy}>
                  {busy
                    ? 'Please wait…'
                    : action.kind === 'reset'
                      ? 'Save new password'
                      : 'Verify email address'}
                </button>
                <a className="text-link" href="/">
                  Return to sign in
                </a>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
