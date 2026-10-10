import { useRef, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
export function UploadDropzone({
  busy,
  uploading,
  onChoose,
  onFiles,
}: {
  busy: boolean;
  uploading: boolean;
  onChoose: () => void;
  onFiles: (files: FileList) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  return (
    <section
      className={`upload-zone ${dragging && !busy ? 'is-dragging' : ''}`}
      onDragEnter={(event) => {
        if (!event.dataTransfer.types.includes('Files')) return;
        event.preventDefault();
        depth.current++;
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        depth.current = Math.max(0, depth.current - 1);
        if (!depth.current) setDragging(false);
      }}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes('Files')) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = busy ? 'none' : 'copy';
      }}
      onDrop={(event) => {
        event.preventDefault();
        depth.current = 0;
        setDragging(false);
        if (!busy && event.dataTransfer.files.length) onFiles(event.dataTransfer.files);
      }}
    >
      <span className="upload-icon">
        <Upload size={27} />
      </span>
      <h2>
        {uploading
          ? 'Adding your documents…'
          : dragging && !busy
            ? 'Release to add your documents'
            : 'A place for every supporting document.'}
      </h2>
      <p>
        {dragging && !busy
          ? 'Your originals will be inspected after upload.'
          : 'Drop your files here, or choose them from your device.'}
      </p>
      <button className="primary" onClick={onChoose} disabled={busy}>
        <Plus size={16} />
        Choose documents
      </button>
      <small>PDF or JPEG · Up to 10 MB per file · 10 files per packet</small>
    </section>
  );
}
