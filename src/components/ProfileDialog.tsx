import { useState } from 'react';
import { Check, HelpCircle } from 'lucide-react';
import { Dialog } from './Dialog';
import type { Profile } from '../../shared/model';
const questions: {
  field: keyof Profile;
  label: string;
  help: string;
  options: [string, string][];
}[] = [
  {
    field: 'education',
    label: 'Qualifying examination',
    help: 'Select the route that applies to the 2027 cycle.',
    options: [
      ['unknown', 'I’m not sure yet'],
      ['completed', 'Completed in 2026'],
      ['appearing', 'Appearing in 2027'],
    ],
  },
  {
    field: 'category',
    label: 'Application category',
    help: 'A selected category may need supporting evidence.',
    options: [
      ['unknown', 'I’m not sure yet'],
      ['general', 'General'],
      ['ews', 'EWS'],
      ['obc', 'OBC-NCL'],
      ['sc', 'SC'],
      ['st', 'ST'],
    ],
  },
  {
    field: 'nameChanged',
    label: 'Do your registration and certificate names differ?',
    help: 'Confirm this yourself. We do not infer legal identity from spelling differences.',
    options: [
      ['unknown', 'I need to compare them'],
      ['no', 'No — they match'],
      ['yes', 'Yes — they differ'],
    ],
  },
  {
    field: 'disability',
    label: 'Disability evidence route',
    help: 'This only controls the reference checklist; it does not judge entitlement.',
    options: [
      ['unknown', 'I’m not sure yet'],
      ['none', 'Not applying under this route'],
      ['pwd', 'PwD'],
      ['dyslexia', 'Dyslexia'],
    ],
  },
  {
    field: 'accommodation',
    label: 'Requesting a scribe or compensatory time?',
    help: 'Additional medical and category-specific evidence needs official review.',
    options: [
      ['unknown', 'I’m not sure yet'],
      ['no', 'No'],
      ['yes', 'Yes'],
    ],
  },
  {
    field: 'nationality',
    label: 'Nationality route',
    help: 'Foreign-national exceptions are outside our complete-check coverage.',
    options: [
      ['unknown', 'I’m not sure yet'],
      ['indian', 'Indian national'],
      ['foreign_before', 'Foreign / OCI or PIO before the official cutoff'],
      ['foreign_after', 'Foreign / OCI or PIO after the official cutoff'],
    ],
  },
];
export function ProfileDialog({
  profile,
  onClose,
  onSave,
}: {
  profile: Profile;
  onClose: () => void;
  onSave: (profile: Profile) => Promise<void>;
}) {
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
              {q.options.map(([value, label]) => (
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
