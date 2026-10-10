import { useState } from 'react';
import { api, body } from '../api';
import type { DocumentFact, DocumentRecord } from '../../shared/model';
export function FactEditor({
  document,
  packetId,
  packetRevision,
  onSaved,
  onInspect,
}: {
  document: DocumentRecord;
  packetId: string;
  packetRevision: number;
  onSaved: (doc: DocumentRecord) => Promise<void>;
  onInspect?: (fact: DocumentFact) => void;
}) {
  return (
    <section className="fact-editor">
      <h3>Extracted facts</h3>
      <p className="microcopy">
        Confirm each value against the original. Every correction retains its history.
      </p>
      {document.facts?.length ? (
        document.facts.map((fact) => (
          <FactRow
            key={fact.id + ':' + fact.history.length}
            fact={fact}
            documentId={document.id}
            packetId={packetId}
            packetRevision={packetRevision}
            onSaved={onSaved}
            onInspect={onInspect}
          />
        ))
      ) : (
        <p className="field-help">
          No supported labelled facts were found. You can still review and link the original.
        </p>
      )}
      <ManualFact
        document={document}
        packetId={packetId}
        packetRevision={packetRevision}
        onSaved={onSaved}
      />
    </section>
  );
}
function FactRow({
  fact,
  documentId,
  packetId,
  packetRevision,
  onSaved,
  onInspect,
}: {
  fact: DocumentFact;
  documentId: string;
  packetId: string;
  packetRevision: number;
  onSaved: (doc: DocumentRecord) => Promise<void>;
  onInspect?: (fact: DocumentFact) => void;
}) {
  const [value, setValue] = useState(fact.value),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <form
      className="fact-row"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
          const doc = await api<DocumentRecord>(
            `/packets/${packetId}/documents/${documentId}/facts/${fact.id}`,
            {
              method: 'PUT',
              body: body({
                expectedRevision: packetRevision,
                expectedFactRevision: fact.history.at(-1)?.revision || 0,
                value,
                reason,
                confirmed: true,
              }),
            },
          );
          await onSaved(doc);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p>
        <strong>{fact.kind.replace(/_/g, ' ')}</strong>, page {fact.page} ·{' '}
        {fact.history.at(-1)?.confirmed ? 'Confirmed by you' : 'Awaiting confirmation'}
      </p>
      <blockquote>
        {fact.origin === 'manual'
          ? 'Applicant-provided transcription; compare with the original page.'
          : fact.originalText}
      </blockquote>
      {onInspect && (
        <button className="text-link" type="button" onClick={() => onInspect(fact)}>
          Show original location
        </button>
      )}
      <label>
        Confirmed value
        <input value={value} required maxLength={160} onChange={(e) => setValue(e.target.value)} />
      </label>
      <label>
        What did you check?
        <input
          value={reason}
          required
          minLength={10}
          maxLength={1000}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <button className="outline" disabled={busy}>
        {busy ? 'Saving…' : 'Confirm fact'}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {fact.history.length > 0 && (
        <details>
          <summary>Correction history ({fact.history.length})</summary>
          <ol>
            {fact.history.map((h) => (
              <li key={h.revision}>
                Revision {h.revision}: {h.value} — {h.reason} (
                {new Date(h.createdAt).toLocaleString()})
              </li>
            ))}
          </ol>
        </details>
      )}
    </form>
  );
}

function ManualFact({
  document,
  packetId,
  packetRevision,
  onSaved,
}: {
  document: DocumentRecord;
  packetId: string;
  packetRevision: number;
  onSaved: (doc: DocumentRecord) => Promise<void>;
}) {
  const [kind, setKind] = useState('name'),
    [page, setPage] = useState(1),
    [value, setValue] = useState(''),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <details>
      <summary>Add a fact from the original</summary>
      <form
        className="fact-row"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            const result = await api<DocumentRecord>(
              `/packets/${packetId}/documents/${document.id}/facts`,
              {
                method: 'POST',
                body: body({ expectedRevision: packetRevision, kind, page, value, reason }),
              },
            );
            await onSaved(result);
            setValue('');
            setReason('');
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="field-help">
          Your transcription is recorded as manual evidence. It does not replace extracted text.
        </p>
        <label>
          Fact type
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="name">Name</option>
            <option value="birth_date">Date of birth</option>
            <option value="issue_date">Issue date</option>
            <option value="expiry_date">Expiry date</option>
          </select>
        </label>
        <label>
          Source page
          <input
            type="number"
            required
            min={1}
            max={document.pageCount}
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
          />
        </label>
        <label>
          Value from the original
          <input
            required
            maxLength={160}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <label>
          Review reason
          <input
            required
            minLength={10}
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button className="outline" disabled={busy}>
          {busy ? 'Saving…' : 'Save manual fact'}
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </details>
  );
}
