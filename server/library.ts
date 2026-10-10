import { randomUUID } from 'node:crypto';
import { copyFileSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import type { Express, Request } from 'express';
import type { Store } from './store';
import { limits } from '../shared/limits';
import { classifyDocument } from '../shared/classify';
import type { DocumentRecord, LibraryDocument, Packet } from '../shared/model';

interface Owned {
  packetId: string;
  packetTitle: string;
  archived: boolean;
  objectKey: string;
  doc: DocumentRecord;
}

/**
 * The applicant's library: every original across their applications, grouped by content. Adding
 * one to another application copies the stored bytes and the inspection result, so each
 * application keeps working (and can be deleted) independently.
 */
export function registerLibrary(
  app: Express,
  store: Store,
  deps: {
    userId: (req: Request) => string;
    owned: (req: Request) => Packet;
    checkRevision: (p: Packet, expected: number) => void;
    touch: (p: Packet) => void;
    linkUpload: (p: Packet, doc: DocumentRecord) => void;
    fail: (status: number, message: string) => Error;
  },
) {
  function originals(userId: string): Owned[] {
    return (
      store.db
        .prepare(
          'SELECT p.id AS packetId,p.payload AS packet,d.objectKey,d.payload FROM documents d JOIN packets p ON p.id=d.packetId WHERE p.userId=? ORDER BY d.rowid',
        )
        .all(userId) as { packetId: string; packet: string; objectKey: string; payload: string }[]
    ).map((row) => {
      const packet = JSON.parse(row.packet) as Packet;
      return {
        packetId: row.packetId,
        packetTitle: packet.title,
        archived: !!packet.archived,
        objectKey: row.objectKey,
        doc: JSON.parse(row.payload) as DocumentRecord,
      };
    });
  }
  function library(userId: string): LibraryDocument[] {
    const groups = new Map<string, Owned[]>();
    for (const item of originals(userId))
      groups.set(item.doc.hash, [...(groups.get(item.doc.hash) || []), item]);
    return [...groups.values()]
      .map((items) => {
        // The inspected copy speaks for the group; the oldest name is the one the applicant chose.
        const source = items.find((i) => i.doc.status === 'ready') || items[0];
        const guess = classifyDocument(source.doc);
        return {
          hash: source.doc.hash,
          name: items[0].doc.name,
          mime: source.doc.mime,
          size: source.doc.size,
          pageCount: source.doc.pageCount,
          width: source.doc.width,
          height: source.doc.height,
          status: source.doc.status,
          createdAt: items[0].doc.createdAt,
          source: { packetId: source.packetId, documentId: source.doc.id },
          ...(guess ? { guess: { id: guess.id, label: guess.label } } : {}),
          uses: items.map((i) => ({
            packetId: i.packetId,
            packetTitle: i.packetTitle,
            documentId: i.doc.id,
            archived: i.archived,
          })),
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  app.get('/api/library', (req, res) => res.json(library(deps.userId(req))));
  app.post('/api/packets/:packetId/documents/attach', (req, res) => {
    const input = z
      .object({
        expectedRevision: z.number().int().positive(),
        documentIds: z.array(z.string().uuid()).min(1).max(limits.packetFiles),
      })
      .strict()
      .parse(req.body);
    const p = deps.owned(req);
    deps.checkRevision(p, input.expectedRevision);
    const mine = originals(deps.userId(req));
    const present = store.documents(p.id);
    const attached: { doc: DocumentRecord; key: string; from: string }[] = [],
      skipped: string[] = [];
    let files = present.length,
      bytes = present.reduce((n, d) => n + d.size, 0);
    const hashes = new Set(present.map((d) => d.hash));
    for (const id of new Set(input.documentIds)) {
      const source = mine.find((m) => m.doc.id === id);
      if (!source) throw deps.fail(404, 'That document is not in your library.');
      if (source.doc.status !== 'ready')
        throw deps.fail(
          400,
          `${source.doc.name} is not ready yet. Try again once it is inspected.`,
        );
      if (hashes.has(source.doc.hash)) {
        skipped.push(source.doc.name);
        continue;
      }
      if (files + 1 > limits.packetFiles || bytes + source.doc.size > limits.packetBytes)
        throw deps.fail(
          400,
          `This application is full: ${limits.packetFiles} files or ${limits.packetBytes / 1024 / 1024} MB.`,
        );
      files++;
      bytes += source.doc.size;
      hashes.add(source.doc.hash);
      // The extraction and confirmed facts describe the same bytes, so they travel with them.
      const doc: DocumentRecord = {
        ...structuredClone(source.doc),
        id: randomUUID(),
        packetId: p.id,
        createdAt: new Date().toISOString(),
        copiedFrom: { documentId: source.doc.id, packetId: source.packetId },
      };
      delete doc.derivedFrom;
      attached.push({ doc, key: randomUUID(), from: source.objectKey });
    }
    // Everything is validated before any bytes are copied.
    try {
      for (const { key, from } of attached)
        copyFileSync(join(store.objects, from), join(store.objects, key));
      store.db.transaction(() => {
        for (const { doc, key } of attached) {
          store.db
            .prepare('INSERT INTO documents VALUES(?,?,?,?)')
            .run(doc.id, p.id, key, JSON.stringify(doc));
          deps.linkUpload(p, doc);
          store.audit(deps.userId(req), 'document.attached', doc.id);
        }
        if (attached.length) deps.touch(p);
      })();
    } catch (error) {
      for (const { key } of attached)
        if (existsSync(join(store.objects, key))) unlinkSync(join(store.objects, key));
      throw error;
    }
    res.status(attached.length ? 201 : 200).json({
      attached: attached.map((a) => a.doc),
      skipped,
      packet: p,
    });
  });
  return { library };
}
