import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  GraduationCap,
  BriefcaseBusiness,
  Award,
  SlidersHorizontal,
  Plus,
  Trash2,
  ListChecks,
  Link2,
  FileText,
} from 'lucide-react';
import { Dialog } from './Dialog';
import {
  templates,
  starterRequirements,
  importInstructionLines,
  templateRequirement,
} from '../../shared/templates';
import { uceedPack } from '../../shared/packs';
import type { Requirement } from '../../shared/model';
export interface CreateApplicationInput {
  title: string;
  templateId?: 'college' | 'scholarship' | 'job' | 'custom';
  packId?: string;
  requirements?: Requirement[];
  destination: string;
  deadline: string;
  sourceUrl: string;
  instructionText: string;
}
const icons = {
  college: GraduationCap,
  job: BriefcaseBusiness,
  scholarship: Award,
  custom: SlidersHorizontal,
};
export function ApplicationWizard({
  initialTemplate = 'college',
  onClose,
  onCreate,
}: {
  initialTemplate?: string;
  onClose: () => void;
  onCreate: (input: CreateApplicationInput) => Promise<void>;
}) {
  const [selected, setSelected] = useState(initialTemplate),
    [step, setStep] = useState(0),
    [title, setTitle] = useState(''),
    [destination, setDestination] = useState(''),
    [deadline, setDeadline] = useState(''),
    [sourceUrl, setSourceUrl] = useState(''),
    [instructions, setInstructions] = useState(''),
    [rows, setRows] = useState<Requirement[]>(starterRequirements(initialTemplate)),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const reference = selected === 'uceed';
  function choose(id: string) {
    setSelected(id);
    setRows(starterRequirements(id));
    setError('');
  }
  async function save() {
    setBusy(true);
    setError('');
    try {
      await onCreate({
        title,
        destination,
        deadline,
        sourceUrl,
        instructionText: instructions,
        ...(reference
          ? { packId: uceedPack.id }
          : { templateId: selected as CreateApplicationInput['templateId'], requirements: rows }),
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      wide
      title="Create an application"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <div className="wizard-body">
        <ol className="wizard-steps">
          {['Choose a starting point', 'Application details', 'Confirm requirements'].map(
            (label, i) => (
              <li key={label} className={step === i ? 'current' : step > i ? 'complete' : ''}>
                <span>{step > i ? <Check size={13} /> : i + 1}</span>
                {label}
              </li>
            ),
          )}
        </ol>
        {step === 0 && (
          <>
            <div className="wizard-intro">
              <span className="eyebrow">LET’S MAKE THIS YOURS</span>
              <h3>What are you applying for?</h3>
              <p>Choose a starting point. You can adapt every item in a custom checklist.</p>
            </div>
            <div className="template-grid">
              {templates.map((t) => {
                const Icon = icons[t.kind];
                return (
                  <button
                    type="button"
                    className={`template-card ${selected === t.id ? 'selected' : ''}`}
                    aria-pressed={selected === t.id}
                    key={t.id}
                    onClick={() => choose(t.id)}
                  >
                    <span className="template-icon">
                      <Icon size={24} />
                    </span>
                    <strong>{t.title}</strong>
                    <p>{t.description}</p>
                    <span className="template-foot">
                      {t.requirements.length
                        ? t.requirements.length + ' starter items'
                        : 'Your instructions, your checklist'}
                      {selected === t.id ? <Check size={16} /> : <ArrowRight size={16} />}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className={`reference-choice ${reference ? 'selected' : ''}`}
              aria-pressed={reference}
              onClick={() => choose('uceed')}
            >
              <GraduationCap size={21} />
              <span>
                <strong>UCEED 2027</strong>
                <small>Versioned reference checklist · conditional profile questions</small>
              </span>
              {reference ? <Check size={18} /> : <ArrowRight size={18} />}
            </button>
            <p className="wizard-disclosure">
              Starter templates help you organize. Confirm the required items with your institution
              or employer.
            </p>
          </>
        )}
        {step === 1 && (
          <form
            id="application-details"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
          >
            <div className="wizard-intro">
              <h3>Give your next opportunity a home.</h3>
              <p>Add the details you want to keep track of.</p>
            </div>
            <label>
              Application name
              <input
                aria-label="Application name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                placeholder={
                  selected === 'job'
                    ? 'e.g. Product designer at Acme'
                    : 'e.g. My university application'
                }
              />
            </label>
            <div className="form-columns">
              <label>
                Institution or company
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  maxLength={160}
                  placeholder="Where are you applying?"
                />
              </label>
              <label>
                Application deadline
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </label>
            </div>
            {!reference && (
              <>
                <label>
                  Instructions source URL <span className="optional-label">optional</span>
                  <span className="input-icon">
                    <Link2 size={16} />
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://…"
                      maxLength={2000}
                    />
                  </span>
                </label>
                <label>
                  Paste your document instructions <span className="optional-label">optional</span>
                  <textarea
                    rows={4}
                    maxLength={20000}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={
                      'One requirement per line, for example:\nResume as PDF\nDegree certificate\nRecommendation letter'
                    }
                  />
                </label>
                <p className="field-help">
                  We can turn each line into an editable item. Review conditions and formats
                  yourself before using the checklist.
                </p>
                {instructions.trim() && (
                  <button
                    type="button"
                    className="outline"
                    onClick={() => {
                      setRows(importInstructionLines(instructions));
                      setStep(2);
                    }}
                  >
                    <ListChecks size={16} />
                    Use these lines as requirements
                  </button>
                )}
              </>
            )}
          </form>
        )}
        {step === 2 && (
          <>
            <div className="wizard-intro">
              <h3>
                {reference
                  ? 'Review your checklist.'
                  : 'Make the checklist match your instructions.'}
              </h3>
              <p>
                {reference
                  ? 'UCEED includes conditional evidence. You’ll confirm your profile after creating the application.'
                  : 'Change formats, mark optional items, and remove anything that doesn’t apply.'}
              </p>
            </div>
            {reference ? (
              <div className="reference-preview">
                <strong>{uceedPack.requirements.length} versioned requirements</strong>
                <p>
                  Identity, education and supporting evidence. This is a limited reference; compare
                  it to the official instructions.
                </p>
                <a
                  className="source-link"
                  href={uceedPack.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read the source <ArrowRight size={15} />
                </a>
              </div>
            ) : (
              <>
                <RequirementRows rows={rows} onChange={setRows} />
                <button
                  type="button"
                  className="outline"
                  onClick={() =>
                    setRows([
                      ...rows,
                      {
                        ...templateRequirement('New requirement', rows.length),
                        id: 'r-' + crypto.randomUUID(),
                      },
                    ])
                  }
                  disabled={rows.length >= 50}
                >
                  <Plus size={16} />
                  Add requirement
                </button>
                {!rows.length && (
                  <p className="field-help">Add at least one requirement to get started.</p>
                )}
              </>
            )}
          </>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="wizard-footer">
          <span>
            <FileText size={15} />
            {reference ? 'Reference checklist' : 'Your own checklist'}
          </span>
          <div>
            {step > 0 && (
              <button
                className="outline"
                type="button"
                disabled={busy}
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={15} />
                Back
              </button>
            )}
            {step === 0 ? (
              <button className="primary" type="button" onClick={() => setStep(1)}>
                Continue <ArrowRight size={16} />
              </button>
            ) : step === 1 ? (
              <button className="primary" type="submit" form="application-details">
                Review checklist <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="primary"
                disabled={busy || (!reference && !rows.length) || title.trim().length < 2}
                onClick={() => void save()}
              >
                {busy ? 'Creating…' : 'Create application'}
                <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
export function RequirementRows({
  rows,
  onChange,
}: {
  rows: Requirement[];
  onChange: (rows: Requirement[]) => void;
}) {
  function change(index: number, patch: Partial<Requirement>) {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  const conditions = [
    ['always', 'Always required'],
    ['nameChanged:yes', 'When names differ'],
    ['education:appearing', 'When qualifying results are pending'],
    ['category:ews', 'When applying as EWS'],
    ['category:obc', 'When applying as OBC'],
    ['category:sc', 'When applying as SC'],
    ['category:st', 'When applying as ST'],
    ['disability:pwd', 'When declaring a disability'],
    ['disability:dyslexia', 'When declaring dyslexia'],
    ['accommodation:yes', 'When requesting accommodation'],
  ];
  return (
    <div className="editable-requirements">
      {rows.map((r, i) => (
        <div className="requirement-edit-container" key={r.id}>
          <div className="editable-requirement">
            <span className="row-number">{i + 1}</span>
            <label className="requirement-name">
              Requirement name
              <input
                aria-label={`Requirement ${i + 1} name`}
                value={r.title}
                minLength={2}
                maxLength={160}
                onChange={(e) =>
                  change(i, {
                    title: e.target.value,
                    ...(r.description.startsWith('Provide evidence for:')
                      ? {
                          description: `Provide evidence for: ${e.target.value}. Confirm the exact requirement against the instructions you received.`,
                        }
                      : {}),
                  })
                }
                required
              />
            </label>
            <label>
              Format
              <select
                aria-label={`Requirement ${i + 1} format`}
                value={r.mime}
                onChange={(e) =>
                  change(i, {
                    mime: e.target.value as Requirement['mime'],
                    extension:
                      e.target.value === 'application/pdf'
                        ? '.pdf'
                        : e.target.value === 'image/jpeg'
                          ? '.jpg'
                          : 'any',
                  })
                }
              >
                <option value="any">PDF or JPEG</option>
                <option value="application/pdf">PDF</option>
                <option value="image/jpeg">JPG</option>
              </select>
            </label>
            <label className="optional-check">
              <input
                type="checkbox"
                checked={!!r.optional}
                onChange={(e) => change(i, { optional: e.target.checked })}
              />
              Optional
            </label>
            <button
              className="icon-button"
              aria-label={`Remove requirement ${i + 1}`}
              onClick={() => onChange(rows.filter((_, n) => n !== i))}
              type="button"
            >
              <Trash2 size={17} />
            </button>
          </div>
          <details className="requirement-advanced">
            <summary>Conditions, size limit & instructions</summary>
            <div className="form-columns">
              <label>
                When does this apply?
                <select
                  aria-label={`Requirement ${i + 1} condition`}
                  value={
                    r.condition.op === 'eq' ? `${r.condition.field}:${r.condition.value}` : 'always'
                  }
                  onChange={(e) => {
                    const [field, value] = e.target.value.split(':');
                    change(i, {
                      condition:
                        field === 'always'
                          ? { op: 'always' }
                          : { op: 'eq', field: field as 'nameChanged', value },
                    });
                  }}
                >
                  {conditions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Maximum file size (KB)
                <input
                  aria-label={`Requirement ${i + 1} size limit`}
                  type="number"
                  min={1}
                  max={10240}
                  step="any"
                  placeholder="No checklist limit"
                  value={r.maxBytes ? r.maxBytes / 1024 : ''}
                  onChange={(e) =>
                    change(i, {
                      maxBytes: e.target.value
                        ? Math.round(Number(e.target.value) * 1024)
                        : undefined,
                    })
                  }
                />
              </label>
            </div>
            <label>
              Phrase expected in the selected pages <span className="optional-label">optional</span>
              <input
                aria-label={`Requirement ${i + 1} expected text`}
                maxLength={150}
                value={r.expectedText || ''}
                placeholder="e.g. Your full name or certificate title"
                onChange={(e) => change(i, { expectedText: e.target.value })}
              />
            </label>
            <label>
              Instructions for this item
              <textarea
                aria-label={`Requirement ${i + 1} instructions`}
                rows={3}
                maxLength={1800}
                value={r.description}
                onChange={(e) => change(i, { description: e.target.value })}
                required
              />
            </label>
            <p className="field-help">
              Only add conditions and limits that your actual instructions specify. Unknown profile
              answers stay unresolved.
            </p>
          </details>
        </div>
      ))}
    </div>
  );
}
