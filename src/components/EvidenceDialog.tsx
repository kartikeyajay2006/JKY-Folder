import { useState } from 'react';
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Check,
  TriangleAlert,
  Eye,
  Download,
} from 'lucide-react';
import { Dialog } from './Dialog';
import { PdfPreview } from './PdfPreview';
import { size } from './Status';
import type {
  EvidenceAnchor,
  EvidenceSuggestion,
  Requirement,
  DocumentRecord,
  EvidenceLink,
  RulePack,
} from '../../shared/model';
export function EvidenceDialog({
  requirement,
  pack,
  documents,
  existing,
  packetId,
  onClose,
  onSave,
  onUpload,
  suggestions = [],
}: {
  requirement: Requirement;
  pack: RulePack;
  documents: DocumentRecord[];
  existing?: EvidenceLink;
  packetId: string;
  onClose: () => void;
  onSave: (link: EvidenceLink) => Promise<void>;
  onUpload: () => void;
  suggestions?: EvidenceSuggestion[];
}) {
  const available = documents.filter((d) => d.status === 'ready');
  const [documentId, setDocumentId] = useState(existing?.documentId || available[0]?.id || '');
  const [pageFrom, setPageFrom] = useState(existing?.pageFrom || 1);
  const [pageTo, setPageTo] = useState(existing?.pageTo || 1);
  const [review, setReview] = useState<EvidenceLink['review']>(existing?.review || 'unreviewed');
  const [note, setNote] = useState(existing?.note || '');
  const [slot, setSlot] = useState(existing?.slot || requirement.evidenceSlots?.[0] || '');
  const [additional, setAdditional] = useState<EvidenceAnchor[]>(existing?.additional || []);
  const [busy, setBusy] = useState(false);
  const changeAdditional = (index: number, patch: Partial<EvidenceAnchor>) =>
    setAdditional((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const [error, setError] = useState('');
  const doc = available.find((d) => d.id === documentId);
  return (
    <Dialog
      title={requirement.title}
      onClose={() => {
        if (!busy) onClose();
      }}
      wide
    >
      <div className="evidence-layout">
        <section className="evidence-preview">
          <div className="preview-toolbar">
            <span>
              {doc?.mime === 'image/jpeg' ? (
                <ImageIcon size={16} aria-hidden="true" />
              ) : (
                <FileText size={16} aria-hidden="true" />
              )}
              Original evidence
            </span>
            {doc && (
              <a
                href={`/api/packets/${packetId}/documents/${doc.id}/content`}
                download={doc.name}
                className="text-link"
              >
                <Download size={14} aria-hidden="true" />
                Download
              </a>
            )}
          </div>
          {doc ? (
            <>
              <div className="paper-preview">
                {doc.mime === 'image/jpeg' ? (
                  <img
                    src={`/api/packets/${packetId}/documents/${doc.id}/content`}
                    alt={`Uploaded evidence: ${doc.name}`}
                  />
                ) : (
                  <>
                    <PdfPreview
                      url={`/api/packets/${packetId}/documents/${doc.id}/content`}
                      name={doc.name}
                      page={pageFrom}
                      onPageChange={(page) => {
                        setPageFrom(page);
                        setPageTo(page);
                        setReview('unreviewed');
                      }}
                    />
                    <details className="extracted-text-details" open>
                      <summary>Extracted page text</summary>
                      {doc.pages
                        .filter((p) => p.number >= pageFrom && p.number <= pageTo)
                        .map((p) => (
                          <div key={p.number} className="extracted-page">
                            <span>
                              Page {p.number} ·{' '}
                              {p.method === 'ocr'
                                ? `OCR (${Math.round(p.confidence || 0)}% confidence)`
                                : 'Extracted text'}
                            </span>
                            {p.warning && <p className="field-help">{p.warning}</p>}
                            <pre>
                              {p.text ||
                                'No reliable text was extracted. Review the original manually.'}
                            </pre>
                          </div>
                        ))}
                    </details>
                  </>
                )}
              </div>
              <div className="preview-caption">
                <span className="data">{doc.name}</span>
                <span>
                  {size(doc.size)}, {doc.pageCount} page{doc.pageCount === 1 ? '' : 's'}
                </span>
              </div>
            </>
          ) : (
            <div className="empty-preview">
              <FileText size={40} aria-hidden="true" />
              <h3>No document to show yet.</h3>
              <p>Upload the original first, then connect it to this requirement.</p>
              <button className="primary" onClick={onUpload}>
                Upload supporting document
              </button>
            </div>
          )}
        </section>
        <form
          className="evidence-controls"
          onSubmit={(event) => {
            event.preventDefault();
            setBusy(true);
            setError('');
            void onSave({
              documentId,
              pageFrom,
              pageTo,
              review,
              note,
              slot: slot || undefined,
              additional: additional.map(
                ({ documentId, pageFrom, pageTo, review, note, slot }) => ({
                  documentId,
                  pageFrom,
                  pageTo,
                  review,
                  note,
                  slot,
                }),
              ),
            })
              .catch((e) => setError(e.message))
              .finally(() => setBusy(false));
          }}
        >
          <h3 className="evidence-heading">What this item needs</h3>
          <p>{requirement.description}</p>
          <p className="field-help">{requirement.reviewHint}</p>
          {pack.sourceUrl && (
            <a className="inline-link" href={pack.sourceUrl} target="_blank" rel="noreferrer">
              {pack.assurance === 'reference'
                ? 'Read the official instructions'
                : 'Read your source instructions'}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
          <p className="field-help">
            {requirement.evidenceMode === 'any'
              ? 'Any accepted alternative can satisfy this item.'
              : 'Every linked component must be reviewed.'}
          </p>
          {!existing && suggestions.length > 0 && (
            <details className="evidence-suggestions">
              <summary>Suggested evidence — confirm before linking</summary>
              {suggestions.map((s) => (
                <button
                  className="outline"
                  type="button"
                  key={s.documentId + ':' + s.pageFrom}
                  onClick={() => {
                    setDocumentId(s.documentId);
                    setPageFrom(s.pageFrom);
                    setPageTo(s.pageTo);
                    setReview('unreviewed');
                    setNote('');
                  }}
                >
                  {available.find((d) => d.id === s.documentId)?.name}, page {s.pageFrom}
                  <span className="field-help">{s.reason}</span>
                </button>
              ))}
            </details>
          )}
          {requirement.evidenceSlots?.length ? (
            <label>
              Evidence component
              <select
                value={slot}
                onChange={(e) => {
                  setSlot(e.target.value);
                  setReview('unreviewed');
                }}
              >
                {requirement.evidenceSlots.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="divider" />
          <label>
            Supporting document
            <select
              value={documentId}
              required
              onChange={(event) => {
                setDocumentId(event.target.value);
                setPageFrom(1);
                setPageTo(1);
                setReview('unreviewed');
                setNote('');
              }}
            >
              <option value="">Choose a document</option>
              {available.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <div className="two-fields">
            <label>
              First page
              <input
                type="number"
                min={1}
                max={doc?.pageCount || 1}
                value={pageFrom}
                onChange={(e) => {
                  setPageFrom(Number(e.target.value));
                  setReview('unreviewed');
                }}
                required
              />
            </label>
            <label>
              Last page
              <input
                type="number"
                min={pageFrom}
                max={doc?.pageCount || 1}
                value={pageTo}
                onChange={(e) => {
                  setPageTo(Number(e.target.value));
                  setReview('unreviewed');
                }}
                required
              />
            </label>
          </div>
          <fieldset className="review-choice">
            <legend>Your content review</legend>
            {(
              [
                { value: 'unreviewed', label: 'I still need to review it', Icon: Eye },
                { value: 'confirmed', label: 'I reviewed the content', Icon: Check },
                { value: 'concern', label: 'I found something to check', Icon: TriangleAlert },
              ] as const
            ).map((item) => (
              <label key={item.value} className={review === item.value ? 'selected' : ''}>
                <input
                  type="radio"
                  name="review"
                  value={item.value}
                  checked={review === item.value}
                  onChange={() => setReview(item.value)}
                />
                <item.Icon size={16} aria-hidden="true" />
                {item.label}
              </label>
            ))}
          </fieldset>
          <label>
            Review note{' '}
            <span className="optional">
              {review === 'unreviewed' ? 'optional' : 'at least 10 characters'}
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              minLength={review === 'unreviewed' ? 0 : 10}
              maxLength={1500}
              required={review !== 'unreviewed'}
              placeholder="What did you compare? What still needs attention?"
              rows={3}
            />
          </label>
          {additional.map((anchor, i) => {
            const linked = available.find((d) => d.id === anchor.documentId);
            return (
              <fieldset className="additional-evidence" key={i}>
                <legend>Additional evidence {i + 1}</legend>
                <label>
                  Supporting file
                  <select
                    required
                    value={anchor.documentId}
                    onChange={(e) =>
                      changeAdditional(i, {
                        documentId: e.target.value,
                        pageFrom: 1,
                        pageTo: 1,
                        review: 'unreviewed',
                        note: '',
                      })
                    }
                  >
                    <option value="">Choose a document</option>
                    {available.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>
                {requirement.evidenceSlots?.length ? (
                  <label>
                    Component
                    <select
                      value={anchor.slot || ''}
                      required
                      onChange={(e) =>
                        changeAdditional(i, { slot: e.target.value, review: 'unreviewed' })
                      }
                    >
                      <option value="">Choose a component</option>
                      {requirement.evidenceSlots.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <div className="two-fields">
                  <label>
                    First page
                    <input
                      type="number"
                      required
                      min={1}
                      max={linked?.pageCount || 1}
                      value={anchor.pageFrom}
                      onChange={(e) =>
                        changeAdditional(i, {
                          pageFrom: Number(e.target.value),
                          review: 'unreviewed',
                        })
                      }
                    />
                  </label>
                  <label>
                    Last page
                    <input
                      type="number"
                      required
                      min={anchor.pageFrom}
                      max={linked?.pageCount || 1}
                      value={anchor.pageTo}
                      onChange={(e) =>
                        changeAdditional(i, {
                          pageTo: Number(e.target.value),
                          review: 'unreviewed',
                        })
                      }
                    />
                  </label>
                </div>
                {linked && (
                  <a
                    className="inline-link"
                    href={`/api/packets/${packetId}/documents/${linked.id}/content`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Inspect this original
                  </a>
                )}
                <label>
                  Content review
                  <select
                    value={anchor.review}
                    onChange={(e) =>
                      changeAdditional(i, { review: e.target.value as EvidenceAnchor['review'] })
                    }
                  >
                    <option value="unreviewed">I still need to review it</option>
                    <option value="confirmed">I reviewed the content</option>
                    <option value="concern">I found something to check</option>
                  </select>
                </label>
                <label>
                  Review note
                  <textarea
                    value={anchor.note}
                    required={anchor.review !== 'unreviewed'}
                    minLength={anchor.review !== 'unreviewed' ? 10 : 0}
                    maxLength={1500}
                    onChange={(e) => changeAdditional(i, { note: e.target.value })}
                  />
                </label>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => setAdditional((rows) => rows.filter((_, n) => n !== i))}
                >
                  Remove this evidence
                </button>
              </fieldset>
            );
          })}
          <button
            type="button"
            className="outline"
            disabled={additional.length >= 9 || busy}
            onClick={() =>
              setAdditional((rows) => [
                ...rows,
                {
                  documentId: available.find((d) => d.id !== documentId)?.id || documentId,
                  pageFrom: 1,
                  pageTo: 1,
                  review: 'unreviewed',
                  note: '',
                  slot: requirement.evidenceSlots?.[rows.length + 1],
                },
              ])
            }
          >
            Add another evidence file or page range
          </button>
          <p className="microcopy">
            Your confirmation records your own review. It does not verify authenticity or
            institutional acceptance.
          </p>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button className="primary full" disabled={busy || !doc}>
            {busy ? 'Saving…' : 'Save evidence link'}
          </button>
        </form>
      </div>
    </Dialog>
  );
}
