import { Check, AlertCircle, Clock, LoaderCircle, X, RefreshCw } from 'lucide-react';
export interface UploadItem {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'added' | 'duplicate' | 'failed' | 'cancelled';
  error?: string;
  progress?: number;
  /** Live transfer note, such as an automatic retry after a dropped connection. */
  note?: string;
}
export function UploadQueue({
  items,
  busy,
  onRetry,
  onDismiss,
  onCancel,
}: {
  items: UploadItem[];
  busy: boolean;
  onRetry: (files: File[]) => void;
  onDismiss: () => void;
  onCancel?: () => void;
}) {
  const failed = items.filter((i) => i.status === 'failed' || i.status === 'cancelled');
  const complete = items.filter((i) => i.status === 'added' || i.status === 'duplicate').length;
  return (
    <section className="sheet upload-queue" aria-label="Upload results">
      <div className="sheet-head">
        <div>
          <h2>{busy ? 'Adding your files' : 'Upload results'}</h2>
          <p>
            {complete} of {items.length} files accepted. Accepted files are inspected before
            evidence review.
          </p>
        </div>
        <button
          className="icon-button"
          disabled={busy}
          aria-label="Dismiss upload results"
          onClick={onDismiss}
        >
          <X size={18} />
        </button>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={`upload-${item.status}`}>
            {item.status === 'failed' ? (
              <AlertCircle size={18} />
            ) : item.status === 'uploading' ? (
              <LoaderCircle className="spin" size={18} />
            ) : item.status === 'queued' ? (
              <Clock size={18} />
            ) : (
              <Check size={18} />
            )}
            <div>
              <strong className="data">{item.file.name}</strong>
              {item.status === 'uploading' && (
                <progress
                  aria-label={`Uploading ${item.file.name}`}
                  value={item.progress || 0}
                  max={100}
                />
              )}
              {item.status === 'uploading' && item.note && (
                <p className="upload-note" role="status">
                  {item.note}
                </p>
              )}
              <p>
                {item.error ||
                  {
                    queued: 'Waiting to upload',
                    uploading: 'Uploading original…',
                    added: 'Added. Inspection runs separately.',
                    duplicate: 'Already in this folder. No second copy was created.',
                    failed: 'Could not upload',
                    cancelled: 'Cancelled. Refresh the folder before retrying.',
                  }[item.status]}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {busy && onCancel && (
        <button className="outline" onClick={onCancel}>
          Cancel remaining uploads
        </button>
      )}
      {!!failed.length && (
        <div className="upload-queue-footer">
          <p>
            Accepted files stay in your folder. Retry a temporary failure or choose a supported
            replacement.
          </p>
          <button
            className="outline"
            disabled={busy}
            onClick={() => onRetry(failed.map((i) => i.file))}
          >
            <RefreshCw size={15} />
            Retry failed uploads
          </button>
        </div>
      )}
    </section>
  );
}
