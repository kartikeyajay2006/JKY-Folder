import { mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { backup } from './backup';
import { createOffsiteBackup } from './offsite-backup';

const NAME = /^jky-\d{8}-\d{6}\.jkyback$/;
export const backupName = (now = new Date()) =>
  `jky-${now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-')}.jkyback`;

/** Deletes all but the newest `keep` scheduled backups; other files are never touched. */
export function pruneBackups(directory: string, keep: number) {
  if (!Number.isInteger(keep) || keep < 1 || keep > 365)
    throw Error('BACKUP_KEEP must be an integer from 1 to 365.');
  const files = readdirSync(directory)
    .filter((f) => NAME.test(f))
    .sort()
    .reverse();
  for (const old of files.slice(keep)) unlinkSync(join(directory, old));
  return files.slice(keep);
}

/**
 * Encrypted backups on a timer, for single-server deployments. Copy the backup directory to
 * another place (object storage, another disk) as well: a backup on the same disk does not
 * survive the loss of that disk.
 */
export function startScheduledBackups(options: {
  dataDir: string;
  directory: string;
  password: string;
  hours: number;
  keep: number;
}) {
  if (options.password.length < 16)
    throw Error('BACKUP_PASSWORD must contain at least 16 characters.');
  if (
    !Number.isFinite(options.hours) ||
    options.hours < 1 ||
    options.hours > 168 ||
    !Number.isInteger(options.keep) ||
    options.keep < 1 ||
    options.keep > 365
  )
    throw Error('BACKUP_INTERVAL_HOURS must be 1–168 and BACKUP_KEEP an integer from 1–365.');
  mkdirSync(options.directory, { recursive: true, mode: 0o700 });
  const offsite = createOffsiteBackup(options.dataDir);
  let busy = false;
  async function run() {
    if (busy) return;
    busy = true;
    try {
      const archive = join(options.directory, backupName());
      await backup(options.dataDir, archive, options.password);
      await offsite?.upload(archive);
      pruneBackups(options.directory, options.keep);
      console.log('backup.completed');
    } catch {
      // A document deleted mid-backup fails the integrity check; the next run retries.
      console.error('backup.failed');
    } finally {
      busy = false;
    }
  }
  const first = setTimeout(() => void run(), 60000);
  const timer = setInterval(() => void run(), options.hours * 3600000);
  first.unref();
  timer.unref();
  return {
    run,
    stop: () => {
      clearTimeout(first);
      clearInterval(timer);
      offsite?.stop();
    },
  };
}
