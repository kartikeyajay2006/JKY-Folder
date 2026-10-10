import { useState } from 'react';
import { Dialog } from './Dialog';
import { RequirementRows } from './ApplicationWizard';
import { templateRequirement } from '../../shared/templates';
import type { PacketDetail, Requirement } from '../../shared/model';
import type { InstructionDraft } from '../../shared/instruction-draft';
import { api, body } from '../api';
export function InstructionPdf({
  data,
  onClose,
  onSaved,
}: {
  data: PacketDetail;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const pdfs = data.documents.filter((d) => d.status === 'ready' && d.mime === 'application/pdf');
  const [documentId, setDocumentId] = useState(pdfs[0]?.id || ''),
    [draft, setDraft] = useState<InstructionDraft | null>(null),
    [rows, setRows] = useState<Requirement[]>([]),
    [notes, setNotes] = useState<Record<string, string>>({}),
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
  return (
    <Dialog title="Draft checklist from instructions PDF" wide onClose={onClose}>
      <p className="microcopy">
        Upload your instructions in Documents first. Select that PDF here, inspect every source
        page, then confirm the checklist. Drafting does not activate requirements.
      </p>
      {!draft ? (
        <>
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
          {!pdfs.length && (
            <p>No inspected PDF yet. Upload one in Documents and wait for inspection.</p>
          )}
          <button
            className="primary"
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
                setRows(d.candidates.map((c) => c.requirement));
              })
            }
          >
            {busy ? 'Reading…' : 'Generate draft'}
          </button>
        </>
      ) : (
        <>
          {draft.warnings.map((w, i) => (
            <p key={i} className="microcopy">
              {w}
            </p>
          ))}
          <p className="microcopy">
            Every proposal starts optional. Set whether it is required, its conditions and accepted
            evidence below. Remove rejected proposals and explain each decision.
          </p>
          {draft.candidates.map((c) => (
            <details key={c.id}>
              <summary>
                Source page {c.page}: {c.requirement.title}
              </summary>
              <blockquote>{c.quote}</blockquote>
              <a
                className="inline-link"
                target="_blank"
                rel="noreferrer"
                href={`/api/packets/${data.packet.id}/documents/${draft.documentId}/content#page=${c.page}`}
              >
                Open original at page {c.page}
              </a>
              {c.warnings.map((w) => (
                <p className="microcopy" key={w}>
                  {w}
                </p>
              ))}
              <label>
                {rows.some((r) => r.id === c.id) ? 'Acceptance reason' : 'Rejection reason'}
                <textarea
                  value={notes[c.id] || ''}
                  minLength={10}
                  maxLength={1000}
                  onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })}
                  placeholder="Explain how you checked wording, conditions and evidence."
                />
              </label>
            </details>
          ))}
          <RequirementRows rows={rows} onChange={setRows} />
          <button
            className="outline"
            onClick={() =>
              setRows([
                ...rows,
                {
                  ...templateRequirement('Manually reviewed requirement', rows.length),
                  id: 'manual-' + crypto.randomUUID(),
                },
              ])
            }
          >
            Add missed requirement
          </button>
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              I read every source page and checked missing items, conditions, alternatives, dates
              and formats.
            </span>
          </label>
          <button
            className="primary"
            disabled={
              busy ||
              !confirmed ||
              !rows.length ||
              draft.candidates.some((c) => (notes[c.id] || '').trim().length < 10)
            }
            onClick={() =>
              void run(async () => {
                await api(`/packets/${data.packet.id}/instruction-drafts/${draft.id}/confirm`, {
                  method: 'POST',
                  body: body({
                    expectedRevision: data.packet.revision,
                    requirements: rows,
                    decisions: draft.candidates.map((c) => ({
                      id: c.id,
                      accepted: rows.some((r) => r.id === c.id),
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
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </Dialog>
  );
}
