import { useId, type CSSProperties } from 'react';
import { CalendarPlus } from 'lucide-react';
import { deadlineInfo } from '../../shared/templates';
import type { CheckResult, CheckState } from '../../shared/model';
import { stateLabels } from './Status';

const order: CheckState[] = [
  'pass',
  'needs_review',
  'pending',
  'unknown',
  'fail',
  'error',
  'not_applicable',
];

/**
 * One cell per checklist item, coloured by its state. Deliberately not a single percentage:
 * every requirement stays individually visible and clickable.
 */
export function ChecklistStrip({
  checks,
  onOpen,
}: {
  checks: CheckResult[];
  onOpen: (requirementId: string) => void;
}) {
  const sorted = [...checks].sort((a, b) => order.indexOf(a.state) - order.indexOf(b.state));
  return (
    <ol className="checklist-strip" aria-label="Every checklist item and its state">
      {sorted.map((check, index) => (
        <li key={check.requirementId} style={{ '--i': index } as CSSProperties}>
          <button
            className={`strip-cell cell-${check.state}`}
            aria-label={`${check.title}: ${check.state === 'fail' && !check.evidence ? 'Missing' : stateLabels[check.state]}`}
            onClick={() => onOpen(check.requirementId)}
          >
            <span className="strip-tip" aria-hidden="true">
              {check.title}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

const longDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );

/** A rubber-stamp style deadline. Red ink once the date is within a week. */
export function DeadlineStamp({ deadline, onSet }: { deadline?: string; onSet: () => void }) {
  if (!deadline)
    return (
      <button className="deadline-stamp stamp-empty" onClick={onSet}>
        <CalendarPlus size={18} aria-hidden="true" />
        Add a deadline
      </button>
    );
  const info = deadlineInfo(deadline);
  return (
    <div
      className={`deadline-stamp ${info.urgent ? 'stamp-urgent' : ''}`}
      role="img"
      aria-label={`Deadline ${longDate(deadline)}, ${info.label}`}
    >
      <span className="stamp-label">Due</span>
      <strong className="data">{longDate(deadline)}</strong>
      <span className="stamp-days">{info.label}</span>
    </div>
  );
}

/** A small sheet of paper with a folded corner and a format label. */
export function FileGlyph({
  mime,
  name = '',
  size = 40,
}: {
  mime: string;
  name?: string;
  size?: number;
}) {
  const label =
    mime === 'image/jpeg' || /\.jpe?g$/i.test(name)
      ? 'JPG'
      : mime === 'application/pdf' || /\.pdf$/i.test(name)
        ? 'PDF'
        : 'FILE';
  return (
    <span
      className={`file-glyph glyph-${label.toLowerCase()}`}
      style={{ width: size, height: size * 1.2 } as CSSProperties}
      aria-hidden="true"
    >
      <span className="glyph-lines" />
      <span className="glyph-label">{label}</span>
    </span>
  );
}

/** An embossed metal seal with engraved circular lettering. Decorative. */
export function Seal({ text = 'JKY-FOLDER  ✦  REVIEWED  ✦  ' }: { text?: string }) {
  const id = useId();
  return (
    <span className="seal" aria-hidden="true">
      <svg className="seal-text" viewBox="0 0 100 100">
        <defs>
          <path id={id} d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0" />
        </defs>
        <text>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
