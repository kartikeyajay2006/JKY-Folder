import {
  type ECDH,
  createECDH,
  createPrivateKey,
  createCipheriv,
  generateKeyPairSync,
  hkdfSync,
  randomBytes,
  sign,
} from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Web Push with built-in crypto: RFC 8291 message encryption (aes128gcm, RFC 8188) and
 * RFC 8292 VAPID authentication. No third-party service is contacted except the push
 * service named by the browser's own subscription endpoint.
 */
export interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}
export interface VapidKeys {
  publicKey: string;
  privateKey: string;
  subject: string;
}
export type PushSender = (
  subscription: PushSubscription,
  payload: string,
  options: { ttl: number; urgency: 'low' | 'normal' | 'high'; topic?: string },
) => Promise<number>;

export const b64url = (data: Buffer) => data.toString('base64url');
export const fromB64url = (text: string) => Buffer.from(text, 'base64url');

// Push services operated by browser vendors. Anything else is refused, so a subscription can
// never make this server send requests to an arbitrary or internal address.
const PUSH_HOSTS = [
  /^fcm\.googleapis\.com$/,
  /^android\.googleapis\.com$/,
  /^updates\.push\.services\.mozilla\.com$/,
  /^[a-z0-9-]+\.push\.services\.mozilla\.com$/,
  /^[a-z0-9-]+\.notify\.windows\.com$/,
  /^web\.push\.apple\.com$/,
  /^[a-z0-9-]+\.push\.apple\.com$/,
];
export function allowedEndpoint(endpoint: string) {
  try {
    const url = new URL(endpoint);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (url.port === '' || url.port === '443') &&
      PUSH_HOSTS.some((host) => host.test(url.hostname))
    );
  } catch {
    return false;
  }
}

/** Keys from VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY, or a pair generated once and kept private. */
export function loadVapidKeys(dataDir: string): VapidKeys {
  const subject = process.env.VAPID_SUBJECT || 'mailto:support@jky-folder.invalid';
  if (!/^(mailto:|https:\/\/)/.test(subject))
    throw Error('VAPID_SUBJECT must be a mailto: address or an https: URL.');
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
  if (VAPID_PUBLIC_KEY || VAPID_PRIVATE_KEY) {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY)
      throw Error('VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be configured together.');
    if (fromB64url(VAPID_PUBLIC_KEY).length !== 65 || fromB64url(VAPID_PRIVATE_KEY).length !== 32)
      throw Error('VAPID keys must be a base64url P-256 public point and private scalar.');
    return { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY, subject };
  }
  const file = join(dataDir, 'vapid.json');
  if (existsSync(file)) return { ...JSON.parse(readFileSync(file, 'utf8')), subject };
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const pub = publicKey.export({ format: 'jwk' }),
    priv = privateKey.export({ format: 'jwk' });
  const keys = {
    publicKey: b64url(Buffer.concat([Buffer.from([4]), fromB64url(pub.x!), fromB64url(pub.y!)])),
    privateKey: priv.d!,
  };
  writeFileSync(file, JSON.stringify(keys), { mode: 0o600, flag: 'wx' });
  return { ...keys, subject };
}

/** RFC 8292: a short-lived ES256 token scoped to the push service origin. */
export function vapidHeader(endpoint: string, keys: VapidKeys, now = Date.now()) {
  const point = fromB64url(keys.publicKey);
  const key = createPrivateKey({
    format: 'jwk',
    key: {
      kty: 'EC',
      crv: 'P-256',
      x: b64url(point.subarray(1, 33)),
      y: b64url(point.subarray(33, 65)),
      d: keys.privateKey,
    },
  });
  const header = b64url(Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64url(
    Buffer.from(
      JSON.stringify({
        aud: new URL(endpoint).origin,
        exp: Math.floor(now / 1000) + 12 * 3600,
        sub: keys.subject,
      }),
    ),
  );
  const signature = sign('sha256', Buffer.from(`${header}.${claims}`), {
    key,
    dsaEncoding: 'ieee-p1363',
  });
  return `vapid t=${header}.${claims}.${b64url(signature)}, k=${keys.publicKey}`;
}

/** RFC 8291 encryption of one record for the subscription's keys. */
export function encryptPayload(
  subscription: Pick<PushSubscription, 'p256dh' | 'auth'>,
  plaintext: Buffer,
  sender?: ECDH,
  salt = randomBytes(16),
) {
  if (plaintext.length > 3800) throw Error('Push payload is too large.');
  const receiver = fromB64url(subscription.p256dh),
    authSecret = fromB64url(subscription.auth);
  if (receiver.length !== 65 || receiver[0] !== 4 || authSecret.length !== 16)
    throw Error('Invalid push subscription keys.');
  const ecdh = sender ?? createECDH('prime256v1');
  if (!sender) ecdh.generateKeys();
  const senderPublic = ecdh.getPublicKey();
  const shared = ecdh.computeSecret(receiver);
  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0'), receiver, senderPublic]);
  const ikm = Buffer.from(hkdfSync('sha256', shared, authSecret, keyInfo, 32));
  const cek = Buffer.from(
    hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16),
  );
  const nonce = Buffer.from(
    hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12),
  );
  const cipher = createCipheriv('aes-128-gcm', cek, nonce);
  // A single final record: plaintext followed by the 0x02 delimiter.
  const body = Buffer.concat([
    cipher.update(Buffer.concat([plaintext, Buffer.from([2])])),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
  const recordSize = Buffer.alloc(4);
  recordSize.writeUInt32BE(4096);
  return Buffer.concat([salt, recordSize, Buffer.from([senderPublic.length]), senderPublic, body]);
}

/** Sends one notification through the browser vendor's push service. */
export function fetchSender(keys: VapidKeys): PushSender {
  return async (subscription, payload, options) => {
    if (!allowedEndpoint(subscription.endpoint)) return 410;
    const sender = createECDH('prime256v1');
    sender.generateKeys();
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: vapidHeader(subscription.endpoint, keys),
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        TTL: String(options.ttl),
        Urgency: options.urgency,
        ...(options.topic ? { Topic: options.topic } : {}),
      },
      body: encryptPayload(subscription, Buffer.from(payload), sender),
    });
    await response.arrayBuffer().catch(() => undefined);
    return response.status;
  };
}
