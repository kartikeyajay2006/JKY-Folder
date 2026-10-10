# Every feature, in detail

New accounts show an upload entry. Application folders and document/checklist/report navigation appear after files are supplied; reports are saved only when you run a review. No starter or reference checklist is selected automatically. Empty folders are hidden from navigation, and removing the last file returns to the upload entry.

- Account registration, sign-in, display-name updates, password changes, session revocation and account deletion.
- Two themes of three colours each: **Gold** (white, royal blue, gold leaf) and **Silver** (black, white, brushed silver). They follow the device or a saved choice, switch with a circular reveal, and every colour pair meets WCAG AA.
- A workspace organised like a physical file: index-tab navigation, an application "file cover" with a deadline stamp, a per-item checklist strip instead of a single readiness score, a grouped checklist ledger, a folder-pocket drop zone and a printable, stamped report.
- An interactive landing page whose example folder is built from the real reference checklist, with one orchestrated intro (3D folder, drawn ticks, an embossed seal) and scroll reveals.
- Motion that answers actions: sliding tabs and page transitions, metallic sheen and pointer glare, skeleton loaders, toast timers. A persistent pause control and system reduced-motion stop all of it.
- A command palette (Ctrl + .) that searches actions, checklist items, documents and applications; files dropped on any page go to the current application; toasts offer the next step.
- No hard-coded product data in the browser: limits, profile questions, conditions, starters and reference checklists come from the public `/api/catalog`, and packet details include the server-resolved checklist and live evaluation.
- An application portfolio with real progress counts, search, sorting, deadlines, archive and restore.
- College, scholarship, job and custom checklist starters; instruction-line import and editable requirements.
- Optional items, profile conditions, file formats, custom size limits and literal text checks on linked PDF pages.
- A versioned UCEED 2027 reference checklist with explicit unknown profile answers.
- Private PDF/JPEG intake with per-file batch results, bounded asynchronous inspection, retries and duplicate detection.
- Actual PDF page previews with pagination and zoom, page-text extraction, JPEG previews and private original downloads.
- Requirement-to-document/page evidence links, multiple reviewed components or accepted alternatives, and clearly labelled personal review notes.
- Source snapshot hashes, exact obligation anchors, a curator draft/review/publication workflow and visible source-change handling.
- Structured fact confirmation, manual transcription, immutable correction history and confirmed-value comparison.
- Requirement-specific size, page, image-dimension and confirmed-date checks.
- Local English OCR for image-only PDF pages and JPEGs, with coordinates, confidence, uncertainty warnings and conservative evidence suggestions.
- Resumable uploads: originals travel in saved 512 KB chunks; a dropped connection retries with backoff, waits out offline periods and continues from the last saved chunk by itself. Unfinished uploads are listed with how much is saved, and the same file finishes from any tab or device within 24 hours.
- Instructions PDF to draft checklist: proposals with exact page anchors, joined wrapped lines, document lists under headings, size/pixel/page/format limits read from the wording and suggested conditions (for example "SC/ST candidates"). Review shows the source page beside each proposal; nothing is activated until you decide every item and confirm.
- Fit a photo or signature to a checklist item's pixel and file-size limits in the browser: crop with the mouse, touch or keyboard, rotate, whiten signature paper, and see every check pass before saving it as a new version. The original is kept.
- Under-18 applicants can sign up: a parent or guardian approves by email before any document is added, and can withdraw later, which deletes the account. Only the date the applicant turns 18 is stored.
- Name and date of birth compared across documents: capitals, titles, punctuation and date formats match; spelling, initials, order, missing middle names and swapped day/month are named, with parents' and schools' names ignored.
- My documents: every original once, with the applications that use it. Add any of them to another application without uploading again.
- Document type recognition: each inspected original is labelled with what it appears to be (Class 10 or 12 marksheet, Aadhaar, PAN, passport, caste/category, EWS, income, domicile, disability, birth, transfer, name-change proof, résumé, bank passbook, photograph or signature) from its own wording, file name and shape, and checklist suggestions use it. A guess for sorting, never a decision.
- Install on phone or desktop: a web app manifest, maskable icons and a service worker with an offline page. Private data under `/api/` is never cached on the device.
- Virus scanning before inspection when ClamAV is configured: infected files are deleted unopened, and uploads wait rather than reaching a parser unscanned while the scanner is down.
- Ready to host: a Docker image, Docker Compose with automatic HTTPS (Caddy) and optional ClamAV, a Render blueprint, scheduled encrypted backups, a database-checked health endpoint and proxy-aware rate limits. See [deployment](DEPLOY.md).
- Password recovery and email verification with single-use, 30-minute links, plus emailed reminders through a background worker. In development without SMTP, emails are saved to a local outbox (`npm run outbox`) so recovery and guardian approval work out of the box.
- Reminders on closed browsers through Web Push (RFC 8291/8292, built-in crypto): turn notifications on per device, send a test, and receive generic deadline and source-change notices with no titles or file names on the lock screen.
- Contact support from Help without sending documents: urgent wrong-result and privacy reports are prioritised, and sharing an application with support is opt-in, limited to 24 or 72 hours, revocable and recorded in your activity.
- Offline review workbooks for the independent reviewer of a rule pack and for blind benchmark labelling; their downloads are verified by the existing review and adjudication commands.
- Private in-app deadline/source reminders and preferences. Rate limits suit students on a shared hostel or college network: requests are counted per signed-in session, only failed sign-ins and link attempts count towards the guessing limit, and email sends and new accounts have their own per-network limits.
- Encrypted local backups, exact-object integrity checks and post-backup deletion replay on restoration.
- Conservative technical checks, missing evidence, unknown applicability and review-needed states.
- Versioned review snapshots, stale-report notices, JSON exports, printable reports and private ZIP folder downloads.
- Application URLs that retain the selected section on refresh and support browser Back/Forward.
- Search across requirements and extracted document text, filters, real account activity, help and privacy controls.
- Deletion of active documents, extracted pages, facts, links, jobs, reports and account sessions; recovery replays deletion records.

**A reviewed item is not a guarantee of authenticity, eligibility or institutional acceptance.** Starters are editable organizing suggestions, not official application rules. Instruction import creates one item per nonempty line; you confirm its meaning and conditions. The UCEED pack is a limited reference, not an independently approved complete official checklist. English OCR is a reading aid; uncertain scans and unsupported languages require manual review. Automatic certificate judgments are not implemented.

## Verification

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

The verification suite has **453 domain/API/worker/benchmark tests** and **58 desktop/mobile browser checks** (the two offline reviewer workbooks run on desktop only), plus TypeScript and the client build. It covers real PDF upload/extraction/rendering, photo fitting that saves a passing new version, guardian approval and withdrawal through the outbox, name and date-of-birth comparison, reuse from My documents, uploads that recover from dropped connections, offline periods and reloads, instructions-PDF drafting and review, password reset through the development outbox, Web Push encryption and VAPID signing against the RFC formats, support requests with time-limited access, reviewer workbooks whose downloads pass the real review and adjudication gates, mixed upload batches, duplicates, custom instructions and checklist changes, private ZIP bytes, account password/session controls, application navigation, evidence review, historical reports, deletion, keyboard focus, top navigation, quick actions, real file drops, account-menu interaction, the example folder's keyboard tabs, persistent animation controls, reduced motion, light/dark themes, drop-anywhere intake, palette search, phone-width overflow against the visual viewport, and automated accessibility across core screens and dialogs in both themes. Browser tests run desktop and mobile against separate fresh servers, using isolated ports and disposable synthetic accounts independent of your personal local data. This keeps the expanded suite below the normal per-server authentication limits. The dependency audit reported no known vulnerabilities at this review; it is a dated check, not a permanent assurance.

GitHub Actions runs the checks on pushes and pull requests and retains browser failure traces for seven days. Application source can be formatted with `npm run format`.
