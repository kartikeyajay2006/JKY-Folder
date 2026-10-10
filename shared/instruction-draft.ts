import type { DocumentRecord, Predicate, Requirement } from './model';
import { limits } from './limits';

export interface InstructionCandidate {
  id: string;
  page: number;
  start: number;
  length: number;
  /** The exact characters of the source page, including line breaks. */
  quote: string;
  uncertain: boolean;
  warnings: string[];
  requirement: Requirement;
  /** How the proposal was found: an explicit obligation or an item in a document list. */
  kind?: 'obligation' | 'list';
  /** Plain-language notes for every limit read from the source. */
  constraints?: string[];
  /** A condition the wording suggests. Never applied without the applicant's confirmation. */
  suggestedCondition?: { condition: Predicate; label: string };
  /** Other pages that mention the same document. */
  alsoOn?: number[];
}
export interface InstructionDraft {
  id: string;
  documentId: string;
  sourceHash: string;
  revision: number;
  candidates: InstructionCandidate[];
  warnings: string[];
}

const OBLIGATION =
  /\b(upload|uploaded|submit|submitted|provide|attach|enclose|furnish|produce|required|must|shall|mandatory)\b/i;
const DOCUMENT =
  /\b(documents?|certificates?|photo(graph)?s?|signatures?|passport|forms?|proofs?|cards?|letters?|transcripts?|resum[eé]|cv|statements?|mark ?sheets?|marks? ?cards?|grade ?cards?|degrees?|diplomas?|aadhaa?r|pan|admit|birth|domicile|caste|income|ews|obc|affidavits?|undertakings?|declarations?|noc|testimonials?|recommendations?|references?|portfolios?|sop|lor|essays?|thumb|bank|passbook|cheques?|receipts?|id\b|identity|address|ration|gazette|migration|provisional|character|disability|medical|experience|offer|salary|payslips?|scorecards?|results?|evidence)\b/i;
const HEADING =
  /^(?:list of |checklist of |required |mandatory |supporting )?(documents?|certificates?|enclosures?|attachments?|uploads?|annexures?|checklist)\b.*(?:required|needed|uploaded|submitted|upload|submit|attach|following)?.*[:\-–]?\s*$/i;
const MARKER =
  /^\s*(?:\(?\d{1,2}[.)]|\(?[a-z][.)]|\(?(?:i{1,3}|iv|v|vi{0,3}|ix|x)[.)]|[•●▪◦‣\-–*])\s+/i;
const TERMINAL = /[.;:?!]\s*$/;

interface Segment {
  start: number;
  end: number;
  list: boolean;
  heading: boolean;
}

/** Joins wrapped lines into logical instructions while remembering the exact source span. */
function segments(text: string): Segment[] {
  const lines: { start: number; end: number; text: string }[] = [];
  for (const m of text.matchAll(/[^\n]+/g))
    if (m[0].trim()) lines.push({ start: m.index!, end: m.index! + m[0].length, text: m[0] });
  const out: Segment[] = [];
  for (const line of lines) {
    const trimmed = line.text.trim();
    const marker = MARKER.test(line.text);
    // A heading introduces a list: "Documents required", "Upload the following documents:".
    const heading =
      !marker &&
      trimmed.length <= 90 &&
      ((HEADING.test(trimmed) &&
        (trimmed.endsWith(':') || (!/[.]$/.test(trimmed) && trimmed.split(/\s+/).length <= 8))) ||
        (trimmed.endsWith(':') &&
          /\b(documents?|certificates?|enclosures?|attachments?|following)\b/i.test(trimmed)));
    const previous = out.at(-1);
    const continues =
      previous &&
      !previous.heading &&
      !marker &&
      !heading &&
      !TERMINAL.test(text.slice(previous.start, previous.end)) &&
      /^[a-z(,&]/.test(trimmed) &&
      line.start - previous.end <= 2;
    if (continues) previous.end = line.end;
    else out.push({ start: line.start, end: line.end, list: marker, heading });
  }
  return out;
}

const KB = 1024;
const unit = (n: number, u: string) => Math.round(n * (/m/i.test(u) ? KB * KB : KB));
/** Reads explicit size, pixel, page and format limits from one instruction. */
function constraints(quote: string) {
  const found: Partial<Requirement> = {},
    notes: string[] = [],
    warnings: string[] = [];
  const range = quote.match(
    /\b(\d+(?:\.\d+)?)\s*(kb|mb)?\s*(?:-|–|to|and)\s*(\d+(?:\.\d+)?)\s*(kb|mb)\b/i,
  );
  if (range) {
    found.minBytes = unit(Number(range[1]), range[2] || range[4]);
    found.maxBytes = unit(Number(range[3]), range[4]);
  } else {
    const max = quote.match(
      /\b(?:not\s+(?:exceed(?:ing)?|more\s+than|greater\s+than|above)|max(?:imum)?(?:\s+(?:file\s+)?size)?(?:\s+(?:of|is))?|up\s*to|upto|less\s+than|within|below|under|≤|<=)\s*:?\s*(\d+(?:\.\d+)?)\s*(kb|mb)\b/i,
    );
    if (max) found.maxBytes = unit(Number(max[1]), max[2]);
    const min = quote.match(
      /\b(?:min(?:imum)?(?:\s+(?:file\s+)?size)?(?:\s+(?:of|is))?|at\s+least|not\s+less\s+than|more\s+than|above)\s*:?\s*(\d+(?:\.\d+)?)\s*(kb|mb)\b/i,
    );
    if (min && !/not\s+more\s+than/i.test(min[0])) found.minBytes = unit(Number(min[1]), min[2]);
  }
  if (found.maxBytes && found.maxBytes > limits.fileBytes) {
    warnings.push(
      `The source allows larger files than this workspace accepts (${limits.fileBytes / KB / KB} MB). The workspace limit applies.`,
    );
    delete found.maxBytes;
  }
  if (
    found.minBytes !== undefined &&
    found.maxBytes !== undefined &&
    found.minBytes > found.maxBytes
  )
    delete found.minBytes;
  const readable = (bytes: number) =>
    bytes >= KB * KB && bytes % (KB * KB) === 0
      ? `${bytes / KB / KB} MB`
      : `${Math.round(bytes / KB)} KB`;
  if (found.minBytes !== undefined) notes.push(`At least ${readable(found.minBytes)}`);
  if (found.maxBytes !== undefined) notes.push(`At most ${readable(found.maxBytes)}`);
  const pixels = quote.match(/\b(\d{2,4})\s*(?:x|×|\*|by)\s*(\d{2,4})\s*(?:pixels?|px)\b/i);
  if (pixels) {
    found.maxWidth = Number(pixels[1]);
    found.maxHeight = Number(pixels[2]);
    notes.push(`Up to ${pixels[1]} × ${pixels[2]} pixels`);
    warnings.push(
      'Pixel dimensions were read as maximums. Check whether the source asks for an exact or preferred size.',
    );
  }
  const pages = quote.match(
    /\b(?:not\s+more\s+than|max(?:imum)?(?:\s+of)?|up\s*to|upto|within)\s*(\d{1,2})\s*pages?\b/i,
  );
  if (pages && Number(pages[1]) >= 1 && Number(pages[1]) <= 20) {
    found.maxPages = Number(pages[1]);
    notes.push(`At most ${pages[1]} page${pages[1] === '1' ? '' : 's'}`);
  } else if (/\b(single|one)[\s-]page\b/i.test(quote)) {
    found.maxPages = 1;
    notes.push('A single page');
  }
  const pdf = /\bPDF\b/i.test(quote),
    jpg = /\b(JPE?G|JPG)\b/i.test(quote);
  if (/\bPNG\b/i.test(quote))
    warnings.push(
      'The source mentions PNG, which this workspace does not accept. Convert it to JPEG or PDF.',
    );
  const mime: Requirement['mime'] =
    pdf && !jpg ? 'application/pdf' : jpg && !pdf ? 'image/jpeg' : 'any';
  if (mime !== 'any') notes.push(mime === 'application/pdf' ? 'PDF only' : 'JPEG only');
  return { found, notes, warnings, mime };
}

const IDENTITY =
  /\b(photo(graph)?|signature|thumb|aadhaa?r|passport|pan\b|identity|id card|voter|driving|birth|age|date of birth|nationality|oci|pio|address|domicile|ration)\b/i;
const EDUCATION =
  /\b(mark ?sheets?|marks? ?cards?|grade ?cards?|transcripts?|degree|diploma|class\s*(x|xii|10|12)|board|school|college|university|qualifying|provisional|migration|result|admit card|scorecard|semester)\b/i;
const group = (text: string): Requirement['group'] =>
  IDENTITY.test(text) ? 'Identity' : EDUCATION.test(text) ? 'Education' : 'Supporting evidence';

/** Suggests a profile condition from explicit wording. The applicant decides whether it applies. */
function suggest(text: string): InstructionCandidate['suggestedCondition'] {
  const categories = [
    ['sc', /\bSC\b|scheduled caste/i],
    ['st', /\bST\b|scheduled tribe/i],
    ['obc', /\bOBC(?:-NCL)?\b|other backward/i],
    ['ews', /\bEWS\b|economically weaker/i],
  ] as const;
  const named = categories.filter(([, re]) => re.test(text)).map(([v]) => v);
  if (named.length)
    return {
      condition:
        named.length === 1
          ? { op: 'eq', field: 'category', value: named[0] }
          : { op: 'in', field: 'category', values: [...named] },
      label: `When applying as ${named.map((n) => n.toUpperCase()).join(' or ')}`,
    };
  const rules: [RegExp, Predicate, string][] = [
    [/dyslexi/i, { op: 'eq', field: 'disability', value: 'dyslexia' }, 'When declaring dyslexia'],
    [
      /\b(pwd|pwbd|person(s)? with (benchmark )?disabilit|disabled|disability)\b/i,
      { op: 'eq', field: 'disability', value: 'pwd' },
      'When declaring a disability',
    ],
    [
      /\b(scribe|compensatory time)\b/i,
      { op: 'eq', field: 'accommodation', value: 'yes' },
      'When requesting a scribe or compensatory time',
    ],
    [
      /\b(change (of|in) name|names? (?:has |have |is |are )?(?:been )?changed|different name|names? differ)/i,
      { op: 'eq', field: 'nameChanged', value: 'yes' },
      'When names differ',
    ],
    [
      /\b(appearing|awaiting (the )?result|result (is )?awaited)\b/i,
      { op: 'eq', field: 'education', value: 'appearing' },
      'When qualifying results are pending',
    ],
  ];
  for (const [re, condition, label] of rules) if (re.test(text)) return { condition, label };
  return undefined;
}

/** "Upload a scanned copy of your Class XII marksheet in PDF" → "Class XII marksheet". */
function titleOf(text: string) {
  let t = text.replace(MARKER, '').replace(/\s+/g, ' ').trim();
  // Take the object of the obligation: "If applying, submit category certificate" → "category certificate".
  const verb = t.match(
    /\b(?:upload|submit|provide|attach|enclose|furnish|produce|send|include)\b\s+(?:the\s+following[:\s]*)?(.+)/i,
  );
  if (verb && verb[1].trim().length >= 3) t = verb[1];
  t = t.replace(
    /^(?:(?:a|an|the|your|their|one|two|duly|all)\s+)*(?:(?:scanned|self[- ]attested|attested|clear|legible|recent|colou?r(?:ed)?|signed|valid|original|soft|hard|photo|copy of|copies of|soft copy of|photocopy of)\s+)*(?:copy|copies)?\s*(?:of\s+)?(?:(?:the|your|their)\s+)?/i,
    '',
  );
  t = t
    .split(
      /\s+(?:in|as)\s+(?:a\s+|an\s+)?(?:pdf|jpe?g|jpg|png)\b|\s+(?:not\s+exceeding|of\s+size|with\s+size|size\s+(?:of|not|should|must)|having|which|that|of\s+(?:the\s+)?(?:candidate|applicant|student)s?\b|again\b|for\s+verification|is\s+(?:required|mandatory)|are\s+(?:required|mandatory)|must\b|should\b|shall\b|if\b|\()|[,;:.](?:\s|$)/i,
    )[0]
    .replace(/\s+(?:pdf|jpe?g|jpg)$/i, '')
    .trim();
  if (t.length < 3) t = text.replace(MARKER, '').replace(/\s+/g, ' ').trim();
  t = t.slice(0, 160);
  return t.charAt(0).toUpperCase() + t.slice(1);
}
const normalized = (t: string) =>
  t
    .toLowerCase()
    .replace(/\b(scanned|self[- ]attested|attested|copy|copies|of|the|a|an|your)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Conservative proposals, never automatic completeness or eligibility decisions.
export function draftInstructions(
  doc: DocumentRecord,
): Pick<InstructionDraft, 'candidates' | 'warnings'> {
  const candidates: InstructionCandidate[] = [],
    warnings: string[] = [],
    seen = new Map<string, InstructionCandidate>();
  pages: for (const page of doc.pages) {
    if (page.warning) warnings.push(`Page ${page.number}: ${page.warning}`);
    if (page.method === 'unreadable' || !page.text.trim()) {
      warnings.push(`Page ${page.number} could not be read. Inspect the original.`);
      continue;
    }
    let listContext = false;
    for (const seg of segments(page.text)) {
      const quote = page.text.slice(seg.start, seg.end).trim(),
        start = seg.start + page.text.slice(seg.start, seg.end).indexOf(quote),
        flat = quote.replace(/\s+/g, ' ');
      if (seg.heading) {
        // A heading such as "Documents to be uploaded:" turns the following list into proposals.
        listContext = true;
        continue;
      }
      const obligation = OBLIGATION.test(flat) && DOCUMENT.test(flat);
      const listed = listContext && seg.list && flat.split(' ').length <= 30 && DOCUMENT.test(flat);
      if (!seg.list && !obligation) listContext = listContext && flat.length < 40;
      if (!obligation && !listed) continue;
      if (flat.length < 8 || flat.length > 1800) {
        warnings.push(`Page ${page.number}: a long instruction needs manual splitting.`);
        continue;
      }
      const title = titleOf(flat),
        key = normalized(title);
      const earlier = seen.get(key);
      if (earlier) {
        // Mentioned again: keep the first proposal and record where else it appears.
        if (earlier.page !== page.number && !earlier.alsoOn?.includes(page.number))
          earlier.alsoOn = [...(earlier.alsoOn || []), page.number];
        continue;
      }
      if (candidates.length === 50) {
        warnings.push('Draft reached 50 candidates. Review remaining pages manually.');
        break pages;
      }
      const id = `pdf-${page.number}-${start}`,
        conditional =
          /\b(if|unless|except|only|where|when|either|or|both|and\/or|applicable)\b/i.test(flat);
      const uncertain = page.method === 'ocr' && (page.confidence || 0) < 85;
      const limitsRead = constraints(flat),
        suggestion = suggest(flat);
      const notes = [
        ...(conditional
          ? [
              'Conditional or combined instruction: confirm when it applies and which evidence combination is accepted.',
            ]
          : []),
        ...(uncertain
          ? ['OCR confidence is uncertain. Compare every character with the original.']
          : []),
        ...limitsRead.warnings,
      ];
      const candidate: InstructionCandidate = {
        id,
        page: page.number,
        start,
        length: quote.length,
        quote,
        uncertain,
        warnings: notes,
        kind: obligation ? 'obligation' : 'list',
        constraints: limitsRead.notes,
        ...(suggestion ? { suggestedCondition: suggestion } : {}),
        requirement: {
          id,
          title,
          description: flat,
          group: group(flat),
          condition: { op: 'always' },
          mime: limitsRead.mime,
          extension:
            limitsRead.mime === 'application/pdf'
              ? '.pdf'
              : limitsRead.mime === 'image/jpeg'
                ? '.jpg'
                : 'any',
          ...limitsRead.found,
          optional: true,
          sourceSection: `${doc.name}, page ${page.number}`,
          sourceAnchor: `pdf:${doc.id}:${doc.hash}:${page.number}:${start}:${quote.length}`,
          reviewHint:
            'Draft proposal: confirm wording, applicability, alternatives and constraints against the original.',
        },
      };
      seen.set(key, candidate);
      candidates.push(candidate);
    }
  }
  warnings.push(
    'This conservative draft may omit instructions or combine distinct obligations. Read every source page; add or split missing items before confirmation. Proposals start optional until you confirm applicability.',
  );
  return { candidates, warnings };
}
