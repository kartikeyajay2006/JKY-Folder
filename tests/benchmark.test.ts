import { describe, it, expect } from 'vitest';
import corpus from './fixtures/benchmark-v1.json';
import { evaluate } from '../shared/evaluate';
import {
  emptyProfile,
  type Packet,
  type RulePack,
  type Requirement,
  type DocumentRecord,
} from '../shared/model';
import { templateRequirement } from '../shared/templates';
describe(`version ${corpus.version} critical-negative regression corpus`, () => {
  for (const fixture of corpus.cases)
    it(`${fixture.id}: ${fixture.rationale}`, () => {
      const p: Packet = {
        id: 'p',
        title: fixture.template,
        packId: 'test',
        revision: 1,
        profile: { ...emptyProfile },
        links: {
          r: {
            documentId: 'd',
            pageFrom: 1,
            pageTo: 1,
            review: 'confirmed',
            note: 'Inspected the synthetic original.',
            slot: 'First form',
          },
        },
        createdAt: '2026-10-10',
        updatedAt: '2026-10-10',
      };
      const requirement = {
        ...templateRequirement('Required evidence', 0, 'pdf'),
        id: 'r',
        ...fixture.requirement,
      } as Requirement;
      const rules: RulePack = {
        id: 'test',
        title: 'Synthetic benchmark',
        version: corpus.version,
        cycle: '2027',
        sourceUrl: '',
        checkedAt: '2026-10-10',
        assurance: 'user_defined',
        requirements: [requirement],
        limitations: ['Internal synthetic regression corpus.'],
      };
      const doc: DocumentRecord = {
        id: 'd',
        packetId: 'p',
        name: 'synthetic.pdf',
        size: 1000,
        status: 'ready',
        mime: 'application/pdf',
        pageCount: 2,
        pages: [{ number: 1, text: 'Synthetic evidence' }],
        hash: 'synthetic',
        createdAt: '2026-10-10',
        ...fixture.document,
      };
      const result = evaluate(p, [doc], rules, 'r').checks[0];
      expect(result.state).toBe(fixture.expected);
      expect(result.state).not.toBe('pass');
      expect(result.reason).not.toBe('');
    });
  it('does not claim independent launch approval for author-labelled cases', () =>
    expect(corpus.reviewStatus).toBe('awaiting_independent_review'));
});
