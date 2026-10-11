import { createHash } from 'node:crypto';
import type { Store } from './store';
import type { Packet, RulePack, SourceSnapshot } from '../shared/model';
import { packs } from '../shared/packs';
import { requirementsSchema } from './application-schema';
import { reviewerIdentity, validatePackSources, validatePackReview } from './pack-validation';
export { packScopeHash } from './pack-validation';
import { hasSignedReview, verifyReview } from './reviewer-identity';
import { evidenceHash } from './review-integrity';
export const digest = (content: string | Buffer) =>
  createHash('sha256').update(content).digest('hex');
export function availablePacks(store: Store): RulePack[] {
  const revisions = (
    store.db
      .prepare(
        "SELECT payload FROM pack_revisions WHERE state IN ('published','retired') ORDER BY rowid",
      )
      .all() as { payload: string }[]
  ).map((r) => JSON.parse(r.payload) as RulePack);
  const latest = new Map(packs.map((p) => [p.id, p]));
  for (const p of revisions) {
    if (p.lifecycle === 'retired') latest.delete(p.id);
    else {
      try {
        if (!p.reviewSignature || !p.reviewRecord) throw Error('Unverified approval.');
        verifyReview(store, { ...p.reviewSignature, payload: p.reviewRecord }, 'pack');
        validatePackReview(p, p.reviewedBy || '', p.reviewRecord);
        validatePackSources(p, capturedSources(store, p));
        latest.set(p.id, p);
      } catch {
        latest.delete(p.id);
      }
    }
  }
  return [...latest.values()];
}
export const isUploadPacket = (p: Packet) => p.mode !== 'instructions';
export function uploadedFilePack(store: Store, packet: Packet): RulePack {
  const documents = store.documents(packet.id);
  return {
    id: 'uploads-' + packet.id,
    version: 'uploads.' + packet.revision,
    title: 'Your uploaded files',
    cycle: '',
    stage: 'Document review',
    sourceUrl: '',
    checkedAt: packet.updatedAt,
    assurance: 'user_defined',
    requirements: documents.map((doc) => ({
      id: 'upload-' + doc.id,
      title: doc.name,
      description:
        'Inspect this uploaded original for legibility and accuracy. No application requirements are inferred from the file.',
      group: 'Supporting evidence',
      condition: { op: 'always' },
      mime: 'any',
      extension: 'any',
      sourceSection: 'Your uploaded original',
      reviewHint: 'Review only the document you supplied and record what you checked.',
    })),
    limitations: [
      'This checklist contains only your uploaded files. It does not check an institution’s required documents.',
      'Add your actual application instructions explicitly to check completeness.',
      'Content confirmations record your review, not authenticity or institutional acceptance.',
    ],
  };
}
export function resolvePack(store: Store, packet: Packet): RulePack {
  if (isUploadPacket(packet)) return uploadedFilePack(store, packet);
  const result =
    packet.customPack ||
    packet.packSnapshot ||
    availablePacks(store).find((p) => p.id === packet.packId);
  if (!result) throw Error('The selected checklist is unavailable.');
  return result;
}
export function sourceChanged(store: Store, packet: Packet) {
  if (isUploadPacket(packet)) return false;
  if (packet.customPack) {
    const source = packet.customPack.instructionSource;
    return (
      !!source &&
      !store
        .documents(packet.id)
        .some((d) => d.id === source.documentId && d.hash === source.sha256 && d.status === 'ready')
    );
  }
  const current = availablePacks(store).find((p) => p.id === packet.packId);
  const selected = resolvePack(store, packet);
  if (!current || current.version !== selected.version) return true;
  return (selected.sources || []).some((s) => {
    const row = store.db.prepare('SELECT payload FROM source_snapshots WHERE id=?').get(s.id) as
      { payload: string } | undefined;
    return !!row && (JSON.parse(row.payload) as SourceSnapshot).sha256 !== s.sha256;
  });
}
export function saveDraft(store: Store, pack: RulePack, actor: string) {
  if (!actor.trim() || !pack.id || !pack.version || !pack.title || !pack.cycle || !pack.stage)
    throw Error('Author, pack identity, cycle and stage are required.');
  requirementsSchema.parse(pack.requirements);
  const draft = {
    ...pack,
    reviewRecord: undefined,
    reviewSignature: undefined,
    lifecycle: 'draft' as const,
    authoredBy: actor,
    reviewedBy: undefined,
    reviewedAt: undefined,
  };
  store.db
    .prepare('INSERT INTO pack_revisions VALUES(?,?,?,?)')
    .run(pack.id, pack.version, 'draft', JSON.stringify(draft));
  return draft;
}
export function transitionPack(
  store: Store,
  id: string,
  version: string,
  action: 'review' | 'publish' | 'retire',
  actor: string,
  reviewRecord?: unknown,
) {
  return store.db.transaction(() =>
    transitionInTransaction(store, id, version, action, actor, reviewRecord),
  )();
}
function transitionInTransaction(
  store: Store,
  id: string,
  version: string,
  action: 'review' | 'publish' | 'retire',
  actor: string,
  reviewRecord?: unknown,
) {
  const row = store.db
    .prepare('SELECT state,payload FROM pack_revisions WHERE id=? AND version=?')
    .get(id, version) as { state: string; payload: string } | undefined;
  if (!row) throw Error('Pack revision not found.');
  const p: RulePack = JSON.parse(row.payload);
  if (action === 'review') {
    if (row.state !== 'draft') throw Error('Only a draft can enter review.');
    validatePackSources(p, capturedSources(store, p));
    const signed = hasSignedReview(reviewRecord)
      ? verifyReview(store, reviewRecord, 'pack')
      : undefined;
    p.reviewRecord = validatePackReview(p, actor, signed ? signed.payload : reviewRecord);
    if (signed && evidenceHash(p.reviewRecord) !== signed.proof.payloadHash)
      throw Error('Sign normalized review fields without changing their contents.');
    p.reviewSignature = signed?.proof;
    p.lifecycle = 'reviewed';
    p.reviewedBy = actor;
    p.reviewedAt = new Date().toISOString();
  } else if (action === 'publish') {
    if (
      row.state !== 'reviewed' ||
      reviewerIdentity(actor) !== reviewerIdentity(p.reviewedBy || '')
    )
      throw Error('Only the recorded independent reviewer may publish a reviewed revision.');
    validatePackSources(p, capturedSources(store, p));
    validatePackReview(p, actor, p.reviewRecord);
    if (!p.reviewSignature)
      throw Error('Publication requires a verified reviewer signature, not a typed name.');
    verifyReview(store, { ...p.reviewSignature, payload: p.reviewRecord }, 'pack');
    p.lifecycle = 'published';
  } else {
    if (
      row.state !== 'published' ||
      reviewerIdentity(actor) !== reviewerIdentity(p.reviewedBy || '')
    )
      throw Error('Retirement requires the recorded reviewer of a published revision.');
    p.lifecycle = 'retired';
  }
  store.db
    .prepare('UPDATE pack_revisions SET state=?,payload=? WHERE id=? AND version=?')
    .run(p.lifecycle, JSON.stringify(p), id, version);
  return p;
}

function capturedSources(store: Store, pack: RulePack): SourceSnapshot[] {
  return (pack.sources || []).map((source) => {
    const row = store.db
      .prepare('SELECT payload FROM source_snapshots WHERE id=?')
      .get(source.id) as { payload: string } | undefined;
    if (!row) throw Error('The current captured source is missing.');
    return JSON.parse(row.payload) as SourceSnapshot;
  });
}
