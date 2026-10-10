import { useState } from 'react';
import { Plus, Save, AlertCircle } from 'lucide-react';
import { Dialog } from './Dialog';
import { RequirementRows } from './ApplicationWizard';
import { templateRequirement } from '../../shared/templates';
import type { Requirement, RulePack } from '../../shared/model';
import { useCatalog } from '../catalog';
export function ChecklistEditor({
  pack,
  notes,
  onClose,
  onSave,
}: {
  pack: RulePack;
  notes: string;
  onClose: () => void;
  onSave: (input: {
    requirements: Requirement[];
    sourceUrl: string;
    notes: string;
  }) => Promise<void>;
}) {
  const { limits } = useCatalog();
  const [rows, setRows] = useState(pack.requirements),
    [url, setUrl] = useState(pack.sourceUrl),
    [instructions, setInstructions] = useState(notes),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <Dialog
      wide
      title="Edit your checklist"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        className="wizard-body"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            await onSave({ requirements: rows, sourceUrl: url, notes: instructions });
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="microcopy">
          Keep your checklist aligned with the instructions you received. Changes make saved reports
          historical.
        </p>
        <RequirementRows rows={rows} onChange={setRows} />
        <button
          className="outline add-row"
          type="button"
          disabled={rows.length >= limits.requirements}
          onClick={() =>
            setRows([
              ...rows,
              {
                ...templateRequirement('New requirement', rows.length),
                id: 'r-' + crypto.randomUUID(),
              },
            ])
          }
        >
          <Plus size={16} aria-hidden="true" />
          Add requirement
        </button>
        <label>
          Source URL
          <input type="url" value={url} maxLength={2000} onChange={(e) => setUrl(e.target.value)} />
        </label>
        <label>
          Original instructions & notes
          <textarea
            rows={4}
            maxLength={limits.instructionChars}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </label>
        <div className="soft-notice">
          <AlertCircle size={18} aria-hidden="true" />
          <p>
            Removing an item removes its evidence link. Older reports remain historical and retain
            the checks used at that time.
          </p>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary full" disabled={busy || !rows.length}>
          <Save size={16} aria-hidden="true" />
          {busy ? 'Saving…' : 'Save checklist'}
        </button>
      </form>
    </Dialog>
  );
}
