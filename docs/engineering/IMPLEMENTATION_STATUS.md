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

That revision used short opacity/transform transitions, with explicit reduced-motion handling and no perpetual visual effects. The new welcome page has working process/workflow/account anchors, real registration/sign-in and the existing isolated demo entry. All checklist, upload, evidence, report, account and deletion workflows remain connected to the existing API.

The suite now includes **20 desktop/mobile browser checks**, including explicit no-sidebar assertions, account-menu arrow/Escape behavior, search from account settings, active-tab state, modal background isolation, narrow-screen overflow and reduced motion. Screenshots are refreshed from disposable synthetic accounts; the personal local data is retained.


## Motion and interaction revision

The welcome illustration now floats, its orbit moves and particles brighten gently while visible. Pointer movement adjusts the illustration and card lighting on devices with a fine pointer. Offscreen illustration effects stop, and CSS animations pause when the browser document is hidden. Scroll reveals use native IntersectionObserver/Web Animations APIs; pointer updates are scheduled through requestAnimationFrame rather than React renders.

A visible animation control pauses motion and persists the choice in browser storage. System reduced-motion preferences always take priority. Pausing cancels reveal/ripple effects, disables CSS transitions and continuous motion, clears pointer transforms, and presents final counter values directly. Keyboard and touch users retain the same actions without pointer effects.

The workspace includes a moving active-tab indicator, short section entrances, button ripples, row hover feedback, toast feedback, animated counters and an SVG readiness arc. The ring is a real button opening the report. Screen readers receive actual counter values immediately while the decorative count transition plays. Counters derive from real workspace data; no extra evidence judgments are implied by animation.

Quick actions provides searchable, keyboard-operated access to creating applications, choosing uploads, saving review snapshots and opening sections. It initially focuses its search field, skips disabled actions during arrow navigation, and shares the existing API-backed operations. Ctrl/Cmd + period opens it; Ctrl/Cmd + K continues to focus workspace search.

File drop targets now react to drag entry, nested drag departure and release. Dropping uploads actual originals through the existing private intake API; format/size/ownership checks and per-file outcomes remain enforced. The welcome workflow preview has three selectable example panels with tab/arrow/Home/End support. Examples remain clearly illustrative and separate technical checks from personal content review.

The verification suite has 39 domain/API/worker tests and 24 desktop/mobile browser checks. Added journeys verify continuous illustration motion, pointer response, persistent pause/reload behavior, system reduced motion, keyboard preview tabs, quick-action focus/navigation, real review snapshots, original-file drops and inspection, and accessibility of the new controls. The visual review also caught and removed a legacy ring mask that covered the new center label. A short browser recording and updated screenshots use isolated fictional accounts only.

## Server catalog, Gold and Silver themes and motion revision

The browser no longer bundles product data. Upload limits, profile questions, condition options, starter checklists and reference packs live in shared modules that the server enforces and serves from the public `/api/catalog`. Packet details now include the server-resolved checklist, a live evaluation and the evaluator version, so the client no longer re-implements evaluation. Next-step explanations are derived from the confirmed answers instead of per-requirement special cases.

The owner rejected the earlier dark/purple and navy/teal looks as generic. The interface now has two themes of three colours each: Gold (white paper, royal blue structure, metallic gold for reviewed marks, seals, tabs and the key action) and Silver (black, white, brushed silver). Headlines use Bodoni Moda with Manrope for interface text; both are self-hosted, so the production CSP still holds. A same-origin script applies a saved theme before first paint. Every state colour pair was checked for WCAG AA in both themes, and printing always uses the light palette.

The workspace is organised as a physical file: index-tab navigation whose current tab merges into the page, an application file cover with a deadline stamp, a per-item checklist strip (plan decision M03: explicit states rather than one percentage), a grouped checklist ledger with drawn state marks, a folder-pocket drop zone, a stamped printable report, an activity timeline and a breadcrumb on phones. App.tsx was split into view modules and four layered stylesheets were replaced by a token-based system.

Motion answers actions or plays once: the landing folder enters in 3D, its sheet rises, ticks are drawn and an embossed seal stamps down, then it idles gently and rests while off screen or under the pointer. Tabs slide and pages crossfade through the View Transitions API within one application; application switches update immediately so data loading stays ordered. Buttons sweep a sheen, cards carry a pointer glare, skeleton sheets replace spinners and the theme switch spreads from the toggle. The pause control and system reduced-motion stop all of it.

Quick actions became a command palette over real workspace data, files dropped on any page reach the current application, and toasts can carry the next step.

A phone-layout defect was found and fixed during this revision: a long one-line button label and an invisible tooltip made pages wider than a 390 px screen, so mobile browsers rescaled the layout and taps missed buttons. Earlier width checks compared against `innerWidth`, which grows with that overflow; browser tests now compare with the visual viewport, and test helpers wait only for running animations so paused off-screen motion cannot stall a scan.

Current local verification: **43 domain/API/worker tests and 28 desktop/mobile browser checks**, TypeScript and a production build. Screenshots and the motion preview were captured from disposable demo and synthetic accounts on an isolated data directory.

## Evidence review and recovery revision

The seven next-priority areas now have working local implementations, described in [review-engine contracts](REVIEW_ENGINE.md). Source snapshots and exact anchors support distinct author/reviewer publication, immutable packet selections and source-change invalidation. Requirements support multiple component anchors or alternatives, per-anchor review provenance, richer inclusive technical constraints and confirmed date rules. Structured extracted/manual facts retain original evidence and append-only corrections, with conservative comparison findings and historical report inputs.

Bundled English OCR handles scanned PDF/JPEG evidence with page coordinates, confidence and abstention, while evidence suggestions require user confirmation. Uploads show actual progress, cancellation and safe duplicate-aware retry. In-app deadline/source reminders use real private applications and user preferences. Encrypted backup/restore verifies exact originals and replays newer deletion records before reopening restored metadata.

New registrations and subsequent sign-in start with zero applications, documents, reports, reminders and visible activity. Consent remains in private audit storage; only the explicit demo creates fictional data. Account changes clear pending uploads, previews, dialogs and old application state. Existing Gold/Silver theme tokens, fonts and motion controls are retained. Browser assurance includes multiple evidence components, correction history, reminder preferences and interrupted uploads across desktop/mobile, with scoped accessibility scans.

Verification: 371 domain/API/worker/benchmark cases and 32 desktop/mobile browser checks, TypeScript and production build. The 312 critical-negative regression fixtures are author-labelled internal cases; independent ground-truth adjudication and complete current official pack approval remain open release gates. The source capture operator could not reach the official host directly in this environment; a browser-extracted primary-page snapshot supplies the bundled hash/anchor metadata, with full source text outside the repository.

## Upload-first workspace correction

The default workspace starts at upload. Application/checklist/document/report navigation is absent until a folder has actual originals, and starter cards are removed from the portfolio. First intake creates a folder and accepts its first original in one metadata transaction; rejected intake leaves no folder. Each uploaded original creates one review item, with no inferred UCEED photograph, signature, certificate or profile obligations. Deleting the last original returns the interface to upload entry. Empty legacy folders do not occupy visible navigation or intake quota.

Application-specific instructions are an explicit action after upload, attached to the current folder rather than creating a second application. Legacy folders without an explicit mode render their real originals while preserving prior instructions, profile answers and reports. The demo retains its explicitly selected instructions. Gold/Silver theme tokens and styling are unchanged. Verification covers empty navigation, rejected first intake, real PDF intake, duplicate handling, reload, last-file deletion and optional instruction activation.

Verification: 375 domain/API/worker/benchmark tests, all 38 desktop/mobile browser scenarios and the TypeScript/production build pass. The report history and historical-review action also have a viewport-width regression assertion; their sizing now fits phone screens without changing theme tokens. Browser projects use separate fresh servers so normal sign-in limits remain enabled.

## PDF intake, source review and account delivery revision (11 October 2026)

Instructions-PDF proposals now retain exact original hashes, source pages and character anchors, with explicit applicant decisions before checklist activation. Interrupted originals resume from durable 512 KiB chunks for 24 hours without creating placeholder folders. The UCEED registration draft now has 18 requirements, full source coverage sections and a private completeness-review dossier. Blind correctness exports and independent label adjudication are implemented; actual independent approval remains pending.

Password reset and email verification use expiring single-use links and revoke prior sessions after reset. Background reminder generation and a leased SMTP outbox operate without an open browser; real delivery requires configured SMTP credentials and a running server. Email is opt-in after address verification. Restores clear sessions and account links while preserving durable upload chunks. The theme and fresh-account upload-first behavior are retained.

See [intake and recovery](INTAKE_AND_RECOVERY.md), [official review and benchmark](OFFICIAL_REVIEW_AND_BENCHMARK.md) and [account email operations](ACCOUNT_EMAIL.md). These later contracts supersede earlier historical statements that instruction PDF intake, resumability or email recovery were unavailable. Independently reviewed completeness, real inbox delivery, production deployment and launch approval are separate evidence gates.

## Recovery, drafting and support revision (11 October 2026)

| Request | State | What exists | What still needs people or infrastructure |
| --- | --- | --- | --- |
| Instructions PDF to draft checklist | Implemented | Page-anchored proposals with joined wrapped lines, heading lists, cross-page merging, limits read from the wording, suggested conditions, side-by-side page preview, per-item decisions, completeness acknowledgement | Applicant judgement on every proposal; no claim of complete extraction |
| Complete official rule packs | Tooling complete, review pending | UCEED draft with 18 requirements, 97 obligations and 76 coverage sections; private dossier; offline review workbook; signed-review gate that rejects self-review, gaps and stale scope | An independent reviewer must read the sources and sign |
| Independent correctness testing | Tooling complete, labels pending | Version 2 corpus, blind export without answers, offline labelling workbook, adjudication that keeps disagreements | Labels from a person who did not write the expected answers |
| Resumable uploads | Implemented | Chunk rows with compare-and-set offsets, sliding expiry, automatic retry and offline waiting, unfinished-uploads list, finish from another tab or device | Production storage durability (gate 3) |
| Password recovery and background reminders | Implemented | Reset and verification links, minute worker, opt-in email, Web Push to closed browsers with generic text, development outbox | SMTP credentials and real-device push checks (gate 4) |
| Support access (plan JF-05-04) | Implemented locally | Help → Contact support, priority categories, time-limited revocable grants, redacted operator view, audited use | Staffing, response targets and an operator console |

Rate limiting now counts requests per signed-in session, with a per-address backstop, so applicants behind one shared network address no longer exhaust each other's allowance.

Verification: 437 domain/API/worker/benchmark tests, 26 desktop and 24 mobile browser scenarios (the reviewer workbooks are desktop-only), TypeScript and the production build pass. Two independent reviews (rule-pack completeness and benchmark labels) remain human evidence gates; the software only enforces and records them.

## Applicant tools revision (11 October 2026)

| Request | State | What exists | Limits |
| --- | --- | --- | --- |
| Photo and signature fixer | Implemented | Crop, rotate, resize and compress in the browser to the checklist's limits or typed sizes; signature background whitening; every check shown before saving; saved as a new version with lineage and optional evidence move | JPEG only; the evaluator re-checks the saved file; no face-quality judgement |
| Under-18 applicants | Implemented locally | Age choice at sign-up, guardian approval by email, locked processing until approval, waiting page, decline, change of guardian, withdrawal with erasure, 14-day expiry, end at 18 | Guardian identity is control of an email address; legal review open (gate 8) |
| Name and date-of-birth match | Implemented | Classified comparison across documents, chosen or majority reference, unconfirmed values marked, report concerns name the difference; extraction ignores parents' and schools' names | English OCR; documents inspected earlier keep their earlier extracted values |
| Upload once, use many times | Implemented | My documents library with uses, Add to…, From my documents picker, independent copies with inspection and confirmed facts | Copies count toward each application's limits |

Sign-in limits now count only failed attempts (30 per 15 minutes per address), with separate limits for email sends (20 per 15 minutes) and new accounts (100 per hour), so a classroom on one network can register while guessing and email flooding stay limited.

Verification: 453 domain/API/worker/benchmark tests, 30 desktop and 28 mobile browser scenarios, TypeScript and the production build pass. Evaluator version 2.1.0.
