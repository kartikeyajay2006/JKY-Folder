import { useState } from 'react';
import {
  ListChecks,
  ArrowRight,
  Plus,
  FolderOpen,
  Clock3,
  Files,
  CheckCheck,
  GraduationCap,
  Award,
  BriefcaseBusiness,
  SlidersHorizontal,
  UploadCloud,
  FileCheck2,
  Check,
  Archive,
  RotateCcw,
  Search,
} from 'lucide-react';
import { PacketVisual } from './PacketVisual';
import { AnimatedNumber } from './AnimatedNumber';
import { templates, deadlineInfo } from '../../shared/templates';
import type { CheckState, EvaluationRun, Packet, User } from '../../shared/model';
export interface PacketCard {
  packet: Packet;
  documentCount: number;
  latestRun: EvaluationRun | null;
  currentCounts?: Record<CheckState, number>;
  requirementCount?: number;
}
export function WorkspaceHome({
  user,
  packets,
  search,
  onCreate,
  onOpen,
  onArchive,
  onNavigate,
}: {
  user: User;
  packets: PacketCard[];
  search: string;
  onCreate: (template?: string) => void;
  onOpen: (id: string) => void;
  onArchive: (packet: Packet) => void;
  onNavigate: (view: 'documents' | 'requirements' | 'report') => void;
}) {
  const [filter, setFilter] = useState('active'),
    [sort, setSort] = useState('recent');
  const docs = packets.reduce((n, p) => n + p.documentCount, 0),
    reports = packets.filter((p) => p.latestRun).length;
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
  const icons = {
    college: GraduationCap,
    scholarship: Award,
    job: BriefcaseBusiness,
    custom: SlidersHorizontal,
  };
  return (
    <div className="portfolio">
      {!packets.length && (
        <section className="onboarding-hero">
          <div>
            <span className="hero-kicker">
              <span />
              YOUR NEXT OPPORTUNITY STARTS HERE
            </span>
            <h2>
              A clear path from
              <br />
              documents to done.
            </h2>
            <p>
              Turn your application instructions into a checklist, bring your files together, and
              know exactly what needs attention.
            </p>
            <button className="primary" onClick={() => onCreate()}>
              Create your first application <ArrowRight size={17} />
            </button>
            <small>
              <Check size={14} />
              Account ready · Your documents stay private
            </small>
          </div>
          <PacketVisual compact />
        </section>
      )}
      <div className="portfolio-stats">
        {[
          {
            label: 'Active applications',
            value: active.length,
            Icon: FolderOpen,
            note: 'Every opportunity in one place',
          },
          {
            label: 'Documents organized',
            value: docs,
            Icon: Files,
            note: 'Original files in private folders',
          },
          {
            label: 'Reviews saved',
            value: reports,
            Icon: CheckCheck,
            note: 'Applications with dated snapshots',
          },
          {
            label: 'Due within 7 days',
            value: soon,
            Icon: Clock3,
            note: 'Including overdue applications',
          },
        ].map(({ label, value, Icon, note }) => (
          <article className="portfolio-stat" key={label}>
            <span className="portfolio-stat-icon">
              <Icon size={20} />
            </span>
            <span>{label}</span>
            <strong>
              <AnimatedNumber value={value} />
            </strong>
            <small>{note}</small>
          </article>
        ))}
      </div>
      {!packets.length && (
        <section className="setup-section">
          <div className="section-header">
            <div>
              <span className="eyebrow">A SIMPLE WORKFLOW</span>
              <h2>Get ready in three steps</h2>
            </div>
            <span className="step-count">Your workspace is ready</span>
          </div>
          <div className="setup-steps">
            {[
              {
                title: 'Create your application',
                text: 'Choose a starter or use the instructions you received.',
                Icon: FolderOpen,
                action: () => onCreate(),
              },
              {
                title: 'Add your documents',
                text: 'Upload originals and connect them to checklist items.',
                Icon: UploadCloud,
                action: () => onNavigate('documents'),
              },
              {
                title: 'Review before you submit',
                text: 'Resolve missing evidence and save a dated report.',
                Icon: FileCheck2,
                action: () => onNavigate('report'),
              },
            ].map(({ title, text, Icon, action }, i) => (
              <button key={title} className="setup-step" onClick={action}>
                <span className="setup-number">0{i + 1}</span>
                <Icon size={22} />
                <strong>{title}</strong>
                <p>{text}</p>
                <span className="text-link">
                  Get started <ArrowRight size={14} />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      {!!packets.length && (
        <section className="application-portfolio">
          <div className="section-header">
            <div>
              <span className="eyebrow">YOUR OPPORTUNITIES</span>
              <h2>
                Applications <span className="number-pill">{displayed.length}</span>
              </h2>
            </div>
            <button className="outline" onClick={() => onCreate()}>
              <Plus size={16} />
              New application
            </button>
          </div>
          <div className="portfolio-toolbar">
            <div className="filter-tabs">
              {['active', 'archived', 'all'].map((f) => (
                <button
                  key={f}
                  className={filter === f ? 'active' : ''}
                  onClick={() => setFilter(f)}
                >
                  {f === 'active' ? 'Active' : f === 'archived' ? 'Archived' : 'All applications'}
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
          <div className="application-grid">
            {displayed.map(
              ({ packet: p, documentCount, currentCounts, requirementCount, latestRun }) => {
                const Icon = icons[p.kind || 'college'];
                const due = deadlineInfo(p.deadline);
                const counts = currentCounts || latestRun?.counts;
                const total = counts
                  ? Object.entries(counts)
                      .filter(([state]) => state !== 'not_applicable')
                      .reduce((n, [, v]) => n + v, 0)
                  : requirementCount || 0;
                const reviewed = counts?.pass || 0;
                return (
                  <article className="opportunity-card" key={p.id}>
                    <div className="opportunity-top">
                      <span className={`opportunity-icon kind-${p.kind || 'college'}`}>
                        <Icon size={24} />
                      </span>
                      <span className={`deadline-badge ${due.urgent ? 'urgent' : ''}`}>
                        <Clock3 size={13} />
                        {due.label}
                      </span>
                    </div>
                    <button className="opportunity-title" onClick={() => onOpen(p.id)}>
                      <h3>{p.title}</h3>
                      <p>
                        {p.destination ||
                          (p.customPack ? 'Custom application checklist' : 'UCEED 2027 reference')}
                      </p>
                    </button>
                    <div className="application-progress">
                      <div>
                        <span>
                          {reviewed} of {total} items reviewed
                        </span>
                        <strong>{total ? Math.round((reviewed / total) * 100) : 0}%</strong>
                      </div>
                      <div className="progress-track">
                        <span style={{ width: `${total ? (reviewed / total) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div className="opportunity-meta">
                      <span>
                        <Files size={14} />
                        {documentCount} documents
                      </span>
                      <span>{latestRun ? 'Report saved' : 'Not reviewed yet'}</span>
                    </div>
                    <div className="opportunity-footer">
                      <button className="text-link" onClick={() => onOpen(p.id)}>
                        Open application <ArrowRight size={15} />
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
                );
              },
            )}
          </div>
          {!displayed.length && (
            <div className="portfolio-empty">
              <Search size={25} />
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
        </section>
      )}
      <section className="starter-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">MAKE IT YOURS</span>
            <h2>Start with the right checklist</h2>
            <p>Editable starters for different kinds of opportunities.</p>
          </div>
        </div>
        <div className="starter-grid">
          {templates.map((t) => {
            const Icon = icons[t.kind];
            return (
              <button className="starter-tile" key={t.id} onClick={() => onCreate(t.id)}>
                <span className={`opportunity-icon kind-${t.kind}`}>
                  <Icon size={22} />
                </span>
                <strong>{t.title}</strong>
                <p>{t.description}</p>
                <span>
                  {t.id === 'custom'
                    ? 'Use your own instructions'
                    : `${t.requirements.length} editable starter items`}
                  <ArrowRight size={16} />
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <div className="workspace-trust">
        <span>
          <Check size={15} />
          Signed in as {user.name.split(' ')[0]}
        </span>
        <span>Personal reviews · Clear evidence · No acceptance guarantees</span>
      </div>
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
        'Start with your actual instructions. Add required files, choose formats, and mark optional evidence before reviewing your packet.',
      Icon: ListChecks,
      button: 'Build my checklist',
    },
    documents: {
      title: 'Your documents deserve a proper home.',
      description:
        'Create an application folder, then upload PDFs and JPEGs. Inspection, page text and original previews help you connect the right evidence.',
      Icon: UploadCloud,
      button: 'Choose documents & create application',
    },
    report: {
      title: 'Know what is ready before you submit.',
      description:
        'A readiness report shows linked evidence, file checks, your review notes and anything still unresolved. Start an application to create your first report.',
      Icon: FileCheck2,
      button: 'Start an application',
    },
  }[view];
  const Icon = content.Icon;
  return (
    <section className={`section-empty empty-${view}`}>
      <div className="section-empty-intro">
        <span className="empty-section-icon">
          <Icon size={32} />
        </span>
        <h2>{content.title}</h2>
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
          <ArrowRight size={17} />
        </button>
      </div>
      <div className="section-empty-preview">
        {view === 'requirements' ? (
          <>
            <span className="eyebrow">HOW YOUR CHECKLIST WORKS</span>
            {[
              'One item per document requirement',
              'Formats taken from your instructions',
              'Evidence connected to exact pages',
            ].map((text, i) => (
              <div className="preview-checkline" key={text}>
                <span>{i + 1}</span>
                <strong>{text}</strong>
                <Check size={16} />
              </div>
            ))}
          </>
        ) : view === 'documents' ? (
          <>
            <span className="eyebrow">YOUR ORIGINALS, ORGANIZED</span>
            {[
              ['PDF', 'Academic transcript'],
              ['JPG', 'Identity evidence'],
              ['PDF', 'Application statement'],
            ].map(([type, label]) => (
              <div className="preview-fileline" key={label}>
                <span>{type}</span>
                <strong>{label}</strong>
                <small>Example</small>
              </div>
            ))}
            <p className="field-help">These examples are not files in your account.</p>
          </>
        ) : (
          <>
            <span className="eyebrow">WHAT THE REPORT WILL COVER</span>
            {[
              'Missing supporting evidence',
              'Supported file-format checks',
              'Items that need your content review',
              'Dated source and evidence references',
            ].map((text) => (
              <div className="report-coverage" key={text}>
                <Check size={17} />
                {text}
              </div>
            ))}
            <p className="field-help">
              No readiness result is calculated until you have an application.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
