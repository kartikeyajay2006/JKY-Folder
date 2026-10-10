/** Vector redraw of the brand concept: a folder holding three evidence rails, the last becoming a tick. */
export function BrandMark({
  className = 'brand-mark',
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        className="mark-folder"
        d="M55 28.5V24a6 6 0 0 0-6-6H32.4a2 2 0 0 1-1.5-.7l-4.2-5a3.4 3.4 0 0 0-2.6-1.3H15a6 6 0 0 0-6 6v31a6 6 0 0 0 6 6h34a6 6 0 0 0 6-6v-9.5"
        stroke="currentColor"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="mark-rails"
        d="M17 46V29a3 3 0 0 1 3-3h22M22.5 46V34a3 3 0 0 1 3-3h19M28 46v-7a3 3 0 0 1 3-3h4.5"
        stroke="currentColor"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="mark-tick"
        d="m36 36 6.5 6.5L58 27"
        stroke="var(--tick)"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <BrandMark />
      <span className="wordmark-text">JKY-Folder</span>
    </span>
  );
}
