import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { createApp } from './app';
import { outboxTransport, smtpTransport } from './mail';
import { scannerFromEnv } from './scan';
import { startScheduledBackups } from './scheduled-backup';
import { inspectionMode, validateProductionConfig, verifySandbox } from './runtime-config';
import { acquireInstanceLock } from './instance-lock';
if (existsSync('.env')) loadEnvFile('.env');
process.umask(0o077);
validateProductionConfig(process.env);
const mode = inspectionMode(process.env);
if (mode === 'bubblewrap') await verifySandbox();
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';
const dataDir = process.env.DATA_DIR || '.data';
const releaseLock = await acquireInstanceLock(
  dataDir,
  () => {
    console.error('runtime.lock_lost');
    process.exit(1);
  },
  { waitSeconds: process.env.NODE_ENV === 'production' ? 0 : 3 },
);
// SMTP when configured. In development without SMTP, emails go to the local outbox
// (npm run outbox) so password reset and guardian approval work out of the box.
function mailTransport() {
  const choice = process.env.MAIL_TRANSPORT;
  if (choice === 'outbox') return outboxTransport(dataDir);
  if (choice === 'none') return undefined;
  const smtp = smtpTransport();
  if (smtp || process.env.NODE_ENV === 'production') return smtp;
  return outboxTransport(dataDir);
}
const runtime = createApp({
  dataDir,
  origin: process.env.APP_ORIGIN || 'http://localhost:5173',
  production: process.env.NODE_ENV === 'production',
  mail: mailTransport(),
  scan: scannerFromEnv(process.env),
  trustProxy: proxySetting(process.env.TRUST_PROXY),
  inspectionMode: mode,
});
/** TRUST_PROXY: a hop count such as 1 (most hosts), or an Express value such as "loopback". */
function proxySetting(value?: string) {
  if (!value) return undefined;
  return /^\d+$/.test(value) ? Number(value) : value;
}
const backups =
  process.env.BACKUP_DIR && process.env.BACKUP_PASSWORD
    ? startScheduledBackups({
        dataDir,
        directory: process.env.BACKUP_DIR,
        password: process.env.BACKUP_PASSWORD,
        hours: Number(process.env.BACKUP_INTERVAL_HOURS || 24),
        keep: Number(process.env.BACKUP_KEEP || 7),
      })
    : undefined;
const server = runtime.app.listen(port, host, () =>
  console.log(`JKY-Folder API: http://${host}:${port}`),
);
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () =>
    server.close(async () => {
      backups?.stop();
      runtime.close();
      await releaseLock();
      process.exit(0);
    }),
  );
