import { useState, type CSSProperties } from 'react';
import {
  Crop,
  ExternalLink,
  Info,
  Link2,
  ListChecks,
  PencilLine,
  SlidersHorizontal,
} from 'lucide-react';
import { fittable } from '../components/PhotoFixer';
import { useCatalog } from '../catalog';
import { applicabilityNote } from '../../shared/profile';
import { Status, StateMark, plural } from '../components/Status';
import type { CheckResult, EvaluationRun, PacketDetail } from '../../shared/model';

const filters = [
  { id: 'all', label: 'All', test: () => true },
  {
    id: 'attention',
    label: 'Needs attention',
    test: (c: CheckResult) => c.state !== 'pass' && c.state !== 'not_applicable',
  },
  { id: 'reviewed', label: 'Reviewed', test: (c: CheckResult) => c.state === 'pass' },
  { id: 'excluded', label: 'Not required', test: (c: CheckResult) => c.state === 'not_applicable' },
] as const;

function actionLabel(check: CheckResult) {
  if (check.state === 'unknown') return 'Confirm details';
  return check.evidence ? 'Review evidence' : 'Connect evidence';
}

export function ChecklistView({
  data,
  live,
  search,
  busy,
  onOpenRequirement,
  onEditChecklist,
  onProfile,
  onReview,
  onInstructions,
  onInstructionPdf,
  onFixPhoto,
}: {
  data: PacketDetail;
  live: EvaluationRun;
  search: string;
  busy: string;
  onOpenRequirement: (id: string) => void;
  onEditChecklist: () => void;
  onProfile: () => void;
  onReview: () => void;
  onInstructions?: () => void;
  onInstructionPdf?: () => void;
  onFixPhoto?: (requirementId: string, documentId: string) => void;
}) {
  const { questions } = useCatalog();
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');
  const { pack, packet } = data;
  const query = search.trim().toLowerCase();
  const active = filters.find((f) => f.id === filter)!;
  const shown = live.checks.filter(
    (check) =>
      active.test(check) &&
      (!query || `${check.title} ${check.reason}`.toLowerCase().includes(query)),
  );
  // Within each section, excluded items sink to the bottom so the actionable ones lead.
  const groups = [...new Set(pack.requirements.map((r) => r.group))]
    .map((group) => ({
      group,
      checks: shown
        .filter((c) => c.group === group)
        .sort(
          (a, b) => Number(a.state === 'not_applicable') - Number(b.state === 'not_applicable'),
        ),
    }))
    .filter((g) => g.checks.length);
  let row = 0;
  return (
    <section className="sheet ledger-sheet" aria-labelledby="ledger-title">
      <div className="sheet-head ledger-head">
        <div>
          <h2 id="ledger-title">Requirements & evidence</h2>
          <p className="microcopy">
            {pack.title},{' '}
            {pack.assurance === 'reference'
              ? 'a versioned reference checklist'
              : packet.mode === 'instructions'
                ? 'a checklist you configured'
                : 'only files you uploaded'}
            . {plural(pack.requirements.length, 'item')}.
            {pack.sourceUrl && (
              <>
                {' '}
                <a className="inline-link" href={pack.sourceUrl} target="_blank" rel="noreferrer">
                  Source instructions
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </>
            )}
          </p>
        </div>
        <div className="button-row">
          {onInstructionPdf && (
            <button className="outline" onClick={onInstructionPdf}>
              Draft from instructions PDF
            </button>
          )}
          {packet.mode !== 'instructions' && onInstructions && (
            <button className="outline" onClick={onInstructions}>
              Add application instructions
            </button>
          )}
          {packet.mode === 'instructions' && packet.customPack && (
            <button className="outline" onClick={onEditChecklist}>
              <ListChecks size={16} aria-hidden="true" />
              Edit checklist
            </button>
          )}
          {packet.mode === 'instructions' && (
            <button className="outline" onClick={onProfile}>
              <SlidersHorizontal size={16} aria-hidden="true" />
              Edit application details
            </button>
          )}
          <button className="primary" disabled={!!busy} onClick={onReview}>
            {busy === 'evaluate' ? 'Saving…' : 'Run review'}
          </button>
        </div>
      </div>
      <div className="filter-tabs" role="group" aria-label="Filter requirements">
        {filters.map((f) => (
          <button
            key={f.id}
            aria-pressed={filter === f.id}
            className={filter === f.id ? 'active' : ''}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="filter-count" aria-hidden="true">
              {live.checks.filter(f.test).length}
            </span>
          </button>
        ))}
      </div>
      {groups.map(({ group, checks }) => (
        <section className="ledger-group" key={group} aria-label={group}>
          <h3 className="ledger-group-title">{group}</h3>
          <ol className="ledger">
            {checks.map((check) => {
              const requirement = pack.requirements.find((r) => r.id === check.requirementId);
              const why =
                requirement && check.state !== 'not_applicable'
                  ? applicabilityNote(requirement, packet.profile, questions)
                  : '';
              return (
                <li key={check.requirementId} style={{ '--row': row++ } as CSSProperties}>
                  <article
                    className={`requirement-row row-${check.state}`}
                    aria-labelledby={`req-${check.requirementId}`}
                  >
                    <StateMark state={check.state} />
                    <div className="requirement-copy">
                      <div className="requirement-title">
                        <h4 id={`req-${check.requirementId}`}>{check.title}</h4>
                        {requirement?.optional && <span className="optional-tag">Optional</span>}
                      </div>
                      <p>{check.reason}</p>
                      {why && <p className="requirement-why">{why}.</p>}
                      {check.evidence && (
                        <span className="linked-file">
                          <Link2 size={13} aria-hidden="true" />
                          <span className="data">{check.evidence.name}</span>
                          <span>
                            page {check.evidence.pageFrom}
                            {check.evidence.pageTo !== check.evidence.pageFrom
                              ? `–${check.evidence.pageTo}`
                              : ''}
                          </span>
                          {check.verification === 'user' && <span>reviewed by you</span>}
                        </span>
                      )}
                    </div>
                    <div className="requirement-actions">
                      <Status state={check.state} missing={!check.evidence} />
                      {onFixPhoto &&
                        check.fileState === 'fail' &&
                        check.evidence &&
                        requirement &&
                        fittable(requirement) &&
                        data.documents.find((d) => d.id === check.evidence!.documentId)?.mime ===
                          'image/jpeg' && (
                          <button
                            className="primary small-button"
                            onClick={() =>
                              onFixPhoto(check.requirementId, check.evidence!.documentId)
                            }
                          >
                            <Crop size={14} aria-hidden="true" />
                            Fix to fit
                          </button>
                        )}
                      {(check.state !== 'not_applicable' || requirement?.optional) && (
                        <button
                          className={
                            check.state === 'pass' || check.state === 'not_applicable'
                              ? 'quiet small-button'
                              : 'outline small-button'
                          }
                          onClick={() => onOpenRequirement(check.requirementId)}
                        >
                          {check.state === 'unknown' && <PencilLine size={14} aria-hidden="true" />}
                          {actionLabel(check)}
                        </button>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      {!shown.length && (
        <div className="empty-small">
          <h3>{query ? `No requirements match “${search}”.` : 'Nothing in this view.'}</h3>
          <p>{query ? 'Try another word from the requirement.' : 'Choose another filter.'}</p>
        </div>
      )}
      <p className="panel-note">
        <Info size={15} aria-hidden="true" />
        This is a live preview. Run a review to save a dated report you can export.
      </p>
    </section>
  );
}
