import { z } from 'zod';
import type { Store } from './store';
import {
  evaluateReviewedBenchmark,
  validateBenchmarkManifest,
  benchmarkHash,
} from './benchmark-runner';
import { reviewerIdentity } from './pack-validation';
import { verifyReview } from './reviewer-identity';
import { evidenceHash } from './review-integrity';

/** Only signed, identity-registered labels can authorize a correctness gate. */
export function approveBenchmark(
  store: Store,
  manifestInput: unknown,
  signedLabels: unknown,
  signedAdjudication?: unknown,
) {
  const manifest = validateBenchmarkManifest(manifestInput);
  const verified = verifyReview(store, signedLabels, 'benchmark');
  const original = evaluateReviewedBenchmark(manifest, verified.payload);
  if (original.labelsHash !== evidenceHash(verified.payload))
    throw Error('Sign normalized reviewer labels without changing their contents.');
  let report = original;
  let adjudication: ReturnType<typeof verifyReview> | undefined;
  if (original.disagreements.length) {
    if (!signedAdjudication)
      throw Error('Author/reviewer disagreements require a separately signed adjudication.');
    adjudication = verifyReview(store, signedAdjudication, 'adjudication');
    const decision = z
      .object({
        reviewer: z.string().trim().min(2),
        independenceAttested: z.literal(true),
        signedAt: z.string(),
        manifestHash: z.literal(benchmarkHash(manifest)),
        labelsHash: z.literal(original.labelsHash),
        decisions: z
          .array(
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
                rationale: z.string().trim().min(40).max(2000),
              })
              .strict(),
          )
          .min(1),
      })
      .strict()
      .parse(adjudication.payload);
    if (
      [manifest.author, original.reviewer].some(
        (a) => reviewerIdentity(a) === reviewerIdentity(decision.reviewer),
      ) ||
      Number.isNaN(Date.parse(decision.signedAt)) ||
      Date.parse(decision.signedAt) > Date.now() + 5 * 60000 ||
      decision.decisions.length !== original.disagreements.length ||
      new Set(decision.decisions.map((d) => d.id)).size !== original.disagreements.length ||
      decision.decisions.some(
        (d) =>
          !original.disagreements.some(
            (r) => r.id === d.id && [r.expected, r.authorLabel].includes(d.expected),
          ),
      )
    )
      throw Error(
        'A third reviewer must resolve every exact disagreement against the original labels and manifest.',
      );
    const replacements = new Map(decision.decisions.map((d) => [d.id, d]));
    const raw = verified.payload as {
      labels: { id: string; expected: string; rationale: string }[];
    } & Record<string, unknown>;
    report = evaluateReviewedBenchmark(manifest, {
      ...raw,
      labels: raw.labels.map((l) =>
        replacements.has(l.id)
          ? {
              id: l.id,
              expected: replacements.get(l.id)!.expected,
              rationale: replacements.get(l.id)!.rationale,
            }
          : l,
      ),
    });
  } else if (signedAdjudication)
    throw Error('There are no author/reviewer disagreements to adjudicate.');
  // Adjudication may resolve label disagreements, but cannot waive an observed failure.
  if (report.matched !== report.total || report.criticalFalsePasses !== 0)
    throw Error('Correctness approval requires zero mismatches and zero critical false passes.');
  return {
    ...report,
    status: 'approved',
    independentApproval: 'registered_reviewer_signature',
    reviewerSignature: verified.proof,
    reviewerLabels: verified.payload,
    originalLabelsHash: original.labelsHash,
    originalReviewResults: original.results,
    unresolvedDisagreements: [],
    ...(adjudication
      ? { adjudication: adjudication.payload, adjudicationSignature: adjudication.proof }
      : {}),
    limitations: [
      'Signature verification proves possession of the registered key. The operator must verify the reviewer identity and independence.',
      manifest.purpose,
    ],
  };
}
