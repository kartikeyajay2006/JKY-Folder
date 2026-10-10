import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { createCanvas } from '@napi-rs/canvas';
import { createApp } from '../server/app';
import { certainlyAged } from '../server/guardian';
import { compareDates, compareIdentity, compareNames, parseDate } from '../shared/identity';
import { extractFacts } from '../shared/facts';
import type { MailMessage } from '../server/mail';
import type { DocumentRecord, LibraryDocument, PacketDetail } from '../shared/model';

const cleanups: (() => void)[] = [];
afterEach(() => {
  while (cleanups.length) cleanups.pop()!();
});
function server(options: { jobs?: boolean; mail?: MailMessage[] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'jky-tools-'));
  const runtime = createApp({
    dataDir: dir,
    jobs: options.jobs ?? true,
    background: false,
    ...(options.mail
      ? {
          mail: {
            label: 'smtp' as const,
            send: async (m: MailMessage) => void options.mail!.push(m),
          },
        }
      : {}),
  });
  cleanups.push(() => {
    runtime.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return runtime;
}
type Runtime = ReturnType<typeof server>;
async function account(runtime: Runtime, email: string, extra: Record<string, unknown> = {}) {
  const agent = request.agent(runtime.app);
  const r = await agent.post('/api/auth/register').send({
    name: 'Kartikeya Yadav',
    email,
    password: 'a-strong-test-password',
    adult: true,
    consent: true,
    ...extra,
  });
  return { agent, csrf: r.body.csrf as string, response: r };
}
type Account = Awaited<ReturnType<typeof account>>;
async function pdf(text: string) {
  const doc = await PDFDocument.create();
  doc.addPage().drawText(text, { x: 40, y: 700, size: 14 });
  return Buffer.from(await doc.save());
}
function jpeg(width: number, height: number, shade = '#557799') {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(width / 4, height / 4, width / 2, height / 2);
  return canvas.encodeSync('jpeg', 90);
}
async function intake(a: Account, bytes: Buffer, name: string) {
  const r = await a.agent
    .post('/api/intake')
    .set('x-csrf-token', a.csrf)
    .attach('file', bytes, name);
  expect(r.status).toBe(202);
  return r.body as { packetId: string; document: DocumentRecord };
}
async function ready(a: Account, packetId: string) {
  const started = Date.now();
  while (Date.now() - started < 15000) {
    const detail = (await a.agent.get(`/api/packets/${packetId}`)).body as PacketDetail;
    if (detail.documents.every((d) => d.status !== 'processing')) return detail;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw Error('Inspection timed out.');
}

describe('name and date of birth matching', () => {
  it('treats capitals, titles, punctuation and date formats as the same', () => {
    expect(compareNames('KARTIKEYA YADAV', 'Kartikeya Yadav')).toBe('same');
    expect(compareNames('Mr. Kartikeya Yadav', 'KARTIKEYA YADAV')).toBe('format');
    expect(compareNames('Kartikeya Yadav', 'KartikeyaYadav')).toBe('format');
    expect(compareDates('12/03/2008', '2008-03-12')).toBe('format');
    expect(compareDates('12/03/2008', '12th March, 2008')).toBe('format');
    expect(compareDates('March 12, 2008', '12-3-2008')).toBe('format');
  });
  it('names each kind of difference', () => {
    expect(compareNames('Kartikeya Yadav', 'Kartikeya Kumar Yadav')).toBe('middle_name');
    expect(compareNames('Kartikeya Yadav', 'K. Yadav')).toBe('initials');
    expect(compareNames('Kartikeya Yadav', 'Yadav Kartikeya')).toBe('order');
    expect(compareNames('Kartikeya Yadav', 'Kartikeye Yadav')).toBe('spelling');
    expect(compareNames('Aanya Mehra', 'Aanya Sharma')).toBe('different');
    expect(compareDates('12/03/2008', '03/12/2008')).toBe('day_month');
    expect(compareDates('12/03/2008', '13/03/2008')).toBe('different');
    expect(compareDates('12/03/2008', 'not a date')).toBe('unreadable');
    expect(parseDate('31/02/2008')).toBeNull();
  });
  it('reads the applicant, not parents or the school, from certificates', () => {
    const facts = extractFacts([
      {
        number: 1,
        text: "Name of School: Delhi Public School\nCandidate Name: KARTIKEYA YADAV   Roll No: 1234\nFather's Name: RAJESH YADAV\nMother's Name: SUNITA YADAV\nDate of Birth: 12/03/2008",
      },
      { number: 2, text: 'Government of India\nKartikeya Kumar Yadav\nDOB: 12/03/2008\nMale' },
    ]);
    expect(facts.filter((f) => f.kind === 'name').map((f) => f.value)).toEqual([
      'KARTIKEYA YADAV',
      'Kartikeya Kumar Yadav',
    ]);
    expect(facts.filter((f) => f.kind === 'birth_date').map((f) => f.value)).toEqual([
      '12/03/2008',
      '12/03/2008',
    ]);
  });
  it('compares every document with the value most of them share, or a chosen reference', () => {
    const doc = (id: string, name: string, dob: string, confirmed = false): DocumentRecord => {
      const record = {
        id,
        packetId: 'p',
        name: id + '.pdf',
        size: 1,
        hash: id,
        mime: 'application/pdf',
        status: 'ready' as const,
        pageCount: 1,
        pages: [],
        createdAt: '2026-10-10',
        facts: extractFacts([{ number: 1, text: `Name: ${name}\nDate of birth: ${dob}` }]),
      };
      if (confirmed)
        for (const f of record.facts)
          f.history = [
            {
              revision: 1,
              value: f.value,
              confirmed: true,
              actor: 'me',
              reason: 'Checked the original.',
              createdAt: '2026-10-10',
            },
          ];
      return record;
    };
    const docs = [
      doc('marksheet', 'KARTIKEYA YADAV', '12/03/2008'),
      doc('aadhaar', 'Kartikeya Yadav', '2008-03-12'),
      doc('category', 'Kartikeye Yadav', '03/12/2008'),
    ];
    const [names, dates] = compareIdentity(docs);
    expect(names.reference?.documentId).toBe('marksheet');
    expect(names.rows.map((r) => r.verdict)).toEqual(['reference', 'same', 'spelling']);
    expect(names.differences).toBe(1);
    expect(dates.rows.map((r) => r.verdict)).toEqual(['reference', 'format', 'day_month']);
    const chosen = compareIdentity(docs, 'category')[0];
    expect(chosen.reference).toMatchObject({ documentId: 'category', chosen: true });
    expect(chosen.differences).toBe(2);
  });
});

describe('upload once, use in many applications', () => {
  it('copies an inspected original and its confirmed facts into another application', async () => {
    const runtime = server();
    const a = await account(runtime, 'library@example.test');
    const first = await intake(a, await pdf('Name: Kartikeya Yadav'), 'class-10-marksheet.pdf');
    const second = await intake(a, await pdf('Scholarship form'), 'scholarship-form.pdf');
    await ready(a, first.packetId);
    await ready(a, second.packetId);
    const library = (await a.agent.get('/api/library')).body as LibraryDocument[];
    expect(library.map((d) => d.name).sort()).toEqual([
      'class-10-marksheet.pdf',
      'scholarship-form.pdf',
    ]);
    const marksheet = library.find((d) => d.name === 'class-10-marksheet.pdf')!;
    const target = (await a.agent.get(`/api/packets/${second.packetId}`)).body as PacketDetail;
    const attached = await a.agent
      .post(`/api/packets/${second.packetId}/documents/attach`)
      .set('x-csrf-token', a.csrf)
      .send({
        expectedRevision: target.packet.revision,
        documentIds: [marksheet.source.documentId],
      });
    expect(attached.status).toBe(201);
    const copy = attached.body.attached[0] as DocumentRecord;
    expect(copy).toMatchObject({
      status: 'ready',
      name: 'class-10-marksheet.pdf',
      copiedFrom: { documentId: marksheet.source.documentId, packetId: first.packetId },
    });
    expect(copy.facts?.some((f) => f.value === 'Kartikeya Yadav')).toBe(true);
    // Upload-first folders give every original its own checklist item.
    expect(attached.body.packet.links['upload-' + copy.id]).toBeTruthy();
    const after = (await a.agent.get('/api/library')).body as LibraryDocument[];
    expect(after.find((d) => d.hash === marksheet.hash)!.uses).toHaveLength(2);
    // Adding it again is a no-op.
    const again = await a.agent
      .post(`/api/packets/${second.packetId}/documents/attach`)
      .set('x-csrf-token', a.csrf)
      .send({
        expectedRevision: attached.body.packet.revision,
        documentIds: [marksheet.source.documentId],
      });
    expect(again.body).toMatchObject({ attached: [], skipped: ['class-10-marksheet.pdf'] });
    // Deleting the first application leaves the copy intact.
    const firstDetail = (await a.agent.get(`/api/packets/${first.packetId}`)).body as PacketDetail;
    await a.agent
      .delete(`/api/packets/${first.packetId}`)
      .set('x-csrf-token', a.csrf)
      .send({ expectedRevision: firstDetail.packet.revision });
    const content = await a.agent.get(
      `/api/packets/${second.packetId}/documents/${copy.id}/content`,
    );
    expect(content.status).toBe(200);
    expect(content.body.subarray(0, 5).toString()).toBe('%PDF-');
  });
  it('never attaches another account’s document', async () => {
    const runtime = server();
    const a = await account(runtime, 'owner@example.test'),
      b = await account(runtime, 'other@example.test');
    const theirs = await intake(a, await pdf('Private'), 'private.pdf');
    await ready(a, theirs.packetId);
    const mine = await intake(b, await pdf('Mine'), 'mine.pdf');
    const detail = await ready(b, mine.packetId);
    const r = await b.agent
      .post(`/api/packets/${mine.packetId}/documents/attach`)
      .set('x-csrf-token', b.csrf)
      .send({ expectedRevision: detail.packet.revision, documentIds: [theirs.document.id] });
    expect(r.status).toBe(404);
    expect((await b.agent.get('/api/library')).body).toHaveLength(1);
  });
});

describe('photo and signature versions', () => {
  it('saves a fitted photo as a new version and uses it for the chosen checklist item', async () => {
    const runtime = server();
    const a = await account(runtime, 'photo@example.test');
    const created = await a.agent
      .post('/api/packets')
      .set('x-csrf-token', a.csrf)
      .send({
        title: 'Design entrance',
        templateId: 'custom',
        requirements: [
          {
            id: 'photo',
            title: 'Recent photograph',
            description: 'Colour photograph.',
            group: 'Identity',
            condition: { op: 'always' },
            mime: 'image/jpeg',
            extension: '.jpg',
            maxBytes: 50 * 1024,
            maxWidth: 200,
            maxHeight: 230,
            sourceSection: 'Photograph',
            reviewHint: 'Check the face is clear.',
          },
        ],
      });
    const pid = created.body.id as string;
    const upload = await a.agent
      .post(`/api/packets/${pid}/documents`)
      .set('x-csrf-token', a.csrf)
      .attach('file', jpeg(800, 920), 'photo.jpg');
    expect(upload.status).toBe(202);
    let detail = await ready(a, pid);
    const original = detail.documents[0];
    await a.agent.put(`/api/packets/${pid}/evidence/photo`).set('x-csrf-token', a.csrf).send({
      expectedRevision: detail.packet.revision,
      documentId: original.id,
      pageFrom: 1,
      pageTo: 1,
      review: 'unreviewed',
      note: '',
    });
    detail = (await a.agent.get(`/api/packets/${pid}`)).body;
    expect(detail.live.checks[0].state).toBe('fail');
    const send = (bytes: Buffer, fields: Record<string, string>) =>
      a.agent
        .post(`/api/packets/${pid}/documents/${original.id}/versions`)
        .set('x-csrf-token', a.csrf)
        .field('expectedRevision', String(detail.packet.revision))
        .field('changes', JSON.stringify(['Cropped', 'Resized to 200 × 230 px']))
        .field('useFor', JSON.stringify(['photo']))
        .field('name', fields.name || 'photo-200x230.jpg')
        .attach('file', bytes, 'edited.jpg');
    expect((await send(await pdf('x'), {})).status).toBe(400);
    expect((await send(jpeg(200, 230), { name: 'photo.pdf' })).status).toBe(400);
    const saved = await send(jpeg(200, 230), {});
    expect(saved.status).toBe(202);
    expect(saved.body.document.derivedFrom).toEqual({
      documentId: original.id,
      name: 'photo.jpg',
      hash: original.hash,
      changes: ['Cropped', 'Resized to 200 × 230 px'],
    });
    detail = await ready(a, pid);
    expect(detail.documents.map((d) => d.name)).toEqual(['photo.jpg', 'photo-200x230.jpg']);
    expect(detail.packet.links.photo.documentId).toBe(saved.body.document.id);
    const check = detail.live.checks[0];
    expect(check.fileState).toBe('pass');
    expect(check.state).toBe('needs_review');
  });
});

describe('under-18 applicants and guardian approval', () => {
  const minor = (guardianEmail = 'parent@example.test') => {
    const now = new Date();
    return {
      adult: false,
      birthMonth: `${now.getFullYear() - 16}-01`,
      guardianEmail,
    };
  };
  const link = (mail: MailMessage[], kind: 'guardian' | 'guardian-manage') =>
    mail
      .map((m) => m.text.match(new RegExp(`#${kind}=([a-f0-9]{64})`))?.[1])
      .filter(Boolean)
      .at(-1)!;
  it('works out ages from the month of birth without storing it', () => {
    expect(certainlyAged('2008-03', 18)).toBe('2026-04-01');
    expect(certainlyAged('2008-12', 18)).toBe('2027-01-01');
  });
  it('refuses unsafe or impossible registrations', async () => {
    const offline = server({ jobs: false });
    expect((await account(offline, 'kid@example.test', minor())).response.status).toBe(503);
    const runtime = server({ jobs: false, mail: [] });
    const year = new Date().getFullYear();
    for (const [extra, status] of [
      [{ adult: false }, 400],
      [minor('kid@example.test'), 400],
      [{ ...minor(), birthMonth: `${year - 10}-01` }, 400],
      [{ ...minor(), birthMonth: `${year - 30}-01` }, 400],
    ] as const) {
      const r = await account(runtime, 'kid@example.test', extra);
      expect(r.response.status, JSON.stringify(extra)).toBe(status);
    }
  });
  it('keeps documents locked until a guardian approves, and erases the account on withdrawal', async () => {
    const mail: MailMessage[] = [];
    const runtime = server({ jobs: false, mail });
    const kid = await account(runtime, 'kid@example.test', minor());
    expect(kid.response.status).toBe(201);
    expect(kid.response.body.user.guardian).toMatchObject({
      status: 'pending',
      guardianEmail: 'parent@example.test',
    });
    const blocked = await kid.agent
      .post('/api/intake')
      .set('x-csrf-token', kid.csrf)
      .attach('file', await pdf('x'), 'x.pdf');
    expect(blocked.status).toBe(403);
    expect((await kid.agent.get('/api/packets')).body).toEqual([]);
    await runtime.mail.tick();
    expect(mail[0].to).toBe('parent@example.test');
    expect(mail[0].text).toContain('Kartikeya Yadav (kid@example.test)');
    const token = link(mail, 'guardian');
    const guardian = request(runtime.app);
    const looked = await guardian.post('/api/guardian/lookup').send({ token, purpose: 'approve' });
    expect(looked.body).toMatchObject({
      applicant: { name: 'Kartikeya Yadav' },
      status: 'pending',
    });
    const approved = await guardian.post('/api/guardian/approve').send({
      token,
      guardianName: 'Sunita Yadav',
      relationship: 'parent',
      consent: true,
    });
    expect(approved.status).toBe(200);
    // The approval link is single-use.
    expect(
      (await guardian.post('/api/guardian/lookup').send({ token, purpose: 'approve' })).status,
    ).toBe(400);
    const me = (await kid.agent.get('/api/me')).body;
    expect(me.user.guardian).toMatchObject({ status: 'approved', guardianName: 'Sunita Yadav' });
    expect(
      (
        await kid.agent
          .post('/api/intake')
          .set('x-csrf-token', kid.csrf)
          .attach('file', await pdf('x'), 'x.pdf')
      ).status,
    ).toBe(202);
    await runtime.mail.tick();
    const manage = link(mail, 'guardian-manage');
    // The applicant changing their password does not take the guardian's link away.
    await kid.agent
      .post('/api/account/password')
      .set('x-csrf-token', kid.csrf)
      .send({ currentPassword: 'a-strong-test-password', password: 'another-strong-password' });
    expect(
      (await guardian.post('/api/guardian/lookup').send({ token: manage, purpose: 'manage' })).body
        .status,
    ).toBe('approved');
    expect((await guardian.post('/api/guardian/withdraw').send({ token: manage })).status).toBe(
      400,
    );
    const withdrawn = await guardian
      .post('/api/guardian/withdraw')
      .send({ token: manage, confirmation: 'WITHDRAW' });
    expect(withdrawn.status).toBe(200);
    expect(runtime.store.db.prepare('SELECT COUNT(*) AS n FROM users').get()).toEqual({ n: 0 });
    expect(runtime.store.db.prepare('SELECT COUNT(*) AS n FROM packets').get()).toEqual({ n: 0 });
  });
  it('lets a declined applicant ask someone else, and erases accounts never approved', async () => {
    const mail: MailMessage[] = [];
    const runtime = server({ jobs: false, mail });
    const kid = await account(runtime, 'kid@example.test', minor());
    await runtime.mail.tick();
    const declined = await request(runtime.app)
      .post('/api/guardian/decline')
      .send({ token: link(mail, 'guardian') });
    expect(declined.status).toBe(200);
    expect((await kid.agent.get('/api/guardian')).body.status).toBe('declined');
    const own = await kid.agent
      .put('/api/guardian/email')
      .set('x-csrf-token', kid.csrf)
      .send({ guardianEmail: 'kid@example.test' });
    expect(own.status).toBe(400);
    const other = await kid.agent
      .put('/api/guardian/email')
      .set('x-csrf-token', kid.csrf)
      .send({ guardianEmail: 'guardian@example.test' });
    expect(other.body).toMatchObject({ status: 'pending', guardianEmail: 'guardian@example.test' });
    expect(
      (await kid.agent.post('/api/guardian/resend').set('x-csrf-token', kid.csrf).send({})).status,
    ).toBe(429);
    await runtime.mail.tick();
    expect(mail.at(-1)!.to).toBe('guardian@example.test');
    runtime.guardian.sweep(Date.now() + 15 * 86400000);
    expect(runtime.store.db.prepare('SELECT COUNT(*) AS n FROM users').get()).toEqual({ n: 0 });
  });
  it('ends the guardian arrangement when the applicant turns 18', async () => {
    const runtime = server({ jobs: false, mail: [] });
    const kid = await account(runtime, 'kid@example.test', minor());
    const row = runtime.store.db.prepare('SELECT payload FROM guardianship').get() as {
      payload: string;
    };
    runtime.store.db
      .prepare('UPDATE guardianship SET payload=?')
      .run(JSON.stringify({ ...JSON.parse(row.payload), adultOn: '2000-01-01' }));
    const me = (await kid.agent.get('/api/me')).body;
    expect(me.user.guardian).toBeUndefined();
    expect(
      (
        await kid.agent
          .post('/api/intake')
          .set('x-csrf-token', kid.csrf)
          .attach('file', await pdf('x'), 'x.pdf')
      ).status,
    ).toBe(202);
    const events = (await kid.agent.get('/api/activity')).body.map(
      (e: { action: string }) => e.action,
    );
    expect(events).toContain('guardian.ended.adult');
  });
});

describe('limits for students sharing one network', () => {
  it('lets a classroom sign up while still stopping password guessing and email floods', async () => {
    const runtime = server({ jobs: false });
    const client = request(runtime.app);
    for (let i = 0; i < 35; i++) {
      const r = await client.post('/api/auth/register').send({
        name: `Student ${i}`,
        email: `student-${i}@example.test`,
        password: 'a-strong-test-password',
        adult: true,
        consent: true,
      });
      expect(r.status, `student ${i}`).toBe(201);
    }
    const guesses: number[] = [];
    for (let i = 0; i < 31; i++)
      guesses.push(
        (
          await client
            .post('/api/auth/login')
            .send({ email: 'student-0@example.test', password: `wrong-password-${i}` })
        ).status,
      );
    expect(guesses.slice(0, 30).every((s) => s === 401)).toBe(true);
    expect(guesses[30]).toBe(429);
    const resets: number[] = [];
    for (let i = 0; i < 21; i++)
      resets.push(
        (
          await client
            .post('/api/auth/forgot-password')
            .send({ email: `student-${i}@example.test` })
        ).status,
      );
    expect(resets.slice(0, 20).every((s) => s !== 429)).toBe(true);
    expect(resets[20]).toBe(429);
  });
});
