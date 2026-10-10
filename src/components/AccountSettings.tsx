import { useState } from 'react';
import { Save, KeyRound, Monitor, Check, ShieldCheck } from 'lucide-react';
import { api, body, setCsrf } from '../api';
import type { User } from '../../shared/model';
export function AccountSettings({ user, onUser }: { user: User; onUser: (user: User) => void }) {
  const [busy, setBusy] = useState(''),
    [error, setError] = useState(''),
    [success, setSuccess] = useState('');
  async function perform(key: string, action: () => Promise<void>) {
    setBusy(key);
    setError('');
    setSuccess('');
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  }
  return (
    <section className="panel account-controls">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">ACCOUNT PREFERENCES</span>
          <h2>Profile & security</h2>
        </div>
        <ShieldCheck size={24} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          void perform('name', async () => {
            const updated = await api<User>('/account', {
              method: 'PATCH',
              body: body({ name: form.get('name') }),
            });
            onUser(updated);
            setSuccess('Your display name has been updated.');
          });
        }}
      >
        <label>
          Display name
          <input name="name" defaultValue={user.name} minLength={2} maxLength={80} required />
        </label>
        <label>
          Email address
          <input value={user.email} disabled readOnly />
          <span className="field-help">Your sign-in email stays attached to this account.</span>
        </label>
        <button className="outline" disabled={!!busy}>
          <Save size={16} />
          Save profile
        </button>
      </form>
      {!user.demo && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const element = e.currentTarget;
            if (form.get('password') !== form.get('confirm')) {
              setError('Your new passwords do not match.');
              return;
            }
            void perform('password', async () => {
              const result = await api<{ csrf: string }>('/account/password', {
                method: 'POST',
                body: body({
                  currentPassword: form.get('current'),
                  password: form.get('password'),
                }),
              });
              setCsrf(result.csrf);
              element.reset();
              setSuccess('Password updated. Other sessions have been signed out.');
            });
          }}
        >
          <h3>
            <KeyRound size={18} />
            Change password
          </h3>
          <label>
            Current password
            <input
              name="current"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
            />
          </label>
          <div className="form-columns">
            <label>
              New password
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
              />
            </label>
            <label>
              Confirm new password
              <input
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
              />
            </label>
          </div>
          <button className="outline" disabled={!!busy}>
            <KeyRound size={16} />
            Update password
          </button>
        </form>
      )}
      <div className="session-control">
        <div>
          <h3>
            <Monitor size={18} />
            Other sessions
          </h3>
          <p>Sign out your account on other browsers while keeping this session active.</p>
        </div>
        <button
          className="outline"
          disabled={!!busy}
          onClick={() =>
            void perform('sessions', async () => {
              await api('/account/signout-others', { method: 'POST', body: body({}) });
              setSuccess('Other sessions have been signed out.');
            })
          }
        >
          Sign out other sessions
        </button>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="success-notice" role="status">
          <Check size={17} />
          {success}
        </p>
      )}
    </section>
  );
}
