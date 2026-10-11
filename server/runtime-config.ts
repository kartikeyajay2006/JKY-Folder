import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectFile, type InspectionMode } from './inspection';

export function inspectionMode(env: NodeJS.ProcessEnv): InspectionMode {
  const mode = env.INSPECTION_MODE || (env.NODE_ENV === 'production' ? 'bubblewrap' : 'process');
  if (mode !== 'process' && mode !== 'bubblewrap')
    throw Error('INSPECTION_MODE must be process or bubblewrap.');
  if (env.NODE_ENV === 'production' && mode !== 'bubblewrap')
    throw Error(
      'Production requires INSPECTION_MODE=bubblewrap; there is no unsandboxed fallback.',
    );
  return mode;
}

export function validateProductionConfig(env: NodeJS.ProcessEnv) {
  if (env.NODE_ENV !== 'production') return;
  let origin: URL;
  try {
    origin = new URL(env.APP_ORIGIN || '');
  } catch {
    throw Error('Production requires a valid HTTPS APP_ORIGIN.');
  }
  if (
    origin.protocol !== 'https:' ||
    origin.username ||
    origin.password ||
    origin.search ||
    origin.hash ||
    origin.pathname !== '/'
  )
    throw Error('APP_ORIGIN must be an HTTPS origin without credentials, path, query or fragment.');
  inspectionMode(env);
  if (!env.CLAMAV_HOST)
    throw Error('Production requires CLAMAV_HOST; uploads must be scanned before parsing.');
  if (
    env.MAIL_TRANSPORT === 'outbox' ||
    env.MAIL_TRANSPORT === 'none' ||
    !env.SMTP_HOST ||
    !env.MAIL_FROM
  )
    throw Error('Production requires SMTP and MAIL_FROM for account recovery.');
  if (!env.BACKUP_DIR || !env.BACKUP_PASSWORD || env.BACKUP_PASSWORD.length < 16)
    throw Error(
      'Production requires encrypted scheduled backups and a BACKUP_PASSWORD of at least 16 characters.',
    );
}

export async function verifySandbox() {
  const directory = mkdtempSync(join(tmpdir(), 'jky-isolation-'));
  try {
    const file = join(directory, 'probe');
    writeFileSync(file, 'synthetic sandbox probe', { mode: 0o600 });
    const result = await inspectFile(file, {
      mode: 'bubblewrap',
      program: join(dirname(fileURLToPath(import.meta.url)), 'sandbox-probe.mjs'),
      timeoutMs: 5000,
    });
    if (!result.ok)
      throw Error(
        'Parser isolation probe failed. Check bubblewrap, user namespaces and host security policy before starting production.',
      );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
