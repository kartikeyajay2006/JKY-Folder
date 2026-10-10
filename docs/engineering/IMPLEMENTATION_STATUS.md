# Implementation baseline — 10 October 2026

The startup plan is retained as a dated specification. Implementation begins with a local development MVP; completed code does not certify the business or public launch gates.

## Plan review findings

The 96 workstreams contain 576 deliverables spanning product code, research, legal review, operations and expansion. Their repeated acceptance envelopes are a review framework, not concrete fixtures or evidence of implementation. This milestone turns the core contracts into executable behavior and tests.

Highest-risk dependencies: conditional applicability, evidence provenance, authorization, processing limits, stale reports, and deletion. The core must preserve unknown answers and distinguish uploaded files, technical passes and user-confirmed content.

## Implementation stages

1. Reproducible TypeScript project, visual foundation and engineering scope.
2. Shared requirement model, explicit condition semantics and deterministic evaluation.
3. Private persisted accounts, packet API, bounded document inspection and versioned runs.
4. Responsive workspace, document intake, evidence review, profile corrections and reporting.
5. Domain and API assurance, browser journeys and accessible interactions.
6. Release hardening, CI, setup instructions and measured completion status.

## Architecture adjustment

The local single-process MVP uses SQLite for metadata and a private filesystem directory for originals. This makes installation reproducible without infrastructure accounts. The repository abstractions retain ownership and revision boundaries. PostgreSQL, managed object storage, multi-instance job leasing and an OS/container sandbox remain public-deployment prerequisites. Do not represent a child process with limits as a full security sandbox.

The 2027 official registration page was checked on 10 October 2026. Its reference checklist is a scoped implementation aid, not independently approved complete application advice. Content, issuer authenticity, eligibility, nationality exceptions and accommodation judgment must remain visibly limited. No third-party byte or pixel limits are invented as official requirements.

## Beyond this implementation milestone

Market interviews, paid demand, legal review, production TLS/hosting, independently approved current packs, supplier contracts, payment processing, guardian flows, penetration review and the held-out launch benchmark require real evidence. They remain open startup gates. Real customer documents must not be used to test this development release.

## First delivered development milestone

The six-stage implementation now includes a working account and packet API, a versioned reference pack and three-valued applicability, private intake and real PDF/JPEG inspection, page-level evidence assignment, applicant review notes, versioned reports and deletion. The frontend exposes those capabilities through welcome, overview, checklist, document, report, activity, help and privacy views.

Verification: 24 domain/API/actual-worker tests and eight desktop/mobile browser tests passed. Browser coverage includes automated accessibility scans of the welcome page, overview, checklist, profile dialog, evidence dialog, document list and report. This is scoped internal evidence, not a complete accessibility or security certification. Build and TypeScript checks passed. The dependency audit reported zero known vulnerabilities at review time.

Final validation caught a hidden-storage-path defect in original downloads. The API fixtures now use a `.data` directory, verify every demo original's MIME and byte length, and deny anonymous and cross-account reads. The browser journey also verifies that the signature preview decodes and rejects server errors. Originals are served by a database-owned object key under an explicit private root; no private directory is mounted as a public asset.

The complete startup remains subject to the [open release gates](RELEASE_GATES.md). Implemented references in that document explicitly mean partial workstream fulfillment. The historical plan is preserved without retroactively marking its business research or public launch stages complete.

## Workspace and workflow revision

The repeated generic empty screens were replaced with a first-use workspace and distinct document, checklist and report onboarding. The visual system now uses a light navigation rail, indigo accents, clearer typography, responsive layouts and an original folder/check vector mark. Counters reflect actual stored data; starter examples and demo documents are labelled.

Applications can begin with college, scholarship, job or custom starters, as well as the separate UCEED reference option. The three-step setup accepts destination, calendar deadline, source URL and original instructions, then allows the requirement list to be edited before creation. Mechanical import maps each nonempty instruction line to an editable item; automatic semantic interpretation is not claimed.

Custom checklist editing persists required/optional items, supported file formats, simple conditional profile rules, size limits and expected literal phrases. Phrase checks use only linked PDF pages and keep absent extraction unresolved. Changes to custom checklist content, source or original instruction notes invalidate previous content confirmations. Historical report exports retain their saved checklist title/source. Older evaluator versions remain historical; retries reuse only matching input, checklist and evaluator versions.

The application portfolio now has search, sort, actual current review counts, deadlines, archive and restore. Archive preserves evidence and history. Private ZIP downloads contain exact inspected original bytes, a manifest and coverage notes; excluded files are identified. Each application has a URL that restores its section and selection after refresh and supports Back/Forward, with server ownership enforced independently.

The browser renders actual PDF originals with page controls and zoom; page selection connects to evidence ranges. Original-document previews and extraction remain distinct. Batch intake attempts each file independently, keeps valid uploads around a rejected file, identifies duplicate bytes, and offers retry for failed intake. Inspection is a separate asynchronous state.

Display-name changes, current-password-verified password changes, session rotation and sign-out of other sessions work through account settings. The activity view retrieves real private account events with application/document/account filters. Existing document, application and account deletion remain operational.

Current local verification passed **39 domain/API/actual-worker tests and 18 desktop/mobile browser checks**, TypeScript and a production client build. Browser coverage includes fresh accounts with no packets, custom checklist setup/editing, archive/restore, account settings, actual PDF page rendering, mixed valid/invalid batches, duplicates, browser history, password changes and new-session sign-in. Synthetic tests use separate temporary data and ports, preserving the personal local workspace. Automated accessibility checks cover scoped screens, dialogs and upload outcomes; this remains internal assurance rather than certification.

The frontend milestone initially exposed a CI-only mobile test timeout: the test attempted navigation before the authenticated workspace had mounted after reload. The navigation helper now explicitly waits for the workspace. CI retains failure traces/screenshots for seven days to make future failures reviewable.

Hosting is deferred at the owner’s request. The implemented runtime is localhost, with no public deployment, payments, managed recovery emails, OCR, institutional rule-pack certification or claim that the business launch gates have been completed.

## Sidebar-free visual revision

The owner requested a new direction referencing [Mark 1 by Omium](https://mark.omium.ai/). Its public page was reviewed for dark surfaces, restrained accents, large typography, compact navigation and thin borders. JKY-Folder uses original content, original SVG packet artwork and its own application workflows; the reference’s assets and product claims are not copied.

The sidebar markup, mobile drawer, scrim and corresponding styles were removed. A sticky top header now carries workspace search and a keyboard-operated account menu. Horizontal tabs expose all six main sections, with always-available help/settings controls. Tabs scroll independently on narrow screens instead of opening a drawer. Sign-in opens the workspace at the top of the page; changing sections resets the view without scrolling the entire document to reveal a tab.

The dark visual system covers the welcome page, populated and empty workspace states, portfolio, requirements, documents, reports, activity, help, settings, account entry, setup/edit dialogs, JPEG evidence and original PDF controls. The PDF canvas retains a paper background. Printed reports retain a light background for readability.

Animations use short opacity/transform transitions, with explicit reduced-motion handling and no perpetual visual effects. The new welcome page has working process/workflow/account anchors, real registration/sign-in and the existing isolated demo entry. All checklist, upload, evidence, report, account and deletion workflows remain connected to the existing API.

The suite now includes **20 desktop/mobile browser checks**, including explicit no-sidebar assertions, account-menu arrow/Escape behavior, search from account settings, active-tab state, modal background isolation, narrow-screen overflow and reduced motion. Screenshots are refreshed from disposable synthetic accounts; the personal local data is retained.
