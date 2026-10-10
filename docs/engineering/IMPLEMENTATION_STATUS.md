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

## Delivered development milestone

The six-stage implementation now includes a working account and packet API, a versioned reference pack and three-valued applicability, private intake and real PDF/JPEG inspection, page-level evidence assignment, applicant review notes, versioned reports and deletion. The frontend exposes those capabilities through welcome, overview, checklist, document, report, activity, help and privacy views.

Verification: 24 domain/API/actual-worker tests and eight desktop/mobile browser tests passed. Browser coverage includes automated accessibility scans of the welcome page, overview, checklist, profile dialog, evidence dialog, document list and report. This is scoped internal evidence, not a complete accessibility or security certification. Build and TypeScript checks passed. The dependency audit reported zero known vulnerabilities at review time.

The complete startup remains subject to the [open release gates](RELEASE_GATES.md). Implemented references in that document explicitly mean partial workstream fulfillment. The historical plan is preserved without retroactively marking its business research or public launch stages complete.
