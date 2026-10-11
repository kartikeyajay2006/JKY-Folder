import { it, expect } from 'vitest';
import { benchmarkScenario } from '../server/benchmark-cases';
import {
  benchmarkHash,
  defaultBenchmark,
  evaluateReviewedBenchmark,
  runAuthoredRegression,
  validateBenchmarkManifest,
  type BenchmarkManifest,
} from '../server/benchmark-runner';
import { benchmarkWorkbook } from '../server/review-workbook';

function heldout() {
  const manifest: BenchmarkManifest = {
    version: '3',
    author: 'Synthetic curator',
    purpose: 'Private synthetic logical cases prepared separately from the application evaluator.',
    cases: [
      { id: 'case-a', scenario: benchmarkScenario({}) },
      { id: 'case-b', scenario: benchmarkScenario({ omitDocuments: true }) },
    ],
  };
  const labels = {
    version: '3',
    manifestHash: benchmarkHash(manifest),
    reviewer: 'Synthetic independent reviewer',
    signedAt: new Date().toISOString(),
    independenceAttested: true,
    labels: [
      {
        id: 'case-a',
        expected: 'pass',
        rationale: 'Original present, supported checks and content review complete.',
      },
      {
        id: 'case-b',
        expected: 'fail',
        rationale: 'The linked original is absent so it cannot satisfy this required item.',
      },
    ],
  };
  return { manifest, labels };
}
it('runs the whole authored corpus without misrepresenting it as independent validation', () => {
  const report = runAuthoredRegression();
  expect(report.total).toBeGreaterThan(200);
  expect(report.mismatches).toEqual([]);
  expect(report.independentApproval).toBe('not_independent');
});
it('freezes explicit, unique inputs and removes semantic IDs and implicit defaults', () => {
  const manifest = defaultBenchmark();
  expect(validateBenchmarkManifest(manifest)).toEqual(manifest);
  expect(manifest.cases.every((c) => /^case-\d{4}$/.test(c.id))).toBe(true);
  expect(new Set(manifest.cases.map((c) => benchmarkHash(c.scenario))).size).toBe(
    manifest.cases.length,
  );
  const html = benchmarkWorkbook({ manifest, manifestHash: benchmarkHash(manifest) });
  expect(html).not.toContain('negative-size-below');
  expect(html).not.toContain('confirmed-positive');
  expect(html).not.toContain('authorLabel');
  expect(html).toContain('there are no implicit defaults');
});
it('evaluates against private reviewer labels with confusion counts and source provenance', () => {
  const { manifest, labels } = heldout();
  const report = evaluateReviewedBenchmark(manifest, labels);
  expect(report.status).toBe('checks_passed');
  expect(report.matched).toBe(2);
  expect(report.confusion).toEqual({ pass: { pass: 1 }, fail: { fail: 1 } });
  expect(report.evaluatorSourcesHash).toMatch(/^[a-f0-9]{64}$/);
  expect(report.independentApproval).toBe('pending_identity_verification');
});
it('fails the release check on a critical false pass or an execution exception', () => {
  const { manifest, labels } = heldout();
  const falsePass = evaluateReviewedBenchmark(manifest, labels, () => 'pass');
  expect(falsePass.criticalFalsePasses).toBe(1);
  expect(falsePass.status).toBe('failed');
  const crash = evaluateReviewedBenchmark(manifest, labels, () => {
    throw Error('Failure');
  });
  expect(crash.status).toBe('failed');
  expect(crash.results.every((r) => r.actual === 'execution_error')).toBe(true);
});
it('rejects stale labels, omitted/duplicated labels, disguised self-review and future signatures', () => {
  const { manifest, labels } = heldout();
  for (const changed of [
    { ...labels, manifestHash: 'stale' },
    { ...labels, labels: [] },
    { ...labels, labels: [labels.labels[0], labels.labels[0]] },
    { ...labels, reviewer: ' SYNTHETIC CURATOR ' },
    { ...labels, signedAt: '2099-01-01' },
  ])
    expect(() => evaluateReviewedBenchmark(manifest, changed)).toThrow();
});
it('rejects duplicated frozen cases and incomplete metadata before a reviewer sees them', () => {
  const { manifest } = heldout();
  expect(() =>
    validateBenchmarkManifest({ ...manifest, cases: [manifest.cases[0], manifest.cases[0]] }),
  ).toThrow();
  const damaged = structuredClone(manifest);
  damaged.cases[0].scenario.documents[0].size = -1;
  expect(() => validateBenchmarkManifest(damaged)).toThrow();
});
it('uses independently supplied answers even when the authored answer differs', () => {
  const manifest = defaultBenchmark();
  // Synthetic test labels deliberately disagree; these are not real reviewer evidence.
  const labels = {
    version: '3',
    manifestHash: benchmarkHash(manifest),
    reviewer: 'Synthetic test reviewer',
    signedAt: new Date().toISOString(),
    independenceAttested: true,
    labels: manifest.cases.map((c) => ({
      id: c.id,
      expected: 'not_applicable',
      rationale: 'Deliberately different synthetic labels to test disagreement preservation.',
    })),
  };
  const report = evaluateReviewedBenchmark(manifest, labels, () => 'not_applicable');
  expect(report.status).toBe('adjudication_required');
  expect(report.disagreements.length).toBeGreaterThan(0);
  expect(report.matched).toBe(manifest.cases.length);
});
