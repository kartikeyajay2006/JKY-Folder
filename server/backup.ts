import Database from 'better-sqlite3';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  mkdtempSync,
  rmSync,
  readdirSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from 'node:crypto';
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { createStore } from './store';
import { digest } from './rule-packs';
export async function backup(directory: string, destination: string, password: string) {
  if (password.length < 16) throw Error('BACKUP_PASSWORD must contain at least 16 characters.');
  const temp = mkdtempSync(join(tmpdir(), 'jky-backup-'));
  const db = new Database(join(directory, 'metadata.sqlite'), {
    readonly: true,
    fileMustExist: true,
  });
  try {
    await db.backup(join(temp, 'metadata.sqlite'));
    const snapshot = new Database(join(temp, 'metadata.sqlite'), { readonly: true });
    try {
      const files: Record<string, Uint8Array> = {
        'metadata.sqlite': readFileSync(join(temp, 'metadata.sqlite')),
      };
      const rows = snapshot.prepare('SELECT objectKey,payload FROM documents').all() as {
        objectKey: string;
        payload: string;
      }[];
      for (const row of rows) {
        const bytes = readFileSync(join(directory, 'objects', row.objectKey));
        if (digest(bytes) !== JSON.parse(row.payload).hash)
          throw Error('Object integrity mismatch; backup was not created.');
        files['objects/' + row.objectKey] = bytes;
      }
      files['deletions.jsonl'] = existsSync(join(directory, 'deletions.jsonl'))
        ? readFileSync(join(directory, 'deletions.jsonl'))
        : strToU8('');
      files['manifest.json'] = strToU8(
        JSON.stringify({ version: 1, createdAt: new Date().toISOString(), objects: rows.length }),
      );
      const salt = randomBytes(16),
        iv = randomBytes(12),
        key = scryptSync(password, salt, 32),
        cipher = createCipheriv('aes-256-gcm', key, iv);
      const encrypted = Buffer.concat([
        cipher.update(zipSync(files, { level: 0 })),
        cipher.final(),
      ]);
      writeFileSync(
        destination,
        Buffer.concat([Buffer.from('JKYBACK1'), salt, iv, cipher.getAuthTag(), encrypted]),
        { mode: 0o600, flag: 'wx' },
      );
    } finally {
      snapshot.close();
    }
  } finally {
    db.close();
    rmSync(temp, { recursive: true, force: true });
  }
}
export function restore(
  source: string,
  directory: string,
  password: string,
  currentLedger?: string,
) {
  if (existsSync(directory) && readdirSync(directory).length)
    throw Error('Restore into an empty directory; never overwrite an active workspace.');
  const bytes = readFileSync(source);
  if (bytes.subarray(0, 8).toString() !== 'JKYBACK1') throw Error('Unknown backup format.');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    scryptSync(password, bytes.subarray(8, 24), 32),
    bytes.subarray(24, 36),
  );
  decipher.setAuthTag(bytes.subarray(36, 52));
  const files = unzipSync(Buffer.concat([decipher.update(bytes.subarray(52)), decipher.final()]));
  if (
    !files['metadata.sqlite'] ||
    !files['manifest.json'] ||
    JSON.parse(strFromU8(files['manifest.json'])).version !== 1
  )
    throw Error('Invalid backup manifest.');
  mkdirSync(join(directory, 'objects'), { recursive: true, mode: 0o700 });
  for (const [name, data] of Object.entries(files)) {
    if (
      name !== 'metadata.sqlite' &&
      name !== 'deletions.jsonl' &&
      !/^objects\/[a-zA-Z0-9-]+$/.test(name)
    )
      continue;
    writeFileSync(join(directory, name), data, { mode: 0o600, flag: 'wx' });
  }
  const ledger =
    (files['deletions.jsonl'] ? strFromU8(files['deletions.jsonl']) : '') +
    (currentLedger ? readFileSync(currentLedger, 'utf8') : '');
  writeFileSync(join(directory, 'deletions.jsonl'), ledger, { mode: 0o600 });
  const store = createStore(directory);
  try {
    for (const row of store.db.prepare('SELECT objectKey,payload FROM documents').all() as {
      objectKey: string;
      payload: string;
    }[]) {
      if (digest(readFileSync(join(store.objects, row.objectKey))) !== JSON.parse(row.payload).hash)
        throw Error('Restored objects do not match metadata. Keep this recovery offline.');
    }
  } finally {
    store.db.close();
  }
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const [command, file, target] = process.argv.slice(2),
    password = process.env.BACKUP_PASSWORD || '';
  if (command === 'backup') await backup(process.env.DATA_DIR || '.data', file, password);
  else if (command === 'restore') {
    if (!target || !process.env.DELETION_LEDGER)
      throw Error(
        'Restore requires a new target and DELETION_LEDGER pointing to the current deletion ledger.',
      );
    restore(file, target, password, process.env.DELETION_LEDGER);
  } else
    throw Error('Use backup <new-file> or restore <file> <new-directory>. Stop the server first.');
  console.log('Recovery operation completed.');
}
