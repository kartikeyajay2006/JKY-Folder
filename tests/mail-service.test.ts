import { beforeEach, afterEach, it, expect } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server/app';
import type { MailMessage } from '../server/mail';
let runtime: ReturnType<typeof createApp>,
  dir: string,
  messages: MailMessage[],
  failDelivery: boolean;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'jky-mail-'));
  messages = [];
  failDelivery = false;
  runtime = createApp({
    dataDir: dir,
    jobs: false,
    background: false,
    origin: 'https://folder.example.test',
    mail: {
      send: async (m) => {
        if (failDelivery) throw Error('Synthetic SMTP outage');
        messages.push(m);
      },
    },
  });
});
afterEach(() => {
  runtime.close();
  rmSync(dir, { recursive: true, force: true });
});
async function account() {
  const agent = request.agent(runtime.app),
    r = await agent.post('/api/auth/register').send({
      name: 'Recovery Applicant',
      email: 'recovery@example.test',
      password: 'original-strong-password',
      adult: true,
      consent: true,
    });
  expect(r.status).toBe(201);
  return { agent, csrf: r.body.csrf, id: r.body.user.id };
}
function token(kind: 'reset' | 'verify') {
  const m = [...messages].reverse().find((m) => m.text.includes('#' + kind + '='));
  expect(m).toBeDefined();
  return m!.text.match(new RegExp('#' + kind + '=([a-f0-9]{64})'))![1];
}
it('returns the same recovery response for missing accounts, stores no raw tokens and permits a reset exactly once', async () => {
  const a = await account(),
    second = request.agent(runtime.app);
  await second
    .post('/api/auth/login')
    .send({ email: 'recovery@example.test', password: 'original-strong-password' });
  const known = await request(runtime.app)
      .post('/api/auth/forgot-password')
      .send({ email: 'recovery@example.test' }),
    missing = await request(runtime.app)
      .post('/api/auth/forgot-password')
      .send({ email: 'missing@example.test' });
  expect(known.body).toEqual(missing.body);
  expect(messages).toEqual([]);
  await runtime.mail.tick();
  expect(messages).toHaveLength(1);
  const t = token('reset');
  expect(messages[0].text).toContain('https://folder.example.test/#reset=');
  expect(
    JSON.stringify(runtime.store.db.prepare('SELECT * FROM account_tokens').all()),
  ).not.toContain(t);
  expect(JSON.stringify(runtime.store.db.prepare('SELECT * FROM mail_queue').all())).not.toContain(
    t,
  );
  const reset = () =>
    request(runtime.app)
      .post('/api/auth/reset-password')
      .send({ token: t, password: 'new-strong-recovery-password' });
  expect((await reset()).status).toBe(200);
  expect((await reset()).status).toBe(400);
  expect((await a.agent.get('/api/me')).status).toBe(401);
  expect((await second.get('/api/me')).status).toBe(401);
  expect(
    (
      await request(runtime.app)
        .post('/api/auth/login')
        .send({ email: 'recovery@example.test', password: 'original-strong-password' })
    ).status,
  ).toBe(401);
  expect(
    (
      await request(runtime.app)
        .post('/api/auth/login')
        .send({ email: 'recovery@example.test', password: 'new-strong-recovery-password' })
    ).status,
  ).toBe(200);
  expect(runtime.store.db.prepare('SELECT COUNT(*) AS n FROM packets').get()).toEqual({ n: 0 });
});
it('requires verified opt-in and sends actual deadline reminders while the browser is closed, deduplicated across restart', async () => {
  const a = await account();
  expect(
    (
      await a.agent
        .put('/api/notification-preferences')
        .set('x-csrf-token', a.csrf)
        .send({ deadlines: true, sourceChanges: true, email: true })
    ).status,
  ).toBe(400);
  await a.agent.post('/api/account/verify-email').set('x-csrf-token', a.csrf).send({});
  await runtime.mail.tick();
  const t = token('verify');
  expect(
    (await request(runtime.app).post('/api/auth/verify-email').send({ token: t })).status,
  ).toBe(200);
  expect(
    (await request(runtime.app).post('/api/auth/verify-email').send({ token: t })).status,
  ).toBe(400);
  expect(
    (
      await a.agent
        .put('/api/notification-preferences')
        .set('x-csrf-token', a.csrf)
        .send({ deadlines: true, sourceChanges: true, email: true })
    ).status,
  ).toBe(200);
  const uploaded = await a.agent
      .post('/api/intake')
      .set('x-csrf-token', a.csrf)
      .attach('file', Buffer.from('%PDF-synthetic'), 'private-title.pdf'),
    p = runtime.store.packet(uploaded.body.packetId, a.id)!;
  p.deadline = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  runtime.store.savePacket(p);
  runtime.close();
  runtime = createApp({
    dataDir: dir,
    jobs: false,
    background: false,
    origin: 'https://folder.example.test',
    mail: {
      send: async (m) => {
        messages.push(m);
      },
    },
  });
  await runtime.mail.tick();
  await runtime.mail.tick();
  expect(messages.filter((m) => m.subject.includes('deadline'))).toHaveLength(1);
  expect(messages.at(-1)?.text).not.toContain('private-title');
  expect(runtime.store.db.prepare('SELECT COUNT(*) AS n FROM reminders').get()).toEqual({ n: 1 });
});
it('recovers queued requests after restart and backs off failed delivery without exposing a token', async () => {
  await account();
  await request(runtime.app)
    .post('/api/auth/forgot-password')
    .send({ email: 'recovery@example.test' });
  failDelivery = true;
  await runtime.mail.tick();
  expect(messages).toHaveLength(0);
  expect(runtime.store.db.prepare('SELECT COUNT(*) AS n FROM account_tokens').get()).toEqual({
    n: 0,
  });
  expect(runtime.store.db.prepare('SELECT status,attempts FROM mail_queue').get()).toEqual({
    status: 'queued',
    attempts: 1,
  });
  runtime.close();
  runtime = createApp({
    dataDir: dir,
    jobs: false,
    background: false,
    origin: 'https://folder.example.test',
    mail: {
      send: async (m) => {
        messages.push(m);
      },
    },
  });
  await runtime.mail.tick(Date.now() + 121000);
  expect(messages).toHaveLength(1);
  expect(token('reset')).toHaveLength(64);
});
it('prevents concurrent reset replays', async () => {
  await account();
  await request(runtime.app)
    .post('/api/auth/forgot-password')
    .send({ email: 'recovery@example.test' });
  await runtime.mail.tick();
  const t = token('reset');
  const results = await Promise.all(
    [1, 2].map(() =>
      request(runtime.app)
        .post('/api/auth/reset-password')
        .send({ token: t, password: 'concurrent-new-password' }),
    ),
  );
  expect(results.map((r) => r.status).sort()).toEqual([200, 400]);
});
it('erases pending mail with its owner and gives a useful global disabled-delivery response', async () => {
  const a = await account();
  await request(runtime.app)
    .post('/api/auth/forgot-password')
    .send({ email: 'recovery@example.test' });
  await a.agent.delete('/api/account').set('x-csrf-token', a.csrf).send({ confirmation: 'DELETE' });
  await runtime.mail.tick();
  expect(messages).toEqual([]);
  expect(runtime.store.db.prepare('SELECT COUNT(*) AS n FROM mail_queue').get()).toEqual({ n: 0 });
  runtime.close();
  runtime = createApp({ dataDir: dir, jobs: false, background: false });
  expect(
    (
      await request(runtime.app)
        .post('/api/auth/forgot-password')
        .send({ email: 'recovery@example.test' })
    ).status,
  ).toBe(503);
});

it('rejects expired tokens and cancels queued reminders after opt-out', async () => {
  const a = await account();
  await request(runtime.app)
    .post('/api/auth/forgot-password')
    .send({ email: 'recovery@example.test' });
  await runtime.mail.tick();
  const t = token('reset');
  runtime.store.db.prepare('UPDATE account_tokens SET expiresAt=0').run();
  expect(
    (
      await request(runtime.app)
        .post('/api/auth/reset-password')
        .send({ token: t, password: 'expired-link-password' })
    ).status,
  ).toBe(400);
  runtime.store.db
    .prepare('INSERT INTO email_verifications VALUES(?,?,?)')
    .run(a.id, 'recovery@example.test', new Date().toISOString());
  await a.agent
    .put('/api/notification-preferences')
    .set('x-csrf-token', a.csrf)
    .send({ deadlines: true, sourceChanges: true, email: true });
  const up = await a.agent
      .post('/api/intake')
      .set('x-csrf-token', a.csrf)
      .attach('file', Buffer.from('%PDF-synthetic'), 'deadline.pdf'),
    p = runtime.store.packet(up.body.packetId, a.id)!;
  p.deadline = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  runtime.store.savePacket(p);
  failDelivery = true;
  await runtime.mail.tick();
  await a.agent
    .put('/api/notification-preferences')
    .set('x-csrf-token', a.csrf)
    .send({ deadlines: true, sourceChanges: true, email: false });
  failDelivery = false;
  await runtime.mail.tick(Date.now() + 121000);
  expect(messages.filter((m) => m.subject.includes('deadline'))).toHaveLength(0);
});
