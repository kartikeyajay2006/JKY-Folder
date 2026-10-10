import { useEffect, useState } from 'react';
import { LogOut, MailCheck, RefreshCw, Send, Trash2 } from 'lucide-react';
import { api, body } from '../api';
import { Wordmark } from './Brand';
import { ThemeToggle } from '../theme';
import type { GuardianState, User } from '../../shared/model';

const long = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * What an under-18 applicant sees until a parent or guardian approves. Nothing personal can be
 * added yet; the applicant can resend the request, ask someone else, or delete the account.
 */
export function GuardianWaiting({
  user,
  onUser,
  onLogout,
  onDeleted,
}: {
  user: User & { guardian: GuardianState };
  onUser: (user: User) => void;
  onLogout: () => void;
  onDeleted: () => void;
}) {
  const { guardian } = user;
  const [busy, setBusy] = useState(''),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [changing, setChanging] = useState(guardian.status === 'declined'),
    [confirmDelete, setConfirmDelete] = useState(false),
    [outbox, setOutbox] = useState(false);
  useEffect(() => {
    api<{ delivery: string | null }>('/account/email-status')
      .then((s) => setOutbox(s.delivery === 'outbox'))
      .catch(() => {});
  }, []);
  async function check(quiet = false) {
    if (!quiet) setBusy('check');
    try {
      const me = await api<{ user: User }>('/me');
      onUser(me.user);
      if (!quiet && me.user.guardian?.status === user.guardian.status)
        setMessage('Not approved yet. We will keep checking while this page is open.');
    } catch (e) {
      if (!quiet) setError((e as Error).message);
    } finally {
      if (!quiet) setBusy('');
    }
  }
  // Approval usually happens on the guardian's phone; notice it without a reload.
  useEffect(() => {
    const timer = setInterval(() => void check(true), 15000);
    return () => clearInterval(timer);
  }, []);
  async function act(name: string, action: () => Promise<void>) {
    setBusy(name);
    setError('');
    setMessage('');
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  }
  const declined = guardian.status === 'declined';
  return (
    <div className="landing guardian-page">
      <header className="landing-nav">
        <span className="landing-brand">
          <Wordmark />
        </span>
        <div className="landing-nav-tools">
          <ThemeToggle />
          <button className="outline small-button" disabled={!!busy} onClick={onLogout}>
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </header>
      <main id="main-content">
        <section className="account-section">
          <div className="account-copy">
            <h1>
              {declined
                ? 'Your parent or guardian did not approve.'
                : 'Waiting for your parent or guardian.'}
            </h1>
            <p>
              {declined
                ? 'You can ask another parent or guardian instead. Until someone approves, you cannot add documents.'
                : `Hi ${user.name.split(' ')[0]}. Because you are under 18, a parent or guardian approves your account before you add documents.`}
            </p>
            <p className="account-warning">
              If nobody approves by {long(guardian.deleteAfter)}, this account is deleted
              automatically.
            </p>
          </div>
          <div className="auth-card guardian-card">
            {!declined && (
              <div className="guardian-sent">
                <MailCheck size={22} aria-hidden="true" />
                <p>
                  We emailed <strong className="data">{guardian.guardianEmail}</strong>. Ask them to
                  open the link and choose <em>Approve account</em>. It works for 7 days.
                </p>
              </div>
            )}
            {outbox && (
              <p className="field-help">
                Development server: the email was saved to this server’s outbox. Run{' '}
                <code>npm run outbox -- latest</code> to read it.
              </p>
            )}
            {message && <p role="status">{message}</p>}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {!declined && (
              <div className="button-row">
                <button className="primary" disabled={!!busy} onClick={() => void check()}>
                  <RefreshCw size={15} aria-hidden="true" />
                  {busy === 'check' ? 'Checking…' : 'Check again'}
                </button>
                <button
                  className="outline"
                  disabled={!!busy}
                  onClick={() =>
                    void act('resend', async () => {
                      const r = await api<GuardianState & { message: string }>('/guardian/resend', {
                        method: 'POST',
                        body: body({}),
                      });
                      setMessage(r.message);
                    })
                  }
                >
                  <Send size={15} aria-hidden="true" />
                  {busy === 'resend' ? 'Sending…' : 'Send the email again'}
                </button>
              </div>
            )}
            {!changing ? (
              <button className="text-link" onClick={() => setChanging(true)}>
                Ask a different parent or guardian
              </button>
            ) : (
              <form
                className="guardian-change"
                onSubmit={(event) => {
                  event.preventDefault();
                  const email = new FormData(event.currentTarget).get('guardianEmail');
                  void act('change', async () => {
                    const r = await api<GuardianState & { message: string }>('/guardian/email', {
                      method: 'PUT',
                      body: body({ guardianEmail: email }),
                    });
                    const { message: sent, ...state } = r;
                    onUser({ ...user, guardian: state });
                    setChanging(false);
                    setMessage(sent);
                  });
                }}
              >
                <label>
                  Parent’s or guardian’s email
                  <input name="guardianEmail" type="email" autoComplete="off" required />
                </label>
                <button className="primary" disabled={!!busy}>
                  {busy === 'change' ? 'Sending…' : 'Send approval request'}
                </button>
              </form>
            )}
            <div className="guardian-delete">
              {!confirmDelete ? (
                <button className="text-link danger-link" onClick={() => setConfirmDelete(true)}>
                  Delete my account instead
                </button>
              ) : (
                <div className="soft-notice danger-notice">
                  <Trash2 size={18} aria-hidden="true" />
                  <p>Your account will be deleted now. This cannot be undone.</p>
                  <div className="button-row">
                    <button
                      className="outline small-button"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Keep it
                    </button>
                    <button
                      className="danger small-button"
                      disabled={!!busy}
                      onClick={() =>
                        void act('delete', async () => {
                          await api('/account', {
                            method: 'DELETE',
                            body: body({ confirmation: 'DELETE' }),
                          });
                          onDeleted();
                        })
                      }
                    >
                      Yes, delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
