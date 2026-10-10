import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  createDecipheriv,
  createECDH,
  createPublicKey,
  hkdfSync,
  randomBytes,
  verify,
} from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server/app';
import { outboxTransport } from '../server/mail';
import {
  allowedEndpoint,
  b64url,
  encryptPayload,
  fromB64url,
  loadVapidKeys,
  vapidHeader,
  type PushSubscription,
} from '../server/web-push';

/** A browser's side of a subscription: its key pair and auth secret. */
function receiver() {
  const ecdh = createECDH('prime256v1');
  ecdh.generateKeys();
  const auth = randomBytes(16);
  return { ecdh, auth, p256dh: b64url(ecdh.getPublicKey()), authText: b64url(auth) };
}
/** Decrypts an aes128gcm Web Push body exactly as RFC 8291 describes for the user agent. */
function decrypt(body: Buffer, r: ReturnType<typeof receiver>) {
  const salt = body.subarray(0, 16),
    recordSize = body.readUInt32BE(16),
    idlen = body[20],
    senderPublic = body.subarray(21, 21 + idlen),
    data = body.subarray(21 + idlen);
  expect(recordSize).toBe(4096);
  expect(idlen).toBe(65);
  const shared = r.ecdh.computeSecret(senderPublic);
  const info = Buffer.concat([Buffer.from('WebPush: info\0'), r.ecdh.getPublicKey(), senderPublic]);
  const ikm = Buffer.from(hkdfSync('sha256', shared, r.auth, info, 32));
  const cek = Buffer.from(
    hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16),
  );
  const nonce = Buffer.from(
    hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12),
  );
  const decipher = createDecipheriv('aes-128-gcm', cek, nonce);
  decipher.setAuthTag(data.subarray(data.length - 16));
  const padded = Buffer.concat([
    decipher.update(data.subarray(0, data.length - 16)),
    decipher.final(),
  ]);
  expect(padded.at(-1)).toBe(2);
  return padded.subarray(0, padded.length - 1).toString();
}

describe('Web Push primitives', () => {
  it('encrypts a payload that the subscribing browser can decrypt', () => {
    const r = receiver();
    const body = encryptPayload({ p256dh: r.p256dh, auth: r.authText }, Buffer.from('hello'));
    expect(decrypt(body, r)).toBe('hello');
    // Fresh salt and sender key every time.
    const again = encryptPayload({ p256dh: r.p256dh, auth: r.authText }, Buffer.from('hello'));
    expect(again.subarray(0, 16).equals(body.subarray(0, 16))).toBe(false);
    expect(() => encryptPayload({ p256dh: 'AAAA', auth: r.authText }, Buffer.from('x'))).toThrow();
  });

  it('signs a VAPID token scoped to the push service origin', () => {
    const dir = mkdtempSync(join(tmpdir(), 'jky-vapid-'));
    try {
      const keys = loadVapidKeys(dir);
      expect(statSync(join(dir, 'vapid.json')).mode & 0o777).toBe(0o600);
      expect(loadVapidKeys(dir).publicKey).toBe(keys.publicKey);
      const header = vapidHeader('https://fcm.googleapis.com/fcm/send/abc', keys);
      const [, token, k] = header.match(/^vapid t=([^,]+), k=(.+)$/)!;
      expect(k).toBe(keys.publicKey);
      const [h, c, s] = token.split('.');
      const claims = JSON.parse(fromB64url(c).toString());
      expect(claims.aud).toBe('https://fcm.googleapis.com');
      expect(claims.exp - Date.now() / 1000).toBeLessThanOrEqual(24 * 3600);
      const point = fromB64url(keys.publicKey);
      const publicKey = createPublicKey({
        format: 'jwk',
        key: {
          kty: 'EC',
          crv: 'P-256',
          x: b64url(point.subarray(1, 33)),
          y: b64url(point.subarray(33)),
        },
      });
      expect(
        verify(
          'sha256',
          Buffer.from(`${h}.${c}`),
          { key: publicKey, dsaEncoding: 'ieee-p1363' },
          fromB64url(s),
        ),
      ).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('only accepts browser vendor push services over HTTPS', () => {
    for (const ok of [
      'https://fcm.googleapis.com/fcm/send/x',
      'https://updates.push.services.mozilla.com/wpush/v2/x',
      'https://web.push.apple.com/x',
      'https://db5p.notify.windows.com/w/?token=x',
    ])
      expect(allowedEndpoint(ok)).toBe(true);
    for (const bad of [
      'http://fcm.googleapis.com/fcm/send/x',
      'https://127.0.0.1/x',
      'https://localhost/x',
      'https://evil.example/x',
      'https://fcm.googleapis.com.evil.example/x',
      'https://user:pass@fcm.googleapis.com/x',
      'https://fcm.googleapis.com:8443/x',
      'not a url',
    ])
      expect(allowedEndpoint(bad)).toBe(false);
  });
});

describe('push reminders', () => {
  let runtime: ReturnType<typeof createApp>, dir: string;
  let sent: { endpoint: string; payload: string }[], status: number;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'jky-push-'));
    sent = [];
    status = 201;
    runtime = createApp({
      dataDir: dir,
      jobs: false,
      background: false,
      push: async (subscription: PushSubscription, payload: string) => {
        sent.push({ endpoint: subscription.endpoint, payload });
        return status;
      },
    });
  });
  afterEach(() => {
    runtime.close();
    rmSync(dir, { recursive: true, force: true });
  });
  async function account(email: string) {
    const agent = request.agent(runtime.app);
    const r = await agent.post('/api/auth/register').send({
      name: 'Push Applicant',
      email,
      password: 'a-strong-test-password',
      adult: true,
      consent: true,
    });
    return { agent, csrf: r.body.csrf as string };
  }
  const subscribe = (a: Awaited<ReturnType<typeof account>>, endpoint: string) => {
    const r = receiver();
    return a.agent
      .post('/api/push/subscriptions')
      .set('x-csrf-token', a.csrf)
      .send({ endpoint, keys: { p256dh: r.p256dh, auth: r.authText } });
  };
  async function folderDueInDays(a: Awaited<ReturnType<typeof account>>, days: number) {
    const intake = await a.agent
      .post('/api/intake')
      .set('x-csrf-token', a.csrf)
      .attach('file', Buffer.from('%PDF-1.4 synthetic push folder'), 'resume.pdf');
    const pid = intake.body.packetId;
    const packet = (await a.agent.get(`/api/packets/${pid}`)).body.packet;
    const due = new Date(Date.now() + days * 86400000).toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
    });
    const patched = await a.agent
      .patch(`/api/packets/${pid}`)
      .set('x-csrf-token', a.csrf)
      .send({
        expectedRevision: packet.revision,
        details: { title: 'Private folder title', deadline: due },
      });
    expect(patched.status).toBe(200);
    return pid as string;
  }

  it('subscribes a browser, refuses arbitrary endpoints and sends a test notification', async () => {
    const a = await account('push@example.test');
    const key = await a.agent.get('/api/push');
    expect(fromB64url(key.body.publicKey)).toHaveLength(65);
    expect((await subscribe(a, 'https://internal.example/hook')).status).toBe(400);
    expect((await subscribe(a, 'https://fcm.googleapis.com/fcm/send/one')).status).toBe(201);
    const test = await a.agent.post('/api/push/test').set('x-csrf-token', a.csrf).send({});
    expect(test.body).toEqual({ sent: 1, failed: 0 });
    expect(JSON.parse(sent[0].payload).title).toBe('JKY-Folder notifications are on');
  });

  it('delivers each reminder once per device without private details and forgets revoked browsers', async () => {
    const a = await account('reminders@example.test');
    await subscribe(a, 'https://fcm.googleapis.com/fcm/send/phone');
    await subscribe(a, 'https://updates.push.services.mozilla.com/wpush/v2/laptop');
    const pid = await folderDueInDays(a, 3);
    await runtime.push.tick();
    expect(sent).toHaveLength(2);
    const message = JSON.parse(sent[0].payload);
    expect(message.body).toMatch(/deadline is coming up/);
    expect(sent[0].payload).not.toContain('Private folder title');
    expect(sent[0].payload).not.toContain('resume.pdf');
    expect(message.url).toBe(`/?application=${pid}`);
    await runtime.push.tick();
    expect(sent).toHaveLength(2);
    // A new reminder for a browser that has since been revoked removes that subscription.
    status = 410;
    await a.agent.post('/api/push/test').set('x-csrf-token', a.csrf).send({});
    expect((await a.agent.get('/api/push')).body.devices).toBe(0);
  });

  it('keeps subscriptions private to their account and erases them with the account', async () => {
    const a = await account('owner@example.test'),
      b = await account('other@example.test');
    await subscribe(a, 'https://web.push.apple.com/owner');
    const removed = await b.agent
      .delete('/api/push/subscriptions')
      .set('x-csrf-token', b.csrf)
      .send({ endpoint: 'https://web.push.apple.com/owner' });
    expect(removed.body.devices).toBe(0);
    expect((await a.agent.get('/api/push')).body.devices).toBe(1);
    await a.agent
      .delete('/api/account')
      .set('x-csrf-token', a.csrf)
      .send({ confirmation: 'DELETE' });
    expect(runtime.store.db.prepare('SELECT COUNT(*) AS n FROM push_subscriptions').get()).toEqual({
      n: 0,
    });
  });
});

describe('development outbox', () => {
  it('writes private message files and says so in recovery responses', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'jky-outbox-'));
    const runtime = createApp({
      dataDir: dir,
      jobs: false,
      background: false,
      mail: outboxTransport(dir),
    });
    try {
      const agent = request.agent(runtime.app);
      await agent.post('/api/auth/register').send({
        name: 'Outbox Applicant',
        email: 'outbox@example.test',
        password: 'a-strong-test-password',
        adult: true,
        consent: true,
      });
      expect((await agent.get('/api/auth/recovery-status')).body).toEqual({
        enabled: true,
        delivery: 'outbox',
      });
      const forgot = await request(runtime.app)
        .post('/api/auth/forgot-password')
        .send({ email: 'outbox@example.test' });
      expect(forgot.body.message).toMatch(/outbox/);
      await runtime.mail.tick();
      const files = readdirSync(join(dir, 'outbox'));
      expect(files).toHaveLength(1);
      expect(statSync(join(dir, 'outbox', files[0])).mode & 0o777).toBe(0o600);
      const text = readFileSync(join(dir, 'outbox', files[0]), 'utf8');
      expect(text).toMatch(/^To: outbox@example\.test$/m);
      expect(text).toMatch(/#reset=[a-f0-9]{64}/);
    } finally {
      runtime.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
