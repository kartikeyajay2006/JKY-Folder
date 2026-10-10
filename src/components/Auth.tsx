import { useState } from 'react';
import {
  ArrowRight,
  Check,
  FileCheck2,
  FolderCheck,
  ShieldCheck,
  Sparkles,
  Link2,
} from 'lucide-react';
import { api, body, setCsrf } from '../api';
import type { User } from '../../shared/model';
export function Auth({ onAuth }: { onAuth: (user: User, packetId?: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function authenticate(endpoint: string, payload: unknown) {
    setBusy(true);
    setError('');
    try {
      const result = await api<{ user: User; csrf: string; packetId?: string }>(endpoint, {
        method: 'POST',
        body: body(payload),
      });
      setCsrf(result.csrf);
      onAuth(result.user, result.packetId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="welcome">
      <a className="welcome-brand" href="#">
        <img src="/favicon.svg" alt="" />
        JKY-Folder<span className="edition">EARLY ACCESS</span>
      </a>
      <div className="welcome-grid">
        <section className="welcome-story">
          <span className="eyebrow">
            <span className="little-dot" />A LITTLE MORE READY.
          </span>
          <h1>
            Your next chapter.
            <br />
            <em>All in one folder.</em>
          </h1>
          <p className="welcome-description">
            Big plans come with little details. Bring your application documents together, connect
            them to the requirements, and see what still needs a little attention.
          </p>
          <div className="welcome-points">
            <span>
              <FileCheck2 size={18} />A clear requirement checklist
            </span>
            <span>
              <Link2 size={18} />
              Evidence behind every finding
            </span>
            <span>
              <ShieldCheck size={18} />A workspace that stays yours
            </span>
          </div>
          <button
            className="primary demo-cta"
            disabled={busy}
            onClick={() => void authenticate('/auth/demo', {})}
          >
            {busy ? 'Opening your workspace…' : 'Explore the demo'}
            <ArrowRight size={18} />
          </button>
          <p className="microcopy">No signup needed. Fictional documents. Real workflow.</p>
          <div className="folder-scene" aria-hidden="true">
            <div className="scene-label">
              <Sparkles size={15} />
              Everything has its place.
            </div>
            <div className="scene-page page-one">
              <span>APPLICATION CHECKLIST</span>
              <div />
              <div />
              <div />
              <p>
                <Check size={12} />
                Evidence connected
              </p>
            </div>
            <div className="scene-page page-two">
              <span>YOUR NEXT CHAPTER</span>
              <h3>
                A little
                <br />
                more ready.
              </h3>
              <FolderCheck size={48} />
            </div>
            <div className="scene-folder">
              <span>JKY / 01</span>
              <FolderCheck size={56} />
              <p>The start of something good.</p>
            </div>
          </div>
        </section>
        <section className="auth-card">
          <span className="eyebrow">YOUR PRIVATE WORKSPACE</span>
          <h2>{mode === 'register' ? 'Make room for your future.' : 'Welcome back.'}</h2>
          <p>
            {mode === 'register'
              ? 'Start with one application. Take it one document at a time.'
              : 'Your documents and next steps are waiting for you.'}
          </p>
          <div className="segmented">
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Create account
            </button>
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
              Sign in
            </button>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              void authenticate(`/auth/${mode}`, {
                email: data.get('email'),
                password: data.get('password'),
                ...(mode === 'register'
                  ? {
                      name: data.get('name'),
                      adult: data.get('adult') === 'on',
                      consent: data.get('consent') === 'on',
                    }
                  : {}),
              });
            }}
          >
            {mode === 'register' && (
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={80}
                  placeholder="e.g. Aanya Mehra"
                  required
                />
              </label>
            )}
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                minLength={12}
                maxLength={128}
                placeholder="At least 12 characters"
                required
              />
            </label>
            {mode === 'register' && (
              <>
                <label className="checkbox-line">
                  <input name="adult" type="checkbox" required />
                  <span>I am 18 or older.</span>
                </label>
                <label className="checkbox-line">
                  <input name="consent" type="checkbox" required />
                  <span>
                    I agree to this development workspace storing and processing my files. I’ll use
                    synthetic documents for now.
                  </span>
                </label>
              </>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="primary full" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'register' ? 'Create my workspace' : 'Sign in'}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="auth-note">
            <ShieldCheck size={19} />
            <p>
              Development preview. The checklist helps you review documents; it does not guarantee
              eligibility or acceptance.
            </p>
          </div>
        </section>
      </div>
      <footer className="welcome-footer">
        <span>JKY-Folder © 2026</span>
        <span>Made for the moments before your next big moment.</span>
      </footer>
    </div>
  );
}
