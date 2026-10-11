import { openSync, closeSync, writeFileSync, renameSync, fsyncSync, rmSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname } from 'node:path';
/** Private, durable atomic evidence. No credentials, identifiers or exception text. */
export function writeOperationalState(file: string, value: unknown) {
  const temporary = file + '.' + randomUUID();
  try {
    writeFileSync(temporary, JSON.stringify(value) + '\n', { mode: 0o600, flag: 'wx' });
    const fd = openSync(temporary, 'r');
    try {
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    renameSync(temporary, file);
    const directory = openSync(dirname(file), 'r');
    try {
      fsyncSync(directory);
    } finally {
      closeSync(directory);
    }
  } finally {
    rmSync(temporary, { force: true });
  }
}
