import { consistencyConcerns } from './facts';
import { evidenceAnchors } from './model';
import type {
  Predicate,
  Profile,
  CheckState,
  Packet,
  DocumentRecord,
  RulePack,
  EvaluationRun,
  CheckResult,
  Requirement,
  EvidenceAnchor,
} from './model';
export const EVALUATOR_VERSION = '2.1.0';
export function applicability(predicate: Predicate, profile: Profile): boolean | null {
  if (predicate.op === 'always') return true;
  if (predicate.op === 'not') {
    const a = applicability(predicate.arg, profile);
    return a === null ? null : !a;
  }
  if (predicate.op === 'and' || predicate.op === 'or') {
    const values = predicate.args.map((p) => applicability(p, profile));
    if (predicate.op === 'and')
      return values.includes(false) ? false : values.includes(null) ? null : true;
    return values.includes(true) ? true : values.includes(null) ? null : false;
  }
  if (predicate.op === 'eq' || predicate.op === 'in') {
    const value = profile[predicate.field];
    if (!value || value === 'unknown') return null;
    return predicate.op === 'eq' ? value === predicate.value : predicate.values.includes(value);
  }
  return null;
}
function checkEvidence(
  packet: Packet,
  documents: DocumentRecord[],
  pack: RulePack,
  r: Requirement,
  link: EvidenceAnchor | undefined,
): CheckResult {
  const base: CheckResult = {
    requirementId: r.id,
    title: r.title,
    group: r.group,
    state: 'unknown',
    fileState: 'unknown',
    contentState: 'unknown',
    reason: 'Confirm the profile answer that determines whether this requirement applies.',
    sourceUrl: pack.sourceUrl,
    sourceSection: r.sourceSection,
    verification: 'none',
  };
  const applies = applicability(r.condition, packet.profile);
  if (applies === false)
    return {
      ...base,
      state: 'not_applicable',
      fileState: 'not_applicable',
      contentState: 'not_applicable',
      reason: 'Not required for your confirmed profile answers.',
    };
  if (applies === null) return base;
  const doc = link && documents.find((d) => d.id === link.documentId && d.packetId === packet.id);
  if (r.optional && !doc)
    return {
      ...base,
      state: 'not_applicable',
      fileState: 'not_applicable',
      contentState: 'not_applicable',
      reason: 'Optional evidence has not been supplied.',
    };
  if (!link || !doc)
    return {
      ...base,
      state: 'fail',
      reason: 'No supporting document is linked to this requirement.',
    };
  const evidence = {
    documentId: doc.id,
    name: doc.name,
    hash: doc.hash,
    pageFrom: link.pageFrom,
    pageTo: link.pageTo,
  };
  if (doc.status === 'processing')
    return {
      ...base,
      state: 'pending',
      fileState: 'pending',
      contentState: 'pending',
      reason: 'The linked file is still being inspected.',
      evidence,
    };
  if (doc.status === 'error')
    return {
      ...base,
      state: 'error',
      fileState: 'error',
      reason: doc.error || 'The file could not be safely inspected.',
      evidence,
    };
  if (
    (r.mime !== 'any' && doc.mime !== r.mime) ||
    (r.extension !== 'any' && !doc.name.toLowerCase().endsWith(r.extension))
  )
    return {
      ...base,
      state: 'fail',
      fileState: 'fail',
      reason: `This requirement expects ${r.extension.toUpperCase()} evidence. The linked file does not match its format and extension.`,
      evidence,
      verification: 'technical',
    };
  if (r.maxBytes && doc.size > r.maxBytes)
    return {
      ...base,
      state: 'fail',
      fileState: 'fail',
      reason: `The file exceeds the ${Math.round(r.maxBytes / 1024)} KB limit recorded in your checklist.`,
      evidence,
      verification: 'technical',
    };
  if (
    !Number.isInteger(link.pageFrom) ||
    !Number.isInteger(link.pageTo) ||
    link.pageFrom < 1 ||
    link.pageTo < link.pageFrom ||
    link.pageTo > doc.pageCount
  )
    return {
      ...base,
      state: 'fail',
      fileState: 'fail',
      reason: 'The linked page range is not available in this file.',
      evidence,
      verification: 'technical',
    };
  const fail = (reason: string): CheckResult => ({
    ...base,
    state: 'fail',
    fileState: 'fail',
    reason,
    evidence,
    verification: 'technical',
  });
  if (r.minBytes !== undefined && doc.size < r.minBytes)
    return fail(`The file is below the ${r.minBytes} byte minimum in this checklist.`);
  if (
    (r.minPages !== undefined && doc.pageCount < r.minPages) ||
    (r.maxPages !== undefined && doc.pageCount > r.maxPages)
  )
    return fail('The document page count is outside this checklist’s allowed range.');
  for (const [value, min, max, label] of [
    [doc.width, r.minWidth, r.maxWidth, 'width'],
    [doc.height, r.minHeight, r.maxHeight, 'height'],
  ] as const) {
    if (min === undefined && max === undefined) continue;
    if (value === undefined)
      return {
        ...base,
        state: 'needs_review',
        fileState: 'unknown',
        reason: `Image ${label} is unavailable for this evidence.`,
        evidence,
      };
    if ((min !== undefined && value < min) || (max !== undefined && value > max))
      return fail(`Image ${label} is outside this checklist’s allowed pixel range.`);
  }
  if (r.dateCheck) {
    const facts = (doc.facts || []).filter(
      (f) => f.kind === r.dateCheck!.field && f.page >= link.pageFrom && f.page <= link.pageTo,
    );
    const confirmed = facts.filter((f) => f.history.at(-1)?.confirmed);
    const values = [...new Set(confirmed.map((f) => f.value))];
    if (!values.length)
      return {
        ...base,
        state: 'needs_review',
        fileState: 'pass',
        contentState: 'unknown',
        reason: 'Confirm the date from the original evidence before evaluating this date rule.',
        evidence,
      };
    if (values.length > 1)
      return {
        ...base,
        state: 'needs_review',
        fileState: 'pass',
        reason: 'Confirmed dates conflict in the selected evidence. Inspect and resolve them.',
        evidence,
      };
    const value = values[0];
    const validDate = (v: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v;
    if (!validDate(value) || !validDate(r.dateCheck.reference))
      return {
        ...base,
        state: 'needs_review',
        fileState: 'pass',
        reason: 'The date is ambiguous. Confirm an exact calendar date in YYYY-MM-DD format.',
        evidence,
      };
    const passed =
      r.dateCheck.operation === 'on_or_before'
        ? value <= r.dateCheck.reference
        : value >= r.dateCheck.reference;
    if (!passed)
      return {
        ...fail(
          `The confirmed ${r.dateCheck.field.replace(/_/g, ' ')} ${value} does not meet the ${r.dateCheck.operation.replace(/_/g, ' ')} ${r.dateCheck.reference} rule.`,
        ),
        contentState: 'fail',
        verification: 'user',
      };
  }
  if (link.review === 'concern')
    return {
      ...base,
      state: 'needs_review',
      fileState: 'pass',
      contentState: 'needs_review',
      reason:
        'You flagged a content concern. Resolve it before treating this evidence as reviewed.',
      evidence,
      reviewNote: link.note,
      verification: 'user',
    };
  if (r.expectedText) {
    if (
      doc.pages.some(
        (p) =>
          p.number >= link.pageFrom &&
          p.number <= link.pageTo &&
          (p.warning || (p.method === 'ocr' && (p.confidence || 0) < 85)),
      )
    )
      return {
        ...base,
        state: 'needs_review',
        fileState: 'pass',
        contentState: 'unknown',
        reason:
          'Text extraction is uncertain or incomplete on the selected pages. Review the original before relying on a phrase check.',
        evidence,
      };
    const normalize = (text: string) =>
      text.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
    const selectedText = doc.pages
      .filter((p) => p.number >= link.pageFrom && p.number <= link.pageTo)
      .map((p) => p.text)
      .join(' ');
    if (!normalize(selectedText).includes(normalize(r.expectedText)))
      return {
        ...base,
        state: 'needs_review',
        fileState: 'pass',
        contentState: 'unknown',
        reason: `The phrase “${r.expectedText}” was not found in the extracted text of the selected pages. Inspect the original; extraction can miss visible text.`,
        evidence,
        verification: 'technical',
        reviewNote: link.note,
      };
  }
  if (link.review !== 'confirmed' || link.note.trim().length < 10)
    return {
      ...base,
      state: 'needs_review',
      fileState: 'pass',
      contentState: 'unknown',
      reason:
        'File format checked. Inspect its content against the instructions and record your review.',
      evidence,
      verification: 'technical',
    };
  return {
    ...base,
    state: 'pass',
    fileState: 'pass',
    contentState: 'pass',
    reason:
      'File format checked; content marked reviewed by you. Authenticity and institutional acceptance are not verified.',
    evidence,
    reviewNote: link.note,
    verification: 'user',
  };
}
export function evaluate(
  packet: Packet,
  documents: DocumentRecord[],
  pack: RulePack,
  id: string,
  now = new Date().toISOString(),
): EvaluationRun {
  const checks: CheckResult[] = pack.requirements.map((r) => {
    const anchors = evidenceAnchors(packet.links[r.id]);
    if (!anchors.length) return checkEvidence(packet, documents, pack, r, undefined);
    const results = anchors.map((link) => checkEvidence(packet, documents, pack, r, link));
    if (
      results[0].state === 'not_applicable' ||
      applicability(r.condition, packet.profile) === null
    )
      return results[0];
    const slots = r.evidenceSlots || [];
    const all = r.evidenceMode !== 'any';
    const covered = slots.every((slot) =>
      anchors.some((a, i) => a.slot === slot && results[i].state === 'pass'),
    );
    const missingSlots = slots.filter((slot) => !anchors.some((a) => a.slot === slot));
    const priority: CheckState[] = all
      ? ['fail', 'error', 'pending', 'unknown', 'needs_review', 'pass']
      : ['pass', 'needs_review', 'unknown', 'pending', 'error', 'fail'];
    const selected = priority.map((state) => results.find((c) => c.state === state)).find(Boolean)!;
    const result: CheckResult = {
      ...selected,
      evidenceSet: results.flatMap((c, i) =>
        c.evidence
          ? [{ ...c.evidence, slot: anchors[i].slot, state: c.state, reason: c.reason }]
          : [],
      ),
    };
    if (missingSlots.length && all) {
      result.state = 'fail';
      result.contentState = 'unknown';
      result.reason = `Missing required evidence: ${missingSlots.join(', ')}.`;
    } else if (all && slots.length && !covered && result.state === 'pass') {
      result.state = 'needs_review';
      result.contentState = 'unknown';
      result.reason = 'Review the evidence assigned to every required component.';
    } else if (all && result.state === 'pass' && results.length > 1)
      result.reason =
        'All linked evidence passed the supported technical checks and was reviewed by you.';
    result.factRevisions = anchors.flatMap((a) =>
      (documents.find((d) => d.id === a.documentId)?.facts || [])
        .filter((f) => f.page >= a.pageFrom && f.page <= a.pageTo && f.history.at(-1)?.confirmed)
        .map((f) => ({
          documentId: a.documentId,
          factId: f.id,
          revision: f.history.at(-1)!.revision,
          value: f.value,
          page: f.page,
        })),
    );
    return result;
  });

  const counts: Record<CheckState, number> = {
    pass: 0,
    fail: 0,
    unknown: 0,
    needs_review: 0,
    not_applicable: 0,
    pending: 0,
    error: 0,
  };
  checks.forEach((c) => counts[c.state]++);
  const concerns = consistencyConcerns(documents);
  const summary =
    counts.fail || counts.error
      ? 'action_required'
      : counts.pending
        ? 'processing'
        : counts.unknown || counts.needs_review || concerns.length
          ? 'review_required'
          : 'ready_for_supported_checks';
  return {
    id,
    packetId: packet.id,
    packetRevision: packet.revision,
    packVersion: pack.version,
    evaluatorVersion: EVALUATOR_VERSION,
    createdAt: now,
    summary,
    checks,
    limitations: pack.limitations,
    sourceSnapshots: pack.sources,
    sourceObligations: pack.obligations,
    consistencyConcerns: concerns,
    counts,
    checklist: {
      id: pack.id,
      title: pack.title,
      sourceUrl: pack.sourceUrl,
      assurance: pack.assurance,
    },
  };
}
