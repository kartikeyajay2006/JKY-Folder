import { Check, AlertCircle, Clock, LoaderCircle, X, RefreshCw } from 'lucide-react';
export interface UploadItem {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'added' | 'duplicate' | 'failed';
  error?: string;
}
export function UploadQueue({
  items,
  busy,
  onRetry,
  onDismiss,
}: {
  items: UploadItem[];
  busy: boolean;
  onRetry: (files: File[]) => void;
  onDismiss: () => void;
}) {
  const failed = items.filter((i) => i.status === 'failed');
  const complete = items.filter((i) => i.status === 'added' || i.status === 'duplicate').length;
  return (
    <section className="panel upload-queue" aria-label="Upload results">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">DOCUMENT INTAKE</span>
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
          <li key={item.id} className={item.status === 'failed' ? 'upload-failed' : ''}>
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
              <strong>{item.file.name}</strong>
              <p>
                {item.error ||
                  {
                    queued: 'Waiting to upload',
                    uploading: 'Uploading original…',
                    added: 'Added — inspection runs separately',
                    duplicate: 'Already in this folder — no second copy created',
                    failed: 'Could not upload',
                  }[item.status]}
              </p>
            </div>
          </li>
        ))}
      </ul>
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
