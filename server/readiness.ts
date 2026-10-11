import { existsSync, statSync, statfsSync, readFileSync, writeFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID } from 'node:crypto';
import Database from 'better-sqlite3';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { validateProductionConfig, verifySandbox } from './runtime-config';
import { smtpTransport, type MailTransport } from './mail';
import { remoteRepository, runRestic, repositoryHash } from './offsite-backup';

export function validArchiveAcknowledgement(
  receipt: unknown,
  env: NodeJS.ProcessEnv,
  now = Date.now(),
) {
  if (!receipt || typeof receipt !== 'object') return false;
  const value = receipt as {
    repositoryHash?: string;
    archive?: { completedAt?: string; snapshot?: string };
  };
  const age = now - Date.parse(value.archive?.completedAt || '');
  const interval = Number(env.BACKUP_INTERVAL_HOURS || 24);
  return (
    !!env.RESTIC_REPOSITORY &&
    value.repositoryHash === repositoryHash(env.RESTIC_REPOSITORY) &&
    /^[a-f0-9]{8,64}$/.test(value.archive?.snapshot || '') &&
    Number.isFinite(interval) &&
    interval >= 1 &&
    interval <= 168 &&
    Number.isFinite(age) &&
    age >= -300000 &&
    age <= interval * 7200000
  );
}
type Check = { id: string; status: 'passed' | 'failed' | 'pending'; detail: string };
export async function preflight(
  env: NodeJS.ProcessEnv,
  options: { smtp?: boolean; repository?: boolean } = {},
) {
  const checks: Check[] = [];
  try {
    validateProductionConfig({ ...env, NODE_ENV: 'production' });
    checks.push({
      id: 'configuration',
      status: 'passed',
      detail: 'Production settings satisfy the runtime requirements.',
    });
  } catch (error) {
    checks.push({ id: 'configuration', status: 'failed', detail: (error as Error).message });
  }
  try {
    await verifySandbox();
    checks.push({
      id: 'parser_isolation',
      status: 'passed',
      detail: 'Actual namespace, read-only input, private-path and network probe passed.',
    });
  } catch {
    checks.push({
      id: 'parser_isolation',
      status: 'failed',
      detail: 'The host cannot run the required parser sandbox.',
    });
  }
  const directory = resolve(env.DATA_DIR || '.data');
  try {
    if (
      statSync(directory).mode & 0o077 ||
      statSync(join(directory, 'metadata.sqlite')).mode & 0o077
    )
      throw Error();
    const db = new Database(join(directory, 'metadata.sqlite'), {
      readonly: true,
      fileMustExist: true,
    });
    try {
      db.prepare('SELECT 1').get();
    } finally {
      db.close();
    }
    const disk = statfsSync(directory);
    if (disk.bavail * disk.bsize < 256 * 1024 * 1024) throw Error();
    checks.push({
      id: 'private_storage',
      status: 'passed',
      detail:
        'Database, owner-only permissions and free space passed. Volume encryption still needs verification.',
    });
  } catch {
    checks.push({
      id: 'private_storage',
      status: 'failed',
      detail: 'Check database, owner-only permissions and free space.',
    });
  }
  checks.push({
    id: 'offsite_configuration',
    status: env.RESTIC_REPOSITORY && remoteRepository(env.RESTIC_REPOSITORY) ? 'passed' : 'pending',
    detail: 'Verify that the remote adapter points to a separate failure domain.',
  });
  if (options.repository) {
    // A readable empty repository alone does not prove a current recoverable archive.
    try {
      await runRestic(['check', '--read-data'], env);
      checks.push({
        id: 'repository_integrity',
        status: 'passed',
        detail: 'Actual encrypted repository integrity check passed.',
      });
    } catch {
      checks.push({
        id: 'repository_integrity',
        status: 'failed',
        detail: 'Check repository credentials and connectivity privately.',
      });
    }
  }
  try {
    const receipt = JSON.parse(readFileSync(join(directory, 'offsite-status.json'), 'utf8'));
    const fresh = validArchiveAcknowledgement(receipt, env);
    checks.push({
      id: 'acknowledged_archive',
      status: fresh ? 'passed' : 'failed',
      detail: fresh
        ? 'Repository acknowledgement is within twice the configured backup interval.'
        : 'The acknowledgement is stale, belongs to another repository or has an invalid snapshot/timestamp.',
    });
  } catch {
    checks.push({
      id: 'acknowledged_archive',
      status: 'pending',
      detail: 'No readable repository acknowledgement exists yet.',
    });
  }
  if (options.smtp) {
    let transport: MailTransport | undefined;
    try {
      transport = smtpTransport(env);
      if (!transport?.verify) throw Error();
      await transport.verify();
      checks.push({
        id: 'smtp_connection',
        status: 'passed',
        detail: 'TLS connection/authentication succeeded. No message was sent.',
      });
    } catch {
      checks.push({
        id: 'smtp_connection',
        status: 'failed',
        detail: 'SMTP authentication failed or is not configured.',
      });
    } finally {
      transport?.close?.();
    }
  }
  for (const id of [
    'storage_encryption',
    'inbox_delivery',
    'real_device_push',
    'independent_source_review',
    'independent_benchmark_labels',
    'external_security_review',
    'privacy_guardian_review',
    'assistive_technology_review',
    'student_pilot',
  ])
    checks.push({
      id,
      status: 'pending',
      detail: 'Requires separate recorded evidence; preflight cannot certify this.',
    });
  return { scope: 'deployment_preflight', createdAt: new Date().toISOString(), checks };
}

/** Read-only by default. --journey creates a synthetic adult account, then erases it. */
export async function verifyDeployment(
  origin: string,
  options: { journey?: boolean; allowLocal?: boolean; expectedOrigin?: string } = {},
) {
  const url = new URL(origin);
  if (
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    !(
      url.protocol === 'https:' ||
      (options.allowLocal &&
        url.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    )
  )
    throw Error('Use an HTTPS origin; --local permits only loopback checks.');
  const checks: Check[] = [
    {
      id: 'https_transport',
      status: url.protocol === 'https:' ? 'passed' : 'pending',
      detail:
        url.protocol === 'https:'
          ? 'TLS certificate checked by the HTTP client.'
          : 'Local HTTP does not verify public HTTPS.',
    },
  ];
  let cookie = '',
    csrf = '';
  const call = (path: string, init: RequestInit = {}) =>
    fetch(url.origin + path, {
      ...init,
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
      headers: {
        Origin: options.expectedOrigin || url.origin,
        ...(cookie ? { Cookie: cookie } : {}),
        ...init.headers,
      },
    });
  const health = await call('/api/health');
  if (
    !health.ok ||
    (await health.json()).status !== 'ok' ||
    !health.headers.get('cache-control')?.includes('no-store')
  )
    throw Error('Database-backed health or private API cache policy failed.');
  checks.push({
    id: 'api_health',
    status: 'passed',
    detail: 'Database-backed health answered with no-store.',
  });
  const home = await call('/');
  if (!home.ok || !home.headers.get('content-type')?.includes('text/html'))
    throw Error('Built frontend did not load.');
  if (
    !home.headers.get('content-security-policy') ||
    !home.headers.get('strict-transport-security') ||
    home.headers.get('x-content-type-options') !== 'nosniff'
  )
    throw Error('Browser security headers are missing.');
  const assets = [
    ...(await home.text()).matchAll(/(?:src|href)="(\/assets\/[^"<>]+\.(?:js|css))"/g),
  ].map((m) => m[1]);
  if (!assets.length) throw Error('Built frontend assets are missing.');
  for (const path of assets) {
    const asset = await call(path);
    if (!asset.ok || asset.headers.get('content-type')?.includes('text/html'))
      throw Error('A frontend asset failed to load.');
  }
  checks.push({
    id: 'frontend',
    status: 'passed',
    detail: 'HTML, built assets and security headers loaded.',
  });
  if (options.journey) {
    try {
      const registration = await call('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Synthetic deployment check',
          email: `deployment-${randomUUID()}@example.test`,
          password: randomBytes(24).toString('hex'),
          adult: true,
          consent: true,
        }),
      });
      const cookies = registration.headers.getSetCookie();
      cookie = cookies.find((c) => c.startsWith('jky_session='))?.split(';')[0] || '';
      const body = await registration.json();
      csrf = body.csrf || '';
      if (registration.status !== 201 || !cookie || !csrf)
        throw Error('Synthetic account could not be created.');
      if (
        !cookies.some(
          (c) =>
            /HttpOnly/i.test(c) &&
            /SameSite=(Strict|Lax)/i.test(c) &&
            (url.protocol !== 'https:' || /;\s*Secure/i.test(c)),
        )
      )
        throw Error('Session cookie protection failed.');
      for (const path of ['/api/packets', '/api/activity', '/api/notifications']) {
        const response = await call(path),
          data = await response.json();
        if (!response.ok || !Array.isArray(data) || data.length)
          throw Error('Fresh account contains workspace data.');
      }
      const pdf = await PDFDocument.create(),
        font = await pdf.embedFont(StandardFonts.Helvetica);
      pdf.addPage().drawText('Synthetic deployment evidence only', { font, x: 40, y: 700 });
      const bytes = Buffer.from(await pdf.save()),
        form = new FormData();
      form.append(
        'file',
        new Blob([bytes], { type: 'application/pdf' }),
        'synthetic-deployment.pdf',
      );
      const upload = await call('/api/intake', {
          method: 'POST',
          headers: { 'x-csrf-token': csrf },
          body: form,
        }),
        intake = await upload.json();
      if (upload.status !== 202 || !intake.packetId) throw Error('Synthetic intake failed.');
      let ready = false;
      for (let attempt = 0; attempt < 60; attempt++) {
        const response = await call(`/api/packets/${intake.packetId}`),
          detail = await response.json(),
          document = detail.documents?.[0];
        if (document?.status === 'error')
          throw Error('Synthetic inspection failed; check scanner and sandbox.');
        if (document?.status === 'ready') {
          const original = await call(
            `/api/packets/${intake.packetId}/documents/${document.id}/content`,
          );
          if (!original.ok || !Buffer.from(await original.arrayBuffer()).equals(bytes))
            throw Error('Downloaded original bytes differ.');
          ready = true;
          break;
        }
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
      }
      if (!ready) throw Error('Synthetic inspection did not finish.');
      checks.push({
        id: 'synthetic_journey',
        status: 'passed',
        detail:
          'Session, empty workspace, actual PDF intake, inspection and exact original download passed.',
      });
    } finally {
      if (cookie && csrf) {
        const removal = await call('/api/account', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
          body: JSON.stringify({ confirmation: 'DELETE' }),
        });
        if (!removal.ok)
          throw Error('Synthetic account cleanup failed. Remove it before continuing the pilot.');
        checks.push({
          id: 'synthetic_cleanup',
          status: 'passed',
          detail: 'Synthetic account and evidence were erased.',
        });
      }
    }
  }
  return { scope: 'deployment_smoke', createdAt: new Date().toISOString(), checks };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (existsSync('.env')) loadEnvFile('.env');
  const args = process.argv.slice(2);
  const result =
    args[0] === 'preflight'
      ? await preflight(process.env, {
          smtp: args.includes('--smtp'),
          repository: args.includes('--repository'),
        })
      : args[0] === 'smoke'
        ? await verifyDeployment(args[1], {
            journey: args.includes('--journey'),
            allowLocal: args.includes('--local'),
          })
        : (() => {
            throw Error(
              'Use preflight [--smtp] [--repository] or smoke <origin> [--journey] [--local], optionally --out <new-file>.',
            );
          })();
  const outputIndex = args.indexOf('--out');
  if (outputIndex >= 0) {
    if (!args[outputIndex + 1]) throw Error('--out requires a new private file.');
    writeFileSync(args[outputIndex + 1], JSON.stringify(result, null, 2) + '\n', {
      mode: 0o600,
      flag: 'wx',
    });
  }
  console.log(JSON.stringify(result, null, 2));
  if (result.checks.some((c) => c.status === 'failed')) process.exitCode = 1;
}
