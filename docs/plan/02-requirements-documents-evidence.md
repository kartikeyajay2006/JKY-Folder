# Volume 02 — Requirements, documents and evidence

JKY-Folder startup implementation plan • 9 October 2026 • proposed work only

Accountable role: Rules lead / document engineer.
Default phase: MVP.
Volume exit gate: A complete trace from every supported requirement to its condition, evidence and unresolved checks..

## How to use this volume

Every workstream contains six concrete deliverables and four acceptance situations for each deliverable.
The cases are specifications for later implementation or business validation; they are not executed results.
Use the stable IDs in issues, design reviews, release evidence and subsequent plan revisions.
Business validation uses research and operating records; engineering validation uses controlled fixtures and system evidence.
An owner may fulfill several roles early; accountability still requires a named person and an explicit decision record.
The task catalogue is a scope inventory, not a promise to build every workstream in the first release.
The master plan determines phase eligibility; a task inherits its workstream phase unless marked otherwise.
Capacity estimates must include discovery, review, security, failure recovery and support work.

## JF-02-01 — Official source intake

### Purpose and implementation decision

Outcome: Preserve authoritative instructions with provenance.
Boundary: Reviewed public sources only.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: M02 and official source register.
Primary risk: Untrusted instructions becoming official policy.
Workstream success measure: Every published requirement resolves to a reviewed source revision.

### Delivery sequence

1. Confirm the inputs and constraints for official source intake.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review every published requirement resolves to a reviewed source revision against the stated measurement cohort.
4. Resolve untrusted instructions becoming official policy before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-01-D1 — Register official source ownership

#### Proposed delivery contract

Implementation instruction: Register official source ownership.
Reviewable artifact: Source registry.
Acceptance criterion: Institution, cycle and stage are explicit.
Input dependency: M02 and official source register.
Scope constraint: Reviewed public sources only.
Risk to control: Untrusted instructions becoming official policy.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every published requirement resolves to a reviewed source revision.
Completion record: JF-02-01-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-01-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “source registry” against “institution, cycle and stage are explicit”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-01-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “source registry” against “institution, cycle and stage are explicit”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-01-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “source registry” against “institution, cycle and stage are explicit”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-01-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “source registry” against “institution, cycle and stage are explicit”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver source registry to the next dependent owner with JF-02-01-D1 and its acceptance evidence.
Before exposure, resolve untrusted instructions becoming official policy for the approved scope; communicate remaining limitations.

### JF-02-01-D2 — Capture source snapshots

#### Proposed delivery contract

Implementation instruction: Capture source snapshots.
Reviewable artifact: Versioned source records.
Acceptance criterion: Retrieved content has time and integrity hash.
Input dependency: M02 and official source register.
Scope constraint: Reviewed public sources only.
Risk to control: Untrusted instructions becoming official policy.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every published requirement resolves to a reviewed source revision.
Completion record: JF-02-01-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-01-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “versioned source records” against “retrieved content has time and integrity hash”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-01-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “versioned source records” against “retrieved content has time and integrity hash”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-01-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “versioned source records” against “retrieved content has time and integrity hash”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-01-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “versioned source records” against “retrieved content has time and integrity hash”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver versioned source records to the next dependent owner with JF-02-01-D2 and its acceptance evidence.
Before exposure, resolve untrusted instructions becoming official policy for the approved scope; communicate remaining limitations.

### JF-02-01-D3 — Extract source structure

#### Proposed delivery contract

Implementation instruction: Extract source structure.
Reviewable artifact: Source outline.
Acceptance criterion: Headings, tables and appendices preserve ordering.
Input dependency: M02 and official source register.
Scope constraint: Reviewed public sources only.
Risk to control: Untrusted instructions becoming official policy.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every published requirement resolves to a reviewed source revision.
Completion record: JF-02-01-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-01-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “source outline” against “headings, tables and appendices preserve ordering”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-01-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “source outline” against “headings, tables and appendices preserve ordering”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-01-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “source outline” against “headings, tables and appendices preserve ordering”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-01-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “source outline” against “headings, tables and appendices preserve ordering”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver source outline to the next dependent owner with JF-02-01-D3 and its acceptance evidence.
Before exposure, resolve untrusted instructions becoming official policy for the approved scope; communicate remaining limitations.

### JF-02-01-D4 — Record source authority

#### Proposed delivery contract

Implementation instruction: Record source authority.
Reviewable artifact: Authority classification.
Acceptance criterion: Official and user-supplied content are distinguishable.
Input dependency: M02 and official source register.
Scope constraint: Reviewed public sources only.
Risk to control: Untrusted instructions becoming official policy.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every published requirement resolves to a reviewed source revision.
Completion record: JF-02-01-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-01-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “authority classification” against “official and user-supplied content are distinguishable”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-01-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “authority classification” against “official and user-supplied content are distinguishable”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-01-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “authority classification” against “official and user-supplied content are distinguishable”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-01-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “authority classification” against “official and user-supplied content are distinguishable”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver authority classification to the next dependent owner with JF-02-01-D4 and its acceptance evidence.
Before exposure, resolve untrusted instructions becoming official policy for the approved scope; communicate remaining limitations.

### JF-02-01-D5 — Handle inaccessible sources

#### Proposed delivery contract

Implementation instruction: Handle inaccessible sources.
Reviewable artifact: Source exception workflow.
Acceptance criterion: Unavailable instructions remain visibly unsupported.
Input dependency: M02 and official source register.
Scope constraint: Reviewed public sources only.
Risk to control: Untrusted instructions becoming official policy.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every published requirement resolves to a reviewed source revision.
Completion record: JF-02-01-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-01-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “source exception workflow” against “unavailable instructions remain visibly unsupported”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-01-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “source exception workflow” against “unavailable instructions remain visibly unsupported”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-01-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “source exception workflow” against “unavailable instructions remain visibly unsupported”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-01-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “source exception workflow” against “unavailable instructions remain visibly unsupported”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver source exception workflow to the next dependent owner with JF-02-01-D5 and its acceptance evidence.
Before exposure, resolve untrusted instructions becoming official policy for the approved scope; communicate remaining limitations.

### JF-02-01-D6 — Review source licensing

#### Proposed delivery contract

Implementation instruction: Review source licensing.
Reviewable artifact: Source-use decision.
Acceptance criterion: Storage and displayed excerpts have approved scope.
Input dependency: M02 and official source register.
Scope constraint: Reviewed public sources only.
Risk to control: Untrusted instructions becoming official policy.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every published requirement resolves to a reviewed source revision.
Completion record: JF-02-01-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-01-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “source-use decision” against “storage and displayed excerpts have approved scope”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-01-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “source-use decision” against “storage and displayed excerpts have approved scope”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-01-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “source-use decision” against “storage and displayed excerpts have approved scope”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-01-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “source-use decision” against “storage and displayed excerpts have approved scope”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-01-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver source-use decision to the next dependent owner with JF-02-01-D6 and its acceptance evidence.
Before exposure, resolve untrusted instructions becoming official policy for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-01 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: M02 and official source register.
Confirm measured evidence for: Every published requirement resolves to a reviewed source revision.
Confirm the intended scope remains: Reviewed public sources only.
Confirm the owner has addressed: Untrusted instructions becoming official policy.
Link relevant master-plan decisions before moving JF-02-01 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-02 — Application-pack model

### Purpose and implementation decision

Outcome: Represent one application cycle without ambiguity.
Boundary: No cross-cycle rule inheritance without review.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Official source intake.
Primary risk: Applying last year's rules to current applicants.
Workstream success measure: Every pack has an explicit family, year, stage and publication state.

### Delivery sequence

1. Confirm the inputs and constraints for application-pack model.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review every pack has an explicit family, year, stage and publication state against the stated measurement cohort.
4. Resolve applying last year's rules to current applicants before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-02-D1 — Define pack identity

#### Proposed delivery contract

Implementation instruction: Define pack identity.
Reviewable artifact: Pack identity contract.
Acceptance criterion: Family, cycle and stage form a stable key.
Input dependency: Official source intake.
Scope constraint: No cross-cycle rule inheritance without review.
Risk to control: Applying last year's rules to current applicants.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every pack has an explicit family, year, stage and publication state.
Completion record: JF-02-02-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-02-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “pack identity contract” against “family, cycle and stage form a stable key”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-02-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “pack identity contract” against “family, cycle and stage form a stable key”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-02-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “pack identity contract” against “family, cycle and stage form a stable key”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-02-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “pack identity contract” against “family, cycle and stage form a stable key”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver pack identity contract to the next dependent owner with JF-02-02-D1 and its acceptance evidence.
Before exposure, resolve applying last year's rules to current applicants for the approved scope; communicate remaining limitations.

### JF-02-02-D2 — Define pack lifecycle

#### Proposed delivery contract

Implementation instruction: Define pack lifecycle.
Reviewable artifact: Publication state model.
Acceptance criterion: Draft, reviewed, published and retired are distinct.
Input dependency: Official source intake.
Scope constraint: No cross-cycle rule inheritance without review.
Risk to control: Applying last year's rules to current applicants.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every pack has an explicit family, year, stage and publication state.
Completion record: JF-02-02-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-02-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “publication state model” against “draft, reviewed, published and retired are distinct”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-02-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “publication state model” against “draft, reviewed, published and retired are distinct”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-02-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “publication state model” against “draft, reviewed, published and retired are distinct”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-02-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “publication state model” against “draft, reviewed, published and retired are distinct”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver publication state model to the next dependent owner with JF-02-02-D2 and its acceptance evidence.
Before exposure, resolve applying last year's rules to current applicants for the approved scope; communicate remaining limitations.

### JF-02-02-D3 — Define source associations

#### Proposed delivery contract

Implementation instruction: Define source associations.
Reviewable artifact: Pack-source map.
Acceptance criterion: All source revisions are enumerable.
Input dependency: Official source intake.
Scope constraint: No cross-cycle rule inheritance without review.
Risk to control: Applying last year's rules to current applicants.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every pack has an explicit family, year, stage and publication state.
Completion record: JF-02-02-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-02-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “pack-source map” against “all source revisions are enumerable”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-02-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “pack-source map” against “all source revisions are enumerable”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-02-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “pack-source map” against “all source revisions are enumerable”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-02-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “pack-source map” against “all source revisions are enumerable”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver pack-source map to the next dependent owner with JF-02-02-D3 and its acceptance evidence.
Before exposure, resolve applying last year's rules to current applicants for the approved scope; communicate remaining limitations.

### JF-02-02-D4 — Define supported checks

#### Proposed delivery contract

Implementation instruction: Define supported checks.
Reviewable artifact: Coverage manifest.
Acceptance criterion: Unsupported judgments are listed explicitly.
Input dependency: Official source intake.
Scope constraint: No cross-cycle rule inheritance without review.
Risk to control: Applying last year's rules to current applicants.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every pack has an explicit family, year, stage and publication state.
Completion record: JF-02-02-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-02-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “coverage manifest” against “unsupported judgments are listed explicitly”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-02-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “coverage manifest” against “unsupported judgments are listed explicitly”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-02-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “coverage manifest” against “unsupported judgments are listed explicitly”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-02-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “coverage manifest” against “unsupported judgments are listed explicitly”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver coverage manifest to the next dependent owner with JF-02-02-D4 and its acceptance evidence.
Before exposure, resolve applying last year's rules to current applicants for the approved scope; communicate remaining limitations.

### JF-02-02-D5 — Define pack compatibility

#### Proposed delivery contract

Implementation instruction: Define pack compatibility.
Reviewable artifact: Compatibility rules.
Acceptance criterion: Packets cannot switch packs silently.
Input dependency: Official source intake.
Scope constraint: No cross-cycle rule inheritance without review.
Risk to control: Applying last year's rules to current applicants.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every pack has an explicit family, year, stage and publication state.
Completion record: JF-02-02-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-02-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “compatibility rules” against “packets cannot switch packs silently”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-02-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “compatibility rules” against “packets cannot switch packs silently”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-02-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “compatibility rules” against “packets cannot switch packs silently”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-02-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “compatibility rules” against “packets cannot switch packs silently”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver compatibility rules to the next dependent owner with JF-02-02-D5 and its acceptance evidence.
Before exposure, resolve applying last year's rules to current applicants for the approved scope; communicate remaining limitations.

### JF-02-02-D6 — Define pack retirement

#### Proposed delivery contract

Implementation instruction: Define pack retirement.
Reviewable artifact: Retirement procedure.
Acceptance criterion: Historical reports retain their original context.
Input dependency: Official source intake.
Scope constraint: No cross-cycle rule inheritance without review.
Risk to control: Applying last year's rules to current applicants.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every pack has an explicit family, year, stage and publication state.
Completion record: JF-02-02-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-02-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “retirement procedure” against “historical reports retain their original context”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-02-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “retirement procedure” against “historical reports retain their original context”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-02-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “retirement procedure” against “historical reports retain their original context”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-02-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “retirement procedure” against “historical reports retain their original context”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-02-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver retirement procedure to the next dependent owner with JF-02-02-D6 and its acceptance evidence.
Before exposure, resolve applying last year's rules to current applicants for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-02 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Official source intake.
Confirm measured evidence for: Every pack has an explicit family, year, stage and publication state.
Confirm the intended scope remains: No cross-cycle rule inheritance without review.
Confirm the owner has addressed: Applying last year's rules to current applicants.
Link relevant master-plan decisions before moving JF-02-02 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-03 — Requirement authoring

### Purpose and implementation decision

Outcome: Create reviewable atomic requirements.
Boundary: Human-curated publication for MVP.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Pack model and M02.
Primary risk: Compound instructions losing an obligation.
Workstream success measure: All supported source obligations map to reviewed requirement IDs.

### Delivery sequence

1. Confirm the inputs and constraints for requirement authoring.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review all supported source obligations map to reviewed requirement ids against the stated measurement cohort.
4. Resolve compound instructions losing an obligation before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-03-D1 — Split compound obligations

#### Proposed delivery contract

Implementation instruction: Split compound obligations.
Reviewable artifact: Atomic requirement inventory.
Acceptance criterion: Each independently checkable obligation has an ID.
Input dependency: Pack model and M02.
Scope constraint: Human-curated publication for MVP.
Risk to control: Compound instructions losing an obligation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported source obligations map to reviewed requirement IDs.
Completion record: JF-02-03-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-03-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “atomic requirement inventory” against “each independently checkable obligation has an id”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-03-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “atomic requirement inventory” against “each independently checkable obligation has an id”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-03-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “atomic requirement inventory” against “each independently checkable obligation has an id”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-03-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “atomic requirement inventory” against “each independently checkable obligation has an id”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver atomic requirement inventory to the next dependent owner with JF-02-03-D1 and its acceptance evidence.
Before exposure, resolve compound instructions losing an obligation for the approved scope; communicate remaining limitations.

### JF-02-03-D2 — Preserve source wording

#### Proposed delivery contract

Implementation instruction: Preserve source wording.
Reviewable artifact: Requirement-source anchors.
Acceptance criterion: Paraphrases retain a traceable official location.
Input dependency: Pack model and M02.
Scope constraint: Human-curated publication for MVP.
Risk to control: Compound instructions losing an obligation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported source obligations map to reviewed requirement IDs.
Completion record: JF-02-03-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-03-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “requirement-source anchors” against “paraphrases retain a traceable official location”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-03-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “requirement-source anchors” against “paraphrases retain a traceable official location”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-03-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “requirement-source anchors” against “paraphrases retain a traceable official location”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-03-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “requirement-source anchors” against “paraphrases retain a traceable official location”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver requirement-source anchors to the next dependent owner with JF-02-03-D2 and its acceptance evidence.
Before exposure, resolve compound instructions losing an obligation for the approved scope; communicate remaining limitations.

### JF-02-03-D3 — Define accepted evidence

#### Proposed delivery contract

Implementation instruction: Define accepted evidence.
Reviewable artifact: Evidence expectations.
Acceptance criterion: Alternatives and document combinations are explicit.
Input dependency: Pack model and M02.
Scope constraint: Human-curated publication for MVP.
Risk to control: Compound instructions losing an obligation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported source obligations map to reviewed requirement IDs.
Completion record: JF-02-03-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-03-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “evidence expectations” against “alternatives and document combinations are explicit”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-03-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “evidence expectations” against “alternatives and document combinations are explicit”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-03-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “evidence expectations” against “alternatives and document combinations are explicit”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-03-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “evidence expectations” against “alternatives and document combinations are explicit”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver evidence expectations to the next dependent owner with JF-02-03-D3 and its acceptance evidence.
Before exposure, resolve compound instructions losing an obligation for the approved scope; communicate remaining limitations.

### JF-02-03-D4 — Define severity policy

#### Proposed delivery contract

Implementation instruction: Define severity policy.
Reviewable artifact: Severity catalogue.
Acceptance criterion: Blocking, advisory and unsupported judgments differ.
Input dependency: Pack model and M02.
Scope constraint: Human-curated publication for MVP.
Risk to control: Compound instructions losing an obligation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported source obligations map to reviewed requirement IDs.
Completion record: JF-02-03-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-03-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “severity catalogue” against “blocking, advisory and unsupported judgments differ”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-03-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “severity catalogue” against “blocking, advisory and unsupported judgments differ”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-03-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “severity catalogue” against “blocking, advisory and unsupported judgments differ”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-03-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “severity catalogue” against “blocking, advisory and unsupported judgments differ”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver severity catalogue to the next dependent owner with JF-02-03-D4 and its acceptance evidence.
Before exposure, resolve compound instructions losing an obligation for the approved scope; communicate remaining limitations.

### JF-02-03-D5 — Define interpretation limits

#### Proposed delivery contract

Implementation instruction: Define interpretation limits.
Reviewable artifact: Limitations register.
Acceptance criterion: Ambiguous instructions remain unresolved.
Input dependency: Pack model and M02.
Scope constraint: Human-curated publication for MVP.
Risk to control: Compound instructions losing an obligation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported source obligations map to reviewed requirement IDs.
Completion record: JF-02-03-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-03-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “limitations register” against “ambiguous instructions remain unresolved”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-03-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “limitations register” against “ambiguous instructions remain unresolved”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-03-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “limitations register” against “ambiguous instructions remain unresolved”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-03-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “limitations register” against “ambiguous instructions remain unresolved”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver limitations register to the next dependent owner with JF-02-03-D5 and its acceptance evidence.
Before exposure, resolve compound instructions losing an obligation for the approved scope; communicate remaining limitations.

### JF-02-03-D6 — Adjudicate author disagreements

#### Proposed delivery contract

Implementation instruction: Adjudicate author disagreements.
Reviewable artifact: Review decision record.
Acceptance criterion: Disputes have rationale and independent approval.
Input dependency: Pack model and M02.
Scope constraint: Human-curated publication for MVP.
Risk to control: Compound instructions losing an obligation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported source obligations map to reviewed requirement IDs.
Completion record: JF-02-03-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-03-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “review decision record” against “disputes have rationale and independent approval”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-03-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “review decision record” against “disputes have rationale and independent approval”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-03-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “review decision record” against “disputes have rationale and independent approval”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-03-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “review decision record” against “disputes have rationale and independent approval”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-03-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver review decision record to the next dependent owner with JF-02-03-D6 and its acceptance evidence.
Before exposure, resolve compound instructions losing an obligation for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-03 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Pack model and M02.
Confirm measured evidence for: All supported source obligations map to reviewed requirement IDs.
Confirm the intended scope remains: Human-curated publication for MVP.
Confirm the owner has addressed: Compound instructions losing an obligation.
Link relevant master-plan decisions before moving JF-02-03 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-04 — Conditional predicates

### Purpose and implementation decision

Outcome: Evaluate applicability without guessing profile facts.
Boundary: Approved operators and three-valued logic.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Atomic requirements and confirmed profile revisions.
Primary risk: Unknown conditions incorrectly excluded.
Workstream success measure: Every conditional branch has positive, negative and unknown fixtures.

### Delivery sequence

1. Confirm the inputs and constraints for conditional predicates.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review every conditional branch has positive, negative and unknown fixtures against the stated measurement cohort.
4. Resolve unknown conditions incorrectly excluded before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-04-D1 — Define predicate operators

#### Proposed delivery contract

Implementation instruction: Define predicate operators.
Reviewable artifact: Predicate language specification.
Acceptance criterion: Equality, membership and conjunction have precise semantics.
Input dependency: Atomic requirements and confirmed profile revisions.
Scope constraint: Approved operators and three-valued logic.
Risk to control: Unknown conditions incorrectly excluded.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every conditional branch has positive, negative and unknown fixtures.
Completion record: JF-02-04-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-04-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “predicate language specification” against “equality, membership and conjunction have precise semantics”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-04-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “predicate language specification” against “equality, membership and conjunction have precise semantics”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-04-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “predicate language specification” against “equality, membership and conjunction have precise semantics”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-04-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “predicate language specification” against “equality, membership and conjunction have precise semantics”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver predicate language specification to the next dependent owner with JF-02-04-D1 and its acceptance evidence.
Before exposure, resolve unknown conditions incorrectly excluded for the approved scope; communicate remaining limitations.

### JF-02-04-D2 — Define unknown propagation

#### Proposed delivery contract

Implementation instruction: Define unknown propagation.
Reviewable artifact: Truth-table specification.
Acceptance criterion: Unknown does not default to false.
Input dependency: Atomic requirements and confirmed profile revisions.
Scope constraint: Approved operators and three-valued logic.
Risk to control: Unknown conditions incorrectly excluded.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every conditional branch has positive, negative and unknown fixtures.
Completion record: JF-02-04-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-04-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “truth-table specification” against “unknown does not default to false”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-04-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “truth-table specification” against “unknown does not default to false”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-04-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “truth-table specification” against “unknown does not default to false”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-04-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “truth-table specification” against “unknown does not default to false”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver truth-table specification to the next dependent owner with JF-02-04-D2 and its acceptance evidence.
Before exposure, resolve unknown conditions incorrectly excluded for the approved scope; communicate remaining limitations.

### JF-02-04-D3 — Define fact provenance

#### Proposed delivery contract

Implementation instruction: Define fact provenance.
Reviewable artifact: Profile fact contract.
Acceptance criterion: Self-report and extracted evidence remain distinguishable.
Input dependency: Atomic requirements and confirmed profile revisions.
Scope constraint: Approved operators and three-valued logic.
Risk to control: Unknown conditions incorrectly excluded.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every conditional branch has positive, negative and unknown fixtures.
Completion record: JF-02-04-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-04-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “profile fact contract” against “self-report and extracted evidence remain distinguishable”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-04-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “profile fact contract” against “self-report and extracted evidence remain distinguishable”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-04-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “profile fact contract” against “self-report and extracted evidence remain distinguishable”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-04-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “profile fact contract” against “self-report and extracted evidence remain distinguishable”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver profile fact contract to the next dependent owner with JF-02-04-D3 and its acceptance evidence.
Before exposure, resolve unknown conditions incorrectly excluded for the approved scope; communicate remaining limitations.

### JF-02-04-D4 — Define condition explanations

#### Proposed delivery contract

Implementation instruction: Define condition explanations.
Reviewable artifact: Explanation template.
Acceptance criterion: Users can inspect why applicability changed.
Input dependency: Atomic requirements and confirmed profile revisions.
Scope constraint: Approved operators and three-valued logic.
Risk to control: Unknown conditions incorrectly excluded.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every conditional branch has positive, negative and unknown fixtures.
Completion record: JF-02-04-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-04-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “explanation template” against “users can inspect why applicability changed”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-04-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “explanation template” against “users can inspect why applicability changed”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-04-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “explanation template” against “users can inspect why applicability changed”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-04-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “explanation template” against “users can inspect why applicability changed”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver explanation template to the next dependent owner with JF-02-04-D4 and its acceptance evidence.
Before exposure, resolve unknown conditions incorrectly excluded for the approved scope; communicate remaining limitations.

### JF-02-04-D5 — Detect predicate cycles

#### Proposed delivery contract

Implementation instruction: Detect predicate cycles.
Reviewable artifact: Dependency validation rules.
Acceptance criterion: Circular or undefined facts prevent pack publication.
Input dependency: Atomic requirements and confirmed profile revisions.
Scope constraint: Approved operators and three-valued logic.
Risk to control: Unknown conditions incorrectly excluded.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every conditional branch has positive, negative and unknown fixtures.
Completion record: JF-02-04-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-04-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “dependency validation rules” against “circular or undefined facts prevent pack publication”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-04-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “dependency validation rules” against “circular or undefined facts prevent pack publication”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-04-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “dependency validation rules” against “circular or undefined facts prevent pack publication”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-04-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “dependency validation rules” against “circular or undefined facts prevent pack publication”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver dependency validation rules to the next dependent owner with JF-02-04-D5 and its acceptance evidence.
Before exposure, resolve unknown conditions incorrectly excluded for the approved scope; communicate remaining limitations.

### JF-02-04-D6 — Test condition branches

#### Proposed delivery contract

Implementation instruction: Test condition branches.
Reviewable artifact: Branch fixture catalogue.
Acceptance criterion: Every supported branch has an adjudicated outcome.
Input dependency: Atomic requirements and confirmed profile revisions.
Scope constraint: Approved operators and three-valued logic.
Risk to control: Unknown conditions incorrectly excluded.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every conditional branch has positive, negative and unknown fixtures.
Completion record: JF-02-04-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-04-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “branch fixture catalogue” against “every supported branch has an adjudicated outcome”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-04-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “branch fixture catalogue” against “every supported branch has an adjudicated outcome”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-04-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “branch fixture catalogue” against “every supported branch has an adjudicated outcome”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-04-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “branch fixture catalogue” against “every supported branch has an adjudicated outcome”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-04-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver branch fixture catalogue to the next dependent owner with JF-02-04-D6 and its acceptance evidence.
Before exposure, resolve unknown conditions incorrectly excluded for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-04 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Atomic requirements and confirmed profile revisions.
Confirm measured evidence for: Every conditional branch has positive, negative and unknown fixtures.
Confirm the intended scope remains: Approved operators and three-valued logic.
Confirm the owner has addressed: Unknown conditions incorrectly excluded.
Link relevant master-plan decisions before moving JF-02-04 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-05 — Technical file checks

### Purpose and implementation decision

Outcome: Verify measurable upload constraints deterministically.
Boundary: Limits come from the selected official pack.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Approved technical requirement fields.
Primary risk: Extension checks mistaken for content validation.
Workstream success measure: All supported boundary values produce deterministic results.

### Delivery sequence

1. Confirm the inputs and constraints for technical file checks.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review all supported boundary values produce deterministic results against the stated measurement cohort.
4. Resolve extension checks mistaken for content validation before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-05-D1 — Verify actual file type

#### Proposed delivery contract

Implementation instruction: Verify actual file type.
Reviewable artifact: Type inspection contract.
Acceptance criterion: Extension, signature and parser results are compared.
Input dependency: Approved technical requirement fields.
Scope constraint: Limits come from the selected official pack.
Risk to control: Extension checks mistaken for content validation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported boundary values produce deterministic results.
Completion record: JF-02-05-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-05-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “type inspection contract” against “extension, signature and parser results are compared”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-05-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “type inspection contract” against “extension, signature and parser results are compared”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-05-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “type inspection contract” against “extension, signature and parser results are compared”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-05-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “type inspection contract” against “extension, signature and parser results are compared”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver type inspection contract to the next dependent owner with JF-02-05-D1 and its acceptance evidence.
Before exposure, resolve extension checks mistaken for content validation for the approved scope; communicate remaining limitations.

### JF-02-05-D2 — Verify byte-size bounds

#### Proposed delivery contract

Implementation instruction: Verify byte-size bounds.
Reviewable artifact: Size-check specification.
Acceptance criterion: Units and inclusive limits are unambiguous.
Input dependency: Approved technical requirement fields.
Scope constraint: Limits come from the selected official pack.
Risk to control: Extension checks mistaken for content validation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported boundary values produce deterministic results.
Completion record: JF-02-05-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-05-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “size-check specification” against “units and inclusive limits are unambiguous”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-05-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “size-check specification” against “units and inclusive limits are unambiguous”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-05-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “size-check specification” against “units and inclusive limits are unambiguous”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-05-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “size-check specification” against “units and inclusive limits are unambiguous”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver size-check specification to the next dependent owner with JF-02-05-D2 and its acceptance evidence.
Before exposure, resolve extension checks mistaken for content validation for the approved scope; communicate remaining limitations.

### JF-02-05-D3 — Verify image dimensions

#### Proposed delivery contract

Implementation instruction: Verify image dimensions.
Reviewable artifact: Dimension-check specification.
Acceptance criterion: Width, height and orientation semantics are defined.
Input dependency: Approved technical requirement fields.
Scope constraint: Limits come from the selected official pack.
Risk to control: Extension checks mistaken for content validation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported boundary values produce deterministic results.
Completion record: JF-02-05-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-05-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “dimension-check specification” against “width, height and orientation semantics are defined”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-05-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “dimension-check specification” against “width, height and orientation semantics are defined”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-05-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “dimension-check specification” against “width, height and orientation semantics are defined”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-05-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “dimension-check specification” against “width, height and orientation semantics are defined”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver dimension-check specification to the next dependent owner with JF-02-05-D3 and its acceptance evidence.
Before exposure, resolve extension checks mistaken for content validation for the approved scope; communicate remaining limitations.

### JF-02-05-D4 — Verify document page counts

#### Proposed delivery contract

Implementation instruction: Verify document page counts.
Reviewable artifact: Page-count contract.
Acceptance criterion: Encrypted and malformed files have explicit states.
Input dependency: Approved technical requirement fields.
Scope constraint: Limits come from the selected official pack.
Risk to control: Extension checks mistaken for content validation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported boundary values produce deterministic results.
Completion record: JF-02-05-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-05-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “page-count contract” against “encrypted and malformed files have explicit states”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-05-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “page-count contract” against “encrypted and malformed files have explicit states”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-05-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “page-count contract” against “encrypted and malformed files have explicit states”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-05-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “page-count contract” against “encrypted and malformed files have explicit states”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver page-count contract to the next dependent owner with JF-02-05-D4 and its acceptance evidence.
Before exposure, resolve extension checks mistaken for content validation for the approved scope; communicate remaining limitations.

### JF-02-05-D5 — Verify required file grouping

#### Proposed delivery contract

Implementation instruction: Verify required file grouping.
Reviewable artifact: Upload grouping rules.
Acceptance criterion: Single-file and multi-file expectations differ.
Input dependency: Approved technical requirement fields.
Scope constraint: Limits come from the selected official pack.
Risk to control: Extension checks mistaken for content validation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported boundary values produce deterministic results.
Completion record: JF-02-05-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-05-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “upload grouping rules” against “single-file and multi-file expectations differ”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-05-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “upload grouping rules” against “single-file and multi-file expectations differ”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-05-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “upload grouping rules” against “single-file and multi-file expectations differ”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-05-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “upload grouping rules” against “single-file and multi-file expectations differ”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver upload grouping rules to the next dependent owner with JF-02-05-D5 and its acceptance evidence.
Before exposure, resolve extension checks mistaken for content validation for the approved scope; communicate remaining limitations.

### JF-02-05-D6 — Create boundary fixtures

#### Proposed delivery contract

Implementation instruction: Create boundary fixtures.
Reviewable artifact: Technical fixture set.
Acceptance criterion: Below, equal and above limits are covered.
Input dependency: Approved technical requirement fields.
Scope constraint: Limits come from the selected official pack.
Risk to control: Extension checks mistaken for content validation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported boundary values produce deterministic results.
Completion record: JF-02-05-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-05-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “technical fixture set” against “below, equal and above limits are covered”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-05-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “technical fixture set” against “below, equal and above limits are covered”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-05-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “technical fixture set” against “below, equal and above limits are covered”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-05-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “technical fixture set” against “below, equal and above limits are covered”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-05-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver technical fixture set to the next dependent owner with JF-02-05-D6 and its acceptance evidence.
Before exposure, resolve extension checks mistaken for content validation for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-05 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Approved technical requirement fields.
Confirm measured evidence for: All supported boundary values produce deterministic results.
Confirm the intended scope remains: Limits come from the selected official pack.
Confirm the owner has addressed: Extension checks mistaken for content validation.
Link relevant master-plan decisions before moving JF-02-05 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-06 — Safe document intake

### Purpose and implementation decision

Outcome: Accept originals without exposing unsafe content.
Boundary: PDF and approved images first, archives excluded.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Security design and technical checks.
Primary risk: Unsafe previews before quarantine completes.
Workstream success measure: No unreviewed object enters public preview or extraction.

### Delivery sequence

1. Confirm the inputs and constraints for safe document intake.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review no unreviewed object enters public preview or extraction against the stated measurement cohort.
4. Resolve unsafe previews before quarantine completes before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-06-D1 — Define intake allowlist

#### Proposed delivery contract

Implementation instruction: Define intake allowlist.
Reviewable artifact: Supported format list.
Acceptance criterion: Formats are selected by product need and safe processing.
Input dependency: Security design and technical checks.
Scope constraint: PDF and approved images first, archives excluded.
Risk to control: Unsafe previews before quarantine completes.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed object enters public preview or extraction.
Completion record: JF-02-06-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-06-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “supported format list” against “formats are selected by product need and safe processing”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-06-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “supported format list” against “formats are selected by product need and safe processing”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-06-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “supported format list” against “formats are selected by product need and safe processing”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-06-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “supported format list” against “formats are selected by product need and safe processing”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver supported format list to the next dependent owner with JF-02-06-D1 and its acceptance evidence.
Before exposure, resolve unsafe previews before quarantine completes for the approved scope; communicate remaining limitations.

### JF-02-06-D2 — Define upload sessions

#### Proposed delivery contract

Implementation instruction: Define upload sessions.
Reviewable artifact: Session state contract.
Acceptance criterion: Tenant, packet and size scope are enforced.
Input dependency: Security design and technical checks.
Scope constraint: PDF and approved images first, archives excluded.
Risk to control: Unsafe previews before quarantine completes.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed object enters public preview or extraction.
Completion record: JF-02-06-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-06-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “session state contract” against “tenant, packet and size scope are enforced”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-06-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “session state contract” against “tenant, packet and size scope are enforced”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-06-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “session state contract” against “tenant, packet and size scope are enforced”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-06-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “session state contract” against “tenant, packet and size scope are enforced”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver session state contract to the next dependent owner with JF-02-06-D2 and its acceptance evidence.
Before exposure, resolve unsafe previews before quarantine completes for the approved scope; communicate remaining limitations.

### JF-02-06-D3 — Preserve originals

#### Proposed delivery contract

Implementation instruction: Preserve originals.
Reviewable artifact: Immutable-original policy.
Acceptance criterion: Original bytes and integrity hash are retained.
Input dependency: Security design and technical checks.
Scope constraint: PDF and approved images first, archives excluded.
Risk to control: Unsafe previews before quarantine completes.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed object enters public preview or extraction.
Completion record: JF-02-06-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-06-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “immutable-original policy” against “original bytes and integrity hash are retained”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-06-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “immutable-original policy” against “original bytes and integrity hash are retained”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-06-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “immutable-original policy” against “original bytes and integrity hash are retained”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-06-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “immutable-original policy” against “original bytes and integrity hash are retained”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver immutable-original policy to the next dependent owner with JF-02-06-D3 and its acceptance evidence.
Before exposure, resolve unsafe previews before quarantine completes for the approved scope; communicate remaining limitations.

### JF-02-06-D4 — Quarantine new objects

#### Proposed delivery contract

Implementation instruction: Quarantine new objects.
Reviewable artifact: Quarantine lifecycle.
Acceptance criterion: Only approved objects enter extraction.
Input dependency: Security design and technical checks.
Scope constraint: PDF and approved images first, archives excluded.
Risk to control: Unsafe previews before quarantine completes.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed object enters public preview or extraction.
Completion record: JF-02-06-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-06-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “quarantine lifecycle” against “only approved objects enter extraction”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-06-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “quarantine lifecycle” against “only approved objects enter extraction”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-06-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “quarantine lifecycle” against “only approved objects enter extraction”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-06-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “quarantine lifecycle” against “only approved objects enter extraction”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver quarantine lifecycle to the next dependent owner with JF-02-06-D4 and its acceptance evidence.
Before exposure, resolve unsafe previews before quarantine completes for the approved scope; communicate remaining limitations.

### JF-02-06-D5 — Detect duplicate intake

#### Proposed delivery contract

Implementation instruction: Detect duplicate intake.
Reviewable artifact: Duplicate-handling rules.
Acceptance criterion: Duplicate files do not erase version history.
Input dependency: Security design and technical checks.
Scope constraint: PDF and approved images first, archives excluded.
Risk to control: Unsafe previews before quarantine completes.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed object enters public preview or extraction.
Completion record: JF-02-06-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-06-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “duplicate-handling rules” against “duplicate files do not erase version history”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-06-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “duplicate-handling rules” against “duplicate files do not erase version history”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-06-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “duplicate-handling rules” against “duplicate files do not erase version history”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-06-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “duplicate-handling rules” against “duplicate files do not erase version history”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver duplicate-handling rules to the next dependent owner with JF-02-06-D5 and its acceptance evidence.
Before exposure, resolve unsafe previews before quarantine completes for the approved scope; communicate remaining limitations.

### JF-02-06-D6 — Explain intake rejection

#### Proposed delivery contract

Implementation instruction: Explain intake rejection.
Reviewable artifact: Rejection message catalogue.
Acceptance criterion: Users get a safe actionable correction path.
Input dependency: Security design and technical checks.
Scope constraint: PDF and approved images first, archives excluded.
Risk to control: Unsafe previews before quarantine completes.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed object enters public preview or extraction.
Completion record: JF-02-06-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-06-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “rejection message catalogue” against “users get a safe actionable correction path”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-06-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “rejection message catalogue” against “users get a safe actionable correction path”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-06-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “rejection message catalogue” against “users get a safe actionable correction path”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-06-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “rejection message catalogue” against “users get a safe actionable correction path”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-06-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver rejection message catalogue to the next dependent owner with JF-02-06-D6 and its acceptance evidence.
Before exposure, resolve unsafe previews before quarantine completes for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-06 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Security design and technical checks.
Confirm measured evidence for: No unreviewed object enters public preview or extraction.
Confirm the intended scope remains: PDF and approved images first, archives excluded.
Confirm the owner has addressed: Unsafe previews before quarantine completes.
Link relevant master-plan decisions before moving JF-02-06 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-07 — Page rendering and OCR

### Purpose and implementation decision

Outcome: Extract interpretable content with page provenance.
Boundary: No inference of authenticity.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Safe intake and isolated workers.
Primary risk: OCR errors causing identity conclusions.
Workstream success measure: All extracted fields link an original page and extraction version.

### Delivery sequence

1. Confirm the inputs and constraints for page rendering and ocr.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review all extracted fields link an original page and extraction version against the stated measurement cohort.
4. Resolve ocr errors causing identity conclusions before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-07-D1 — Render pages safely

#### Proposed delivery contract

Implementation instruction: Render pages safely.
Reviewable artifact: Rendering artifact contract.
Acceptance criterion: Page order and rotation are recorded.
Input dependency: Safe intake and isolated workers.
Scope constraint: No inference of authenticity.
Risk to control: OCR errors causing identity conclusions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All extracted fields link an original page and extraction version.
Completion record: JF-02-07-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-07-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “rendering artifact contract” against “page order and rotation are recorded”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-07-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “rendering artifact contract” against “page order and rotation are recorded”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-07-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “rendering artifact contract” against “page order and rotation are recorded”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-07-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “rendering artifact contract” against “page order and rotation are recorded”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver rendering artifact contract to the next dependent owner with JF-02-07-D1 and its acceptance evidence.
Before exposure, resolve ocr errors causing identity conclusions for the approved scope; communicate remaining limitations.

### JF-02-07-D2 — Select OCR routing

#### Proposed delivery contract

Implementation instruction: Select OCR routing.
Reviewable artifact: OCR routing decision.
Acceptance criterion: Native text and image-only pages use defined paths.
Input dependency: Safe intake and isolated workers.
Scope constraint: No inference of authenticity.
Risk to control: OCR errors causing identity conclusions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All extracted fields link an original page and extraction version.
Completion record: JF-02-07-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-07-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “ocr routing decision” against “native text and image-only pages use defined paths”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-07-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “ocr routing decision” against “native text and image-only pages use defined paths”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-07-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “ocr routing decision” against “native text and image-only pages use defined paths”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-07-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “ocr routing decision” against “native text and image-only pages use defined paths”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver ocr routing decision to the next dependent owner with JF-02-07-D2 and its acceptance evidence.
Before exposure, resolve ocr errors causing identity conclusions for the approved scope; communicate remaining limitations.

### JF-02-07-D3 — Retain text coordinates

#### Proposed delivery contract

Implementation instruction: Retain text coordinates.
Reviewable artifact: Coordinate specification.
Acceptance criterion: Bounding boxes map to the correct page geometry.
Input dependency: Safe intake and isolated workers.
Scope constraint: No inference of authenticity.
Risk to control: OCR errors causing identity conclusions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All extracted fields link an original page and extraction version.
Completion record: JF-02-07-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-07-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “coordinate specification” against “bounding boxes map to the correct page geometry”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-07-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “coordinate specification” against “bounding boxes map to the correct page geometry”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-07-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “coordinate specification” against “bounding boxes map to the correct page geometry”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-07-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “coordinate specification” against “bounding boxes map to the correct page geometry”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver coordinate specification to the next dependent owner with JF-02-07-D3 and its acceptance evidence.
Before exposure, resolve ocr errors causing identity conclusions for the approved scope; communicate remaining limitations.

### JF-02-07-D4 — Record extraction confidence

#### Proposed delivery contract

Implementation instruction: Record extraction confidence.
Reviewable artifact: Confidence record.
Acceptance criterion: Confidence is separate from rule satisfaction.
Input dependency: Safe intake and isolated workers.
Scope constraint: No inference of authenticity.
Risk to control: OCR errors causing identity conclusions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All extracted fields link an original page and extraction version.
Completion record: JF-02-07-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-07-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “confidence record” against “confidence is separate from rule satisfaction”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-07-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “confidence record” against “confidence is separate from rule satisfaction”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-07-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “confidence record” against “confidence is separate from rule satisfaction”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-07-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “confidence record” against “confidence is separate from rule satisfaction”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver confidence record to the next dependent owner with JF-02-07-D4 and its acceptance evidence.
Before exposure, resolve ocr errors causing identity conclusions for the approved scope; communicate remaining limitations.

### JF-02-07-D5 — Handle unreadable pages

#### Proposed delivery contract

Implementation instruction: Handle unreadable pages.
Reviewable artifact: Unreadable-page workflow.
Acceptance criterion: Low-quality evidence remains unknown.
Input dependency: Safe intake and isolated workers.
Scope constraint: No inference of authenticity.
Risk to control: OCR errors causing identity conclusions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All extracted fields link an original page and extraction version.
Completion record: JF-02-07-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-07-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “unreadable-page workflow” against “low-quality evidence remains unknown”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-07-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “unreadable-page workflow” against “low-quality evidence remains unknown”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-07-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “unreadable-page workflow” against “low-quality evidence remains unknown”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-07-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “unreadable-page workflow” against “low-quality evidence remains unknown”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver unreadable-page workflow to the next dependent owner with JF-02-07-D5 and its acceptance evidence.
Before exposure, resolve ocr errors causing identity conclusions for the approved scope; communicate remaining limitations.

### JF-02-07-D6 — Evaluate mixed-language extraction

#### Proposed delivery contract

Implementation instruction: Evaluate mixed-language extraction.
Reviewable artifact: Language fixture results.
Acceptance criterion: Unsupported scripts are disclosed rather than fabricated.
Input dependency: Safe intake and isolated workers.
Scope constraint: No inference of authenticity.
Risk to control: OCR errors causing identity conclusions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All extracted fields link an original page and extraction version.
Completion record: JF-02-07-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-07-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “language fixture results” against “unsupported scripts are disclosed rather than fabricated”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-07-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “language fixture results” against “unsupported scripts are disclosed rather than fabricated”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-07-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “language fixture results” against “unsupported scripts are disclosed rather than fabricated”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-07-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “language fixture results” against “unsupported scripts are disclosed rather than fabricated”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-07-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver language fixture results to the next dependent owner with JF-02-07-D6 and its acceptance evidence.
Before exposure, resolve ocr errors causing identity conclusions for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-07 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Safe intake and isolated workers.
Confirm measured evidence for: All extracted fields link an original page and extraction version.
Confirm the intended scope remains: No inference of authenticity.
Confirm the owner has addressed: OCR errors causing identity conclusions.
Link relevant master-plan decisions before moving JF-02-07 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-08 — Document classification

### Purpose and implementation decision

Outcome: Suggest document roles without assuming satisfaction.
Boundary: Suggestions require review when ambiguous.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Page extraction and evidence expectations.
Primary risk: Wrong document labels hiding missing evidence.
Workstream success measure: Ambiguous role predictions never automatically pass a requirement.

### Delivery sequence

1. Confirm the inputs and constraints for document classification.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review ambiguous role predictions never automatically pass a requirement against the stated measurement cohort.
4. Resolve wrong document labels hiding missing evidence before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-08-D1 — Define role taxonomy

#### Proposed delivery contract

Implementation instruction: Define role taxonomy.
Reviewable artifact: Document role catalogue.
Acceptance criterion: Roles match evidence expectations.
Input dependency: Page extraction and evidence expectations.
Scope constraint: Suggestions require review when ambiguous.
Risk to control: Wrong document labels hiding missing evidence.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Ambiguous role predictions never automatically pass a requirement.
Completion record: JF-02-08-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-08-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “document role catalogue” against “roles match evidence expectations”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-08-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “document role catalogue” against “roles match evidence expectations”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-08-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “document role catalogue” against “roles match evidence expectations”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-08-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “document role catalogue” against “roles match evidence expectations”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver document role catalogue to the next dependent owner with JF-02-08-D1 and its acceptance evidence.
Before exposure, resolve wrong document labels hiding missing evidence for the approved scope; communicate remaining limitations.

### JF-02-08-D2 — Define classification inputs

#### Proposed delivery contract

Implementation instruction: Define classification inputs.
Reviewable artifact: Classifier input contract.
Acceptance criterion: Only permitted content is processed.
Input dependency: Page extraction and evidence expectations.
Scope constraint: Suggestions require review when ambiguous.
Risk to control: Wrong document labels hiding missing evidence.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Ambiguous role predictions never automatically pass a requirement.
Completion record: JF-02-08-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-08-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “classifier input contract” against “only permitted content is processed”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-08-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “classifier input contract” against “only permitted content is processed”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-08-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “classifier input contract” against “only permitted content is processed”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-08-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “classifier input contract” against “only permitted content is processed”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver classifier input contract to the next dependent owner with JF-02-08-D2 and its acceptance evidence.
Before exposure, resolve wrong document labels hiding missing evidence for the approved scope; communicate remaining limitations.

### JF-02-08-D3 — Define conservative thresholds

#### Proposed delivery contract

Implementation instruction: Define conservative thresholds.
Reviewable artifact: Suggestion threshold policy.
Acceptance criterion: Low certainty has an abstain path.
Input dependency: Page extraction and evidence expectations.
Scope constraint: Suggestions require review when ambiguous.
Risk to control: Wrong document labels hiding missing evidence.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Ambiguous role predictions never automatically pass a requirement.
Completion record: JF-02-08-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-08-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “suggestion threshold policy” against “low certainty has an abstain path”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-08-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “suggestion threshold policy” against “low certainty has an abstain path”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-08-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “suggestion threshold policy” against “low certainty has an abstain path”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-08-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “suggestion threshold policy” against “low certainty has an abstain path”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver suggestion threshold policy to the next dependent owner with JF-02-08-D3 and its acceptance evidence.
Before exposure, resolve wrong document labels hiding missing evidence for the approved scope; communicate remaining limitations.

### JF-02-08-D4 — Support multiple roles

#### Proposed delivery contract

Implementation instruction: Support multiple roles.
Reviewable artifact: Multi-role assignment contract.
Acceptance criterion: One file may support distinct requirements.
Input dependency: Page extraction and evidence expectations.
Scope constraint: Suggestions require review when ambiguous.
Risk to control: Wrong document labels hiding missing evidence.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Ambiguous role predictions never automatically pass a requirement.
Completion record: JF-02-08-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-08-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “multi-role assignment contract” against “one file may support distinct requirements”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-08-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “multi-role assignment contract” against “one file may support distinct requirements”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-08-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “multi-role assignment contract” against “one file may support distinct requirements”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-08-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “multi-role assignment contract” against “one file may support distinct requirements”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver multi-role assignment contract to the next dependent owner with JF-02-08-D4 and its acceptance evidence.
Before exposure, resolve wrong document labels hiding missing evidence for the approved scope; communicate remaining limitations.

### JF-02-08-D5 — Support manual correction

#### Proposed delivery contract

Implementation instruction: Support manual correction.
Reviewable artifact: Role correction workflow.
Acceptance criterion: Corrections preserve classifier history.
Input dependency: Page extraction and evidence expectations.
Scope constraint: Suggestions require review when ambiguous.
Risk to control: Wrong document labels hiding missing evidence.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Ambiguous role predictions never automatically pass a requirement.
Completion record: JF-02-08-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-08-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “role correction workflow” against “corrections preserve classifier history”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-08-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “role correction workflow” against “corrections preserve classifier history”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-08-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “role correction workflow” against “corrections preserve classifier history”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-08-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “role correction workflow” against “corrections preserve classifier history”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver role correction workflow to the next dependent owner with JF-02-08-D5 and its acceptance evidence.
Before exposure, resolve wrong document labels hiding missing evidence for the approved scope; communicate remaining limitations.

### JF-02-08-D6 — Measure classification errors

#### Proposed delivery contract

Implementation instruction: Measure classification errors.
Reviewable artifact: Role confusion matrix.
Acceptance criterion: Wrong-role and abstention rates are reported separately.
Input dependency: Page extraction and evidence expectations.
Scope constraint: Suggestions require review when ambiguous.
Risk to control: Wrong document labels hiding missing evidence.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Ambiguous role predictions never automatically pass a requirement.
Completion record: JF-02-08-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-08-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “role confusion matrix” against “wrong-role and abstention rates are reported separately”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-08-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “role confusion matrix” against “wrong-role and abstention rates are reported separately”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-08-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “role confusion matrix” against “wrong-role and abstention rates are reported separately”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-08-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “role confusion matrix” against “wrong-role and abstention rates are reported separately”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-08-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver role confusion matrix to the next dependent owner with JF-02-08-D6 and its acceptance evidence.
Before exposure, resolve wrong document labels hiding missing evidence for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-08 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Page extraction and evidence expectations.
Confirm measured evidence for: Ambiguous role predictions never automatically pass a requirement.
Confirm the intended scope remains: Suggestions require review when ambiguous.
Confirm the owner has addressed: Wrong document labels hiding missing evidence.
Link relevant master-plan decisions before moving JF-02-08 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-09 — Evidence graph

### Purpose and implementation decision

Outcome: Connect obligations to precise supporting artifacts.
Boundary: Evidence association is separate from evaluation.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Requirements, document versions and extraction anchors.
Primary risk: Dangling links after replacement or deletion.
Workstream success measure: Every active evidence link resolves to an authorized immutable revision.

### Delivery sequence

1. Confirm the inputs and constraints for evidence graph.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review every active evidence link resolves to an authorized immutable revision against the stated measurement cohort.
4. Resolve dangling links after replacement or deletion before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-09-D1 — Define evidence-link identity

#### Proposed delivery contract

Implementation instruction: Define evidence-link identity.
Reviewable artifact: Evidence-link schema.
Acceptance criterion: Requirement and document revisions are explicit.
Input dependency: Requirements, document versions and extraction anchors.
Scope constraint: Evidence association is separate from evaluation.
Risk to control: Dangling links after replacement or deletion.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every active evidence link resolves to an authorized immutable revision.
Completion record: JF-02-09-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-09-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “evidence-link schema” against “requirement and document revisions are explicit”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-09-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “evidence-link schema” against “requirement and document revisions are explicit”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-09-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “evidence-link schema” against “requirement and document revisions are explicit”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-09-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “evidence-link schema” against “requirement and document revisions are explicit”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver evidence-link schema to the next dependent owner with JF-02-09-D1 and its acceptance evidence.
Before exposure, resolve dangling links after replacement or deletion for the approved scope; communicate remaining limitations.

### JF-02-09-D2 — Define page and field anchors

#### Proposed delivery contract

Implementation instruction: Define page and field anchors.
Reviewable artifact: Anchor persistence rules.
Acceptance criterion: Original coordinates and page indices are stable.
Input dependency: Requirements, document versions and extraction anchors.
Scope constraint: Evidence association is separate from evaluation.
Risk to control: Dangling links after replacement or deletion.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every active evidence link resolves to an authorized immutable revision.
Completion record: JF-02-09-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-09-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “anchor persistence rules” against “original coordinates and page indices are stable”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-09-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “anchor persistence rules” against “original coordinates and page indices are stable”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-09-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “anchor persistence rules” against “original coordinates and page indices are stable”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-09-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “anchor persistence rules” against “original coordinates and page indices are stable”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver anchor persistence rules to the next dependent owner with JF-02-09-D2 and its acceptance evidence.
Before exposure, resolve dangling links after replacement or deletion for the approved scope; communicate remaining limitations.

### JF-02-09-D3 — Support alternative evidence sets

#### Proposed delivery contract

Implementation instruction: Support alternative evidence sets.
Reviewable artifact: Evidence-set contract.
Acceptance criterion: Any-of and all-of semantics are distinct.
Input dependency: Requirements, document versions and extraction anchors.
Scope constraint: Evidence association is separate from evaluation.
Risk to control: Dangling links after replacement or deletion.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every active evidence link resolves to an authorized immutable revision.
Completion record: JF-02-09-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-09-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “evidence-set contract” against “any-of and all-of semantics are distinct”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-09-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “evidence-set contract” against “any-of and all-of semantics are distinct”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-09-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “evidence-set contract” against “any-of and all-of semantics are distinct”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-09-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “evidence-set contract” against “any-of and all-of semantics are distinct”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver evidence-set contract to the next dependent owner with JF-02-09-D3 and its acceptance evidence.
Before exposure, resolve dangling links after replacement or deletion for the approved scope; communicate remaining limitations.

### JF-02-09-D4 — Support user-confirmed mapping

#### Proposed delivery contract

Implementation instruction: Support user-confirmed mapping.
Reviewable artifact: Mapping confirmation flow.
Acceptance criterion: Manual assignment records actor and time.
Input dependency: Requirements, document versions and extraction anchors.
Scope constraint: Evidence association is separate from evaluation.
Risk to control: Dangling links after replacement or deletion.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every active evidence link resolves to an authorized immutable revision.
Completion record: JF-02-09-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-09-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “mapping confirmation flow” against “manual assignment records actor and time”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-09-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “mapping confirmation flow” against “manual assignment records actor and time”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-09-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “mapping confirmation flow” against “manual assignment records actor and time”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-09-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “mapping confirmation flow” against “manual assignment records actor and time”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver mapping confirmation flow to the next dependent owner with JF-02-09-D4 and its acceptance evidence.
Before exposure, resolve dangling links after replacement or deletion for the approved scope; communicate remaining limitations.

### JF-02-09-D5 — Invalidate dependent links

#### Proposed delivery contract

Implementation instruction: Invalidate dependent links.
Reviewable artifact: Invalidation procedure.
Acceptance criterion: Deleted or replaced evidence cannot remain current.
Input dependency: Requirements, document versions and extraction anchors.
Scope constraint: Evidence association is separate from evaluation.
Risk to control: Dangling links after replacement or deletion.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every active evidence link resolves to an authorized immutable revision.
Completion record: JF-02-09-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-09-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “invalidation procedure” against “deleted or replaced evidence cannot remain current”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-09-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “invalidation procedure” against “deleted or replaced evidence cannot remain current”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-09-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “invalidation procedure” against “deleted or replaced evidence cannot remain current”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-09-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “invalidation procedure” against “deleted or replaced evidence cannot remain current”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver invalidation procedure to the next dependent owner with JF-02-09-D5 and its acceptance evidence.
Before exposure, resolve dangling links after replacement or deletion for the approved scope; communicate remaining limitations.

### JF-02-09-D6 — Inspect graph completeness

#### Proposed delivery contract

Implementation instruction: Inspect graph completeness.
Reviewable artifact: Completeness audit.
Acceptance criterion: Missing obligations are visible even with many files.
Input dependency: Requirements, document versions and extraction anchors.
Scope constraint: Evidence association is separate from evaluation.
Risk to control: Dangling links after replacement or deletion.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every active evidence link resolves to an authorized immutable revision.
Completion record: JF-02-09-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-09-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “completeness audit” against “missing obligations are visible even with many files”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-09-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “completeness audit” against “missing obligations are visible even with many files”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-09-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “completeness audit” against “missing obligations are visible even with many files”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-09-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “completeness audit” against “missing obligations are visible even with many files”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-09-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver completeness audit to the next dependent owner with JF-02-09-D6 and its acceptance evidence.
Before exposure, resolve dangling links after replacement or deletion for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-09 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Requirements, document versions and extraction anchors.
Confirm measured evidence for: Every active evidence link resolves to an authorized immutable revision.
Confirm the intended scope remains: Evidence association is separate from evaluation.
Confirm the owner has addressed: Dangling links after replacement or deletion.
Link relevant master-plan decisions before moving JF-02-09 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-10 — Identity consistency

### Purpose and implementation decision

Outcome: Flag documented differences without legal identity inference.
Boundary: No biometric verification or automatic identity merger.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Confirmed facts and page-linked evidence.
Primary risk: OCR variation treated as fraudulent identity.
Workstream success measure: Every identity concern shows source values and a conservative review state.

### Delivery sequence

1. Confirm the inputs and constraints for identity consistency.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review every identity concern shows source values and a conservative review state against the stated measurement cohort.
4. Resolve ocr variation treated as fraudulent identity before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-10-D1 — Define comparable identity fields

#### Proposed delivery contract

Implementation instruction: Define comparable identity fields.
Reviewable artifact: Comparison field catalogue.
Acceptance criterion: Name and birth-date comparisons have explicit purposes.
Input dependency: Confirmed facts and page-linked evidence.
Scope constraint: No biometric verification or automatic identity merger.
Risk to control: OCR variation treated as fraudulent identity.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every identity concern shows source values and a conservative review state.
Completion record: JF-02-10-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-10-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “comparison field catalogue” against “name and birth-date comparisons have explicit purposes”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-10-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “comparison field catalogue” against “name and birth-date comparisons have explicit purposes”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-10-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “comparison field catalogue” against “name and birth-date comparisons have explicit purposes”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-10-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “comparison field catalogue” against “name and birth-date comparisons have explicit purposes”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver comparison field catalogue to the next dependent owner with JF-02-10-D1 and its acceptance evidence.
Before exposure, resolve ocr variation treated as fraudulent identity for the approved scope; communicate remaining limitations.

### JF-02-10-D2 — Preserve raw identity values

#### Proposed delivery contract

Implementation instruction: Preserve raw identity values.
Reviewable artifact: Identity extraction contract.
Acceptance criterion: Normalization never replaces original evidence.
Input dependency: Confirmed facts and page-linked evidence.
Scope constraint: No biometric verification or automatic identity merger.
Risk to control: OCR variation treated as fraudulent identity.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every identity concern shows source values and a conservative review state.
Completion record: JF-02-10-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-10-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “identity extraction contract” against “normalization never replaces original evidence”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-10-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “identity extraction contract” against “normalization never replaces original evidence”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-10-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “identity extraction contract” against “normalization never replaces original evidence”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-10-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “identity extraction contract” against “normalization never replaces original evidence”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver identity extraction contract to the next dependent owner with JF-02-10-D2 and its acceptance evidence.
Before exposure, resolve ocr variation treated as fraudulent identity for the approved scope; communicate remaining limitations.

### JF-02-10-D3 — Define safe normalization

#### Proposed delivery contract

Implementation instruction: Define safe normalization.
Reviewable artifact: Normalization policy.
Acceptance criterion: Whitespace and punctuation treatment are documented.
Input dependency: Confirmed facts and page-linked evidence.
Scope constraint: No biometric verification or automatic identity merger.
Risk to control: OCR variation treated as fraudulent identity.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every identity concern shows source values and a conservative review state.
Completion record: JF-02-10-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-10-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “normalization policy” against “whitespace and punctuation treatment are documented”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-10-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “normalization policy” against “whitespace and punctuation treatment are documented”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-10-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “normalization policy” against “whitespace and punctuation treatment are documented”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-10-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “normalization policy” against “whitespace and punctuation treatment are documented”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver normalization policy to the next dependent owner with JF-02-10-D3 and its acceptance evidence.
Before exposure, resolve ocr variation treated as fraudulent identity for the approved scope; communicate remaining limitations.

### JF-02-10-D4 — Handle transliteration and initials

#### Proposed delivery contract

Implementation instruction: Handle transliteration and initials.
Reviewable artifact: Ambiguity handling.
Acceptance criterion: Similarity alone does not establish equivalence.
Input dependency: Confirmed facts and page-linked evidence.
Scope constraint: No biometric verification or automatic identity merger.
Risk to control: OCR variation treated as fraudulent identity.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every identity concern shows source values and a conservative review state.
Completion record: JF-02-10-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-10-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “ambiguity handling” against “similarity alone does not establish equivalence”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-10-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “ambiguity handling” against “similarity alone does not establish equivalence”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-10-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “ambiguity handling” against “similarity alone does not establish equivalence”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-10-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “ambiguity handling” against “similarity alone does not establish equivalence”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver ambiguity handling to the next dependent owner with JF-02-10-D4 and its acceptance evidence.
Before exposure, resolve ocr variation treated as fraudulent identity for the approved scope; communicate remaining limitations.

### JF-02-10-D5 — Link supporting change evidence

#### Proposed delivery contract

Implementation instruction: Link supporting change evidence.
Reviewable artifact: Supporting-evidence workflow.
Acceptance criterion: Required evidence follows the selected instruction.
Input dependency: Confirmed facts and page-linked evidence.
Scope constraint: No biometric verification or automatic identity merger.
Risk to control: OCR variation treated as fraudulent identity.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every identity concern shows source values and a conservative review state.
Completion record: JF-02-10-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-10-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “supporting-evidence workflow” against “required evidence follows the selected instruction”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-10-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “supporting-evidence workflow” against “required evidence follows the selected instruction”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-10-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “supporting-evidence workflow” against “required evidence follows the selected instruction”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-10-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “supporting-evidence workflow” against “required evidence follows the selected instruction”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver supporting-evidence workflow to the next dependent owner with JF-02-10-D5 and its acceptance evidence.
Before exposure, resolve ocr variation treated as fraudulent identity for the approved scope; communicate remaining limitations.

### JF-02-10-D6 — Explain identity concerns

#### Proposed delivery contract

Implementation instruction: Explain identity concerns.
Reviewable artifact: Identity issue copy.
Acceptance criterion: The report avoids unsupported fraud accusations.
Input dependency: Confirmed facts and page-linked evidence.
Scope constraint: No biometric verification or automatic identity merger.
Risk to control: OCR variation treated as fraudulent identity.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every identity concern shows source values and a conservative review state.
Completion record: JF-02-10-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-10-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “identity issue copy” against “the report avoids unsupported fraud accusations”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-10-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “identity issue copy” against “the report avoids unsupported fraud accusations”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-10-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “identity issue copy” against “the report avoids unsupported fraud accusations”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-10-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “identity issue copy” against “the report avoids unsupported fraud accusations”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-10-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver identity issue copy to the next dependent owner with JF-02-10-D6 and its acceptance evidence.
Before exposure, resolve ocr variation treated as fraudulent identity for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-10 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Confirmed facts and page-linked evidence.
Confirm measured evidence for: Every identity concern shows source values and a conservative review state.
Confirm the intended scope remains: No biometric verification or automatic identity merger.
Confirm the owner has addressed: OCR variation treated as fraudulent identity.
Link relevant master-plan decisions before moving JF-02-10 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-11 — Dates and validity

### Purpose and implementation decision

Outcome: Evaluate supported temporal constraints explicitly.
Boundary: No invented expiry or issuer rules.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Approved requirement dates and confirmed date fields.
Primary risk: Locale ambiguity causing incorrect expiry findings.
Workstream success measure: All supported date boundaries include timezone and ambiguity fixtures.

### Delivery sequence

1. Confirm the inputs and constraints for dates and validity.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review all supported date boundaries include timezone and ambiguity fixtures against the stated measurement cohort.
4. Resolve locale ambiguity causing incorrect expiry findings before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-11-D1 — Define date parsing rules

#### Proposed delivery contract

Implementation instruction: Define date parsing rules.
Reviewable artifact: Date interpretation policy.
Acceptance criterion: Ambiguous formats require confirmation.
Input dependency: Approved requirement dates and confirmed date fields.
Scope constraint: No invented expiry or issuer rules.
Risk to control: Locale ambiguity causing incorrect expiry findings.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported date boundaries include timezone and ambiguity fixtures.
Completion record: JF-02-11-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-11-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “date interpretation policy” against “ambiguous formats require confirmation”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-11-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “date interpretation policy” against “ambiguous formats require confirmation”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-11-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “date interpretation policy” against “ambiguous formats require confirmation”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-11-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “date interpretation policy” against “ambiguous formats require confirmation”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver date interpretation policy to the next dependent owner with JF-02-11-D1 and its acceptance evidence.
Before exposure, resolve locale ambiguity causing incorrect expiry findings for the approved scope; communicate remaining limitations.

### JF-02-11-D2 — Define validity semantics

#### Proposed delivery contract

Implementation instruction: Define validity semantics.
Reviewable artifact: Validity rule contract.
Acceptance criterion: Issue date, expiry and reference date differ.
Input dependency: Approved requirement dates and confirmed date fields.
Scope constraint: No invented expiry or issuer rules.
Risk to control: Locale ambiguity causing incorrect expiry findings.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported date boundaries include timezone and ambiguity fixtures.
Completion record: JF-02-11-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-11-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “validity rule contract” against “issue date, expiry and reference date differ”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-11-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “validity rule contract” against “issue date, expiry and reference date differ”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-11-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “validity rule contract” against “issue date, expiry and reference date differ”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-11-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “validity rule contract” against “issue date, expiry and reference date differ”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver validity rule contract to the next dependent owner with JF-02-11-D2 and its acceptance evidence.
Before exposure, resolve locale ambiguity causing incorrect expiry findings for the approved scope; communicate remaining limitations.

### JF-02-11-D3 — Define cycle reference dates

#### Proposed delivery contract

Implementation instruction: Define cycle reference dates.
Reviewable artifact: Reference-date inventory.
Acceptance criterion: Each comparison identifies the governing date.
Input dependency: Approved requirement dates and confirmed date fields.
Scope constraint: No invented expiry or issuer rules.
Risk to control: Locale ambiguity causing incorrect expiry findings.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported date boundaries include timezone and ambiguity fixtures.
Completion record: JF-02-11-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-11-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “reference-date inventory” against “each comparison identifies the governing date”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-11-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “reference-date inventory” against “each comparison identifies the governing date”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-11-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “reference-date inventory” against “each comparison identifies the governing date”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-11-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “reference-date inventory” against “each comparison identifies the governing date”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver reference-date inventory to the next dependent owner with JF-02-11-D3 and its acceptance evidence.
Before exposure, resolve locale ambiguity causing incorrect expiry findings for the approved scope; communicate remaining limitations.

### JF-02-11-D4 — Handle missing dates

#### Proposed delivery contract

Implementation instruction: Handle missing dates.
Reviewable artifact: Missing-date behavior.
Acceptance criterion: Absence becomes unknown when a date is required.
Input dependency: Approved requirement dates and confirmed date fields.
Scope constraint: No invented expiry or issuer rules.
Risk to control: Locale ambiguity causing incorrect expiry findings.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported date boundaries include timezone and ambiguity fixtures.
Completion record: JF-02-11-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-11-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “missing-date behavior” against “absence becomes unknown when a date is required”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-11-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “missing-date behavior” against “absence becomes unknown when a date is required”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-11-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “missing-date behavior” against “absence becomes unknown when a date is required”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-11-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “missing-date behavior” against “absence becomes unknown when a date is required”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver missing-date behavior to the next dependent owner with JF-02-11-D4 and its acceptance evidence.
Before exposure, resolve locale ambiguity causing incorrect expiry findings for the approved scope; communicate remaining limitations.

### JF-02-11-D5 — Handle leap and boundary dates

#### Proposed delivery contract

Implementation instruction: Handle leap and boundary dates.
Reviewable artifact: Temporal fixture set.
Acceptance criterion: Inclusive limits and leap dates are tested.
Input dependency: Approved requirement dates and confirmed date fields.
Scope constraint: No invented expiry or issuer rules.
Risk to control: Locale ambiguity causing incorrect expiry findings.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported date boundaries include timezone and ambiguity fixtures.
Completion record: JF-02-11-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-11-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “temporal fixture set” against “inclusive limits and leap dates are tested”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-11-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “temporal fixture set” against “inclusive limits and leap dates are tested”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-11-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “temporal fixture set” against “inclusive limits and leap dates are tested”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-11-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “temporal fixture set” against “inclusive limits and leap dates are tested”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver temporal fixture set to the next dependent owner with JF-02-11-D5 and its acceptance evidence.
Before exposure, resolve locale ambiguity causing incorrect expiry findings for the approved scope; communicate remaining limitations.

### JF-02-11-D6 — Explain temporal findings

#### Proposed delivery contract

Implementation instruction: Explain temporal findings.
Reviewable artifact: Date issue explanation.
Acceptance criterion: Original date and applied rule are visible.
Input dependency: Approved requirement dates and confirmed date fields.
Scope constraint: No invented expiry or issuer rules.
Risk to control: Locale ambiguity causing incorrect expiry findings.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: All supported date boundaries include timezone and ambiguity fixtures.
Completion record: JF-02-11-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-11-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “date issue explanation” against “original date and applied rule are visible”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-11-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “date issue explanation” against “original date and applied rule are visible”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-11-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “date issue explanation” against “original date and applied rule are visible”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-11-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “date issue explanation” against “original date and applied rule are visible”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-11-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver date issue explanation to the next dependent owner with JF-02-11-D6 and its acceptance evidence.
Before exposure, resolve locale ambiguity causing incorrect expiry findings for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-11 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Approved requirement dates and confirmed date fields.
Confirm measured evidence for: All supported date boundaries include timezone and ambiguity fixtures.
Confirm the intended scope remains: No invented expiry or issuer rules.
Confirm the owner has addressed: Locale ambiguity causing incorrect expiry findings.
Link relevant master-plan decisions before moving JF-02-11 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-12 — Evaluation orchestration

### Purpose and implementation decision

Outcome: Produce reproducible checks from immutable inputs.
Boundary: Deterministic baseline before model assistance.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Evidence graph and approved predicates.
Primary risk: A report combining incompatible revisions.
Workstream success measure: Every result has one complete input-version manifest.

### Delivery sequence

1. Confirm the inputs and constraints for evaluation orchestration.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review every result has one complete input-version manifest against the stated measurement cohort.
4. Resolve a report combining incompatible revisions before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-12-D1 — Define evaluation prerequisites

#### Proposed delivery contract

Implementation instruction: Define evaluation prerequisites.
Reviewable artifact: Prerequisite graph.
Acceptance criterion: Checks wait for required facts and evidence.
Input dependency: Evidence graph and approved predicates.
Scope constraint: Deterministic baseline before model assistance.
Risk to control: A report combining incompatible revisions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every result has one complete input-version manifest.
Completion record: JF-02-12-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-12-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “prerequisite graph” against “checks wait for required facts and evidence”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-12-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “prerequisite graph” against “checks wait for required facts and evidence”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-12-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “prerequisite graph” against “checks wait for required facts and evidence”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-12-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “prerequisite graph” against “checks wait for required facts and evidence”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver prerequisite graph to the next dependent owner with JF-02-12-D1 and its acceptance evidence.
Before exposure, resolve a report combining incompatible revisions for the approved scope; communicate remaining limitations.

### JF-02-12-D2 — Define run snapshots

#### Proposed delivery contract

Implementation instruction: Define run snapshots.
Reviewable artifact: Evaluation-run contract.
Acceptance criterion: Pack, profile and document revisions are pinned.
Input dependency: Evidence graph and approved predicates.
Scope constraint: Deterministic baseline before model assistance.
Risk to control: A report combining incompatible revisions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every result has one complete input-version manifest.
Completion record: JF-02-12-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-12-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “evaluation-run contract” against “pack, profile and document revisions are pinned”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-12-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “evaluation-run contract” against “pack, profile and document revisions are pinned”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-12-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “evaluation-run contract” against “pack, profile and document revisions are pinned”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-12-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “evaluation-run contract” against “pack, profile and document revisions are pinned”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver evaluation-run contract to the next dependent owner with JF-02-12-D2 and its acceptance evidence.
Before exposure, resolve a report combining incompatible revisions for the approved scope; communicate remaining limitations.

### JF-02-12-D3 — Define stable result ordering

#### Proposed delivery contract

Implementation instruction: Define stable result ordering.
Reviewable artifact: Ordering policy.
Acceptance criterion: Blocking issues are consistently prioritized.
Input dependency: Evidence graph and approved predicates.
Scope constraint: Deterministic baseline before model assistance.
Risk to control: A report combining incompatible revisions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every result has one complete input-version manifest.
Completion record: JF-02-12-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-12-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “ordering policy” against “blocking issues are consistently prioritized”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-12-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “ordering policy” against “blocking issues are consistently prioritized”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-12-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “ordering policy” against “blocking issues are consistently prioritized”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-12-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “ordering policy” against “blocking issues are consistently prioritized”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver ordering policy to the next dependent owner with JF-02-12-D3 and its acceptance evidence.
Before exposure, resolve a report combining incompatible revisions for the approved scope; communicate remaining limitations.

### JF-02-12-D4 — Define evaluator versioning

#### Proposed delivery contract

Implementation instruction: Define evaluator versioning.
Reviewable artifact: Evaluator registry.
Acceptance criterion: Results identify the exact behavior revision.
Input dependency: Evidence graph and approved predicates.
Scope constraint: Deterministic baseline before model assistance.
Risk to control: A report combining incompatible revisions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every result has one complete input-version manifest.
Completion record: JF-02-12-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-12-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “evaluator registry” against “results identify the exact behavior revision”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-12-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “evaluator registry” against “results identify the exact behavior revision”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-12-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “evaluator registry” against “results identify the exact behavior revision”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-12-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “evaluator registry” against “results identify the exact behavior revision”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver evaluator registry to the next dependent owner with JF-02-12-D4 and its acceptance evidence.
Before exposure, resolve a report combining incompatible revisions for the approved scope; communicate remaining limitations.

### JF-02-12-D5 — Define affected-check recomputation

#### Proposed delivery contract

Implementation instruction: Define affected-check recomputation.
Reviewable artifact: Recomputation map.
Acceptance criterion: Changes invalidate all relevant dependent checks.
Input dependency: Evidence graph and approved predicates.
Scope constraint: Deterministic baseline before model assistance.
Risk to control: A report combining incompatible revisions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every result has one complete input-version manifest.
Completion record: JF-02-12-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-12-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “recomputation map” against “changes invalidate all relevant dependent checks”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-12-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “recomputation map” against “changes invalidate all relevant dependent checks”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-12-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “recomputation map” against “changes invalidate all relevant dependent checks”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-12-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “recomputation map” against “changes invalidate all relevant dependent checks”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver recomputation map to the next dependent owner with JF-02-12-D5 and its acceptance evidence.
Before exposure, resolve a report combining incompatible revisions for the approved scope; communicate remaining limitations.

### JF-02-12-D6 — Define report aggregation

#### Proposed delivery contract

Implementation instruction: Define report aggregation.
Reviewable artifact: Aggregation specification.
Acceptance criterion: Unknown, error and stale results prevent complete readiness.
Input dependency: Evidence graph and approved predicates.
Scope constraint: Deterministic baseline before model assistance.
Risk to control: A report combining incompatible revisions.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every result has one complete input-version manifest.
Completion record: JF-02-12-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-12-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “aggregation specification” against “unknown, error and stale results prevent complete readiness”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-12-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “aggregation specification” against “unknown, error and stale results prevent complete readiness”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-12-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “aggregation specification” against “unknown, error and stale results prevent complete readiness”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-12-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “aggregation specification” against “unknown, error and stale results prevent complete readiness”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-12-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver aggregation specification to the next dependent owner with JF-02-12-D6 and its acceptance evidence.
Before exposure, resolve a report combining incompatible revisions for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-12 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Evidence graph and approved predicates.
Confirm measured evidence for: Every result has one complete input-version manifest.
Confirm the intended scope remains: Deterministic baseline before model assistance.
Confirm the owner has addressed: A report combining incompatible revisions.
Link relevant master-plan decisions before moving JF-02-12 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-13 — Corrections and manual review

### Purpose and implementation decision

Outcome: Resolve uncertainty while retaining auditability.
Boundary: Overrides never erase machine findings.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Evaluation results and role permissions.
Primary risk: Human judgment appearing as verified automation.
Workstream success measure: Every correction records actor, rationale and prior value.

### Delivery sequence

1. Confirm the inputs and constraints for corrections and manual review.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review every correction records actor, rationale and prior value against the stated measurement cohort.
4. Resolve human judgment appearing as verified automation before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-13-D1 — Define extraction corrections

#### Proposed delivery contract

Implementation instruction: Define extraction corrections.
Reviewable artifact: Correction record.
Acceptance criterion: Original and corrected values remain inspectable.
Input dependency: Evaluation results and role permissions.
Scope constraint: Overrides never erase machine findings.
Risk to control: Human judgment appearing as verified automation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every correction records actor, rationale and prior value.
Completion record: JF-02-13-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-13-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “correction record” against “original and corrected values remain inspectable”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-13-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “correction record” against “original and corrected values remain inspectable”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-13-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “correction record” against “original and corrected values remain inspectable”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-13-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “correction record” against “original and corrected values remain inspectable”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver correction record to the next dependent owner with JF-02-13-D1 and its acceptance evidence.
Before exposure, resolve human judgment appearing as verified automation for the approved scope; communicate remaining limitations.

### JF-02-13-D2 — Define reviewer queue

#### Proposed delivery contract

Implementation instruction: Define reviewer queue.
Reviewable artifact: Review queue policy.
Acceptance criterion: Severity and urgency determine routing.
Input dependency: Evaluation results and role permissions.
Scope constraint: Overrides never erase machine findings.
Risk to control: Human judgment appearing as verified automation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every correction records actor, rationale and prior value.
Completion record: JF-02-13-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-13-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “review queue policy” against “severity and urgency determine routing”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-13-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “review queue policy” against “severity and urgency determine routing”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-13-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “review queue policy” against “severity and urgency determine routing”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-13-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “review queue policy” against “severity and urgency determine routing”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver review queue policy to the next dependent owner with JF-02-13-D2 and its acceptance evidence.
Before exposure, resolve human judgment appearing as verified automation for the approved scope; communicate remaining limitations.

### JF-02-13-D3 — Define override permissions

#### Proposed delivery contract

Implementation instruction: Define override permissions.
Reviewable artifact: Override authorization.
Acceptance criterion: Only approved roles can override scoped findings.
Input dependency: Evaluation results and role permissions.
Scope constraint: Overrides never erase machine findings.
Risk to control: Human judgment appearing as verified automation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every correction records actor, rationale and prior value.
Completion record: JF-02-13-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-13-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “override authorization” against “only approved roles can override scoped findings”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-13-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “override authorization” against “only approved roles can override scoped findings”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-13-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “override authorization” against “only approved roles can override scoped findings”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-13-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “override authorization” against “only approved roles can override scoped findings”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver override authorization to the next dependent owner with JF-02-13-D3 and its acceptance evidence.
Before exposure, resolve human judgment appearing as verified automation for the approved scope; communicate remaining limitations.

### JF-02-13-D4 — Define override presentation

#### Proposed delivery contract

Implementation instruction: Define override presentation.
Reviewable artifact: Manual-review labels.
Acceptance criterion: Users see which outcomes depend on judgment.
Input dependency: Evaluation results and role permissions.
Scope constraint: Overrides never erase machine findings.
Risk to control: Human judgment appearing as verified automation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every correction records actor, rationale and prior value.
Completion record: JF-02-13-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-13-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “manual-review labels” against “users see which outcomes depend on judgment”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-13-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “manual-review labels” against “users see which outcomes depend on judgment”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-13-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “manual-review labels” against “users see which outcomes depend on judgment”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-13-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “manual-review labels” against “users see which outcomes depend on judgment”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver manual-review labels to the next dependent owner with JF-02-13-D4 and its acceptance evidence.
Before exposure, resolve human judgment appearing as verified automation for the approved scope; communicate remaining limitations.

### JF-02-13-D5 — Define dispute handling

#### Proposed delivery contract

Implementation instruction: Define dispute handling.
Reviewable artifact: Dispute record.
Acceptance criterion: Applicant disagreement remains traceable.
Input dependency: Evaluation results and role permissions.
Scope constraint: Overrides never erase machine findings.
Risk to control: Human judgment appearing as verified automation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every correction records actor, rationale and prior value.
Completion record: JF-02-13-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-13-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “dispute record” against “applicant disagreement remains traceable”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-13-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “dispute record” against “applicant disagreement remains traceable”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-13-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “dispute record” against “applicant disagreement remains traceable”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-13-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “dispute record” against “applicant disagreement remains traceable”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver dispute record to the next dependent owner with JF-02-13-D5 and its acceptance evidence.
Before exposure, resolve human judgment appearing as verified automation for the approved scope; communicate remaining limitations.

### JF-02-13-D6 — Define correction reruns

#### Proposed delivery contract

Implementation instruction: Define correction reruns.
Reviewable artifact: Rerun behavior.
Acceptance criterion: Dependent results change only through a new run.
Input dependency: Evaluation results and role permissions.
Scope constraint: Overrides never erase machine findings.
Risk to control: Human judgment appearing as verified automation.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every correction records actor, rationale and prior value.
Completion record: JF-02-13-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-13-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “rerun behavior” against “dependent results change only through a new run”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-13-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “rerun behavior” against “dependent results change only through a new run”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-13-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “rerun behavior” against “dependent results change only through a new run”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-13-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “rerun behavior” against “dependent results change only through a new run”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-13-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver rerun behavior to the next dependent owner with JF-02-13-D6 and its acceptance evidence.
Before exposure, resolve human judgment appearing as verified automation for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-13 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Evaluation results and role permissions.
Confirm measured evidence for: Every correction records actor, rationale and prior value.
Confirm the intended scope remains: Overrides never erase machine findings.
Confirm the owner has addressed: Human judgment appearing as verified automation.
Link relevant master-plan decisions before moving JF-02-13 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-14 — Reports and exports

### Purpose and implementation decision

Outcome: Deliver useful dated review evidence.
Boundary: No official submission certificate.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Completed run snapshots and access controls.
Primary risk: Exported report losing limitations.
Workstream success measure: Every export includes versions, coverage and unresolved issues.

### Delivery sequence

1. Confirm the inputs and constraints for reports and exports.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review every export includes versions, coverage and unresolved issues against the stated measurement cohort.
4. Resolve exported report losing limitations before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-14-D1 — Define report sections

#### Proposed delivery contract

Implementation instruction: Define report sections.
Reviewable artifact: Report specification.
Acceptance criterion: Summary, sources, evidence and limitations are present.
Input dependency: Completed run snapshots and access controls.
Scope constraint: No official submission certificate.
Risk to control: Exported report losing limitations.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every export includes versions, coverage and unresolved issues.
Completion record: JF-02-14-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-14-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “report specification” against “summary, sources, evidence and limitations are present”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-14-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “report specification” against “summary, sources, evidence and limitations are present”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-14-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “report specification” against “summary, sources, evidence and limitations are present”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-14-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “report specification” against “summary, sources, evidence and limitations are present”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver report specification to the next dependent owner with JF-02-14-D1 and its acceptance evidence.
Before exposure, resolve exported report losing limitations for the approved scope; communicate remaining limitations.

### JF-02-14-D2 — Define export authorization

#### Proposed delivery contract

Implementation instruction: Define export authorization.
Reviewable artifact: Export access contract.
Acceptance criterion: Permission is checked when generation and download occur.
Input dependency: Completed run snapshots and access controls.
Scope constraint: No official submission certificate.
Risk to control: Exported report losing limitations.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every export includes versions, coverage and unresolved issues.
Completion record: JF-02-14-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-14-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “export access contract” against “permission is checked when generation and download occur”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-14-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “export access contract” against “permission is checked when generation and download occur”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-14-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “export access contract” against “permission is checked when generation and download occur”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-14-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “export access contract” against “permission is checked when generation and download occur”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver export access contract to the next dependent owner with JF-02-14-D2 and its acceptance evidence.
Before exposure, resolve exported report losing limitations for the approved scope; communicate remaining limitations.

### JF-02-14-D3 — Define source references

#### Proposed delivery contract

Implementation instruction: Define source references.
Reviewable artifact: Report citation rules.
Acceptance criterion: Requirements retain official source links.
Input dependency: Completed run snapshots and access controls.
Scope constraint: No official submission certificate.
Risk to control: Exported report losing limitations.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every export includes versions, coverage and unresolved issues.
Completion record: JF-02-14-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-14-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “report citation rules” against “requirements retain official source links”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-14-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “report citation rules” against “requirements retain official source links”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-14-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “report citation rules” against “requirements retain official source links”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-14-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “report citation rules” against “requirements retain official source links”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver report citation rules to the next dependent owner with JF-02-14-D3 and its acceptance evidence.
Before exposure, resolve exported report losing limitations for the approved scope; communicate remaining limitations.

### JF-02-14-D4 — Define document references

#### Proposed delivery contract

Implementation instruction: Define document references.
Reviewable artifact: Evidence reference rules.
Acceptance criterion: File and page references identify exact versions.
Input dependency: Completed run snapshots and access controls.
Scope constraint: No official submission certificate.
Risk to control: Exported report losing limitations.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every export includes versions, coverage and unresolved issues.
Completion record: JF-02-14-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-14-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “evidence reference rules” against “file and page references identify exact versions”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-14-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “evidence reference rules” against “file and page references identify exact versions”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-14-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “evidence reference rules” against “file and page references identify exact versions”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-14-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “evidence reference rules” against “file and page references identify exact versions”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver evidence reference rules to the next dependent owner with JF-02-14-D4 and its acceptance evidence.
Before exposure, resolve exported report losing limitations for the approved scope; communicate remaining limitations.

### JF-02-14-D5 — Define report staleness

#### Proposed delivery contract

Implementation instruction: Define report staleness.
Reviewable artifact: Stale report behavior.
Acceptance criterion: Old reports are visibly historical.
Input dependency: Completed run snapshots and access controls.
Scope constraint: No official submission certificate.
Risk to control: Exported report losing limitations.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every export includes versions, coverage and unresolved issues.
Completion record: JF-02-14-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-14-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “stale report behavior” against “old reports are visibly historical”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-14-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “stale report behavior” against “old reports are visibly historical”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-14-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “stale report behavior” against “old reports are visibly historical”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-14-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “stale report behavior” against “old reports are visibly historical”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver stale report behavior to the next dependent owner with JF-02-14-D5 and its acceptance evidence.
Before exposure, resolve exported report losing limitations for the approved scope; communicate remaining limitations.

### JF-02-14-D6 — Define safe export metadata

#### Proposed delivery contract

Implementation instruction: Define safe export metadata.
Reviewable artifact: Export redaction policy.
Acceptance criterion: Unnecessary sensitive fields are excluded.
Input dependency: Completed run snapshots and access controls.
Scope constraint: No official submission certificate.
Risk to control: Exported report losing limitations.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Every export includes versions, coverage and unresolved issues.
Completion record: JF-02-14-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-14-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “export redaction policy” against “unnecessary sensitive fields are excluded”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-14-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “export redaction policy” against “unnecessary sensitive fields are excluded”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-14-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “export redaction policy” against “unnecessary sensitive fields are excluded”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-14-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “export redaction policy” against “unnecessary sensitive fields are excluded”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-14-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver export redaction policy to the next dependent owner with JF-02-14-D6 and its acceptance evidence.
Before exposure, resolve exported report losing limitations for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-14 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Completed run snapshots and access controls.
Confirm measured evidence for: Every export includes versions, coverage and unresolved issues.
Confirm the intended scope remains: No official submission certificate.
Confirm the owner has addressed: Exported report losing limitations.
Link relevant master-plan decisions before moving JF-02-14 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-15 — Source-change governance

### Purpose and implementation decision

Outcome: Keep live packs current without rewriting history.
Boundary: Human approval before changed rules apply.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Source snapshots and pack lifecycle.
Primary risk: New official instructions missed near deadlines.
Workstream success measure: Material source changes have an owner and impact assessment.

### Delivery sequence

1. Confirm the inputs and constraints for source-change governance.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review material source changes have an owner and impact assessment against the stated measurement cohort.
4. Resolve new official instructions missed near deadlines before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-15-D1 — Define source refresh cadence

#### Proposed delivery contract

Implementation instruction: Define source refresh cadence.
Reviewable artifact: Refresh schedule.
Acceptance criterion: Cadence reflects the active application period.
Input dependency: Source snapshots and pack lifecycle.
Scope constraint: Human approval before changed rules apply.
Risk to control: New official instructions missed near deadlines.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Material source changes have an owner and impact assessment.
Completion record: JF-02-15-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-15-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “refresh schedule” against “cadence reflects the active application period”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-15-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “refresh schedule” against “cadence reflects the active application period”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-15-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “refresh schedule” against “cadence reflects the active application period”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-15-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “refresh schedule” against “cadence reflects the active application period”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver refresh schedule to the next dependent owner with JF-02-15-D1 and its acceptance evidence.
Before exposure, resolve new official instructions missed near deadlines for the approved scope; communicate remaining limitations.

### JF-02-15-D2 — Detect material source differences

#### Proposed delivery contract

Implementation instruction: Detect material source differences.
Reviewable artifact: Source diff records.
Acceptance criterion: Cosmetic and rule changes are distinguished.
Input dependency: Source snapshots and pack lifecycle.
Scope constraint: Human approval before changed rules apply.
Risk to control: New official instructions missed near deadlines.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Material source changes have an owner and impact assessment.
Completion record: JF-02-15-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-15-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “source diff records” against “cosmetic and rule changes are distinguished”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-15-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “source diff records” against “cosmetic and rule changes are distinguished”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-15-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “source diff records” against “cosmetic and rule changes are distinguished”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-15-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “source diff records” against “cosmetic and rule changes are distinguished”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver source diff records to the next dependent owner with JF-02-15-D2 and its acceptance evidence.
Before exposure, resolve new official instructions missed near deadlines for the approved scope; communicate remaining limitations.

### JF-02-15-D3 — Review changed obligations

#### Proposed delivery contract

Implementation instruction: Review changed obligations.
Reviewable artifact: Change adjudication.
Acceptance criterion: New conditions receive branch fixtures.
Input dependency: Source snapshots and pack lifecycle.
Scope constraint: Human approval before changed rules apply.
Risk to control: New official instructions missed near deadlines.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Material source changes have an owner and impact assessment.
Completion record: JF-02-15-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-15-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “change adjudication” against “new conditions receive branch fixtures”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-15-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “change adjudication” against “new conditions receive branch fixtures”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-15-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “change adjudication” against “new conditions receive branch fixtures”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-15-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “change adjudication” against “new conditions receive branch fixtures”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver change adjudication to the next dependent owner with JF-02-15-D3 and its acceptance evidence.
Before exposure, resolve new official instructions missed near deadlines for the approved scope; communicate remaining limitations.

### JF-02-15-D4 — Publish pack revisions

#### Proposed delivery contract

Implementation instruction: Publish pack revisions.
Reviewable artifact: Publication approval record.
Acceptance criterion: Independent approval precedes activation.
Input dependency: Source snapshots and pack lifecycle.
Scope constraint: Human approval before changed rules apply.
Risk to control: New official instructions missed near deadlines.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Material source changes have an owner and impact assessment.
Completion record: JF-02-15-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-15-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “publication approval record” against “independent approval precedes activation”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-15-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “publication approval record” against “independent approval precedes activation”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-15-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “publication approval record” against “independent approval precedes activation”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-15-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “publication approval record” against “independent approval precedes activation”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver publication approval record to the next dependent owner with JF-02-15-D4 and its acceptance evidence.
Before exposure, resolve new official instructions missed near deadlines for the approved scope; communicate remaining limitations.

### JF-02-15-D5 — Assess affected packets

#### Proposed delivery contract

Implementation instruction: Assess affected packets.
Reviewable artifact: Impact query specification.
Acceptance criterion: Impacted runs and unresolved requirements are enumerable.
Input dependency: Source snapshots and pack lifecycle.
Scope constraint: Human approval before changed rules apply.
Risk to control: New official instructions missed near deadlines.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Material source changes have an owner and impact assessment.
Completion record: JF-02-15-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-15-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “impact query specification” against “impacted runs and unresolved requirements are enumerable”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-15-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “impact query specification” against “impacted runs and unresolved requirements are enumerable”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-15-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “impact query specification” against “impacted runs and unresolved requirements are enumerable”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-15-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “impact query specification” against “impacted runs and unresolved requirements are enumerable”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver impact query specification to the next dependent owner with JF-02-15-D5 and its acceptance evidence.
Before exposure, resolve new official instructions missed near deadlines for the approved scope; communicate remaining limitations.

### JF-02-15-D6 — Notify affected applicants

#### Proposed delivery contract

Implementation instruction: Notify affected applicants.
Reviewable artifact: Change communication template.
Acceptance criterion: Users see what changed and what to review.
Input dependency: Source snapshots and pack lifecycle.
Scope constraint: Human approval before changed rules apply.
Risk to control: New official instructions missed near deadlines.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: Material source changes have an owner and impact assessment.
Completion record: JF-02-15-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-15-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “change communication template” against “users see what changed and what to review”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-15-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “change communication template” against “users see what changed and what to review”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-15-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “change communication template” against “users see what changed and what to review”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-15-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “change communication template” against “users see what changed and what to review”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-15-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver change communication template to the next dependent owner with JF-02-15-D6 and its acceptance evidence.
Before exposure, resolve new official instructions missed near deadlines for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-15 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Source snapshots and pack lifecycle.
Confirm measured evidence for: Material source changes have an owner and impact assessment.
Confirm the intended scope remains: Human approval before changed rules apply.
Confirm the owner has addressed: New official instructions missed near deadlines.
Link relevant master-plan decisions before moving JF-02-15 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-02-16 — Custom instructions and AI drafts

### Purpose and implementation decision

Outcome: Extend flexibility without claiming curated assurance.
Boundary: Draft-only custom rules and model assistance deferred until evaluated.
Accountable owner: Rules lead / document engineer.
Delivery phase: MVP.
Predecessor: Reviewed pack baseline and M02.
Primary risk: Prompt injection or hallucination becoming authoritative rules.
Workstream success measure: No unreviewed generated rule receives official-pack assurance.

### Delivery sequence

1. Confirm the inputs and constraints for custom instructions and ai drafts.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review no unreviewed generated rule receives official-pack assurance against the stated measurement cohort.
4. Resolve prompt injection or hallucination becoming authoritative rules before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-02-16-D1 — Define custom source trust

#### Proposed delivery contract

Implementation instruction: Define custom source trust.
Reviewable artifact: Custom-source classification.
Acceptance criterion: User instructions remain visibly unverified.
Input dependency: Reviewed pack baseline and M02.
Scope constraint: Draft-only custom rules and model assistance deferred until evaluated.
Risk to control: Prompt injection or hallucination becoming authoritative rules.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed generated rule receives official-pack assurance.
Completion record: JF-02-16-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-16-D1-A1 — Supported evidence

Given the required source and matching document are available, evaluate “custom-source classification” against “user instructions remain visibly unverified”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-02-16-D1-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “custom-source classification” against “user instructions remain visibly unverified”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-02-16-D1-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “custom-source classification” against “user instructions remain visibly unverified”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-02-16-D1-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “custom-source classification” against “user instructions remain visibly unverified”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D1-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver custom-source classification to the next dependent owner with JF-02-16-D1 and its acceptance evidence.
Before exposure, resolve prompt injection or hallucination becoming authoritative rules for the approved scope; communicate remaining limitations.

### JF-02-16-D2 — Define draft checklist confirmation

#### Proposed delivery contract

Implementation instruction: Define draft checklist confirmation.
Reviewable artifact: Draft confirmation flow.
Acceptance criterion: Users can inspect and amend every proposed requirement.
Input dependency: Reviewed pack baseline and M02.
Scope constraint: Draft-only custom rules and model assistance deferred until evaluated.
Risk to control: Prompt injection or hallucination becoming authoritative rules.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed generated rule receives official-pack assurance.
Completion record: JF-02-16-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-16-D2-A1 — Supported evidence

Given the required source and matching document are available, evaluate “draft confirmation flow” against “users can inspect and amend every proposed requirement”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-02-16-D2-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “draft confirmation flow” against “users can inspect and amend every proposed requirement”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-02-16-D2-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “draft confirmation flow” against “users can inspect and amend every proposed requirement”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-02-16-D2-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “draft confirmation flow” against “users can inspect and amend every proposed requirement”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D2-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver draft confirmation flow to the next dependent owner with JF-02-16-D2 and its acceptance evidence.
Before exposure, resolve prompt injection or hallucination becoming authoritative rules for the approved scope; communicate remaining limitations.

### JF-02-16-D3 — Define model-processing consent

#### Proposed delivery contract

Implementation instruction: Define model-processing consent.
Reviewable artifact: Model-use proposal.
Acceptance criterion: Purpose and permitted data scope are disclosed.
Input dependency: Reviewed pack baseline and M02.
Scope constraint: Draft-only custom rules and model assistance deferred until evaluated.
Risk to control: Prompt injection or hallucination becoming authoritative rules.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed generated rule receives official-pack assurance.
Completion record: JF-02-16-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-16-D3-A1 — Supported evidence

Given the required source and matching document are available, evaluate “model-use proposal” against “purpose and permitted data scope are disclosed”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-02-16-D3-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “model-use proposal” against “purpose and permitted data scope are disclosed”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-02-16-D3-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “model-use proposal” against “purpose and permitted data scope are disclosed”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-02-16-D3-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “model-use proposal” against “purpose and permitted data scope are disclosed”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D3-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver model-use proposal to the next dependent owner with JF-02-16-D3 and its acceptance evidence.
Before exposure, resolve prompt injection or hallucination becoming authoritative rules for the approved scope; communicate remaining limitations.

### JF-02-16-D4 — Define structured extraction limits

#### Proposed delivery contract

Implementation instruction: Define structured extraction limits.
Reviewable artifact: Draft extraction contract.
Acceptance criterion: Unsupported predicates remain plain-language review tasks.
Input dependency: Reviewed pack baseline and M02.
Scope constraint: Draft-only custom rules and model assistance deferred until evaluated.
Risk to control: Prompt injection or hallucination becoming authoritative rules.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed generated rule receives official-pack assurance.
Completion record: JF-02-16-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-16-D4-A1 — Supported evidence

Given the required source and matching document are available, evaluate “draft extraction contract” against “unsupported predicates remain plain-language review tasks”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-02-16-D4-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “draft extraction contract” against “unsupported predicates remain plain-language review tasks”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-02-16-D4-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “draft extraction contract” against “unsupported predicates remain plain-language review tasks”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-02-16-D4-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “draft extraction contract” against “unsupported predicates remain plain-language review tasks”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D4-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver draft extraction contract to the next dependent owner with JF-02-16-D4 and its acceptance evidence.
Before exposure, resolve prompt injection or hallucination becoming authoritative rules for the approved scope; communicate remaining limitations.

### JF-02-16-D5 — Define prompt-injection defenses

#### Proposed delivery contract

Implementation instruction: Define prompt-injection defenses.
Reviewable artifact: Adversarial source review.
Acceptance criterion: Source text cannot authorize tool use or change policy.
Input dependency: Reviewed pack baseline and M02.
Scope constraint: Draft-only custom rules and model assistance deferred until evaluated.
Risk to control: Prompt injection or hallucination becoming authoritative rules.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed generated rule receives official-pack assurance.
Completion record: JF-02-16-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-16-D5-A1 — Supported evidence

Given the required source and matching document are available, evaluate “adversarial source review” against “source text cannot authorize tool use or change policy”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-02-16-D5-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “adversarial source review” against “source text cannot authorize tool use or change policy”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-02-16-D5-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “adversarial source review” against “source text cannot authorize tool use or change policy”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-02-16-D5-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “adversarial source review” against “source text cannot authorize tool use or change policy”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D5-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver adversarial source review to the next dependent owner with JF-02-16-D5 and its acceptance evidence.
Before exposure, resolve prompt injection or hallucination becoming authoritative rules for the approved scope; communicate remaining limitations.

### JF-02-16-D6 — Define model promotion gates

#### Proposed delivery contract

Implementation instruction: Define model promotion gates.
Reviewable artifact: Promotion evaluation.
Acceptance criterion: Independent omission and false-pass metrics justify any automation.
Input dependency: Reviewed pack baseline and M02.
Scope constraint: Draft-only custom rules and model assistance deferred until evaluated.
Risk to control: Prompt injection or hallucination becoming authoritative rules.
Accountable role and phase: Rules lead / document engineer; MVP.
Measurement relationship: No unreviewed generated rule receives official-pack assurance.
Completion record: JF-02-16-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-02-16-D6-A1 — Supported evidence

Given the required source and matching document are available, evaluate “promotion evaluation” against “independent omission and false-pass metrics justify any automation”.
Then: Evaluate only supported predicates and attach the exact source and evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-02-16-D6-A2 — Missing evidence

Given the source, document or required profile answer is absent, evaluate “promotion evaluation” against “independent omission and false-pass metrics justify any automation”.
Then: Return missing or unknown as appropriate; never manufacture an affirmative result.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-02-16-D6-A3 — Conflicting evidence

Given two source statements or document values disagree, evaluate “promotion evaluation” against “independent omission and false-pass metrics justify any automation”.
Then: Return needs_review and preserve both competing evidence locations.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-02-16-D6-A4 — Repeat operation

Given the same accepted input is processed again, evaluate “promotion evaluation” against “independent omission and false-pass metrics justify any automation”.
Then: Preserve deterministic check outcomes and avoid duplicate evidence or user charges.
Review evidence: link the input revision, outcome and reviewer to JF-02-16-D6-A4; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver promotion evaluation to the next dependent owner with JF-02-16-D6 and its acceptance evidence.
Before exposure, resolve prompt injection or hallucination becoming authoritative rules for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-02-16 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Reviewed pack baseline and M02.
Confirm measured evidence for: No unreviewed generated rule receives official-pack assurance.
Confirm the intended scope remains: Draft-only custom rules and model assistance deferred until evaluated.
Confirm the owner has addressed: Prompt injection or hallucination becoming authoritative rules.
Link relevant master-plan decisions before moving JF-02-16 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

