import { useState } from 'react';
import type { PacketDetail } from '../../shared/model';
import { api, body } from '../api';
export function SourceDetails({
  data,
  onUpdated,
}: {
  data: PacketDetail;
  onUpdated: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const pack = data.pack;
  return (
    <details className="sheet source-details" open={data.sourceChanged || undefined}>
      <summary>Checklist sources & coverage</summary>
      <p>
        {pack.title} · {pack.cycle} · {pack.stage || 'Your selected application stage'} ·{' '}
        {pack.lifecycle || 'User-defined'} · {pack.version}
      </p>
      {pack.sourceUrl && (
        <a className="inline-link" href={pack.sourceUrl} target="_blank" rel="noreferrer">
          Read source instructions
        </a>
      )}
      <p className="microcopy">
        {pack.reviewedBy
          ? `Reviewed by ${pack.reviewedBy} on ${pack.reviewedAt}. Review covers the recorded obligations only.`
          : 'Independent completeness review is still open.'}
      </p>
      {(pack.sources || []).map((source) => (
        <details key={source.id}>
          <summary>
            {source.title} · captured {source.retrievedAt}
          </summary>
          <p className="data">SHA-256 {source.sha256}</p>
          {source.content ? (
            <pre>{source.content}</pre>
          ) : (
            <p className="field-help">
              The hash identifies the captured source text. Full source snapshots stay in the
              curator’s private registry.
            </p>
          )}
        </details>
      ))}
      {pack.obligations?.length ? (
        <ul>
          {pack.obligations.map((o) => (
            <li key={o.id}>
              <strong>{o.disposition.replace('_', ' ')}</strong>: {o.instruction}
              <p className="field-help">
                {o.rationale} · {o.anchor}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="field-help">
          This checklist has no approved complete source-obligation inventory.
        </p>
      )}
      <ul>
        {pack.limitations.map((limit) => (
          <li key={limit}>{limit}</li>
        ))}
      </ul>
      {pack.instructionSource && (
        <p className="field-help">
          Checklist confirmed against an uploaded instructions PDF. Original SHA-256:{' '}
          {pack.instructionSource.sha256}. This records the applicant’s review.
        </p>
      )}
      {data.sourceChanged && (
        <div className="soft-notice">
          <p>
            The source or checklist changed. Inspect the new instructions before accepting an
            update. Evidence links will need a fresh review.
          </p>
          {pack.instructionSource ? (
            <p>Replace the missing instructions PDF and generate a fresh draft from Checklist.</p>
          ) : (
            <button
              className="outline"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  await api(`/packets/${data.packet.id}/accept-checklist-update`, {
                    method: 'POST',
                    body: body({ expectedRevision: data.packet.revision }),
                  });
                  await onUpdated();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Accept reviewed checklist update
            </button>
          )}
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </details>
  );
}
