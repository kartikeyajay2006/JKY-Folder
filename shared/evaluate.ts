import type {
  Predicate,
  Profile,
  CheckState,
  Packet,
  DocumentRecord,
  RulePack,
  EvaluationRun,
  CheckResult,
} from './model';
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
export function evaluate(
  packet: Packet,
  documents: DocumentRecord[],
  pack: RulePack,
  id: string,
  now = new Date().toISOString(),
): EvaluationRun {
  const checks: CheckResult[] = pack.requirements.map((r) => {
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
    const link = packet.links[r.id];
    const doc = link && documents.find((d) => d.id === link.documentId && d.packetId === packet.id);
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
    if (doc.mime !== r.mime || !doc.name.toLowerCase().endsWith(r.extension))
      return {
        ...base,
        state: 'fail',
        fileState: 'fail',
        reason: `This requirement expects ${r.extension.toUpperCase()} evidence. The linked file does not match its format and extension.`,
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
  const summary =
    counts.fail || counts.error
      ? 'action_required'
      : counts.pending
        ? 'processing'
        : counts.unknown || counts.needs_review
          ? 'review_required'
          : 'ready_for_supported_checks';
  return {
    id,
    packetId: packet.id,
    packetRevision: packet.revision,
    packVersion: pack.version,
    evaluatorVersion: '1.0.0',
    createdAt: now,
    summary,
    checks,
    limitations: pack.limitations,
    counts,
  };
}
