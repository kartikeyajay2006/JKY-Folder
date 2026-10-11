import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import negativeCorpus from '../tests/fixtures/benchmark-v1.json' with { type: 'json' };
import contractCorpus from '../tests/fixtures/benchmark-v2.json' with { type: 'json' };
import { evaluate, EVALUATOR_VERSION } from '../shared/evaluate';
import type { CheckState, DocumentRecord, Packet, RulePack } from '../shared/model';
import { requirementsSchema } from './application-schema';
import { benchmarkScenario, type BenchmarkInput, type BenchmarkScenario } from './benchmark-cases';
import { reviewerIdentity } from './pack-validation';
import { benchmarkWorkbook } from './review-workbook';
import { evidenceHash } from './review-integrity';

export const benchmarkHash = evidenceHash;
const states = z.enum([
  'pass',
  'fail',
  'unknown',
  'needs_review',
  'not_applicable',
  'pending',
  'error',
]);
export interface BenchmarkManifest {
  version: '3';
  author: string;
  purpose: string;
  sourceScope?: { packId: string; version: string; scopeHash: string };
  cases: { id: string; scenario: BenchmarkScenario }[];
}

function boundaryCases(): { input: BenchmarkInput; expected: CheckState }[] {
  const rows: { input: BenchmarkInput; expected: CheckState }[] = [];
  for (const [minimum, maximum, field, value] of [
    ['minBytes', 'maxBytes', 'size', 1000],
    ['minPages', 'maxPages', 'pageCount', 2],
    ['minWidth', 'maxWidth', 'width', 600],
    ['minHeight', 'maxHeight', 'height', 800],
  ] as const) {
    for (const delta of [-1, 0, 1])
      rows.push({
        input: {
          requirement: { [minimum]: value, [maximum]: value },
          document: { [field]: value + delta },
        },
        expected: delta === 0 ? 'pass' : 'fail',
      });
    rows.push({
      input: { requirement: { [minimum]: value }, document: { [field]: value + 1 } },
      expected: 'pass',
    });
    rows.push({
      input: { requirement: { [maximum]: value }, document: { [field]: value - 1 } },
      expected: 'pass',
    });
  }
  for (const operation of ['on_or_before', 'on_or_after'] as const)
    for (const [date, direction] of [
      ['2026-10-09', -1],
      ['2026-10-10', 0],
      ['2026-10-11', 1],
    ] as const)
      rows.push({
        input: {
          requirement: { dateCheck: { field: 'issue_date', operation, reference: '2026-10-10' } },
          date,
        },
        expected:
          direction === 0 || (operation === 'on_or_before' ? direction < 0 : direction > 0)
            ? 'pass'
            : 'fail',
      });
  return rows;
}

/** Keep the author key private to this module. Exported cases have opaque names and complete inputs. */
function corpusRows() {
  const rows = [
    ...negativeCorpus.cases.map((c) => ({
      scenario: benchmarkScenario(c as unknown as BenchmarkInput, true),
      expected: c.expected as CheckState,
    })),
    ...contractCorpus.cases.map((c) => ({
      scenario: benchmarkScenario(c as unknown as BenchmarkInput),
      expected: c.expected as CheckState,
    })),
    ...boundaryCases().map((c) => ({ scenario: benchmarkScenario(c.input), expected: c.expected })),
  ];
  const unique = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const hash = benchmarkHash(row.scenario);
    if (unique.has(hash) && unique.get(hash)!.expected !== row.expected)
      throw Error('The authored corpus assigns conflicting states to the same input.');
    unique.set(hash, row);
  }
  return [...unique.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, row], i) => ({ ...row, id: 'case-' + String(i + 1).padStart(4, '0') }));
}
export function defaultBenchmark(): BenchmarkManifest {
  return {
    version: '3',
    author: contractCorpus.author,
    purpose:
      'Synthetic deterministic evaluator checks; labels require independent review. Original-file parsing and official source completeness are separate assurance gates.',
    cases: corpusRows().map(({ id, scenario }) => ({ id, scenario })),
  };
}

/** Internal regression evidence only; deliberately cannot produce independent approval. */
export function runAuthoredRegression() {
  const results = corpusRows().map((c) => ({
    id: c.id,
    expected: c.expected,
    actual: evaluate(c.scenario.packet, c.scenario.documents, c.scenario.pack, 'regression')
      .checks[0].state,
  }));
  const mismatches = results.filter((r) => r.actual !== r.expected);
  return {
    status: mismatches.length ? 'failed' : 'passed',
    total: results.length,
    mismatches,
    independentApproval: 'not_independent',
    provenance: 'Author-labelled synthetic regression; not a release sign-off.',
  };
}

/** Reject incomplete/malformed frozen inputs before asking a reviewer to label them. */
export function validateBenchmarkManifest(input: unknown): BenchmarkManifest {
  const manifest = z
    .object({
      version: z.literal('3'),
      author: z.string().trim().min(2).max(100),
      purpose: z.string().trim().min(20).max(2000),
      sourceScope: z
        .object({
          packId: z.string().min(1),
          version: z.string().min(1),
          scopeHash: z.string().regex(/^[a-f0-9]{64}$/),
        })
        .strict()
        .optional(),
      cases: z
        .array(
          z
            .object({
              id: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
              scenario: z
                .object({
                  packet: z.custom<Packet>((v) => !!v && typeof v === 'object'),
                  documents: z
                    .array(z.custom<DocumentRecord>((v) => !!v && typeof v === 'object'))
                    .max(10),
                  pack: z.custom<RulePack>((v) => !!v && typeof v === 'object'),
                })
                .strict(),
            })
            .strict(),
        )
        .min(1)
        .max(2000),
    })
    .strict()
    .parse(input);
  if (new Set(manifest.cases.map((c) => c.id)).size !== manifest.cases.length)
    throw Error('Frozen case identifiers must be unique.');
  for (const {
    scenario: { packet, documents, pack },
  } of manifest.cases) {
    requirementsSchema.parse(pack.requirements);
    if (
      pack.requirements.length !== 1 ||
      !packet.id ||
      !packet.profile ||
      !packet.links ||
      packet.packId !== pack.id ||
      !Number.isSafeInteger(packet.revision) ||
      packet.revision < 1 ||
      new Set(documents.map((d) => d.id)).size !== documents.length
    )
      throw Error('Each benchmark case needs a valid packet and one atomic requirement.');
    for (const d of documents)
      if (
        !d.id ||
        !d.packetId ||
        !d.name ||
        !d.mime ||
        !['ready', 'processing', 'error'].includes(d.status) ||
        !Number.isSafeInteger(d.size) ||
        d.size < 0 ||
        !Array.isArray(d.pages) ||
        d.pages.some(
          (p) => !Number.isInteger(p.number) || p.number < 1 || typeof p.text !== 'string',
        )
      )
        throw Error('Benchmark original metadata is incomplete.');
  }
  return manifest;
}

export function evaluateReviewedBenchmark(
  manifestInput: unknown,
  labelInput: unknown,
  runner: (scenario: BenchmarkScenario) => CheckState = (s) =>
    evaluate(s.packet, s.documents, s.pack, 'benchmark').checks[0].state,
) {
  const manifest = validateBenchmarkManifest(manifestInput);
  const labels = z
    .object({
      version: z.literal('3'),
      manifestHash: z.literal(benchmarkHash(manifest)),
      reviewer: z.string().trim().min(2).max(100),
      independenceAttested: z.literal(true),
      signedAt: z.string().min(10),
      labels: z
        .array(
          z
            .object({
              id: z.string(),
              expected: states,
              rationale: z.string().trim().min(20).max(2000),
            })
            .strict(),
        )
        .min(1)
        .max(2000),
    })
    .strict()
    .parse(labelInput);
  if (
    reviewerIdentity(labels.reviewer) === reviewerIdentity(manifest.author) ||
    Number.isNaN(Date.parse(labels.signedAt)) ||
    Date.parse(labels.signedAt) > Date.now() + 5 * 60000
  )
    throw Error('Independent, dated reviewer labels are required.');
  if (
    labels.labels.length !== manifest.cases.length ||
    new Set(labels.labels.map((l) => l.id)).size !== manifest.cases.length ||
    labels.labels.some((l) => !manifest.cases.some((c) => c.id === l.id))
  )
    throw Error('Exactly one reviewer label is required for every frozen case.');
  const byId = new Map(labels.labels.map((l) => [l.id, l]));
  const matchesAuthoredManifest = benchmarkHash(manifest) === benchmarkHash(defaultBenchmark());
  const authorLabels = matchesAuthoredManifest
    ? new Map(corpusRows().map((c) => [c.id, c.expected]))
    : new Map<string, CheckState>();
  const results = manifest.cases.map((c) => {
    const label = byId.get(c.id)!;
    let actual: CheckState | 'execution_error';
    try {
      actual = runner(c.scenario);
      if (!states.safeParse(actual).success) actual = 'execution_error';
    } catch {
      actual = 'execution_error';
    }
    return {
      id: c.id,
      expected: label.expected,
      actual,
      matched: actual === label.expected,
      criticalFalsePass: actual === 'pass' && label.expected !== 'pass',
      rationale: label.rationale,
      ...(authorLabels.has(c.id) ? { authorLabel: authorLabels.get(c.id) } : {}),
    };
  });
  const disagreements = results.filter(
    (r) => r.authorLabel !== undefined && r.authorLabel !== r.expected,
  );
  const mismatches = results.filter((r) => !r.matched);
  const criticalFalsePasses = results.filter((r) => r.criticalFalsePass).length;
  const evaluatorSourcesHash = createHash('sha256');
  for (const file of ['evaluate.ts', 'facts.ts', 'identity.ts', 'classify.ts', 'model.ts'])
    evaluatorSourcesHash
      .update(file)
      .update(readFileSync(new URL('../shared/' + file, import.meta.url)));
  const confusion: Record<string, Record<string, number>> = {};
  for (const result of results) {
    confusion[result.expected] ||= {};
    confusion[result.expected][result.actual] =
      (confusion[result.expected][result.actual] || 0) + 1;
  }
  return {
    version: '3',
    manifestHash: benchmarkHash(manifest),
    labelsHash: benchmarkHash(labels),
    reviewer: labels.reviewer,
    signedAt: labels.signedAt,
    evaluatedAt: new Date().toISOString(),
    evaluatorVersion: EVALUATOR_VERSION,
    evaluatorSourcesHash: evaluatorSourcesHash.digest('hex'),
    total: results.length,
    matched: results.length - mismatches.length,
    criticalFalsePasses,
    confusion,
    disagreements,
    results,
    status:
      criticalFalsePasses || mismatches.length
        ? 'failed'
        : disagreements.length
          ? 'adjudication_required'
          : 'checks_passed',
    independentApproval: 'pending_identity_verification',
    limitations: [
      'Typed reviewer attribution and an independence attestation are not identity verification.',
      'Public regression inputs are not a private held-out set. Use freeze for separately authored private cases.',
      manifest.purpose,
    ],
  };
}

function privateJson(file: string, value: unknown) {
  writeFileSync(file, JSON.stringify(value, null, 2), { mode: 0o600, flag: 'wx' });
}
if (process.argv[1]?.endsWith('benchmark-runner.ts')) {
  const [command, file, other, output] = process.argv.slice(2);
  if (command === 'regression') {
    const report = runAuthoredRegression();
    if (file) privateJson(file, report);
    console.log(JSON.stringify(report));
    if (report.status !== 'passed') process.exitCode = 1;
  } else if (command === 'export' && file) {
    const manifest = defaultBenchmark();
    privateJson(file, {
      manifest,
      manifestHash: benchmarkHash(manifest),
      labelTemplate: {
        version: '3',
        manifestHash: benchmarkHash(manifest),
        reviewer: '',
        independenceAttested: false,
        signedAt: '',
        labels: manifest.cases.map((c) => ({ id: c.id, expected: '', rationale: '' })),
      },
    });
  } else if (command === 'freeze' && file && other) {
    const manifest = validateBenchmarkManifest(JSON.parse(readFileSync(file, 'utf8')));
    privateJson(other, { manifest, manifestHash: benchmarkHash(manifest) });
  } else if (command === 'sheet' && file && other) {
    const blind = JSON.parse(readFileSync(file, 'utf8'));
    const manifest = validateBenchmarkManifest(blind.manifest);
    if (benchmarkHash(manifest) !== blind.manifestHash)
      throw Error('Frozen manifest integrity failed.');
    writeFileSync(other, benchmarkWorkbook(blind), { mode: 0o600, flag: 'wx' });
  } else if (command === 'evaluate' && file && other && output) {
    const blind = JSON.parse(readFileSync(file, 'utf8'));
    if (benchmarkHash(blind.manifest) !== blind.manifestHash)
      throw Error('Frozen manifest integrity failed.');
    const report = evaluateReviewedBenchmark(
      blind.manifest,
      JSON.parse(readFileSync(other, 'utf8')),
    );
    privateJson(output, report);
    console.log(
      JSON.stringify({
        status: report.status,
        total: report.total,
        matched: report.matched,
        criticalFalsePasses: report.criticalFalsePasses,
        independentApproval: report.independentApproval,
      }),
    );
    if (report.status !== 'checks_passed') process.exitCode = 1;
  } else
    throw Error(
      'Use export <blind.json>, freeze <private-cases.json> <blind.json>, sheet <blind.json> <workbook.html>, or evaluate <blind.json> <labels.json> <report.json>.',
    );
}
