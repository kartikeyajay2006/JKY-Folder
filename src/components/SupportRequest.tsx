import { useEffect, useState } from 'react';
import { api, body } from '../api';
import type { PacketCard } from './WorkspaceHome';

interface Ticket {
  id: string;
  reference: string;
  category: string;
  priority: 'high' | 'normal';
  summary: string;
  status: 'open' | 'closed';
  createdAt: string;
  grant?: { expiresAt: string; revokedAt?: string; active: boolean };
}
const categories = [
  ['result_wrong', 'A checklist result looks wrong', 'Answered first.'],
  ['privacy', 'Privacy, deletion or a security concern', 'Answered first.'],
  ['technical', 'Something is not working', ''],
  ['rules_question', 'A question about requirements or instructions', ''],
  ['account', 'Account or sign-in', ''],
] as const;
const when = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

/**
 * Asking for help without sending documents. A request refers to an application; support can
 * see a redacted summary of it only if the applicant grants time-limited access.
 */
export function SupportRequest({
  packets,
  activeId,
  demo,
}: {
  packets: PacketCard[];
  activeId: string;
  demo: boolean;
}) {
  const visible = packets.filter((p) => p.documentCount > 0);
  const [category, setCategory] = useState<(typeof categories)[number][0]>('technical'),
    [summary, setSummary] = useState(''),
    [details, setDetails] = useState(''),
    [packetId, setPacketId] = useState(
      visible.some((p) => p.packet.id === activeId) ? activeId : visible[0]?.packet.id || '',
    ),
    [grantHours, setGrantHours] = useState<0 | 24 | 72>(0),
    [tickets, setTickets] = useState<Ticket[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [sent, setSent] = useState<Ticket | null>(null);
  useEffect(() => {
    void api<Ticket[]>('/support/tickets')
      .then(setTickets)
      .catch(() => {});
  }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="sheet support-request" aria-labelledby="support-title">
      <h2 id="support-title">Contact support</h2>
      <p className="microcopy">
        Describe what happened. Never paste document contents, ID numbers or passwords: support sees
        only what you choose to share below, for the time you choose.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run(async () => {
            const ticket = await api<Ticket>('/support/tickets', {
              method: 'POST',
              body: body({
                category,
                summary,
                details,
                ...(packetId ? { packetId } : {}),
                grantHours: packetId ? grantHours : 0,
              }),
            });
            setSent(ticket);
            setTickets((all) => [ticket, ...all]);
            setSummary('');
            setDetails('');
            setGrantHours(0);
          });
        }}
      >
        <fieldset className="support-categories">
          <legend>What do you need help with?</legend>
          {categories.map(([value, label, note]) => (
            <label key={value} className={category === value ? 'selected' : ''}>
              <input
                type="radio"
                name="support-category"
                value={value}
                checked={category === value}
                onChange={() => setCategory(value)}
              />
              <span>
                {label}
                {note && <small> {note}</small>}
              </span>
            </label>
          ))}
        </fieldset>
        <label>
          Short summary
          <input
            value={summary}
            minLength={5}
            maxLength={140}
            required
            onChange={(e) => setSummary(e.target.value)}
          />
        </label>
        <label>
          What happened <span className="optional">optional</span>
          <textarea
            rows={3}
            maxLength={2000}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </label>
        {!!visible.length && (
          <label>
            Which application is this about?
            <select value={packetId} onChange={(e) => setPacketId(e.target.value)}>
              <option value="">None</option>
              {visible.map((p) => (
                <option key={p.packet.id} value={p.packet.id}>
                  {p.packet.title}
                </option>
              ))}
            </select>
          </label>
        )}
        {packetId && (
          <fieldset className="choice-row">
            <legend>Let support see this application?</legend>
            {(
              [
                [0, 'Don’t share'],
                [24, 'For 24 hours'],
                [72, 'For 72 hours'],
              ] as const
            ).map(([hours, label]) => (
              <label key={hours} className={grantHours === hours ? 'selected' : ''}>
                <input
                  type="radio"
                  name="support-grant"
                  checked={grantHours === hours}
                  disabled={demo && hours > 0}
                  onChange={() => setGrantHours(hours)}
                />
                {label}
              </label>
            ))}
            <p className="field-help">
              Sharing shows support the checklist results, the file names and sizes and your latest
              report summary. It never shows document contents, extracted text or your notes. You
              can revoke it at any time below.
            </p>
          </fieldset>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div>
          <button className="primary" disabled={busy || summary.trim().length < 5}>
            {busy ? 'Sending…' : 'Send request'}
          </button>
        </div>
      </form>
      {sent && (
        <p className="success-notice" role="status">
          Request {sent.reference} sent.
          {sent.grant?.active ? ` Support may view it until ${when(sent.grant.expiresAt)}.` : ''}
        </p>
      )}
      {!!tickets.length && (
        <div className="support-history">
          <h3>Your requests</h3>
          <ul>
            {tickets.map((t) => (
              <li key={t.id}>
                <div>
                  <strong className="data">{t.reference}</strong> {t.summary}
                  <small>
                    {t.status === 'closed' ? 'Closed' : 'Open'}, sent {when(t.createdAt)}.{' '}
                    {t.grant?.active
                      ? `Support can view this application until ${when(t.grant.expiresAt)}.`
                      : t.grant?.revokedAt
                        ? 'Access revoked.'
                        : t.grant
                          ? 'Access expired.'
                          : 'No access shared.'}
                  </small>
                </div>
                {t.grant?.active && (
                  <button
                    className="outline small-button"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        const updated = await api<Ticket>(`/support/tickets/${t.id}/revoke`, {
                          method: 'POST',
                          body: body({}),
                        });
                        setTickets((all) => all.map((x) => (x.id === t.id ? updated : x)));
                      })
                    }
                  >
                    Revoke access
                    <span className="visually-hidden"> for {t.reference}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
