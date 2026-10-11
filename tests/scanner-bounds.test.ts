import { afterEach, expect, it } from 'vitest';
import { createServer, type Socket } from 'node:net';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clamavScanner } from '../server/scan';
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0)) await close();
});
async function fixture(reply: (socket: Socket) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'jky-scan-bounds-')),
    file = join(dir, 'synthetic');
  writeFileSync(file, 'synthetic test only');
  const sockets = new Set<Socket>(),
    server = createServer((socket) => {
      sockets.add(socket);
      socket.on('error', () => {});
      socket.once('close', () => sockets.delete(socket));
      reply(socket);
    });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  cleanup.push(async () => {
    sockets.forEach((s) => s.destroy());
    await new Promise<void>((done) => server.close(() => done()));
    rmSync(dir, { recursive: true, force: true });
  });
  return { file, port: (server.address() as { port: number }).port };
}
it('enforces an absolute scanner deadline even when bytes keep arriving', async () => {
  const f = await fixture((socket) => {
    const timer = setInterval(() => socket.write('x'), 5);
    socket.once('close', () => clearInterval(timer));
  });
  const result = await clamavScanner('127.0.0.1', f.port, 80)(f.file);
  expect(result).toMatchObject({
    status: 'unavailable',
    reason: expect.stringContaining('total time'),
  });
});
it('bounds scanner replies before accepting a status or accumulating unbounded text', async () => {
  const f = await fixture((socket) => socket.write('x'.repeat(8192)));
  expect(await clamavScanner('127.0.0.1', f.port, 500)(f.file)).toMatchObject({
    status: 'error',
    reason: expect.stringContaining('oversized'),
  });
});
