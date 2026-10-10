import { LogOut } from 'lucide-react';
import { AccountSettings } from '../components/AccountSettings';
import { useCatalog } from '../catalog';
import { plural } from '../components/Status';
import type { Packet, User } from '../../shared/model';
import type { PacketCard } from '../components/WorkspaceHome';

export function SettingsView({
  user,
  packets,
  packet,
  busy,
  onUser,
  onLogout,
  onDeletePacket,
  onDeleteAccount,
}: {
  user: User;
  packets: PacketCard[];
  packet?: Packet;
  busy: boolean;
  onUser: (user: User) => void;
  onLogout: () => void;
  onDeletePacket: () => void;
  onDeleteAccount: () => void;
}) {
  const { limits } = useCatalog();
  const documents = packets.reduce((n, p) => n + p.documentCount, 0);
  return (
    <div className="settings-view">
      <AccountSettings user={user} onUser={onUser} />
      <div className="settings-side">
        <section className="sheet settings-summary" aria-labelledby="stored-title">
          <h2 id="stored-title">What’s stored</h2>
          <dl className="stored-list">
            <div>
              <dt>Applications</dt>
              <dd className="data">{packets.length}</dd>
            </div>
            <div>
              <dt>Original documents</dt>
              <dd className="data">{documents}</dd>
            </div>
            <div>
              <dt>Saved reviews</dt>
              <dd className="data">{packets.filter((p) => p.latestRun).length}</dd>
            </div>
          </dl>
          <p className="microcopy">
            {user.demo
              ? `This is an isolated, fictional demo workspace. It is deleted after ${limits.sessionHours} hours.`
              : `Signed in as ${user.email}. Sessions last ${limits.sessionHours} hours.`}
          </p>
          <button className="outline" disabled={busy} onClick={onLogout}>
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </section>
        <section className="sheet danger-zone" aria-labelledby="danger-title">
          <h2 id="danger-title">Delete data</h2>
          <p className="microcopy">
            Deleting removes originals and extracted text. Deleted evidence is also removed from
            saved reports.
          </p>
          {packet && (
            <div className="danger-setting">
              <div>
                <strong>Delete this application</strong>
                <p>
                  {packet.title}, with{' '}
                  {plural(
                    packets.find((p) => p.packet.id === packet.id)?.documentCount || 0,
                    'document',
                  )}
                </p>
              </div>
              <button className="danger-outline" onClick={onDeletePacket}>
                Delete application
              </button>
            </div>
          )}
          <div className="danger-setting">
            <div>
              <strong>Delete your account</strong>
              <p>Every application, document, report and session.</p>
            </div>
            <button className="danger-outline" onClick={onDeleteAccount}>
              Delete account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
