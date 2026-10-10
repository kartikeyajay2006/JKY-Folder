import type { DocumentRecord, Requirement } from './model';
export interface InstructionCandidate {
  id: string;
  page: number;
  start: number;
  length: number;
  quote: string;
  uncertain: boolean;
  warnings: string[];
  requirement: Requirement;
}
export interface InstructionDraft {
  id: string;
  documentId: string;
  sourceHash: string;
  revision: number;
  candidates: InstructionCandidate[];
  warnings: string[];
}
// Conservative proposals, never automatic completeness or eligibility decisions.
export function draftInstructions(
  doc: DocumentRecord,
): Pick<InstructionDraft, 'candidates' | 'warnings'> {
  const candidates: InstructionCandidate[] = [],
    warnings: string[] = [];
  for (const page of doc.pages) {
    if (page.warning) warnings.push(`Page ${page.number}: ${page.warning}`);
    if (page.method === 'unreadable' || !page.text.trim()) {
      warnings.push(`Page ${page.number} could not be read. Inspect the original.`);
      continue;
    }
    for (const match of page.text.matchAll(/[^\n]+/g)) {
      const quote = match[0].trim();
      if (
        !/\b(upload|submit|provide|attach|required|must|shall)\b/i.test(quote) ||
        !/(document|certificate|photo|signature|passport|form|proof|card|letter|transcript|resume|cv|statement)/i.test(
          quote,
        )
      )
        continue;
      if (quote.length < 8 || quote.length > 1800) {
        warnings.push(`Page ${page.number}: a long instruction needs manual splitting.`);
        continue;
      }
      if (candidates.length === 50) {
        warnings.push('Draft reached 50 candidates. Review remaining pages manually.');
        break;
      }
      const id = `pdf-${page.number}-${match.index}`,
        conditional = /\b(if|unless|except|only|where|when|either|or|both|and\/or)\b/i.test(quote);
      const uncertain = page.method === 'ocr' && (page.confidence || 0) < 85;
      const notes = [
        ...(conditional
          ? [
              'Conditional or combined instruction: configure its applicability and evidence combination manually.',
            ]
          : []),
        ...(uncertain
          ? ['OCR confidence is uncertain. Compare every character with the original.']
          : []),
      ];
      const pdf = /\bPDF\b/i.test(quote),
        jpg = /\b(JPEG|JPG)\b/i.test(quote);
      const mime = pdf && !jpg ? 'application/pdf' : jpg && !pdf ? 'image/jpeg' : 'any';
      candidates.push({
        id,
        page: page.number,
        start: match.index + match[0].indexOf(quote),
        length: quote.length,
        quote,
        uncertain,
        warnings: notes,
        requirement: {
          id,
          title: quote.replace(/^\s*[\d.)•-]+\s*/, '').slice(0, 160),
          description: quote,
          group: 'Supporting evidence',
          condition: { op: 'always' },
          mime,
          extension: mime === 'application/pdf' ? '.pdf' : mime === 'image/jpeg' ? '.jpg' : 'any',
          optional: true,
          sourceSection: `${doc.name}, page ${page.number}`,
          sourceAnchor: `pdf:${doc.id}:${doc.hash}:${page.number}:${match.index + match[0].indexOf(quote)}:${quote.length}`,
          reviewHint:
            'Draft proposal: confirm wording, applicability, alternatives and constraints against the original.',
        },
      });
    }
  }
  warnings.push(
    'This conservative draft may omit instructions or combine distinct obligations. Read every source page; add or split missing items before confirmation. Proposals start optional until you confirm applicability.',
  );
  return { candidates, warnings };
}
