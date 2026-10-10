import { expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import corpus from './fixtures/benchmark-v2.json';
import { evaluate } from '../shared/evaluate';
import {
  emptyProfile,
  type Packet,
  type RulePack,
  type DocumentRecord,
  type EvidenceLink,
  type EvidenceAnchor,
  type Requirement,
  type Profile,
} from '../shared/model';
import { templateRequirement } from '../shared/templates';
import { blindBenchmark, adjudicateBenchmark } from '../server/benchmark-review';
for (const input of corpus.cases)
  it(`contract ${input.id}: ${input.rationale}`, () => {
    const f = input as unknown as {
      expected: string;
      requirement?: Partial<Requirement>;
      profile?: Partial<Profile>;
      document?: Partial<DocumentRecord>;
      link?: Partial<EvidenceAnchor>;
      second?: { slot: string };
      date?: string;
      dates?: string[];
      omitLinks?: boolean;
      omitDocuments?: boolean;
    };
    const anchor = {
      documentId: 'd',
      pageFrom: 1,
      pageTo: 1,
      review: 'confirmed' as const,
      note: 'Inspected each synthetic original and its content.',
      ...f.link,
    };
    const packet: Packet = {
      id: 'p',
      title: 'Contract fixture',
      packId: 'test',
      revision: 1,
      profile: { ...emptyProfile, ...f.profile },
      links: f.omitLinks
        ? {}
        : {
            r: {
              ...anchor,
              ...(f.second
                ? { additional: [{ ...anchor, documentId: 'd2', slot: f.second.slot }] }
                : {}),
            } as EvidenceLink,
          },
      createdAt: '2026-10-10',
      updatedAt: '2026-10-10',
    };
    const doc: DocumentRecord = {
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
      ...f.document,
    };
    if (f.date)
      doc.facts = [
        {
          id: 'fact',
          kind: 'issue_date',
          page: 1,
          originalText: f.date,
          value: f.date,
          confidence: 100,
          history: [
            {
              revision: 1,
              value: f.date,
              confirmed: true,
              reason: 'Checked original calendar date.',
              actor: 'reviewer',
              createdAt: '2026-10-10',
            },
          ],
        },
      ];
    if (f.dates)
      doc.facts = f.dates.map((value, i) => ({
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
            actor: 'reviewer',
            reason: 'Compared the original date text.',
            createdAt: '2026-10-10',
          },
        ],
      }));
    const pack: RulePack = {
      id: 'test',
      title: 'Contract',
      cycle: '2027',
      version: '2',
      assurance: 'user_defined',
      sourceUrl: '',
      checkedAt: '2026-10-10',
      requirements: [
        { ...templateRequirement('Required evidence', 0, 'pdf'), id: 'r', ...f.requirement },
      ],
      limitations: [],
    };
    const second: DocumentRecord = { ...doc, id: 'd2', mime: 'application/pdf', hash: 'second' };
    const result = evaluate(
      packet,
      f.omitDocuments ? [] : [doc, ...(f.second ? [second] : [])],
      pack,
      'run',
    ).checks[0];
    expect(result.state).toBe(f.expected);
  });
it('exports a blind immutable corpus and rejects incomplete or self-labelled independent review', () => {
  const manifest = blindBenchmark(),
    hash = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
  expect(JSON.stringify(manifest)).not.toContain('"expected"');
  const input = {
    version: '2',
    manifestHash: hash,
    reviewer: 'different-reviewer',
    independenceAttested: true,
    labels: corpus.cases.map((c) => ({ id: c.id, expected: c.expected, rationale: c.rationale })),
  };
  expect(() => adjudicateBenchmark({ ...input, reviewer: corpus.author })).toThrow();
  expect(() => adjudicateBenchmark({ ...input, labels: [] })).toThrow();
  expect(() => adjudicateBenchmark({ ...input, manifestHash: 'stale' })).toThrow();
  expect(adjudicateBenchmark(input).status).toBe('reviewer_labels_recorded');
  expect(
    adjudicateBenchmark({
      ...input,
      labels: input.labels.map((l, i) => (i === 0 ? { ...l, expected: 'fail' } : l)),
    }).status,
  ).toBe('adjudication_required');
});
