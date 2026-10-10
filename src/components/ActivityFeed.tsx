import { useEffect, useState } from 'react';
import {
  Activity,
  RefreshCw,
  FolderOpen,
  FileText,
  CheckCheck,
  ShieldCheck,
  Download,
  Link2,
} from 'lucide-react';
import { api } from '../api';
import type { PacketCard } from './WorkspaceHome';
interface AuditEvent {
  id: string;
  action: string;
  objectId: string;
  createdAt: string;
}
// Plain-language names for the server's audit event codes.
const labels: Record<string, string> = {
  'consent.development-review.accepted': 'Account created',
  'demo.created': 'Demo workspace prepared',
  'push.subscribed': 'Notifications turned on in a browser',
  'support.requested': 'Support request sent',
  'support.access.granted': 'Support access granted for an application',
  'support.access.revoked': 'Support access revoked',
  'support.access.used': 'Support viewed an application with your permission',
  'support.closed': 'Support request closed',
  'push.unsubscribed': 'Notifications turned off in a browser',
  'packet.created': 'Application created',
  'packet.updated': 'Application details updated',
  'checklist.updated': 'Checklist updated',
  'profile.confirmed': 'Application answers confirmed',
  'document.uploaded': 'Document uploaded',
  'document.deleted': 'Document deleted',
  'packet.deleted': 'Application deleted',
  'evidence.linked': 'Evidence connected',
  'packet.evaluated': 'Readiness review saved',
  'packet.exported': 'Application exported',
  'account.updated': 'Profile updated',
  'account.password.changed': 'Password changed',
  'account.sessions.revoked': 'Other sessions signed out',
  'fact.corrected': 'Extracted fact reviewed',
  'checklist.update.accepted': 'Checklist update accepted',
  'inspection.retried': 'Document inspection retried',
  'document.attached': 'Document added from My documents',
  'document.version.created': 'Photo or signature fitted as a new version',
  'guardian.requested': 'Approval requested from a parent or guardian',
  'guardian.approved': 'A parent or guardian approved the account',
  'guardian.declined': 'A parent or guardian did not approve the account',
  'guardian.ended.adult': 'You turned 18; the account is now fully yours',
};
const filters = [
  { id: 'all', label: 'Everything', pattern: /./ },
  { id: 'packet', label: 'Applications', pattern: /^(packet|checklist|profile|evidence)\./ },
  { id: 'document', label: 'Documents', pattern: /^(document|inspection|fact)\./ },
  { id: 'account', label: 'Account', pattern: /^(account|consent|demo|push|support|guardian)\./ },
] as const;
const day = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(value),
  );
const time = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export function ActivityFeed({ packets }: { packets: PacketCard[] }) {
  const [events, setEvents] = useState<AuditEvent[]>([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(''),
    [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');
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
  const pattern = filters.find((f) => f.id === filter)!.pattern;
  const shown = events.filter((event) => pattern.test(event.action));
  const days = shown.reduce<{ day: string; events: AuditEvent[] }[]>((groups, event) => {
    const label = day(event.createdAt);
    const last = groups.at(-1);
    if (last?.day === label) last.events.push(event);
    else groups.push({ day: label, events: [event] });
    return groups;
  }, []);
  return (
    <section className="sheet activity-feed" aria-labelledby="activity-title">
      <div className="sheet-head">
        <h2 id="activity-title">Saved events</h2>
        <button className="outline small-button" disabled={busy} onClick={() => void refresh()}>
          <RefreshCw size={15} aria-hidden="true" className={busy ? 'spin' : ''} />
          Refresh activity
        </button>
      </div>
      <div className="filter-tabs" role="group" aria-label="Filter activity">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={filter === id ? 'active' : ''}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {busy && !events.length ? (
        <p className="empty-small" role="status">
          Loading your activity…
        </p>
      ) : shown.length ? (
        <div className="timeline">
          {days.map((group) => (
            <section key={group.day} className="timeline-day" aria-label={group.day}>
              <h3 className="timeline-date">{group.day}</h3>
              <ol>
                {group.events.map((event) => {
                  const Icon = event.action.includes('export')
                    ? Download
                    : event.action.includes('evaluated')
                      ? CheckCheck
                      : event.action.startsWith('evidence')
                        ? Link2
                        : event.action.startsWith('document') ||
                            event.action.startsWith('inspection')
                          ? FileText
                          : event.action.startsWith('account') || event.action.startsWith('consent')
                            ? ShieldCheck
                            : FolderOpen;
                  const title = packets.find((p) => p.packet.id === event.objectId)?.packet.title;
                  return (
                    <li className="audit-event" key={event.id}>
                      <span className="audit-icon" aria-hidden="true">
                        <Icon size={16} />
                      </span>
                      <div>
                        <h4>{labels[event.action] || 'Workspace updated'}</h4>
                        <p>{title || 'Private workspace event'}</p>
                      </div>
                      <time dateTime={event.createdAt} className="data">
                        {time(event.createdAt)}
                      </time>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-small">
          <Activity size={24} aria-hidden="true" />
          <h3>No events in this category yet.</h3>
          <p>Uploads, saved reviews and account changes appear here as you work.</p>
        </div>
      )}
    </section>
  );
}
