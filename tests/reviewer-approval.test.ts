import { it, expect } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore } from '../server/store';
import {
  createReviewerKey,
  registerReviewer,
  revokeReviewer,
  signReview,
  verifyReview,
} from '../server/reviewer-identity';
import {
  digest,
  saveDraft,
  transitionPack,
  availablePacks,
  sourceChanged,
} from '../server/rule-packs';
import { packScopeHash } from '../server/pack-validation';
import {
  benchmarkHash,
  defaultBenchmark,
  evaluateReviewedBenchmark,
  type BenchmarkManifest,
} from '../server/benchmark-runner';
import { benchmarkScenario } from '../server/benchmark-cases';
import { approveBenchmark } from '../server/review-approval';
import { officialBenchmark, verifyOfficialBenchmarkCoverage } from '../server/official-benchmark';
import { evaluate } from '../shared/evaluate';
import { emptyProfile, type RulePack, type Packet } from '../shared/model';
import { templateRequirement } from '../shared/templates';
import { backup, restore } from '../server/backup';

// These keys/identities are disposable test inputs, never independent review evidence.
function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'jky-signature-test-'));
  const store = createStore(join(dir, 'data'));
  const keys = createReviewerKey('Synthetic reviewer');
  registerReviewer(
    store,
    keys.publicIdentity,
    'Synthetic operator',
    'Disposable test identity checked inside this test; not a real review.',
  );
  return {
    dir,
    store,
    keys,
    cleanup: () => {
      store.db.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
function sourceFixture() {
  const content = 'Submit birth certificate as PDF.';
  const source = {
    id: 's',
    title: 'Synthetic rules',
    url: 'https://example.test/rules',
    content,
    retrievedAt: '2026-10-10',
    sha256: digest(content),
  };
  const pack: RulePack = {
    id: 'signed-pack',
    title: 'Synthetic pack',
    version: '1',
    cycle: '2027',
    stage: 'registration',
    sourceUrl: source.url,
    checkedAt: '2026-10-10',
    assurance: 'reference',
    authoredBy: 'Synthetic author',
    requirements: [
      {
        ...templateRequirement('Birth certificate', 0, 'pdf'),
        id: 'birth',
        sourceAnchor: 's:0:32',
      },
    ],
    sources: [source],
    limitations: ['Synthetic evidence only.'],
    obligations: [
      {
        id: 'birth-o',
        sourceId: 's',
        anchor: 's:0:32',
        instruction: 'Birth certificate PDF',
        disposition: 'implemented',
        requirementIds: ['birth'],
        rationale: 'Explicit synthetic source requirement.',
      },
    ],
    coverage: [
      {
        id: 'full',
        sourceId: 's',
        anchor: 's:0:32',
        title: 'All instructions',
        disposition: 'in_scope',
        obligationIds: ['birth-o'],
      },
    ],
  };
  const review = {
    reviewer: 'Synthetic reviewer',
    scopeHash: packScopeHash(pack),
    signedAt: new Date().toISOString(),
    independenceAttested: true,
    decisions: [
      {
        sectionId: 'full',
        accepted: true,
        note: 'Inspected the whole synthetic source and every mapped rule.',
      },
    ],
  };
  return { source, pack, review };
}
function privateCases() {
  const manifest: BenchmarkManifest = {
    version: '3',
    author: 'Synthetic curator',
    purpose: 'Separate synthetic private scenarios for testing signed benchmark gate behaviour.',
    cases: [
      { id: 'a', scenario: benchmarkScenario({}) },
      { id: 'b', scenario: benchmarkScenario({ omitLinks: true }) },
    ],
  };
  const labels = {
    version: '3',
    manifestHash: benchmarkHash(manifest),
    reviewer: 'Synthetic reviewer',
    signedAt: new Date().toISOString(),
    independenceAttested: true,
    labels: [
      {
        id: 'a',
        expected: 'pass',
        rationale: 'Synthetic original, technical constraints and content review complete.',
      },
      {
        id: 'b',
        expected: 'fail',
        rationale: 'No evidence links exist for this mandatory synthetic requirement.',
      },
    ],
  };
  return { manifest, labels };
}

it('verifies a registered key and refuses payload edits, wrong-purpose replay or impersonation', () => {
  const s = setup();
  try {
    const { labels } = privateCases();
    const signed = signReview(labels, s.keys.privateKey, 'benchmark');
    expect(verifyReview(s.store, signed, 'benchmark').payload).toEqual(labels);
    expect(() => verifyReview(s.store, signed, 'pack')).toThrow();
    expect(() =>
      verifyReview(
        s.store,
        { ...signed, payload: { ...labels, reviewer: 'Someone else' } },
        'benchmark',
      ),
    ).toThrow();
    expect(() =>
      verifyReview(s.store, { ...signed, payload: { ...labels, labels: [] } }, 'benchmark'),
    ).toThrow();
    const imposter = createReviewerKey('Synthetic reviewer');
    expect(() =>
      verifyReview(s.store, signReview(labels, imposter.privateKey, 'benchmark'), 'benchmark'),
    ).toThrow();
  } finally {
    s.cleanup();
  }
});
it('requires a separate operator, substantive identity evidence and a unique reviewer key', () => {
  const s = setup();
  try {
    const other = createReviewerKey('Another synthetic reviewer');
    expect(() =>
      registerReviewer(
        s.store,
        other.publicIdentity,
        ' ANOTHER SYNTHETIC REVIEWER ',
        'Checked identity and key in synthetic test.',
      ),
    ).toThrow();
    expect(() => registerReviewer(s.store, other.publicIdentity, 'Operator', 'yes')).toThrow();
    expect(() =>
      registerReviewer(
        s.store,
        { ...s.keys.publicIdentity, identity: 'Another identity' },
        'Operator',
        'Checked identity and key in synthetic test.',
      ),
    ).toThrow();
  } finally {
    s.cleanup();
  }
});
it('does not let a typed review name publish a pack', () => {
  const s = setup();
  try {
    const { pack, source, review } = sourceFixture();
    s.store.db
      .prepare('INSERT INTO source_snapshots VALUES(?,?)')
      .run(source.id, JSON.stringify(source));
    saveDraft(s.store, pack, 'Synthetic author');
    transitionPack(s.store, pack.id, pack.version, 'review', review.reviewer, review);
    expect(() =>
      transitionPack(s.store, pack.id, pack.version, 'publish', review.reviewer),
    ).toThrow(/signature/);
    expect(availablePacks(s.store).some((p) => p.id === pack.id)).toBe(false);
  } finally {
    s.cleanup();
  }
});
it('publishes a verified signature and removes revoked approvals from new selection', () => {
  const s = setup();
  try {
    const { pack, source, review } = sourceFixture();
    s.store.db
      .prepare('INSERT INTO source_snapshots VALUES(?,?)')
      .run(source.id, JSON.stringify(source));
    saveDraft(s.store, pack, 'Synthetic author');
    transitionPack(
      s.store,
      pack.id,
      pack.version,
      'review',
      review.reviewer,
      signReview(review, s.keys.privateKey, 'pack'),
    );
    const published = transitionPack(s.store, pack.id, pack.version, 'publish', review.reviewer);
    expect(availablePacks(s.store).some((p) => p.id === pack.id)).toBe(true);
    const packet: Packet = {
      id: 'p',
      title: 'Synthetic',
      packId: pack.id,
      mode: 'instructions',
      packSnapshot: published,
      revision: 1,
      profile: emptyProfile,
      links: {},
      createdAt: '2026-10-10',
      updatedAt: '2026-10-10',
    };
    expect(sourceChanged(s.store, packet)).toBe(false);
    revokeReviewer(s.store, review.reviewer, 'Synthetic operator');
    expect(availablePacks(s.store).some((p) => p.id === pack.id)).toBe(false);
    expect(sourceChanged(s.store, packet)).toBe(true);
  } finally {
    s.cleanup();
  }
});
it('requires signature and zero observed errors before approving reviewer-labelled correctness', () => {
  const s = setup();
  try {
    const { manifest, labels } = privateCases();
    expect(() => approveBenchmark(s.store, manifest, labels)).toThrow();
    const signed = signReview(labels, s.keys.privateKey, 'benchmark');
    const report = approveBenchmark(s.store, manifest, signed);
    expect(report.status).toBe('approved');
    expect(report.independentApproval).toBe('registered_reviewer_signature');
    const wrong = { ...labels, labels: labels.labels.map((l) => ({ ...l, expected: 'pass' })) };
    expect(() =>
      approveBenchmark(s.store, manifest, signReview(wrong, s.keys.privateKey, 'benchmark')),
    ).toThrow(/zero/);
    revokeReviewer(s.store, labels.reviewer, 'Synthetic operator');
    expect(() => approveBenchmark(s.store, manifest, signed)).toThrow();
  } finally {
    s.cleanup();
  }
});
it('requires a third signed reviewer for disputes and preserves the original reviewer findings', () => {
  const s = setup();
  try {
    const manifest = defaultBenchmark();
    const actual = manifest.cases.map(
      (c) =>
        evaluate(c.scenario.packet, c.scenario.documents, c.scenario.pack, 'synthetic-test')
          .checks[0].state,
    );
    const labels = {
      version: '3',
      manifestHash: benchmarkHash(manifest),
      reviewer: 'Synthetic reviewer',
      signedAt: new Date().toISOString(),
      independenceAttested: true,
      labels: manifest.cases.map((c, i) => ({
        id: c.id,
        expected: i === 0 ? (actual[i] === 'pass' ? 'fail' : 'pass') : actual[i],
        rationale:
          'Deliberate synthetic labels to exercise the adjudication workflow, not real review evidence.',
      })),
    };
    const signed = signReview(labels, s.keys.privateKey, 'benchmark');
    expect(() => approveBenchmark(s.store, manifest, signed)).toThrow(/adjudication/);
    const original = evaluateReviewedBenchmark(manifest, labels);
    const third = createReviewerKey('Third synthetic reviewer');
    registerReviewer(
      s.store,
      third.publicIdentity,
      'Synthetic operator',
      'Disposable third-party identity for this isolated adjudication test.',
    );
    const decision = {
      reviewer: third.publicIdentity.identity,
      independenceAttested: true,
      signedAt: new Date().toISOString(),
      manifestHash: benchmarkHash(manifest),
      labelsHash: original.labelsHash,
      decisions: original.disagreements.map((r) => ({
        id: r.id,
        expected: r.authorLabel,
        rationale:
          'Synthetic adjudication chooses the authored contract after inspecting its input; this record is only a workflow test.',
      })),
    };
    const report = approveBenchmark(
      s.store,
      manifest,
      signed,
      signReview(decision, third.privateKey, 'adjudication'),
    );
    expect(report.status).toBe('approved');
    expect(report.originalReviewResults[0].matched).toBe(false);
    expect(report.adjudicationSignature?.reviewer).toBe(third.publicIdentity.identity);
  } finally {
    s.cleanup();
  }
});
it('projects every official predicate combination without exposing expected answers', () => {
  const { pack, source } = sourceFixture();
  pack.requirements[0].condition = { op: 'eq', field: 'category', value: 'sc' };
  const dossier = { pack, snapshots: [source], scopeHash: packScopeHash(pack) };
  const manifest = officialBenchmark(dossier);
  expect(manifest.cases).toHaveLength(12); // six declared category answers, present and missing evidence
  expect(JSON.stringify(manifest)).not.toContain('"expected"');
  expect(verifyOfficialBenchmarkCoverage(pack, manifest).requirements).toBe(1);
  const incomplete = { ...manifest, cases: manifest.cases.slice(1) };
  expect(() => verifyOfficialBenchmarkCoverage(pack, incomplete)).toThrow(/combination/);
  const changed = structuredClone(pack);
  changed.requirements[0].mime = 'image/jpeg';
  expect(() => verifyOfficialBenchmarkCoverage(changed, manifest)).toThrow(/scope/);
});
it('requires reviewer re-verification after restoring a backup that could predate key revocation', async () => {
  const s = setup();
  try {
    const file = join(s.dir, 'review-backup.jky');
    await backup(join(s.dir, 'data'), file, 'Synthetic review backup password.');
    const restored = join(s.dir, 'restored');
    restore(file, restored, 'Synthetic review backup password.');
    const store = createStore(restored);
    try {
      expect(store.db.prepare('SELECT count(*) AS count FROM reviewer_keys').get()).toEqual({
        count: 0,
      });
    } finally {
      store.db.close();
    }
  } finally {
    s.cleanup();
  }
});

it('runs the real CLI from reviewer key registration through signed pack and benchmark release', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-review-cli-test-'));
  const dataDir = join(dir, 'registry');
  const file = (name: string) => join(dir, name);
  const run = (script: string, args: string[]) =>
    execFileSync(process.execPath, ['--import', 'tsx', script, ...args], {
      env: { ...process.env, DATA_DIR: dataDir },
      encoding: 'utf8',
      timeout: 15000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  const write = (name: string, value: unknown) =>
    writeFileSync(file(name), JSON.stringify(value), { mode: 0o600 });
  try {
    const { source, pack, review } = sourceFixture();
    const store = createStore(dataDir);
    try {
      store.db
        .prepare('INSERT INTO source_snapshots VALUES(?,?)')
        .run(source.id, JSON.stringify(source));
      saveDraft(store, pack, 'Synthetic author');
    } finally {
      store.db.close();
    }
    write('dossier.json', { pack, snapshots: [source], scopeHash: packScopeHash(pack) });
    write('review.json', review);
    const cli = 'server/reviewer-cli.ts';
    run(cli, ['keygen', review.reviewer, file('private.pem'), file('public.json')]);
    run(cli, [
      'register',
      file('public.json'),
      'Synthetic operator',
      'Disposable identity checked for this CLI test, not real independent evidence.',
    ]);
    run(cli, [
      'sign',
      'pack',
      file('review.json'),
      file('private.pem'),
      file('signed-review.json'),
    ]);
    run('server/curate.ts', [
      'review',
      '--id',
      pack.id,
      '--version',
      pack.version,
      '--actor',
      review.reviewer,
      '--file',
      file('signed-review.json'),
    ]);
    run('server/curate.ts', [
      'publish',
      '--id',
      pack.id,
      '--version',
      pack.version,
      '--actor',
      review.reviewer,
    ]);
    run(cli, ['official-benchmark', file('dossier.json'), file('blind.json')]);
    const blind = JSON.parse(readFileSync(file('blind.json'), 'utf8'));
    write('labels.json', {
      version: '3',
      manifestHash: blind.manifestHash,
      reviewer: review.reviewer,
      signedAt: new Date().toISOString(),
      independenceAttested: true,
      labels: blind.manifest.cases.map((c: { id: string; scenario: { documents: unknown[] } }) => ({
        id: c.id,
        expected: c.scenario.documents.length ? 'pass' : 'fail',
        rationale:
          'Applied the explicit birth certificate requirement to present or absent synthetic evidence.',
      })),
    });
    run(cli, [
      'sign',
      'benchmark',
      file('labels.json'),
      file('private.pem'),
      file('signed-labels.json'),
    ]);
    run(cli, [
      'release',
      file('dossier.json'),
      file('blind.json'),
      file('signed-labels.json'),
      file('report.json'),
    ]);
    const report = JSON.parse(readFileSync(file('report.json'), 'utf8'));
    expect(report.status).toBe('approved');
    expect(report.sourceCoverage.requirements).toBe(1);
    expect(report.benchmarkCoverage.cases).toBe(2);
    expect(report.criticalFalsePasses).toBe(0);
    run(cli, ['revoke', review.reviewer, 'Synthetic operator']);
    expect(() =>
      run(cli, [
        'release',
        file('dossier.json'),
        file('blind.json'),
        file('signed-labels.json'),
        file('revoked-report.json'),
      ]),
    ).toThrow();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}, 30000);
