import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { createApp } from './app';
import { createStore } from './store';
import { backup, restore } from './backup';
import { createOffsiteBackup, runRestic } from './offsite-backup';
import type { InspectionMode } from './inspection';

/** Real encrypted repository operations against only disposable synthetic data. */
export async function rehearseRecovery(
  options: { resticBinary?: string; mode?: InspectionMode } = {},
) {
  const directory = mkdtempSync(join(tmpdir(), 'jky-recovery-rehearsal-')),
    active = join(directory, 'active'),
    archive = join(directory, 'packet.jkyback');
  const env = {
    PATH: process.env.PATH,
    RESTIC_BINARY: options.resticBinary || process.env.RESTIC_BINARY || 'restic',
    RESTIC_REPOSITORY: join(directory, 'repository'),
    RESTIC_PASSWORD: randomBytes(24).toString('hex'),
  };
  const password = randomBytes(24).toString('hex'),
    mode = options.mode || 'process',
    started = performance.now();
  if (!['process', 'bubblewrap'].includes(mode)) {
    rmSync(directory, { recursive: true, force: true });
    throw Error('Choose process or bubblewrap.');
  }
  const runtime = createApp({
      dataDir: active,
      background: false,
      inspectionMode: mode,
      scan: async () => ({ status: 'clean' }),
    }),
    server = runtime.app.listen(0, '127.0.0.1');
  const service = createOffsiteBackup(active, env)!;
  let closed = false;
  try {
    await new Promise<void>((done, error) => {
      server.once('listening', done);
      server.once('error', error);
    });
    const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const call = (path: string, cookie = '', init: RequestInit = {}) =>
      fetch(origin + path, {
        ...init,
        redirect: 'error',
        signal: AbortSignal.timeout(10000),
        headers: { ...(cookie ? { Cookie: cookie } : {}), ...init.headers },
      });
    async function account(name: string) {
      const response = await call('/api/auth/register', '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Synthetic ' + name,
          email: name + '@example.test',
          password: 'Synthetic-Recovery-Password-42!',
          adult: true,
          consent: true,
        }),
      });
      const body = await response.json(),
        cookie = response.headers
          .getSetCookie()
          .find((c) => c.startsWith('jky_session='))
          ?.split(';')[0];
      if (response.status !== 201 || !cookie || !body.csrf || !body.user?.id)
        throw Error('Synthetic account setup failed.');
      return { cookie, csrf: body.csrf as string, id: body.user.id as string };
    }
    const a = await account('erased-account'),
      b = await account('retained-account');
    async function document(owner: typeof a, label: string) {
      const pdf = await PDFDocument.create(),
        font = await pdf.embedFont(StandardFonts.Helvetica);
      pdf.addPage().drawText('Synthetic recovery original ' + label, { font, x: 40, y: 700 });
      const bytes = Buffer.from(await pdf.save()),
        form = new FormData();
      form.append('file', new Blob([bytes], { type: 'application/pdf' }), label + '.pdf');
      const response = await call('/api/intake', owner.cookie, {
          method: 'POST',
          headers: { 'x-csrf-token': owner.csrf },
          body: form,
        }),
        body = await response.json();
      if (response.status !== 202) throw Error('Synthetic intake failed.');
      for (let attempt = 0; attempt < 120; attempt++) {
        const detail = await (await call('/api/packets/' + body.packetId, owner.cookie)).json(),
          doc = detail.documents?.[0];
        if (doc?.status === 'error') throw Error('Synthetic inspection failed.');
        if (doc?.status === 'ready')
          return { bytes, packetId: body.packetId as string, id: doc.id as string };
        await new Promise((done) => setTimeout(done, 500));
      }
      throw Error('Synthetic inspection timed out.');
    }
    const erasedAccount = await document(a, 'account-erasure'),
      erasedDoc = await document(b, 'document-erasure'),
      kept = await document(b, 'retained');
    await runRestic(['init'], env);
    await backup(active, archive, password);
    await service.upload(archive);
    const deletion = await call('/api/account', a.cookie, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': a.csrf },
      body: JSON.stringify({ confirmation: 'DELETE' }),
    });
    if (!deletion.ok) throw Error('Synthetic account erasure failed.');
    const current = await (await call('/api/packets/' + erasedDoc.packetId, b.cookie)).json();
    const docDeletion = await call(
      `/api/packets/${erasedDoc.packetId}/documents/${erasedDoc.id}`,
      b.cookie,
      {
        method: 'DELETE',
        headers: { 'x-csrf-token': b.csrf, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectedRevision: current.packet.revision }),
      },
    );
    if (!docDeletion.ok) throw Error('Synthetic document erasure failed.');
    await service.mirrorLedger();
    await new Promise<void>((done) => server.close(() => done()));
    runtime.close();
    closed = true;
    await runRestic(['check', '--read-data'], env);
    const receipt = JSON.parse(readFileSync(join(active, 'offsite-status.json'), 'utf8')),
      download = join(directory, 'download');
    // Exact acknowledgements, never unqualified "latest" across different snapshot tags.
    await runRestic(['restore', receipt.archive.snapshot, '--target', download], env);
    await runRestic(['restore', receipt.ledger.snapshot, '--target', download], env);
    const recoveredPath = join(directory, 'recovered');
    restore(
      join(download, archive),
      recoveredPath,
      password,
      join(download, active, 'deletions.jsonl'),
    );
    const recovered = createStore(recoveredPath);
    try {
      const row = recovered.db
        .prepare('SELECT objectKey FROM documents WHERE id=?')
        .get(kept.id) as { objectKey: string } | undefined;
      const checks = {
        exactOriginal:
          !!row && readFileSync(join(recovered.objects, row.objectKey)).equals(kept.bytes),
        accountErasure: !recovered.db.prepare('SELECT 1 FROM users WHERE id=?').get(a.id),
        erasedAccountOriginal: !recovered.db
          .prepare('SELECT 1 FROM documents WHERE id=?')
          .get(erasedAccount.id),
        documentErasure: !recovered.db
          .prepare('SELECT 1 FROM documents WHERE id=?')
          .get(erasedDoc.id),
        sessionsRevoked:
          (recovered.db.prepare('SELECT count(*) n FROM sessions').get() as { n: number }).n === 0,
        reviewerAuthorityCleared:
          (recovered.db.prepare('SELECT count(*) n FROM reviewer_keys').get() as { n: number })
            .n === 0,
        databaseIntegrity: recovered.db.pragma('quick_check', { simple: true }) === 'ok',
      };
      return {
        version: 1,
        scope: 'synthetic_local_repository_recovery',
        createdAt: new Date().toISOString(),
        mode,
        passed: Object.values(checks).every(Boolean),
        checks,
        archiveSnapshot: receipt.archive.snapshot,
        ledgerSnapshot: receipt.ledger.snapshot,
        elapsedSeconds: (performance.now() - started) / 1000,
        limitations: [
          'Actual encrypted repository, restore, original integrity and newer erasures were exercised using only synthetic data.',
          'The repository is disposable and local, so this is not evidence of a separate failure domain, volume encryption, a retention decision or real disaster recovery targets.',
          'Scanner responses are a fixture; actual ClamAV engine and provider operations need separate deployment evidence.',
        ],
      };
    } finally {
      recovered.db.close();
    }
  } finally {
    service.stop();
    if (!closed) {
      await new Promise<void>((done) => server.close(() => done()));
      runtime.close();
    }
    rmSync(directory, { recursive: true, force: true });
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2),
    report = await rehearseRecovery({
      mode: args.includes('--sandbox') ? 'bubblewrap' : 'process',
    });
  const index = args.indexOf('--out');
  if (index >= 0) {
    if (!args[index + 1]) throw Error('Use a new private output file.');
    writeFileSync(args[index + 1], JSON.stringify(report, null, 2) + '\n', {
      mode: 0o600,
      flag: 'wx',
    });
  }
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}
