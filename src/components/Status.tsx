import type { CheckState } from '../../shared/model';

export const stateLabels: Record<CheckState, string> = {
  pass: 'Reviewed',
  fail: 'Fix needed',
  unknown: 'Answer needed',
  needs_review: 'Needs your review',
  not_applicable: 'Not required',
  pending: 'Processing',
  error: 'Could not inspect',
};
export const stateMeaning: Record<CheckState, string> = {
  pass: 'Linked evidence passed the supported file checks and you recorded your own content review.',
  fail: 'Evidence is missing, or the linked file breaks a format, size or page rule.',
  unknown: 'An answer that decides whether this item applies has not been confirmed.',
  needs_review: 'Evidence is linked, but you still need to inspect it, or you flagged a concern.',
  not_applicable: 'Your confirmed answers exclude it, or it is optional and not supplied.',
  pending: 'The linked file is still being inspected.',
  error: 'The linked file could not be safely inspected.',
};

/**
 * A hand-drawn style mark for the margin of a checklist: a pen tick for reviewed items,
 * a red ring for missing ones, a question for unanswered conditions.
 */
export function StateMark({ state, size = 28 }: { state: CheckState; size?: number }) {
  return (
    <svg
      className={`state-mark mark-${state}`}
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      {state === 'pass' && (
        <>
          <rect className="mark-box" x="3" y="3" width="22" height="22" rx="5" />
          <path className="mark-stroke" pathLength="1" d="m8.5 14.5 3.8 3.8 8-9.3" />
        </>
      )}
      {(state === 'fail' || state === 'error') && (
        <>
          <path
            className="mark-stroke mark-ring"
            pathLength="1"
            d="M14.6 3.6c6 .3 10.2 4.6 9.8 10.4-.4 5.9-5.3 10-11.1 9.6C7.5 23.2 3.4 18.6 3.8 13 4.2 7.6 8.4 3.9 13.3 3.7c3-.1 5.6 1 7.4 2.6"
          />
          <path className="mark-stroke" pathLength="1" d="M14 9v6.2" />
          <circle className="mark-dot" cx="14" cy="19.2" r="1.5" />
        </>
      )}
      {state === 'needs_review' && (
        <>
          <path className="mark-box" d="M14 3.5 25 23H3Z" strokeLinejoin="round" />
          <path className="mark-stroke" pathLength="1" d="M14 10.5v6" />
          <circle className="mark-dot" cx="14" cy="19.6" r="1.4" />
        </>
      )}
      {state === 'unknown' && (
        <>
          <circle className="mark-box" cx="14" cy="14" r="10.5" />
          <path
            className="mark-stroke"
            pathLength="1"
            d="M10.8 11.2c.3-2 1.8-3.1 3.5-3.1 2 0 3.5 1.3 3.5 3 0 2.6-3.4 2.7-3.4 5.2"
          />
          <circle className="mark-dot" cx="14.4" cy="19.8" r="1.4" />
        </>
      )}
      {state === 'not_applicable' && (
        <>
          <rect className="mark-box" x="3" y="3" width="22" height="22" rx="5" />
          <path className="mark-stroke" pathLength="1" d="M9 14h10" />
        </>
      )}
      {state === 'pending' && <circle className="mark-box mark-pending" cx="14" cy="14" r="10" />}
    </svg>
  );
}

export function Status({ state, missing = false }: { state: CheckState; missing?: boolean }) {
  return (
    <span className={`status status-${state}`}>
      <StateMark state={state} size={16} />
      {state === 'fail' && missing ? 'Missing' : stateLabels[state]}
    </span>
  );
}

export const date = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
export const size = (value: number) =>
  value >= 1024 * 1024
    ? `${(value / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(value / 1024))} KB`;
export const plural = (count: number, word: string, many = `${word}s`) =>
  `${count} ${count === 1 ? word : many}`;
