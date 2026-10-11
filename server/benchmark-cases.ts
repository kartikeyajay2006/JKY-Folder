import { emptyProfile } from '../shared/model';
import type {
  Packet,
  RulePack,
  DocumentRecord,
  EvidenceAnchor,
  Requirement,
  Profile,
} from '../shared/model';
import { templateRequirement } from '../shared/templates';

export interface BenchmarkInput {
  requirement?: Partial<Requirement>;
  profile?: Partial<Profile>;
  document?: Partial<DocumentRecord>;
  link?: Partial<EvidenceAnchor>;
  second?: { slot: string };
  date?: string;
  dates?: string[];
  omitLinks?: boolean;
  omitDocuments?: boolean;
}
export interface BenchmarkScenario {
  packet: Packet;
  documents: DocumentRecord[];
  pack: RulePack;
}

/** Explicit inputs used in exports and execution, without the author's answers or case names. */
export function benchmarkScenario(
  input: BenchmarkInput,
  legacyNegative = false,
): BenchmarkScenario {
  const anchor: EvidenceAnchor = {
    documentId: 'd',
    pageFrom: 1,
    pageTo: 1,
    review: 'confirmed',
    note: 'Inspected the synthetic original and its content.',
    ...(legacyNegative ? { slot: 'First form' } : {}),
    ...input.link,
  };
  const packet: Packet = {
    id: 'p',
    title: 'Synthetic packet',
    packId: 'test',
    mode: 'instructions',
    revision: 1,
    profile: { ...emptyProfile, ...input.profile },
    links: input.omitLinks
      ? {}
      : {
          r: {
            ...anchor,
            ...(input.second
              ? { additional: [{ ...anchor, documentId: 'd2', slot: input.second.slot }] }
              : {}),
          },
        },
    createdAt: '2026-10-10',
    updatedAt: '2026-10-10',
  };
  const document: DocumentRecord = {
    id: 'd',
    packetId: 'p',
    name: 'synthetic.pdf',
    mime: 'application/pdf',
    size: 1000,
    status: 'ready',
    pageCount: 2,
    pages: [{ number: 1, text: 'Synthetic evidence', method: 'native' }],
    hash: 'synthetic',
    createdAt: '2026-10-10',
    ...input.document,
  };
  const dates = input.dates || (input.date ? [input.date] : undefined);
  if (dates)
    document.facts = dates.map((value, i) => ({
      id: 'date-' + i,
      kind: 'issue_date',
      page: 1,
      originalText: value,
      value,
      confidence: 100,
      history: [
        {
          revision: 1,
          value,
          confirmed: true,
          reason: 'Compared the synthetic original date.',
          actor: 'synthetic-applicant',
          createdAt: '2026-10-10',
        },
      ],
    }));
  const pack: RulePack = {
    id: 'test',
    title: 'Synthetic contract',
    cycle: '2027',
    version: '3',
    assurance: 'user_defined',
    sourceUrl: '',
    checkedAt: '2026-10-10',
    requirements: [
      { ...templateRequirement('Required evidence', 0, 'pdf'), id: 'r', ...input.requirement },
    ],
    limitations: ['Synthetic evaluator inputs; document metadata is not an authenticity claim.'],
  };
  return {
    packet,
    pack,
    documents: input.omitDocuments
      ? []
      : [
          document,
          ...(input.second
            ? [{ ...document, id: 'd2', mime: 'application/pdf', hash: 'second' }]
            : []),
        ],
  };
}
