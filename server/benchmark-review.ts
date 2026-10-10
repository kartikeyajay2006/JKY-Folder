import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import corpus from '../tests/fixtures/benchmark-v2.json';
const digest = (v: unknown) => createHash('sha256').update(JSON.stringify(v)).digest('hex');
export const blindBenchmark = () => ({
  version: corpus.version,
  author: corpus.author,
  cases: corpus.cases.map(({ expected, rationale, ...c }) => c),
});
export function adjudicateBenchmark(input: unknown) {
  const manifest = blindBenchmark();
  const labels = z
    .object({
      version: z.literal(corpus.version),
      manifestHash: z.literal(digest(manifest)),
      reviewer: z.string().trim().min(2).max(100),
      independenceAttested: z.literal(true),
      labels: z.array(
        z
          .object({
            id: z.string(),
            expected: z.enum([
              'pass',
              'fail',
              'unknown',
              'needs_review',
              'not_applicable',
              'pending',
              'error',
            ]),
            rationale: z.string().trim().min(20).max(2000),
          })
          .strict(),
      ),
    })
    .strict()
    .parse(input);
  if (labels.reviewer.toLowerCase() === corpus.author.toLowerCase())
    throw Error('A separate reviewer must label the blind packet set.');
  if (
    labels.labels.length !== corpus.cases.length ||
    new Set(labels.labels.map((l) => l.id)).size !== corpus.cases.length ||
    labels.labels.some((l) => !corpus.cases.some((c) => c.id === l.id))
  )
    throw Error('Exactly one independent label is required for every case.');
  const disagreements = labels.labels.flatMap((l) => {
    const original = corpus.cases.find((c) => c.id === l.id)!;
    return l.expected === original.expected
      ? []
      : [
          {
            id: l.id,
            authorLabel: original.expected,
            reviewerLabel: l.expected,
            reviewerRationale: l.rationale,
          },
        ];
  });
  return {
    ...labels,
    recordedAt: new Date().toISOString(),
    status: disagreements.length ? 'adjudication_required' : 'reviewer_labels_recorded',
    disagreements,
    identityNote:
      'Operator must verify the reviewer identity and retain signed review evidence. Actor strings alone cannot establish independence.',
  };
}
if (process.argv[1]?.endsWith('benchmark-review.ts')) {
  const [command, file, out] = process.argv.slice(2);
  if (command === 'export' && file) {
    const manifest = blindBenchmark();
    writeFileSync(
      file,
      JSON.stringify(
        {
          manifest,
          manifestHash: digest(manifest),
          labelTemplate: {
            version: corpus.version,
            manifestHash: digest(manifest),
            reviewer: '',
            independenceAttested: false,
            labels: manifest.cases.map((c) => ({ id: c.id, expected: '', rationale: '' })),
          },
        },
        null,
        2,
      ),
    );
  } else if (command === 'adjudicate' && file && out)
    writeFileSync(
      out,
      JSON.stringify(adjudicateBenchmark(JSON.parse(readFileSync(file, 'utf8'))), null, 2),
    );
  else
    throw Error(
      'Use export <blind-output.json> or adjudicate <reviewer-labels.json> <report.json>.',
    );
}
