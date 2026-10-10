import { useEffect, useState } from 'react';
import { Dialog } from './Dialog';
import { FileGlyph } from './Marks';
import { plural, size } from './Status';
import { api } from '../api';
import { attachDocuments } from '../views/Library';
import type { LibraryDocument, PacketDetail } from '../../shared/model';

/** Picks originals already uploaded to other applications and adds them here. */
export function AttachDocuments({
  data,
  onClose,
  onAdded,
}: {
  data: PacketDetail;
  onClose: () => void;
  onAdded: (count: number) => Promise<void> | void;
}) {
  const [items, setItems] = useState<LibraryDocument[] | null>(null),
    [picked, setPicked] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    api<LibraryDocument[]>('/library')
      .then(setItems)
      .catch((e) => setError((e as Error).message));
  }, []);
  const here = new Set(data.documents.map((d) => d.hash));
  const choices = (items || []).filter((d) => !here.has(d.hash) && d.status === 'ready');
  const elsewhere = (doc: LibraryDocument) =>
    doc.uses
      .map((u) => u.packetTitle)
      .filter((title, i, all) => all.indexOf(title) === i)
      .join(', ');
  async function add() {
    setBusy(true);
    setError('');
    try {
      const ids = choices.filter((d) => picked.includes(d.hash)).map((d) => d.source.documentId);
      const result = await attachDocuments(data.packet.id, ids);
      await onAdded(result.attached.length);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <Dialog title="Add from my documents" onClose={() => !busy && onClose()}>
      <div className="dialog-body attach-dialog">
        <p className="microcopy">
          Choose originals you already uploaded to other applications. They are added to{' '}
          <strong>{data.packet.title}</strong> as private copies, with their checked pages and
          confirmed details.
        </p>
        {items === null && !error && <p role="status">Loading your documents…</p>}
        {items && !choices.length && (
          <div className="empty-small">
            <h3>Nothing to add.</h3>
            <p>
              {items.length
                ? 'Every inspected document you have is already in this application.'
                : 'Upload documents to another application first.'}
            </p>
          </div>
        )}
        {choices.length > 0 && (
          <fieldset className="attach-list">
            <legend className="visually-hidden">Documents to add</legend>
            {choices.map((doc) => (
              <label key={doc.hash} className={picked.includes(doc.hash) ? 'is-picked' : ''}>
                <input
                  type="checkbox"
                  checked={picked.includes(doc.hash)}
                  onChange={(e) =>
                    setPicked((p) =>
                      e.target.checked ? [...p, doc.hash] : p.filter((h) => h !== doc.hash),
                    )
                  }
                />
                <FileGlyph mime={doc.mime} name={doc.name} size={30} />
                <span>
                  <strong className="data">{doc.name}</strong>
                  <small>
                    {size(doc.size)}
                    {doc.mime === 'application/pdf' && doc.pageCount
                      ? `, ${plural(doc.pageCount, 'page')}`
                      : ''}
                    . In {elsewhere(doc)}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="button-row dialog-actions">
          <button className="outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="primary" disabled={busy || !picked.length} onClick={() => void add()}>
            {busy
              ? 'Adding…'
              : picked.length
                ? `Add ${plural(picked.length, 'document')}`
                : 'Add documents'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
