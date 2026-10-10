import type { Express, Request } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Store } from './store';
import type { Packet } from '../shared/model';
import { draftInstructions, type InstructionDraft } from '../shared/instruction-draft';
import { requirementsSchema } from './application-schema';
import { makeCustomPack } from '../shared/templates';
export function registerInstructionDrafts(
  app: Express,
  store: Store,
  owned: (req: Request) => Packet,
  userId: (req: Request) => string,
  touch: (p: Packet) => void,
  fail: (s: number, m: string) => Error,
) {
  store.db.exec(
    `CREATE TABLE IF NOT EXISTS instruction_drafts(id TEXT PRIMARY KEY,packetId TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,documentId TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,payload TEXT NOT NULL);`,
  );
  app.post('/api/packets/:packetId/instruction-drafts', (req, res) => {
    const p = owned(req),
      input = z
        .object({ expectedRevision: z.number().int().positive(), documentId: z.string().uuid() })
        .strict()
        .parse(req.body);
    if (p.revision !== input.expectedRevision)
      throw fail(409, 'Folder changed. Refresh before drafting.');
    const doc = store.documents(p.id).find((d) => d.id === input.documentId);
    if (!doc || doc.status !== 'ready' || doc.mime !== 'application/pdf')
      throw fail(400, 'Select an inspected instructions PDF from this folder.');
    store.db
      .prepare(
        "DELETE FROM instruction_drafts WHERE packetId=? AND json_extract(payload,'$.confirmedAt') IS NULL",
      )
      .run(p.id);
    const draft: InstructionDraft = {
      id: randomUUID(),
      documentId: doc.id,
      sourceHash: doc.hash,
      revision: p.revision,
      ...draftInstructions(doc),
    };
    store.db
      .prepare('INSERT INTO instruction_drafts VALUES(?,?,?,?)')
      .run(draft.id, p.id, doc.id, JSON.stringify(draft));
    res.status(201).json(draft);
  });
  app.post('/api/packets/:packetId/instruction-drafts/:draftId/confirm', (req, res) => {
    const p = owned(req),
      input = z
        .object({
          expectedRevision: z.number().int().positive(),
          requirements: requirementsSchema,
          decisions: z
            .array(
              z
                .object({
                  id: z.string(),
                  accepted: z.boolean(),
                  note: z.string().trim().min(10).max(1000),
                })
                .strict(),
            )
            .max(50),
          completenessConfirmed: z.literal(true),
        })
        .strict()
        .parse(req.body);
    const row = store.db
      .prepare('SELECT payload FROM instruction_drafts WHERE id=? AND packetId=?')
      .get(String(req.params.draftId), p.id) as { payload: string } | undefined;
    if (!row) throw fail(404, 'Instructions draft not found.');
    const draft: InstructionDraft = JSON.parse(row.payload),
      doc = store.documents(p.id).find((d) => d.id === draft.documentId);
    if (p.revision !== input.expectedRevision || draft.revision !== p.revision)
      throw fail(409, 'Folder changed. Generate a fresh draft before confirmation.');
    if (!doc || doc.hash !== draft.sourceHash || doc.status !== 'ready')
      throw fail(409, 'Instructions source changed. Generate a fresh draft.');
    if (
      input.decisions.length !== draft.candidates.length ||
      new Set(input.decisions.map((d) => d.id)).size !== draft.candidates.length ||
      input.decisions.some((d) => !draft.candidates.some((c) => c.id === d.id))
    )
      throw fail(400, 'Record an explicit decision for every proposed instruction.');
    for (const decision of input.decisions) {
      const candidate = draft.candidates.find((c) => c.id === decision.id)!,
        r = input.requirements.find((r) => r.id === decision.id);
      if (decision.accepted !== !!r)
        throw fail(400, 'Accepted proposals must match the confirmed checklist.');
      if (r && r.sourceAnchor !== candidate.requirement.sourceAnchor)
        throw fail(400, 'Source anchors cannot be replaced.');
    }
    for (const r of input.requirements)
      if (!draft.candidates.some((c) => c.id === r.id) && r.sourceAnchor)
        throw fail(400, 'Manually added items must not invent source anchors.');
    p.customPack = {
      ...makeCustomPack({ id: 'custom-' + p.id, title: p.title, requirements: input.requirements }),
      version: 'pdf.' + (p.revision + 1),
      instructionSource: { documentId: doc.id, sha256: doc.hash, draftId: draft.id },
      stage: 'user-confirmed instructions',
      lifecycle: 'reviewed',
      authoredBy: userId(req),
      reviewedBy: userId(req),
      reviewedAt: new Date().toISOString(),
    };
    p.packId = p.customPack.id;
    p.mode = 'instructions';
    p.links = {};
    delete p.packSnapshot;
    store.db.transaction(() => {
      touch(p);
      store.db.prepare('UPDATE instruction_drafts SET payload=? WHERE id=?').run(
        JSON.stringify({
          ...draft,
          decisions: input.decisions,
          confirmedAt: new Date().toISOString(),
          confirmedBy: userId(req),
          requirements: input.requirements,
        }),
        draft.id,
      );
      store.audit(userId(req), 'instructions.confirmed', p.id);
    })();
    res.json(p);
  });
}
