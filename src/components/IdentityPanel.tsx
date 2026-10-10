import { useState } from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, UserRoundCheck } from 'lucide-react';
import { api, body } from '../api';
import { plural } from './Status';
import type {
  DocumentRecord,
  IdentityComparison,
  IdentityVerdict,
  PacketDetail,
} from '../../shared/model';

const verdicts: Record<IdentityVerdict, { label: string; tone: 'match' | 'check' | 'differs' }> = {
  reference: { label: 'Compared with', tone: 'match' },
  same: { label: 'Matches', tone: 'match' },
  format: { label: 'Matches', tone: 'match' },
  order: { label: 'Different order', tone: 'check' },
  initials: { label: 'Uses initials', tone: 'check' },
  day_month: { label: 'Day and month swapped?', tone: 'check' },
  unreadable: { label: 'Could not read', tone: 'check' },
  middle_name: { label: 'Word missing or added', tone: 'differs' },
  spelling: { label: 'Spelled differently', tone: 'differs' },
  different: { label: 'Different', tone: 'differs' },
};
const titles = { name: 'Name', birth_date: 'Date of birth' } as const;

/**
 * The applicant's name and date of birth as each document shows them, compared with one
 * reference. Values that were only read automatically are marked until the applicant confirms.
 */
export function IdentityPanel({
  data,
  onOpen,
  onChanged,
}: {
  data: PacketDetail;
  onOpen: (doc: DocumentRecord, factId: string) => void;
  onChanged: (identity: IdentityComparison[]) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const identity = data.identity || [];
  const withValues = identity.filter((c) => c.rows.length);
  if (!withValues.length) return null;
  const differences = identity.reduce((n, c) => n + c.differences, 0);
  const documentsWithValues = new Set(identity.flatMap((c) => c.rows.map((r) => r.documentId)));
  const unconfirmed = identity.some((c) => c.rows.some((r) => !r.confirmed));
  const candidates = data.documents.filter((d) => documentsWithValues.has(d.id));
  const chosen = identity.find((c) => c.reference?.chosen)?.reference?.documentId || '';
  async function choose(documentId: string) {
    setBusy(true);
    setError('');
    try {
      onChanged(
        await api<IdentityComparison[]>(`/packets/${data.packet.id}/identity-reference`, {
          method: 'PUT',
          body: body({ documentId: documentId || null }),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const summary =
    documentsWithValues.size < 2
      ? {
          tone: 'idle',
          Icon: HelpCircle,
          text: 'Only one document shows your name or date of birth so far. Add more documents to compare them.',
        }
      : differences
        ? {
            tone: 'differs',
            Icon: AlertTriangle,
            text: `${plural(differences, 'difference')} to check. Applications can be questioned when documents disagree, so fix them or keep proof that explains them.`,
          }
        : {
            tone: 'match',
            Icon: CheckCircle2,
            text: `Your name and date of birth match across ${plural(documentsWithValues.size, 'document')}.`,
          };
  return (
    <section className="sheet identity-panel" aria-labelledby="identity-title">
      <div className="sheet-head">
        <div>
          <h2 id="identity-title">
            <UserRoundCheck size={20} aria-hidden="true" />
            Name and date of birth
          </h2>
          <p className="microcopy">
            Capitals, titles such as “Mr”, punctuation and date formats are not differences.
          </p>
        </div>
        {candidates.length > 1 && (
          <label className="identity-reference">
            Compare with
            <select value={chosen} disabled={busy} onChange={(e) => void choose(e.target.value)}>
              <option value="">What most documents say</option>
              {candidates.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <p className={`identity-summary tone-${summary.tone}`} role="status">
        <summary.Icon size={18} aria-hidden="true" />
        <span>{summary.text}</span>
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="identity-grid">
        {withValues.map((comparison) => (
          <div className="identity-block" key={comparison.kind}>
            <h3>{titles[comparison.kind]}</h3>
            <ul>
              {comparison.rows.map((row) => {
                const verdict = verdicts[row.verdict];
                const doc = data.documents.find((d) => d.id === row.documentId);
                return (
                  <li key={row.factId + row.documentId} className={`tone-${verdict.tone}`}>
                    <span className="identity-value">
                      <strong className="data">{row.value}</strong>
                      {doc ? (
                        <button
                          className="text-link"
                          aria-label={`Open ${row.documentName}, page ${row.page}, to check the ${comparison.kind === 'name' ? 'name' : 'date of birth'}`}
                          onClick={() => onOpen(doc, row.factId)}
                        >
                          {row.documentName}, page {row.page}
                        </button>
                      ) : (
                        <small>
                          {row.documentName}, page {row.page}
                        </small>
                      )}
                    </span>
                    <span className="identity-verdict">
                      <span className="identity-badge">{verdict.label}</span>
                      {row.verdict !== 'same' && row.verdict !== 'reference' && (
                        <small>{row.detail}</small>
                      )}
                      {!row.confirmed && <small className="unconfirmed">Not confirmed yet</small>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {(unconfirmed || data.packet.profile.nameChanged === 'yes') && (
        <p className="panel-note">
          <HelpCircle size={15} aria-hidden="true" />
          {unconfirmed
            ? 'Some values were read automatically. Open the document to confirm or correct them against the original.'
            : ''}
          {data.packet.profile.nameChanged === 'yes'
            ? ' You said your name has changed: keep the gazette notification or affidavit with these documents.'
            : ''}
        </p>
      )}
    </section>
  );
}
