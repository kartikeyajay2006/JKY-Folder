import { expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { createApp } from '../server/app';
import { backup, restore } from '../server/backup';
import { digest } from '../server/rule-packs';
import { emptyProfile } from '../shared/model';
import { startJobs } from '../server/jobs';
it('holds restored under-18 jobs without starving adult work and resumes only after renewed approval', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-guardian-worker-')),
    active = join(dir, 'active'),
    target = join(dir, 'restored'),
    archive = join(dir, 'archive.jkyback');
  let runtime = createApp({ dataDir: active, jobs: false, background: false }),
    stop: (() => void) | undefined;
  try {
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Synthetic restored consent boundary');
    const bytes = Buffer.from(await pdf.save());
    for (const id of ['minor', 'adult']) {
      runtime.store.db
        .prepare('INSERT INTO users VALUES(?,?,?,?,?,?)')
        .run(id, 'Synthetic ' + id, id + '@example.test', 'hash', 0, new Date().toISOString());
      const packet = {
        id,
        mode: 'uploads',
        title: 'Synthetic',
        revision: 1,
        profile: emptyProfile,
        links: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      runtime.store.db
        .prepare('INSERT INTO packets VALUES(?,?,?)')
        .run(id, id, JSON.stringify(packet));
      const document = {
        id,
        packetId: id,
        name: id + '.pdf',
        size: bytes.length,
        hash: digest(bytes),
        mime: 'application/pdf',
        status: 'processing',
        pageCount: 0,
        pages: [],
        createdAt: new Date().toISOString(),
      };
      writeFileSync(join(runtime.store.objects, id), bytes);
      runtime.store.db
        .prepare('INSERT INTO documents VALUES(?,?,?,?)')
        .run(id, id, id, JSON.stringify(document));
      runtime.store.db.prepare("INSERT INTO jobs VALUES(?,?,'processing')").run(id, id);
    }
    const guardian = {
      status: 'approved',
      adultOn: '2999-01-01',
      guardianEmail: 'guardian@example.test',
      requestId: 'synthetic',
    };
    runtime.store.db
      .prepare('INSERT INTO guardianship VALUES(?,?,?)')
      .run('minor', 'approved', JSON.stringify(guardian));
    await backup(active, archive, 'synthetic-long-password');
    runtime.close();
    restore(archive, target, 'synthetic-long-password');
    runtime = createApp({ dataDir: target, jobs: false, background: false });
    const scan = vi.fn(async () => ({ status: 'clean' as const }));
    stop = startJobs(runtime.store, scan);
    const ready = async (id: string) => {
      for (let i = 0; i < 100; i++) {
        if (runtime.store.documents(id)[0]?.status === 'ready') return;
        await new Promise((done) => setTimeout(done, 100));
      }
      throw Error('Worker did not become ready.');
    };
    await ready('adult');
    await new Promise((done) => setTimeout(done, 400));
    expect(runtime.store.documents('minor')[0].status).toBe('processing');
    expect(scan).toHaveBeenCalledTimes(1);
    expect(
      runtime.store.db.prepare("SELECT * FROM job_attempts WHERE id='minor'").get(),
    ).toBeUndefined();
    expect(runtime.store.db.prepare("SELECT status FROM jobs WHERE id='minor'").get()).toEqual({
      status: 'queued',
    });
    runtime.store.db
      .prepare("UPDATE guardianship SET status='approved',payload=? WHERE userId='minor'")
      .run(JSON.stringify(guardian));
    await ready('minor');
    expect(scan).toHaveBeenCalledTimes(2);
  } finally {
    stop?.();
    runtime.close();
    rmSync(dir, { recursive: true, force: true });
  }
}, 30000);
