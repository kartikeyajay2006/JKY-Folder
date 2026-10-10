import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createServer, type Server } from 'node:net';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { createApp } from '../server/app';
import { clamavScanner, type Scanner } from '../server/scan';
import { backupName, pruneBackups } from '../server/scheduled-backup';
import { classifyDocument, typeForRequirement } from '../shared/classify';
import { suggestEvidence } from '../shared/facts';
import type { DocumentRecord, Packet, PacketDetail, RulePack } from '../shared/model';
import { emptyProfile } from '../shared/model';

const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()!();
});
const temp = (prefix: string) => {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  cleanups.push(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
};
const doc = (name: string, text: string, extra: Partial<DocumentRecord> = {}): DocumentRecord => ({
  id: name,
  packetId: 'p',
  name,
  size: 1000,
  hash: name,
  mime: name.endsWith('.jpg') ? 'image/jpeg' : 'application/pdf',
  status: 'ready',
  pageCount: 1,
  pages: [{ number: 1, text, method: 'native', confidence: 100 }],
  createdAt: '2026-10-11',
  ...extra,
});

describe('recognising document types', () => {
  it('reads the document’s own wording and its file name', () => {
    expect(
      classifyDocument(
        doc('scan1.pdf', 'Unique Identification Authority of India\n1234 5678 9012'),
      ),
    ).toMatchObject({ id: 'aadhaar', label: 'Aadhaar card' });
    expect(
      classifyDocument(doc('result.pdf', 'Central Board\nSecondary School Examination 2024')),
    ).toMatchObject({ id: 'class10' });
    expect(
      classifyDocument(doc('result.pdf', 'Senior School Certificate Examination\nClass XII')),
    ).toMatchObject({ id: 'class12' });
    expect(
      classifyDocument(
        doc(
          'certificate.pdf',
          'This is to certify ... belongs to Other Backward Class (Non-Creamy Layer)',
        ),
      ),
    ).toMatchObject({ id: 'category' });
    expect(classifyDocument(doc('obc-certificate.pdf', ''))).toMatchObject({ id: 'category' });
  });
  it('does not guess from weak or misleading signals', () => {
    expect(classifyDocument(doc('st-xavier-school.pdf', 'Annual day programme'))).toBeNull();
    expect(classifyDocument(doc('notes.pdf', 'Meeting notes'))).toBeNull();
    expect(classifyDocument({ ...doc('aadhaar.pdf', ''), status: 'processing' })).toBeNull();
  });
  it('tells photographs from signatures by their shape', () => {
    const image = (name: string, width: number, height: number) =>
      doc(name, '', { mime: 'image/jpeg', width, height, pages: [{ number: 1, text: '' }] });
    expect(classifyDocument(image('IMG_2041.jpg', 600, 750))).toBeNull();
    expect(classifyDocument(image('my-photo.jpg', 600, 750))).toMatchObject({ id: 'photo' });
    expect(classifyDocument(image('sign.jpg', 900, 300))).toMatchObject({ id: 'signature' });
  });
  it('suggests a matching document for a checklist item', () => {
    expect(typeForRequirement('Category certificate')?.id).toBe('category');
    expect(typeForRequirement('Recent photograph')?.id).toBe('photo');
    const packet = {
      id: 'p',
      title: 'UCEED',
      packId: 'x',
      revision: 1,
      profile: emptyProfile,
      links: {},
      createdAt: '',
      updatedAt: '',
    } as Packet;
    const pack = {
      sourceUrl: '',
      requirements: [
        {
          id: 'id',
          title: 'Aadhaar card',
          description: 'Identity proof',
          group: 'Identity',
          condition: { op: 'always' },
          mime: 'any',
          extension: 'any',
          sourceSection: '',
          reviewHint: '',
        },
      ],
    } as unknown as RulePack;
    const [suggestion] = suggestEvidence(
      packet,
      [doc('scan1.pdf', 'Unique Identification Authority of India')],
      pack,
    );
    expect(suggestion).toMatchObject({ requirementId: 'id', documentId: 'scan1.pdf' });
    expect(suggestion.reason).toContain('Looks like: Aadhaar card');
  });
});

/** A stand-in clamd that answers every scan with the given reply. */
async function fakeClamd(reply: (data: Buffer) => string | null) {
  const server: Server = createServer((socket) => {
    let received = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      received = Buffer.concat([received, chunk as Buffer]);
      // The stream ends with a zero-length chunk.
      if (received.subarray(-4).equals(Buffer.alloc(4))) {
        const answer = reply(received);
        if (answer === null) socket.destroy();
        else socket.end(answer + '\0');
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  cleanups.push(() => new Promise<void>((resolve) => server.close(() => resolve())));
  return (server.address() as { port: number }).port;
}

describe('virus scanning', () => {
  it('streams files to clamd and reads its verdict', async () => {
    const dir = temp('jky-scan-');
    const file = join(dir, 'f');
    writeFileSync(file, Buffer.from('X5O!P%@AP-EICAR-like test bytes'));
    const clean = await fakeClamd((data) => {
      expect(data.subarray(0, 10).toString()).toBe('zINSTREAM\0');
      return 'stream: OK';
    });
    expect(await clamavScanner('127.0.0.1', clean)(file)).toEqual({ status: 'clean' });
    const infected = await fakeClamd(() => 'stream: Eicar-Test-Signature FOUND');
    expect(await clamavScanner('127.0.0.1', infected)(file)).toEqual({
      status: 'infected',
      name: 'Eicar-Test-Signature',
    });
    const limit = await fakeClamd(() => 'INSTREAM size limit exceeded. ERROR');
    expect((await clamavScanner('127.0.0.1', limit)(file)).status).toBe('error');
    const closed = await fakeClamd(() => null);
    expect((await clamavScanner('127.0.0.1', closed)(file)).status).toBe('unavailable');
    expect((await clamavScanner('127.0.0.1', 1)(file)).status).toBe('unavailable');
    expect((await clamavScanner('127.0.0.1', clean)(join(dir, 'missing'))).status).toBe('error');
  });
  it('deletes an infected upload unopened, and waits while the scanner is down', async () => {
    let verdict: Awaited<ReturnType<Scanner>> = {
      status: 'infected',
      name: 'Eicar-Test-Signature',
    };
    const dir = temp('jky-scan-app-');
    const runtime = createApp({
      dataDir: dir,
      background: false,
      scan: async () => verdict,
    });
    cleanups.push(() => runtime.close());
    const agent = request.agent(runtime.app);
    const auth = await agent.post('/api/auth/register').send({
      name: 'Scan Applicant',
      email: 'scan@example.test',
      password: 'a-strong-test-password',
      adult: true,
      consent: true,
    });
    const pdf = await PDFDocument.create();
    pdf.addPage();
    const bytes = Buffer.from(await pdf.save());
    const upload = async (name: string) =>
      (
        await agent
          .post('/api/intake')
          .set('x-csrf-token', auth.body.csrf)
          .attach('file', Buffer.concat([bytes, Buffer.from(`%${name}\n`)]), name)
      ).body as { packetId: string; document: DocumentRecord };
    const first = await upload('infected.pdf');
    let detail: PacketDetail | undefined;
    for (let i = 0; i < 100; i++) {
      detail = (await agent.get(`/api/packets/${first.packetId}`)).body;
      if (detail!.documents[0].status !== 'processing') break;
      await new Promise((r) => setTimeout(r, 50));
    }
    expect(detail!.documents[0].status).toBe('error');
    expect(detail!.documents[0].error).toContain('Eicar-Test-Signature');
    const key = (
      runtime.store.db.prepare('SELECT objectKey FROM documents').get() as { objectKey: string }
    ).objectKey;
    expect(existsSync(join(dir, 'objects', key))).toBe(false);
    verdict = { status: 'unavailable', reason: 'down' };
    const second = await upload('waiting.pdf');
    await new Promise((r) => setTimeout(r, 1000));
    const waiting = (await agent.get(`/api/packets/${second.packetId}`)).body as PacketDetail;
    expect(waiting.documents[0].status).toBe('processing');
  });
});

describe('operations', () => {
  it('keeps only the newest scheduled backups and never touches other files', () => {
    const dir = temp('jky-backups-');
    const names = [1, 2, 3, 4].map((d) => backupName(new Date(Date.UTC(2026, 9, d, 2))));
    for (const n of [...names, 'notes.txt']) writeFileSync(join(dir, n), 'x');
    expect(pruneBackups(dir, 2)).toEqual([names[1], names[0]]);
    expect(existsSync(join(dir, names[3]))).toBe(true);
    expect(existsSync(join(dir, 'notes.txt'))).toBe(true);
  });
  it('reports health and honours the proxy setting', async () => {
    const runtime = createApp({
      dataDir: temp('jky-ops-'),
      jobs: false,
      background: false,
      trustProxy: 1,
    });
    cleanups.push(() => runtime.close());
    expect(runtime.app.get('trust proxy')).toBe(1);
    const health = await request(runtime.app).get('/api/health');
    expect(health.body).toEqual({ status: 'ok', version: '0.1.0' });
  });
  it('ships an installable app manifest with real icons', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
    expect(manifest).toMatchObject({ display: 'standalone', start_url: '/' });
    for (const icon of manifest.icons) expect(existsSync(join('public', icon.src))).toBe(true);
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
    const worker = readFileSync('public/sw.js', 'utf8');
    expect(worker).toContain("url.pathname.startsWith('/api/')");
  });
});
