import type {
  DocumentFact,
  DocumentPage,
  FactKind,
  Packet,
  DocumentRecord,
  RulePack,
  EvidenceSuggestion,
} from './model';
import { confirmedConcerns } from './identity';
// Dates as printed on Indian documents: 12/03/2006, 12-03-2006, 2006-03-12, 12 March 2006,
// 12th Mar, 2006 and March 12, 2006.
const DATE =
  '(\\d{1,2}\\s*[/.-]\\s*\\d{1,2}\\s*[/.-]\\s*\\d{4}|\\d{4}-\\d{1,2}-\\d{1,2}|\\d{1,2}(?:st|nd|rd|th)?[\\s/-]+[A-Za-z]{3,9},?[\\s/-]+\\d{4}|[A-Za-z]{3,9}\\s+\\d{1,2},?\\s+\\d{4})';
const dated = (label: string) =>
  new RegExp(`\\b(?:${label})\\s*(?:\\([^)]{0,20}\\))?\\s*[:\\-]?\\s*${DATE}`, 'gi');
const DATE_PATTERNS: [FactKind, RegExp][] = [
  ['birth_date', dated('date\\s+of\\s+birth|birth\\s+date|d\\.?\\s?o\\.?\\s?b\\.?')],
  ['issue_date', dated('date\\s+of\\s+issue|issue\\s+date|issued\\s+on|date\\s+of\\s+issuance')],
  [
    'expiry_date',
    dated(
      'expiry\\s+date|date\\s+of\\s+expiry|expires\\s+on|expires|valid\\s+until|valid\\s+upto|valid\\s+up\\s+to',
    ),
  ],
];
// A name label, optionally naming the person it belongs to. "Name of School" never matches.
const NAME_LABEL =
  /(?:^|[\s|])((?:full|candidate'?s?|student'?s?|applicant'?s?|pupil'?s?)\s+)?name(?:\s+of\s+(?:the\s+)?(?:candidate|student|applicant|pupil|holder))?\s*[:\-]\s*(.+)$/i;
// Names of other people and organisations appear on the same certificates.
const NOT_APPLICANT =
  /(father|mother|guardian|parent|husband|wife|spouse|school|college|institut|university|board|exam|centre|center|bank|branch|nominee|course|programme|program|subject|officer|authority|issuing|signatory|principal|district|state)/i;
// Words that start the next field when OCR joins table cells into one line.
const NEXT_FIELD =
  /\s{2,}|\s\b(?:roll|dob|d\.o\.b|date|father|mother|gender|sex|class|seat|reg(?:istration)?|enrol(?:l?ment)?|s\/o|d\/o|w\/o|c\/o|age|category|uid|aadhaar)\b/i;
function cleanName(raw: string) {
  const value = raw
    .split(NEXT_FIELD)[0]
    .trim()
    .replace(/[.,;:]+$/, '');
  const words = value.split(/\s+/);
  return /^[A-Za-z][A-Za-z .'-]*$/.test(value) && words.length <= 6 && value.length >= 2
    ? value
    : '';
}
export function extractFacts(pages: DocumentPage[]): DocumentFact[] {
  return pages.flatMap((page) => {
    const found: Omit<DocumentFact, 'id' | 'confidence' | 'box' | 'history'>[] = [];
    const lines = page.text.split('\n');
    lines.forEach((line) => {
      const match = line.match(NAME_LABEL);
      if (!match) return;
      const before = line.slice(0, match.index! + match[0].length - match[2].length);
      if (NOT_APPLICANT.test(before)) return;
      const value = cleanName(match[2]);
      if (value) found.push({ kind: 'name', page: page.number, originalText: line.trim(), value });
    });
    for (const [kind, pattern] of DATE_PATTERNS)
      for (const match of page.text.matchAll(pattern))
        found.push({
          kind,
          page: page.number,
          originalText: match[0].trim(),
          value: match[1].trim(),
        });
    // Identity cards print the name unlabelled on the line above the date of birth.
    if (!found.some((f) => f.kind === 'name')) {
      const dob = lines.findIndex((line) => /\b(dob|date of birth|year of birth)\b/i.test(line));
      const above =
        dob > 0
          ? lines
              .slice(0, dob)
              .reverse()
              .find((l) => l.trim())
          : undefined;
      const value = above && cleanName(above.trim());
      if (
        value &&
        value.split(/\s+/).length >= 2 &&
        !/(government|india|authority|male|female|address|card)/i.test(value)
      )
        found.push({ kind: 'name', page: page.number, originalText: above!.trim(), value });
    }
    const counts: Partial<Record<FactKind, number>> = {};
    return found.slice(0, 40).map((fact) => {
      const i = (counts[fact.kind] = (counts[fact.kind] ?? -1) + 1);
      const token = page.tokens?.find((t) => t.text.includes(fact.value.split(/\s+/)[0]));
      return {
        ...fact,
        id: `${page.number}-${fact.kind}-${i}`,
        confidence: page.confidence || 0,
        box: token?.box,
        history: [],
      };
    });
  });
}
/** Differences between confirmed names or dates of birth; see shared/identity.ts. */
export const consistencyConcerns = confirmedConcerns;
export function suggestEvidence(
  packet: Packet,
  documents: DocumentRecord[],
  pack: RulePack,
): EvidenceSuggestion[] {
  return pack.requirements
    .filter((r) => !packet.links[r.id])
    .flatMap((r) => {
      const words = r.title
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter(
          (w) =>
            w.length > 3 &&
            !['document', 'evidence', 'certificate', 'required', 'recent'].includes(w),
        );
      if (!words.length) return [];
      return documents
        .filter((d) => d.status === 'ready' && (r.mime === 'any' || d.mime === r.mime))
        .flatMap((doc) =>
          doc.pages.flatMap((page) => {
            const haystack = ((page.number === 1 ? doc.name : '') + ' ' + page.text).toLowerCase();
            const hits = words.filter((w) => haystack.includes(w));
            if (!hits.length || (page.method === 'ocr' && (page.confidence || 0) < 85)) return [];
            return [
              {
                requirementId: r.id,
                documentId: doc.id,
                pageFrom: page.number,
                pageTo: page.number,
                confidence: Math.min(0.85, 0.4 + hits.length * 0.15),
                reason: `Matching terms: ${hits.join(', ')}. This is a suggestion; inspect and confirm the evidence.`,
              },
            ];
          }),
        )
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
    });
}
