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
  return (
    <div className="portfolio">
      {!packets.length ? (
        <section className="first-folder" aria-labelledby="first-title">
          <div>
            <h2 id="first-title">Start with one application.</h2>
            <p>
              Pick a starting checklist, add the originals you plan to submit, and link each
              requirement to the page that supports it.
            </p>
            <button className="primary" onClick={() => onCreate()}>
              Create your first application
            </button>
          </div>
          <ol className="first-steps">
            <li>
              <strong>Choose a checklist</strong>
              <span>A starter, a reference checklist, or your own instructions.</span>
            </li>
            <li>
              <strong>Add your originals</strong>
              <span>PDF and JPEG files stay private and unchanged.</span>
            </li>
            <li>
              <strong>Save a dated review</strong>
              <span>See exactly what is missing before you submit.</span>
            </li>
          </ol>
        </section>
      ) : (
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
                        {kindLabel(catalog, p.kind, checklist)}
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
      )}
      <section className="starter-section" aria-labelledby="starter-title">
        <div className="section-head">
          <h2 id="starter-title">Start from a checklist</h2>
          <p>Every starter is editable. Reference checklists keep a dated, versioned source.</p>
        </div>
        <ul className="starter-grid">
          {catalog.packs.map((pack) => (
            <li key={pack.id}>
              <button className="starter-tile is-reference" onClick={() => onCreate(pack.id)}>
                <span className="starter-kind">Reference checklist</span>
                <strong>{pack.title}</strong>
                <p>
                  {plural(pack.requirementCount, 'item')}, {pack.conditionalCount} of them depend on
                  your answers.
                </p>
                <span className="starter-foot">
                  Use this checklist <ArrowRight size={15} aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
          {catalog.templates.map((t) => (
            <li key={t.id}>
              <button className="starter-tile" onClick={() => onCreate(t.id)}>
                <span className="starter-kind">{t.kind === 'custom' ? 'Blank' : 'Starter'}</span>
                <strong>{t.title}</strong>
                <p>{t.description}</p>
                <span className="starter-foot">
                  {t.kind === 'custom'
                    ? 'Use your own instructions'
                    : `${plural(t.starter.length, 'editable item')}`}
                  <ArrowRight size={15} aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <p className="workspace-trust">Signed in as {user.name}.</p>
    </div>
  );
}

export function EmptySection({
  view,
  onCreate,
  onUpload,
}: {
  view: 'requirements' | 'documents' | 'report';
  onCreate: (template?: string) => void;
  onUpload: () => void;
}) {
  const content = {
    requirements: {
      title: 'A checklist that matches your application.',
      description:
        'Start from your actual instructions. Add the files you need, choose formats and mark optional items before you review.',
      button: 'Build my checklist',
      points: [
        'One item per required document',
        'Formats taken from your instructions',
        'Each item linked to an exact page',
      ],
    },
    documents: {
      title: 'Your documents deserve a proper home.',
      description:
        'Choose your files and we’ll create an application folder for them. PDF pages are previewed and their text extracted so you can link the right evidence.',
      button: 'Choose documents and create an application',
      points: ['Originals stay unchanged', 'Duplicates are detected', 'Private to your account'],
    },
    report: {
      title: 'Know what is ready before you submit.',
      description:
        'A readiness report lists linked evidence, file checks, your review notes and anything unresolved. Start an application to save your first one.',
      button: 'Start an application',
      points: [
        'Missing evidence, item by item',
        'Your own review notes',
        'Dated, with the checklist version used',
      ],
    },
  }[view];
  return (
    <section className={`sheet section-empty empty-${view}`} aria-labelledby="empty-title">
      <div>
        <h2 id="empty-title">{content.title}</h2>
        <p>{content.description}</p>
        <button
          className="primary"
          onClick={() =>
            view === 'documents'
              ? onUpload()
              : onCreate(view === 'requirements' ? 'custom' : undefined)
          }
        >
          {content.button}
        </button>
      </div>
      <ul className="empty-points">
        {content.points.map((point) => (
          <li key={point}>
            <StateMark state="pass" size={20} />
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
