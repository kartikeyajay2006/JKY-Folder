import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
const privatePaths = ['/data', '/backups', '/runtime/server', '/runtime/.env', '/home'];
let readonly = false;
try {
  writeFileSync('/input/document', 'changed');
} catch {
  readonly = true;
}
const networkBlocked = await new Promise((resolve) => {
  const socket = connect({ host: '1.1.1.1', port: 443 });
  socket.setTimeout(1000, () => {
    socket.destroy();
    resolve(true);
  });
  socket.once('error', () => resolve(true));
  socket.once('connect', () => {
    socket.destroy();
    resolve(false);
  });
});
const ok =
  readonly &&
  networkBlocked &&
  privatePaths.every((p) => !existsSync(p)) &&
  !Object.keys(process.env).some((k) => /SMTP|PASSWORD|BACKUP|VAPID|RESTIC|AWS/.test(k)) &&
  readFileSync(process.argv[2], 'utf8') === 'synthetic sandbox probe';
process.stdout.write(
  JSON.stringify(
    ok
      ? {
          ok: true,
          result: {
            mime: 'application/pdf',
            pageCount: 1,
            pages: [{ number: 1, text: 'isolated' }],
            extractionVersion: 'probe.1',
          },
        }
      : { ok: false, error: 'Isolation probe failed.' },
  ),
);
