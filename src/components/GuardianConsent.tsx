import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { api, body } from '../api';
import { Wordmark } from './Brand';
import { ThemeToggle } from '../theme';

interface Request {
  applicant: { name: string; email: string };
  status: 'pending' | 'approved' | 'declined';
  adultOn: string;
  requestedAt: string;
  decidedAt: string | null;
  guardianName: string | null;
  relationship: 'parent' | 'guardian' | null;
}
const long = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * The page a parent or guardian opens from email: approve or decline a new account, or later
 * withdraw an approval. It works without an account of its own; the emailed link is the key.
 */
export function GuardianConsent({
  token,
  purpose,
}: {
  token: string;
  purpose: 'approve' | 'manage';
}) {
  const [request, setRequest] = useState<Request | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [done, setDone] = useState('');
  useEffect(() => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    api<Request>('/guardian/lookup', { method: 'POST', body: body({ token, purpose }) })
      .then(setRequest)
      .catch((e) => setError((e as Error).message));
  }, [token, purpose]);
  async function send(path: string, payload: Record<string, unknown>) {
    setBusy(true);
    setError('');
    try {
      const r = await api<{ message: string }>(path, {
        method: 'POST',
        body: body({ token, ...payload }),
      });
      setDone(r.message);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const first = request?.applicant.name.split(' ')[0] || 'the applicant';
  return (
    <div className="landing guardian-page">
      <header className="landing-nav">
        <a className="landing-brand" href="/" aria-label="JKY-Folder home">
          <Wordmark />
        </a>
        <div className="landing-nav-tools">
          <ThemeToggle />
        </div>
      </header>
      <main id="main-content">
        <section className="account-section">
          <div className="account-copy">
            <h1>
              {purpose === 'approve'
                ? request
                  ? `Approve ${first}’s account`
                  : 'Approve an account'
                : request
                  ? `${first}’s JKY-Folder account`
                  : 'Manage an approval'}
            </h1>
            {request && (
              <>
                <p>
                  <strong>{request.applicant.name}</strong> ({request.applicant.email}){' '}
                  {purpose === 'approve'
                    ? `asked for your approval on ${long(request.requestedAt)}.`
                    : `has used JKY-Folder with your approval since ${long(request.decidedAt || request.requestedAt)}.`}
                </p>
                <div className="guardian-facts">
                  <h2>What JKY-Folder does</h2>
                  <ul>
                    <li>
                      Keeps the documents {first} uploads for college, scholarship and job
                      applications, privately in their account.
                    </li>
                    <li>
                      Checks them against the application instructions {first} chooses, and shows
                      what is missing.
                    </li>
                    <li>
                      Never submits applications, shows advertising or sells their data. Nothing is
                      shared unless {first} chooses to, for example with support.
                    </li>
                  </ul>
                  <h2>Your choices</h2>
                  <ul>
                    <li>
                      After approving, we email you a link to withdraw at any time. Withdrawing
                      deletes the account and every document in it.
                    </li>
                    <li>
                      Your approval ends on {long(request.adultOn)}, when {first} is 18 and the
                      account becomes fully theirs.
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
          <div className="auth-card guardian-card">
            {done ? (
              <>
                <p role="status" className="guardian-done">
                  <ShieldCheck size={20} aria-hidden="true" />
                  {done}
                </p>
                <a className="outline full" href="/">
                  Go to JKY-Folder
                </a>
              </>
            ) : !request ? (
              error ? (
                <p className="form-error" role="alert">
                  {error}
                </p>
              ) : (
                <p role="status">Opening the request…</p>
              )
            ) : purpose === 'approve' ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const d = new FormData(event.currentTarget);
                  void send('/guardian/approve', {
                    guardianName: d.get('guardianName'),
                    relationship: d.get('relationship'),
                    consent: d.get('consent') === 'on',
                  });
                }}
              >
                <label>
                  Your full name
                  <input
                    name="guardianName"
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </label>
                <fieldset className="age-choice">
                  <legend>You are {first}’s</legend>
                  <label className="checkbox-line">
                    <input type="radio" name="relationship" value="parent" required />
                    <span>Parent</span>
                  </label>
                  <label className="checkbox-line">
                    <input type="radio" name="relationship" value="guardian" required />
                    <span>Legal guardian</span>
                  </label>
                </fieldset>
                <label className="checkbox-line">
                  <input name="consent" type="checkbox" required />
                  <span>
                    I am {first}’s parent or legal guardian, and I agree to JKY-Folder storing and
                    checking their application documents as described.
                  </span>
                </label>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="primary full" disabled={busy}>
                  {busy ? 'Please wait…' : 'Approve account'}
                </button>
                <button
                  type="button"
                  className="outline full"
                  disabled={busy}
                  onClick={() => void send('/guardian/decline', {})}
                >
                  Don’t approve
                </button>
              </form>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void send('/guardian/withdraw', {
                    confirmation: new FormData(event.currentTarget).get('confirmation'),
                  });
                }}
              >
                <p>
                  {request.guardianName ? `${request.guardianName}, you` : 'You'} approved this
                  account
                  {request.decidedAt ? ` on ${long(request.decidedAt)}` : ''}.
                </p>
                <div className="soft-notice danger-notice">
                  <p>
                    Withdrawing deletes {first}’s account and every document in it immediately. This
                    cannot be undone.
                  </p>
                </div>
                <label>
                  Type WITHDRAW to confirm
                  <input name="confirmation" autoComplete="off" pattern="WITHDRAW" required />
                </label>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="danger full" disabled={busy}>
                  {busy ? 'Please wait…' : 'Withdraw approval and delete the account'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
