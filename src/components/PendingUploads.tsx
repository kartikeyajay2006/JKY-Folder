import { useEffect, useRef, useState } from 'react';
import { api, pendingUploads, type UploadSession } from '../api';
import { uploadRules, useCatalog } from '../catalog';
import { FileGlyph } from './Marks';
import { size } from './Status';

const until = (ms: number) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms));

/**
 * Transfers that stopped part-way. The server keeps their acknowledged chunks for 24 hours;
 * choosing the same original continues from the saved offset instead of starting over.
 */
export function PendingUploads({
  packetId,
  busy,
  onResume,
}: {
  packetId: string | null;
  busy: boolean;
  onResume: (file: File) => void;
}) {
  const rules = uploadRules(useCatalog().limits);
  const [items, setItems] = useState<UploadSession[]>([]);
  const [target, setTarget] = useState<UploadSession | null>(null);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  async function load() {
    const rows = await pendingUploads().catch(() => [] as UploadSession[]);
    setItems(rows.filter((row) => (row.packetId || null) === (packetId || null)));
  }
  useEffect(() => {
    if (!busy) void load();
  }, [packetId, busy]);
  if (!items.length) return null;
  return (
    <section className="sheet pending-uploads" aria-labelledby="pending-title">
      <div className="sheet-head">
        <div>
          <h2 id="pending-title">Unfinished uploads</h2>
          <p className="microcopy">
            These transfers stopped part-way. The saved part is kept for 24 hours after the last
            chunk arrived. Choose the same file to finish from where it stopped.
          </p>
        </div>
      </div>
      <ul>
        {items.map((session) => {
          const percent = Math.floor((session.offset / session.size) * 100);
          return (
            <li key={session.id}>
              <FileGlyph mime="" name={session.name || ''} size={30} />
              <div>
                <strong className="data">{session.name}</strong>
                <progress
                  value={session.offset}
                  max={session.size}
                  aria-label={`${session.name}: ${percent}% saved`}
                />
                <small>
                  {percent}% of {size(session.size)} saved. Kept until {until(session.expiresAt)}.
                </small>
              </div>
              <div className="button-row">
                <button
                  className="outline small-button"
                  disabled={busy}
                  onClick={() => {
                    setError('');
                    setTarget(session);
                    input.current?.click();
                  }}
                >
                  Finish upload
                  <span className="visually-hidden"> of {session.name}</span>
                </button>
                <button
                  className="quiet small-button"
                  disabled={busy}
                  onClick={() =>
                    void api(`/uploads/${session.id}`, { method: 'DELETE' })
                      .then(load)
                      .catch((e) => setError((e as Error).message))
                  }
                >
                  Discard
                  <span className="visually-hidden"> {session.name}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <input
        ref={input}
        type="file"
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        accept={rules.accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file || !target) return;
          if (file.name !== target.name || file.size !== target.size) {
            setError(
              `That is a different file. Choose ${target.name} (${size(target.size)}) to continue its saved upload.`,
            );
            return;
          }
          onResume(file);
        }}
      />
    </section>
  );
}
