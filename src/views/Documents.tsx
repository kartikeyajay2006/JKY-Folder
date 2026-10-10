import { RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { FileGlyph } from '../components/Marks';
import { Status, date, size, plural } from '../components/Status';
import { UploadDropzone } from '../components/UploadDropzone';
import { UploadQueue, type UploadItem } from '../components/UploadQueue';
import { PendingUploads } from '../components/PendingUploads';
import { evidenceAnchors } from '../../shared/model';
import type { DocumentRecord, PacketDetail } from '../../shared/model';

export function DocumentsView({
  data,
  search,
  busy,
  uploadBatch,
  onUpload,
  onChoose,
  onDismissBatch,
  onPreview,
  onDelete,
  onRetry,
  onCancelUpload,
}: {
  data: PacketDetail;
  search: string;
  busy: string;
  uploadBatch: UploadItem[] | null;
  onUpload: (files: FileList | File[]) => void;
  onChoose: () => void;
  onDismissBatch: () => void;
  onPreview: (doc: DocumentRecord) => void;
  onDelete: (doc: DocumentRecord) => void;
  onRetry: (doc: DocumentRecord) => void;
  onCancelUpload?: () => void;
}) {
  const { documents, packet, pack } = data;
  const query = search.trim().toLowerCase();
  const shown = documents.filter(
    (d) =>
      !query || `${d.name} ${d.pages.map((p) => p.text).join(' ')}`.toLowerCase().includes(query),
  );
  // Which checklist items each original currently supports.
  const usedFor = (doc: DocumentRecord) =>
    Object.entries(packet.links)
      .filter(([, link]) => evidenceAnchors(link).some((a) => a.documentId === doc.id))
      .map(([id]) => pack.requirements.find((r) => r.id === id)?.title)
      .filter(Boolean) as string[];
  return (
    <div className="documents-view">
      {uploadBatch && (
        <UploadQueue
          items={uploadBatch}
          busy={busy === 'upload'}
          onRetry={onUpload}
          onDismiss={onDismissBatch}
          onCancel={onCancelUpload}
        />
      )}
      <PendingUploads
        packetId={packet.id}
        busy={busy === 'upload'}
        onResume={(file) => onUpload([file])}
      />
      <UploadDropzone
        busy={!!busy}
        uploading={busy === 'upload'}
        onChoose={onChoose}
        onFiles={onUpload}
      />
      <section className="sheet documents-sheet" aria-labelledby="originals-title">
        <div className="sheet-head">
          <h2 id="originals-title">
            Originals <span className="count">{documents.length}</span>
          </h2>
          <span className="private-label">
            <ShieldCheck size={15} aria-hidden="true" />
            Private to your account
          </span>
        </div>
        {shown.length > 0 && (
          <ul className="document-list">
            {shown.map((doc) => {
              const uses = usedFor(doc);
              return (
                <li className="document-row" key={doc.id}>
                  <button
                    className="document-name"
                    onClick={() => onPreview(doc)}
                    aria-label={`Open ${doc.name}`}
                  >
                    <FileGlyph mime={doc.mime} name={doc.name} size={34} />
                    <span>
                      <strong className="data">{doc.name}</strong>
                      <small>
                        {size(doc.size)}
                        {doc.status === 'ready' && `, ${plural(doc.pageCount, 'page')}`}, added{' '}
                        {date(doc.createdAt)}
                      </small>
                    </span>
                  </button>
                  <span className="document-uses">
                    {uses.length ? (
                      <>
                        <span className="visually-hidden">Supports </span>
                        {uses.map((title) => (
                          <span className="use-tag" key={title}>
                            {title}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span className="unused">Not linked yet</span>
                    )}
                  </span>
                  <span className="document-state">
                    {doc.status === 'ready' ? (
                      <span className="status status-pass">Inspected</span>
                    ) : (
                      <>
                        <Status state={doc.status === 'processing' ? 'pending' : 'error'} />
                        {doc.status === 'error' && (
                          <button
                            className="text-link"
                            disabled={!!busy}
                            onClick={() => onRetry(doc)}
                          >
                            Retry inspection
                            <RefreshCw size={13} aria-hidden="true" />
                          </button>
                        )}
                      </>
                    )}
                  </span>
                  <button
                    className="icon-button delete-button"
                    aria-label={`Delete ${doc.name}`}
                    onClick={() => onDelete(doc)}
                    disabled={!!busy}
                  >
                    <Trash2 size={17} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {!documents.length && (
          <div className="empty-small">
            <h3>This folder is empty.</h3>
            <p>Add the original files you plan to submit. They stay exactly as uploaded.</p>
          </div>
        )}
        {query && documents.length > 0 && !shown.length && (
          <div className="empty-small">
            <h3>No documents match “{search}”.</h3>
            <p>Search looks at file names and text extracted from PDF pages.</p>
          </div>
        )}
        <p className="panel-note">
          <ShieldCheck size={15} aria-hidden="true" />
          Inspection checks a file’s structure and reads PDF text. It never judges whether a
          document is authentic.
        </p>
      </section>
    </div>
  );
}
