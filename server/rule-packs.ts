import { createHash } from 'node:crypto';
import type { Store } from './store';
import type { Packet, RulePack, SourceSnapshot } from '../shared/model';
import { packs } from '../shared/packs';
import { requirementsSchema } from './application-schema';
import { z } from 'zod';
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
    else latest.set(p.id, p);
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
  reviewRecord?: RulePack['reviewRecord'],
) {
  const row = store.db
    .prepare('SELECT state,payload FROM pack_revisions WHERE id=? AND version=?')
    .get(id, version) as { state: string; payload: string } | undefined;
  if (!row) throw Error('Pack revision not found.');
  const p: RulePack = JSON.parse(row.payload);
  if (action === 'review') {
    if (row.state !== 'draft' || !actor.trim() || actor === p.authoredBy)
      throw Error('A draft requires a distinct accountable reviewer.');
    if (!p.sources?.length || !p.obligations?.length)
      throw Error('Source snapshots and a complete obligation inventory are required.');
    const ids = new Set(p.requirements.map((r) => r.id));
    const sourceIds = new Set(p.sources.map((s) => s.id));
    for (const s of p.sources) {
      const stored = store.db
        .prepare('SELECT payload FROM source_snapshots WHERE id=?')
        .get(s.id) as { payload: string } | undefined;
      if (
        !stored ||
        (JSON.parse(stored.payload) as SourceSnapshot).sha256 !== s.sha256 ||
        digest((JSON.parse(stored.payload) as SourceSnapshot).content || '') !== s.sha256 ||
        (JSON.parse(stored.payload) as SourceSnapshot).url !== s.url ||
        !s.url.startsWith('https://') ||
        Number.isNaN(Date.parse(s.retrievedAt))
      )
        throw Error(
          'Sources must match the current captured snapshots and their content integrity.',
        );
    }
    for (const o of p.obligations) {
      const sourceRow = store.db
        .prepare('SELECT payload FROM source_snapshots WHERE id=?')
        .get(o.sourceId) as { payload: string } | undefined;
      const source = sourceRow ? (JSON.parse(sourceRow.payload) as SourceSnapshot) : undefined;
      const parts = o.anchor.split(':');
      if (
        parts.length !== 3 ||
        parts[0] !== o.sourceId ||
        !/^\d+$/.test(parts[1]) ||
        !/^\d+$/.test(parts[2]) ||
        Number(parts[2]) < 1 ||
        Number(parts[1]) + Number(parts[2]) > (source?.content?.length || 0)
      )
        throw Error(
          'An obligation anchor must identify an exact source snapshot text range: sourceId:start:length.',
        );
      if (
        !sourceIds.has(o.sourceId) ||
        !o.anchor ||
        !o.instruction ||
        !o.rationale ||
        !['implemented', 'review_only', 'unsupported'].includes(o.disposition) ||
        o.requirementIds.some((id) => !ids.has(id)) ||
        (o.disposition !== 'unsupported' && !o.requirementIds.length)
      )
        throw Error(
          'Every obligation needs a valid source anchor, disposition, rationale and mapped requirements.',
        );
    }
    if (
      p.requirements.some(
        (r) =>
          !r.sourceAnchor ||
          !p.obligations!.some(
            (o) => o.requirementIds.includes(r.id) && o.anchor === r.sourceAnchor,
          ),
      )
    )
      throw Error('Every requirement needs an exact source anchor and obligation mapping.');
    if (p.coverage) {
      reviewRecord = z
        .object({
          reviewer: z.string().trim().min(1),
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
        .parse(reviewRecord);
      const hash = packScopeHash(p);
      if (
        !reviewRecord ||
        !reviewRecord.independenceAttested ||
        reviewRecord.reviewer !== actor ||
        reviewRecord.scopeHash !== hash ||
        Number.isNaN(Date.parse(reviewRecord.signedAt))
      )
        throw Error(
          'A signed independent review of the exact source coverage and rules is required.',
        );
      if (
        reviewRecord.decisions.length !== p.coverage.length ||
        new Set(reviewRecord.decisions.map((d) => d.sectionId)).size !== p.coverage.length ||
        p.coverage.some(
          (c) =>
            !reviewRecord!.decisions.some(
              (d) => d.sectionId === c.id && d.accepted && d.note.trim().length >= 20,
            ),
        )
      )
        throw Error(
          'Every coverage section requires an accepted decision and substantive reviewer note.',
        );
      for (const c of p.coverage) {
        const source = p.sources!.find((s) => s.id === c.sourceId),
          row =
            source &&
            (store.db.prepare('SELECT payload FROM source_snapshots WHERE id=?').get(source.id) as
              { payload: string } | undefined);
        const content = row ? (JSON.parse(row.payload) as SourceSnapshot).content || '' : '',
          parts = c.anchor.split(':');
        if (
          parts.length !== 3 ||
          parts[0] !== c.sourceId ||
          !/^\d+$/.test(parts[1]) ||
          !/^\d+$/.test(parts[2]) ||
          Number(parts[2]) < 1 ||
          Number(parts[1]) + Number(parts[2]) > content.length ||
          !c.title ||
          !['in_scope', 'out_of_scope'].includes(c.disposition) ||
          !c.obligationIds.length ||
          c.obligationIds.some(
            (id) => !p.obligations!.some((o) => o.id === id && o.sourceId === c.sourceId),
          )
        )
          throw Error('Coverage requires exact source ranges and mapped obligation IDs.');
      }
      if (
        new Set(p.coverage.map((c) => c.id)).size !== p.coverage.length ||
        p.obligations!.some((o) => !p.coverage!.some((c) => c.obligationIds.includes(o.id)))
      )
        throw Error('Coverage contains duplicate sections or omitted obligations.');
      p.reviewRecord = reviewRecord;
    }
    p.lifecycle = 'reviewed';
    p.reviewedBy = actor;
    p.reviewedAt = new Date().toISOString();
  } else if (action === 'publish') {
    if (row.state !== 'reviewed' || actor !== p.reviewedBy)
      throw Error('Only the recorded independent reviewer may publish a reviewed revision.');
    if (
      p.sources?.some((s) => {
        const row = store.db
          .prepare('SELECT payload FROM source_snapshots WHERE id=?')
          .get(s.id) as { payload: string } | undefined;
        return (
          !row ||
          JSON.parse(row.payload).sha256 !== s.sha256 ||
          digest(JSON.parse(row.payload).content || '') !== s.sha256
        );
      })
    )
      throw Error('Source changed after review. Create and review a new revision.');
    if (p.coverage && p.reviewRecord?.scopeHash !== packScopeHash(p))
      throw Error('Coverage or rules changed after review.');
    p.lifecycle = 'published';
  } else {
    if (row.state !== 'published' || actor !== p.reviewedBy)
      throw Error('Retirement requires the recorded reviewer of a published revision.');
    p.lifecycle = 'retired';
  }
  store.db
    .prepare('UPDATE pack_revisions SET state=?,payload=? WHERE id=? AND version=?')
    .run(p.lifecycle, JSON.stringify(p), id, version);
  return p;
}

export function packScopeHash(p: RulePack) {
  return digest(
    JSON.stringify({
      sources: p.sources,
      requirements: p.requirements,
      obligations: p.obligations,
      coverage: p.coverage,
    }),
  );
}
