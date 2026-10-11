import Database from 'better-sqlite3';
import {
  createReadStream,
  openSync,
  closeSync,
  writeSync,
  fsyncSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  mkdtempSync,
  rmSync,
  readdirSync,
  renameSync,
  rmdirSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { loadEnvFile } from 'node:process';
import {
  randomUUID,
  createHash,
  randomBytes,
  scryptSync,
  createCipheriv,
  createDecipheriv,
  createECDH,
} from 'node:crypto';
import { Zip, ZipPassThrough, unzipSync, strToU8, strFromU8 } from 'fflate';
import { createStore } from './store';
import { digest } from './rule-packs';
export async function backup(directory: string, destination: string, password: string) {
  if (password.length < 16) throw Error('BACKUP_PASSWORD must contain at least 16 characters.');
  const temp = mkdtempSync(join(tmpdir(), 'jky-backup-'));
  const partial = destination + '.part-' + randomUUID();
  let reserved = false,
    published = false,
    descriptor: number | undefined;
  let db: Database.Database | undefined;
  try {
    // Reserve without overwriting; the incomplete encrypted stream stays at a different path.
    closeSync(openSync(destination, 'wx', 0o600));
    reserved = true;
    descriptor = openSync(partial, 'wx', 0o600);
    db = new Database(join(directory, 'metadata.sqlite'), { readonly: true, fileMustExist: true });
    await db.backup(join(temp, 'metadata.sqlite'));
    const snapshot = new Database(join(temp, 'metadata.sqlite'), { readonly: true });
    try {
      const rows = snapshot.prepare('SELECT objectKey,payload FROM documents').all() as {
        objectKey: string;
        payload: string;
      }[];
      const salt = randomBytes(16),
        iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', scryptSync(password, salt, 32), iv);
      const write = (bytes: Uint8Array) => {
        let offset = 0;
        while (offset < bytes.length) {
          const written = writeSync(descriptor!, bytes, offset, bytes.length - offset);
          if (!written) throw Error('Backup storage stopped accepting bytes.');
          offset += written;
        }
      };
      write(Buffer.concat([Buffer.from('JKYBACK1'), salt, iv, Buffer.alloc(16)]));
      let finalised = false;
      const zip = new Zip((error, bytes, final) => {
        if (error) throw error;
        write(cipher.update(bytes));
        if (final) {
          write(cipher.final());
          writeSync(descriptor!, cipher.getAuthTag(), 0, 16, 36);
          fsyncSync(descriptor!);
          finalised = true;
        }
      });
      const addBytes = (name: string, bytes: Uint8Array) => {
        const entry = new ZipPassThrough(name);
        zip.add(entry);
        entry.push(bytes, true);
      };
      const addFile = async (name: string, path: string, expectedHash?: string) => {
        const entry = new ZipPassThrough(name);
        zip.add(entry);
        const hash = createHash('sha256');
        for await (const chunk of createReadStream(path, { highWaterMark: 64 * 1024 })) {
          hash.update(chunk);
          entry.push(new Uint8Array(chunk as Buffer));
        }
        if (expectedHash && hash.digest('hex') !== expectedHash)
          throw Error('Object integrity mismatch; backup was not created.');
        entry.push(new Uint8Array(), true);
      };
      await addFile('metadata.sqlite', join(temp, 'metadata.sqlite'));
      for (const row of rows) {
        if (!/^[a-zA-Z0-9-]+$/.test(row.objectKey)) throw Error('Invalid private object key.');
        const hash = JSON.parse(row.payload).hash;
        if (typeof hash !== 'string' || !/^[0-9a-f]{64}$/.test(hash))
          throw Error('Object integrity hash is missing or invalid.');
        await addFile('objects/' + row.objectKey, join(directory, 'objects', row.objectKey), hash);
      }
      if (existsSync(join(directory, 'deletions.jsonl')))
        await addFile('deletions.jsonl', join(directory, 'deletions.jsonl'));
      else addBytes('deletions.jsonl', strToU8(''));
      if (existsSync(join(directory, 'vapid.json')))
        await addFile('vapid.json', join(directory, 'vapid.json'));
      addBytes(
        'manifest.json',
        strToU8(
          JSON.stringify({ version: 1, createdAt: new Date().toISOString(), objects: rows.length }),
        ),
      );
      zip.end();
      if (!finalised) throw Error('Encrypted backup did not finish.');
      closeSync(descriptor);
      descriptor = undefined;
      renameSync(partial, destination);
      published = true;
      const parent = openSync(dirname(resolve(destination)), 'r');
      try {
        fsyncSync(parent);
      } finally {
        closeSync(parent);
      }
    } finally {
      snapshot.close();
    }
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    db?.close();
    if (existsSync(partial)) rmSync(partial);
    if (reserved && !published) rmSync(destination, { force: true });
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
  const destination = resolve(directory);
  mkdirSync(dirname(destination), { recursive: true, mode: 0o700 });
  const staging = mkdtempSync(join(dirname(destination), '.jky-restore-'));
  try {
    mkdirSync(join(staging, 'objects'), { recursive: true, mode: 0o700 });
    for (const [name, data] of Object.entries(files)) {
      if (
        name !== 'metadata.sqlite' &&
        name !== 'deletions.jsonl' &&
        name !== 'vapid.json' &&
        !/^objects\/[a-zA-Z0-9-]+$/.test(name)
      )
        continue;
      writeFileSync(join(staging, name), data, { mode: 0o600, flag: 'wx' });
    }
    const ledger =
      (files['deletions.jsonl'] ? strFromU8(files['deletions.jsonl']) : '') +
      (currentLedger ? readFileSync(currentLedger, 'utf8') : '');
    writeFileSync(join(staging, 'deletions.jsonl'), ledger, { mode: 0o600 });
    const store = createStore(staging);
    try {
      if (
        store.db.pragma('quick_check', { simple: true }) !== 'ok' ||
        (store.db.pragma('foreign_key_check') as unknown[]).length
      )
        throw Error('Restored database integrity failed; recovery remains offline.');
      // Restoring an older snapshot must never resurrect sessions or used account links.
      store.db.prepare('DELETE FROM sessions').run();
      // Recheck reviewer identities after disaster recovery; an old backup may predate a revocation.
      store.db.prepare('DELETE FROM reviewer_keys').run();
      const tables = new Set(
        (
          store.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {
            name: string;
          }[]
        ).map((t) => t.name),
      );
      if (tables.has('account_tokens')) store.db.prepare('DELETE FROM account_tokens').run();
      // A snapshot predating opt-out/revocation must not revive authority to send or view.
      for (const table of ['mail_queue', 'email_verifications', 'push_subscriptions'])
        if (tables.has(table)) store.db.prepare(`DELETE FROM ${table}`).run();
      if (tables.has('support_grants'))
        store.db
          .prepare('UPDATE support_grants SET revokedAt=? WHERE revokedAt IS NULL')
          .run(Date.now());
      store.db
        .prepare(
          "UPDATE notification_preferences SET payload=json_set(payload,'$.email',json('false'))",
        )
        .run();
      if (tables.has('guardianship')) {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        for (const row of store.db
          .prepare("SELECT userId,payload FROM guardianship WHERE status='approved'")
          .all() as { userId: string; payload: string }[]) {
          const previous = JSON.parse(row.payload);
          if (previous.adultOn <= today) continue;
          const record = {
            status: 'pending',
            guardianEmail: previous.guardianEmail,
            adultOn: previous.adultOn,
            requestedAt: new Date().toISOString(),
            requestId: randomUUID(),
            deleteAfter: new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-CA', {
              timeZone: 'Asia/Kolkata',
            }),
          };
          store.db
            .prepare("UPDATE guardianship SET status='pending',payload=? WHERE userId=?")
            .run(JSON.stringify(record), row.userId);
        }
      }
      if (existsSync(join(staging, 'vapid.json'))) {
        const keys = JSON.parse(readFileSync(join(staging, 'vapid.json'), 'utf8'));
        const key = createECDH('prime256v1');
        key.setPrivateKey(Buffer.from(keys.privateKey, 'base64url'));
        if (!key.getPublicKey().equals(Buffer.from(keys.publicKey, 'base64url')))
          throw Error('Restored push keys do not match.');
      }
      for (const row of store.db.prepare('SELECT objectKey,payload FROM documents').all() as {
        objectKey: string;
        payload: string;
      }[]) {
        if (
          digest(readFileSync(join(store.objects, row.objectKey))) !== JSON.parse(row.payload).hash
        )
          throw Error('Restored objects do not match metadata. Keep this recovery offline.');
      }
    } finally {
      store.db.close();
    }
    if (existsSync(destination)) rmdirSync(destination); // only the previously checked empty directory
    renameSync(staging, destination);
  } finally {
    if (existsSync(staging)) rmSync(staging, { recursive: true, force: true });
  }
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  if (existsSync('.env')) loadEnvFile('.env');
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
