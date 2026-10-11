import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  statSync,
  openSync,
  readSync,
  closeSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from 'node:process';

export function remoteRepository(value: string) {
  if (/^rest:https:\/\//.test(value)) return true;
  return /^(s3|sftp|azure|b2|gs|swift|rclone):.+/.test(value);
}

/** No shell, passwords only in environment, bounded output/time and nonzero exits are failures. */
export function runRestic(
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
  timeoutMs = 300000,
) {
  const childEnv: NodeJS.ProcessEnv = {
    PATH: env.PATH || '/usr/local/bin:/usr/bin:/bin',
    HOME: env.HOME,
  };
  for (const [key, value] of Object.entries(env))
    if (/^(RESTIC_|AWS_|AZURE_|B2_|GOOGLE_|OS_|RCLONE_)/.test(key)) childEnv[key] = value;
  if (!childEnv.RESTIC_REPOSITORY || !(childEnv.RESTIC_PASSWORD || childEnv.RESTIC_PASSWORD_FILE))
    return Promise.reject(
      Error('Configure RESTIC_REPOSITORY and RESTIC_PASSWORD or RESTIC_PASSWORD_FILE.'),
    );
  return new Promise<string>((resolveResult, reject) => {
    const child = spawn(env.RESTIC_BINARY || 'restic', ['--json', ...args], {
      env: childEnv,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    let finished = false,
      bytes = 0;
    const chunks: Buffer[] = [];
    const finish = (error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (error) {
        child.kill('SIGKILL');
        reject(error);
      } else resolveResult(Buffer.concat(chunks).toString('utf8'));
    };
    const timer = setTimeout(
      () => finish(Error('Off-site backup timed out. The local archive is retained.')),
      timeoutMs,
    );
    child.stdout.on('data', (data: Buffer) => {
      bytes += data.length;
      if (bytes > 10 * 1024 * 1024) finish(Error('Off-site backup exceeded its output limit.'));
      else chunks.push(data);
    });
    child.once('error', () => finish(Error('The restic executable is unavailable.')));
    child.once('close', (code) =>
      finish(
        code === 0
          ? undefined
          : Error(
              'Off-site backup failed; inspect the provider privately. No credentials were logged.',
            ),
      ),
    );
  });
}

export function createOffsiteBackup(dataDir: string, env: NodeJS.ProcessEnv = process.env) {
  if (!env.RESTIC_REPOSITORY) return undefined;
  if (env.NODE_ENV === 'production' && /^(rest|s3):http:\/\//.test(env.RESTIC_REPOSITORY))
    throw Error('Production repository transport must use HTTPS.');
  const directory = resolve(dataDir),
    ledger = join(directory, 'deletions.jsonl');
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const runtimeEnv = { ...env, RESTIC_CACHE_DIR: join(directory, 'restic-cache') };
  let busy = false,
    mirroredStamp = '',
    stopped = false;
  function receipt(kind: 'archive' | 'ledger', snapshot: string) {
    const file = join(directory, 'offsite-status.json');
    const previous = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
    const temp = file + '.' + randomUUID();
    writeFileSync(
      temp,
      JSON.stringify({
        ...previous,
        [kind]: { snapshot, completedAt: new Date().toISOString() },
        remote: remoteRepository(env.RESTIC_REPOSITORY!),
      }),
      { mode: 0o600, flag: 'wx' },
    );
    renameSync(temp, file);
  }
  async function snapshot(files: string[], tag: string) {
    const output = await runRestic(
      ['backup', '--tag', tag, '--host', 'jky-folder', '--', ...files],
      runtimeEnv,
    );
    const summary = output
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .find((value) => value.message_type === 'summary');
    if (!summary?.snapshot_id || !/^[0-9a-f]{8,64}$/.test(summary.snapshot_id))
      throw Error('Off-site backup returned no verifiable snapshot identifier.');
    return summary.snapshot_id as string;
  }
  async function mirrorLedger() {
    if (busy || stopped || !existsSync(ledger)) return;
    const stat = statSync(ledger),
      stamp = `${stat.size}:${stat.mtimeMs}`;
    if (stamp === mirroredStamp) return;
    busy = true;
    try {
      const id = await snapshot([ledger], 'jky-erasure-ledger');
      receipt('ledger', id);
      mirroredStamp = stamp;
    } finally {
      busy = false;
    }
  }
  const timer = setInterval(() => {
    void mirrorLedger().catch(() => console.error('backup.ledger_mirror_failed'));
  }, 15000);
  timer.unref();
  return {
    async upload(file: string) {
      const descriptor = openSync(file, 'r');
      try {
        const header = Buffer.alloc(8);
        if (readSync(descriptor, header, 0, 8, 0) !== 8 || header.toString() !== 'JKYBACK1')
          throw Error('Only an encrypted JKY backup archive can be uploaded.');
      } finally {
        closeSync(descriptor);
      }
      const id = await snapshot(
        [resolve(file), ...(existsSync(ledger) ? [ledger] : [])],
        'jky-archive',
      );
      receipt('archive', id);
      return id;
    },
    mirrorLedger,
    stop() {
      stopped = true;
      clearInterval(timer);
    },
    env: runtimeEnv,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (existsSync('.env')) loadEnvFile('.env');
  const [command, argument] = process.argv.slice(2);
  // Providers/repositories are never created automatically in the background.
  if (command === 'init') await runRestic(['init']);
  else if (command === 'check') await runRestic(['check', '--read-data']);
  else if (command === 'snapshots')
    console.log(await runRestic(['snapshots', '--tag', 'jky-archive']));
  else if (command === 'upload' && argument) {
    const service = createOffsiteBackup(process.env.DATA_DIR || '.data');
    if (!service) throw Error('Configure an off-site repository first.');
    try {
      console.log(JSON.stringify({ snapshot: await service.upload(argument) }));
    } finally {
      service.stop();
    }
  } else
    throw Error(
      'Use init, check, snapshots or upload <encrypted-archive>. For recovery, follow the runbook.',
    );
}
