import { useState, type CSSProperties } from 'react';
import { Archive, ArrowRight, RotateCcw, Search } from 'lucide-react';
import { deadlineInfo } from '../../shared/templates';
import { kindLabel, useCatalog } from '../catalog';
import { StateMark, dateTime, plural } from './Status';
import type { CheckState, EvaluationRun, Packet, User } from '../../shared/model';
export interface PacketCard {
  packet: Packet;
  documentCount: number;
  latestRun: EvaluationRun | null;
  currentCounts?: Record<CheckState, number>;
  requirementCount?: number;
  checklist?: { title: string; assurance: 'reference' | 'user_defined' };
}
const filters = [
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
  { id: 'all', label: 'All applications' },
] as const;

export function WorkspaceHome({
  user,
  packets,
  search,
  onCreate,
  onOpen,
  onArchive,
}: {
  user: User;
  packets: PacketCard[];
  search: string;
  onCreate: (template?: string) => void;
  onOpen: (id: string) => void;
  onArchive: (packet: Packet) => void;
}) {
  const catalog = useCatalog();
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('active'),
    [sort, setSort] = useState('recent');
  const docs = packets.reduce((n, p) => n + p.documentCount, 0);
  const active = packets.filter((p) => !p.packet.archived);
  const soon = active.filter(
    (p) => p.packet.deadline && deadlineInfo(p.packet.deadline).urgent,
  ).length;
  const displayed = packets
    .filter(
      ({ packet: p }) =>
        (filter === 'all' || (filter === 'archived' ? p.archived : !p.archived)) &&
        `${p.title} ${p.destination || ''}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'deadline'
        ? (a.packet.deadline || '9999').localeCompare(b.packet.deadline || '9999')
        : b.packet.updatedAt.localeCompare(a.packet.updatedAt),
    );
  if (!packets.length)
    return <EmptySection view="home" onCreate={onCreate} onUpload={() => onCreate()} />;
  return (
    <div className="portfolio">
      {
        <>
          <p className="portfolio-summary">
            {plural(active.length, 'active application')}, {plural(docs, 'document')} in folders
            {soon ? (
              <>
                , and <strong>{plural(soon, 'deadline')}</strong> within 7 days.
              </>
            ) : (
              ', and no deadline in the next 7 days.'
            )}
          </p>
          <div className="portfolio-toolbar">
            <div className="filter-tabs" role="group" aria-label="Show applications">
              {filters.map((f) => (
                <button
                  key={f.id}
                  aria-pressed={filter === f.id}
                  className={filter === f.id ? 'active' : ''}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="sort-control">
              Sort by
              <select
                aria-label="Sort applications"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recent">Recently updated</option>
                <option value="deadline">Deadline</option>
              </select>
            </label>
          </div>
          <ul className="folder-grid">
            {displayed.map(
              ({ packet: p, documentCount, currentCounts, latestRun, checklist }, i) => {
                const due = deadlineInfo(p.deadline);
                const counts = currentCounts || latestRun?.counts;
                const required = counts
                  ? Object.entries(counts)
                      .filter(([state]) => state !== 'not_applicable')
                      .reduce((n, [, v]) => n + v, 0)
                  : 0;
                const reviewed = counts?.pass || 0;
                const toFix = counts ? counts.fail + counts.error : 0;
                return (
                  <li key={p.id} style={{ '--i': i } as CSSProperties}>
                    <article
                      className={`folder-card kind-${p.kind || 'custom'} ${p.archived ? 'is-archived' : ''}`}
                      aria-labelledby={`folder-${p.id}`}
                    >
                      <span className="folder-card-tab">
                        {p.mode === 'instructions'
                          ? kindLabel(catalog, p.kind, checklist)
                          : 'Document folder'}
                      </span>
                      <div className="folder-card-body">
                        <button className="folder-card-title" onClick={() => onOpen(p.id)}>
                          <h3 id={`folder-${p.id}`}>{p.title}</h3>
                          <span>{p.destination || 'No institution added'}</span>
                        </button>
                        <div className="folder-progress" aria-hidden="true">
                          <span
                            className="progress-pass"
                            style={{ flexGrow: reviewed } as CSSProperties}
                          />
                          <span
                            className="progress-fix"
                            style={{ flexGrow: toFix } as CSSProperties}
                          />
                          <span
                            className="progress-rest"
                            style={
                              {
                                flexGrow: Math.max(0, required - reviewed - toFix),
                              } as CSSProperties
                            }
                          />
                        </div>
                        <p className="folder-facts">
                          <span>
                            <StateMark state="pass" size={16} />
                            {reviewed} of {required} reviewed
                          </span>
                          {toFix > 0 && (
                            <span>
                              <StateMark state="fail" size={16} />
                              {toFix} to fix
                            </span>
                          )}
                        </p>
                        <dl className="folder-meta">
                          <div>
                            <dt>Deadline</dt>
                            <dd className={due.urgent ? 'is-urgent' : ''}>{due.label}</dd>
                          </div>
                          <div>
                            <dt>Documents</dt>
                            <dd className="data">{documentCount}</dd>
                          </div>
                          <div>
                            <dt>Last review</dt>
                            <dd>{latestRun ? dateTime(latestRun.createdAt) : 'Not saved yet'}</dd>
                          </div>
                        </dl>
                      </div>
                      <div className="folder-card-footer">
                        <button className="text-link" onClick={() => onOpen(p.id)}>
                          Open application <ArrowRight size={15} aria-hidden="true" />
                        </button>
                        <button
                          className="icon-button"
                          title={p.archived ? 'Restore application' : 'Archive application'}
                          aria-label={`${p.archived ? 'Restore' : 'Archive'} ${p.title}`}
                          onClick={() => onArchive(p)}
                        >
                          {p.archived ? <RotateCcw size={17} /> : <Archive size={17} />}
                        </button>
                      </div>
                    </article>
                  </li>
                );
              },
            )}
          </ul>
          {!displayed.length && (
            <div className="portfolio-empty">
              <Search size={24} aria-hidden="true" />
              <h3>
                {search
                  ? 'No matching applications'
                  : filter === 'archived'
                    ? 'No archived applications'
                    : 'No active applications'}
              </h3>
              <p>
                {search
                  ? 'Try a different name or institution.'
                  : 'Create an application or change the filter to see your folders.'}
              </p>
            </div>
          )}
        </>
      }
      <p className="workspace-trust">Signed in as {user.name}.</p>
    </div>
  );
}

type EmptyView = 'home' | 'requirements' | 'documents' | 'report';

// The four steps every new user follows. Each section marks where it sits on this path.
const journey: { view: EmptyView; title: string; text: string }[] = [
  {
    view: 'home',
    title: 'Create an application',
    text: 'Pick a starter, a reference checklist, or paste the instructions you received.',
  },
  {
    view: 'documents',
    title: 'Add your original documents',
    text: 'Upload the PDF and JPEG files you plan to submit. They stay private and unchanged.',
  },
  {
    view: 'requirements',
    title: 'Connect each requirement to its page',
    text: 'Open a checklist item, choose the file and page that supports it, and note what you checked.',
  },
  {
    view: 'report',
    title: 'Save a dated review',
    text: 'See what is reviewed, missing or still unresolved, and keep a report you can print.',
  },
];

/** What a person without any application sees: an explanation and the path, nothing pre-filled. */
export function EmptySection({
  view,
  onCreate,
  onUpload,
}: {
  view: EmptyView;
  onCreate: (template?: string) => void;
  onUpload: () => void;
}) {
  const content = {
    home: {
      title: 'You have no applications yet.',
      description:
        'JKY-Folder keeps one folder per application: its checklist, its original documents and its saved reviews. Follow these four steps to prepare your first one.',
    },
    requirements: {
      title: 'Your checklist will appear here.',
      description:
        'Every application gets its own checklist, with one item for each document you need to submit. Create your first application to start one.',
    },
    documents: {
      title: 'Your documents will appear here.',
      description:
        'Each application keeps a private folder of your original files. Create an application, then upload the PDFs and JPEGs you plan to submit.',
    },
    report: {
      title: 'Your readiness report will appear here.',
      description:
        'Once your documents are connected to the checklist, save a review to get a dated report of what is ready and what still needs you.',
    },
  }[view];
  return (
    <section className={`sheet section-empty empty-${view}`} aria-labelledby="empty-title">
      <div className="empty-intro">
        <h2 id="empty-title">{content.title}</h2>
        <p>{content.description}</p>
        <div className="button-row">
          <button
            className="gold-button"
            onClick={() => onCreate(view === 'requirements' ? 'custom' : undefined)}
          >
            Create your first application
          </button>
          {view === 'documents' && (
            <button className="text-link" onClick={onUpload}>
              Or choose your documents first
            </button>
          )}
        </div>
      </div>
      <ol className="journey" aria-label="How to prepare an application">
        {journey.map((step, i) => {
          const next = i === 0;
          const here = step.view === view && view !== 'home';
          return (
            <li key={step.view} className={next ? 'is-next' : here ? 'is-here' : ''}>
              <span className="journey-number" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <strong>
                  {step.title}
                  {next && <span className="journey-tag">Start here</span>}
                  {here && <span className="journey-tag is-muted">This page</span>}
                </strong>
                <p>{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
