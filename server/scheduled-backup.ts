import { mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { backup } from './backup';

const NAME = /^jky-\d{8}-\d{6}\.jkyback$/;
export const backupName = (now = new Date()) =>
  `jky-${now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-')}.jkyback`;

/** Deletes all but the newest `keep` scheduled backups; other files are never touched. */
export function pruneBackups(directory: string, keep: number) {
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
  if (!(options.hours >= 1) || !(options.keep >= 1))
    throw Error('BACKUP_INTERVAL_HOURS and BACKUP_KEEP must be at least 1.');
  mkdirSync(options.directory, { recursive: true, mode: 0o700 });
  let busy = false;
  async function run() {
    if (busy) return;
    busy = true;
    try {
      await backup(options.dataDir, join(options.directory, backupName()), options.password);
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
    },
  };
}
