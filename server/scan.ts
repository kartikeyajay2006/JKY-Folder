import { connect } from 'node:net';
import { readFileSync } from 'node:fs';

export type ScanResult =
  | { status: 'clean' }
  | { status: 'infected'; name: string }
  /** The scanner answered but could not check this file (for example, it is too large). */
  | { status: 'error'; reason: string }
  /** The scanner could not be reached; the file waits rather than being opened unscanned. */
  | { status: 'unavailable'; reason: string };
export type Scanner = (path: string) => Promise<ScanResult>;

/**
 * Streams a file to a ClamAV daemon (clamd) with the INSTREAM command and reads its verdict.
 * Run clamd beside the server (see docker-compose.yml) and set CLAMAV_HOST.
 */
export function clamavScanner(host: string, port = 3310, timeoutMs = 60000): Scanner {
  return (path) =>
    new Promise((resolve) => {
      let bytes: Buffer;
      try {
        bytes = readFileSync(path);
      } catch {
        resolve({ status: 'error', reason: 'The stored file is missing.' });
        return;
      }
      const socket = connect({ host, port });
      let reply = '',
        done = false;
      const finish = (result: ScanResult) => {
        if (done) return;
        done = true;
        socket.destroy();
        resolve(result);
      };
      const read = () => {
        const text = reply.replace(/\0/g, '').trim();
        if (!text) return;
        if (/:\s*OK$/.test(text)) finish({ status: 'clean' });
        else if (/FOUND$/.test(text))
          finish({
            status: 'infected',
            name: text.replace(/^[^:]*:\s*/, '').replace(/\s*FOUND$/, '') || 'malware',
          });
        else finish({ status: 'error', reason: text.slice(0, 200) });
      };
      socket.setTimeout(timeoutMs, () =>
        finish({ status: 'unavailable', reason: 'The virus scanner did not answer in time.' }),
      );
      socket.on('error', (error) => finish({ status: 'unavailable', reason: error.message }));
      socket.on('data', (data) => {
        reply += data.toString();
        if (reply.includes('\0') || reply.includes('\n')) read();
      });
      socket.on('end', read);
      socket.on('close', () =>
        finish({ status: 'unavailable', reason: 'The virus scanner closed the connection.' }),
      );
      socket.on('connect', () => {
        socket.write('zINSTREAM\0');
        for (let offset = 0; offset < bytes.length; offset += 64 * 1024) {
          const chunk = bytes.subarray(offset, offset + 64 * 1024);
          const size = Buffer.alloc(4);
          size.writeUInt32BE(chunk.length);
          socket.write(size);
          socket.write(chunk);
        }
        socket.write(Buffer.alloc(4));
      });
    });
}

/** A scanner when CLAMAV_HOST is set; otherwise uploads are inspected without one. */
export function scannerFromEnv(env: NodeJS.ProcessEnv): Scanner | undefined {
  if (!env.CLAMAV_HOST) return undefined;
  const port = Number(env.CLAMAV_PORT || 3310);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Invalid CLAMAV_PORT.');
  return clamavScanner(env.CLAMAV_HOST, port);
}
