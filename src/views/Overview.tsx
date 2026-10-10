import { ArrowRight, Download, ExternalLink, PencilLine, Plus, ShieldCheck } from 'lucide-react';
import { kindLabel, useCatalog } from '../catalog';
import { applicabilityNote } from '../../shared/profile';
import { ChecklistStrip, DeadlineStamp, FileGlyph } from '../components/Marks';
import { StateMark, date, dateTime, size, plural, stateLabels } from '../components/Status';
import { AnimatedNumber } from '../components/AnimatedNumber';
import type {
  CheckResult,
  CheckState,
  DocumentRecord,
  EvaluationRun,
  PacketDetail,
} from '../../shared/model';
import type { WorkspaceView } from '../workspace-location';

export function summarize(counts: Record<CheckState, number>) {
  const fix = counts.fail + counts.error;
  const review = counts.needs_review + counts.pending;
  const parts = [
    fix && `${fix} to fix`,
    review && `${review} to review`,
    counts.unknown && `${plural(counts.unknown, 'answer')} needed`,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : 'nothing waiting on you';
}

function actionLabel(check: CheckResult) {
  if (check.state === 'unknown') return 'Answer the question';
  if (check.evidence) return 'Review evidence';
  return 'Connect evidence';
}

export function OverviewView({
  data,
  live,
  nextSteps,
  busy,
  onNavigate,
  onOpenRequirement,
  onDetails,
  onReview,
  onPreview,
  onUpload,
  onDownload,
}: {
  data: PacketDetail;
  live: EvaluationRun;
  nextSteps: CheckResult[];
  busy: string;
  onNavigate: (view: WorkspaceView) => void;
  onOpenRequirement: (id: string) => void;
  onDetails: () => void;
  onReview: () => void;
  onPreview: (doc: DocumentRecord) => void;
  onUpload: () => void;
  onDownload: () => void;
}) {
  const catalog = useCatalog();
  const { packet, pack, documents, runs } = data;
  const counts = live.counts;
  const applicable = live.checks.filter((c) => c.state !== 'not_applicable').length;
  const latest = runs[0];
  const kind = kindLabel(catalog, packet.kind, pack);
  const totals: [CheckState, number][] = [
    ['pass', counts.pass],
    ['fail', counts.fail + counts.error],
    ['needs_review', counts.needs_review + counts.pending],
    ['unknown', counts.unknown],
    ['not_applicable', counts.not_applicable],
  ];
  return (
    <div className="overview">
      <section className="file-cover" aria-labelledby="cover-title">
        <p className="file-cover-tab">{kind}</p>
        <div className="file-cover-body">
          <div className="file-cover-main">
            <h1 id="cover-title">{packet.title}</h1>
            <p className="cover-destination">
              {packet.destination || (
                <button className="text-link" onClick={onDetails}>
                  Add the institution or company
                </button>
              )}
            </p>
            <dl className="cover-facts">
              <div>
                <dt>Checklist</dt>
                <dd>
                  {pack.title}{' '}
                  <span className="assurance">
                    {pack.assurance === 'reference' ? 'Reference' : 'Your own'}
                  </span>
                </dd>
              </div>
              <div>
                <dt>{pack.assurance === 'reference' ? 'Source checked' : 'Configured'}</dt>
                <dd>
                  {pack.sourceUrl ? (
                    <a href={pack.sourceUrl} target="_blank" rel="noreferrer">
                      {date(pack.checkedAt)}
                      <ExternalLink size={13} aria-hidden="true" />
                      <span className="visually-hidden">(opens the source instructions)</span>
                    </a>
                  ) : (
                    date(pack.checkedAt)
                  )}
                </dd>
              </div>
              <div>
                <dt>Last saved review</dt>
                <dd>{latest ? dateTime(latest.createdAt) : 'None yet'}</dd>
              </div>
            </dl>
          </div>
          <DeadlineStamp deadline={packet.deadline} onSet={onDetails} />
        </div>
        <div className="file-cover-actions">
          <button className="quiet" onClick={onDetails}>
            <PencilLine size={16} aria-hidden="true" />
            Edit details
          </button>
          <button className="quiet" disabled={!!busy} onClick={onDownload}>
            <Download size={16} aria-hidden="true" />
            Download folder
          </button>
        </div>
      </section>

      <section className="sheet standing" aria-labelledby="standing-title">
        <div className="standing-head">
          <div>
            <h2 id="standing-title">Where this application stands</h2>
            <p>
              <strong>
                <AnimatedNumber value={counts.pass} /> of {applicable}
              </strong>{' '}
              required items reviewed; {summarize(counts)}.
            </p>
          </div>
          <button className="primary" onClick={onReview} disabled={!!busy}>
            {busy === 'evaluate' ? 'Saving review…' : 'Save a review'}
          </button>
        </div>
        <ChecklistStrip checks={live.checks} onOpen={onOpenRequirement} />
        <ul className="state-totals">
          {totals.map(([state, value]) => (
            <li key={state} className={value ? '' : 'is-zero'}>
              <StateMark state={state} size={18} />
              <span>{stateLabels[state]}</span>
              <strong className="data">{value}</strong>
            </li>
          ))}
        </ul>
      </section>

      <div className="overview-columns">
        <section className="sheet next-up" aria-labelledby="next-title">
          <div className="sheet-head">
            <h2 id="next-title">
              Next up <span className="count">{nextSteps.length}</span>
            </h2>
            <button className="text-link" onClick={() => onNavigate('requirements')}>
              Open checklist
            </button>
          </div>
          {nextSteps.length ? (
            <ol className="next-list">
              {nextSteps.slice(0, 4).map((check) => {
                const requirement = pack.requirements.find((r) => r.id === check.requirementId);
                const why = requirement
                  ? applicabilityNote(requirement, packet.profile, catalog.questions)
                  : '';
                return (
                  <li key={check.requirementId}>
                    <StateMark state={check.state} />
                    <div>
                      <h3>{check.title}</h3>
                      <p>{check.reason}</p>
                      {why && <p className="next-why">{why}.</p>}
                    </div>
                    <button
                      className="outline small-button"
                      onClick={() => onOpenRequirement(check.requirementId)}
                    >
                      {actionLabel(check)}
                    </button>
                  </li>
                );
              })}
              {nextSteps.length > 4 && (
                <li className="next-more">
                  <button className="text-link" onClick={() => onNavigate('requirements')}>
                    {plural(nextSteps.length - 4, 'more item')} in the checklist
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </li>
              )}
            </ol>
          ) : (
            <div className="all-clear">
              <StateMark state="pass" size={40} />
              <h3>Every required item is reviewed.</h3>
              <p>
                Save a review to keep a dated record, then confirm anything outside this checklist
                with the official instructions.
              </p>
            </div>
          )}
        </section>

        <section className="sheet folder-contents" aria-labelledby="contents-title">
          <div className="sheet-head">
            <h2 id="contents-title">
              In this folder <span className="count">{documents.length}</span>
            </h2>
            <button className="text-link" onClick={() => onNavigate('documents')}>
              All documents
            </button>
          </div>
          {documents.length ? (
            <ul className="mini-documents">
              {documents.slice(0, 5).map((doc) => (
                <li key={doc.id}>
                  <button onClick={() => onPreview(doc)}>
                    <FileGlyph mime={doc.mime} name={doc.name} size={28} />
                    <span>
                      <strong className="data">{doc.name}</strong>
                      <small>
                        {doc.status === 'ready'
                          ? `${size(doc.size)}, ${plural(doc.pageCount, 'page')}`
                          : doc.status === 'processing'
                            ? 'Inspecting…'
                            : 'Inspection failed'}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="microcopy">No documents yet. Add the originals you plan to submit.</p>
          )}
          <button className="outline full" onClick={onUpload} disabled={!!busy}>
            <Plus size={16} aria-hidden="true" />
            Add documents
          </button>
        </section>
      </div>

      <p className="boundary-note">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>
          A reviewed item means the supported file checks passed and you confirmed the content
          yourself. It is not a guarantee of authenticity, eligibility or acceptance.{' '}
          <button className="text-link" onClick={() => onNavigate('help')}>
            What gets checked
          </button>
        </span>
      </p>
    </div>
  );
}
