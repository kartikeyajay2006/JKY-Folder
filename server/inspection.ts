import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import type { DocumentRecord } from '../shared/model';

export type InspectionMode = 'process' | 'bubblewrap';
export type InspectionOutcome = { ok: boolean; result?: Partial<DocumentRecord>; error?: string };
const root = dirname(fileURLToPath(import.meta.url));
const page = z
  .object({
    number: z.number().int().min(1).max(20),
    text: z.string().max(18000),
    method: z.enum(['native', 'ocr', 'unreadable']).optional(),
    confidence: z.number().min(0).max(100).optional(),
    width: z.number().positive().finite().optional(),
    height: z.number().positive().finite().optional(),
    warning: z.string().max(1000).optional(),
    tokens: z
      .array(
        z
          .object({
            text: z.string().max(18000),
            box: z.tuple([
              z.number().finite(),
              z.number().finite(),
              z.number().finite(),
              z.number().finite(),
            ]),
            confidence: z.number().min(0).max(100),
          })
          .strict(),
      )
      .max(3000)
      .optional(),
  })
  .strict();
const outcome = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(false), error: z.string().max(1000) }).strict(),
  z
    .object({
      ok: z.literal(true),
      result: z
        .object({
          mime: z.enum(['application/pdf', 'image/jpeg']),
          pageCount: z.number().int().min(1).max(20),
          pages: z.array(page).min(1).max(20),
          width: z.number().positive().finite().optional(),
          height: z.number().positive().finite().optional(),
          extractionVersion: z.string().max(100),
        })
        .strict()
        .refine(
          (r) => r.pages.length === r.pageCount && r.pages.every((p, i) => p.number === i + 1),
        ),
    })
    .strict(),
]);

/** Read-only runtime and one original; private data, credentials and host networking stay outside. */
export function sandboxCommand(file: string, program = join(root, 'inspect-worker.mjs')) {
  if (process.platform !== 'linux') throw Error('Parser isolation requires a Linux host.');
  const args = [
    '--unshare-all',
    '--die-with-parent',
    '--new-session',
    '--cap-drop',
    'ALL',
    '--clearenv',
  ];
  for (const system of ['/usr', '/lib', '/lib64'])
    if (existsSync(system)) args.push('--ro-bind', system, system);
  // Official Node Docker images install Node under /usr/local (already included in /usr).
  if (!process.execPath.startsWith('/usr/'))
    throw Error('Install Node under /usr for the isolated runtime.');
  args.push(
    '--ro-bind-try',
    '/etc/ld.so.cache',
    '/etc/ld.so.cache',
    '--dir',
    '/proc',
    '--dev',
    '/dev',
    '--size',
    '268435456',
    '--tmpfs',
    '/tmp',
    '--dir',
    '/runtime',
    '--ro-bind',
    resolve(root, '../node_modules'),
    '/runtime/node_modules',
    '--ro-bind',
    resolve(program),
    '/runtime/worker.mjs',
    '--dir',
    '/input',
    '--ro-bind',
    resolve(file),
    '/input/document',
    '--chdir',
    '/runtime',
    '--setenv',
    'PATH',
    '/usr/local/bin:/usr/bin:/bin',
    '--setenv',
    'HOME',
    '/tmp',
    '--setenv',
    'TMPDIR',
    '/tmp',
    '--setenv',
    'JKY_WORKER_STDIO',
    '1',
    '--',
    '/usr/bin/prlimit',
    '--cpu=30',
    '--fsize=67108864',
    '--nofile=128',
    '--',
    process.execPath,
    '--max-old-space-size=192',
    '/runtime/worker.mjs',
    '/input/document',
  );
  return { command: 'bwrap', args };
}

export function inspectFile(
  file: string,
  options: {
    mode: InspectionMode;
    onChild?: (child: ChildProcess) => void;
    /** Test harness only; never supplied from an HTTP request. */
    program?: string;
    timeoutMs?: number;
  },
): Promise<InspectionOutcome> {
  return new Promise((resolveResult) => {
    const program = options.program || join(root, 'inspect-worker.mjs');
    let launch: { command: string; args: string[] };
    try {
      launch =
        options.mode === 'bubblewrap'
          ? sandboxCommand(file, program)
          : {
              command: process.execPath,
              args: ['--max-old-space-size=192', program, file],
            };
    } catch {
      resolveResult({
        ok: false,
        error: 'Parser isolation is unavailable. Ask the operator to check the host.',
      });
      return;
    }
    const child = spawn(launch.command, launch.args, {
      env: { PATH: '/usr/local/bin:/usr/bin:/bin', JKY_WORKER_STDIO: '1' },
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    options.onChild?.(child);
    let finished = false;
    let bytes = 0;
    const chunks: Buffer[] = [];
    const finish = (value: InspectionOutcome) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      child.kill('SIGKILL');
      resolveResult(value);
    };
    const timer = setTimeout(
      () =>
        finish({
          ok: false,
          error: 'Inspection reached its time limit. Try a smaller supported file.',
        }),
      options.timeoutMs || 45000,
    );
    child.stdout.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > 8 * 1024 * 1024)
        finish({
          ok: false,
          error: 'Inspection exceeded its output limit. Review a smaller file.',
        });
      else chunks.push(chunk);
    });
    child.once('error', () =>
      finish({ ok: false, error: 'The inspection worker is unavailable.' }),
    );
    child.once('close', (code) => {
      if (finished) return;
      try {
        if (code !== 0) throw Error();
        finish(outcome.parse(JSON.parse(Buffer.concat(chunks).toString('utf8'))));
      } catch {
        finish({
          ok: false,
          error: 'The inspection worker stopped before completing or returned invalid output.',
        });
      }
    });
  });
}
