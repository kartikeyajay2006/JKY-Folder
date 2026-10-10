import { it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore } from '../server/store';
import { saveDraft, transitionPack, packScopeHash, digest } from '../server/rule-packs';
import { uceedPack } from '../shared/packs';
import { evaluate } from '../shared/evaluate';
import { emptyProfile, type RulePack, type Packet } from '../shared/model';
import { templateRequirement } from '../shared/templates';
it('requires complete independent coverage decisions and rejects stale hashes and source changes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-official-')),
    store = createStore(dir);
  try {
    const content = 'Submit birth certificate as PDF.',
      source = {
        id: 's',
        url: 'https://official.example.test',
        title: 'Official source',
        content,
        sha256: digest(content),
        retrievedAt: '2026-10-10',
      };
    store.db.prepare('INSERT INTO source_snapshots VALUES(?,?)').run('s', JSON.stringify(source));
    const pack: RulePack = {
      id: 'review',
      version: '1',
      title: 'Official scope',
      stage: 'registration',
      cycle: '2027',
      checkedAt: '2026-10-10',
      sourceUrl: source.url,
      assurance: 'reference',
      requirements: [
        { ...templateRequirement('Birth certificate', 0, 'pdf'), id: 'r', sourceAnchor: 's:0:32' },
      ],
      sources: [source],
      obligations: [
        {
          id: 'o',
          sourceId: 's',
          anchor: 's:0:32',
          instruction: 'Birth certificate PDF',
          disposition: 'implemented',
          requirementIds: ['r'],
          rationale: 'The explicit source requires this original.',
        },
      ],
      coverage: [
        {
          id: 'section',
          sourceId: 's',
          anchor: 's:0:32',
          title: 'Registration instructions',
          disposition: 'in_scope',
          obligationIds: ['o'],
        },
      ],
      limitations: [],
    };
    saveDraft(store, pack, 'author');
    const review = {
      reviewer: 'reviewer',
      scopeHash: packScopeHash(pack),
      signedAt: '2026-10-11',
      independenceAttested: true,
      decisions: [
        {
          sectionId: 'section',
          accepted: true,
          note: 'Read original section, checked missing obligations and their predicates.',
        },
      ],
    };
    expect(() => transitionPack(store, 'review', '1', 'review', 'reviewer')).toThrow();
    expect(() =>
      transitionPack(store, 'review', '1', 'review', 'author', { ...review, reviewer: 'author' }),
    ).toThrow();
    expect(() =>
      transitionPack(store, 'review', '1', 'review', 'reviewer', { ...review, decisions: [] }),
    ).toThrow();
    expect(() =>
      transitionPack(store, 'review', '1', 'review', 'reviewer', { ...review, scopeHash: 'stale' }),
    ).toThrow();
    transitionPack(store, 'review', '1', 'review', 'reviewer', review);
    store.db
      .prepare('UPDATE source_snapshots SET payload=? WHERE id=?')
      .run(JSON.stringify({ ...source, sha256: 'changed' }), 's');
    expect(() => transitionPack(store, 'review', '1', 'publish', 'reviewer')).toThrow();
  } finally {
    store.db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
it('keeps the expanded official source pack draft and routes NIOS evidence conservatively', () => {
  expect(uceedPack.lifecycle).toBe('draft');
  expect(uceedPack.reviewedBy).toBeUndefined();
  expect(uceedPack.requirements).toHaveLength(18);
  expect(uceedPack.coverage).toHaveLength(76);
  expect(
    uceedPack.obligations?.filter((o) => o.disposition === 'unsupported').length,
  ).toBeGreaterThan(0);
  const packet: Packet = {
    id: 'p',
    title: 'NIOS',
    packId: uceedPack.id,
    mode: 'instructions',
    revision: 1,
    profile: { ...emptyProfile, education: 'appearing', educationBoard: 'nios' },
    links: {},
    createdAt: '2026-10-10',
    updatedAt: '2026-10-10',
  };
  const checks = evaluate(packet, [], uceedPack, 'run').checks;
  expect(checks.find((c) => c.requirementId === 'principal')?.state).toBe('not_applicable');
  expect(checks.find((c) => c.requirementId === 'nios')?.state).toBe('fail');
  packet.profile.educationBoard = 'unknown';
  expect(
    evaluate(packet, [], uceedPack, 'run').checks.find((c) => c.requirementId === 'nios')?.state,
  ).toBe('unknown');
});
