import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { uploadRules, useCatalog } from '../catalog';

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
  const rules = uploadRules(useCatalog().limits);
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const open = dragging && !busy;
  return (
    <section
      className={`upload-zone ${open ? 'is-dragging' : ''} ${uploading ? 'is-uploading' : ''}`}
      aria-labelledby="upload-title"
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
      <div className="pocket" aria-hidden="true">
        <span className="pocket-back" />
        <span className="pocket-sheet sheet-a" />
        <span className="pocket-sheet sheet-b" />
        <span className="pocket-front" />
      </div>
      <div className="upload-copy">
        <h2 id="upload-title">
          {uploading
            ? 'Adding your documents…'
            : open
              ? 'Release to add your documents'
              : 'Drop originals into this folder'}
        </h2>
        <p>
          {open
            ? 'Each file is inspected after upload. Nothing is changed in your originals.'
            : 'Drag files here, or choose them from your device.'}
        </p>
        <button className="primary" onClick={onChoose} disabled={busy}>
          <Plus size={16} aria-hidden="true" />
          Choose documents
        </button>
        <small>
          {rules.formats}, up to {rules.perFile} each. Up to {rules.files} files and{' '}
          {rules.perPacket} per application.
        </small>
      </div>
    </section>
  );
}
