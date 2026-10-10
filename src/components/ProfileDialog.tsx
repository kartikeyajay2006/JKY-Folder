import { useState } from 'react';
import { Check, HelpCircle } from 'lucide-react';
import { Dialog } from './Dialog';
import type { Profile } from '../../shared/model';
import { useCatalog } from '../catalog';
export function ProfileDialog({
  profile,
  onClose,
  onSave,
}: {
  profile: Profile;
  onClose: () => void;
  onSave: (profile: Profile) => Promise<void>;
}) {
  const { questions } = useCatalog();
  const [values, setValues] = useState(profile);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <Dialog
      title="A few details about your application"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        className="dialog-body"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          void onSave(values)
            .catch((error) => setError(error.message))
            .finally(() => setBusy(false));
        }}
      >
        <div className="soft-notice">
          <HelpCircle size={19} />
          <p>
            These answers determine which documents you need. “I’m not sure” stays unresolved — it
            is never treated as “no.”
          </p>
        </div>
        {questions.map((q) => (
          <label key={q.field}>
            {q.label}
            <select
              aria-label={q.label}
              aria-describedby={`help-${q.field}`}
              value={values[q.field]}
              onChange={(e) => setValues({ ...values, [q.field]: e.target.value })}
            >
              {q.options.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <span id={`help-${q.field}`} className="field-help">
              {q.help}
            </span>
          </label>
        ))}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary full" disabled={busy}>
          {busy ? 'Saving…' : 'Confirm my answers'}
          <Check size={16} />
        </button>
      </form>
    </Dialog>
  );
}
