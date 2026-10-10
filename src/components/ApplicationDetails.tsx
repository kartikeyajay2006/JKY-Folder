import { useState } from 'react';
import { Save } from 'lucide-react';
import { Dialog } from './Dialog';
import type { Packet } from '../../shared/model';
import { useCatalog } from '../catalog';
export function ApplicationDetails({
  packet,
  onClose,
  onSave,
}: {
  packet: Packet;
  onClose: () => void;
  onSave: (input: {
    title: string;
    destination: string;
    deadline: string;
    notes: string;
  }) => Promise<void>;
}) {
  const { limits } = useCatalog();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <Dialog
      title="Application details"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        className="dialog-body"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setBusy(true);
          setError('');
          try {
            await onSave({
              title: String(form.get('title')),
              destination: String(form.get('destination')),
              deadline: String(form.get('deadline')),
              notes: String(form.get('notes')),
            });
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Application name
          <input name="title" defaultValue={packet.title} required minLength={2} maxLength={100} />
        </label>
        <label>
          Institution or company
          <input name="destination" defaultValue={packet.destination || ''} maxLength={160} />
        </label>
        <label>
          Application deadline
          <input name="deadline" type="date" defaultValue={packet.deadline || ''} />
        </label>
        <label>
          Notes & original instructions
          <textarea
            name="notes"
            rows={5}
            defaultValue={packet.notes || ''}
            maxLength={limits.instructionChars}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary full" disabled={busy}>
          <Save size={16} aria-hidden="true" />
          {busy ? 'Saving…' : 'Save application details'}
        </button>
      </form>
    </Dialog>
  );
}
