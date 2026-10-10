import { useEffect, useState } from 'react';
import {
  Activity,
  RefreshCw,
  FolderOpen,
  FileText,
  CheckCheck,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { api } from '../api';
import type { PacketCard } from './WorkspaceHome';
interface AuditEvent {
  id: string;
  action: string;
  objectId: string;
  createdAt: string;
}
const labels: Record<string, string> = {
  'consent.development-review.accepted': 'Account created',
  'packet.created': 'Application created',
  'packet.updated': 'Application details updated',
  'checklist.updated': 'Checklist updated',
  'document.uploaded': 'Document uploaded',
  'document.deleted': 'Document deleted',
  'packet.deleted': 'Application deleted',
  'evidence.linked': 'Evidence connected',
  'packet.evaluated': 'Readiness review saved',
  'packet.exported': 'Application exported',
  'account.updated': 'Profile updated',
  'account.password.changed': 'Password changed',
  'account.sessions.revoked': 'Other sessions signed out',
  'inspection.retried': 'Document inspection retried',
};
export function ActivityFeed({ packets }: { packets: PacketCard[] }) {
  const [events, setEvents] = useState<AuditEvent[]>([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(''),
    [filter, setFilter] = useState('all');
  async function refresh() {
    setBusy(true);
    setError('');
    try {
      setEvents(await api<AuditEvent[]>('/activity'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  const shown = events.filter((event) => filter === 'all' || event.action.startsWith(filter));
  return (
    <section className="panel activity-feed">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE HISTORY</span>
          <h2>Recent activity</h2>
          <p>Saved events across all of your applications.</p>
        </div>
        <button className="outline" disabled={busy} onClick={() => void refresh()}>
          <RefreshCw size={15} />
          Refresh activity
        </button>
      </div>
      <div className="filter-tabs">
        {[
          ['all', 'Everything'],
          ['packet', 'Applications'],
          ['document', 'Documents'],
          ['account', 'Account'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={filter === id ? 'active' : ''}>
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {busy ? (
        <p className="empty-small" role="status">
          Loading your activity…
        </p>
      ) : shown.length ? (
        <div className="audit-list">
          {shown.map((event) => {
            const Icon = event.action.includes('export')
              ? Download
              : event.action.includes('evaluated')
                ? CheckCheck
                : event.action.startsWith('document')
                  ? FileText
                  : event.action.startsWith('account')
                    ? ShieldCheck
                    : FolderOpen;
            const title = packets.find((p) => p.packet.id === event.objectId)?.packet.title;
            return (
              <article className="audit-event" key={event.id}>
                <span>
                  <Icon size={18} />
                </span>
                <div>
                  <h3>{labels[event.action] || 'Workspace updated'}</h3>
                  <p>{title || 'Private workspace event'}</p>
                </div>
                <time dateTime={event.createdAt}>
                  {new Date(event.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-small">
          <Activity size={24} />
          <h3>No events in this category yet.</h3>
          <p>Uploads, saved reviews and account changes will appear here as you work.</p>
        </div>
      )}
    </section>
  );
}
