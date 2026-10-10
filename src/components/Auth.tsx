import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api, body, setCsrf } from '../api';
import { HeroFolder } from './HeroFolder';
import { BrandMark, Wordmark } from './Brand';
import { StateMark, stateLabels, stateMeaning, plural } from './Status';
import { MotionToggle } from '../motion/MotionProvider';
import { uploadRules, useCatalog } from '../catalog';
import type { CheckState, User } from '../../shared/model';

const legend: CheckState[] = ['pass', 'fail', 'needs_review', 'unknown', 'not_applicable'];

export function Auth({ onAuth }: { onAuth: (user: User, packetId?: string) => void }) {
  const { limits, packs, templates } = useCatalog();
  const rules = uploadRules(limits);
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
  const tryDemo = () => void authenticate('/auth/demo', {});
  return (
    <div className="landing">
      <a href="#welcome-content" className="skip-link">
        Skip to content
      </a>
      <header className="landing-nav">
        <a className="landing-brand" href="#welcome-content" aria-label="JKY-Folder home">
          <Wordmark />
        </a>
        <nav aria-label="Product">
          <a href="#how-it-works">How it works</a>
          <a href="#checklists">Checklists</a>
          <a href="#honest-states">What a review means</a>
        </nav>
        <div className="landing-nav-tools">
          <MotionToggle />
          <a className="outline small-button" href="#account" onClick={() => setMode('login')}>
            Sign in
          </a>
        </div>
      </header>
      <main id="welcome-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Know what your application is missing before you submit.</h1>
            <p className="hero-lede">
              JKY-Folder turns application instructions into a checklist, keeps your original
              documents together, and links every requirement to the page that proves it.
            </p>
            <div className="hero-actions">
              <button className="primary hero-button" disabled={busy} onClick={tryDemo}>
                {busy ? 'Opening the demo…' : 'Explore the demo'}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              <a
                className="outline hero-button"
                href="#account"
                onClick={() => setMode('register')}
              >
                Create an account
              </a>
            </div>
            <p className="hero-note">
              The demo opens a private workspace with fictional documents. No sign-up needed.
            </p>
          </div>
          <HeroFolder />
        </section>

        <section className="how" id="how-it-works" aria-labelledby="how-title">
          <h2 id="how-title">From instructions to a dated review</h2>
          <ol className="how-steps">
            <li>
              <h3>Build the checklist</h3>
              <p>
                Start from a reference checklist, a starter, or paste your own instructions. Each
                line becomes an item you can edit.
              </p>
            </li>
            <li>
              <h3>Link originals to pages</h3>
              <p>
                Add {rules.formats} originals, preview them, and connect each requirement to the
                exact page that supports it.
              </p>
            </li>
            <li>
              <h3>Save a review</h3>
              <p>
                See what is reviewed, missing or unresolved, then keep a dated report you can print
                or export.
              </p>
            </li>
          </ol>
        </section>

        <section className="catalog-section" id="checklists" aria-labelledby="checklists-title">
          <div className="section-head">
            <h2 id="checklists-title">Start from a real checklist, or your own</h2>
            <p>
              Reference checklists keep their source and the date it was checked. Starters are
              suggestions you shape to your instructions.
            </p>
          </div>
          <ul className="catalog-folders">
            {packs.map((pack) => (
              <li key={pack.id} className="catalog-folder is-reference">
                <span className="catalog-tab">Reference</span>
                <h3>{pack.title}</h3>
                <p>
                  {plural(pack.requirementCount, 'item')} across{' '}
                  {pack.groups.join(', ').toLowerCase()}. {pack.conditionalCount} depend on your
                  answers.
                </p>
                <p className="catalog-source">
                  Source checked{' '}
                  {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
                    new Date(pack.checkedAt),
                  )}
                </p>
              </li>
            ))}
            {templates
              .filter((t) => t.starter.length)
              .map((t) => (
                <li key={t.id} className="catalog-folder">
                  <span className="catalog-tab">Starter</span>
                  <h3>{t.title}</h3>
                  <p>{t.description}</p>
                  <p className="catalog-source">{plural(t.starter.length, 'editable item')}</p>
                </li>
              ))}
          </ul>
        </section>

        <section className="honesty" id="honest-states" aria-labelledby="honesty-title">
          <div className="honesty-copy">
            <h2 id="honesty-title">Every item gets an honest state</h2>
            <p>
              There is no single readiness score to misread. Each requirement shows exactly where it
              stands, and anything uncertain stays visible until you resolve it.
            </p>
            <ul className="never-list">
              <li>It never says an application will be accepted.</li>
              <li>It never claims a document is authentic.</li>
              <li>It never logs in to portals or submits for you.</li>
              <li>“Not sure” is never treated as “no”.</li>
            </ul>
          </div>
          <dl className="state-legend">
            {legend.map((state) => (
              <div key={state}>
                <dt>
                  <StateMark state={state} size={26} />
                  {stateLabels[state]}
                </dt>
                <dd>{stateMeaning[state]}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="account-section" aria-labelledby="account-title">
          <div className="account-copy">
            <h2 id="account-title">
              {mode === 'register' ? 'Open your own folder.' : 'Welcome back.'}
            </h2>
            <p>
              {mode === 'register'
                ? 'Keep separate folders for college, scholarships and jobs, and pick up exactly where you left off.'
                : 'Your applications, documents and saved reviews are waiting.'}
            </p>
            <p className="account-warning">
              This is a development preview. Please use fictional documents until public launch
              reviews are complete.
            </p>
          </div>
          <div className="auth-card" id="account">
            <div className="segmented" role="group" aria-label="Account">
              <button
                aria-pressed={mode === 'register'}
                className={mode === 'register' ? 'active' : ''}
                onClick={() => setMode('register')}
              >
                Create account
              </button>
              <button
                aria-pressed={mode === 'login'}
                className={mode === 'login' ? 'active' : ''}
                onClick={() => setMode('login')}
              >
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
                    placeholder="As you’d like to be greeted"
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
                  minLength={limits.passwordMin}
                  maxLength={limits.passwordMax}
                  placeholder={`At least ${limits.passwordMin} characters`}
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
                      I agree to this development workspace storing and processing my files. I’ll
                      use synthetic documents for now.
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
              </button>
            </form>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <span className="landing-footer-brand">
          <BrandMark />
          JKY-Folder
        </span>
        <span>Prepare your application. Your institution decides.</span>
        <span>© {new Date().getFullYear()} JKY-Folder</span>
      </footer>
    </div>
  );
}
