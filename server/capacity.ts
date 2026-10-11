import {
  mkdtempSync,
  rmSync,
  readFileSync,
  statfsSync,
  statSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir, cpus, totalmem } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { createApp } from './app';
import type { InspectionMode } from './inspection';
import { verifySandbox } from './runtime-config';

export function summarize(values: number[]) {
  if (!values.length) return { count: 0, p50Ms: 0, p95Ms: 0, maxMs: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  return {
    count: sorted.length,
    p50Ms: sorted[Math.ceil(sorted.length * 0.5) - 1],
    p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
    maxMs: sorted[sorted.length - 1],
  };
}
function processTreeRss(pid: number, visited = new Set<number>()): number {
  if (visited.has(pid)) return 0;
  visited.add(pid);
  let rss = 0;
  try {
    rss =
      Number(readFileSync(`/proc/${pid}/status`, 'utf8').match(/^VmRSS:\s+(\d+)/m)?.[1] || 0) *
      1024;
  } catch {}
  try {
    for (const child of readFileSync(`/proc/${pid}/task/${pid}/children`, 'utf8')
      .trim()
      .split(/\s+/)
      .filter(Boolean))
      rss += processTreeRss(Number(child), visited);
  } catch {}
  return rss;
}
function cgroupValue(name: string) {
  try {
    const value = readFileSync('/sys/fs/cgroup/' + name, 'utf8').trim();
    return /^\d+$/.test(value) ? Number(value) : value;
  } catch {
    return null;
  }
}
function footprint(directory: string): number {
  return readdirSync(directory, { withFileTypes: true }).reduce(
    (n, e) =>
      n +
      (e.isDirectory()
        ? footprint(join(directory, e.name))
        : statSync(join(directory, e.name)).size),
    0,
  );
}
async function fixtures() {
  if (!GlobalFonts.has('DejaVu Sans'))
    throw Error('Install DejaVu Sans to render the synthetic OCR fixtures.');
  const native = await PDFDocument.create(),
    font = await native.embedFont(StandardFonts.Helvetica);
  native.addPage().drawText('Name: Synthetic Applicant\nDate of birth: 2000-01-01', {
    font,
    x: 40,
    y: 700,
    size: 20,
  });
  const image = createCanvas(1200, 400),
    context = image.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0, 0, 1200, 400);
  context.fillStyle = 'black';
  context.font = '48px DejaVu Sans';
  context.fillText('Name: Synthetic Applicant', 40, 100);
  context.fillText('Date of birth: 2000-01-01', 40, 200);
  const jpg = image.toBuffer('image/jpeg'),
    scan = await PDFDocument.create();
  scan
    .addPage([1200, 400])
    .drawImage(await scan.embedJpg(jpg), { x: 0, y: 0, width: 1200, height: 400 });
  return [
    { kind: 'native_pdf', mime: 'application/pdf', bytes: Buffer.from(await native.save()) },
    { kind: 'scanned_pdf', mime: 'application/pdf', bytes: Buffer.from(await scan.save()) },
    { kind: 'jpeg', mime: 'image/jpeg', bytes: jpg },
  ];
}
/** Never loads personal data or targets an existing URL. Every run owns disposable storage. */
export async function runCapacity(
  options: {
    concurrency?: number;
    rounds?: number;
    mode?: InspectionMode;
    timeoutSeconds?: number;
  } = {},
) {
  const concurrency = options.concurrency ?? 3,
    rounds = options.rounds ?? 3,
    mode = options.mode || 'process',
    timeout = options.timeoutSeconds ?? 300;
  if (
    !['process', 'bubblewrap'].includes(mode) ||
    !Number.isInteger(concurrency) ||
    concurrency < 1 ||
    concurrency > 8 ||
    !Number.isInteger(rounds) ||
    rounds < 1 ||
    rounds > 10 ||
    !Number.isFinite(timeout) ||
    timeout < 5 ||
    timeout > 900
  )
    throw Error('Capacity bounds: concurrency 1–8, rounds 1–10 and timeout 5–900 seconds.');
  if (mode === 'bubblewrap') await verifySandbox();
  const directory = mkdtempSync(join(tmpdir(), 'jky-capacity-')),
    origin = 'https://capacity.example.test';
  const runtime = createApp({
    dataDir: directory,
    origin,
    production: true,
    background: false,
    inspectionMode: mode,
    scan: async () => ({ status: 'clean' }),
  });
  const server = runtime.app.listen(0, '127.0.0.1');
  const failures: { stage: string; kind: string }[] = [],
    latency: Record<string, number[]> = {},
    started = performance.now();
  let maxApiRss = process.memoryUsage().rss,
    maxProcessTreeRss = processTreeRss(process.pid),
    maxDisk = footprint(directory);
  const diskBefore = statfsSync(directory).bavail * statfsSync(directory).bsize;
  const sample = setInterval(() => {
    maxApiRss = Math.max(maxApiRss, process.memoryUsage().rss);
    maxProcessTreeRss = Math.max(maxProcessTreeRss, processTreeRss(process.pid));
  }, 50);
  let requests = 0;
  try {
    await new Promise<void>((done, error) => {
      server.once('listening', done);
      server.once('error', error);
    });
    const port = (server.address() as { port: number }).port,
      originals = await fixtures();
    const call = (path: string, cookie = '', init: RequestInit = {}) => {
      requests++;
      return fetch(`http://127.0.0.1:${port}` + path, {
        ...init,
        redirect: 'error',
        signal: AbortSignal.timeout(15000),
        headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...init.headers },
      });
    };
    const observe = (name: string, start: number) => {
      (latency[name] ||= []).push(performance.now() - start);
    };
    let ready = 0,
      expectedOcr = 0,
      actualOcr = 0;
    await Promise.all(
      Array.from({ length: concurrency }, async (_, index) => {
        let cookie = '',
          csrf = '';
        try {
          const signup = await call('/api/auth/register', '', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Synthetic capacity account',
              email: `capacity-${index}@example.test`,
              password: 'Synthetic-Password-Only-42!',
              adult: true,
              consent: true,
            }),
          });
          cookie =
            signup.headers
              .getSetCookie()
              .find((c) => c.startsWith('jky_session='))
              ?.split(';')[0] || '';
          csrf = (await signup.json()).csrf || '';
          if (signup.status !== 201 || !cookie || !csrf) throw Error('registration');
          const empty = await call('/api/packets', cookie);
          if (!empty.ok || (await empty.json()).length) throw Error('fresh_workspace');
          for (let round = 0; round < rounds; round++) {
            if (performance.now() > started + timeout * 1000) {
              failures.push({ stage: 'time_budget', kind: 'client' });
              break;
            }
            const fixture = originals[round % originals.length],
              begin = performance.now(),
              form = new FormData();
            if (fixture.kind !== 'native_pdf') expectedOcr++;
            form.append(
              'file',
              new Blob([new Uint8Array(fixture.bytes)], { type: fixture.mime }),
              fixture.kind + (fixture.mime === 'application/pdf' ? '.pdf' : '.jpg'),
            );
            const upload = await call('/api/intake', cookie, {
              method: 'POST',
              headers: { 'x-csrf-token': csrf },
              body: form,
            });
            observe('upload_response', begin);
            const body = await upload.json();
            if (upload.status !== 202 || !body.packetId) throw Error('intake');
            let document;
            const deadline = started + timeout * 1000;
            while (performance.now() < deadline) {
              const response = await call('/api/packets/' + body.packetId, cookie);
              if (!response.ok) throw Error('poll');
              document = (await response.json()).documents?.[0];
              if (document?.status === 'ready' || document?.status === 'error') break;
              await new Promise((done) => setTimeout(done, 1000));
            }
            if (document?.status !== 'ready') {
              failures.push({ stage: 'inspection', kind: fixture.kind });
              continue;
            }
            if (
              fixture.kind !== 'native_pdf' &&
              document.pages?.some(
                (p: { method?: string; text?: string }) =>
                  p.method === 'ocr' && p.text?.includes('Synthetic'),
              )
            )
              actualOcr++;
            observe(fixture.kind, begin);
            ready++;
            maxDisk = Math.max(maxDisk, footprint(directory));
            const download = await call(
              `/api/packets/${body.packetId}/documents/${document.id}/content`,
              cookie,
            );
            if (!download.ok || !Buffer.from(await download.arrayBuffer()).equals(fixture.bytes))
              throw Error('original_integrity');
          }
        } catch (error) {
          const stage = (error as Error).message;
          failures.push({
            stage: [
              'registration',
              'fresh_workspace',
              'intake',
              'poll',
              'original_integrity',
            ].includes(stage)
              ? stage
              : 'transport',
            kind: 'client',
          });
        } finally {
          if (cookie && csrf) {
            try {
              const removal = await call('/api/account', cookie, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
                body: JSON.stringify({ confirmation: 'DELETE' }),
              });
              if (!removal.ok) failures.push({ stage: 'account_cleanup', kind: 'client' });
            } catch {
              failures.push({ stage: 'account_cleanup', kind: 'client' });
            }
          }
        }
      }),
    );
    if (expectedOcr !== actualOcr) failures.push({ stage: 'ocr_extraction', kind: 'scanned' });
    if ((runtime.store.db.prepare('SELECT count(*) n FROM users').get() as { n: number }).n)
      failures.push({ stage: 'account_cleanup', kind: 'remaining' });
    const seconds = (performance.now() - started) / 1000;
    return {
      version: 1,
      scope: 'synthetic_single_runtime_capacity',
      createdAt: new Date().toISOString(),
      mode,
      concurrency,
      rounds,
      requests,
      expectedDocuments: concurrency * rounds,
      readyDocuments: ready,
      expectedOcrDocuments: expectedOcr,
      actualOcrDocuments: actualOcr,
      passed: !failures.length && ready === concurrency * rounds,
      failures,
      elapsedSeconds: seconds,
      documentsPerMinute: (ready / seconds) * 60,
      latency: Object.fromEntries(
        Object.entries(latency).map(([key, value]) => [key, summarize(value)]),
      ),
      resources: {
        peakApiRssBytes: maxApiRss,
        peakProcessTreeRssBytes: maxProcessTreeRss,
        samplingIntervalMs: 50,
        peakWorkspaceBytes: maxDisk,
        diskAvailableBeforeBytes: diskBefore,
        cgroupMemoryPeak: cgroupValue('memory.peak'),
        cgroupMemoryMax: cgroupValue('memory.max'),
        cgroupCpuMax: cgroupValue('cpu.max'),
        hostLogicalCpus: cpus().length,
        hostMemoryBytes: totalmem(),
      },
      limitations: [
        'Synthetic fixtures and scanner protocol fixture only; real ClamAV performance and representative applicant workloads need their own measurements.',
        'Latency includes queue waiting; process-tree RSS can double-count shared pages and 50 ms sampling may miss short peaks.',
        'Host capacity is not container capacity; cgroup readings apply to the enclosing runtime. No multi-instance capacity is claimed.',
      ],
    };
  } finally {
    clearInterval(sample);
    await new Promise<void>((done) => server.close(() => done()));
    runtime.close();
    rmSync(directory, { recursive: true, force: true });
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2),
    value = (flag: string) => args[args.indexOf(flag) + 1];
  const report = await runCapacity({
    concurrency: args.includes('--concurrency') ? Number(value('--concurrency')) : undefined,
    rounds: args.includes('--rounds') ? Number(value('--rounds')) : undefined,
    mode: args.includes('--sandbox') ? 'bubblewrap' : 'process',
  });
  if (args.includes('--out'))
    writeFileSync(value('--out'), JSON.stringify(report, null, 2) + '\n', {
      mode: 0o600,
      flag: 'wx',
    });
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}
