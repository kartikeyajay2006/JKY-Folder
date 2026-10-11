import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign,
  verify,
  randomUUID,
} from 'node:crypto';
import { z } from 'zod';
import type { Store } from './store';
import type { ReviewSignature } from '../shared/model';
import { reviewerIdentity } from './pack-validation';
import { evidenceHash } from './review-integrity';

export interface SignedReview extends ReviewSignature {
  payload: Record<string, unknown>;
}
const publicIdentitySchema = z
  .object({
    identity: z.string().trim().min(2).max(100),
    publicKey: z.string().max(2000),
    keyFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export interface ReviewerRegistration extends z.infer<typeof publicIdentitySchema> {
  verifiedBy: string;
  identityEvidence: string;
  registeredAt: string;
  revokedAt?: string;
}
const envelopeSchema = z
  .object({
    version: z.literal(1),
    purpose: z.enum(['pack', 'benchmark', 'adjudication']),
    reviewer: z.string().trim().min(2).max(100),
    keyFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    payloadHash: z.string().regex(/^[a-f0-9]{64}$/),
    signature: z.string().regex(/^[A-Za-z0-9+/]{86}==$/),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();
const fingerprint = (pem: string) => {
  const key = createPublicKey(pem);
  if (key.asymmetricKeyType !== 'ed25519') throw Error('Reviewer keys must use Ed25519.');
  return createHash('sha256')
    .update(key.export({ type: 'spki', format: 'der' }))
    .digest('hex');
};
const signedMessage = (purpose: ReviewSignature['purpose'], hash: string) =>
  Buffer.from(`JKY-Folder independent review v1\n${purpose}\n${hash}`, 'utf8');

/** Run by the reviewer, not by a curator pretending to be a reviewer. */
export function createReviewerKey(identity: string) {
  if (reviewerIdentity(identity).length < 2)
    throw Error('An accountable reviewer identity is required.');
  const pair = generateKeyPairSync('ed25519');
  const publicKey = pair.publicKey.export({ type: 'spki', format: 'pem' }).toString();
  return {
    privateKey: pair.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicIdentity: {
      identity: identity.trim(),
      publicKey,
      keyFingerprint: fingerprint(publicKey),
    },
  };
}

export function registerReviewer(
  store: Store,
  input: unknown,
  operator: string,
  identityEvidence: string,
) {
  const record = publicIdentitySchema.parse(input);
  if (
    !reviewerIdentity(operator) ||
    reviewerIdentity(operator) === reviewerIdentity(record.identity) ||
    identityEvidence.trim().length < 20 ||
    identityEvidence.trim().length > 2000 ||
    fingerprint(record.publicKey) !== record.keyFingerprint
  )
    throw Error(
      'A separate operator must record how the real reviewer identity and key were verified.',
    );
  const registration: ReviewerRegistration = {
    ...record,
    verifiedBy: operator.trim(),
    identityEvidence: identityEvidence.trim(),
    registeredAt: new Date().toISOString(),
  };
  store.db.transaction(() => {
    store.db
      .prepare('INSERT INTO reviewer_keys VALUES(?,?,?)')
      .run(reviewerIdentity(record.identity), record.keyFingerprint, JSON.stringify(registration));
    store.db
      .prepare('INSERT INTO review_events VALUES(?,?,?,?,?)')
      .run(
        randomUUID(),
        reviewerIdentity(record.identity),
        'registered',
        operator.trim(),
        registration.registeredAt,
      );
  })();
  return {
    identity: registration.identity,
    keyFingerprint: registration.keyFingerprint,
    registeredAt: registration.registeredAt,
  };
}

export function revokeReviewer(store: Store, identity: string, operator: string) {
  if (!reviewerIdentity(operator)) throw Error('An accountable operator is required.');
  const row = store.db
    .prepare('SELECT payload FROM reviewer_keys WHERE identity=?')
    .get(reviewerIdentity(identity)) as { payload: string } | undefined;
  if (!row) throw Error('Registered reviewer not found.');
  const record = JSON.parse(row.payload) as ReviewerRegistration;
  record.revokedAt = new Date().toISOString();
  store.db.transaction(() => {
    store.db
      .prepare('UPDATE reviewer_keys SET payload=? WHERE identity=?')
      .run(JSON.stringify(record), reviewerIdentity(identity));
    store.db
      .prepare('INSERT INTO review_events VALUES(?,?,?,?,?)')
      .run(randomUUID(), reviewerIdentity(identity), 'revoked', operator.trim(), record.revokedAt);
  })();
  return { identity: record.identity, revokedAt: record.revokedAt };
}

export function signReview(
  payload: Record<string, unknown>,
  privateKeyPem: string,
  purpose: ReviewSignature['purpose'],
): SignedReview {
  if (
    typeof payload.reviewer !== 'string' ||
    reviewerIdentity(payload.reviewer).length < 2 ||
    payload.independenceAttested !== true
  )
    throw Error('The completed review must identify its reviewer and attest independence.');
  const privateKey = createPrivateKey(privateKeyPem);
  if (privateKey.asymmetricKeyType !== 'ed25519') throw Error('Reviewer keys must use Ed25519.');
  const publicKey = createPublicKey(privateKey).export({ type: 'spki', format: 'pem' }).toString();
  const hash = evidenceHash(payload);
  return {
    version: 1,
    purpose,
    reviewer: payload.reviewer.trim(),
    keyFingerprint: fingerprint(publicKey),
    payloadHash: hash,
    signature: sign(null, signedMessage(purpose, hash), privateKey).toString('base64'),
    payload,
  };
}

export function verifyReview(store: Store, input: unknown, purpose: ReviewSignature['purpose']) {
  const envelope = envelopeSchema.parse(input);
  const row = store.db
    .prepare('SELECT payload FROM reviewer_keys WHERE identity=?')
    .get(reviewerIdentity(envelope.reviewer)) as { payload: string } | undefined;
  const record = row ? (JSON.parse(row.payload) as ReviewerRegistration) : undefined;
  if (
    !record ||
    record.revokedAt ||
    envelope.purpose !== purpose ||
    typeof envelope.payload.reviewer !== 'string' ||
    reviewerIdentity(envelope.payload.reviewer) !== reviewerIdentity(envelope.reviewer) ||
    record.keyFingerprint !== envelope.keyFingerprint ||
    fingerprint(record.publicKey) !== envelope.keyFingerprint ||
    evidenceHash(envelope.payload) !== envelope.payloadHash ||
    !verify(
      null,
      signedMessage(purpose, envelope.payloadHash),
      record.publicKey,
      Buffer.from(envelope.signature, 'base64'),
    )
  )
    throw Error(
      'A valid signature from a registered, non-revoked independent reviewer is required.',
    );
  const { payload, ...proof } = envelope;
  return { payload, proof, verifiedBy: record.verifiedBy };
}

export function hasSignedReview(input: unknown): input is SignedReview {
  return !!input && typeof input === 'object' && 'signature' in input && 'payload' in input;
}
