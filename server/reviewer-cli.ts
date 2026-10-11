import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createStore } from './store';
import {
  createReviewerKey,
  registerReviewer,
  revokeReviewer,
  signReview,
  type ReviewerRegistration,
} from './reviewer-identity';
import { approveBenchmark } from './review-approval';
import { officialBenchmark, verifyOfficialBenchmarkCoverage } from './official-benchmark';
import { benchmarkHash } from './benchmark-runner';
import { availablePacks } from './rule-packs';
import { validatePackSources } from './pack-validation';

const [command, ...args] = process.argv.slice(2);
const json = (file: string) => {
  if (!file || statSync(file).size > 20 * 1024 * 1024)
    throw Error('A review JSON file under 20 MB is required.');
  return JSON.parse(readFileSync(file, 'utf8'));
};
const output = (file: string, value: unknown) =>
  writeFileSync(file, JSON.stringify(value, null, 2), { mode: 0o600, flag: 'wx' });

if (command === 'keygen' && args.length === 3) {
  const [identity, privateFile, publicFile] = args;
  if (privateFile === publicFile || existsSync(privateFile) || existsSync(publicFile))
    throw Error('Use two different new filenames; reviewer keys are never overwritten.');
  const keys = createReviewerKey(identity);
  writeFileSync(privateFile, keys.privateKey, { mode: 0o600, flag: 'wx' });
  output(publicFile, keys.publicIdentity);
  console.log(
    JSON.stringify({
      identity: keys.publicIdentity.identity,
      keyFingerprint: keys.publicIdentity.keyFingerprint,
    }),
  );
} else if (command === 'sign' && args.length === 4) {
  const [purpose, inputFile, privateFile, signedFile] = args;
  if (!['pack', 'benchmark', 'adjudication'].includes(purpose))
    throw Error('Choose pack, benchmark or adjudication.');
  if ((statSync(privateFile).mode & 0o077) !== 0)
    throw Error('The reviewer private key must be accessible only to its owner (chmod 600).');
  output(
    signedFile,
    signReview(
      json(inputFile),
      readFileSync(privateFile, 'utf8'),
      purpose as 'pack' | 'benchmark' | 'adjudication',
    ),
  );
  console.log(JSON.stringify({ signed: signedFile, purpose }));
} else if (command === 'official-benchmark' && args.length === 2) {
  const manifest = officialBenchmark(json(args[0]));
  output(args[1], { manifest, manifestHash: benchmarkHash(manifest) });
  console.log(
    JSON.stringify({
      cases: manifest.cases.length,
      sourceScope: manifest.sourceScope,
      labels: 'pending_independent_review',
    }),
  );
} else {
  const store = createStore(process.env.DATA_DIR || '.data', { reconcile: false });
  try {
    if (command === 'register' && args.length === 3)
      console.log(JSON.stringify(registerReviewer(store, json(args[0]), args[1], args[2])));
    else if (command === 'revoke' && args.length === 2)
      console.log(JSON.stringify(revokeReviewer(store, args[0], args[1])));
    else if (command === 'list') {
      const rows = store.db
        .prepare('SELECT payload FROM reviewer_keys ORDER BY identity')
        .all() as { payload: string }[];
      console.log(
        JSON.stringify(
          rows.map(({ payload }) => {
            const r = JSON.parse(payload) as ReviewerRegistration;
            return {
              identity: r.identity,
              keyFingerprint: r.keyFingerprint,
              verifiedBy: r.verifiedBy,
              registeredAt: r.registeredAt,
              revokedAt: r.revokedAt,
            };
          }),
        ),
      );
    } else if (
      (command === 'benchmark' || command === 'release') &&
      args.length >= (command === 'release' ? 4 : 3)
    ) {
      const isRelease = command === 'release';
      const dossier = isRelease ? json(args.shift()!) : undefined;
      const [blindFile, labelsFile, reportFile, adjudicationFile] = args;
      const blind = json(blindFile);
      if (benchmarkHash(blind.manifest) !== blind.manifestHash)
        throw Error('Frozen benchmark integrity failed.');
      const report = store.db.transaction(() => {
        const result = approveBenchmark(
          store,
          blind.manifest,
          json(labelsFile),
          adjudicationFile ? json(adjudicationFile) : undefined,
        );
        if (!dossier) return result;
        const published = availablePacks(store).find(
          (p) =>
            p.id === dossier.pack.id &&
            p.version === dossier.pack.version &&
            p.lifecycle === 'published',
        );
        if (!published)
          throw Error(
            'The exact source pack needs verified independent publication before release.',
          );
        const sources = (published.sources || []).map((source) => {
          const row = store.db
            .prepare('SELECT payload FROM source_snapshots WHERE id=?')
            .get(source.id) as { payload: string } | undefined;
          if (!row) throw Error('Published source snapshot unavailable.');
          return JSON.parse(row.payload);
        });
        const checked = validatePackSources(published, sources);
        if (checked.scopeHash !== dossier.scopeHash)
          throw Error('The release dossier differs from the published scope.');
        return {
          ...result,
          rulePackApproval: published.reviewSignature,
          rulePackReview: published.reviewRecord,
          sourceCoverage: checked,
          benchmarkCoverage: verifyOfficialBenchmarkCoverage(published, blind.manifest),
          releaseScope:
            'Official document-rule scope and independently labelled logical evaluation only; other public-launch gates remain open.',
        };
      })();
      output(reportFile, report);
      console.log(
        JSON.stringify({
          status: report.status,
          total: report.total,
          criticalFalsePasses: report.criticalFalsePasses,
          independentApproval: report.independentApproval,
        }),
      );
    } else
      throw Error(
        'Use keygen <identity> <private.pem> <public.json>; register <public.json> <operator> <identity-evidence>; sign <purpose> <review.json> <private.pem> <signed.json>; revoke <identity> <operator>; list; official-benchmark <dossier.json> <blind.json>; benchmark <blind.json> <signed-labels.json> <report.json> [signed-adjudication.json]; or release <dossier.json> <blind.json> <signed-labels.json> <report.json> [signed-adjudication.json].',
      );
  } finally {
    store.db.close();
  }
}
