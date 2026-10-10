import { UploadDropzone } from './UploadDropzone';
import { UploadQueue, type UploadItem } from './UploadQueue';
import { PendingUploads } from './PendingUploads';
export function UploadStart({
  busy,
  items,
  onChoose,
  onUpload,
  onRetry,
  onDismiss,
  onCancel,
}: {
  busy: string;
  items: UploadItem[] | null;
  onChoose: () => void;
  onUpload: (files: FileList | File[]) => void;
  onRetry: (files: File[]) => void;
  onDismiss: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="documents-view">
      <section className="sheet section-empty">
        <h2>Upload your first document.</h2>
        <p>
          Your folders and checklist will appear after you add files. Only your uploaded documents
          are included.
        </p>
      </section>
      {items && (
        <UploadQueue
          items={items}
          busy={busy === 'upload'}
          onRetry={onRetry}
          onDismiss={onDismiss}
          onCancel={onCancel}
        />
      )}
      <PendingUploads
        packetId={null}
        busy={busy === 'upload'}
        onResume={(file) => onUpload([file])}
      />
      <UploadDropzone
        busy={!!busy}
        uploading={busy === 'upload'}
        onChoose={onChoose}
        onFiles={onUpload}
      />
    </div>
  );
}
