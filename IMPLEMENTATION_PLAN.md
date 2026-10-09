# JKY-Folder — startup implementation plan

Planning baseline: 9 October 2026, Asia/Kolkata.
Status: proposed implementation and business work; no application code or completed-product claims.
Repository: https://github.com/kartikeyajay2006/JKY-Folder.
Owner: kartikeyajay2006.

## 1. What the company will build

JKY-Folder will help an applicant check a document packet against the instructions for a particular application, year and stage.
The applicant selects a supported application pack or supplies instructions, answers the facts needed for conditional requirements, and uploads supporting files.
The system will connect requirements to files, pages and extracted facts, then present missing evidence, failed technical checks, inconsistencies and unresolved interpretation.
Every material finding must explain its basis and let the applicant inspect the relevant source and document location.
The core business hypothesis is that whole-packet review saves enough time and prevents enough avoidable preparation errors to justify payment.
That hypothesis needs concierge evidence and paid pilots before broad automation investment.

### 1.1 Explicit boundaries

Readiness is a scoped review outcome, never a guarantee of eligibility, authenticity, admission, employment or institutional acceptance.
A file existing does not prove that its content satisfies a requirement.
A clear scan does not prove that a certificate is authentic.
Name similarity does not prove that two identity records belong to the same person.
An unanswered condition does not mean that its requirement is inapplicable.
The institution remains the authority on its own application process.
The first release will not submit applications, log into official portals, sign documents, create certificates or automatically edit official evidence.
The first release will not infer sensitive applicant categories from documents.
Manual review will be visible as manual review and will not become a disguised automated pass.

## 2. Plan navigation and scope discipline

The six linked volumes are the detailed task catalogue, collectively targeted at 20,000–30,000 actual Markdown lines.
Each of the 96 workstreams contains six deliverables with stable identifiers and four scoped acceptance situations per deliverable.
Repeated contract labels make tasks independently reviewable; implementation decisions belong in the master plan and task-specific artifacts.
This catalogue includes discovery, MVP, launch prerequisites and later startup capabilities.
A task appearing in the catalogue does not make it an MVP requirement.
A deferred task must have its user-visible effect documented before launch.
No volume is an assertion that tests have run or capabilities have been implemented.

| Volume | Use |
| --- | --- |
| [01 — Strategy, product and brand](docs/plan/01-strategy-product-brand.md) | Validate demand, narrow the customer and design the experience |
| [02 — Requirements, documents and evidence](docs/plan/02-requirements-documents-evidence.md) | Specify the application-rule and evidence engine |
| [03 — Architecture, data and delivery](docs/plan/03-architecture-data-delivery.md) | Specify system boundaries and engineering contracts |
| [04 — Trust, privacy, safety and quality](docs/plan/04-trust-privacy-quality.md) | Define assurance required before public use |
| [05 — Operations, pricing and launch](docs/plan/05-operations-pricing-launch.md) | Run a measurable paid service |
| [06 — Roadmap, growth and governance](docs/plan/06-roadmap-growth-governance.md) | Expand only after core gates hold |

## 3. Initial market and validation

Start with India-focused education applicants using one application family with an official published instruction set.
UCEED 2026 is a historical fixture for learning and evaluation; it is not the assumed live cycle on 9 October 2026.
Before choosing a commercial launch pack, identify an upcoming cycle and freshly review its official instructions and updates.
Interview 30 applicants across device, language, experience and support differences.
Conduct at least 20 consented concierge packet reviews before deciding which document operations deserve automation.
Do not upload real applicant documents into the public GitHub repository.
Use synthetic fixtures for demonstrations and evaluation; consented research material stays in controlled storage.
Measure preparation time, unresolved requirements, corrections made and customer willingness to pay.
Treat adoption, revenue and conversion forecasts as hypotheses until there are actual pilot cohorts.
Investigate UploadPrep as a dated upload-preparation alternative; its observed functionality does not establish that no competitor can review a packet.
The proposed distinction is requirement-to-evidence review across the packet, demonstrated with a comparable user task.

### 3.1 Discovery gate

Proceed to MVP only if at least 15 of 30 interviewees demonstrate recent material packet uncertainty and the concierge pilot finds repeated solvable issues.
Require evidence that users understand the readiness boundary and can find an issue's source.
Obtain at least five genuine paid-pilot commitments or a documented equivalent procurement signal.
If users mainly need image resizing, test whether the whole-packet thesis deserves revision before building a broad engine.
The threshold is a founder planning choice, not a market fact or statistical proof of demand.

## 4. Foundational decisions

| ID | Proposed decision | Reconsider when |
| --- | --- | --- |
| M01 | One application family and one launch cohort | Core quality and paid demand support a second cohort |
| M02 | Human-curated rule packs first | Draft extraction reliably reduces curator effort |
| M03 | Explicit check states and coverage rather than one readiness percentage | Evidence supports a summary that users interpret correctly |
| M04 | Modular monolith with isolated document workers | Measured load or ownership boundaries justify service extraction |
| M05 | Responsive web application first | Mobile web evidence demonstrates a native capability gap |
| M06 | Relational metadata plus private object storage | Actual access patterns justify additional stores |
| M07 | Deterministic checks for file constraints and approved predicates | A specific non-deterministic task passes independent evaluation |
| M08 | No sensitive document content in product analytics | A new necessary purpose passes privacy review |
| M09 | Originals immutable; transformations create derivatives | No planned relaxation |
| M10 | No application submission or official-portal credential collection | Separate risk, product and authorization assessment approves it |
| M11 | Original logo concept pending clearance and vector refinement | Search or usability evidence identifies a conflict |
| M12 | Adults-only private pilot until minor-processing controls are ready | Legal review and guardian flow are approved |

## 5. MVP acceptance scope

The MVP includes account access, one versioned application pack, conditional profile questions, file intake, deterministic file checks, page extraction, evidence assignment and a scoped report.
Users can correct an extracted value while preserving its original evidence and previous revision.
Users can manually map a document to a requirement; the mapping itself does not mark the requirement satisfied.
The report distinguishes confirmed technical failure from unreadable evidence or unsupported interpretation.
Deletion and support access must work before processing real pilot documents.
If automatic extraction fails, users can review or manually supply a supported value without hidden correctness claims.
A clean packet needs complete supported coverage, valid source versions and no unresolved blocking checks.
Custom instructions initially create an unverified draft checklist requiring explicit confirmation; they must not receive the same assurance badge as reviewed official packs.
Broad scholarship packs, job verification, institution dashboards, external integrations and native applications are deferred.
LLM-generated rules, issuer-authenticity checks, biometric checks, automated certificate judgments and portal automation are deferred.

### 5.1 Reference user journey

1. Explain what the product checks and how sensitive documents are handled.
2. Select an application family, cycle and stage.
3. Show the pack's official sources and review date.
4. Ask only profile facts that affect supported conditions, allowing unknown answers.
5. Display applicable, unresolved and inapplicable requirements separately.
6. Upload originals into quarantined private storage and show progress.
7. Process safe supported files, preserving page provenance and extraction confidence.
8. Suggest evidence links and ask the user to confirm ambiguous assignments.
9. Run technical checks and approved requirement predicates against immutable revisions.
10. Show issues beside their source, evidence and corrective next action.
11. Let the user replace evidence, correct extracted facts and rerun affected checks.
12. Export a dated report with the unresolved limitations and source versions.
13. Let the user delete the packet and understand any justified retention exception.

## 6. Requirement and evidence contract

A requirement record contains a stable ID, application family, cycle, stage, official source version, source anchor, human-readable instruction, predicate and evidence expectations.
It also records allowed technical constraints, severity, reviewer, publication state and conditions under which its interpretation is unsupported.
A predicate uses confirmed applicant facts and approved operators; unknown facts propagate unknown rather than becoming false.
A condition evaluation records input fact revisions and an explanation of its outcome.
An evidence link connects a requirement revision to an immutable file version, page range and optional extracted field.
A check result records evaluator version, inputs, state, reason, coverage limit, source anchor and evidence anchors.
A manual override records actor, rationale, permission scope and time; it remains distinct from a machine result.
An evaluation run references the packet revision, profile revision, rule-pack version and extraction versions.
Deleting or replacing evidence invalidates its dependent checks and reports.
A historical report stays a dated snapshot and never silently represents new revisions.

### 6.1 Check states

| State | Meaning | Packet implication |
| --- | --- | --- |
| pass | A supported check has affirmative evidence | Counts only toward that check's coverage |
| fail | A supported check has evidence of a violated constraint | Blocks the relevant ready conclusion |
| unknown | Required facts or interpretable evidence are absent | Prevents complete supported coverage |
| needs_review | Conflicting evidence or judgment remains | Remains unresolved |
| not_applicable | An approved condition is confirmed false | Excluded with an inspectable explanation |
| pending | Processing has not completed | No final conclusion |
| error | Processing failed | Retry or supported manual path required |
| stale | Inputs differ from those used for evaluation | Recompute before current reporting |

### 6.2 Conservative examples

If the supplied instruction requires name-change evidence and confirmed names differ, show the missing supporting evidence and link both name locations and that instruction.
Do not infer a legal name change from OCR differences, reordered names, initials or transliteration alone.
If the applicant has not confirmed a conditional profile answer, show the related requirement as unresolved.
If a document is a PDF by extension but cannot be safely parsed as a PDF, mark the technical check failed or processing unavailable as appropriate.
If a required page is unreadable, its evidence is unknown even when the file is present.
These are proposed behavior contracts; they are not determinations about any real applicant.

## 7. Proposed system architecture

Use a responsive web client, one application API, a relational database, private object storage and a durable asynchronous work queue.
Isolate parsers, renderers, OCR and transforms in resource-limited workers with restricted network access.
The API owns authorization, packet metadata, rule-pack selection, evaluation orchestration and report access.
Workers receive scoped object references, not long-lived unrestricted storage credentials.
A rules module evaluates reviewed declarative predicates and deterministic technical constraints.
A provenance module maintains evidence anchors, revisions and invalidation relationships.
A report module reads completed evaluation snapshots and makes coverage limitations explicit.
A curator interface drafts and reviews pack revisions using four-eyes approval before publication.
Start with a familiar supported stack rather than selecting fashionable infrastructure.
A reasonable provisional stack is a TypeScript web client and API, PostgreSQL, managed private object storage and Python document workers.
Validate library maintenance, license, security and operational cost at implementation time; this plan does not assert current version compatibility.
Avoid Kubernetes, vector databases and independent microservices until measured requirements justify their operating burden.

### 7.1 Processing sequence

Authorize upload intent and create an upload session scoped to a tenant and packet.
Apply envelope limits, content-type detection and integrity checks before accepting the original.
Quarantine the uploaded file and inspect it before extraction.
Write a durable job and an explicit pending state using a transaction/outbox boundary.
Process the safe file under wall-time, page-count, memory and decompression limits.
Persist derived metadata with the original object hash and extraction version.
Build or confirm evidence links, then evaluate only checks whose prerequisites exist.
Write the immutable run result before publishing report availability.
Recheck authorization at report, preview and download time.
If deletion wins a race, a late worker result must not restore the deleted packet or its content.

### 7.2 Core entities and relationships

User owns or is granted access to a workspace; workspace scopes packets and roles.
Packet references an application selection, profile revision and active rule pack.
Document has immutable versions; versions reference objects, metadata and extraction artifacts.
Requirement belongs to a pack revision; condition facts belong to a profile revision.
EvidenceLink joins a requirement revision and document version with an anchored page or field.
EvaluationRun has immutable input references and many CheckResults.
Report references one run and its source coverage snapshot.
ConsentRecord, AccessGrant, AuditEvent and DeletionJob capture trust-sensitive lifecycle changes.
Billing entitlement belongs to the payer/account scope and never establishes document access by itself.
Tenant IDs must be enforced consistently across database, object access, queue work and caches.

## 8. Security, privacy and minor handling

Treat identity, education, category and disability evidence as sensitive by product design.
Store documents privately, encrypt transport and storage, and limit employee access to time-bounded approved support sessions.
Do not place real applicant documents, tokens, reports or production logs in this public repository.
Use minimal redacted structured logs and a reviewed analytics allowlist.
Separate user deletion, operational recovery and legally justified retention by data class and purpose.
Plan deletion across originals, derivatives, OCR, caches, reports and processors; disclose backup expiration honestly.
A proposed product target is removal from active document stores within 24 hours and expiration from rolling backups within 35 days, subject to approved exceptions.
Counsel must review whether any specific record classes need longer retention; never apply one blanket timer to all legal and security records.
Plan an adults-only private pilot, because an education product may otherwise process minors' documents.
Before admitting minors, approve age handling, guardian verification, consent evidence, withdrawals and restrictions on child data use.
Do not collect a full identity document merely to satisfy a weakly designed age gate.
Review Indian DPDP applicability, staged commencement, subsequent amendments and processor arrangements before public launch.
This plan proposes controls and review work; it does not certify compliance or equate every provision with current legal force.
Use the [official notified rules](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf) as a primary reference for that legal review.

## 9. Evaluation and launch assurance

Build a synthetic benchmark covering each supported condition branch, boundary value and known failure mode.
Separate development examples, tuning examples and a held-out release set at packet level, including document-template differences.
Record human ground truth, adjudication notes, test fixture provenance and any ambiguous expected outcome.
Measure check-level false pass, false fail, unknown, coverage and evidence-anchor accuracy separately.
A pass rate alone is not a correctness metric.
Target zero observed critical false passes on at least 300 independently selected critical negative cases before public launch.
With zero failures in 300 independent cases, the rough rule-of-three upper 95 percent bound is about 1 percent; this does not prove zero risk or generalize across untested strata.
Require full reviewed coverage of supported branches and an explicit unsupported-check inventory.
Include adversarial documents, misleading filenames, duplicate jobs, permission changes and deletion races.
Measure source-to-requirement omissions independently of check execution; a perfectly executed incomplete checklist can still mislead.
Require no unresolved high-severity authorization or document-exposure defects.
Perform manual keyboard and screen-reader review of upload, evidence inspection, correction and reporting.
Use an independent security review before opening public sensitive-document processing.

### 9.1 Proposed performance and recovery targets

For a representative packet capped at 20 pages and 10 files, target p95 end-to-end processing under two minutes in the declared pilot load profile.
Treat the target as a proposed budget, not a benchmark result or contractual SLA.
Target p95 ordinary metadata requests under 500 milliseconds after measuring the actual deployment.
Publish the workload, region, cold-start handling, page types and concurrency for every performance claim.
Propose 99.5 percent monthly service availability for the initial supported beta workflow.
Propose recovery point within 24 hours and recovery time within four hours for a declared metadata disaster scenario.
Verify recovery by restoring an isolated environment, including keys, metadata-object consistency and deletion tombstones.
Document maintenance, provider outages and partial document-processing availability separately.
Keep manual and retry paths available when extraction dependencies fail.

## 10. Execution roadmap and dependency gates

| Stage | Indicative duration | Outputs | Gate |
| --- | --- | --- | --- |
| Discovery | 3–4 weeks | Interviews, concierge reviews, scope and prototype | Evidence of a specific paid problem |
| Foundations | 2–3 weeks | Threat model, data contract, rule model, account and storage design | Reviews approve sensitive-data boundaries |
| Core MVP | 6–8 weeks | Intake, checks, evidence, corrections and reports | End-to-end supported packet works |
| Private pilot | 3–4 weeks | Adults-only consented pilot and cost measurement | Quality, comprehension and support gates hold |
| Public launch preparation | 2–3 weeks | Legal review, security review, operational runbooks and paid offer | All mandatory launch gates approved |
| Post-launch stabilization | 4–6 weeks | Reliability fixes and customer outcome review | Core economics and quality justify expansion |

These are planning ranges for a small staffed team, not guaranteed delivery dates; some approved activities may overlap.
A solo founder should expect a longer calendar and use paid specialist reviews rather than pretending to fill every expertise gap.
Do not convert the entire catalogue into one sprint backlog.
MVP ordering is source model, predicate semantics, safe intake, versioned evidence, deterministic evaluation, correction, reporting, deletion and release assurance.
Payment processing can follow demonstrated usability but must precede claims about actual paid conversion.
LLM assistance follows deterministic and human-curated baselines, with separate quality and cost gates.
Institution administration follows tenant isolation and applicant-controlled sharing.
Second application packs follow a repeatable curator publication process.
International expansion follows jurisdiction and processor review.

## 11. Staffing and capacity

The early staffed model is one founder/product owner, one full-stack engineer and one document/backend engineer.
Add part-time design/research support and a rules curator during discovery and pack authoring.
Use qualified legal counsel and an independent security reviewer before public handling of sensitive packets.
The founder may handle support and initial acquisition but should record the time cost explicitly.
One individual may hold multiple named roles; high-risk reviews still need qualified independent review.
Reserve roughly 20 percent of engineering capacity for defects, operational work and evaluation maintenance.
Assign one rules owner and a separate approver for official pack publication.
Track staffing assumptions and update the roadmap when actual available hours differ.

## 12. Budget and unit economics

All values below are illustrative planning assumptions in INR, not supplier quotes, market salary claims or validated pricing.
Request actual quotes and record taxes, geography, commitments and cancellation terms before procurement.
For a four-month staffed pilot, assume two engineers at ₹1.5 lakh per month each: ₹12 lakh total.
Assume part-time design and research at ₹50,000 per month: ₹2 lakh total.
Assume curation and support at ₹40,000 per month: ₹1.6 lakh total.
Reserve ₹1.5 lakh for legal and security review, ₹80,000 for cloud/tools, and ₹60,000 for pilot acquisition and incentives.
The direct subtotal is ₹18.5 lakh; add 20 percent contingency, ₹3.7 lakh, for a planning total of ₹22.2 lakh.
Founder living costs, incorporation, equipment, ongoing taxes and additional post-pilot runway are separate.
For a founder-built version, model actual cash purchases separately from the opportunity cost of unpaid engineering.
Do not describe unpaid founder labor as zero product cost.

### 12.1 Packet economics example

Test per-packet offers before assuming a subscription, because application preparation may be seasonal.
A hypothetical ₹199 packet price excluding indirect tax, a 3 percent payment allowance, ₹12 processing/storage cost and ₹15 expected support cost yields ₹166.03 contribution before acquisition and fixed overhead.
If expected refunds cost another ₹10 per sold packet, the contribution becomes ₹156.03.
At a hypothetical ₹100 acquisition cost, the first-packet contribution after acquisition becomes ₹56.03.
At ₹3 lakh monthly fixed operating cost, that example needs approximately 5,355 first-packet sales per month to cover fixed cost.
This sensitivity illustrates why repeat demand, lower acquisition cost and real support cost matter; it is not a sales forecast.
Record price net of actual tax, fees, refunds, processing retries, storage duration and support labor when measuring the pilot.
Track low, base and high cost scenarios by page count, OCR share and repeat processing.
Introduce caps transparently and never bill failed duplicate jobs as new successful reviews.
Do not make human review part of an inexpensive unlimited package unless staffing economics support it.

## 13. Launch, support and growth

Offer a tightly scoped private pilot to the validated applicant cohort before paid acquisition at scale.
The landing page must explain supported applications, limitations, data handling and what the user receives.
Use synthetic demonstrations and permissioned testimonials without revealing documents or identity details.
Prioritize application-specific educational content, counselor referrals and communities where recruitment permission exists.
Do not promise admission outcomes, official affiliation or complete authenticity verification.
Make pricing, supported volume, processing limits, refund policy and unavailable features visible before payment.
Support tickets should carry packet IDs and redacted issue context rather than document attachments by default.
Customer document access needs consented, time-bounded support authorization and audit evidence.
Define incidents for incorrect passes, source changes, document exposure, payment failure and processing outage.
When a rule error affects reports, identify impacted runs, invalidate stale conclusions and notify affected users with corrective next steps.
Expand only after 50 genuinely paid pilot users, repeatable supported quality and measured acquisition economics justify the investment.
The exact thresholds should be revised with cohort evidence; they are internal planning gates.

## 14. Principal startup risks

| Risk | Early indicator | Proposed response |
| --- | --- | --- |
| Conditional rules misinterpreted | Reviewer disagreement or missing branches | Keep interpretation human-reviewed and propagate unknown |
| Source changes | Pack source hash or publication differs | Review the diff and invalidate affected checks |
| Applicant overtrust | Users equate report with admission | Redesign wording and test comprehension |
| Sensitive data exposure | Authorization or preview defects | Stop affected access and execute incident response |
| Weak willingness to pay | Concierge value without paid commitments | Revise segment or offer before scaling |
| High support burden | Support cost dominates packet contribution | Improve clarity and narrow supported scope |
| Seasonal revenue | Demand concentrated near deadlines | Plan cash runway and validate adjacent cycles |
| Minor data risk | Underage users entering pilot | Enforce approved pilot boundary until guardian controls exist |
| Automation cost growth | OCR and rerun costs rise per packet | Bound processing and measure marginal cost |
| Brand collision | Similar marks in relevant markets | Complete clearance and revise before major brand spending |
| Founder dependency | Reviews or incidents stall on one person | Document runbooks and staff independent review |

## 15. How to turn this plan into later implementation work

Use a deliverable ID as the parent issue and link its reviewable artifact and acceptance situations.
Break the issue into engineering or business tasks only after the predecessor and phase gate are satisfied.
Estimate work with the intended implementation team; the line count is not an effort estimate.
Keep acceptance criteria tied to observable behavior or actual business evidence.
Add concrete fixtures and a measurement cohort before claiming completion.
Review high-risk changes against the master decisions and update the plan when scope changes.
Maintain a short active milestone list while retaining this catalogue for traceability.
The next authorized activity after this documentation would be discovery and review, with implementation starting only when the user requests it.

## 16. Research and logo

The [source register](docs/SOURCES.md) separates verified historical observations from proposed design choices.
The [logo brief](docs/brand/LOGO_BRIEF.md) records the original concept, generation prompt and future production work.
The concept uses a folder, layered evidence rails and a teal review tick with an intentional open gap.
Its exact wordmark is JKY-Folder.
Trademark clearance and a production vector redraw remain proposed startup work.
