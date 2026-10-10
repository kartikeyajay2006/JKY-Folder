import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
  Award,
  BriefcaseBusiness,
  ListChecks,
  FileText,
  Clock,
  Check,
  FileCheck2,
  FolderCheck,
  ShieldCheck,
  Link2,
} from 'lucide-react';
import { api, body, setCsrf } from '../api';
import { PacketVisual } from './PacketVisual';
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
      <a href="#welcome-content" className="skip-link">
        Skip to content
      </a>
      <header className="welcome-navigation">
        <a className="product-brand" href="#welcome-content">
          <img src="/favicon.svg" alt="" width="34" height="34" />
          <span>
            JKY<span className="brand-dash">—</span>Folder<span className="brand-period">.</span>
          </span>
        </a>
        <nav aria-label="Product">
          <a href="#how-it-works">How it works</a>
          <a href="#evidence-first">The workflow</a>
        </nav>
        <a className="outline" href="#account">
          Open workspace <ArrowUpRight size={15} />
        </a>
      </header>
      <main id="welcome-content">
        <section className="welcome-hero">
          <div className="welcome-hero-copy">
            <span className="hero-kicker">
              <span />
              YOUR NEXT CHAPTER, IN ORDER
            </span>
            <h1>
              Every document.
              <br />
              Every requirement.
              <br />
              <span>One clear next step.</span>
            </h1>
            <p>
              From application instructions to supporting evidence. Bring it all together, see
              what’s missing, and review with clarity.
            </p>
            <div className="welcome-hero-actions">
              <button
                className="primary demo-cta"
                disabled={busy}
                onClick={() => void authenticate('/auth/demo', {})}
              >
                {busy ? 'Opening your workspace…' : 'Explore the demo'}
                <ArrowRight size={17} />
              </button>
              <a className="outline" href="#account" onClick={() => setMode('register')}>
                Get started <ArrowUpRight size={16} />
              </a>
            </div>
            <span className="welcome-demo-note">
              No signup needed for the demo. Fictional files, real workflow.
            </span>
            <div className="welcome-use-cases">
              <span>MADE FOR</span>
              <span>
                <GraduationCap size={16} />
                College
              </span>
              <span>
                <Award size={16} />
                Scholarships
              </span>
              <span>
                <BriefcaseBusiness size={16} />
                Your next job
              </span>
            </div>
          </div>
          <PacketVisual />
        </section>
        <section className="welcome-method" id="how-it-works">
          <div className="landing-section-heading">
            <span className="eyebrow">THE PROCESS</span>
            <h2>
              A little structure.
              <br />
              <span>A lot more clarity.</span>
            </h2>
            <p>Three connected steps. One place to keep moving.</p>
          </div>
          <div className="method-grid">
            {[
              {
                n: '01',
                title: 'Start with the instructions.',
                text: 'Choose a starter or build a checklist from the requirements you received. Make it fit your application.',
                Icon: ListChecks,
                label: 'DEFINE',
              },
              {
                n: '02',
                title: 'Connect the evidence.',
                text: 'Bring in your original files. Link each requirement to a supporting document and the exact pages.',
                Icon: Link2,
                label: 'CONNECT',
              },
              {
                n: '03',
                title: 'Know your next step.',
                text: 'Review missing evidence and file checks. Save a dated report of what you reviewed and what needs attention.',
                Icon: FileCheck2,
                label: 'REVIEW',
              },
            ].map(({ n, title, text, Icon, label }) => (
              <article key={n}>
                <div>
                  <span>
                    {n} / {label}
                  </span>
                  <Icon size={21} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="welcome-evidence" id="evidence-first">
          <div className="landing-section-heading">
            <span className="eyebrow">EVIDENCE FIRST</span>
            <h2>
              A finding you
              <br />
              <span>can follow.</span>
            </h2>
            <p>
              Every checklist item connects to its supporting file. Review the original, record what
              you checked, and keep unanswered questions visible.
            </p>
            <a className="text-link" href="#account">
              Make room for your next opportunity <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="evidence-example">
            <div className="example-window-header">
              <span>
                <span />
                <span />
                <span />
              </span>
              <span>ILLUSTRATIVE WORKFLOW</span>
            </div>
            <div className="example-window-body">
              <div className="example-window-title">
                <span className="example-symbol">
                  <FileCheck2 size={23} />
                </span>
                <div>
                  <small>CHECKLIST ITEM</small>
                  <h3>Academic transcript</h3>
                </div>
              </div>
              <div className="example-connection">
                <Link2 size={15} />
                <span>Connected to supporting evidence</span>
              </div>
              <div className="example-file">
                <FileText size={23} />
                <div>
                  <strong>transcript.pdf</strong>
                  <span>Original document · page 1</span>
                </div>
                <ArrowUpRight size={17} />
              </div>
              <div className="example-review">
                <ShieldCheck size={19} />
                <div>
                  <strong>Your review matters.</strong>
                  <p>File checks and your own content review are recorded separately.</p>
                </div>
              </div>
            </div>
            <span className="example-window-footer">
              Example only · A review is not an acceptance guarantee.
            </span>
          </div>
        </section>
        <div className="welcome-account-section">
          <div className="welcome-account-copy">
            <span className="eyebrow">YOUR PRIVATE WORKSPACE</span>
            <h2>
              Your next opportunity.
              <br />
              <span>Organized from day one.</span>
            </h2>
            <p>
              Keep separate folders for college, scholarships and jobs. Create your checklist, add
              the originals, and pick up exactly where you left off.
            </p>
            <div>
              <span>
                <ShieldCheck size={18} />
                Account-controlled document access
              </span>
              <span>
                <FolderCheck size={18} />
                Your originals, in one place
              </span>
              <span>
                <Clock size={18} />
                Dated reports and clear next steps
              </span>
            </div>
            <p className="welcome-account-note">
              Local development preview. Use synthetic documents while public launch reviews remain
              open.
            </p>
          </div>
          <section className="auth-card" id="account" aria-label="Your account">
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
      </main>
      <footer className="welcome-footer">
        <a className="product-brand" href="#welcome-content">
          <span>
            JKY<span className="brand-dash">—</span>Folder<span className="brand-period">.</span>
          </span>
        </a>
        <span>Every document. One clear next step.</span>
        <span>© {new Date().getFullYear()} JKY-Folder</span>
      </footer>
    </div>
  );
}
