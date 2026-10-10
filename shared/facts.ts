import type {
  DocumentFact,
  DocumentPage,
  FactKind,
  Packet,
  DocumentRecord,
  RulePack,
  EvidenceSuggestion,
} from './model';
export function extractFacts(pages: DocumentPage[]): DocumentFact[] {
  const patterns: [FactKind, RegExp][] = [
    ['name', /(?:full\s+name|candidate\s+name|name)\s*[:\-]\s*([^\n:]{2,100})/gi],
    ['birth_date', /(?:date\s+of\s+birth|dob|birth\s+date)\s*[:\-]\s*([0-9][0-9/ .-]{5,18})/gi],
    [
      'issue_date',
      /(?:date\s+of\s+issue|issue\s+date|issued\s+on)\s*[:\-]\s*([0-9][0-9/ .-]{5,18})/gi,
    ],
    ['expiry_date', /(?:expiry\s+date|expires|valid\s+until)\s*[:\-]\s*([0-9][0-9/ .-]{5,18})/gi],
  ];
  return pages.flatMap((page) =>
    patterns.flatMap(([kind, pattern]) =>
      [...page.text.matchAll(pattern)].slice(0, 10).map((match, i) => {
        const token = page.tokens?.find((t) => t.text.includes(match[1].trim()));
        return {
          id: `${page.number}-${kind}-${i}`,
          kind,
          page: page.number,
          originalText: match[0].trim(),
          value: match[1].trim(),
          confidence: page.confidence || 0,
          box: token?.box,
          history: [],
        };
      }),
    ),
  );
}
export function consistencyConcerns(documents: DocumentRecord[]) {
  return (['name', 'birth_date'] as const).flatMap((kind) => {
    const facts = documents.flatMap((doc) =>
      (doc.facts || [])
        .filter((f) => f.kind === kind && f.history.at(-1)?.confirmed)
        .map((f) => ({
          documentId: doc.id,
          name: doc.name,
          factId: f.id,
          value: f.value,
          page: f.page,
        })),
    );
    const normalize = (v: string) => v.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
    return new Set(facts.map((f) => normalize(f.value))).size > 1
      ? [
          {
            kind,
            facts,
            reason: `Confirmed ${kind.replace(/_/g, ' ')} values differ. Inspect the originals; spelling, transliteration or format differences may explain this.`,
          },
        ]
      : [];
  });
}
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
