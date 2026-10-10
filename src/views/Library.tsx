import { useEffect, useState } from 'react';
import { Copy, FolderOpen, ShieldCheck } from 'lucide-react';
import { api, body } from '../api';
import { FileGlyph } from '../components/Marks';
import { date, plural, size } from '../components/Status';
import type { PacketCard } from '../components/WorkspaceHome';
import type { LibraryDocument, PacketDetail } from '../../shared/model';

const describe = (doc: LibraryDocument) =>
  [
    size(doc.size),
    doc.mime === 'image/jpeg' && doc.width && doc.height
      ? `${doc.width} × ${doc.height} px`
      : doc.pageCount
        ? plural(doc.pageCount, 'page')
        : '',
    `added ${date(doc.createdAt)}`,
  ]
    .filter(Boolean)
    .join(', ');

/** Adds library documents to an application; returns the names that were already there. */
export async function attachDocuments(packetId: string, documentIds: string[]) {
  const detail = await api<PacketDetail>(`/packets/${packetId}`);
  return api<{ attached: unknown[]; skipped: string[] }>(`/packets/${packetId}/documents/attach`, {
    method: 'POST',
    body: body({ expectedRevision: detail.packet.revision, documentIds }),
  });
}

/**
 * Every original the applicant has uploaded, once each, with the applications that use it.
 * Adding one to another application makes a private copy there, so the two stay independent.
 */
export function LibraryView({
  packets,
  search,
  onOpenApplication,
  onAdded,
}: {
  packets: PacketCard[];
  search: string;
  onOpenApplication: (packetId: string) => void;
  onAdded: (message: string) => Promise<void> | void;
}) {
  const [items, setItems] = useState<LibraryDocument[] | null>(null),
    [targets, setTargets] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(''),
    [error, setError] = useState('');
  const load = () =>
    api<LibraryDocument[]>('/library')
      .then(setItems)
      .catch((e) => setError((e as Error).message));
  useEffect(() => {
    void load();
  }, []);
  const query = search.trim().toLowerCase();
  const shown = (items || []).filter((d) => !query || d.name.toLowerCase().includes(query));
  async function add(doc: LibraryDocument) {
    const packetId = targets[doc.hash];
    if (!packetId) return;
    setBusy(doc.hash);
    setError('');
    try {
      const result = await attachDocuments(packetId, [doc.source.documentId]);
      const title =
        packets.find((p) => p.packet.id === packetId)?.packet.title || 'the application';
      await load();
      setTargets((t) => ({ ...t, [doc.hash]: '' }));
      await onAdded(
        result.skipped.length
          ? `${doc.name} is already in ${title}.`
          : `Added ${doc.name} to ${title}.`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  }
  return (
    <section className="sheet library-sheet" aria-labelledby="library-title">
      <div className="sheet-head">
        <h2 id="library-title">
          All originals <span className="count">{items?.length ?? 0}</span>
        </h2>
        <span className="private-label">
          <ShieldCheck size={15} aria-hidden="true" />
          Private to your account
        </span>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {items === null && !error && (
        <div className="skeleton-sheet" role="status" aria-label="Loading your documents">
          <span />
          <span />
          <span />
        </div>
      )}
      {items?.length === 0 && (
        <div className="empty-small">
          <h3>No documents yet.</h3>
          <p>Upload originals to an application and they appear here, ready to reuse.</p>
        </div>
      )}
      {query && items && items.length > 0 && !shown.length && (
        <div className="empty-small">
          <h3>No documents match “{search}”.</h3>
          <p>Search looks at file names.</p>
        </div>
      )}
      {shown.length > 0 && (
        <ul className="library-list">
          {shown.map((doc) => {
            const using = new Set(doc.uses.map((u) => u.packetId));
            const available = packets.filter((p) => !using.has(p.packet.id) && !p.packet.archived);
            return (
              <li key={doc.hash} className="library-row">
                <span className="library-file">
                  <FileGlyph mime={doc.mime} name={doc.name} size={34} />
                  <span>
                    <strong className="data">{doc.name}</strong>
                    <small>{describe(doc)}</small>
                  </span>
                </span>
                <span className="library-uses">
                  <span className="visually-hidden">Used in </span>
                  {doc.uses.map((use) => (
                    <button
                      key={use.documentId}
                      className="use-chip"
                      onClick={() => onOpenApplication(use.packetId)}
                      title={`Open ${use.packetTitle}`}
                    >
                      <FolderOpen size={13} aria-hidden="true" />
                      {use.packetTitle}
                      {use.archived && <span className="visually-hidden"> (archived)</span>}
                    </button>
                  ))}
                </span>
                <span className="library-add">
                  {doc.status !== 'ready' ? (
                    <small className="unused">
                      {doc.status === 'processing' ? 'Still being inspected' : 'Inspection failed'}
                    </small>
                  ) : available.length ? (
                    <>
                      <label className="visually-hidden" htmlFor={`add-${doc.hash}`}>
                        Add {doc.name} to an application
                      </label>
                      <select
                        id={`add-${doc.hash}`}
                        value={targets[doc.hash] || ''}
                        disabled={!!busy}
                        onChange={(e) => setTargets((t) => ({ ...t, [doc.hash]: e.target.value }))}
                      >
                        <option value="">Add to…</option>
                        {available.map((p) => (
                          <option key={p.packet.id} value={p.packet.id}>
                            {p.packet.title}
                          </option>
                        ))}
                      </select>
                      <button
                        className="outline small-button"
                        disabled={!targets[doc.hash] || !!busy}
                        onClick={() => void add(doc)}
                      >
                        <Copy size={14} aria-hidden="true" />
                        {busy === doc.hash ? 'Adding…' : 'Add'}
                        <span className="visually-hidden"> {doc.name}</span>
                      </button>
                    </>
                  ) : (
                    <small className="unused">In every open application</small>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="panel-note">
        <ShieldCheck size={15} aria-hidden="true" />
        Adding makes a private copy in that application, with its checked pages and confirmed
        details. Deleting one application never removes the file from another.
      </p>
    </section>
  );
}
