# Release gates — development MVP

## Implemented in this milestone

| Plan area | Code / evidence | Scope |
| --- | --- | --- |
| JF-01-07 to JF-01-12 | Account entry/settings, responsive workspace, first-use flows, application portfolio, deadlines, evidence dialogs and browser checks | Working local usability foundation |
| JF-02-02 to JF-02-05 | Versioned reference pack, editable starters, instruction-line drafts, three-valued predicates and deterministic checks | One scoped reference plus user-defined checklists |
| JF-02-06 to JF-02-09 | Private intake, separate inspection worker, PDF page extraction and evidence links | PDF/JPEG, bounded local processing |
| JF-02-12 to JF-02-14 | Immutable evaluation runs, applicant review notes, private ZIP/JSON exports and evaluator version provenance | User confirmation is labelled |
| JF-03-02 to JF-03-08 | Accounts, sessions, ownership, SQLite, private originals, durable job records and API contracts | Local single-instance architecture |
| JF-03-09 to JF-03-11 | Live checklist states, revision conflicts, evidence retrieval and report history | Explicit stale state |
| JF-04-02, JF-04-03, JF-04-07 | Adversarial intake, cross-owner denials, deletion and retry tests | Internal development assurance |
| JF-04-13 | Desktop/mobile accessibility scans and keyboard dialog checks | Automated checks plus scoped manual visual review |

References indicate partial implementation of the corresponding workstream, not completion of all six deliverables or an independently approved launch gate.

## Must remain open before real public applicants

1. Independently reviewed complete current rule pack, including source omissions and conditional exceptions.
2. Applicant research and paid-demand validation, with consented outcome records.
3. Production database/object store, storage encryption and approved retention/backup lifecycle.
4. HTTPS deployment, verified secure-cookie origin and managed account recovery/email verification.
5. Parser isolation with operating-system/container restrictions, malware controls and measured resource limits.
6. Multi-instance queue leases, atomic cross-instance mutation controls, backup restoration and deletion replay.
7. Independent penetration and access-control review, operational incident staffing and monitored recovery targets.
8. Qualified legal review, processing notices, processor contracts and an approved age/guardian policy.
9. Held-out correctness benchmark, source completeness review and the plan’s critical false-pass threshold.
10. Payment, refund and contribution-margin validation before charging for a service.
11. Assistive-technology usability studies and full accessibility audit before claiming WCAG conformance.
12. Trademark clearance and final vector brand production.

## Intentionally deferred features

Custom instruction drafts and editable college/scholarship/job starters now work locally. They are not reviewed official rule packs. OCR, automatic semantic/AI interpretation, external authenticity verification, transformed upload preparation, institution permissions, partner integrations, automated official-portal submission, independently reviewed scholarship/job packs and international expansion remain deferred. They require their own acceptance evidence and phase gates.

## Architecture decisions made

SQLite and local private objects replace the plan’s provisional PostgreSQL/managed-storage stack for a reproducible single-instance development release. A durable document-job table allows restart recovery. Processing uses a child process with time and heap budgets, but no claim of a complete security sandbox. These choices need a production adapter and review before externally processing sensitive documents.

A content-review confirmation can produce a scoped pass, with verification provenance set to `user`. It never becomes an automated issuer or content-authenticity result. Reports carry the selected checklist’s limits. Expected-phrase checks operate only on extracted text in linked pages; missing text remains review-needed, including scanned pages. Checklist or original instruction changes invalidate prior content confirmations.

When deleting a document, saved runs for that packet are purged instead of retaining sensitive evidence references in historical exports. Historical runs remain available for ordinary profile and linking revisions, but never survive an evidence deletion merely to preserve history.
