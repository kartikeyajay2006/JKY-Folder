import { fork, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';
import { extractFacts } from '../shared/facts';
import type { Store } from './store';
import type { Scanner } from './scan';
import type { DocumentRecord, Packet } from '../shared/model';
type Outcome = { ok: boolean; result?: Partial<DocumentRecord>; error?: string };
/**
 * Inspects queued originals one at a time. With a virus scanner configured, every file is
 * scanned first: infected files are deleted unopened, and while the scanner is unreachable
 * files wait in the queue rather than reaching a parser unscanned.
 */
export function startJobs(store: Store, scan?: Scanner) {
  let running = false,
    stopped = false,
    pausedUntil = 0,
    child: ChildProcess | undefined;
  store.db.prepare("UPDATE jobs SET status='queued' WHERE status='processing'").run();
  const timer = setInterval(() => void tick(), 300);
  timer.unref();
  async function tick() {
    if (running || stopped || Date.now() < pausedUntil) return;
    const row = store.db
      .prepare(
        "SELECT j.id,j.packetId,d.objectKey,d.payload FROM jobs j JOIN documents d ON d.id=j.id WHERE j.status='queued' ORDER BY j.rowid LIMIT 1",
      )
      .get() as { id: string; packetId: string; objectKey: string; payload: string } | undefined;
    if (!row) return;
    running = true;
    store.db.prepare("UPDATE jobs SET status='processing' WHERE id=?").run(row.id);
    try {
      const file = join(store.objects, row.objectKey);
      let screened: Outcome | null = null;
      if (!existsSync(file))
        screened = { ok: false, error: 'The stored file is missing. Delete it and upload again.' };
      else if (scan) {
        const verdict = await scan(file);
        if (stopped) return;
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
      const result =
        screened ||
        (await new Promise<Outcome>((resolve) => {
          const proc = fork(
            fileURLToPath(new URL('./inspect-worker.mjs', import.meta.url)),
            [file],
            {
              execArgv: ['--max-old-space-size=192'],
              env: { PATH: process.env.PATH },
              stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
            },
          );
          child = proc;
          let finished = false;
          const finish = (value: Outcome) => {
            if (finished) return;
            finished = true;
            clearTimeout(timeout);
            resolve(value);
          };
          const timeout = setTimeout(() => {
            proc.kill('SIGKILL');
            finish({
              ok: false,
              error: 'Inspection reached its time limit. Try a smaller supported file.',
            });
          }, 45000);
          proc.once('message', (value) => {
            finish(value as Parameters<typeof finish>[0]);
            proc.kill();
          });
          proc.once('error', () =>
            finish({ ok: false, error: 'The inspection worker is unavailable.' }),
          );
          proc.once('exit', () =>
            finish({ ok: false, error: 'The inspection worker stopped before completing.' }),
          );
        }));
      if (stopped) return;
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
