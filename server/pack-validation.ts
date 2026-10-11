import { createHash } from 'node:crypto';
import { z } from 'zod';
import type { RulePack, SourceSnapshot, PackReviewRecord } from '../shared/model';
import { requirementsSchema } from './application-schema';

export const reviewerIdentity = (value: string) =>
  value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();

/** Bind approval to both the executable rules and the claims applicants will see. */
export function packScopeHash(pack: RulePack) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        id: pack.id,
        version: pack.version,
        title: pack.title,
        cycle: pack.cycle,
        stage: pack.stage,
        sourceUrl: pack.sourceUrl,
        checkedAt: pack.checkedAt,
        assurance: pack.assurance,
        authoredBy: pack.authoredBy,
        limitations: pack.limitations,
        sources: pack.sources,
        requirements: pack.requirements,
        obligations: pack.obligations,
        coverage: pack.coverage,
      }),
    )
    .digest('hex');
}

function unique(rows: { id: string }[], label: string) {
  if (rows.some((r) => !r.id?.trim()) || new Set(rows.map((r) => r.id)).size !== rows.length)
    throw Error(`${label} identifiers must be present and unique.`);
}

function range(anchor: string, source: SourceSnapshot) {
  const [id, start, length, extra] = anchor.split(':');
  if (
    extra !== undefined ||
    id !== source.id ||
    !/^\d+$/.test(start || '') ||
    !/^\d+$/.test(length || '') ||
    Number(length) < 1 ||
    !Number.isSafeInteger(Number(start) + Number(length)) ||
    Number(start) + Number(length) > (source.content?.length || 0)
  )
    throw Error('Source anchors must identify exact, nonempty snapshot text ranges.');
  return { start: Number(start), end: Number(start) + Number(length) };
}

/** Structural completeness is necessary; it never proves a human read the source correctly. */
export function validatePackSources(pack: RulePack, snapshots: SourceSnapshot[]) {
  requirementsSchema.parse(pack.requirements);
  if (
    !pack.id?.trim() ||
    !pack.version?.trim() ||
    !pack.title?.trim() ||
    !pack.stage?.trim() ||
    !pack.cycle?.trim() ||
    !pack.sources?.length ||
    !pack.obligations?.length ||
    !pack.coverage?.length
  )
    throw Error(
      'Pack identity, cycle, stage, sources, obligations and full coverage are required.',
    );
  unique(pack.sources, 'Source');
  unique(pack.obligations, 'Obligation');
  unique(pack.coverage, 'Coverage section');
  unique(snapshots, 'Snapshot');
  const sourceMap = new Map<string, SourceSnapshot>();
  for (const pinned of pack.sources) {
    const actual = snapshots.find((s) => s.id === pinned.id);
    const url = new URL(pinned.url);
    if (
      !actual?.content?.trim() ||
      actual.sha256 !== pinned.sha256 ||
      actual.url !== pinned.url ||
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      !pinned.title?.trim() ||
      Number.isNaN(Date.parse(pinned.retrievedAt)) ||
      createHash('sha256').update(actual.content).digest('hex') !== pinned.sha256
    )
      throw Error('Sources must match current captured snapshots and their content integrity.');
    sourceMap.set(pinned.id, actual);
  }
  for (const obligation of pack.obligations) {
    const source = sourceMap.get(obligation.sourceId);
    if (
      !source ||
      !obligation.instruction?.trim() ||
      !obligation.rationale?.trim() ||
      !['implemented', 'review_only', 'unsupported'].includes(obligation.disposition) ||
      new Set(obligation.requirementIds).size !== obligation.requirementIds.length ||
      obligation.requirementIds.some((id) => !pack.requirements.some((r) => r.id === id)) ||
      (obligation.disposition !== 'unsupported' && !obligation.requirementIds.length)
    )
      throw Error(
        'Every obligation needs a source, disposition, rationale and valid requirement mapping.',
      );
    range(obligation.anchor, source);
  }
  for (const requirement of pack.requirements)
    if (
      !requirement.sourceAnchor ||
      !pack.obligations.some(
        (o) => o.requirementIds.includes(requirement.id) && o.anchor === requirement.sourceAnchor,
      )
    )
      throw Error('Every requirement needs an exact source anchor and obligation mapping.');
  for (const section of pack.coverage) {
    const source = sourceMap.get(section.sourceId);
    if (
      !source ||
      !section.title?.trim() ||
      !['in_scope', 'out_of_scope'].includes(section.disposition) ||
      !section.obligationIds.length ||
      new Set(section.obligationIds).size !== section.obligationIds.length ||
      section.obligationIds.some(
        (id) => !pack.obligations!.some((o) => o.id === id && o.sourceId === section.sourceId),
      )
    )
      throw Error('Coverage requires source ranges and unique mapped obligation IDs.');
    range(section.anchor, source);
  }
  if (pack.obligations.some((o) => !pack.coverage!.some((c) => c.obligationIds.includes(o.id))))
    throw Error('Coverage must include every obligation, including unsupported obligations.');
  // Union the ranges; uncovered punctuation/words count as omissions, whitespace separators do not.
  for (const source of sourceMap.values()) {
    const ranges = pack.coverage
      .filter((s) => s.sourceId === source.id)
      .map((s) => range(s.anchor, source))
      .sort((a, b) => a.start - b.start);
    let end = 0;
    for (const current of ranges) {
      if (current.start > end && source.content!.slice(end, current.start).trim())
        throw Error(`Coverage omits source text in ${source.id}.`);
      end = Math.max(end, current.end);
    }
    if (source.content!.slice(end).trim())
      throw Error(`Coverage omits source text in ${source.id}.`);
  }
  return {
    sources: pack.sources.length,
    requirements: pack.requirements.length,
    obligations: pack.obligations.length,
    sections: pack.coverage.length,
    unsupported: pack.obligations.filter((o) => o.disposition === 'unsupported').length,
    scopeHash: packScopeHash(pack),
  };
}

export function validatePackReview(
  pack: RulePack,
  actor: string,
  input: unknown,
): PackReviewRecord {
  const record = z
    .object({
      reviewer: z.string().trim().min(2).max(100),
      scopeHash: z.string().regex(/^[a-f0-9]{64}$/),
      signedAt: z.string().min(10),
      independenceAttested: z.literal(true),
      decisions: z
        .array(
          z
            .object({
              sectionId: z.string(),
              accepted: z.boolean(),
              note: z.string().trim().min(20).max(2000),
            })
            .strict(),
        )
        .min(1)
        .max(500),
    })
    .strict()
    .parse(input);
  if (
    !reviewerIdentity(actor) ||
    reviewerIdentity(actor) === reviewerIdentity(pack.authoredBy || '') ||
    reviewerIdentity(record.reviewer) !== reviewerIdentity(actor) ||
    record.scopeHash !== packScopeHash(pack) ||
    Number.isNaN(Date.parse(record.signedAt)) ||
    Date.parse(record.signedAt) > Date.now() + 5 * 60000
  )
    throw Error(
      'A dated independent review of the exact pack identity, scope and rules is required.',
    );
  if (
    !pack.coverage?.length ||
    record.decisions.length !== pack.coverage.length ||
    new Set(record.decisions.map((d) => d.sectionId)).size !== pack.coverage.length ||
    pack.coverage.some((c) => !record.decisions.some((d) => d.sectionId === c.id && d.accepted))
  )
    throw Error(
      'Every coverage section requires an accepted decision and substantive reviewer note.',
    );
  return record;
}
