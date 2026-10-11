# Independent rule and correctness review

The software prepares, checks and records review evidence. A real person who did not author the pack or its expected answers must perform the review. A name typed into a workbook is not independent sign-off.

## Official packs

The supported initial scope is UCEED 2027 examination-registration documents, not admission eligibility or portal submission. Registration, the FAQ and all 74 brochure pages belong in the private dossier. Each non-whitespace source range must be covered, and every obligation needs a disposition. Unsupported medical, issuer, legal and separate-stage decisions remain disclosed; never turn them into automatic passes.

```sh
DATA_DIR=/private/review-registry npm run rules -- prepare-uceed \
  --registration /private/registration.html --faq /private/faq.html \
  --brochure /private/brochure.pdf --actor kartikeyajay2006 --file /private/dossier.json
DATA_DIR=/private/review-registry npm run rules -- validate --dossier /private/dossier.json
DATA_DIR=/private/review-registry npm run rules -- review-sheet --dossier /private/dossier.json --out /private/rule-review.html
```

Reviewers inspect the complete source excerpts, actual executable conditions, formats, combinations, date rules and applicant-facing limitations. They decide every section and explain omissions or wrong mappings. Rejection blocks publication. Changed scope/source bytes require a new review, including changes to stage or cycle. Preparation and validation leave the pack a draft. On refresh, pass a new `--version` (for example `2027.reference.4`); previous revisions stay immutable. The current builder expects the verified 74-page brochure layout and refuses changed layouts until their mappings are curated. An existing/unwritable dossier path cannot partially update the registry.

## Reviewer identity and signatures

The reviewer generates their own Ed25519 key on their own computer. The private key stays with them; only the public identity file goes to the curator. After checking the actual person's identity, qualification and independence through a separate channel, an operator registers the public key and records how it was checked. The application cannot establish these human facts from a typed name or a signature alone.

```sh
# Reviewer, on their own computer; creates two NEW files with owner-only permissions.
npm run review:approve -- keygen 'Actual reviewer name' /private/reviewer.pem /private/reviewer-public.json

# Curator, after checking the real person and fingerprint. Never request their private key.
DATA_DIR=/private/review-registry npm run review:approve -- register \
  /private/reviewer-public.json kartikeyajay2006 'Record the real identity and independence verification here.'

# Reviewer signs the completed workbook download on their own computer.
npm run review:approve -- sign pack /private/review.json /private/reviewer.pem /private/signed-review.json

# Curator imports and publishes only the exact signed source scope.
DATA_DIR=/private/review-registry npm run rules -- review --id uceed-2027-reference \
  --version 2027.reference.3 --actor 'Actual reviewer name' --file /private/signed-review.json
DATA_DIR=/private/review-registry npm run rules -- publish --id uceed-2027-reference \
  --version 2027.reference.3 --actor 'Actual reviewer name'
```

Keys must be Ed25519 and unique to a registered identity. Purpose-bound signatures prevent a pack review being replayed as benchmark approval. A typed JSON review can be inspected but cannot authorize publication. Revoked approvals disappear from new selection and existing applications become stale. After backup restoration, reviewer registrations are cleared so a restored snapshot cannot silently reactivate a previously revoked key. Reverify identities before restoring approval; generate a new identity/key and new reviews if the former key is compromised.

Use `review:approve -- list` to see registered fingerprints and `review:approve -- revoke 'Reviewer name' kartikeyajay2006` to revoke a key. These are local operator commands, not public applicant endpoints.

## Correctness benchmark

Version 3 exports complete packet, requirement, document and evidence inputs with opaque IDs. Repeated identical scenarios are removed. No author answers or rationales are included. The default inputs are public author-maintained synthetic regression material, not private held-out data.

```sh
npm run benchmark:run -- export /private/blind-v3.json
npm run benchmark:run -- sheet /private/blind-v3.json /private/labels.html
# The independent reviewer fills every outcome/rationale and downloads labels.json.
npm run benchmark:run -- evaluate /private/blind-v3.json /private/labels.json /private/results.json
```

Execution uses the imported reviewer's expected states, not the author's expected states. The report contains each observed state, a confusion matrix, critical false passes, disagreements, hashes of the frozen inputs/labels/evaluator sources, and evaluator version. Any mismatch or execution exception fails the check. An author/reviewer disagreement remains unresolved even if the evaluator agrees with the reviewer. Typed attribution is reported as pending identity verification.

For verified approval the reviewer signs their version-3 labels, then the curator runs:

```sh
npm run review:approve -- sign benchmark /private/labels.json /private/reviewer.pem /private/signed-labels.json
DATA_DIR=/private/review-registry npm run review:approve -- benchmark \
  /private/blind-v3.json /private/signed-labels.json /private/approved-results.json
```

Author/reviewer disagreements require a third independently registered reviewer, different from both the author and the label reviewer. Their `adjudication` payload contains `reviewer`, `independenceAttested`, `signedAt`, the exact `manifestHash` and original `labelsHash`, and one `decisions` entry per disagreement (`id`, chosen `expected`, substantive `rationale`). Sign it with `review:approve -- sign adjudication` and supply it as the last argument to `review:approve -- benchmark`. Approval preserves the original reviewer findings and signed adjudication, reruns against resolved labels, and cannot waive any observed mismatch or critical false pass.

## Benchmark the actual official rules

The generic regression set cannot certify a particular official pack. Generate a separate, answer-free benchmark from the source dossier:

```sh
npm run review:approve -- official-benchmark /private/dossier.json /private/official-blind.json
npm run benchmark:run -- sheet /private/official-blind.json /private/official-labels.html
# A real independent reviewer labels and signs these cases as above.
DATA_DIR=/private/review-registry npm run review:approve -- release \
  /private/dossier.json /private/official-blind.json /private/signed-official-labels.json /private/scope-approval.json
```

The UCEED dossier currently generates 252 scenarios for its 18 requirements: every declared profile-answer combination, evidence present/absent and incomplete required multi-form combinations. The release command requires the exact independently published pack and validates every rule projection and profile combination. It blocks generic-only, incomplete or stale benchmark coverage. The approval scope is source-rule review and logical evaluation; it does not close security, deployment, real-original OCR, legal or other public-launch gates. Keep signed inputs with the output report; approvals contain the original labels/review decisions and their signature hashes for audit.

To create genuinely held-out logical cases, a separate curator prepares a private manifest of the same version-3 shape (`version`, `author`, `purpose`, `cases`). Each case has an opaque `id` and complete `scenario` containing a packet, documents and a pack with one atomic requirement. No expected answers belong in this file. Freeze it before testing:

```sh
npm run benchmark:run -- freeze /private/separately-authored-cases.json /private/heldout.json
npm run benchmark:run -- sheet /private/heldout.json /private/heldout-labels.html
```

This benchmark checks deterministic evaluation of supplied metadata. Real-original intake, OCR, worker recovery and official-source omissions require their own review evidence; metadata cases do not certify those pipelines or document authenticity.

The internal `npm run benchmark:run -- regression` command uses author answers, reports `not_independent`, and cannot supply release approval. Tests may use explicitly synthetic reviewer identities to exercise the workflow; these identities are never real review records.

All generated files are private (0600), refuse overwriting, and belong outside Git. Do not use real applicant originals for development tests or publish source snapshots as applicant seed data.
