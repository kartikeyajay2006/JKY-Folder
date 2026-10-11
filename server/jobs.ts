import { type ChildProcess } from 'node:child_process';
import { inspectFile, type InspectionMode, type InspectionOutcome } from './inspection';
import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';
import { extractFacts } from '../shared/facts';
import type { Store } from './store';
import type { Scanner } from './scan';
import type { OperationalObserver } from './monitoring';
import type { DocumentRecord, Packet } from '../shared/model';
type Outcome = InspectionOutcome;
/**
 * Inspects queued originals one at a time. With a virus scanner configured, every file is
 * scanned first: infected files are deleted unopened, and while the scanner is unreachable
 * files wait in the queue rather than reaching a parser unscanned.
 */
export function startJobs(
  store: Store,
  scan?: Scanner,
  mode: InspectionMode = 'process',
  observe?: OperationalObserver,
) {
  let running = false,
    stopped = false,
    pausedUntil = 0,
    child: ChildProcess | undefined;
  const guardianship = !!store.db
    .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='guardianship'")
    .get();
  const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const consentJoin = guardianship ? ' LEFT JOIN guardianship g ON g.userId=p.userId' : '';
  const consentWhere = guardianship
    ? " AND (g.userId IS NULL OR g.status='approved' OR json_extract(g.payload,'$.adultOn')<=?)"
    : '';
  function allowed(packetId: string) {
    return !!store.db
      .prepare('SELECT 1 FROM packets p' + consentJoin + ' WHERE p.id=?' + consentWhere)
      .get(...[packetId, ...(guardianship ? [today()] : [])]);
  }
  store.db.prepare("UPDATE jobs SET status='queued' WHERE status='processing'").run();
  const timer = setInterval(() => void tick(), 300);
  timer.unref();
  async function tick() {
    if (running || stopped || Date.now() < pausedUntil) return;
    const row = store.db
      .prepare(
        'SELECT j.id,j.packetId,d.objectKey,d.payload FROM jobs j JOIN documents d ON d.id=j.id JOIN packets p ON p.id=j.packetId' +
          consentJoin +
          " WHERE j.status='queued'" +
          consentWhere +
          ' ORDER BY j.rowid LIMIT 1',
      )
      .get(...(guardianship ? [today()] : [])) as
      { id: string; packetId: string; objectKey: string; payload: string } | undefined;
    if (!row) return;
    const begin = performance.now();
    running = true;
    store.db.prepare("UPDATE jobs SET status='processing' WHERE id=?").run(row.id);
    try {
      const file = join(store.objects, row.objectKey);
      let screened: Outcome | null = null;
      if (!existsSync(file))
        screened = { ok: false, error: 'The stored file is missing. Delete it and upload again.' };
      else if (scan) {
        const verdict = await scan(file);
        observe?.(`scan_${verdict.status}`);
        if (stopped) return;
        if (!allowed(row.packetId)) {
          store.db.prepare("UPDATE jobs SET status='queued' WHERE id=?").run(row.id);
          return;
        }
        if (verdict.status === 'unavailable') {
          console.error('scan.unavailable');
          store.db.prepare("UPDATE jobs SET status='queued' WHERE id=?").run(row.id);
          pausedUntil = Date.now() + 30000;
          return;
        }
        if (verdict.status === 'infected') {
          unlinkSync(file);
          screened = {
            ok: false,
            error: `The virus scanner flagged this file (${verdict.name}). It was deleted without being opened. Upload a clean copy.`,
          };
        } else if (verdict.status === 'error')
          screened = { ok: false, error: 'The virus scanner could not check this file.' };
      }
      // A scanner wait may overlap deletion; do not launch or recreate an erased job.
      if (!store.db.prepare('SELECT id FROM jobs WHERE id=?').get(row.id)) return;
      if (!screened) {
        const attempt = store.db
          .prepare(
            'INSERT INTO job_attempts(id,attempts) VALUES(?,1) ON CONFLICT(id) DO UPDATE SET attempts=attempts+1 RETURNING attempts',
          )
          .get(row.id) as { attempts: number };
        if (attempt.attempts > 3)
          screened = {
            ok: false,
            error:
              'Inspection was interrupted repeatedly. Review the file and explicitly retry, or upload a smaller supported copy.',
          };
      }
      const result =
        screened ||
        (await inspectFile(file, {
          mode,
          onChild: (proc) => {
            child = proc;
          },
        }));
      if (stopped) return;
      if (!allowed(row.packetId)) {
        store.db.prepare("UPDATE jobs SET status='queued' WHERE id=?").run(row.id);
        return;
      }
      observe?.(
        result.ok ? 'inspection_ready' : 'inspection_error',
        (performance.now() - begin) / 1000,
        result.result?.pages?.some((p) => p.method === 'ocr'),
      );
      store.db.transaction(() => {
        const current = store.db
          .prepare('SELECT payload FROM documents WHERE id=? AND packetId=?')
          .get(row.id, row.packetId) as { payload: string } | undefined;
        const packetRow = store.db
          .prepare('SELECT payload FROM packets WHERE id=?')
          .get(row.packetId) as { payload: string } | undefined;
        if (!current || !packetRow) return; // deletion wins; never recreate removed records
        const doc: DocumentRecord = JSON.parse(current.payload);
        const updated = {
          ...doc,
          ...(result.result || {}),
          status: result.ok ? 'ready' : 'error',
          error: result.ok ? undefined : result.error,
          facts: result.ok ? extractFacts(result.result?.pages || []) : [],
        };
        store.db
          .prepare('UPDATE documents SET payload=? WHERE id=?')
          .run(JSON.stringify(updated), row.id);
        store.db.prepare("UPDATE jobs SET status='done' WHERE id=?").run(row.id);
        const packet: Packet = JSON.parse(packetRow.payload);
        const anchor = packet.links['upload-' + row.id];
        if (packet.mode !== 'instructions' && anchor?.review === 'unreviewed')
          anchor.pageTo = Math.max(1, updated.pageCount);
        packet.revision++;
        packet.updatedAt = new Date().toISOString();
        store.savePacket(packet);
      })();
    } catch {
      if (!stopped) {
        observe?.('inspection_exception');
        console.error('inspection.failed');
        store.db.prepare("UPDATE jobs SET status='queued' WHERE id=?").run(row.id);
        pausedUntil = Date.now() + 30000;
      }
    } finally {
      running = false;
      child = undefined;
    }
  }
  void tick();
  return Object.assign(
    () => {
      stopped = true;
      clearInterval(timer);
      child?.kill('SIGKILL');
    },
    { isIdle: () => !running },
  );
}
