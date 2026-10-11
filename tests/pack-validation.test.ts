import { it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore } from '../server/store';
import { digest, saveDraft, transitionPack } from '../server/rule-packs';
import { packScopeHash, validatePackSources, validatePackReview } from '../server/pack-validation';
import { packWorkbook } from '../server/review-workbook';
import { templateRequirement } from '../shared/templates';
import type { RulePack, SourceSnapshot } from '../shared/model';

function fixture() {
  const content = 'A PDF birth certificate is required. A signed consent form is also required.';
  const source: SourceSnapshot = {
    id: 's',
    title: 'Synthetic source',
    url: 'https://example.test/rules',
    retrievedAt: '2026-10-10',
    content,
    sha256: digest(content),
  };
  const pack: RulePack = {
    id: 'pack',
    version: '1',
    title: 'Source review',
    cycle: '2027',
    stage: 'registration',
    checkedAt: '2026-10-10',
    assurance: 'reference',
    sourceUrl: source.url,
    authoredBy: 'Author',
    limitations: ['Synthetic source only.'],
    sources: [source],
    requirements: [
      {
        ...templateRequirement('Birth certificate', 0, 'pdf'),
        id: 'birth',
        sourceAnchor: 's:0:36',
      },
    ],
    obligations: [
      {
        id: 'birth-o',
        sourceId: 's',
        anchor: 's:0:36',
        instruction: 'Birth certificate PDF',
        disposition: 'implemented',
        requirementIds: ['birth'],
        rationale: 'Compare the original document with this explicit rule.',
      },
      {
        id: 'consent-o',
        sourceId: 's',
        anchor: 's:37:38',
        instruction: 'Signed consent form',
        disposition: 'unsupported',
        requirementIds: [],
        rationale: 'Synthetic unsupported obligation is disclosed for independent review.',
      },
    ],
    coverage: [
      {
        id: 'full',
        sourceId: 's',
        anchor: `s:0:${content.length}`,
        title: 'All source text',
        disposition: 'in_scope',
        obligationIds: ['birth-o', 'consent-o'],
      },
    ],
  };
  const review = {
    reviewer: 'Reviewer',
    scopeHash: packScopeHash(pack),
    signedAt: new Date().toISOString(),
    independenceAttested: true,
    decisions: [
      {
        sectionId: 'full',
        accepted: true,
        note: 'Read both sentences; checked the rule and the unsupported consent obligation.',
      },
    ],
  };
  return { source, pack, review };
}

it('requires coverage instead of allowing the legacy no-coverage approval bypass', () => {
  const { source, pack } = fixture();
  expect(validatePackSources(pack, [source]).unsupported).toBe(1);
  delete pack.coverage;
  expect(() => validatePackSources(pack, [source])).toThrow(/coverage/);
});
it('detects omitted words at the beginning, between ranges and after the last section', () => {
  for (const anchor of ['s:1:74', 's:0:36']) {
    const { source, pack } = fixture();
    pack.coverage![0].anchor = anchor;
    expect(() => validatePackSources(pack, [source])).toThrow(/omits source text/);
  }
  const { source, pack } = fixture();
  pack.coverage = [
    { ...pack.coverage![0], anchor: 's:0:36' },
    { ...pack.coverage![0], id: 'later', anchor: 's:39:36' },
  ];
  expect(() => validatePackSources(pack, [source])).toThrow(/omits source text/);
});
it('rejects duplicate inventory ids, absent sources and omitted unsupported obligations', () => {
  const { source, pack } = fixture();
  const duplicate = structuredClone(pack);
  duplicate.obligations!.push(duplicate.obligations![0]);
  expect(() => validatePackSources(duplicate, [source])).toThrow(/unique/);
  const missing = structuredClone(pack);
  missing.sources!.push({ ...source, id: 'missing' });
  expect(() => validatePackSources(missing, [source])).toThrow(/integrity/);
  pack.coverage![0].obligationIds = ['birth-o'];
  expect(() => validatePackSources(pack, [source])).toThrow(/every obligation/);
});
it('binds approval to cycle, stage, author, identity and published limitations', () => {
  const { pack, review } = fixture();
  for (const change of [
    { cycle: '2028' },
    { stage: 'admission' },
    { id: 'another' },
    { limitations: [] },
    { authoredBy: 'Someone else' },
    { title: 'Complete and verified' },
  ]) {
    const changed = { ...pack, ...change };
    expect(packScopeHash(changed)).not.toBe(review.scopeHash);
    expect(() => validatePackReview(changed, 'Reviewer', review)).toThrow();
  }
});
it('rejects disguised self-review, future signatures, rejected sections and duplicated decisions', () => {
  const { pack, review } = fixture();
  expect(() => validatePackReview(pack, ' AUTHOR ', { ...review, reviewer: ' AUTHOR ' })).toThrow();
  expect(() =>
    validatePackReview(pack, 'Reviewer', { ...review, signedAt: '2099-01-01' }),
  ).toThrow();
  expect(() =>
    validatePackReview(pack, 'Reviewer', {
      ...review,
      decisions: [{ ...review.decisions[0], accepted: false }],
    }),
  ).toThrow();
  expect(() =>
    validatePackReview(pack, 'Reviewer', {
      ...review,
      decisions: [...review.decisions, ...review.decisions],
    }),
  ).toThrow();
});
it('shows actual conditions and constraints and refuses a corrupted dossier', () => {
  const { pack, source } = fixture();
  pack.requirements[0].dateCheck = {
    field: 'issue_date',
    operation: 'on_or_before',
    reference: '2026-10-10',
  };
  const dossier = { pack, snapshots: [source], scopeHash: packScopeHash(pack) };
  const html = packWorkbook(dossier);
  expect(html).toContain('on_or_before');
  expect(html).toContain('Synthetic source only.');
  expect(() => packWorkbook({ ...dossier, scopeHash: 'stale' })).toThrow(/stale/);
  expect(() =>
    packWorkbook({ ...dossier, snapshots: [{ ...source, content: 'Replaced' }] }),
  ).toThrow(/integrity/);
});

it('rejects corrupted inline source text even if the captured registry snapshot is valid', () => {
  const { source, pack } = fixture();
  pack.sources = [
    { ...source, content: 'Different source content masquerading under the original hash.' },
  ];
  expect(() => validatePackSources(pack, [source])).toThrow(/integrity/);
});
it('revalidates the scope at publication instead of trusting an earlier reviewed state', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-pack-gate-'));
  const store = createStore(dir);
  try {
    const { pack, source, review } = fixture();
    store.db
      .prepare('INSERT INTO source_snapshots VALUES(?,?)')
      .run(source.id, JSON.stringify(source));
    saveDraft(store, pack, 'Author');
    const reviewed = transitionPack(store, pack.id, pack.version, 'review', 'Reviewer', review);
    reviewed.cycle = '2028';
    store.db.prepare('UPDATE pack_revisions SET payload=?').run(JSON.stringify(reviewed));
    expect(() => transitionPack(store, pack.id, pack.version, 'publish', 'Reviewer')).toThrow();
  } finally {
    store.db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
