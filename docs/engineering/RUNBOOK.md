# Local development runbook

Requires Node.js 22.12 or newer. Verified locally with Node 22.22.0. The lockfile records the dependency versions used for this milestone.

## First run

1. Run `npm ci` in the repository root.
2. Optionally copy `.env.example` to `.env` for the backend origin and private data path. Keep the default ports, or use the shared shell variables below.
3. Run `npm run dev`.
4. Open `http://127.0.0.1:5173`.
5. Choose **Explore the demo** for an isolated fictional workspace, or create an adults-only development account.

The web client listens on port 5173 and proxies API requests to port 3001. To customize development ports, set `WEB_PORT`, `PORT` and the matching `APP_ORIGIN` in the shell so both processes receive them:

```sh
PORT=3010 WEB_PORT=5183 APP_ORIGIN=http://127.0.0.1:5183 npm run dev
```

`server/index.ts` loads `.env` for the backend; shared dev-port overrides must be shell variables. The server binds loopback by default. It does not publish a website to the internet.

## Review a packet

Choose **New application**, select a college, scholarship, job or custom starter, and add its name, destination, deadline and original instructions. The starter checklist is editable before creation. Importing instructions creates one editable item per nonempty line; it does not infer conditional meanings. Confirm required/optional items, formats, conditions and any size or literal phrase checks against your actual instructions. Use **Edit checklist** to revise it later.

The separate UCEED 2027 reference option has conditional profile questions. Confirm those answers or leave them unknown when you need to check them. Unknown answers remain unresolved.

Upload PDFs or JPEGs, wait for inspection, then open a requirement and connect a document and page range. The PDF viewer renders the actual selected original page with pagination and zoom. Inspect it, record your own review note, and save the evidence link. Run a review to save a dated snapshot. Uploading first from an empty document section opens setup and attaches those selected files to the newly created application.

Batch intake reports each file separately. A rejected file does not stop later files from being attempted or remove accepted files. Duplicate bytes return the existing document without a second copy. Retry temporary failures or choose a supported replacement. Intake acceptance and successful inspection are separate states.

The report distinguishes supported technical checks and applicant content confirmation. Changing a profile, file, evidence link, checklist or application details makes an earlier report historical. Changing custom requirements or original instruction notes resets prior content confirmations. A newer evaluator version also marks older snapshots historical. Running a fresh review creates a new snapshot. A retry with unchanged revisions, checklist version and evaluator version reuses the existing run.

Export JSON for machine-readable provenance, or use **Print / PDF** for a printable report. The printable report includes source, version and coverage limits. Exports are private authenticated responses.

**Download folder** exports a ZIP containing exact inspected originals, the current checklist/review manifest and coverage notes. Processing or failed files are excluded and identified in the manifest. The ZIP is a private export of originals; it does not transform files for a specific institution’s upload portal.

Use **Applications** to search, sort, open, archive or restore your applications. Archive preserves documents and history; deletion removes them. Deadlines have private in-app reminders using Asia/Kolkata calendar dates. Reminder preferences are in Settings & privacy. Email and push delivery are not enabled. Application URLs preserve your current application and section across refresh and browser navigation; server ownership checks still apply.

The workspace uses top navigation throughout. On narrow screens, the horizontal tabs scroll and keep the selected section visible. Help and settings remain available beside the tabs and in the account menu. **Ctrl/Cmd + K** focuses workspace search. The account menu supports arrow keys and Escape; Escape returns focus to its trigger. Dialogs keep keyboard focus inside and make the header/content inactive until dismissed. Operating-system reduced-motion preferences disable decorative animations and transitions. The visible **Pause animations** control also stops motion; this preference persists in the current browser. **Resume animations** restores it unless the system requests reduced motion.

Use **Quick actions** or **Ctrl/Cmd + .** to search available actions and sections. Arrow keys move through enabled results, Enter chooses an action, and Escape closes the dialog. Creating applications, choosing uploads and saving reviews invoke the same real workflows as the section controls. The per-item checklist strip opens the report; it does not silently save a new review.

In **Settings & privacy**, update your display name, change your password using the current password, or sign out other sessions. Password changes revoke previous sessions and rotate the current session/CSRF token. Email verification and password-reset email delivery are not included.

## Document limits

Local engineering limits are 10 MB per file, 10 files and 30 MB per packet, and 20 pages per PDF. These are service limits, not asserted official application limits. JPEG decoding is bounded to 20 million pixels. Files are inspected in a separate Node process with a 192 MB JavaScript heap budget and a 45-second wall-time deadline.

These process limits are not a full operating-system sandbox and do not prevent arbitrary native-code resource use. Production isolation requires a separately reviewed sandbox and aggregate capacity policy.

Only PDF and JPEG originals are accepted. The actual file content is inspected. `.jpeg` is accepted into the document library, but the reference requirement checks `.jpg` when that extension is specified. Encrypted, damaged or unsupported files remain unavailable for download and evidence linking. Failed inspection can be retried or the file deleted.

Text-based PDF extraction preserves page numbers. Image-only PDF pages and JPEGs use bundled local English OCR, capped at eight pages per document. Extraction records coordinates, confidence and uncertainty warnings. Download and inspect the original when extraction is empty or uncertain. OCR is a reading aid; content still requires explicit applicant review. Confirm or correct structured facts in the document viewer, or add a clearly attributed manual fact when a labelled value was not extracted.

## Data and deletion

Metadata is in `.data/metadata.sqlite` and originals are in `.data/objects`, unless `DATA_DIR` is changed. The directory is ignored by Git. Metadata and originals are outside the web asset directory. Passwords use salted scrypt hashes. Sessions use HTTP-only same-site cookies and server-side token hashes; state-changing requests require CSRF tokens.

Deleting a document removes its active original, extraction and evidence links, and purges saved packet reports to remove retained evidence references. Deleting a packet removes all its documents, jobs and reports. Account deletion removes every owned packet and invalidates sessions. Minimal audit events for a document or packet deletion are retained until account deletion. Demo workspaces expire after 24 hours.

The development release has no automated backups. Operator-triggered encrypted backup and restore, including deletion replay, are described in [review-engine contracts](REVIEW_ENGINE.md). SQLite WAL free pages and external filesystem backups can retain deleted bytes; active-record deletion is not a forensic erasure guarantee. A production retention and backup-expiration policy still needs review.

## Checks

- `npm run typecheck` checks the TypeScript contracts.
- `npm test` runs domain, API and actual worker tests using generated fixtures.
- `npm run build` creates the client bundle in `dist`.
- `npx playwright install chromium` installs the browser for local end-to-end tests.
- `npm run test:e2e` tests desktop/mobile journeys and automated accessibility.
- `npm run check` runs type checking, domain/API/worker tests and the client build.
- `npm run format` formats application source without reformatting the historical startup plan.

To serve the built client and API together locally, run `npm run build`, set `APP_ORIGIN=http://127.0.0.1:3001`, then run `npm start` and open that URL. For a custom port, use a matching origin. Node environment variables override values in `.env`.

Browser checks start their own API on port 3102 and web client on port 5180, with a separate temporary data directory. Leave these two ports available; they never reuse the personal server on 3001/5173. Failed checks retain local traces in ignored `test-results/`; CI uploads them for seven days. Fixture account cleanup never targets a personal account.

## Failure recovery

A server restart requeues interrupted inspections. Failed inspection is visible in the document view and can be retried. An upload retry with identical bytes returns the existing document. An evaluation retry with unchanged input revisions returns the existing run. Stale mutations return a conflict and require current packet state.

Do not delete the data directory while a server is running. Stop the server before moving or backing up local data. For test cleanup, stop the server and remove only the deliberately disposable test data directory. The application never automatically resets a personal workspace at startup.

## Current boundaries

The UCEED 2027 reference checklist is not a reviewed complete official pack. Editable starters and mechanical instruction-line import are implemented; automatic semantic rule interpretation is not. No automated authenticity, eligibility, category entitlement, legal identity, portrait-quality or certificate-validity decision exists. Additional OCR languages, managed authentication recovery, payments, institutional access, native apps and all public launch gates remain tracked work. Hosting is deliberately deferred while the requested runtime is localhost.
