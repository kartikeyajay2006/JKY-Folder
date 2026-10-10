import { LogOut } from 'lucide-react';
import { useTheme, type ThemePreference } from '../theme';
import { useMotion } from '../motion/MotionProvider';
import { Notifications } from '../components/Notifications';
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
  const { preference, setPreference } = useTheme();
  const motion = useMotion();
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
          {user.guardian?.status === 'approved' && (
            <p className="guardian-note">
              {user.guardian.guardianName}, your{' '}
              {user.guardian.relationship === 'guardian' ? 'guardian' : 'parent'}, approved this
              account
              {user.guardian.decidedAt
                ? ` on ${new Date(user.guardian.decidedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : ''}
              . Until{' '}
              {new Date(user.guardian.adultOn).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              they can withdraw that approval, which deletes the account.
            </p>
          )}
          <button className="outline" disabled={busy} onClick={onLogout}>
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </section>
        <Notifications userId={user.id} preferences />
        <section className="sheet appearance" aria-labelledby="appearance-title">
          <h2 id="appearance-title">Appearance</h2>
          <fieldset className="choice-row">
            <legend>Theme</legend>
            {(
              [
                ['system', 'Match my device'],
                ['light', 'Gold (light)'],
                ['dark', 'Silver (dark)'],
              ] as [ThemePreference, string][]
            ).map(([value, label]) => (
              <label key={value} className={preference === value ? 'selected' : ''}>
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={preference === value}
                  onChange={() => setPreference(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={motion.enabled && !motion.reduced}
              disabled={motion.reduced}
              onChange={motion.toggle}
            />
            <span>
              Play interface animations
              <span className="field-help">
                {motion.reduced
                  ? ' Your device asks for reduced motion, so animations stay off.'
                  : ' Ticks drawing, folders opening and pages arriving.'}
              </span>
            </span>
          </label>
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
