import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Dialog } from './Dialog';
import { PdfPreview } from './PdfPreview';
import { templateRequirement } from '../../shared/templates';
import type { PacketDetail, Requirement } from '../../shared/model';
import type { InstructionCandidate, InstructionDraft } from '../../shared/instruction-draft';
import { api, body } from '../api';
import { useCatalog } from '../catalog';

type Decision = 'include' | 'exclude';
const includeReasons = [
  'Matches the source wording on this page.',
  'Checked the original page, its format and its limits.',
];
const excludeReasons = [
  'Not a document I need to upload.',
  'Duplicate of another item in this checklist.',
  'Does not apply to my application.',
];
const KB = 1024;
const bytes = (n: number) =>
  n >= KB * KB && n % (KB * KB) === 0 ? `${n / KB / KB} MB` : `${Math.round(n / KB)} KB`;
/** Removable labels for every constraint currently on a requirement. */
function limitChips(r: Requirement): { label: string; clear: Partial<Requirement> }[] {
  return [
    r.minBytes !== undefined && {
      label: `At least ${bytes(r.minBytes)}`,
      clear: { minBytes: undefined },
    },
    r.maxBytes !== undefined && {
      label: `At most ${bytes(r.maxBytes)}`,
      clear: { maxBytes: undefined },
    },
    r.maxPages !== undefined && {
      label: `At most ${r.maxPages} page${r.maxPages === 1 ? '' : 's'}`,
      clear: { maxPages: undefined },
    },
    (r.maxWidth !== undefined || r.maxHeight !== undefined) && {
      label: `Up to ${r.maxWidth ?? '…'} × ${r.maxHeight ?? '…'} px`,
      clear: { maxWidth: undefined, maxHeight: undefined },
    },
  ].filter(Boolean) as { label: string; clear: Partial<Requirement> }[];
}

export function InstructionPdf({
  data,
  onClose,
  onSaved,
}: {
  data: PacketDetail;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { conditions } = useCatalog();
  const pdfs = data.documents.filter((d) => d.status === 'ready' && d.mime === 'application/pdf');
  const [documentId, setDocumentId] = useState(pdfs[0]?.id || ''),
    [draft, setDraft] = useState<InstructionDraft | null>(null),
    [edits, setEdits] = useState<Record<string, Requirement>>({}),
    [decisions, setDecisions] = useState<Record<string, Decision>>({}),
    [notes, setNotes] = useState<Record<string, string>>({}),
    [manual, setManual] = useState<Requirement[]>([]),
    [focus, setFocus] = useState<InstructionCandidate | null>(null),
    [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const source = data.documents.find((d) => d.id === (draft?.documentId || documentId));
  const candidates = draft?.candidates || [];
  const decided = candidates.filter(
    (c) => decisions[c.id] && (notes[c.id] || '').trim().length >= 10,
  ).length;
  const remaining = candidates.length - decided;
  const included = candidates.filter((c) => decisions[c.id] === 'include');
  const blocked = !draft
    ? ''
    : remaining
      ? `Decide ${remaining} more proposal${remaining === 1 ? '' : 's'}, each with a reason.`
      : !included.length && !manual.length
        ? 'Include at least one item, or add one the draft missed.'
        : manual.some((m) => m.title.trim().length < 2)
          ? 'Name every item you added.'
          : !confirmed
            ? 'Confirm that you read every source page.'
            : '';
  const conditionLabel = (r: Requirement) => {
    const c = r.condition;
    if (c.op === 'always') return undefined;
    if (c.op === 'eq') return conditions.find((o) => o.value === `${c.field}:${c.value}`)?.label;
    return 'A condition you set';
  };
  const patch = (id: string, change: Partial<Requirement>) =>
    setEdits((all) => ({ ...all, [id]: { ...all[id], ...change } }));
  const decide = (c: InstructionCandidate, d: Decision) => {
    setDecisions((all) => ({ ...all, [c.id]: d }));
    const reasons = d === 'include' ? includeReasons : excludeReasons;
    // Switching sides clears a quick reason written for the other side.
    if (!notes[c.id] || [...includeReasons, ...excludeReasons].includes(notes[c.id]))
      setNotes((all) => ({ ...all, [c.id]: reasons[0] }));
  };
  return (
    <Dialog title="Draft checklist from instructions PDF" wide onClose={onClose}>
      {!draft ? (
        <div className="dialog-body draft-start">
          <p>
            Choose the instructions you uploaded. The draft proposes one item per document the
            instructions ask for, with the exact page it came from. Nothing becomes part of your
            checklist until you review and confirm it.
          </p>
          {pdfs.length ? (
            <label>
              Instructions PDF
              <select value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
                {pdfs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="soft-notice">
              No inspected PDF yet. Upload your instructions in Documents and wait until they show
              as inspected.
            </p>
          )}
          <div className="button-row">
            <button
              className="gold-button"
              disabled={busy || !documentId}
              onClick={() =>
                void run(async () => {
                  const d = await api<InstructionDraft>(
                    `/packets/${data.packet.id}/instruction-drafts`,
                    {
                      method: 'POST',
                      body: body({ expectedRevision: data.packet.revision, documentId }),
                    },
                  );
                  setDraft(d);
                  setEdits(Object.fromEntries(d.candidates.map((c) => [c.id, c.requirement])));
                  setFocus(d.candidates[0] || null);
                })
              }
            >
              {busy ? 'Reading the instructions…' : 'Generate draft'}
            </button>
          </div>
        </div>
      ) : (
        <div className="draft-review">
          <aside className="draft-source" aria-label="Source instructions">
            {source && (
              <PdfPreview
                url={`/api/packets/${data.packet.id}/documents/${source.id}/content`}
                name={source.name}
                page={focus?.page || 1}
                onPageChange={(page) =>
                  setFocus(candidates.find((c) => c.page === page) || { ...focus!, page })
                }
              />
            )}
            {focus?.quote && (
              <figure className="draft-quote">
                <figcaption>Source text, page {focus.page}</figcaption>
                <blockquote>{focus.quote}</blockquote>
              </figure>
            )}
          </aside>
          <div className="draft-items">
            <div className="draft-progress" role="status">
              <strong>
                {decided} of {candidates.length} proposals decided
              </strong>
              <progress value={decided} max={Math.max(1, candidates.length)} aria-hidden="true" />
            </div>
            <details className="draft-warnings">
              <summary>Read before confirming ({draft.warnings.length})</summary>
              <ul>
                {draft.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </details>
            {!candidates.length && (
              <p className="soft-notice">
                No document instructions were found automatically. Add each item yourself below.
              </p>
            )}
            {candidates.map((c, i) => {
              const r = edits[c.id] || c.requirement,
                decision = decisions[c.id];
              const reasons = decision === 'exclude' ? excludeReasons : includeReasons;
              return (
                <fieldset
                  key={c.id}
                  className={`draft-card ${focus?.id === c.id ? 'is-focused' : ''} ${decision ? `is-${decision}` : ''}`}
                  onFocusCapture={() => setFocus(c)}
                  onClick={() => setFocus(c)}
                >
                  <legend>
                    Proposal {i + 1}, page {c.page}
                  </legend>
                  <p className="draft-meta">
                    <span>
                      {c.kind === 'list' ? 'From a document list' : 'Explicit instruction'}
                    </span>
                    {c.alsoOn?.length ? <span>Also on page {c.alsoOn.join(', ')}</span> : null}
                    {c.uncertain && <span className="is-warning">Uncertain text recognition</span>}
                  </p>
                  <label>
                    Item name
                    <input
                      value={r.title}
                      maxLength={160}
                      onChange={(e) => patch(c.id, { title: e.target.value })}
                    />
                  </label>
                  <div className="segmented draft-decision" role="radiogroup" aria-label="Decision">
                    {(['include', 'exclude'] as Decision[]).map((d) => (
                      <label key={d} className={decision === d ? 'active' : ''}>
                        <input
                          type="radio"
                          name={`decision-${c.id}`}
                          checked={decision === d}
                          onChange={() => decide(c, d)}
                        />
                        {d === 'include' ? 'Include in checklist' : 'Leave out'}
                      </label>
                    ))}
                  </div>
                  {decision === 'include' && (
                    <div className="draft-settings">
                      <label className="checkbox-line">
                        <input
                          type="checkbox"
                          checked={!r.optional}
                          onChange={(e) => patch(c.id, { optional: !e.target.checked })}
                        />
                        <span>Required for this application</span>
                      </label>
                      <label>
                        Accepted format
                        <select
                          value={r.mime}
                          onChange={(e) => {
                            const mime = e.target.value as Requirement['mime'];
                            patch(c.id, {
                              mime,
                              extension:
                                mime === 'application/pdf'
                                  ? '.pdf'
                                  : mime === 'image/jpeg'
                                    ? '.jpg'
                                    : 'any',
                            });
                          }}
                        >
                          <option value="any">PDF or JPEG</option>
                          <option value="application/pdf">PDF</option>
                          <option value="image/jpeg">JPEG</option>
                        </select>
                      </label>
                      {!!limitChips(r).length && (
                        <ul className="chip-list" aria-label="Limits read from the source">
                          {limitChips(r).map((chip) => (
                            <li key={chip.label}>
                              {chip.label}
                              <button
                                type="button"
                                aria-label={`Remove limit: ${chip.label}`}
                                onClick={() => patch(c.id, chip.clear)}
                              >
                                <X size={13} aria-hidden="true" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {c.suggestedCondition && r.condition.op === 'always' && (
                        <p className="draft-suggestion">
                          <span>Suggested: {c.suggestedCondition.label}</span>
                          <button
                            type="button"
                            className="text-link"
                            onClick={() =>
                              patch(c.id, { condition: c.suggestedCondition!.condition })
                            }
                          >
                            Apply suggestion
                          </button>
                        </p>
                      )}
                      {r.condition.op !== 'always' && (
                        <p className="draft-suggestion">
                          <span>
                            Applies only{' '}
                            {(c.suggestedCondition?.label || conditionLabel(r) || '').toLowerCase()}
                          </span>
                          <button
                            type="button"
                            className="text-link"
                            onClick={() => patch(c.id, { condition: { op: 'always' } })}
                          >
                            Always applies
                          </button>
                        </p>
                      )}
                    </div>
                  )}
                  {c.warnings.map((w) => (
                    <p className="microcopy draft-warning" key={w}>
                      {w}
                    </p>
                  ))}
                  {decision && (
                    <div className="draft-reason">
                      <div className="chip-row" aria-label="Quick reasons">
                        {reasons.map((reason) => (
                          <button
                            type="button"
                            key={reason}
                            className={notes[c.id] === reason ? 'is-picked' : ''}
                            onClick={() => setNotes({ ...notes, [c.id]: reason })}
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                      <label>
                        {decision === 'include' ? 'Acceptance reason' : 'Reason for leaving out'}
                        <textarea
                          rows={2}
                          value={notes[c.id] || ''}
                          minLength={10}
                          maxLength={1000}
                          onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })}
                        />
                      </label>
                    </div>
                  )}
                </fieldset>
              );
            })}
            <section className="draft-manual" aria-labelledby="manual-title">
              <h3 id="manual-title">Items the draft missed</h3>
              {manual.map((m, i) => (
                <div className="draft-manual-row" key={m.id}>
                  <label>
                    Added item {i + 1} name
                    <input
                      value={m.title}
                      maxLength={160}
                      onChange={(e) =>
                        setManual(
                          manual.map((x) =>
                            x.id === m.id
                              ? {
                                  ...x,
                                  title: e.target.value,
                                  description: `Provide evidence for: ${e.target.value}.`,
                                }
                              : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="checkbox-line">
                    <input
                      type="checkbox"
                      checked={!m.optional}
                      onChange={(e) =>
                        setManual(
                          manual.map((x) =>
                            x.id === m.id ? { ...x, optional: !e.target.checked } : x,
                          ),
                        )
                      }
                    />
                    <span>Required</span>
                  </label>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove added item ${i + 1}`}
                    onClick={() => setManual(manual.filter((x) => x.id !== m.id))}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="outline small-button"
                onClick={() =>
                  setManual([
                    ...manual,
                    {
                      ...templateRequirement('', manual.length),
                      id: 'manual-' + crypto.randomUUID(),
                      title: '',
                      optional: false,
                    },
                  ])
                }
              >
                <Plus size={15} aria-hidden="true" />
                Add an item the draft missed
              </button>
            </section>
            <div className="draft-confirm">
              <label className="checkbox-line">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                <span>
                  I read every source page and checked missing items, conditions, alternatives,
                  dates and formats.
                </span>
              </label>
              {blocked && <p className="microcopy">{blocked}</p>}
              <button
                className="gold-button"
                disabled={busy || !!blocked}
                onClick={() =>
                  void run(async () => {
                    await api(`/packets/${data.packet.id}/instruction-drafts/${draft.id}/confirm`, {
                      method: 'POST',
                      body: body({
                        expectedRevision: data.packet.revision,
                        requirements: [
                          ...included.map((c) => edits[c.id] || c.requirement),
                          ...manual,
                        ],
                        decisions: candidates.map((c) => ({
                          id: c.id,
                          accepted: decisions[c.id] === 'include',
                          note: notes[c.id],
                        })),
                        completenessConfirmed: true,
                      }),
                    });
                    await onSaved();
                  })
                }
              >
                {busy ? 'Saving…' : 'Confirm and activate checklist'}
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <p className="form-error draft-error" role="alert">
          {error}
        </p>
      )}
    </Dialog>
  );
}
