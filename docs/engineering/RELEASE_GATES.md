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

1. Independently reviewed complete current rule pack, including source omissions and conditional exceptions. Full-source coverage, scope-bound workbooks and registered Ed25519 reviewer signatures are enforced; a real person who did not author the pack must perform and sign the review.
2. Applicant research and paid-demand validation, with consented outcome records.
3. Production storage encryption and approved retention/backup lifecycle. Streaming encrypted archives, configured restic uploads, deletion-ledger mirrors and atomic offline restoration exist. Actual independent off-site storage, retention/erasure boundaries and recovery targets must be verified. A managed database/object store remains a scaling project.
4. HTTPS deployment, verified secure-cookie origin, real SMTP/inbox validation for the implemented account recovery/email verification, and Web Push delivery checked on real Chrome, Firefox and Safari devices.
5. Deployment-specific security review of parser isolation, malware controls and measured resource limits. Production now requires verified bubblewrap namespaces, no parser network/private-data access, read-only originals, output/schema/CPU/time limits and ClamAV. Docker supplies aggregate memory/process/CPU ceilings with swap disabled. The configured host policy and realistic capacity still require outside review.
6. Multi-instance queue leases and cross-instance mutation controls if scaling beyond the supported single runtime. A kernel lock protects the current SQLite runtime; persisted attempts prevent crash/requeue loops. Restore stages data, checks integrity/replays deletions and clears session, notification, support, reviewer and guardian authority requiring renewed consent.
7. Independent penetration and access-control review, operational incident staffing and monitored recovery targets. Protected metrics, tested alert rules, actual local alert delivery and bounded capacity/recovery measurement tools are implemented; real receiver and workload budgets still need evidence.
8. Qualified legal review, processing notices, processor contracts and an approved age/guardian policy.
9. Held-out correctness benchmark, source completeness review and the plan’s critical false-pass threshold. Frozen private manifests, independent-label execution, signed third-reviewer adjudication, zero-mismatch/false-pass checks and exact official-pack branch coverage exist. Actual independent labels and identity verification are still required; passing author-labelled regression cannot close this gate.
10. Payment, refund and contribution-margin validation before charging for a service.
11. Assistive-technology usability studies and full accessibility audit before claiming WCAG conformance.
12. Trademark clearance and final vector brand production.

## Intentionally deferred features

Custom instruction drafts and editable college/scholarship/job starters now work locally. They are not reviewed official rule packs. Additional OCR languages, automatic semantic/AI interpretation, external authenticity verification, automatic PDF transformation, institution permissions, partner integrations, automated official-portal submission, independently reviewed scholarship/job packs and international expansion remain deferred. They require their own acceptance evidence and phase gates.

## Architecture decisions made

SQLite and local private objects replace the plan’s provisional PostgreSQL/managed-storage stack for a reproducible single-instance development release. A durable document-job table allows restart recovery. Production parsing now requires verified bubblewrap namespaces and container resource ceilings under the supplied host policy. Deployment-specific outside review and capacity evidence are still required before processing real sensitive documents.

A content-review confirmation can produce a scoped pass, with verification provenance set to `user`. It never becomes an automated issuer or content-authenticity result. Reports carry the selected checklist’s limits. Expected-phrase checks operate only on extracted text in linked pages; missing text remains review-needed, including scanned pages. Checklist or original instruction changes invalidate prior content confirmations.

When deleting a document, saved runs for that packet are purged instead of retaining sensitive evidence references in historical exports. Historical runs remain available for ordinary profile and linking revisions, but never survive an evidence deletion merely to preserve history.

## Evidence review extension

Source-registry/publication tooling, multiple evidence anchors, structured confirmations/correction history, richer deterministic checks, local English OCR, evidence suggestions, in-app reminders and encrypted local recovery are implemented. See [review-engine contracts](REVIEW_ENGINE.md) for exact limits and operator commands. The expanded registration/FAQ/brochure coverage inventory is author-mapped and remains a draft. Completeness decisions and blind benchmark label import now enforce review provenance, but actual independent sign-off remains pending. The synthetic benchmark labels await independent adjudication. Neither extension closes independent rule-pack completeness, held-out benchmark, OS sandbox, automated offsite recovery or public deployment gates.

The [independent review workflow](INDEPENDENT_REVIEW.md) now verifies purpose-bound signatures against an operator-checked reviewer registry. Publication is transactional and rejects unsigned or revoked approvals. Version 3 has 284 distinct general evaluator scenarios and a separately generated 252-case UCEED rule projection; outputs remain private and no fictional reviewers are registered in the real application. Review keys require re-verification after recovery. These mechanisms make genuine approval executable and auditable; they do not manufacture the review itself.

## Applicant tools (JF-04-06, JF-02-10, JF-06-09, JF-06-11)

Under-18 applicants can register with email approval from a parent or guardian; nothing personal is processed before approval, withdrawal erases the account, unapproved accounts are erased after 14 days, and only the date of turning 18 is stored. Gate 8 still applies: the age boundary, the strength of guardian verification (control of an email address) and child-data restrictions need qualified legal review before public launch. Name and date-of-birth comparison, browser-side photo fitting and reuse of originals across applications are implemented; see [applicant tools](APPLICANT_TOOLS.md). They are aids, not identity or acceptance decisions.

## Support access (JF-05-04)

Applicants can contact support from Help without attaching documents. Wrong-result and privacy reports are prioritised. Sharing an application with support is opt-in, limited to 24 or 72 hours, revocable, unavailable for demo workspaces and recorded as grant, use, revocation and closure events in the applicant's activity. Operators see a redacted summary only while access is active. Staffing, response targets, operator identity verification and an operator console with role-based access remain open, under gate 7.

## Current runtime and recovery evidence (11 October 2026)

This revision supersedes the earlier child-process-only architecture description: a compatible production host now requires verified bubblewrap namespaces, the supplied container host policy, scanning and bounded resources. Streaming encrypted archives, configured repository uploads, ledger mirrors, atomic offline recovery and scoped preflight/intake smoke checks are implemented and exercised locally in Docker. They establish software behavior for the supported single runtime; they do not approve an arbitrary hosting provider or supply independent security review, actual off-site durability, zero-loss erasure replication or live email/push evidence.

The [external review and pilot packet](PILOT_AND_EXTERNAL_REVIEW.md) records the remaining human and infrastructure evidence. Existing genuine source-review and independently authored benchmark gates remain open. Legal/privacy approval, assistive-technology testing, operational staffing, student research and payment/brand decisions still need their own evidence. Multi-instance deployment requires a separate architecture change and capacity measurements.


## Current evidence checker and operational drills (11 October 2026)

[Launch evidence](LAUNCH_EVIDENCE.md) now consolidates the exact source/correctness approval with independently signed outside/deployment records. It verifies referenced evidence bytes, release/build/public/image/environment scope, expiry, registry revocation, mandatory tasks, unresolved severe findings and actual pilot counts. Missing evidence remains pending; failed evidence is not waived. Actual source and correctness review still require independently authored work by real verified people.

[Monitoring and capacity](MONITORING_AND_CAPACITY.md) provide protected metrics, 13 alert rules, full-timing rule simulations, an actual local notification drill and bounded concurrent PDF/OCR workload measurements. [Recovery operations](RUNBOOK.md) provide a disposable real-repository restore rehearsal. These local checks have passed; actual on-call delivery, provider outages, representative capacity budgets and storage-encryption/failure-domain/retention decisions remain deployment evidence. The software prevents these pending items from silently becoming a completed launch.
