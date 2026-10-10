import { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  ListChecks,
  Files,
  FileCheck2,
  Activity,
  Settings,
  HelpCircle,
  Search,
  Plus,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Check,
  AlertCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Upload,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Download,
  Trash2,
  LogOut,
  FolderOpen,
  Link2,
  Menu,
  X,
  Printer,
  Sparkles,
  BookOpen,
  CheckCheck,
  Info,
} from 'lucide-react';
import { Auth } from './components/Auth';
import { Dialog } from './components/Dialog';
import { EvidenceDialog } from './components/EvidenceDialog';
import { ProfileDialog } from './components/ProfileDialog';
import { Status, date, size } from './components/Status';
import { api, body, setCsrf, download, ApiError } from './api';
import { evaluate, EVALUATOR_VERSION } from '../shared/evaluate';
import { uceedPack } from '../shared/packs';
import { packetPack, deadlineInfo } from '../shared/templates';
import { ApplicationWizard, type CreateApplicationInput } from './components/ApplicationWizard';
import { WorkspaceHome, EmptySection, type PacketCard } from './components/WorkspaceHome';
import { ChecklistEditor } from './components/ChecklistEditor';
import { ApplicationDetails } from './components/ApplicationDetails';
import { AccountSettings } from './components/AccountSettings';
import { ActivityFeed } from './components/ActivityFeed';
import { PdfPreview } from './components/PdfPreview';
import { UploadQueue, type UploadItem } from './components/UploadQueue';
import {
  readWorkspaceLocation,
  writeWorkspaceLocation,
  type WorkspaceView,
} from './workspace-location';
import type {
  User,
  Packet,
  PacketDetail,
  EvaluationRun,
  Requirement,
  DocumentRecord,
} from '../shared/model';
type View = WorkspaceView;

const navigation = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'applications', label: 'Applications', Icon: FolderOpen },
  { id: 'requirements', label: 'Requirements', Icon: ListChecks },
  { id: 'documents', label: 'My documents', Icon: Files },
  { id: 'report', label: 'Readiness report', Icon: FileCheck2 },
  { id: 'activity', label: 'Activity', Icon: Activity },
] as const;
const headings: Record<View, [string, string]> = {
  applications: ['Your applications.', 'Every opportunity, every deadline, every next step.'],
  overview: [
    'Application overview',
    'Track your requirements, review your evidence, and resolve the next action.',
  ],
  requirements: [
    'Document checklist',
    'Connect each instruction to its evidence, one document at a time.',
  ],
  documents: ['Document library', 'Your original files, kept together in a private packet.'],
  report: [
    'Readiness report',
    'A dated snapshot of what was checked, and what still needs review.',
  ],
  activity: ['Workspace activity', 'Uploads and review runs for this application packet.'],
  help: ['Help center', 'Understand your checklist, your evidence, and the limits of a review.'],
  settings: ['Settings & privacy', 'Manage your account and decide what stays in your folder.'],
};
export default function App() {
  const initialLocation = useRef(readWorkspaceLocation());
  const [user, setUser] = useState<User | null>(null),
    [booting, setBooting] = useState(true),
    [bootError, setBootError] = useState('');
  const [packets, setPackets] = useState<PacketCard[]>([]),
    [activeId, setActiveId] = useState(initialLocation.current.application),
    [data, setData] = useState<PacketDetail | null>(null);
  const [packetsLoaded, setPacketsLoaded] = useState(false);
  const pack = data ? packetPack(data.packet) : uceedPack;
  const [createTemplate, setCreateTemplate] = useState('college');
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [uploadBatch, setUploadBatch] = useState<{ packetId: string; items: UploadItem[] } | null>(
    null,
  );
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width:700px)').matches);
  const [view, setView] = useState<View>(initialLocation.current.view),
    [busy, setBusy] = useState(''),
    [error, setError] = useState(''),
    [toast, setToast] = useState(''),
    [search, setSearch] = useState(''),
    [filter, setFilter] = useState('all'),
    [mobile, setMobile] = useState(false);
  const [modal, setModal] = useState<
      'create' | 'profile' | 'details' | 'checklist' | 'delete-packet' | 'delete-account' | null
    >(null),
    [evidence, setEvidence] = useState<Requirement | null>(null),
    [preview, setPreview] = useState<DocumentRecord | null>(null),
    [deleteDoc, setDeleteDoc] = useState<DocumentRecord | null>(null),
    [reportId, setReportId] = useState('');
  useEffect(() => {
    const media = window.matchMedia('(max-width:700px)');
    const update = () => setNarrow(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const inputRef = useRef<HTMLInputElement>(null),
    searchRef = useRef<HTMLInputElement>(null),
    selectionRef = useRef('');
  const packetsRef = useRef(packets);
  const ownerRef = useRef(user?.id);
  packetsRef.current = packets;
  ownerRef.current = user?.id;
  selectionRef.current = activeId;
  async function refresh(preferred = selectionRef.current) {
    const ownerAtStart = ownerRef.current;
    const selectionAtStart = selectionRef.current;
    const list = await api<PacketCard[]>('/packets');
    if (!ownerAtStart || ownerRef.current !== ownerAtStart) return;
    setPackets(list);
    if (selectionRef.current !== selectionAtStart) return;
    const id = list.some((p) => p.packet.id === preferred) ? preferred : list[0]?.packet.id || '';
    setActiveId(id);
    if (id) {
      const detail = await api<PacketDetail>(`/packets/${id}`);
      if (ownerRef.current !== ownerAtStart) return;
      if (
        selectionRef.current === id ||
        !selectionRef.current ||
        !list.some((p) => p.packet.id === selectionRef.current)
      )
        setData(detail);
    } else setData(null);
  }
  useEffect(() => {
    let alive = true;
    api<{ user: User; csrf: string }>('/me')
      .then((result) => {
        if (alive) {
          setUser(result.user);
          setCsrf(result.csrf);
        }
      })
      .catch((e) => {
        if (alive && (!(e instanceof ApiError) || e.status !== 401)) setBootError(e.message);
      })
      .finally(() => {
        if (alive) setBooting(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!user) {
      setPackets([]);
      setData(null);
      setToast('');
      setPacketsLoaded(false);
      setUploadBatch(null);
      setQueuedFiles([]);
      return;
    }
    let alive = true;
    api<PacketCard[]>('/packets')
      .then((list) => {
        if (alive) {
          setPackets(list);
          setActiveId((id) =>
            list.some((p) => p.packet.id === id) ? id : list[0]?.packet.id || '',
          );
          setPacketsLoaded(true);
        }
      })
      .catch((e) => setError(e.message));
    return () => {
      alive = false;
    };
  }, [user?.id]);
  const activeOwned = packets.some((p) => p.packet.id === activeId);
  useEffect(() => {
    setData(null);
    setReportId('');
    if (!user || !activeId || !activeOwned) return;
    let alive = true;
    api<PacketDetail>(`/packets/${activeId}`)
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [activeId, activeOwned, user?.id]);
  useEffect(() => {
    if (user && packetsLoaded) writeWorkspaceLocation(view, activeId, 'replace');
  }, [view, activeId, user?.id, packetsLoaded]);
  useEffect(() => {
    const pop = () => {
      const location = readWorkspaceLocation();
      setView(location.view);
      const application =
        location.application &&
        !packetsRef.current.some((p) => p.packet.id === location.application)
          ? packetsRef.current[0]?.packet.id || ''
          : location.application;
      setActiveId(application);
      setSearch('');
      setFilter('all');
      setMobile(false);
      setModal(null);
      setEvidence(null);
      setPreview(null);
      setDeleteDoc(null);
      setError('');
      if (!application) setData(null);
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    if (!data?.documents.some((d) => d.status === 'processing')) return;
    const timer = setInterval(() => {
      void refresh().catch((e) => setError(e.message));
    }, 1000);
    return () => clearInterval(timer);
  }, [data?.documents]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  const live = useMemo(
    () => (data ? evaluate(data.packet, data.documents, pack, 'live-preview') : null),
    [data, pack],
  );
  const selectedRun = data?.runs.find((r) => r.id === reportId) || data?.runs[0];
  const stale =
    !!selectedRun &&
    (selectedRun.packetRevision !== data?.packet.revision ||
      selectedRun.packVersion !== pack.version ||
      selectedRun.evaluatorVersion !== EVALUATOR_VERSION);
  const required = live?.checks.filter((c) => c.state !== 'not_applicable') || [];
  const nextSteps = required.filter((c) => c.state !== 'pass');
  function navigate(next: View, id = activeId) {
    writeWorkspaceLocation(next, id, 'push');
    if (id !== activeId) {
      setData(null);
      setActiveId(id);
    }
    setView(next);
    setMobile(false);
    setSearch('');
    setFilter('all');
    setError('');
  }
  async function perform(name: string, operation: () => Promise<void>) {
    setBusy(name);
    setError('');
    try {
      await operation();
    } catch (e) {
      setError((e as Error).message);
      if (e instanceof ApiError && e.status === 409) await refresh().catch(() => {});
      if (e instanceof ApiError && e.status === 401) {
        setUser(null);
        setData(null);
        setActiveId('');
      }
    } finally {
      setBusy('');
    }
  }
  async function upload(files: FileList | File[] | null) {
    if (!files || !files.length || busy) return;
    if (!activeId) {
      setQueuedFiles(Array.from(files));
      startCreate();
      return;
    }
    await perform('upload', () => addFiles(activeId, Array.from(files)));
    if (inputRef.current) inputRef.current.value = '';
  }
  async function addFiles(packetId: string, files: File[]) {
    const items: UploadItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'queued',
    }));
    setUploadBatch({ packetId, items });
    const updateItem = (id: string, change: Partial<UploadItem>) =>
      setUploadBatch((batch) =>
        batch?.packetId === packetId
          ? {
              ...batch,
              items: batch.items.map((item) => (item.id === id ? { ...item, ...change } : item)),
            }
          : batch,
      );
    let added = 0,
      duplicates = 0,
      failed = 0;
    for (const item of items) {
      updateItem(item.id, { status: 'uploading' });
      try {
        const form = new FormData();
        form.append('file', item.file);
        const result = await api<{ duplicate: boolean }>(`/packets/${packetId}/documents`, {
          method: 'POST',
          body: form,
        });
        updateItem(item.id, { status: result.duplicate ? 'duplicate' : 'added' });
        if (result.duplicate) duplicates++;
        else added++;
      } catch (e) {
        failed++;
        updateItem(item.id, { status: 'failed', error: (e as Error).message });
        if (e instanceof ApiError && e.status === 401) {
          setUser(null);
          setData(null);
          setActiveId('');
          setCsrf('');
          return;
        }
      }
    }
    await refresh().catch((e) => setError(e.message));
    setToast(
      `${added} added${duplicates ? `, ${duplicates} already present` : ''}${failed ? `, ${failed} could not upload — see upload results` : '. Inspection runs separately.'}`,
    );
  }
  async function update(path: string, payload: unknown, method: string) {
    try {
      return await api(path, { method, body: body(payload) });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) await refresh();
      throw e;
    }
  }
  async function checkPacket() {
    if (!data) return;
    await perform('evaluate', async () => {
      const run = await api<EvaluationRun>(`/packets/${activeId}/evaluate`, {
        method: 'POST',
        body: body({ expectedRevision: data.packet.revision }),
      });
      await refresh();
      setReportId(run.id);
      setToast('Review snapshot saved. Your next steps are up to date.');
    });
  }
  function startCreate(template = 'college') {
    if (busy) return;
    setCreateTemplate(template);
    setModal('create');
  }
  async function createApplication(input: CreateApplicationInput) {
    const p = await api<Packet>('/packets', { method: 'POST', body: body(input) });
    const files = queuedFiles;
    navigate(files.length ? 'documents' : 'requirements', p.id);
    setModal(null);
    setQueuedFiles([]);
    if (inputRef.current) inputRef.current.value = '';
    if (files.length) {
      await perform('upload', () => addFiles(p.id, files));
    } else {
      await refresh(p.id).catch((e) => setError(e.message));
      setToast('Application created. Your next steps are ready.');
    }
    if (!p.customPack) setModal('profile');
  }
  function openApplication(id: string) {
    navigate('overview', id);
  }
  async function archiveApplication(p: Packet) {
    await perform('archive', async () => {
      await api(`/packets/${p.id}`, {
        method: 'PATCH',
        body: body({
          expectedRevision: p.revision,
          details: { title: p.title, archived: !p.archived },
        }),
      });
      await refresh();
      setToast(p.archived ? 'Application restored.' : 'Application archived.');
    });
  }
  if (booting)
    return (
      <main className="boot">
        <img src="/favicon.svg" alt="" />
        <h1>JKY-Folder</h1>
        <p>Making room for your next chapter…</p>
      </main>
    );
  if (bootError && !user)
    return (
      <main className="boot">
        <h1>Your workspace is temporarily unavailable.</h1>
        <p role="alert">{bootError}</p>
        <button className="primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  if (!user)
    return (
      <Auth
        onAuth={(u, id) => {
          setUser(u);
          if (id) setActiveId(id);
          setView('overview');
        }}
      />
    );
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to workspace
      </a>
      {mobile && <div className="sidebar-scrim" onClick={() => setMobile(false)} />}
      <aside
        id="workspace-navigation"
        inert={narrow && !mobile}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setMobile(false);
        }}
        className={`sidebar ${mobile ? 'sidebar-open' : ''}`}
      >
        <button
          className="sidebar-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        >
          <X size={19} />
        </button>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('overview');
          }}
        >
          <img src="/favicon.svg" alt="" />
          <span>
            JKY-Folder<span className="brand-caption">APPLICATION WORKSPACE</span>
          </span>
        </a>
        <div
          className="workspace-selector"
          role="button"
          tabIndex={0}
          onClick={() => navigate('applications')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('applications');
            }
          }}
        >
          <span className="workspace-avatar">{user.name.charAt(0).toUpperCase()}</span>
          <span>
            <strong>My workspace</strong>
            <small>{user.demo ? 'Sample workspace' : 'Personal workspace'}</small>
          </span>
          <ChevronDown size={15} />
        </div>
        <span className="nav-caption">WORKSPACE</span>
        <nav aria-label="Workspace">
          {navigation.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              aria-current={view === id ? 'page' : undefined}
              className={`nav-item ${view === id ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
              {id === 'requirements' && nextSteps.length > 0 && (
                <span className="nav-count">{nextSteps.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-tip">
          <div className="tip-icon">
            <Sparkles size={20} />
          </div>
          <strong>Your application toolkit</strong>
          <p>Start from instructions, connect evidence, and review before submitting.</p>
          <button onClick={() => navigate('help')}>
            How it works
            <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <button
            className={`nav-item ${view === 'help' ? 'active' : ''}`}
            onClick={() => navigate('help')}
          >
            <HelpCircle size={18} />
            Help & guidance
          </button>
          <button
            className={`nav-item ${view === 'settings' ? 'active' : ''}`}
            onClick={() => navigate('settings')}
          >
            <Settings size={18} />
            Settings & privacy
          </button>
          <div className="sidebar-user">
            <span className="user-avatar">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <button onClick={() => navigate('settings')}>
              <strong>{user.name}</strong>
              <small>{user.demo ? 'Demo explorer' : 'Personal account'}</small>
            </button>
            <button
              className="icon-button"
              title="Sign out"
              aria-label="Sign out"
              onClick={() =>
                void perform('logout', async () => {
                  await api('/auth/logout', { method: 'POST', body: body({}) });
                  setUser(null);
                  setData(null);
                  setActiveId('');
                  setCsrf('');
                })
              }
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={narrow && mobile}>
        <header className="topbar">
          <button
            className="mobile-toggle icon-button"
            aria-label="Open navigation"
            aria-expanded={mobile}
            aria-controls="workspace-navigation"
            onClick={() => setMobile(true)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            My workspace
            <ChevronRight size={13} />
            <strong>
              {navigation.find((n) => n.id === view)?.label || headings[view][0].split('.')[0]}
            </strong>
          </div>
          <div className="topbar-right">
            <div className="search-box">
              <Search size={16} />
              <input
                ref={searchRef}
                aria-label="Search requirements or documents"
                placeholder={
                  view === 'applications' ? 'Find an application…' : 'Find in your folder…'
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (
                    !['requirements', 'documents', 'applications'].includes(view) &&
                    e.target.value
                  ) {
                    const next = activeId ? 'requirements' : 'applications';
                    writeWorkspaceLocation(next, activeId, 'push');
                    setView(next);
                  }
                }}
              />
              <kbd>⌘ K</kbd>
            </div>
            <span className="topbar-divider" />
            <button className="icon-button" aria-label="Open help" onClick={() => navigate('help')}>
              <HelpCircle size={19} />
            </button>
            <button
              className="topbar-avatar"
              aria-label="Account settings"
              onClick={() => navigate('settings')}
            >
              {user.name.charAt(0)}
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="workspace-content">
          {user.demo && (
            <div className="demo-strip">
              <Sparkles size={14} />
              <span>You’re exploring a sample application with fictional documents.</span>
              <button disabled={!!busy} onClick={() => startCreate()}>
                Make a new application
                <ArrowRight size={13} />
              </button>
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {view === 'overview'
                  ? `GOOD TO SEE YOU, ${user.name.split(' ')[0].toUpperCase()}.`
                  : 'YOUR APPLICATION WORKSPACE'}
              </div>
              <h1>
                {view === 'overview' && !activeId
                  ? `Welcome, ${user.name.split(' ')[0]}.`
                  : headings[view][0]}
              </h1>
              <p>
                {view === 'overview' && !activeId
                  ? 'Let’s turn your next opportunity into a clear, organized application.'
                  : headings[view][1]}
              </p>
            </div>
            <button className="primary" disabled={!!busy} onClick={() => startCreate()}>
              <Plus size={17} />
              New application
            </button>
          </div>
          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button
                className="icon-button"
                aria-label="Dismiss error"
                onClick={() => setError('')}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {packets.length > 1 && (
            <label className="packet-switcher">
              Active packet
              <select value={activeId} onChange={(e) => navigate(view, e.target.value)}>
                {packets.map((item) => (
                  <option key={item.packet.id} value={item.packet.id}>
                    {item.packet.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {(view === 'applications' || (view === 'overview' && !activeId)) && (
            <WorkspaceHome
              user={user}
              packets={packets}
              search={search}
              onCreate={startCreate}
              onOpen={openApplication}
              onArchive={(p) => void archiveApplication(p)}
              onNavigate={navigate}
            />
          )}
          {!activeId && (view === 'requirements' || view === 'documents' || view === 'report') && (
            <EmptySection
              view={view}
              onCreate={startCreate}
              onUpload={() => inputRef.current?.click()}
            />
          )}
          {activeId &&
            !data &&
            ['overview', 'requirements', 'documents', 'report'].includes(view) && (
              <div className="loading-card" role="status">
                <RefreshCw className="spin" size={22} />
                Opening your application…
              </div>
            )}
          {data && ['overview', 'requirements', 'documents', 'report'].includes(view) && (
            <div className="application-context">
              <div>
                <span className="context-dot" />
                <strong>{data.packet.title}</strong>
                <span>{data.packet.destination || 'Your application workspace'}</span>
              </div>
              <div>
                <span
                  className={`deadline-badge ${deadlineInfo(data.packet.deadline).urgent ? 'urgent' : ''}`}
                >
                  <Clock size={13} />
                  {deadlineInfo(data.packet.deadline).label}
                </span>
                <button className="text-link" onClick={() => setModal('details')}>
                  Edit details
                </button>
                <button
                  className="outline"
                  disabled={!!busy}
                  onClick={() =>
                    void perform('download', () =>
                      download(`/packets/${activeId}/download`, 'jky-folder-application.zip'),
                    )
                  }
                >
                  <Download size={15} />
                  Download folder
                </button>
              </div>
            </div>
          )}
          {data && view === 'overview' && (
            <>
              <section className="application-card">
                <div className="application-info">
                  <span className="application-icon">
                    <FolderOpen size={27} />
                  </span>
                  <div>
                    <span className="eyebrow">CURRENT APPLICATION</span>
                    <h2>
                      {pack.title}
                      <span className="cycle-tag">{pack.cycle} CYCLE</span>
                    </h2>
                    <p>{data.packet.title}</p>
                  </div>
                </div>
                <div className="application-actions">
                  <span className="reference-pill">
                    <span />
                    {pack.assurance === 'reference' ? 'Reference checklist' : 'Your checklist'}
                  </span>
                  <button className="outline" onClick={() => setModal('details')}>
                    Application details
                    <ArrowUpRight size={15} />
                  </button>
                </div>
                <div className="application-footer">
                  <span>
                    <ShieldCheck size={14} />
                    Private packet
                  </span>
                  <span>
                    <BookOpen size={14} />
                    {pack.assurance === 'reference'
                      ? 'Source checked'
                      : 'Checklist configured'}{' '}
                    {date(pack.checkedAt)}
                  </span>
                  {pack.sourceUrl && (
                    <a href={pack.sourceUrl} target="_blank" rel="noreferrer">
                      {pack.assurance === 'reference'
                        ? 'Official instructions'
                        : 'Your source instructions'}
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </section>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon mint">
                    <CheckCheck size={19} />
                  </span>
                  <div>
                    <span>Evidence reviewed</span>
                    <strong>
                      {live?.counts.pass || 0}
                      <small>/ {required.length}</small>
                    </strong>
                  </div>
                  <p>File checked + your content review</p>
                </div>
                <div className="stat-card">
                  <span className="stat-icon peach">
                    <AlertCircle size={19} />
                  </span>
                  <div>
                    <span>Needs attention</span>
                    <strong>{(live?.counts.fail || 0) + (live?.counts.error || 0)}</strong>
                  </div>
                  <p>Missing evidence or a file to fix</p>
                </div>
                <div className="stat-card">
                  <span className="stat-icon butter">
                    <Clock size={19} />
                  </span>
                  <div>
                    <span>Still to review</span>
                    <strong>
                      {(live?.counts.needs_review || 0) +
                        (live?.counts.unknown || 0) +
                        (live?.counts.pending || 0)}
                    </strong>
                  </div>
                  <p>A question, a check, a next step</p>
                </div>
                <div className="stat-card">
                  <span className="stat-icon lilac">
                    <Files size={19} />
                  </span>
                  <div>
                    <span>Documents in your folder</span>
                    <strong>{data.documents.length}</strong>
                  </div>
                  <p>Originals stay together and private</p>
                </div>
              </div>
              <div className="overview-grid">
                <section className="panel next-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">NEXT STEPS</span>
                      <h2>
                        Next actions<span className="number-pill">{nextSteps.length}</span>
                      </h2>
                    </div>
                    <button className="text-link" onClick={() => navigate('requirements')}>
                      View checklist
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <p className="panel-description">
                    A few things to take care of before you move forward.
                  </p>
                  {nextSteps.length ? (
                    nextSteps.slice(0, 3).map((check, i) => (
                      <button
                        className="next-step"
                        key={check.requirementId}
                        onClick={() =>
                          check.state === 'unknown'
                            ? setModal('profile')
                            : setEvidence(
                                pack.requirements.find((r) => r.id === check.requirementId)!,
                              )
                        }
                      >
                        <span
                          className={`step-symbol ${check.state === 'fail' ? 'peach' : 'butter'}`}
                        >
                          {check.state === 'fail' ? <AlertCircle size={18} /> : <EyeIcon />}
                        </span>
                        <span className="step-content">
                          <span className="step-kind">
                            {check.state === 'fail'
                              ? 'EVIDENCE NEEDED'
                              : check.state === 'unknown'
                                ? 'DETAIL TO CONFIRM'
                                : 'A LITTLE REVIEW'}
                          </span>
                          <strong>{check.title}</strong>
                          <small>
                            {check.requirementId === 'name-change'
                              ? 'Your profile says your names differ. Connect the supporting evidence.'
                              : check.requirementId === 'category'
                                ? `You selected ${data.packet.profile.category.toUpperCase()}. Add the supporting certificate.`
                                : check.reason}
                          </small>
                        </span>
                        <ChevronRight size={17} />
                      </button>
                    ))
                  ) : (
                    <div className="all-reviewed">
                      <CheckCheck size={34} />
                      <h3>Supported checks are reviewed.</h3>
                      <p>
                        Keep the checklist’s limitations in mind and confirm the official
                        instructions before submitting.
                      </p>
                    </div>
                  )}
                  <div className="next-panel-footer">
                    <ShieldCheck size={15} />
                    <span>No guesswork. Unknown answers stay visible.</span>
                  </div>
                </section>
                <section className="panel progress-panel">
                  <span className="eyebrow">YOUR PACKET AT A GLANCE</span>
                  <h2>Review progress</h2>
                  <div
                    className="progress-ring"
                    style={
                      {
                        '--progress': `${required.length ? ((live?.counts.pass || 0) / required.length) * 100 : 0}%`,
                      } as React.CSSProperties
                    }
                  >
                    <div>
                      <strong>
                        {live?.counts.pass || 0}
                        <span> / {required.length}</span>
                      </strong>
                      <small>evidence items reviewed</small>
                    </div>
                  </div>
                  <div className="progress-legend">
                    <span>
                      <i className="legend-dot green" />
                      Reviewed<strong>{live?.counts.pass || 0}</strong>
                    </span>
                    <span>
                      <i className="legend-dot orange" />
                      Action needed
                      <strong>{(live?.counts.fail || 0) + (live?.counts.error || 0)}</strong>
                    </span>
                    <span>
                      <i className="legend-dot yellow" />
                      Unresolved
                      <strong>
                        {(live?.counts.unknown || 0) +
                          (live?.counts.needs_review || 0) +
                          (live?.counts.pending || 0)}
                      </strong>
                    </span>
                  </div>
                  <button
                    className="primary full"
                    onClick={() => void checkPacket()}
                    disabled={!!busy}
                  >
                    {busy === 'evaluate' ? 'Checking…' : 'Run a packet review'}
                    <ArrowRight size={16} />
                  </button>
                  <p className="microcopy">
                    Scoped checks, not an admission or authenticity guarantee.
                  </p>
                </section>
              </div>
              <section className="panel recent-panel">
                <div className="panel-heading">
                  <h2>
                    In your folder<span className="number-pill">{data.documents.length}</span>
                  </h2>
                  <button className="text-link" onClick={() => navigate('documents')}>
                    All documents
                    <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="recent-documents">
                  {data.documents.slice(0, 3).map((doc) => (
                    <button
                      className="recent-document"
                      key={doc.id}
                      onClick={() => setPreview(doc)}
                    >
                      <span
                        className={`file-icon ${doc.mime === 'image/jpeg' ? 'image-file' : ''}`}
                      >
                        {doc.mime === 'image/jpeg' ? (
                          <ImageIcon size={22} />
                        ) : (
                          <FileText size={22} />
                        )}
                      </span>
                      <span>
                        <strong>{doc.name}</strong>
                        <small>
                          {doc.status === 'ready'
                            ? `${doc.mime === 'image/jpeg' ? 'JPEG' : 'PDF'} · ${size(doc.size)} · ${doc.pageCount} page${doc.pageCount === 1 ? '' : 's'}`
                            : doc.status === 'processing'
                              ? 'Inspecting…'
                              : 'Inspection failed'}
                        </small>
                      </span>
                      <ArrowUpRight size={15} />
                    </button>
                  ))}
                  <button
                    className="add-document-mini"
                    onClick={() => inputRef.current?.click()}
                    disabled={!!busy}
                  >
                    <Plus size={20} />
                    <span>Add document</span>
                  </button>
                </div>
              </section>
              <div className="gentle-note">
                <Info size={17} />
                <p>
                  <strong>Before you submit</strong> · A reviewed item includes your own content
                  confirmation. Check your institution or employer’s original instructions for
                  details beyond this checklist’s coverage.
                </p>
                <button onClick={() => navigate('help')}>
                  What we check
                  <ArrowRight size={14} />
                </button>
              </div>
            </>
          )}
          {data && view === 'requirements' && (
            <section className="panel checklist-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">
                    {pack.title} ·{' '}
                    {pack.assurance === 'reference' ? 'REFERENCE CHECKLIST' : 'YOUR CHECKLIST'}
                  </span>
                  <h2>Requirements & evidence</h2>
                </div>
                <div className="button-row">
                  {data.packet.customPack && (
                    <button className="outline" onClick={() => setModal('checklist')}>
                      Edit checklist
                    </button>
                  )}
                  <button className="outline" onClick={() => setModal('profile')}>
                    Edit application details
                  </button>
                  <button className="primary" disabled={!!busy} onClick={() => void checkPacket()}>
                    <RefreshCw size={15} />
                    Run review
                  </button>
                </div>
              </div>
              <div className="filter-tabs">
                {[
                  ['all', 'All requirements'],
                  ['attention', 'Needs attention'],
                  ['reviewed', 'Reviewed'],
                  ['excluded', 'Not required'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className={filter === id ? 'active' : ''}
                    onClick={() => setFilter(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="checklist-rows">
                {live?.checks
                  .filter(
                    (check) =>
                      (!search ||
                        `${check.title} ${check.reason}`
                          .toLowerCase()
                          .includes(search.toLowerCase())) &&
                      (filter === 'all' ||
                        (filter === 'attention' &&
                          check.state !== 'pass' &&
                          check.state !== 'not_applicable') ||
                        (filter === 'reviewed' && check.state === 'pass') ||
                        (filter === 'excluded' && check.state === 'not_applicable')),
                  )
                  .map((check) => (
                    <article
                      className={`requirement-row ${check.state === 'not_applicable' ? 'not-required' : ''}`}
                      key={check.requirementId}
                    >
                      <span
                        className={`requirement-icon ${check.state === 'pass' ? 'mint' : check.state === 'fail' ? 'peach' : 'neutral'}`}
                      >
                        {check.state === 'pass' ? (
                          <Check size={20} />
                        ) : check.state === 'fail' ? (
                          <AlertCircle size={20} />
                        ) : (
                          <FileText size={20} />
                        )}
                      </span>
                      <div className="requirement-copy">
                        <span className="row-group">{check.group}</span>
                        <h3>{check.title}</h3>
                        <p>{check.reason}</p>
                        {check.evidence && (
                          <span className="linked-file">
                            <Link2 size={12} />
                            {check.evidence.name} · page {check.evidence.pageFrom}
                            {check.evidence.pageTo !== check.evidence.pageFrom
                              ? `–${check.evidence.pageTo}`
                              : ''}
                            {check.verification === 'user' ? ' · reviewed by you' : ''}
                          </span>
                        )}
                      </div>
                      <div className="requirement-actions">
                        <Status state={check.state} />
                        <button
                          className="text-link"
                          onClick={() =>
                            check.state === 'unknown'
                              ? setModal('profile')
                              : setEvidence(
                                  pack.requirements.find((r) => r.id === check.requirementId)!,
                                )
                          }
                        >
                          {check.state === 'unknown'
                            ? 'Confirm details'
                            : check.evidence
                              ? 'Review evidence'
                              : 'Connect evidence'}
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
              {search &&
                !live?.checks.some((check) =>
                  `${check.title} ${check.reason}`.toLowerCase().includes(search.toLowerCase()),
                ) && <div className="empty-small">No requirements match “{search}”.</div>}
              <div className="panel-note">
                <Info size={15} />
                This is a live checklist preview. Run a review to save a dated report.
              </div>
            </section>
          )}
          {data && view === 'documents' && (
            <>
              {uploadBatch?.packetId === activeId && (
                <UploadQueue
                  items={uploadBatch.items}
                  busy={busy === 'upload'}
                  onRetry={(files) => void upload(files)}
                  onDismiss={() => setUploadBatch(null)}
                />
              )}
              <section
                className="upload-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!busy) void upload(e.dataTransfer.files);
                }}
              >
                <span className="upload-icon">
                  <Upload size={27} />
                </span>
                <h2>
                  {busy === 'upload'
                    ? 'Adding your documents…'
                    : 'A place for every supporting document.'}
                </h2>
                <p>Drop your files here, or choose them from your device.</p>
                <button
                  className="primary"
                  onClick={() => inputRef.current?.click()}
                  disabled={!!busy}
                >
                  <Plus size={16} />
                  Choose documents
                </button>
                <small>PDF or JPEG · Up to 10 MB per file · 10 files per packet</small>
              </section>
              <section className="panel documents-panel">
                <div className="panel-heading">
                  <h2>
                    Your originals<span className="number-pill">{data.documents.length}</span>
                  </h2>
                  <span className="private-label">
                    <ShieldCheck size={14} />
                    Private to your account
                  </span>
                </div>
                <div className="document-table">
                  <div className="table-heading">
                    <span>DOCUMENT</span>
                    <span>FILE DETAILS</span>
                    <span>INSPECTION</span>
                    <span />
                  </div>
                  {data.documents
                    .filter(
                      (d) =>
                        !search ||
                        `${d.name} ${d.pages.map((p) => p.text).join(' ')}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                    )
                    .map((doc) => (
                      <div className="document-row" key={doc.id}>
                        <button className="document-name" onClick={() => setPreview(doc)}>
                          <span
                            className={`file-icon ${doc.mime === 'image/jpeg' ? 'image-file' : ''}`}
                          >
                            {doc.mime === 'image/jpeg' ? (
                              <ImageIcon size={21} />
                            ) : (
                              <FileText size={21} />
                            )}
                          </span>
                          <span>
                            <strong>{doc.name}</strong>
                            <small>Added {date(doc.createdAt)}</small>
                          </span>
                        </button>
                        <span className="document-details">
                          {size(doc.size)}
                          <small>
                            {doc.status === 'ready'
                              ? `${doc.pageCount} page${doc.pageCount === 1 ? '' : 's'}`
                              : 'Awaiting inspection'}
                          </small>
                        </span>
                        <span>
                          {doc.status === 'ready' ? (
                            <span className="status status-pass">
                              <Check size={13} />
                              Inspected
                            </span>
                          ) : (
                            <span className="inspection-actions">
                              <Status state={doc.status === 'processing' ? 'pending' : 'error'} />
                              {doc.status === 'error' && (
                                <button
                                  className="text-link"
                                  disabled={!!busy}
                                  onClick={() =>
                                    void perform('retry', async () => {
                                      await api(`/packets/${activeId}/documents/${doc.id}/retry`, {
                                        method: 'POST',
                                        body: body({ expectedRevision: data.packet.revision }),
                                      });
                                      await refresh();
                                    })
                                  }
                                >
                                  Retry inspection
                                  <RefreshCw size={12} />
                                </button>
                              )}
                            </span>
                          )}
                        </span>
                        <button
                          className="icon-button delete-button"
                          aria-label={`Delete ${doc.name}`}
                          onClick={() => setDeleteDoc(doc)}
                          disabled={!!busy}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  {!data.documents.length && (
                    <div className="empty-small">Your folder is ready for its first document.</div>
                  )}
                  {search &&
                    !data.documents.some((d) =>
                      `${d.name} ${d.pages.map((p) => p.text).join(' ')}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    ) && <div className="empty-small">No documents match “{search}”.</div>}
                </div>
                <div className="panel-note">
                  <ShieldCheck size={15} />
                  Originals are preserved. Inspection checks a file’s structure, not its
                  authenticity.
                </div>
              </section>
            </>
          )}
          {data && view === 'report' && (
            <>
              {selectedRun ? (
                <section className="panel report-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">DATED REVIEW SNAPSHOT</span>
                      <h2>{data.packet.title}</h2>
                      <p className="panel-description">
                        {selectedRun.checklist?.title || pack.title} · {date(selectedRun.createdAt)}{' '}
                        · Revision {selectedRun.packetRevision}
                      </p>
                    </div>
                    <div className="button-row no-print">
                      <button
                        className="outline"
                        onClick={() =>
                          void perform('export', async () => {
                            await download(
                              `/packets/${activeId}/reports/${selectedRun.id}`,
                              'jky-folder-report.json',
                            );
                            setToast('Report downloaded.');
                          })
                        }
                        disabled={!!busy}
                      >
                        <Download size={15} />
                        Export JSON
                      </button>
                      <button className="outline" onClick={() => window.print()}>
                        <Printer size={15} />
                        Print / PDF
                      </button>
                    </div>
                  </div>
                  {data.runs.length > 1 && (
                    <label className="report-history no-print">
                      Review history
                      <select value={selectedRun.id} onChange={(e) => setReportId(e.target.value)}>
                        {data.runs.map((run) => (
                          <option key={run.id} value={run.id}>
                            Revision {run.packetRevision} ·{' '}
                            {new Date(run.createdAt).toLocaleString('en-IN')}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {stale && (
                    <div className="stale-banner" role="status">
                      <RefreshCw size={19} />
                      <span>
                        This report is historical. Your packet, checklist or evaluator has changed.
                      </span>
                      <button
                        className="text-link"
                        onClick={() => void checkPacket()}
                        disabled={!!busy}
                      >
                        Run a fresh review
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                  <div
                    className={`report-summary ${selectedRun.summary === 'ready_for_supported_checks' ? 'summary-reviewed' : ''}`}
                  >
                    <FileCheck2 size={32} />
                    <div>
                      <span className="eyebrow">
                        {stale ? 'HISTORICAL RESULT' : 'REVIEW OUTCOME'}
                      </span>
                      <h3>
                        {selectedRun.summary === 'action_required'
                          ? 'A few things need your attention.'
                          : selectedRun.summary === 'ready_for_supported_checks'
                            ? 'Your supported checks are reviewed.'
                            : selectedRun.summary === 'processing'
                              ? 'Some evidence is still processing.'
                              : 'A little more review is needed.'}
                      </h3>
                      <p>
                        {selectedRun.counts.pass} reviewed ·{' '}
                        {selectedRun.counts.fail + selectedRun.counts.error} action needed ·{' '}
                        {selectedRun.counts.unknown +
                          selectedRun.counts.needs_review +
                          selectedRun.counts.pending}{' '}
                        unresolved
                      </p>
                    </div>
                  </div>
                  <div className="report-checks">
                    {selectedRun.checks.map((check) => (
                      <article key={check.requirementId}>
                        <div>
                          <h3>{check.title}</h3>
                          <p>{check.reason}</p>
                          {check.evidence && (
                            <small>
                              {check.evidence.name} · page {check.evidence.pageFrom} ·{' '}
                              {check.verification === 'user'
                                ? 'Your content confirmation'
                                : 'Technical check only'}
                            </small>
                          )}
                          {check.reviewNote && <blockquote>{check.reviewNote}</blockquote>}
                        </div>
                        <Status state={check.state} />
                      </article>
                    ))}
                  </div>
                  <section className="report-limits">
                    <h3>
                      <Info size={17} />
                      The boundaries of this review
                    </h3>
                    <ul>
                      {selectedRun.limitations.map((limit) => (
                        <li key={limit}>{limit}</li>
                      ))}
                    </ul>
                    {(selectedRun.checklist?.sourceUrl ?? pack.sourceUrl) && (
                      <a
                        className="source-link"
                        href={selectedRun.checklist?.sourceUrl ?? pack.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source instructions
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <p className="microcopy">
                      Pack {selectedRun.packVersion} · Evaluator {selectedRun.evaluatorVersion} ·
                      Run {selectedRun.id}
                    </p>
                  </section>
                </section>
              ) : (
                <section className="empty-workspace">
                  <FileCheck2 size={48} />
                  <h2>Your first review is waiting.</h2>
                  <p>
                    Save a snapshot of your requirements and evidence, with all unresolved checks
                    included.
                  </p>
                  <button className="primary" disabled={!!busy} onClick={() => void checkPacket()}>
                    Run a packet review
                    <ArrowRight size={16} />
                  </button>
                </section>
              )}
            </>
          )}
          {view === 'activity' && <ActivityFeed packets={packets} />}
          {view === 'help' && (
            <div className="help-grid">
              <section className="panel help-panel">
                <span className="eyebrow">THE WAY IT WORKS</span>
                <h2>How to review an application</h2>
                {[
                  [
                    '1',
                    'Tell us your application details',
                    'Confirmed answers decide which requirements apply. Leave an answer unknown when you need to check it.',
                  ],
                  [
                    '2',
                    'Bring your originals together',
                    'Upload PDF or JPEG evidence. Files are inspected before they can be linked or downloaded.',
                  ],
                  [
                    '3',
                    'Connect and inspect your evidence',
                    'Open a requirement, select its supporting file and page, and review the content against the official instructions.',
                  ],
                  [
                    '4',
                    'Save a dated packet review',
                    'A report keeps its input revisions and unresolved findings. A changed packet needs a fresh review.',
                  ],
                ].map(([n, title, text]) => (
                  <article className="help-step" key={n}>
                    <span>{n}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </article>
                ))}
              </section>
              <section className="panel help-panel">
                <span className="eyebrow">GOOD TO KNOW</span>
                <h2>Frequently asked questions</h2>
                <details open>
                  <summary>Does “reviewed” mean accepted?</summary>
                  <p>
                    No. It means the supported format check and your content confirmation are
                    recorded. It does not guarantee authenticity, eligibility or admission.
                  </p>
                </details>
                <details>
                  <summary>Why is a requirement still unknown?</summary>
                  <p>
                    A required profile answer or interpretable piece of evidence is missing. Unknown
                    is kept visible so the checklist does not give false confidence.
                  </p>
                </details>
                <details>
                  <summary>How do custom checklists work?</summary>
                  <p>
                    Choose a starter or paste your actual document instructions. Importing creates
                    one editable item per nonempty line. Confirm required items, formats and
                    conditions yourself; the app does not interpret admissions or employer rules
                    automatically.
                  </p>
                </details>
                <details>
                  <summary>What if one upload fails?</summary>
                  <p>
                    Each file has a separate result. Accepted files remain in your folder while
                    rejected files show the reason. You can retry a temporary failure or choose a
                    supported PDF or JPEG replacement.
                  </p>
                </details>
                <details>
                  <summary>Can you read scanned PDFs?</summary>
                  <p>
                    Text-based PDF pages are extracted. Image-only pages need manual review; OCR is
                    not available in this development release.
                  </p>
                </details>
                <details>
                  <summary>Where are my documents stored?</summary>
                  <p>
                    In this server’s private development data directory, outside the public assets.
                    Only your authenticated account can request them. Use fictional documents until
                    the public launch reviews are complete.
                  </p>
                </details>
                <details>
                  <summary>What happens when I delete evidence?</summary>
                  <p>
                    The active original, extracted content and links are removed. Saved reports for
                    that packet are purged so deleted evidence does not remain in a report snapshot.
                  </p>
                </details>
                {pack.sourceUrl && (
                  <a className="source-link" href={pack.sourceUrl} target="_blank" rel="noreferrer">
                    Read the {pack.title} source instructions
                    <ExternalLink size={14} />
                  </a>
                )}
              </section>
              <section className="panel help-limitations">
                <h2>Checklist coverage</h2>
                <ul>
                  {pack.limitations.map((limit) => (
                    <li key={limit}>{limit}</li>
                  ))}
                </ul>
              </section>
            </div>
          )}
          {view === 'settings' && (
            <div className="settings-grid">
              <AccountSettings user={user} onUser={setUser} />
              <section className="panel settings-panel">
                <span className="eyebrow">YOUR ACCOUNT</span>
                <h2>{user.name}</h2>
                <p>
                  {user.demo
                    ? 'An isolated fictional demo workspace. It expires after 24 hours.'
                    : user.email}
                </p>
                <div className="settings-line">
                  <ShieldCheck size={19} />
                  <div>
                    <strong>Private by default</strong>
                    <p>Evidence access is tied to your signed-in account.</p>
                  </div>
                </div>
                <div className="settings-line">
                  <Files size={19} />
                  <div>
                    <strong>
                      {packets.length} application packet{packets.length === 1 ? '' : 's'}
                    </strong>
                    <p>Each packet has its own profile, evidence and review history.</p>
                  </div>
                </div>
                <button
                  className="outline"
                  disabled={!!busy}
                  onClick={() =>
                    void perform('logout', async () => {
                      await api('/auth/logout', { method: 'POST', body: body({}) });
                      setUser(null);
                      setData(null);
                      setActiveId('');
                      setCsrf('');
                    })
                  }
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </section>
              <section className="panel settings-panel">
                <span className="eyebrow">YOU’RE IN CONTROL</span>
                <h2>Keep what you need.</h2>
                <p>
                  Deleting removes active originals and extracted content. Deleted evidence will no
                  longer be available in your reports.
                </p>
                {data && (
                  <div className="danger-setting">
                    <div>
                      <strong>Delete this packet</strong>
                      <p>{data.packet.title}</p>
                    </div>
                    <button className="danger-outline" onClick={() => setModal('delete-packet')}>
                      Delete packet
                    </button>
                  </div>
                )}
                <div className="danger-setting">
                  <div>
                    <strong>Delete your account</strong>
                    <p>Remove all packets, documents and sessions.</p>
                  </div>
                  <button className="danger-outline" onClick={() => setModal('delete-account')}>
                    Delete account
                  </button>
                </div>
              </section>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            className="visually-hidden"
            aria-label="Choose documents to upload"
            accept=".pdf,.jpg,.jpeg"
            multiple
            onChange={(e) => void upload(e.target.files)}
          />
          <footer className="workspace-footer">
            <span>One folder. A clearer next step.</span>
            <span>
              <ShieldCheck size={13} />
              Your evidence stays yours.
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {modal === 'create' && (
        <ApplicationWizard
          initialTemplate={createTemplate}
          onClose={() => {
            setModal(null);
            setQueuedFiles([]);
          }}
          onCreate={createApplication}
        />
      )}
      {modal === 'details' && data && (
        <ApplicationDetails
          packet={data.packet}
          onClose={() => setModal(null)}
          onSave={async (details) => {
            await update(
              `/packets/${activeId}`,
              { expectedRevision: data.packet.revision, details },
              'PATCH',
            );
            await refresh();
            setModal(null);
            setToast('Application details saved.');
          }}
        />
      )}
      {modal === 'checklist' && data && (
        <ChecklistEditor
          pack={pack}
          notes={data.packet.notes || ''}
          onClose={() => setModal(null)}
          onSave={async (input) => {
            await update(
              `/packets/${activeId}/checklist`,
              { expectedRevision: data.packet.revision, ...input },
              'PUT',
            );
            await refresh();
            setModal(null);
            setToast('Checklist updated. Save a fresh review when ready.');
          }}
        />
      )}
      {modal === 'profile' && data && (
        <ProfileDialog
          profile={data.packet.profile}
          onClose={() => setModal(null)}
          onSave={async (profile) => {
            await update(
              `/packets/${activeId}/profile`,
              { expectedRevision: data.packet.revision, profile },
              'PATCH',
            );
            await refresh();
            setModal(null);
            setToast('Application details saved. Run a new review when you’re ready.');
          }}
        />
      )}
      {evidence && data && (
        <EvidenceDialog
          requirement={evidence}
          pack={pack}
          documents={data.documents}
          existing={data.packet.links[evidence.id]}
          packetId={activeId}
          onUpload={() => {
            setEvidence(null);
            navigate('documents');
            inputRef.current?.click();
          }}
          onClose={() => setEvidence(null)}
          onSave={async (link) => {
            await update(
              `/packets/${activeId}/evidence/${evidence.id}`,
              { expectedRevision: data.packet.revision, ...link },
              'PUT',
            );
            await refresh();
            setEvidence(null);
            setToast('Evidence connected. Run a review to save the updated result.');
          }}
        />
      )}
      {preview && (
        <Dialog wide title={preview.name} onClose={() => setPreview(null)}>
          <div className="dialog-body">
            <div className="document-preview-detail">
              {preview.status === 'ready' ? (
                preview.mime === 'image/jpeg' ? (
                  <img
                    src={`/api/packets/${activeId}/documents/${preview.id}/content`}
                    alt={`Original evidence ${preview.name}`}
                  />
                ) : (
                  <>
                    <PdfPreview
                      url={`/api/packets/${activeId}/documents/${preview.id}/content`}
                      name={preview.name}
                    />
                    <details className="extracted-text-details">
                      <summary>Extracted document text</summary>
                      {preview.pages.map((page) => (
                        <section key={page.number}>
                          <span className="eyebrow">PAGE {page.number}</span>
                          <pre>
                            {page.text ||
                              'No text extracted. Download and review the original manually.'}
                          </pre>
                        </section>
                      ))}
                    </details>
                  </>
                )
              ) : (
                <p>
                  {preview.status === 'processing'
                    ? 'This file is being inspected. It will be available shortly.'
                    : preview.error || 'This file could not be inspected.'}
                </p>
              )}
            </div>
            <p className="microcopy">
              {size(preview.size)} · Uploaded {date(preview.createdAt)}
            </p>
            {preview.status === 'ready' && (
              <a
                className="primary"
                href={`/api/packets/${activeId}/documents/${preview.id}/content`}
                download={preview.name}
              >
                <Download size={16} />
                Download original
              </a>
            )}
            <p className="microcopy">
              Extracted text is a reading aid. Always compare it with the original.
            </p>
          </div>
        </Dialog>
      )}
      {(modal === 'delete-packet' || modal === 'delete-account' || deleteDoc) && (
        <Dialog
          title={
            deleteDoc
              ? 'Delete this document?'
              : modal === 'delete-account'
                ? 'Delete your entire workspace?'
                : 'Delete this application packet?'
          }
          onClose={() => {
            if (!busy) {
              setModal(null);
              setDeleteDoc(null);
            }
          }}
        >
          <div className="dialog-body">
            <div className="soft-notice danger-notice">
              <Trash2 size={20} />
              <p>
                {deleteDoc
                  ? 'The original, extracted pages and links will be removed. Reports for this packet will also be removed.'
                  : modal === 'delete-account'
                    ? 'All your application packets, documents, reports and account sessions will be removed.'
                    : 'All documents, evidence links and reports in this packet will be removed.'}{' '}
                This cannot be undone.
              </p>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="button-row">
              <button
                className="outline"
                onClick={() => {
                  setModal(null);
                  setDeleteDoc(null);
                }}
                disabled={!!busy}
              >
                Keep it
              </button>
              <button
                className="danger"
                disabled={!!busy}
                onClick={() =>
                  void perform('delete', async () => {
                    if (modal === 'delete-account') {
                      await api('/account', {
                        method: 'DELETE',
                        body: body({ confirmation: 'DELETE' }),
                      });
                      setUser(null);
                      setActiveId('');
                      setData(null);
                      setCsrf('');
                    } else if (deleteDoc && data) {
                      await api(`/packets/${activeId}/documents/${deleteDoc.id}`, {
                        method: 'DELETE',
                        body: body({ expectedRevision: data.packet.revision }),
                      });
                      await refresh();
                    } else if (data) {
                      await api(`/packets/${activeId}`, {
                        method: 'DELETE',
                        body: body({ expectedRevision: data.packet.revision }),
                      });
                      await refresh();
                    }
                    setDeleteDoc(null);
                    setModal(null);
                    setToast('Removed from your workspace.');
                  })
                }
              >
                {busy === 'delete' ? 'Removing…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
function EyeIcon() {
  return <Search size={18} />;
}
