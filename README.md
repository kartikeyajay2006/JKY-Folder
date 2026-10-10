# JKY-Folder

**Your next chapter. All in one folder.**

A working development MVP for reviewing application documents against a scoped requirement checklist. Bring original files together, confirm which requirements apply, link evidence to pages, and save a clear report of missing documents and unresolved checks.

![JKY-Folder workspace with fictional demo evidence](docs/engineering/screenshots/workspace.png)

## Run it locally

Requires **Node.js 22.12+**.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173** and choose **Explore the demo**. The demo has fictional documents, an isolated account and a real working review workflow. You can also create your own adults-only development account. Use synthetic documents while public launch gates remain open.

## What works

- Account registration, sign-in, private sessions, CSRF protection and account deletion.
- Separate application packets with persisted profiles and explicit unknown answers.
- A versioned UCEED 2027 reference checklist with conditional requirements.
- Private PDF/JPEG uploads, bounded asynchronous inspection, retries and duplicate detection.
- PDF page-text extraction and original-document downloads after inspection.
- Requirement-to-document/page evidence links and clearly labelled personal review notes.
- Conservative technical checks, missing evidence, unknown applicability and review-needed states.
- Versioned review snapshots, stale-report notices, JSON exports and printable reports.
- Responsive desktop/mobile workspace, search, filters, timeline, help and privacy controls.
- Deletion of active documents, extracted pages, links, jobs, reports and account sessions.

**A reviewed item is not a guarantee of authenticity, eligibility or institutional acceptance.** The source pack is a limited reference, not an independently approved complete official checklist. Scanned PDFs require manual review; OCR and automatic certificate judgments are not implemented.

## Verify the application

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

The milestone has **24 passing domain/API/worker tests** and **eight passing desktop/mobile browser tests**. Browser checks cover real PDF upload/extraction, evidence review, report export, stale reports, deletion, keyboard focus and automated accessibility across core screens and dialogs. The dependency audit reported no known vulnerabilities at this review; it is a dated check, not a permanent assurance.

GitHub Actions runs the checks on pushes and pull requests. Application source can be formatted with `npm run format`.

## Architecture and boundaries

React + TypeScript + Vite client; Express API; SQLite metadata; private filesystem originals; durable document jobs and a separate inspection process. Data lives in the ignored `.data` directory and is never a public asset. The current runtime is intended for a **local single-instance development release**.

Read the [runbook](docs/engineering/RUNBOOK.md), [implementation status](docs/engineering/IMPLEMENTATION_STATUS.md), [release gates](docs/engineering/RELEASE_GATES.md) and [security notes](SECURITY.md) before operating it. Production hosting, reviewed rule-pack completeness, managed storage, hardened isolation, recovery operations, legal review, paid-demand validation and payment processing remain required startup work.

This implementation has not been publicly deployed or certified as ready for real sensitive applicant documents.

## Preview and startup plan

[Welcome screen](docs/engineering/screenshots/welcome.png) · [Mobile workspace](docs/engineering/screenshots/mobile.png) · [Original logo concept](docs/brand/jky-folder-logo-concept.png)

The original **29,354-line startup implementation plan** remains preserved as a dated specification across the [master plan](IMPLEMENTATION_PLAN.md) and six detailed volumes. It contains 96 workstreams, 576 deliverables and 2,304 acceptance situations. Implementation references are mapped in the release-gate document; business and expansion deliverables are not marked complete by the existence of code.

| Volume | Subject |
| --- | --- |
| [01](docs/plan/01-strategy-product-brand.md) | Strategy, discovery, product experience and brand |
| [02](docs/plan/02-requirements-documents-evidence.md) | Requirements, conditional rules, documents and evidence |
| [03](docs/plan/03-architecture-data-delivery.md) | Architecture, contracts, persistence and delivery |
| [04](docs/plan/04-trust-privacy-quality.md) | Security, privacy, evaluation and release assurance |
| [05](docs/plan/05-operations-pricing-launch.md) | Operations, pricing, launch and customer support |
| [06](docs/plan/06-roadmap-growth-governance.md) | Roadmap, growth, expansion and governance |

[Research sources](docs/SOURCES.md) · [Brand brief](docs/brand/LOGO_BRIEF.md)

Repository owner and sole author of publication commits: **kartikeyajay2006**.
