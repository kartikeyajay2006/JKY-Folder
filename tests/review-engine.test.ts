import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { evaluate } from '../shared/evaluate';
import { emptyProfile, type Packet, type DocumentRecord, type RulePack } from '../shared/model';
import { templateRequirement } from '../shared/templates';
import { extractFacts, consistencyConcerns, suggestEvidence } from '../shared/facts';
import { createStore } from '../server/store';
import {
  availablePacks,
  saveDraft,
  transitionPack,
  digest,
  sourceChanged,
} from '../server/rule-packs';
import { refreshReminders } from '../server/reminders';
const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});
const dir = () => {
  const d = mkdtempSync(join(tmpdir(), 'jky-review-'));
  dirs.push(d);
  return d;
};
export const requirement = () => ({
  ...templateRequirement('Birth certificate', 0, 'pdf'),
  id: 'birth',
});
export const packet = (): Packet => ({
  id: 'p',
  title: 'Synthetic packet',
  packId: 'pack',
  revision: 1,
  profile: { ...emptyProfile },
  links: {},
  createdAt: '2026-10-10',
  updatedAt: '2026-10-10',
});
export const document = (id = 'd'): DocumentRecord => ({
  id,
  packetId: 'p',
  name: 'birth.pdf',
  size: 1000,
  hash: id,
  status: 'ready',
  mime: 'application/pdf',
  pageCount: 2,
  pages: [
    {
      number: 1,
      text: 'Name: Synthetic Applicant\nDate of birth: 2000-01-01',
      method: 'native',
      confidence: 100,
    },
    { number: 2, text: 'Expiry date: 2027-01-01' },
  ],
  createdAt: '2026-10-10',
});
export const pack = (): RulePack => ({
  id: 'pack',
  title: 'Synthetic rules',
  version: '1',
  cycle: '2027',
  stage: 'registration',
  sourceUrl: 'https://example.test/rules',
  checkedAt: '2026-10-10',
  assurance: 'user_defined',
  requirements: [requirement()],
  limitations: ['Synthetic benchmark only.'],
});
const link = (documentId = 'd') => ({
  documentId,
  pageFrom: 1,
  pageTo: 1,
  review: 'confirmed' as const,
  note: 'Compared the original with the instructions.',
});
describe('evidence combinations and deterministic constraints', () => {
  it('requires each named component including separately reviewed pages in one original', () => {
    const p = packet(),
      rules = pack(),
      d = document();
    rules.requirements[0].evidenceSlots = ['Form 1', 'Form 2'];
    p.links.birth = { ...link(), slot: 'Form 1' };
    expect(evaluate(p, [d], rules, 'r').checks[0].state).toBe('fail');
    p.links.birth.additional = [{ ...link(), slot: 'Form 2', pageFrom: 2, pageTo: 2 }];
    expect(evaluate(p, [d], rules, 'r').checks[0].state).toBe('pass');
    p.links.birth.additional[0].review = 'unreviewed';
    expect(evaluate(p, [d], rules, 'r').checks[0].state).toBe('needs_review');
  });
  it('accepts a valid alternative without allowing the wrong file to satisfy all components', () => {
    const p = packet(),
      rules = pack(),
      d = document(),
      wrong = { ...document('bad'), mime: 'image/jpeg', name: 'birth.jpg' };
    p.links.birth = { ...link('bad'), additional: [link()] };
    rules.requirements[0].evidenceMode = 'any';
    expect(evaluate(p, [d, wrong], rules, 'r').checks[0].state).toBe('pass');
    rules.requirements[0].evidenceMode = 'all';
    expect(evaluate(p, [d, wrong], rules, 'r').checks[0].state).toBe('fail');
  });
  it('checks inclusive size/page/dimension boundaries and keeps unavailable dimensions unresolved', () => {
    const p = packet(),
      rules = pack(),
      d = document();
    p.links.birth = link();
    Object.assign(rules.requirements[0], {
      minBytes: 1000,
      maxBytes: 1000,
      minPages: 2,
      maxPages: 2,
    });
    expect(evaluate(p, [d], rules, 'r').checks[0].state).toBe('pass');
    rules.requirements[0].minWidth = 100;
    expect(evaluate(p, [d], rules, 'r').checks[0].state).toBe('needs_review');
    d.width = 100;
    expect(evaluate(p, [d], rules, 'r').checks[0].state).toBe('pass');
    d.width = 99;
    expect(evaluate(p, [d], rules, 'r').checks[0].state).toBe('fail');
  });
  it('date rules require confirmed exact dates and retain confirmed input revisions', () => {
    const p = packet(),
      rules = pack(),
      d = document();
    p.links.birth = link();
    d.facts = extractFacts(d.pages);
    rules.requirements[0].dateCheck = {
      field: 'birth_date',
      operation: 'on_or_before',
      reference: '2000-01-01',
    };
    expect(evaluate(p, [d], rules, 'r').checks[0].state).toBe('needs_review');
    const f = d.facts.find((f) => f.kind === 'birth_date')!;
    f.history = [
      {
        revision: 1,
        value: f.value,
        confirmed: true,
        actor: 'user',
        reason: 'Reviewed original date.',
        createdAt: '2026-10-10',
      },
    ];
    expect(evaluate(p, [d], rules, 'r').checks[0].state).toBe('pass');
    expect(evaluate(p, [d], rules, 'r').checks[0].factRevisions).toHaveLength(1);
    f.value = '01/02/2000';
    expect(evaluate(p, [d], rules, 'r').checks[0].state).toBe('needs_review');
  });
  it('never uses uncertain OCR to pass literal text checks or suggest evidence', () => {
    const p = packet(),
      rules = pack(),
      d = document();
    p.links.birth = link();
    rules.requirements[0].expectedText = 'Synthetic Applicant';
    d.pages[0].method = 'ocr';
    d.pages[0].confidence = 25;
    expect(evaluate(p, [d], rules, 'r').checks[0].state).toBe('needs_review');
    p.links = {};
    expect(suggestEvidence(p, [d], rules)).toEqual([]);
  });
  it('reports confirmed cross-document differences without inferring fraud or equivalence', () => {
    const a = document(),
      b = document('other');
    a.facts = extractFacts(a.pages);
    b.facts = extractFacts([{ number: 1, text: 'Name: Another Applicant' }]);
    for (const d of [a, b])
      for (const f of d.facts!)
        f.history = [
          {
            revision: 1,
            value: f.value,
            confirmed: true,
            actor: 'user',
            reason: 'Inspected original.',
            createdAt: '2026-10-10',
          },
        ];
    expect(consistencyConcerns([a, b])[0].facts).toHaveLength(2);
  });
});
describe('curator lifecycle and source changes', () => {
  it('blocks self approval and omissions, pins published sources and marks old packets affected', () => {
    const store = createStore(dir());
    try {
      const source = {
        id: 's',
        title: 'Synthetic source',
        url: 'https://example.test',
        retrievedAt: '2026-10-10',
        content: 'Age document is required.',
        sha256: digest('Age document is required.'),
      };
      store.db
        .prepare('INSERT INTO source_snapshots VALUES(?,?)')
        .run(source.id, JSON.stringify(source));
      const rules = pack();
      rules.sources = [source];
      rules.requirements[0].sourceAnchor = 's:0:24';
      rules.obligations = [
        {
          id: 'o',
          sourceId: 's',
          anchor: 's:0:24',
          instruction: 'Age evidence',
          disposition: 'implemented',
          requirementIds: ['birth'],
          rationale: 'Explicit instruction.',
        },
      ];
      saveDraft(store, rules, 'author');
      expect(() => transitionPack(store, 'pack', '1', 'review', 'author')).toThrow();
      transitionPack(store, 'pack', '1', 'review', 'reviewer');
      transitionPack(store, 'pack', '1', 'publish', 'reviewer');
      const p = { ...packet(), packSnapshot: availablePacks(store).find((p) => p.id === 'pack')! };
      expect(sourceChanged(store, p)).toBe(false);
      store.db
        .prepare('UPDATE source_snapshots SET payload=? WHERE id=?')
        .run(
          JSON.stringify({ ...source, content: 'Changed', sha256: digest('Changed') }),
          source.id,
        );
      expect(sourceChanged(store, p)).toBe(true);
      expect(p.packSnapshot.sources![0].sha256).toBe(source.sha256);
      expect(() => saveDraft(store, rules, 'author')).toThrow();
    } finally {
      store.db.close();
    }
  });
  it('creates no reminders for an empty workspace and deduplicates actual deadline reminders', () => {
    const store = createStore(dir());
    try {
      store.db
        .prepare('INSERT INTO users VALUES(?,?,?,?,?,?)')
        .run('u', 'User', 'u@example.test', '', 0, '2026-10-10');
      expect(refreshReminders(store, 'u')).toEqual([]);
      const p = { ...packet(), deadline: '2026-10-12', customPack: pack() };
      store.db.prepare('INSERT INTO packets VALUES(?,?,?)').run(p.id, 'u', JSON.stringify(p));
      expect(refreshReminders(store, 'u', new Date('2026-10-10T12:00:00Z'))).toHaveLength(1);
      expect(refreshReminders(store, 'u', new Date('2026-10-10T12:00:00Z'))).toHaveLength(1);
    } finally {
      store.db.close();
    }
  });
});
