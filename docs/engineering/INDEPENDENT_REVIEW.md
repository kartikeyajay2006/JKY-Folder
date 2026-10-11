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

Reviewers inspect the complete source excerpts, actual executable conditions, formats, combinations, date rules and applicant-facing limitations. They decide every section and explain omissions or wrong mappings. Rejection blocks publication. Changed scope/source bytes require a new review, including changes to stage or cycle. Preparation and validation leave the pack a draft.

## Correctness benchmark

Version 3 exports complete packet, requirement, document and evidence inputs with opaque IDs. Repeated identical scenarios are removed. No author answers or rationales are included. The default inputs are public author-maintained synthetic regression material, not private held-out data.

```sh
npm run benchmark:run -- export /private/blind-v3.json
npm run benchmark:run -- sheet /private/blind-v3.json /private/labels.html
# The independent reviewer fills every outcome/rationale and downloads labels.json.
npm run benchmark:run -- evaluate /private/blind-v3.json /private/labels.json /private/results.json
```

Execution uses the imported reviewer's expected states, not the author's expected states. The report contains each observed state, a confusion matrix, critical false passes, disagreements, hashes of the frozen inputs/labels/evaluator sources, and evaluator version. Any mismatch or execution exception fails the check. An author/reviewer disagreement remains unresolved even if the evaluator agrees with the reviewer. Typed attribution is reported as pending identity verification.

To create genuinely held-out logical cases, a separate curator prepares a private manifest of the same version-3 shape (`version`, `author`, `purpose`, `cases`). Each case has an opaque `id` and complete `scenario` containing a packet, documents and a pack with one atomic requirement. No expected answers belong in this file. Freeze it before testing:

```sh
npm run benchmark:run -- freeze /private/separately-authored-cases.json /private/heldout.json
npm run benchmark:run -- sheet /private/heldout.json /private/heldout-labels.html
```

This benchmark checks deterministic evaluation of supplied metadata. Real-original intake, OCR, worker recovery and official-source omissions require their own review evidence; metadata cases do not certify those pipelines or document authenticity.

The internal `npm run benchmark:run -- regression` command uses author answers, reports `not_independent`, and cannot supply release approval. Tests may use explicitly synthetic reviewer identities to exercise the workflow; these identities are never real review records.

All generated files are private (0600), refuse overwriting, and belong outside Git. Do not use real applicant originals for development tests or publish source snapshots as applicant seed data.
