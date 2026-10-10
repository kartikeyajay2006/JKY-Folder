import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { AlertCircle, Check, Download, ShieldCheck, Trash2, X } from 'lucide-react';
import { Auth } from './components/Auth';
import { BrandMark } from './components/Brand';
import { Dialog } from './components/Dialog';
import { EvidenceDialog } from './components/EvidenceDialog';
import { ProfileDialog } from './components/ProfileDialog';
import { size, date } from './components/Status';
import { api, body, setCsrf, download, ApiError } from './api';
import { CatalogProvider, uploadRules, type Catalog } from './catalog';
import { ApplicationWizard, type CreateApplicationInput } from './components/ApplicationWizard';
import { WorkspaceHome, EmptySection, type PacketCard } from './components/WorkspaceHome';
import { ChecklistEditor } from './components/ChecklistEditor';
import { ApplicationDetails } from './components/ApplicationDetails';
import { ActivityFeed } from './components/ActivityFeed';
import { PdfPreview } from './components/PdfPreview';
import { type UploadItem } from './components/UploadQueue';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { QuickActions } from './components/QuickActions';
import { OverviewView } from './views/Overview';
import { ChecklistView } from './views/Checklist';
import { DocumentsView } from './views/Documents';
import { ReportView } from './views/Report';
import { HelpView } from './views/Help';
import { SettingsView } from './views/Settings';
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

const headings: Record<Exclude<View, 'overview'>, [string, string]> = {
  applications: ['Your applications', 'Every opportunity you are preparing, with its deadline.'],
  requirements: ['Checklist', 'Connect each requirement to the page that supports it.'],
  documents: ['Documents', 'Your original files, kept privately in this application’s folder.'],
  report: ['Readiness report', 'A dated record of what was checked and what still needs you.'],
  activity: ['Activity', 'Everything saved in your workspace, newest first.'],
  help: ['Help & guidance', 'How the checklist works, and what a review can and cannot tell you.'],
  settings: ['Settings & privacy', 'Your profile, password, sessions and what stays stored.'],
};
export default function App() {
  const initialLocation = useRef(readWorkspaceLocation());
  const [user, setUser] = useState<User | null>(null),
    [catalog, setCatalog] = useState<Catalog | null>(null),
    [booting, setBooting] = useState(true),
    [bootError, setBootError] = useState('');
  const [packets, setPackets] = useState<PacketCard[]>([]),
    [activeId, setActiveId] = useState(initialLocation.current.application),
    [data, setData] = useState<PacketDetail | null>(null);
  const [packetsLoaded, setPacketsLoaded] = useState(false);
  const [createTemplate, setCreateTemplate] = useState('college');
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [uploadBatch, setUploadBatch] = useState<{ packetId: string; items: UploadItem[] } | null>(
    null,
  );
  const [view, setView] = useState<View>(initialLocation.current.view),
    [busy, setBusy] = useState(''),
    [error, setError] = useState(''),
    [toast, setToastMessage] = useState(''),
    [toastAction, setToastAction] = useState<{ label: string; run: () => void } | null>(null),
    [dropping, setDropping] = useState(false),
    [search, setSearch] = useState('');
  const [modal, setModal] = useState<
      | 'create'
      | 'profile'
      | 'details'
      | 'checklist'
      | 'quick-actions'
      | 'delete-packet'
      | 'delete-account'
      | null
    >(null),
    [evidence, setEvidence] = useState<Requirement | null>(null),
    [preview, setPreview] = useState<DocumentRecord | null>(null),
    [deleteDoc, setDeleteDoc] = useState<DocumentRecord | null>(null),
    [reportId, setReportId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null),
    searchRef = useRef<HTMLInputElement>(null),
    selectionRef = useRef('');
  const packetsRef = useRef(packets);
  const ownerRef = useRef(user?.id);
  packetsRef.current = packets;
  ownerRef.current = user?.id;
  selectionRef.current = activeId;
  useLayoutEffect(() => {
    if (user) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [user?.id]);
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
    const session = api<{ user: User; csrf: string }>('/me')
      .then((result) => {
        if (alive) {
          setUser(result.user);
          setCsrf(result.csrf);
        }
      })
      .catch((e) => {
        if (alive && (!(e instanceof ApiError) || e.status !== 401)) setBootError(e.message);
      });
    const products = api<Catalog>('/catalog').then((result) => {
      if (alive) setCatalog(result);
    });
    Promise.all([session, products])
      .catch((e) => {
        if (alive) setBootError((e as Error).message);
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
    const timer = setTimeout(() => setToast(''), toastAction ? 7000 : 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '.') {
        e.preventDefault();
        setModal('quick-actions');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  // Files dragged over any page land in the current application (or start a new one).
  const latest = useRef({ upload, blocked: false, hidden: false });
  useEffect(() => {
    if (!user) return;
    let depth = 0;
    const hasFiles = (event: DragEvent) =>
      !!event.dataTransfer && Array.from(event.dataTransfer.types).includes('Files');
    const enter = (event: DragEvent) => {
      if (!hasFiles(event) || latest.current.blocked) return;
      depth++;
      if (!latest.current.hidden) setDropping(true);
    };
    const over = (event: DragEvent) => {
      if (!hasFiles(event) || latest.current.blocked) return;
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'copy';
    };
    const leave = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (!depth) setDropping(false);
    };
    const drop = (event: DragEvent) => {
      depth = 0;
      setDropping(false);
      if (!hasFiles(event) || event.defaultPrevented || latest.current.blocked) return;
      event.preventDefault();
      void latest.current.upload(event.dataTransfer!.files);
    };
    window.addEventListener('dragenter', enter);
    window.addEventListener('dragover', over);
    window.addEventListener('dragleave', leave);
    window.addEventListener('drop', drop);
    return () => {
      window.removeEventListener('dragenter', enter);
      window.removeEventListener('dragover', over);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('drop', drop);
    };
  }, [user?.id]);
  const live = data?.live || null;
  const selectedRun = data?.runs.find((r) => r.id === reportId) || data?.runs[0];
  const stale =
    !!selectedRun &&
    !!data &&
    (selectedRun.packetRevision !== data.packet.revision ||
      selectedRun.packVersion !== data.pack.version ||
      selectedRun.evaluatorVersion !== data.evaluatorVersion);
  const required = live?.checks.filter((c) => c.state !== 'not_applicable') || [];
  const nextSteps = required.filter((c) => c.state !== 'pass');
  function navigate(next: View, id = activeId) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    writeWorkspaceLocation(next, id, 'push');
    if (id !== activeId) {
      setData(null);
      setActiveId(id);
    }
    setView(next);
    setSearch('');
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
      if (e instanceof ApiError && e.status === 401) signedOut();
    } finally {
      setBusy('');
    }
  }
  function setToast(message: string) {
    notify(message);
  }
  function notify(message: string, action?: { label: string; run: () => void }) {
    setToastMessage(message);
    setToastAction(action || null);
  }
  function signedOut() {
    setUser(null);
    setData(null);
    setActiveId('');
    setCsrf('');
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
          signedOut();
          return;
        }
      }
    }
    await refresh().catch((e) => setError(e.message));
    notify(
      `${added} added${duplicates ? `, ${duplicates} already present` : ''}${failed ? `, ${failed} could not upload. See the upload results.` : '. Inspection runs separately.'}`,
      added
        ? { label: 'Open checklist', run: () => navigate('requirements', packetId) }
        : undefined,
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
      notify('Review snapshot saved. Your next steps are up to date.', {
        label: 'Open report',
        run: () => navigate('report'),
      });
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
  function logout() {
    void perform('logout', async () => {
      await api('/auth/logout', { method: 'POST', body: body({}) });
      signedOut();
    });
  }
  function openRequirement(requirementId: string) {
    const requirement = data?.pack.requirements.find((r) => r.id === requirementId);
    const check = live?.checks.find((c) => c.requirementId === requirementId);
    if (check?.state === 'unknown') setModal('profile');
    else if (requirement) setEvidence(requirement);
  }
  function chooseFiles() {
    inputRef.current?.click();
  }
  latest.current = {
    upload,
    blocked: !!modal || !!evidence || !!preview || !!deleteDoc,
    hidden: view === 'documents',
  };
  if (booting)
    return (
      <main className="boot" aria-busy="true">
        <BrandMark />
        <h1>JKY-Folder</h1>
        <p>Opening your folders…</p>
      </main>
    );
  if ((bootError && !user) || !catalog)
    return (
      <main className="boot">
        <BrandMark />
        <h1>Your workspace is temporarily unavailable.</h1>
        <p role="alert">{bootError || 'The product catalog could not be loaded.'}</p>
        <button className="primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  if (!user)
    return (
      <CatalogProvider catalog={catalog}>
        <Auth
          onAuth={(u, id) => {
            setUser(u);
            if (id) setActiveId(id);
            setView('overview');
          }}
        />
      </CatalogProvider>
    );
  const rules = uploadRules(catalog.limits);
  const perApplication =
    view === 'overview' || view === 'requirements' || view === 'documents' || view === 'report';
  const showHome = view === 'applications' || (view === 'overview' && !activeId);
  const heading: [string, string] | null =
    view === 'overview'
      ? activeId
        ? null
        : [`Welcome, ${user.name.split(' ')[0]}.`, 'Let’s set up your first application folder.']
      : headings[view];
  return (
    <CatalogProvider catalog={catalog}>
      <div className="app-shell">
        <a href="#main-content" className="skip-link">
          Skip to workspace
        </a>
        <WorkspaceHeader
          user={user}
          view={showHome && view === 'overview' ? 'applications' : view}
          search={search}
          searchRef={searchRef}
          busy={!!busy}
          attention={nextSteps.length}
          documents={data?.documents.length || 0}
          packets={packets}
          activeId={activeId}
          onNavigate={navigate}
          onSwitch={(id) => navigate(perApplication ? view : 'overview', id)}
          onQuickActions={() => setModal('quick-actions')}
          onSearch={(value) => {
            setSearch(value);
            if (!['requirements', 'documents', 'applications'].includes(view) && value) {
              const next = activeId ? 'requirements' : 'applications';
              writeWorkspaceLocation(next, activeId, 'push');
              setView(next);
            }
          }}
          onLogout={logout}
        />
        <div className="main-shell">
          <main id="main-content" tabIndex={-1} className={`workspace-content view-${view}`}>
            <div className="view-transition" key={`${view}-${activeId}`}>
              {user.demo && (
                <div className="demo-strip">
                  <span>
                    You’re in the demo. Every document here is fictional, and the workspace is
                    deleted after {catalog.limits.sessionHours} hours.
                  </span>
                  <button className="text-link" disabled={!!busy} onClick={() => startCreate()}>
                    Start your own application
                  </button>
                </div>
              )}
              {heading && (
                <div className="page-heading">
                  <div>
                    {data && perApplication && (
                      <nav aria-label="Breadcrumb" className="breadcrumb">
                        <ol>
                          <li>
                            <button onClick={() => navigate('applications')}>Applications</button>
                          </li>
                          <li>
                            <button onClick={() => navigate('overview')}>
                              {data.packet.title}
                            </button>
                          </li>
                        </ol>
                      </nav>
                    )}
                    <h1>{heading[0]}</h1>
                    <p>{heading[1]}</p>
                  </div>
                  {view === 'applications' && (
                    <button className="primary" disabled={!!busy} onClick={() => startCreate()}>
                      New application
                    </button>
                  )}
                </div>
              )}
              {error && (
                <div className="error-banner" role="alert">
                  <AlertCircle size={18} aria-hidden="true" />
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
              {showHome && (
                <WorkspaceHome
                  user={user}
                  packets={packets}
                  search={search}
                  onCreate={startCreate}
                  onOpen={(id) => navigate('overview', id)}
                  onArchive={(p) => void archiveApplication(p)}
                />
              )}
              {!activeId &&
                (view === 'requirements' || view === 'documents' || view === 'report') && (
                  <EmptySection view={view} onCreate={startCreate} onUpload={chooseFiles} />
                )}
              {activeId && !data && perApplication && (
                <div className="loading-card" role="status">
                  <BrandMark />
                  Opening your application…
                </div>
              )}
              {data && live && view === 'overview' && (
                <OverviewView
                  data={data}
                  live={live}
                  nextSteps={nextSteps}
                  busy={busy}
                  onNavigate={navigate}
                  onOpenRequirement={openRequirement}
                  onDetails={() => setModal('details')}
                  onReview={() => void checkPacket()}
                  onPreview={setPreview}
                  onUpload={chooseFiles}
                  onDownload={() =>
                    void perform('download', () =>
                      download(`/packets/${activeId}/download`, 'jky-folder-application.zip'),
                    )
                  }
                />
              )}
              {data && live && view === 'requirements' && (
                <ChecklistView
                  data={data}
                  live={live}
                  search={search}
                  busy={busy}
                  onOpenRequirement={openRequirement}
                  onEditChecklist={() => setModal('checklist')}
                  onProfile={() => setModal('profile')}
                  onReview={() => void checkPacket()}
                />
              )}
              {data && view === 'documents' && (
                <DocumentsView
                  data={data}
                  search={search}
                  busy={busy}
                  uploadBatch={uploadBatch?.packetId === activeId ? uploadBatch.items : null}
                  onUpload={(files) => void upload(files)}
                  onChoose={chooseFiles}
                  onDismissBatch={() => setUploadBatch(null)}
                  onPreview={setPreview}
                  onDelete={setDeleteDoc}
                  onRetry={(doc) =>
                    void perform('retry', async () => {
                      await api(`/packets/${activeId}/documents/${doc.id}/retry`, {
                        method: 'POST',
                        body: body({ expectedRevision: data.packet.revision }),
                      });
                      await refresh();
                    })
                  }
                />
              )}
              {data && view === 'report' && (
                <ReportView
                  data={data}
                  run={selectedRun}
                  stale={stale}
                  busy={busy}
                  onSelect={setReportId}
                  onReview={() => void checkPacket()}
                  onDownload={() =>
                    void perform('download', () =>
                      download(`/packets/${activeId}/download`, 'jky-folder-application.zip'),
                    )
                  }
                  onExport={(run) =>
                    void perform('export', async () => {
                      await download(
                        `/packets/${activeId}/reports/${run.id}`,
                        'jky-folder-report.json',
                      );
                      setToast('Report downloaded.');
                    })
                  }
                />
              )}
              {view === 'activity' && <ActivityFeed packets={packets} />}
              {view === 'help' && <HelpView pack={data?.pack} />}
              {view === 'settings' && (
                <SettingsView
                  user={user}
                  packets={packets}
                  packet={data?.packet}
                  busy={!!busy}
                  onUser={setUser}
                  onLogout={logout}
                  onDeletePacket={() => setModal('delete-packet')}
                  onDeleteAccount={() => setModal('delete-account')}
                />
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              className="visually-hidden"
              aria-label="Choose documents to upload"
              accept={rules.accept}
              multiple
              onChange={(e) => void upload(e.target.files)}
            />
            <footer className="workspace-footer">
              <span>JKY-Folder helps you prepare. Your institution decides.</span>
              <span>
                <ShieldCheck size={14} aria-hidden="true" />
                Documents are private to your account.
              </span>
            </footer>
          </main>
        </div>
        {toast && (
          <div className="toast" role="status">
            <Check size={17} aria-hidden="true" />
            <span>{toast}</span>
            {toastAction && (
              <button
                className="toast-action"
                onClick={() => {
                  toastAction.run();
                  setToast('');
                }}
              >
                {toastAction.label}
              </button>
            )}
          </div>
        )}
        {dropping && (
          <div className="drop-overlay" aria-hidden="true">
            <div className="drop-card">
              <div className="pocket pocket-large is-open">
                <span className="pocket-back" />
                <span className="pocket-sheet sheet-a" />
                <span className="pocket-sheet sheet-b" />
                <span className="pocket-front" />
              </div>
              <p>
                {data ? (
                  <>
                    Drop to add to <strong>{data.packet.title}</strong>
                  </>
                ) : (
                  'Drop to start a new application with these files'
                )}
              </p>
              <small>
                {rules.formats}, up to {rules.perFile} each. Originals are never changed.
              </small>
            </div>
          </div>
        )}
        {modal === 'quick-actions' && (
          <QuickActions
            hasApplication={!!data}
            busy={!!busy}
            packets={packets}
            activeId={activeId}
            checks={live?.checks || []}
            documents={data?.documents || []}
            onOpenApplication={(id) => navigate('overview', id)}
            onOpenRequirement={openRequirement}
            onOpenDocument={setPreview}
            onClose={() => setModal(null)}
            onCreate={() => startCreate()}
            onUpload={() => {
              navigate('documents');
              chooseFiles();
            }}
            onReview={() => void checkPacket()}
            onNavigate={navigate}
          />
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
            pack={data.pack}
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
              setToast('Checklist updated. Save a fresh review when you’re ready.');
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
              setToast('Answers saved. Run a new review when you’re ready.');
            }}
          />
        )}
        {evidence && data && (
          <EvidenceDialog
            requirement={evidence}
            pack={data.pack}
            documents={data.documents}
            existing={data.packet.links[evidence.id]}
            packetId={activeId}
            onUpload={() => {
              setEvidence(null);
              navigate('documents');
              chooseFiles();
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
            <div className="dialog-body document-dialog">
              <div className="document-preview-detail">
                {preview.status === 'ready' ? (
                  preview.mime === 'image/jpeg' ? (
                    <img
                      src={`/api/packets/${activeId}/documents/${preview.id}/content`}
                      alt={`Original evidence ${preview.name}`}
                    />
                  ) : (
                    <PdfPreview
                      url={`/api/packets/${activeId}/documents/${preview.id}/content`}
                      name={preview.name}
                    />
                  )
                ) : (
                  <p className="empty-small">
                    {preview.status === 'processing'
                      ? 'This file is being inspected. It will be available shortly.'
                      : preview.error || 'This file could not be inspected.'}
                  </p>
                )}
              </div>
              {preview.status === 'ready' && preview.mime !== 'image/jpeg' && (
                <details className="extracted-text-details">
                  <summary>Extracted document text</summary>
                  {preview.pages.map((page) => (
                    <section key={page.number} className="extracted-page">
                      <span>Page {page.number}</span>
                      <pre>
                        {page.text ||
                          'No text extracted. Download the original and review it yourself.'}
                      </pre>
                    </section>
                  ))}
                </details>
              )}
              <div className="document-dialog-footer">
                <p className="microcopy">
                  <span className="data">{size(preview.size)}</span>, uploaded{' '}
                  {date(preview.createdAt)}. Extracted text is a reading aid; always compare it with
                  the original.
                </p>
                {preview.status === 'ready' && (
                  <a
                    className="primary"
                    href={`/api/packets/${activeId}/documents/${preview.id}/content`}
                    download={preview.name}
                  >
                    <Download size={16} aria-hidden="true" />
                    Download original
                  </a>
                )}
              </div>
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
                  : 'Delete this application?'
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
                <Trash2 size={20} aria-hidden="true" />
                <p>
                  {deleteDoc
                    ? `${deleteDoc.name}, its extracted pages and its evidence links will be removed. Saved reports for this application are removed too.`
                    : modal === 'delete-account'
                      ? 'All your applications, documents, reports and sessions will be removed.'
                      : 'All documents, evidence links and reports in this application will be removed.'}{' '}
                  This cannot be undone.
                </p>
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="button-row dialog-actions">
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
                        signedOut();
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
    </CatalogProvider>
  );
}
