import type {
  ConsistencyConcern,
  DocumentFact,
  DocumentRecord,
  IdentityComparison,
  IdentityRow,
  IdentityVerdict,
} from './model';

// Titles printed before names on Indian certificates; they are not part of the name itself.
const TITLES = new Set([
  'mr',
  'mrs',
  'ms',
  'miss',
  'master',
  'kumari',
  'kum',
  'km',
  'shri',
  'sri',
  'shree',
  'smt',
  'dr',
]);

/** Lower-case name tokens without titles, punctuation or extra spaces. */
export function nameTokens(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[.,'’`"_\-–—()]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !TITLES.has(token));
}

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

const severity: IdentityVerdict[] = [
  'same',
  'format',
  'order',
  'initials',
  'middle_name',
  'spelling',
  'different',
];

/** Classifies how name `b` differs from reference name `a`. */
export function compareNames(a: string, b: string): IdentityVerdict {
  const left = nameTokens(a),
    right = nameTokens(b);
  if (!left.length || !right.length) return 'unreadable';
  const plain = (v: string) => v.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
  if (left.join(' ') === right.join(' ')) return plain(a) === plain(b) ? 'same' : 'format';
  if (left.join('') === right.join('')) return 'format';
  // Pair every token with its closest counterpart, best matches first.
  const pairs: { i: number; j: number; kind: IdentityVerdict; cost: number }[] = [];
  left.forEach((x, i) =>
    right.forEach((y, j) => {
      if (x === y) pairs.push({ i, j, kind: 'same', cost: 0 });
      else if ((x.length === 1 && y.startsWith(x)) || (y.length === 1 && x.startsWith(y)))
        pairs.push({ i, j, kind: 'initials', cost: 1 });
      else {
        const d = distance(x, y);
        if (Math.min(x.length, y.length) >= 4 && d <= (Math.max(x.length, y.length) >= 7 ? 2 : 1))
          pairs.push({ i, j, kind: 'spelling', cost: 1 + d });
      }
    }),
  );
  pairs.sort((p, q) => p.cost - q.cost || Math.abs(p.i - p.j) - Math.abs(q.i - q.j));
  const usedLeft = new Set<number>(),
    usedRight = new Set<number>(),
    matched: typeof pairs = [];
  for (const pair of pairs)
    if (!usedLeft.has(pair.i) && !usedRight.has(pair.j)) {
      usedLeft.add(pair.i);
      usedRight.add(pair.j);
      matched.push(pair);
    }
  const shorter = Math.min(left.length, right.length);
  if (matched.length < shorter || !matched.length) return 'different';
  // Most tokens must match outright or by initial; a single misspelling cannot carry a name.
  if (matched.filter((p) => p.kind === 'spelling').length > Math.max(1, shorter / 2))
    return 'different';
  const worst = matched.reduce<IdentityVerdict>(
    (w, p) => (severity.indexOf(p.kind) > severity.indexOf(w) ? p.kind : w),
    'same',
  );
  if (left.length !== right.length) return worst === 'spelling' ? 'spelling' : 'middle_name';
  if (worst !== 'same') return worst;
  return matched.some((p) => p.i !== p.j) ? 'order' : 'format';
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
function valid(y: number, m: number, d: number) {
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    y >= 1900 &&
    y <= 2100 &&
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/**
 * Reads a date as printed on Indian documents. Numeric dates are day first (12/03/2006 is
 * 12 March 2006); ISO dates and written month names are also understood.
 */
export function parseDate(value: string): { iso: string; day: number; month: number } | null {
  const v = value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/(\d)(st|nd|rd|th)\b/g, '$1')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  let m = v.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (m && valid(+m[1], +m[2], +m[3]))
    return { iso: iso(+m[1], +m[2], +m[3]), day: +m[3], month: +m[2] };
  m = v.match(/^(\d{1,2})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{4})$/);
  if (m && valid(+m[3], +m[2], +m[1]))
    return { iso: iso(+m[3], +m[2], +m[1]), day: +m[1], month: +m[2] };
  const month = (word: string) => MONTHS.indexOf(word.slice(0, 3)) + 1;
  m = v.match(/^(\d{1,2})[\s\-/.]+([a-z]{3,9})[\s\-/.]+(\d{4})$/);
  if (m && month(m[2]) && valid(+m[3], month(m[2]), +m[1]))
    return { iso: iso(+m[3], month(m[2]), +m[1]), day: +m[1], month: month(m[2]) };
  m = v.match(/^([a-z]{3,9})\s+(\d{1,2})\s+(\d{4})$/);
  if (m && month(m[1]) && valid(+m[3], month(m[1]), +m[2]))
    return { iso: iso(+m[3], month(m[1]), +m[2]), day: +m[2], month: month(m[1]) };
  return null;
}

/** Classifies how date `b` differs from reference date `a`. */
export function compareDates(a: string, b: string): IdentityVerdict {
  const left = parseDate(a),
    right = parseDate(b);
  if (!left || !right) return 'unreadable';
  if (left.iso === right.iso)
    return a.replace(/\s+/g, '') === b.replace(/\s+/g, '') ? 'same' : 'format';
  if (
    left.iso.slice(0, 4) === right.iso.slice(0, 4) &&
    left.day === right.month &&
    left.month === right.day
  )
    return 'day_month';
  return 'different';
}

const isMatch = (verdict: IdentityVerdict) =>
  verdict === 'reference' || verdict === 'same' || verdict === 'format';

export function verdictDetail(kind: 'name' | 'birth_date', verdict: IdentityVerdict, ref = '') {
  const label = kind === 'name' ? 'name' : 'date of birth';
  switch (verdict) {
    case 'reference':
      return `The ${label} the others are compared with.`;
    case 'same':
      return 'Matches.';
    case 'format':
      return kind === 'name'
        ? 'Same name; only capitals, spacing or punctuation differ.'
        : 'Same date, written differently.';
    case 'order':
      return 'Same words in a different order.';
    case 'initials':
      return 'Uses an initial where another document has the full word.';
    case 'middle_name':
      return 'A word is missing or added, often a middle name or surname.';
    case 'spelling':
      return `Spelled differently from “${ref}”.`;
    case 'different':
      return kind === 'name' ? `A different name from “${ref}”.` : `A different date from ${ref}.`;
    case 'day_month':
      return 'Day and month appear swapped. Check how each document writes dates.';
    case 'unreadable':
      return kind === 'name'
        ? 'Could not be read as a name. Correct it in the document.'
        : 'Could not be read as a date. Correct it in the document.';
  }
}

/** For each document, its confirmed values if any exist, otherwise what was extracted. */
function candidates(documents: DocumentRecord[], kind: 'name' | 'birth_date') {
  return documents
    .filter((d) => d.status === 'ready')
    .flatMap((doc) => {
      const facts = (doc.facts || []).filter((f) => f.kind === kind && f.value.trim());
      const confirmed = facts.filter((f) => f.history.at(-1)?.confirmed);
      const chosen = confirmed.length ? confirmed : facts;
      const seen = new Set<string>();
      return chosen
        .filter((f) => {
          const key =
            kind === 'name'
              ? nameTokens(f.value).join(' ')
              : parseDate(f.value)?.iso || f.value.trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((fact: DocumentFact) => ({ doc, fact, confirmed: !!fact.history.at(-1)?.confirmed }));
    });
}

/**
 * Compares the name and date of birth on every document with one reference value: the chosen
 * reference document, else the value most documents share (confirmed values first).
 */
export function compareIdentity(
  documents: DocumentRecord[],
  referenceDocumentId?: string,
): IdentityComparison[] {
  return (['name', 'birth_date'] as const).map((kind) => {
    const all = candidates(documents, kind);
    if (!all.length) return { kind, rows: [], differences: 0 };
    const compare = kind === 'name' ? compareNames : compareDates;
    const chosen = all.find((c) => c.doc.id === referenceDocumentId);
    let reference = chosen;
    if (!reference) {
      const pool = all.some((c) => c.confirmed) ? all.filter((c) => c.confirmed) : all;
      reference = pool
        .map((c) => ({
          c,
          support: new Set(
            all.filter((o) => isMatch(compare(c.fact.value, o.fact.value))).map((o) => o.doc.id),
          ).size,
        }))
        .sort((x, y) => y.support - x.support)[0].c;
    }
    const rows: IdentityRow[] = all.map(({ doc, fact, confirmed }) => {
      const verdict: IdentityVerdict =
        fact === reference!.fact ? 'reference' : compare(reference!.fact.value, fact.value);
      return {
        documentId: doc.id,
        documentName: doc.name,
        factId: fact.id,
        page: fact.page,
        value: fact.value,
        confirmed,
        verdict,
        detail: verdictDetail(kind, verdict, reference!.fact.value),
      };
    });
    return {
      kind,
      reference: {
        documentId: reference.doc.id,
        documentName: reference.doc.name,
        value: reference.fact.value,
        chosen: !!chosen,
      },
      rows,
      differences: rows.filter((r) => !isMatch(r.verdict)).length,
    };
  });
}

const concernReason: Partial<Record<IdentityVerdict, string>> = {
  order: 'The same name is written in a different order on some documents.',
  initials: 'Some documents use an initial where others have the full name.',
  middle_name: 'A middle name or surname appears on some documents but not others.',
  spelling: 'The name is spelled differently on some documents.',
  different: 'Confirmed values differ between documents.',
  day_month: 'The day and month appear swapped on some documents.',
  unreadable: 'A confirmed value could not be read for comparison.',
};

/**
 * Differences between confirmed values only. Capitals, spacing, punctuation, titles and date
 * formats are not differences. Nothing here is a judgement about fraud or legal equivalence.
 */
export function confirmedConcerns(documents: DocumentRecord[]): ConsistencyConcern[] {
  return compareIdentity(documents).flatMap((comparison) => {
    const confirmed = comparison.rows.filter((r) => r.confirmed);
    if (confirmed.length < 2) return [];
    const compare = comparison.kind === 'name' ? compareNames : compareDates;
    // Compare every confirmed value with every other, and report the most serious difference.
    let worst: IdentityVerdict = 'same';
    for (const a of confirmed)
      for (const b of confirmed) {
        const verdict = compare(a.value, b.value);
        const rank = (v: IdentityVerdict) =>
          v === 'unreadable' || v === 'day_month' ? 5.5 : severity.indexOf(v);
        if (rank(verdict) > rank(worst)) worst = verdict;
      }
    if (isMatch(worst)) return [];
    const label = comparison.kind === 'name' ? 'Names' : 'Dates of birth';
    return [
      {
        kind: comparison.kind,
        difference: worst,
        facts: confirmed.map((r) => ({
          documentId: r.documentId,
          name: r.documentName,
          factId: r.factId,
          value: r.value,
          page: r.page,
        })),
        reason: `${label}: ${concernReason[worst]} Make sure they match, or keep proof that explains the difference, such as a gazette notification or affidavit for a name change.`,
      },
    ];
  });
}
