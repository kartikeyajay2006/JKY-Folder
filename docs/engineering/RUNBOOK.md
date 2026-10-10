# Local development runbook

Requires Node.js 22.12 or newer. Verified locally with Node 22.22.0. The lockfile records the dependency versions used for this milestone.

## First run

1. Run `npm ci` in the repository root.
2. Optionally copy `.env.example` to `.env` and set the desired local ports, origin and private data path.
3. Run `npm run dev`.
4. Open `http://127.0.0.1:5173`.
5. Choose **Explore the demo** for an isolated fictional workspace, or create an adults-only development account.

The web client listens on port 5173 and proxies API requests to port 3001. If you change the API port, update the Vite proxy to match. The server binds loopback by default. It does not publish a website to the internet.

## Review a packet

Create a packet and confirm the application details. Unknown answers remain unresolved. Upload PDFs or JPEGs, wait for inspection, then open a requirement and connect a document and page range. Inspect the original, record your own review note, and save the evidence link. Run a review to save a dated snapshot.

The report distinguishes supported technical checks and applicant content confirmation. Changing a profile, adding a file or changing an evidence link makes an earlier report historical. Running a fresh review creates a new snapshot. A retry with unchanged inputs reuses the existing run.

Export JSON for machine-readable provenance, or use **Print / PDF** for a printable report. The printable report includes source, version and coverage limits. Exports are private authenticated responses.

## Document limits

Local engineering limits are 10 MB per file, 10 files and 30 MB per packet, and 20 pages per PDF. These are service limits, not asserted official application limits. JPEG decoding is bounded to 20 million pixels. Files are inspected in a separate Node process with a 192 MB JavaScript heap budget and a 15-second wall-time deadline.

These process limits are not a full operating-system sandbox and do not prevent arbitrary native-code resource use. Production isolation requires a separately reviewed sandbox and aggregate capacity policy.

Only PDF and JPEG originals are accepted. The actual file content is inspected. `.jpeg` is accepted into the document library, but the reference requirement checks `.jpg` when that extension is specified. Encrypted, damaged or unsupported files remain unavailable for download and evidence linking. Failed inspection can be retried or the file deleted.

Text-based PDF extraction preserves page numbers. Image-only PDFs do not get OCR. Download and inspect the original when extraction is empty or uncertain. Images remain manual-review evidence.

## Data and deletion

Metadata is in `.data/metadata.sqlite` and originals are in `.data/objects`, unless `DATA_DIR` is changed. The directory is ignored by Git. Metadata and originals are outside the web asset directory. Passwords use salted scrypt hashes. Sessions use HTTP-only same-site cookies and server-side token hashes; state-changing requests require CSRF tokens.

Deleting a document removes its active original, extraction and evidence links, and purges saved packet reports to remove retained evidence references. Deleting a packet removes all its documents, jobs and reports. Account deletion removes every owned packet and invalidates sessions. Minimal audit events for a document or packet deletion are retained until account deletion. Demo workspaces expire after 24 hours.

The development release has no automated backups. SQLite WAL free pages and external filesystem backups can retain deleted bytes; active-record deletion is not a forensic erasure guarantee. A production retention and backup-expiration policy still needs review.

## Checks

- `npm run typecheck` checks the TypeScript contracts.
- `npm test` runs domain, API and actual worker tests using generated fixtures.
- `npm run build` creates the client bundle in `dist`.
- `npx playwright install chromium` installs the browser for local end-to-end tests.
- `npm run test:e2e` tests desktop/mobile journeys and automated accessibility.
- `npm run check` runs type checking, domain/API/worker tests and the client build.
- `npm run format` formats application source without reformatting the historical startup plan.

To serve the built client and API together locally, run `npm run build`, set `APP_ORIGIN=http://127.0.0.1:3001`, then run `npm start` and open that URL. For a custom port, use a matching origin. Node environment variables override values in `.env`.

## Failure recovery

A server restart requeues interrupted inspections. Failed inspection is visible in the document view and can be retried. An upload retry with identical bytes returns the existing document. An evaluation retry with unchanged input revisions returns the existing run. Stale mutations return a conflict and require current packet state.

Do not delete the data directory while a server is running. Stop the server before moving or backing up local data. For test cleanup, stop the server and remove only the deliberately disposable test data directory. The application never automatically resets a personal workspace at startup.

## Current boundaries

The UCEED 2027 reference checklist is not a reviewed complete official pack. No automated authenticity, eligibility, category entitlement, legal identity, portrait-quality or certificate-validity decision exists. Custom instruction ingestion, OCR, managed authentication recovery, payments, institutional access, native apps and all public launch gates remain tracked work.
