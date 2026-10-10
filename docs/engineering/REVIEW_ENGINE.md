# Evidence review milestone

The Gold/Silver visual system, typography, theme initialization and motion controls remain in place. Added controls use existing sheets, dialogs, forms and theme tokens. Registration creates an empty account: no applications, originals, reports, reminders or visible activity. The consent event stays in the private audit record. Fictional evidence is created only through the explicit demo endpoint. Signing out clears application state, dialogs, previews and pending uploads before another account enters.

## Sources and publication

`npm run rules -- <command>` operates a private source registry and immutable pack revisions in `DATA_DIR` (default `.data`). This is an operator command requiring filesystem access, not a public curator endpoint. Named author/reviewer records are operational attribution; independent reviewer qualification and identity must still be verified outside this local tool.

Capture permits only the official HTTPS UCEED host, refuses redirects, bounds the response to one MB and uses a timeout. It stores a SHA-256 hash, capture date, URL, title, representation and source text. Unsupported hosts are rejected instead of fetching user-supplied URLs. Source refresh is an explicit curator operation; a scheduled remote monitor is not enabled.

```sh
npm run rules -- capture --id uceed-2027-registration --url https://www.uceed.iitb.ac.in/2027/registration.html --title 'UCEED 2027 registration instructions'
npm run rules -- import-source --file /private/path/verified-source.snapshot.json
npm run rules -- draft --file /private/path/pack.json --actor author-identity
npm run rules -- review --id pack-id --version revision-id --actor independent-reviewer
npm run rules -- publish --id pack-id --version revision-id --actor independent-reviewer
npm run rules -- inspect
```

A source anchor is `sourceId:start:length`, measured in JavaScript string positions in that snapshot representation. Every obligation needs a valid anchored range, disposition (`implemented`, `review_only`, `unsupported`), rationale and requirement mapping where applicable. Review verifies source integrity, current hashes, requirement constraints and source mappings. Self-review, incomplete mappings and duplicate pack versions are rejected. Publication requires the recorded distinct reviewer and unchanged sources. Published revisions cannot be edited; changes require a new version. Retirement removes a pack from new selection.

Application creation pins the selected pack. Captured-source or published-pack changes make reports historical and block saving a fresh report until the new reviewed version is accepted. Acceptance clears old evidence confirmations/links and preserves historical report provenance. Source-only changes cannot be accepted while curator review remains open. The source panel lists hashes, anchors, dispositions and unsupported obligations.

The bundled UCEED reference includes metadata for a browser-extracted registration-page snapshot and 17 author-mapped obligation dispositions. Full captured source text stays out of the repository and applicant seed data. Direct capture from this execution host was unavailable (DNS/timeout); the primary page was inspected through the browsing tool. The reference remains a draft with independent completeness review open. Its brochure, appendices, category exceptions and medical judgments are not certified by this milestone. Different snapshot representations can yield different hashes and require curator reconciliation.

## Evidence and corrections

An evidence link retains the original primary file/page range for compatibility and may include nine additional anchors. Each anchor has its own component, review note, actor and timestamp. Named components can occupy separate files or different page ranges of one file. `all` requires every linked component and every named slot to pass; `any` accepts a passing alternative. Duplicated file/range/component combinations and cross-packet links are rejected.

Reports save every anchor and its result, source snapshots/obligations, evaluator version and confirmed fact revisions. Deleting evidence purges dependent saved reports and links, including additional anchors.

Labelled names, birth dates, issue dates and expiry dates are extracted as unconfirmed candidates. The document viewer supports comparison with the original page, coordinate highlighting when available, confirmations and append-only correction history. Manual facts provide a supported fallback without overwriting extracted text; they are explicitly attributed to the applicant. Corrections require packet and fact revision checks and invalidate dependent content confirmations. Confirmed conflicting names/birth dates produce a review-needed summary and are retained in reports; spelling differences never establish fraud or legal equivalence.

## Supported checks and OCR

Custom checklists support inclusive minimum/maximum byte sizes, page counts, image widths/heights, evidence combinations and exact date comparisons. Date rules require an explicitly confirmed, valid `YYYY-MM-DD` date. Missing dimensions, conflicting dates and uncertain extraction remain unresolved. Constraints cannot exceed service envelopes or have a minimum greater than their maximum. Compound predicates use bounded, three-valued logic.

Local Tesseract.js English language data is bundled as a dependency; recognition performs no document upload or language download. Native PDF text is preferred. Image-only pages are rendered and OCR is capped at eight pages per document, 1,600 pixels on the longest edge, 3,000 tokens and 18,000 text characters per page. Coordinates, extraction method, confidence and warnings are retained. JPEG rotation is respected. Inspection has a 45-second wall deadline and a 192 MB JavaScript heap budget. These are local limits, not a complete OS sandbox or native-memory bound.

OCR below 85% confidence or truncated/uncertain selected text cannot produce a literal-phrase pass. English is the supported baseline; other scripts and low quality originals need manual review. Evidence suggestions use matching terms and respect available formats and OCR confidence. Suggestions never create links or content confirmations automatically.

## Uploads and reminders

Uploads show actual transport progress, per-file outcomes, cancellation and actionable timeout/offline recovery. Cancelling stops the current request and remaining queued files; accepted server-side bytes may still appear after refresh. Retrying the same bytes reuses the existing document. This is whole-file retry, not resumable chunk transfer.

Private in-app reminders are generated from actual application deadlines and source changes, deduplicated, ownership checked and individually dismissible. Preferences control deadline/source notices. Empty accounts have no reminders. Deadlines use Asia/Kolkata calendar dates. Notices refresh when the relevant workspace/notification view loads; email, push delivery and a background notification daemon remain outside this localhost milestone.

## Recovery and evaluation

Stop the application before operational backup or restoration. Backup archives are encrypted with AES-256-GCM and a scrypt-derived key, include SQLite metadata, exact originals, a manifest and the deletion ledger, and refuse to overwrite an existing destination. Protect `BACKUP_PASSWORD` through your shell or secret manager; do not put it in source control or command arguments.

```sh
npm run backup -- backup /private/path/new-backup.jky
# BACKUP_PASSWORD must be set; DATA_DIR selects the source.
# Restore requires DELETION_LEDGER pointing to the current post-backup ledger.
npm run backup -- restore /private/path/new-backup.jky /private/path/empty-recovery-directory
```

Restore refuses a nonempty target, authenticates the archive, validates object hashes, replays post-backup document/packet/account erasure and reconciles orphan originals before reopening access. Keep the current deletion ledger independently of old backups. Local encrypted archives do not provide automated offsite schedules, retention expiry or production disaster-recovery staffing.

The versioned regression corpus has 312 synthetic critical-negative cases with explicit expected states and rationale. It covers twelve boundary/missing-prerequisite classes across 26 parameter variants. These are author-labelled internal regression cases, not 312 independent real-world observations or an independently adjudicated held-out launch benchmark. The latter release gate remains open. API tests exercise real scanned-PDF recognition, correction conflicts, empty-account login, deletion during actual worker execution and restart recovery. Recovery tests verify encrypted exact-byte restoration and deletion replay.
