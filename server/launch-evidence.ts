import { createHash, createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  realpathSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from 'node:process';
import { z } from 'zod';
import { evidenceHash } from './review-integrity';
import { reviewerIdentity } from './pack-validation';
import type { ReviewerRegistration } from './reviewer-identity';
import type { Store } from './store';
import { createStore } from './store';
import { availablePacks } from './rule-packs';
import { approveBenchmark } from './review-approval';
import { verifyOfficialBenchmarkCoverage } from './official-benchmark';
import { benchmarkHash, validateBenchmarkManifest } from './benchmark-runner';
const HASH = z.string().regex(/^[a-f0-9]{64}$/),
  COMMIT = z.string().regex(/^[a-f0-9]{40}$/);
export const EXTERNAL_TASKS = {
  correctness: ['private_manifest_frozen', 'separate_authorship', 'representative_boundaries'],
  hosting: [
    'https_origin',
    'secure_sessions',
    'password_reset_inbox',
    'guardian_inbox',
    'reminder_inbox',
    'closed_browser_push',
    'scanner_engine',
  ],
  storage: [
    'volume_encryption',
    'separate_failure_domain',
    'retention_and_erasure',
    'recovery_rehearsal',
    'erasure_boundary',
  ],
  operations: [
    'on_call_receiver',
    'outage_alert_drill',
    'backup_alert_drill',
    'capacity_budget',
    'incident_owner',
  ],
  security: [
    'cross_account_access',
    'session_and_link_replay',
    'csrf_and_origins',
    'parser_boundary',
    'malware_and_limits',
    'deletion_recovery',
    'support_revocation',
  ],
  privacy: [
    'qualified_review',
    'processing_notice',
    'guardian_policy',
    'processor_agreements',
    'retention_notice',
  ],
  accessibility: ['keyboard', 'screen_reader', 'mobile_zoom', 'reduced_motion', 'error_recovery'],
  pilot: [
    'consent',
    'task_observations',
    'correction_accuracy',
    'blocked_tasks_retested',
    'exit_decision',
  ],
} as const;
const GATES = Object.keys(EXTERNAL_TASKS) as (keyof typeof EXTERNAL_TASKS)[];
const targetSchema = z
  .object({ commit: COMMIT, softwareHash: HASH, environmentHash: HASH })
  .strict();
const assessmentSchema = z
  .object({
    version: z.literal(1),
    gate: z.enum(GATES),
    target: targetSchema,
    author: z.string().trim().min(2).max(100),
    reviewer: z.string().trim().min(2).max(100),
    independenceAttested: z.literal(true),
    qualificationEvidence: z.string().trim().min(40).max(2000),
    observedAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
    tasks: z
      .array(
        z
          .object({
            id: z.string().max(80),
            outcome: z.enum(['passed', 'failed', 'pending']),
            detail: z.string().trim().min(40).max(2000),
          })
          .strict(),
      )
      .min(1)
      .max(30),
    benchmarkHash: HASH.optional(),
    openCritical: z.number().int().min(0),
    openHigh: z.number().int().min(0),
    evidence: z
      .array(z.object({ path: z.string().min(1).max(240), sha256: HASH }).strict())
      .min(1)
      .max(32),
    pilot: z
      .object({
        plannedParticipants: z.number().int().min(1).max(1000),
        observedParticipants: z.number().int().min(1).max(1000),
        consentRecorded: z.literal(true),
        unresolvedBlockingTasks: z.number().int().min(0),
      })
      .strict()
      .optional(),
  })
  .strict();
export type ReleaseTarget = z.infer<typeof targetSchema>;
export type ExternalAssessment = z.infer<typeof assessmentSchema>;
const envelopeSchema = z
  .object({
    version: z.literal(1),
    domain: z.literal('JKY external launch assessment v1'),
    payloadHash: HASH,
    keyFingerprint: HASH,
    signature: z.string().regex(/^[A-Za-z0-9+/]{86}==$/),
    payload: assessmentSchema,
  })
  .strict();
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicFingerprint = (key: ReturnType<typeof createPublicKey>) =>
  createHash('sha256')
    .update(key.export({ type: 'spki', format: 'der' }))
    .digest('hex');
const message = (hash: string) => Buffer.from('JKY external launch assessment v1\n' + hash);
export function softwareHash(directory = root) {
  const files: string[] = [];
  for (const folder of ['server', 'shared', 'src', 'deploy', 'public', 'dist']) {
    const scan = (path: string) => {
      for (const e of readdirSync(path, { withFileTypes: true })) {
        const full = join(path, e.name);
        if (e.isDirectory()) scan(full);
        else if (e.isFile()) files.push(full);
        else if (e.isSymbolicLink())
          throw Error('Symbolic links are unsupported in the frozen software tree.');
      }
    };
    scan(join(directory, folder));
  }
  for (const file of [
    'package.json',
    'package-lock.json',
    'Dockerfile',
    'docker-compose.yml',
    'index.html',
    'vite.config.ts',
    'tsconfig.json',
  ])
    files.push(join(directory, file));
  const hash = createHash('sha256');
  for (const file of files.sort()) {
    hash.update(relative(directory, file).split(sep).join('/') + '\0');
    hash.update(readFileSync(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}
const environmentSchema = z
  .object({
    deploymentId: z.string().trim().min(3).max(120),
    origin: z.url().refine((value) => {
      const u = new URL(value);
      return (
        u.protocol === 'https:' &&
        !u.username &&
        !u.password &&
        u.pathname === '/' &&
        !u.search &&
        !u.hash
      );
    }, 'Use an HTTPS origin without credentials or paths.'),
    hostPolicyHash: HASH,
    imageDigest: HASH,
    storageDescription: z.string().trim().min(20).max(1000),
    repositoryDescription: z.string().trim().min(20).max(1000),
    scannerVersion: z.string().trim().min(2).max(120),
    smtpProvider: z.string().trim().min(2).max(120),
    pushBrowsers: z.array(z.string().trim().min(2).max(100)).min(1).max(10),
  })
  .strict();
/** Hash only a caller-reviewed, non-secret environment description; never include credentials. */
export function releaseTarget(environment: unknown, commit?: string): ReleaseTarget {
  const actual =
    commit ||
    process.env.RELEASE_COMMIT ||
    execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  return targetSchema.parse({
    commit: actual,
    softwareHash: softwareHash(),
    environmentHash: evidenceHash(environmentSchema.parse(environment)),
  });
}
export function signAssessment(input: unknown, privatePem: string) {
  const payload = assessmentSchema.parse(input),
    key = createPrivateKey(privatePem);
  if (key.asymmetricKeyType !== 'ed25519') throw Error('Use the reviewer’s Ed25519 key.');
  if (reviewerIdentity(payload.author) === reviewerIdentity(payload.reviewer))
    throw Error('The author cannot independently approve their own work.');
  const payloadHash = evidenceHash(payload);
  return {
    version: 1,
    domain: 'JKY external launch assessment v1',
    payloadHash,
    keyFingerprint: publicFingerprint(createPublicKey(key)),
    signature: sign(null, message(payloadHash), key).toString('base64'),
    payload,
  };
}
export function verifyAssessment(
  store: Store,
  input: unknown,
  target: ReleaseTarget,
  evidenceDirectory: string,
  now = Date.now(),
) {
  const envelope = envelopeSchema.parse(input),
    p = envelope.payload;
  const row = store.db
    .prepare('SELECT payload FROM reviewer_keys WHERE identity=?')
    .get(reviewerIdentity(p.reviewer)) as { payload: string } | undefined;
  const registration = row ? (JSON.parse(row.payload) as ReviewerRegistration) : undefined;
  if (!registration || registration.revokedAt)
    throw Error('A registered non-revoked independent reviewer is required.');
  const publicKey = createPublicKey(registration.publicKey);
  if (
    publicKey.asymmetricKeyType !== 'ed25519' ||
    envelope.keyFingerprint !== registration.keyFingerprint ||
    publicFingerprint(publicKey) !== envelope.keyFingerprint ||
    evidenceHash(p) !== envelope.payloadHash ||
    !verify(
      null,
      message(envelope.payloadHash),
      publicKey,
      Buffer.from(envelope.signature, 'base64'),
    )
  )
    throw Error('External assessment signature is invalid.');
  if (
    evidenceHash(p.target) !== evidenceHash(target) ||
    reviewerIdentity(p.reviewer) === reviewerIdentity(p.author)
  )
    throw Error('Assessment scope or independence is stale.');
  const observed = Date.parse(p.observedAt),
    expiry = Date.parse(p.expiresAt);
  if (
    observed > now + 300000 ||
    expiry <= now ||
    expiry <= observed ||
    expiry - observed > 90 * 86400000
  )
    throw Error('Assessment must be current and expire within 90 days.');
  const required = EXTERNAL_TASKS[p.gate];
  if (
    new Set(p.tasks.map((t) => t.id)).size !== required.length ||
    p.tasks.length !== required.length ||
    required.some((id) => !p.tasks.some((t) => t.id === id && t.outcome === 'passed')) ||
    p.openCritical ||
    p.openHigh
  )
    throw Error('Every scoped task must pass with no open critical or high findings.');
  if (
    p.gate === 'pilot' &&
    (!p.pilot ||
      p.pilot.observedParticipants < p.pilot.plannedParticipants ||
      p.pilot.unresolvedBlockingTasks)
  )
    throw Error('The planned consented pilot and blocked-task retests are incomplete.');
  if (p.gate === 'correctness' && !p.benchmarkHash)
    throw Error('Bind held-out authorship evidence to the exact manifest hash.');
  if (p.gate !== 'correctness' && p.benchmarkHash)
    throw Error('Benchmark hashes belong only to correctness assessments.');
  if (p.gate !== 'pilot' && p.pilot)
    throw Error('Pilot observations belong only to the pilot assessment.');
  const base = realpathSync(evidenceDirectory),
    seen = new Set<string>();
  let total = 0;
  for (const e of p.evidence) {
    if (
      e.path.startsWith('/') ||
      e.path.includes('\\') ||
      e.path.split('/').some((part) => !part || part === '.' || part === '..') ||
      seen.has(e.path)
    )
      throw Error('Use distinct relative evidence paths within the private bundle.');
    seen.add(e.path);
    const file = realpathSync(join(base, e.path));
    if (!file.startsWith(base + sep)) throw Error('Evidence path escaped the private bundle.');
    const size = statSync(file);
    total += size.size;
    if (
      !size.isFile() ||
      size.size > 64 * 1024 * 1024 ||
      total > 256 * 1024 * 1024 ||
      createHash('sha256').update(readFileSync(file)).digest('hex') !== e.sha256
    )
      throw Error('Referenced evidence is missing, altered or exceeds the bundle limit.');
  }
  return {
    gate: p.gate,
    status: 'recorded_independent_assessment',
    reviewer: p.reviewer,
    verifiedBy: registration.verifiedBy,
    payloadHash: envelope.payloadHash,
    observedAt: p.observedAt,
    expiresAt: p.expiresAt,
  };
}
export function launchReport(
  store: Store,
  target: ReleaseTarget,
  options: {
    packId: string;
    packVersion: string;
    manifest?: unknown;
    labels?: unknown;
    adjudication?: unknown;
    assessments?: unknown[];
    evidenceDirectory?: string;
  },
) {
  targetSchema.parse(target);
  const gates: {
    id: string;
    status: 'passed' | 'pending' | 'failed';
    detail: string;
    proofHash?: string;
  }[] = [];
  const pack = availablePacks(store).find(
    (p) =>
      p.id === options.packId && p.version === options.packVersion && p.lifecycle === 'published',
  );
  gates.push({
    id: 'official_source_review',
    status: pack ? 'passed' : 'pending',
    detail: pack
      ? 'Exact published source pack and registered signature verified.'
      : 'Exact published independently reviewed pack is absent.',
  });
  let verifiedBenchmarkHash: string | undefined;
  if (pack && options.manifest && options.labels) {
    try {
      const manifest = validateBenchmarkManifest(options.manifest);
      verifyOfficialBenchmarkCoverage(pack, manifest);
      const approval = approveBenchmark(store, manifest, options.labels, options.adjudication);
      verifiedBenchmarkHash = benchmarkHash(manifest);
      gates.push({
        id: 'independent_correctness',
        status: 'passed',
        detail: `Executed ${approval.total} independently signed labels with zero mismatches and false passes.`,
        proofHash: benchmarkHash(manifest),
      });
    } catch {
      gates.push({
        id: 'independent_correctness',
        status: 'failed',
        detail:
          'Exact-pack held-out coverage, signed labels or actual correctness execution failed.',
      });
    }
  } else
    gates.push({
      id: 'independent_correctness',
      status: 'pending',
      detail: 'Provide the exact-pack held-out manifest and actual reviewer-signed labels.',
    });
  const byGate = new Map<string, unknown>();
  for (const input of options.assessments || []) {
    const envelope = envelopeSchema.safeParse(input);
    if (!envelope.success)
      throw Error('Malformed external assessment; do not ignore failed evidence.');
    const gate = envelope.data.payload.gate;
    if (byGate.has(gate))
      throw Error('Duplicate assessments for one gate require a reviewed replacement.');
    byGate.set(gate, input);
  }
  for (const id of GATES) {
    const assessment = byGate.get(id);
    if (!assessment) {
      gates.push({
        id,
        status: 'pending',
        detail: 'No actual signed outside/deployment assessment was supplied.',
      });
      continue;
    }
    try {
      if (!options.evidenceDirectory) throw Error();
      const proof = verifyAssessment(store, assessment, target, options.evidenceDirectory);
      if (
        id === 'correctness' &&
        (!verifiedBenchmarkHash ||
          envelopeSchema.parse(assessment).payload.benchmarkHash !== verifiedBenchmarkHash)
      )
        throw Error('Held-out authorship does not match the actually executed manifest.');
      gates.push({
        id,
        status: 'passed',
        detail:
          'Registered independent assessment and exact evidence bytes verified; operator identity/qualification checks remain essential.',
        proofHash: proof.payloadHash,
      });
    } catch {
      gates.push({
        id,
        status: 'failed',
        detail:
          'External evidence is stale, incomplete, revoked, altered or not independently signed.',
      });
    }
  }
  return {
    version: 1,
    scope: 'recorded_launch_evidence',
    target,
    createdAt: new Date().toISOString(),
    ready: gates.every((g) => g.status === 'passed'),
    gates,
    limitations: [
      'Cryptographic checks prove the registered key signed these records, not that a person is qualified or that observations are truthful. The accountable operator verifies both.',
      'This report covers the selected single-runtime release and recorded gates. It does not claim universal absence of errors, WCAG conformance, institutional acceptance or completion of deferred business features.',
    ],
  };
}
function json(file: string) {
  if (!file || statSync(file).size > 20 * 1024 * 1024)
    throw Error('Supply a JSON file under 20 MiB.');
  return JSON.parse(readFileSync(file, 'utf8'));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (existsSync('.env')) loadEnvFile('.env');
  const [command, ...args] = process.argv.slice(2);
  const output = (file: string, value: unknown) =>
    writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  if (command === 'target' && args.length === 2) output(args[1], releaseTarget(json(args[0])));
  else if (command === 'sign' && args.length === 3) {
    if (statSync(args[1]).mode & 0o077)
      throw Error('Reviewer private key requires owner-only permissions.');
    output(args[2], signAssessment(json(args[0]), readFileSync(args[1], 'utf8')));
  } else if (command === 'report' && args.length === 2) {
    const input = z
      .object({
        target: targetSchema,
        packId: z.string(),
        packVersion: z.string(),
        manifest: z.string().optional(),
        labels: z.string().optional(),
        adjudication: z.string().optional(),
        assessments: z.array(z.string()).default([]),
        evidenceDirectory: z.string().optional(),
      })
      .strict()
      .parse(json(args[0]));
    if (input.target.softwareHash !== softwareHash())
      throw Error('Running software differs from the review target.');
    const store = createStore(process.env.DATA_DIR || '.data', { reconcile: false });
    try {
      const report = launchReport(store, input.target, {
        ...input,
        manifest: input.manifest ? json(input.manifest) : undefined,
        labels: input.labels ? json(input.labels) : undefined,
        adjudication: input.adjudication ? json(input.adjudication) : undefined,
        assessments: input.assessments.map(json),
      });
      output(args[1], report);
      console.log(JSON.stringify({ ready: report.ready, gates: report.gates }));
      if (!report.ready) process.exitCode = 2;
    } finally {
      store.db.close();
    }
  } else
    throw Error(
      'Use target <non-secret-environment.json> <new-target.json>, sign <assessment.json> <reviewer-private.pem> <new-signed.json>, or report <bundle.json> <new-report.json>.',
    );
}
