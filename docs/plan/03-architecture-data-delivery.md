# Volume 03 — Architecture, data and delivery

JKY-Folder startup implementation plan • 9 October 2026 • proposed work only

Accountable role: Technical lead.
Default phase: MVP.
Volume exit gate: A secure, recoverable modular system with reproducible evaluation and bounded processing costs..

## How to use this volume

Every workstream contains six concrete deliverables and six acceptance situations for each deliverable.
The cases are specifications for later implementation or business validation; they are not executed results.
Use the stable IDs in issues, design reviews, release evidence and subsequent plan revisions.
Business validation uses research and operating records; engineering validation uses controlled fixtures and system evidence.
An owner may fulfill several roles early; accountability still requires a named person and an explicit decision record.
The task catalogue is a scope inventory, not a promise to build every workstream in the first release.
The master plan determines phase eligibility; a task inherits its workstream phase unless marked otherwise.
Capacity estimates must include discovery, review, security, failure recovery and support work.

## JF-03-01 — System boundaries

### Purpose and implementation decision

Outcome: Keep a small team able to operate the product.
Boundary: Modular monolith plus isolated workers.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Master architecture M04.
Primary risk: Premature service sprawl.
Workstream success measure: Each capability has one accountable module and explicit trust boundary.

### Delivery sequence

1. Confirm the inputs and constraints for system boundaries.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review each capability has one accountable module and explicit trust boundary against the stated measurement cohort.
4. Resolve premature service sprawl before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-01-D1 — Define module ownership

#### Proposed delivery contract

Implementation instruction: Define module ownership.
Reviewable artifact: Module map.
Acceptance criterion: Account, packet, rules, evidence and reporting boundaries are named.
Input dependency: Master architecture M04.
Scope constraint: Modular monolith plus isolated workers.
Risk to control: Premature service sprawl.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Each capability has one accountable module and explicit trust boundary.
Completion record: JF-03-01-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-01-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “module map” against “account, packet, rules, evidence and reporting boundaries are named”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-01-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “module map” against “account, packet, rules, evidence and reporting boundaries are named”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-01-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “module map” against “account, packet, rules, evidence and reporting boundaries are named”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-01-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “module map” against “account, packet, rules, evidence and reporting boundaries are named”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver module map to the next dependent owner with JF-03-01-D1 and its acceptance evidence.
Before exposure, resolve premature service sprawl for the approved scope; communicate remaining limitations.

### JF-03-01-D2 — Define synchronous boundaries

#### Proposed delivery contract

Implementation instruction: Define synchronous boundaries.
Reviewable artifact: Request-path specification.
Acceptance criterion: Long document operations leave the request path.
Input dependency: Master architecture M04.
Scope constraint: Modular monolith plus isolated workers.
Risk to control: Premature service sprawl.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Each capability has one accountable module and explicit trust boundary.
Completion record: JF-03-01-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-01-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “request-path specification” against “long document operations leave the request path”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-01-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “request-path specification” against “long document operations leave the request path”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-01-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “request-path specification” against “long document operations leave the request path”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-01-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “request-path specification” against “long document operations leave the request path”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver request-path specification to the next dependent owner with JF-03-01-D2 and its acceptance evidence.
Before exposure, resolve premature service sprawl for the approved scope; communicate remaining limitations.

### JF-03-01-D3 — Define asynchronous boundaries

#### Proposed delivery contract

Implementation instruction: Define asynchronous boundaries.
Reviewable artifact: Worker responsibility map.
Acceptance criterion: Workers cannot bypass API authorization contracts.
Input dependency: Master architecture M04.
Scope constraint: Modular monolith plus isolated workers.
Risk to control: Premature service sprawl.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Each capability has one accountable module and explicit trust boundary.
Completion record: JF-03-01-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-01-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “worker responsibility map” against “workers cannot bypass api authorization contracts”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-01-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “worker responsibility map” against “workers cannot bypass api authorization contracts”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-01-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “worker responsibility map” against “workers cannot bypass api authorization contracts”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-01-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “worker responsibility map” against “workers cannot bypass api authorization contracts”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver worker responsibility map to the next dependent owner with JF-03-01-D3 and its acceptance evidence.
Before exposure, resolve premature service sprawl for the approved scope; communicate remaining limitations.

### JF-03-01-D4 — Define internal contracts

#### Proposed delivery contract

Implementation instruction: Define internal contracts.
Reviewable artifact: Module interface register.
Acceptance criterion: Inputs, outputs and errors are versioned.
Input dependency: Master architecture M04.
Scope constraint: Modular monolith plus isolated workers.
Risk to control: Premature service sprawl.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Each capability has one accountable module and explicit trust boundary.
Completion record: JF-03-01-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-01-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “module interface register” against “inputs, outputs and errors are versioned”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-01-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “module interface register” against “inputs, outputs and errors are versioned”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-01-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “module interface register” against “inputs, outputs and errors are versioned”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-01-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “module interface register” against “inputs, outputs and errors are versioned”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver module interface register to the next dependent owner with JF-03-01-D4 and its acceptance evidence.
Before exposure, resolve premature service sprawl for the approved scope; communicate remaining limitations.

### JF-03-01-D5 — Define deployment topology

#### Proposed delivery contract

Implementation instruction: Define deployment topology.
Reviewable artifact: Deployment architecture record.
Acceptance criterion: Public, private and worker zones are explicit.
Input dependency: Master architecture M04.
Scope constraint: Modular monolith plus isolated workers.
Risk to control: Premature service sprawl.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Each capability has one accountable module and explicit trust boundary.
Completion record: JF-03-01-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-01-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “deployment architecture record” against “public, private and worker zones are explicit”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-01-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “deployment architecture record” against “public, private and worker zones are explicit”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-01-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “deployment architecture record” against “public, private and worker zones are explicit”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-01-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “deployment architecture record” against “public, private and worker zones are explicit”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver deployment architecture record to the next dependent owner with JF-03-01-D5 and its acceptance evidence.
Before exposure, resolve premature service sprawl for the approved scope; communicate remaining limitations.

### JF-03-01-D6 — Approve architecture tradeoffs

#### Proposed delivery contract

Implementation instruction: Approve architecture tradeoffs.
Reviewable artifact: Architecture decision record.
Acceptance criterion: Complexity is justified by an observed requirement.
Input dependency: Master architecture M04.
Scope constraint: Modular monolith plus isolated workers.
Risk to control: Premature service sprawl.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Each capability has one accountable module and explicit trust boundary.
Completion record: JF-03-01-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-01-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “architecture decision record” against “complexity is justified by an observed requirement”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-01-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “architecture decision record” against “complexity is justified by an observed requirement”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-01-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “architecture decision record” against “complexity is justified by an observed requirement”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-01-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “architecture decision record” against “complexity is justified by an observed requirement”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-01-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver architecture decision record to the next dependent owner with JF-03-01-D6 and its acceptance evidence.
Before exposure, resolve premature service sprawl for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-01 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Master architecture M04.
Confirm measured evidence for: Each capability has one accountable module and explicit trust boundary.
Confirm the intended scope remains: Modular monolith plus isolated workers.
Confirm the owner has addressed: Premature service sprawl.
Link relevant master-plan decisions before moving JF-03-01 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-02 — Account and session access

### Purpose and implementation decision

Outcome: Provide recoverable authenticated access.
Boundary: Managed identity preferred after supplier review.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: M12 pilot age boundary and privacy design.
Primary risk: Account recovery exposing document access.
Workstream success measure: Session invalidation and recovery pass cross-device review.

### Delivery sequence

1. Confirm the inputs and constraints for account and session access.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review session invalidation and recovery pass cross-device review against the stated measurement cohort.
4. Resolve account recovery exposing document access before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-02-D1 — Define authentication options

#### Proposed delivery contract

Implementation instruction: Define authentication options.
Reviewable artifact: Authentication decision.
Acceptance criterion: Login methods fit the pilot users and support capacity.
Input dependency: M12 pilot age boundary and privacy design.
Scope constraint: Managed identity preferred after supplier review.
Risk to control: Account recovery exposing document access.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Session invalidation and recovery pass cross-device review.
Completion record: JF-03-02-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-02-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “authentication decision” against “login methods fit the pilot users and support capacity”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-02-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “authentication decision” against “login methods fit the pilot users and support capacity”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-02-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “authentication decision” against “login methods fit the pilot users and support capacity”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-02-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “authentication decision” against “login methods fit the pilot users and support capacity”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver authentication decision to the next dependent owner with JF-03-02-D1 and its acceptance evidence.
Before exposure, resolve account recovery exposing document access for the approved scope; communicate remaining limitations.

### JF-03-02-D2 — Define session lifecycle

#### Proposed delivery contract

Implementation instruction: Define session lifecycle.
Reviewable artifact: Session contract.
Acceptance criterion: Expiry, rotation and logout are explicit.
Input dependency: M12 pilot age boundary and privacy design.
Scope constraint: Managed identity preferred after supplier review.
Risk to control: Account recovery exposing document access.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Session invalidation and recovery pass cross-device review.
Completion record: JF-03-02-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-02-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “session contract” against “expiry, rotation and logout are explicit”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-02-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “session contract” against “expiry, rotation and logout are explicit”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-02-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “session contract” against “expiry, rotation and logout are explicit”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-02-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “session contract” against “expiry, rotation and logout are explicit”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver session contract to the next dependent owner with JF-03-02-D2 and its acceptance evidence.
Before exposure, resolve account recovery exposing document access for the approved scope; communicate remaining limitations.

### JF-03-02-D3 — Define recovery protections

#### Proposed delivery contract

Implementation instruction: Define recovery protections.
Reviewable artifact: Account recovery design.
Acceptance criterion: Recovery cannot bypass ownership verification.
Input dependency: M12 pilot age boundary and privacy design.
Scope constraint: Managed identity preferred after supplier review.
Risk to control: Account recovery exposing document access.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Session invalidation and recovery pass cross-device review.
Completion record: JF-03-02-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-02-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “account recovery design” against “recovery cannot bypass ownership verification”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-02-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “account recovery design” against “recovery cannot bypass ownership verification”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-02-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “account recovery design” against “recovery cannot bypass ownership verification”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-02-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “account recovery design” against “recovery cannot bypass ownership verification”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver account recovery design to the next dependent owner with JF-03-02-D3 and its acceptance evidence.
Before exposure, resolve account recovery exposing document access for the approved scope; communicate remaining limitations.

### JF-03-02-D4 — Define email change behavior

#### Proposed delivery contract

Implementation instruction: Define email change behavior.
Reviewable artifact: Account-change workflow.
Acceptance criterion: Old sessions and notices follow the approved policy.
Input dependency: M12 pilot age boundary and privacy design.
Scope constraint: Managed identity preferred after supplier review.
Risk to control: Account recovery exposing document access.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Session invalidation and recovery pass cross-device review.
Completion record: JF-03-02-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-02-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “account-change workflow” against “old sessions and notices follow the approved policy”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-02-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “account-change workflow” against “old sessions and notices follow the approved policy”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-02-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “account-change workflow” against “old sessions and notices follow the approved policy”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-02-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “account-change workflow” against “old sessions and notices follow the approved policy”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver account-change workflow to the next dependent owner with JF-03-02-D4 and its acceptance evidence.
Before exposure, resolve account recovery exposing document access for the approved scope; communicate remaining limitations.

### JF-03-02-D5 — Define privileged authentication

#### Proposed delivery contract

Implementation instruction: Define privileged authentication.
Reviewable artifact: Admin authentication policy.
Acceptance criterion: Privileged roles have stronger reviewed controls.
Input dependency: M12 pilot age boundary and privacy design.
Scope constraint: Managed identity preferred after supplier review.
Risk to control: Account recovery exposing document access.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Session invalidation and recovery pass cross-device review.
Completion record: JF-03-02-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-02-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “admin authentication policy” against “privileged roles have stronger reviewed controls”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-02-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “admin authentication policy” against “privileged roles have stronger reviewed controls”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-02-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “admin authentication policy” against “privileged roles have stronger reviewed controls”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-02-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “admin authentication policy” against “privileged roles have stronger reviewed controls”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver admin authentication policy to the next dependent owner with JF-03-02-D5 and its acceptance evidence.
Before exposure, resolve account recovery exposing document access for the approved scope; communicate remaining limitations.

### JF-03-02-D6 — Define account termination

#### Proposed delivery contract

Implementation instruction: Define account termination.
Reviewable artifact: Termination contract.
Acceptance criterion: Document deletion and billing state remain consistent.
Input dependency: M12 pilot age boundary and privacy design.
Scope constraint: Managed identity preferred after supplier review.
Risk to control: Account recovery exposing document access.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Session invalidation and recovery pass cross-device review.
Completion record: JF-03-02-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-02-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “termination contract” against “document deletion and billing state remain consistent”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-02-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “termination contract” against “document deletion and billing state remain consistent”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-02-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “termination contract” against “document deletion and billing state remain consistent”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-02-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “termination contract” against “document deletion and billing state remain consistent”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-02-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver termination contract to the next dependent owner with JF-03-02-D6 and its acceptance evidence.
Before exposure, resolve account recovery exposing document access for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-02 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: M12 pilot age boundary and privacy design.
Confirm measured evidence for: Session invalidation and recovery pass cross-device review.
Confirm the intended scope remains: Managed identity preferred after supplier review.
Confirm the owner has addressed: Account recovery exposing document access.
Link relevant master-plan decisions before moving JF-03-02 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-03 — Tenant and permission model

### Purpose and implementation decision

Outcome: Enforce packet ownership across every access path.
Boundary: Single-user pilot with future tenant-aware schema.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Core entity contracts and threat model.
Primary risk: Cross-tenant evidence or object leakage.
Workstream success measure: Every tenant-sensitive query and operation has denied-access coverage.

### Delivery sequence

1. Confirm the inputs and constraints for tenant and permission model.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review every tenant-sensitive query and operation has denied-access coverage against the stated measurement cohort.
4. Resolve cross-tenant evidence or object leakage before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-03-D1 — Define workspace identity

#### Proposed delivery contract

Implementation instruction: Define workspace identity.
Reviewable artifact: Workspace identity schema.
Acceptance criterion: All scoped entities identify their workspace.
Input dependency: Core entity contracts and threat model.
Scope constraint: Single-user pilot with future tenant-aware schema.
Risk to control: Cross-tenant evidence or object leakage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every tenant-sensitive query and operation has denied-access coverage.
Completion record: JF-03-03-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-03-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “workspace identity schema” against “all scoped entities identify their workspace”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-03-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “workspace identity schema” against “all scoped entities identify their workspace”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-03-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “workspace identity schema” against “all scoped entities identify their workspace”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-03-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “workspace identity schema” against “all scoped entities identify their workspace”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver workspace identity schema to the next dependent owner with JF-03-03-D1 and its acceptance evidence.
Before exposure, resolve cross-tenant evidence or object leakage for the approved scope; communicate remaining limitations.

### JF-03-03-D2 — Define applicant roles

#### Proposed delivery contract

Implementation instruction: Define applicant roles.
Reviewable artifact: Role permission matrix.
Acceptance criterion: Read, edit, review and export permissions differ.
Input dependency: Core entity contracts and threat model.
Scope constraint: Single-user pilot with future tenant-aware schema.
Risk to control: Cross-tenant evidence or object leakage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every tenant-sensitive query and operation has denied-access coverage.
Completion record: JF-03-03-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-03-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “role permission matrix” against “read, edit, review and export permissions differ”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-03-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “role permission matrix” against “read, edit, review and export permissions differ”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-03-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “role permission matrix” against “read, edit, review and export permissions differ”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-03-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “role permission matrix” against “read, edit, review and export permissions differ”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver role permission matrix to the next dependent owner with JF-03-03-D2 and its acceptance evidence.
Before exposure, resolve cross-tenant evidence or object leakage for the approved scope; communicate remaining limitations.

### JF-03-03-D3 — Define grant checks

#### Proposed delivery contract

Implementation instruction: Define grant checks.
Reviewable artifact: Authorization contract.
Acceptance criterion: Permission is verified on every protected operation.
Input dependency: Core entity contracts and threat model.
Scope constraint: Single-user pilot with future tenant-aware schema.
Risk to control: Cross-tenant evidence or object leakage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every tenant-sensitive query and operation has denied-access coverage.
Completion record: JF-03-03-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-03-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “authorization contract” against “permission is verified on every protected operation”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-03-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “authorization contract” against “permission is verified on every protected operation”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-03-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “authorization contract” against “permission is verified on every protected operation”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-03-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “authorization contract” against “permission is verified on every protected operation”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver authorization contract to the next dependent owner with JF-03-03-D3 and its acceptance evidence.
Before exposure, resolve cross-tenant evidence or object leakage for the approved scope; communicate remaining limitations.

### JF-03-03-D4 — Define worker scope

#### Proposed delivery contract

Implementation instruction: Define worker scope.
Reviewable artifact: Worker authorization envelope.
Acceptance criterion: Jobs carry bounded tenant and object scope.
Input dependency: Core entity contracts and threat model.
Scope constraint: Single-user pilot with future tenant-aware schema.
Risk to control: Cross-tenant evidence or object leakage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every tenant-sensitive query and operation has denied-access coverage.
Completion record: JF-03-03-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-03-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “worker authorization envelope” against “jobs carry bounded tenant and object scope”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-03-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “worker authorization envelope” against “jobs carry bounded tenant and object scope”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-03-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “worker authorization envelope” against “jobs carry bounded tenant and object scope”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-03-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “worker authorization envelope” against “jobs carry bounded tenant and object scope”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver worker authorization envelope to the next dependent owner with JF-03-03-D4 and its acceptance evidence.
Before exposure, resolve cross-tenant evidence or object leakage for the approved scope; communicate remaining limitations.

### JF-03-03-D5 — Define cache isolation

#### Proposed delivery contract

Implementation instruction: Define cache isolation.
Reviewable artifact: Cache-key contract.
Acceptance criterion: Tenant and revision scope prevent cross-user reuse.
Input dependency: Core entity contracts and threat model.
Scope constraint: Single-user pilot with future tenant-aware schema.
Risk to control: Cross-tenant evidence or object leakage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every tenant-sensitive query and operation has denied-access coverage.
Completion record: JF-03-03-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-03-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “cache-key contract” against “tenant and revision scope prevent cross-user reuse”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-03-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “cache-key contract” against “tenant and revision scope prevent cross-user reuse”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-03-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “cache-key contract” against “tenant and revision scope prevent cross-user reuse”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-03-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “cache-key contract” against “tenant and revision scope prevent cross-user reuse”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver cache-key contract to the next dependent owner with JF-03-03-D5 and its acceptance evidence.
Before exposure, resolve cross-tenant evidence or object leakage for the approved scope; communicate remaining limitations.

### JF-03-03-D6 — Define revocation behavior

#### Proposed delivery contract

Implementation instruction: Define revocation behavior.
Reviewable artifact: Revocation sequence.
Acceptance criterion: Revoked access does not survive previews or exports.
Input dependency: Core entity contracts and threat model.
Scope constraint: Single-user pilot with future tenant-aware schema.
Risk to control: Cross-tenant evidence or object leakage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every tenant-sensitive query and operation has denied-access coverage.
Completion record: JF-03-03-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-03-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “revocation sequence” against “revoked access does not survive previews or exports”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-03-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “revocation sequence” against “revoked access does not survive previews or exports”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-03-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “revocation sequence” against “revoked access does not survive previews or exports”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-03-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “revocation sequence” against “revoked access does not survive previews or exports”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-03-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver revocation sequence to the next dependent owner with JF-03-03-D6 and its acceptance evidence.
Before exposure, resolve cross-tenant evidence or object leakage for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-03 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Core entity contracts and threat model.
Confirm measured evidence for: Every tenant-sensitive query and operation has denied-access coverage.
Confirm the intended scope remains: Single-user pilot with future tenant-aware schema.
Confirm the owner has addressed: Cross-tenant evidence or object leakage.
Link relevant master-plan decisions before moving JF-03-03 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-04 — Relational persistence

### Purpose and implementation decision

Outcome: Keep revisions and dependencies consistent.
Boundary: PostgreSQL is a provisional choice, not a pinned version.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Entity model and system boundaries.
Primary risk: Partial writes creating misleading reports.
Workstream success measure: Transaction boundaries prevent orphaned current evaluation references.

### Delivery sequence

1. Confirm the inputs and constraints for relational persistence.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review transaction boundaries prevent orphaned current evaluation references against the stated measurement cohort.
4. Resolve partial writes creating misleading reports before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-04-D1 — Define entity constraints

#### Proposed delivery contract

Implementation instruction: Define entity constraints.
Reviewable artifact: Relational schema specification.
Acceptance criterion: Required relationships and uniqueness are explicit.
Input dependency: Entity model and system boundaries.
Scope constraint: PostgreSQL is a provisional choice, not a pinned version.
Risk to control: Partial writes creating misleading reports.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Transaction boundaries prevent orphaned current evaluation references.
Completion record: JF-03-04-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-04-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “relational schema specification” against “required relationships and uniqueness are explicit”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-04-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “relational schema specification” against “required relationships and uniqueness are explicit”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-04-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “relational schema specification” against “required relationships and uniqueness are explicit”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-04-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “relational schema specification” against “required relationships and uniqueness are explicit”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver relational schema specification to the next dependent owner with JF-03-04-D1 and its acceptance evidence.
Before exposure, resolve partial writes creating misleading reports for the approved scope; communicate remaining limitations.

### JF-03-04-D2 — Define revision strategy

#### Proposed delivery contract

Implementation instruction: Define revision strategy.
Reviewable artifact: Revision persistence contract.
Acceptance criterion: Immutable evidence versions cannot be edited in place.
Input dependency: Entity model and system boundaries.
Scope constraint: PostgreSQL is a provisional choice, not a pinned version.
Risk to control: Partial writes creating misleading reports.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Transaction boundaries prevent orphaned current evaluation references.
Completion record: JF-03-04-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-04-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “revision persistence contract” against “immutable evidence versions cannot be edited in place”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-04-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “revision persistence contract” against “immutable evidence versions cannot be edited in place”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-04-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “revision persistence contract” against “immutable evidence versions cannot be edited in place”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-04-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “revision persistence contract” against “immutable evidence versions cannot be edited in place”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver revision persistence contract to the next dependent owner with JF-03-04-D2 and its acceptance evidence.
Before exposure, resolve partial writes creating misleading reports for the approved scope; communicate remaining limitations.

### JF-03-04-D3 — Define transaction boundaries

#### Proposed delivery contract

Implementation instruction: Define transaction boundaries.
Reviewable artifact: Transaction inventory.
Acceptance criterion: Run publication and state updates are atomic.
Input dependency: Entity model and system boundaries.
Scope constraint: PostgreSQL is a provisional choice, not a pinned version.
Risk to control: Partial writes creating misleading reports.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Transaction boundaries prevent orphaned current evaluation references.
Completion record: JF-03-04-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-04-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “transaction inventory” against “run publication and state updates are atomic”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-04-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “transaction inventory” against “run publication and state updates are atomic”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-04-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “transaction inventory” against “run publication and state updates are atomic”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-04-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “transaction inventory” against “run publication and state updates are atomic”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver transaction inventory to the next dependent owner with JF-03-04-D3 and its acceptance evidence.
Before exposure, resolve partial writes creating misleading reports for the approved scope; communicate remaining limitations.

### JF-03-04-D4 — Define migration discipline

#### Proposed delivery contract

Implementation instruction: Define migration discipline.
Reviewable artifact: Migration procedure.
Acceptance criterion: Backfill and rollback risks are documented.
Input dependency: Entity model and system boundaries.
Scope constraint: PostgreSQL is a provisional choice, not a pinned version.
Risk to control: Partial writes creating misleading reports.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Transaction boundaries prevent orphaned current evaluation references.
Completion record: JF-03-04-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-04-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “migration procedure” against “backfill and rollback risks are documented”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-04-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “migration procedure” against “backfill and rollback risks are documented”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-04-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “migration procedure” against “backfill and rollback risks are documented”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-04-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “migration procedure” against “backfill and rollback risks are documented”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver migration procedure to the next dependent owner with JF-03-04-D4 and its acceptance evidence.
Before exposure, resolve partial writes creating misleading reports for the approved scope; communicate remaining limitations.

### JF-03-04-D5 — Define tenant query constraints

#### Proposed delivery contract

Implementation instruction: Define tenant query constraints.
Reviewable artifact: Query review rules.
Acceptance criterion: Ownership constraints apply to joins and aggregates.
Input dependency: Entity model and system boundaries.
Scope constraint: PostgreSQL is a provisional choice, not a pinned version.
Risk to control: Partial writes creating misleading reports.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Transaction boundaries prevent orphaned current evaluation references.
Completion record: JF-03-04-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-04-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “query review rules” against “ownership constraints apply to joins and aggregates”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-04-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “query review rules” against “ownership constraints apply to joins and aggregates”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-04-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “query review rules” against “ownership constraints apply to joins and aggregates”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-04-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “query review rules” against “ownership constraints apply to joins and aggregates”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver query review rules to the next dependent owner with JF-03-04-D5 and its acceptance evidence.
Before exposure, resolve partial writes creating misleading reports for the approved scope; communicate remaining limitations.

### JF-03-04-D6 — Define retention partitions

#### Proposed delivery contract

Implementation instruction: Define retention partitions.
Reviewable artifact: Data lifecycle map.
Acceptance criterion: Purpose and deletion classes govern persistence.
Input dependency: Entity model and system boundaries.
Scope constraint: PostgreSQL is a provisional choice, not a pinned version.
Risk to control: Partial writes creating misleading reports.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Transaction boundaries prevent orphaned current evaluation references.
Completion record: JF-03-04-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-04-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “data lifecycle map” against “purpose and deletion classes govern persistence”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-04-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “data lifecycle map” against “purpose and deletion classes govern persistence”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-04-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “data lifecycle map” against “purpose and deletion classes govern persistence”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-04-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “data lifecycle map” against “purpose and deletion classes govern persistence”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-04-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver data lifecycle map to the next dependent owner with JF-03-04-D6 and its acceptance evidence.
Before exposure, resolve partial writes creating misleading reports for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-04 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Entity model and system boundaries.
Confirm measured evidence for: Transaction boundaries prevent orphaned current evaluation references.
Confirm the intended scope remains: PostgreSQL is a provisional choice, not a pinned version.
Confirm the owner has addressed: Partial writes creating misleading reports.
Link relevant master-plan decisions before moving JF-03-04 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-05 — Private object storage

### Purpose and implementation decision

Outcome: Store evidence without public document URLs.
Boundary: Private managed object storage and short-lived scoped access.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Safe intake and permission model.
Primary risk: Permanent URLs exposing originals.
Workstream success measure: Every object read has explicit authorization and expiry.

### Delivery sequence

1. Confirm the inputs and constraints for private object storage.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review every object read has explicit authorization and expiry against the stated measurement cohort.
4. Resolve permanent urls exposing originals before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-05-D1 — Define object key scheme

#### Proposed delivery contract

Implementation instruction: Define object key scheme.
Reviewable artifact: Object identity contract.
Acceptance criterion: Keys use non-sensitive opaque identifiers.
Input dependency: Safe intake and permission model.
Scope constraint: Private managed object storage and short-lived scoped access.
Risk to control: Permanent URLs exposing originals.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every object read has explicit authorization and expiry.
Completion record: JF-03-05-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-05-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “object identity contract” against “keys use non-sensitive opaque identifiers”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-05-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “object identity contract” against “keys use non-sensitive opaque identifiers”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-05-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “object identity contract” against “keys use non-sensitive opaque identifiers”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-05-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “object identity contract” against “keys use non-sensitive opaque identifiers”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver object identity contract to the next dependent owner with JF-03-05-D1 and its acceptance evidence.
Before exposure, resolve permanent urls exposing originals for the approved scope; communicate remaining limitations.

### JF-03-05-D2 — Define upload grants

#### Proposed delivery contract

Implementation instruction: Define upload grants.
Reviewable artifact: Upload grant specification.
Acceptance criterion: Size, object and operation scope are bounded.
Input dependency: Safe intake and permission model.
Scope constraint: Private managed object storage and short-lived scoped access.
Risk to control: Permanent URLs exposing originals.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every object read has explicit authorization and expiry.
Completion record: JF-03-05-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-05-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “upload grant specification” against “size, object and operation scope are bounded”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-05-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “upload grant specification” against “size, object and operation scope are bounded”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-05-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “upload grant specification” against “size, object and operation scope are bounded”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-05-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “upload grant specification” against “size, object and operation scope are bounded”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver upload grant specification to the next dependent owner with JF-03-05-D2 and its acceptance evidence.
Before exposure, resolve permanent urls exposing originals for the approved scope; communicate remaining limitations.

### JF-03-05-D3 — Define download grants

#### Proposed delivery contract

Implementation instruction: Define download grants.
Reviewable artifact: Download grant specification.
Acceptance criterion: Access is short-lived and rechecked at grant creation.
Input dependency: Safe intake and permission model.
Scope constraint: Private managed object storage and short-lived scoped access.
Risk to control: Permanent URLs exposing originals.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every object read has explicit authorization and expiry.
Completion record: JF-03-05-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-05-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “download grant specification” against “access is short-lived and rechecked at grant creation”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-05-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “download grant specification” against “access is short-lived and rechecked at grant creation”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-05-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “download grant specification” against “access is short-lived and rechecked at grant creation”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-05-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “download grant specification” against “access is short-lived and rechecked at grant creation”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver download grant specification to the next dependent owner with JF-03-05-D3 and its acceptance evidence.
Before exposure, resolve permanent urls exposing originals for the approved scope; communicate remaining limitations.

### JF-03-05-D4 — Define object encryption

#### Proposed delivery contract

Implementation instruction: Define object encryption.
Reviewable artifact: Encryption configuration brief.
Acceptance criterion: Key ownership and rotation are documented.
Input dependency: Safe intake and permission model.
Scope constraint: Private managed object storage and short-lived scoped access.
Risk to control: Permanent URLs exposing originals.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every object read has explicit authorization and expiry.
Completion record: JF-03-05-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-05-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “encryption configuration brief” against “key ownership and rotation are documented”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-05-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “encryption configuration brief” against “key ownership and rotation are documented”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-05-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “encryption configuration brief” against “key ownership and rotation are documented”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-05-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “encryption configuration brief” against “key ownership and rotation are documented”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver encryption configuration brief to the next dependent owner with JF-03-05-D4 and its acceptance evidence.
Before exposure, resolve permanent urls exposing originals for the approved scope; communicate remaining limitations.

### JF-03-05-D5 — Define object lifecycle

#### Proposed delivery contract

Implementation instruction: Define object lifecycle.
Reviewable artifact: Storage lifecycle policy.
Acceptance criterion: Originals and derivatives follow purpose-specific retention.
Input dependency: Safe intake and permission model.
Scope constraint: Private managed object storage and short-lived scoped access.
Risk to control: Permanent URLs exposing originals.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every object read has explicit authorization and expiry.
Completion record: JF-03-05-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-05-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “storage lifecycle policy” against “originals and derivatives follow purpose-specific retention”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-05-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “storage lifecycle policy” against “originals and derivatives follow purpose-specific retention”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-05-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “storage lifecycle policy” against “originals and derivatives follow purpose-specific retention”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-05-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “storage lifecycle policy” against “originals and derivatives follow purpose-specific retention”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver storage lifecycle policy to the next dependent owner with JF-03-05-D5 and its acceptance evidence.
Before exposure, resolve permanent urls exposing originals for the approved scope; communicate remaining limitations.

### JF-03-05-D6 — Define metadata reconciliation

#### Proposed delivery contract

Implementation instruction: Define metadata reconciliation.
Reviewable artifact: Object consistency procedure.
Acceptance criterion: Missing objects and orphaned metadata are detected.
Input dependency: Safe intake and permission model.
Scope constraint: Private managed object storage and short-lived scoped access.
Risk to control: Permanent URLs exposing originals.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every object read has explicit authorization and expiry.
Completion record: JF-03-05-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-05-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “object consistency procedure” against “missing objects and orphaned metadata are detected”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-05-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “object consistency procedure” against “missing objects and orphaned metadata are detected”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-05-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “object consistency procedure” against “missing objects and orphaned metadata are detected”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-05-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “object consistency procedure” against “missing objects and orphaned metadata are detected”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-05-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver object consistency procedure to the next dependent owner with JF-03-05-D6 and its acceptance evidence.
Before exposure, resolve permanent urls exposing originals for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-05 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Safe intake and permission model.
Confirm measured evidence for: Every object read has explicit authorization and expiry.
Confirm the intended scope remains: Private managed object storage and short-lived scoped access.
Confirm the owner has addressed: Permanent URLs exposing originals.
Link relevant master-plan decisions before moving JF-03-05 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-06 — Durable jobs and retries

### Purpose and implementation decision

Outcome: Process documents reliably under duplicate delivery.
Boundary: At-least-once queue with idempotent consumers.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Upload sessions and transaction boundaries.
Primary risk: Duplicate processing and duplicate billing.
Workstream success measure: A repeated accepted job has one durable business effect.

### Delivery sequence

1. Confirm the inputs and constraints for durable jobs and retries.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review a repeated accepted job has one durable business effect against the stated measurement cohort.
4. Resolve duplicate processing and duplicate billing before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-06-D1 — Define job envelope

#### Proposed delivery contract

Implementation instruction: Define job envelope.
Reviewable artifact: Job schema.
Acceptance criterion: Tenant, input revisions and operation ID are present.
Input dependency: Upload sessions and transaction boundaries.
Scope constraint: At-least-once queue with idempotent consumers.
Risk to control: Duplicate processing and duplicate billing.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A repeated accepted job has one durable business effect.
Completion record: JF-03-06-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-06-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “job schema” against “tenant, input revisions and operation id are present”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-06-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “job schema” against “tenant, input revisions and operation id are present”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-06-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “job schema” against “tenant, input revisions and operation id are present”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-06-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “job schema” against “tenant, input revisions and operation id are present”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver job schema to the next dependent owner with JF-03-06-D1 and its acceptance evidence.
Before exposure, resolve duplicate processing and duplicate billing for the approved scope; communicate remaining limitations.

### JF-03-06-D2 — Define enqueue consistency

#### Proposed delivery contract

Implementation instruction: Define enqueue consistency.
Reviewable artifact: Outbox transaction contract.
Acceptance criterion: Committed work cannot disappear between database and queue.
Input dependency: Upload sessions and transaction boundaries.
Scope constraint: At-least-once queue with idempotent consumers.
Risk to control: Duplicate processing and duplicate billing.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A repeated accepted job has one durable business effect.
Completion record: JF-03-06-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-06-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “outbox transaction contract” against “committed work cannot disappear between database and queue”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-06-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “outbox transaction contract” against “committed work cannot disappear between database and queue”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-06-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “outbox transaction contract” against “committed work cannot disappear between database and queue”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-06-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “outbox transaction contract” against “committed work cannot disappear between database and queue”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver outbox transaction contract to the next dependent owner with JF-03-06-D2 and its acceptance evidence.
Before exposure, resolve duplicate processing and duplicate billing for the approved scope; communicate remaining limitations.

### JF-03-06-D3 — Define idempotency keys

#### Proposed delivery contract

Implementation instruction: Define idempotency keys.
Reviewable artifact: Idempotency policy.
Acceptance criterion: Keys identify operations rather than arbitrary request timestamps.
Input dependency: Upload sessions and transaction boundaries.
Scope constraint: At-least-once queue with idempotent consumers.
Risk to control: Duplicate processing and duplicate billing.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A repeated accepted job has one durable business effect.
Completion record: JF-03-06-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-06-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “idempotency policy” against “keys identify operations rather than arbitrary request timestamps”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-06-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “idempotency policy” against “keys identify operations rather than arbitrary request timestamps”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-06-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “idempotency policy” against “keys identify operations rather than arbitrary request timestamps”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-06-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “idempotency policy” against “keys identify operations rather than arbitrary request timestamps”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver idempotency policy to the next dependent owner with JF-03-06-D3 and its acceptance evidence.
Before exposure, resolve duplicate processing and duplicate billing for the approved scope; communicate remaining limitations.

### JF-03-06-D4 — Define retry classes

#### Proposed delivery contract

Implementation instruction: Define retry classes.
Reviewable artifact: Retry policy.
Acceptance criterion: Transient and permanent errors have different paths.
Input dependency: Upload sessions and transaction boundaries.
Scope constraint: At-least-once queue with idempotent consumers.
Risk to control: Duplicate processing and duplicate billing.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A repeated accepted job has one durable business effect.
Completion record: JF-03-06-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-06-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “retry policy” against “transient and permanent errors have different paths”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-06-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “retry policy” against “transient and permanent errors have different paths”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-06-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “retry policy” against “transient and permanent errors have different paths”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-06-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “retry policy” against “transient and permanent errors have different paths”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver retry policy to the next dependent owner with JF-03-06-D4 and its acceptance evidence.
Before exposure, resolve duplicate processing and duplicate billing for the approved scope; communicate remaining limitations.

### JF-03-06-D5 — Define poison-job handling

#### Proposed delivery contract

Implementation instruction: Define poison-job handling.
Reviewable artifact: Dead-letter workflow.
Acceptance criterion: Operators can inspect redacted failure context.
Input dependency: Upload sessions and transaction boundaries.
Scope constraint: At-least-once queue with idempotent consumers.
Risk to control: Duplicate processing and duplicate billing.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A repeated accepted job has one durable business effect.
Completion record: JF-03-06-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-06-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “dead-letter workflow” against “operators can inspect redacted failure context”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-06-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “dead-letter workflow” against “operators can inspect redacted failure context”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-06-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “dead-letter workflow” against “operators can inspect redacted failure context”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-06-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “dead-letter workflow” against “operators can inspect redacted failure context”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver dead-letter workflow to the next dependent owner with JF-03-06-D5 and its acceptance evidence.
Before exposure, resolve duplicate processing and duplicate billing for the approved scope; communicate remaining limitations.

### JF-03-06-D6 — Define cancellation checks

#### Proposed delivery contract

Implementation instruction: Define cancellation checks.
Reviewable artifact: Cancellation behavior.
Acceptance criterion: Workers honor deletion and cancelled packet states.
Input dependency: Upload sessions and transaction boundaries.
Scope constraint: At-least-once queue with idempotent consumers.
Risk to control: Duplicate processing and duplicate billing.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A repeated accepted job has one durable business effect.
Completion record: JF-03-06-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-06-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “cancellation behavior” against “workers honor deletion and cancelled packet states”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-06-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “cancellation behavior” against “workers honor deletion and cancelled packet states”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-06-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “cancellation behavior” against “workers honor deletion and cancelled packet states”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-06-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “cancellation behavior” against “workers honor deletion and cancelled packet states”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-06-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver cancellation behavior to the next dependent owner with JF-03-06-D6 and its acceptance evidence.
Before exposure, resolve duplicate processing and duplicate billing for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-06 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Upload sessions and transaction boundaries.
Confirm measured evidence for: A repeated accepted job has one durable business effect.
Confirm the intended scope remains: At-least-once queue with idempotent consumers.
Confirm the owner has addressed: Duplicate processing and duplicate billing.
Link relevant master-plan decisions before moving JF-03-06 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-07 — Worker isolation

### Purpose and implementation decision

Outcome: Bound untrusted document processing.
Boundary: Restricted network and resource-limited execution.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Quarantine and job envelopes.
Primary risk: Parser exploits accessing secrets or other documents.
Workstream success measure: A hostile fixture cannot exceed approved resource or network scope.

### Delivery sequence

1. Confirm the inputs and constraints for worker isolation.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review a hostile fixture cannot exceed approved resource or network scope against the stated measurement cohort.
4. Resolve parser exploits accessing secrets or other documents before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-07-D1 — Define process isolation

#### Proposed delivery contract

Implementation instruction: Define process isolation.
Reviewable artifact: Isolation decision.
Acceptance criterion: Parser execution is separated from privileged API processes.
Input dependency: Quarantine and job envelopes.
Scope constraint: Restricted network and resource-limited execution.
Risk to control: Parser exploits accessing secrets or other documents.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A hostile fixture cannot exceed approved resource or network scope.
Completion record: JF-03-07-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-07-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “isolation decision” against “parser execution is separated from privileged api processes”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-07-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “isolation decision” against “parser execution is separated from privileged api processes”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-07-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “isolation decision” against “parser execution is separated from privileged api processes”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-07-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “isolation decision” against “parser execution is separated from privileged api processes”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver isolation decision to the next dependent owner with JF-03-07-D1 and its acceptance evidence.
Before exposure, resolve parser exploits accessing secrets or other documents for the approved scope; communicate remaining limitations.

### JF-03-07-D2 — Define resource budgets

#### Proposed delivery contract

Implementation instruction: Define resource budgets.
Reviewable artifact: Worker limit specification.
Acceptance criterion: Memory, CPU, time and page limits are explicit.
Input dependency: Quarantine and job envelopes.
Scope constraint: Restricted network and resource-limited execution.
Risk to control: Parser exploits accessing secrets or other documents.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A hostile fixture cannot exceed approved resource or network scope.
Completion record: JF-03-07-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-07-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “worker limit specification” against “memory, cpu, time and page limits are explicit”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-07-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “worker limit specification” against “memory, cpu, time and page limits are explicit”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-07-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “worker limit specification” against “memory, cpu, time and page limits are explicit”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-07-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “worker limit specification” against “memory, cpu, time and page limits are explicit”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver worker limit specification to the next dependent owner with JF-03-07-D2 and its acceptance evidence.
Before exposure, resolve parser exploits accessing secrets or other documents for the approved scope; communicate remaining limitations.

### JF-03-07-D3 — Define network restrictions

#### Proposed delivery contract

Implementation instruction: Define network restrictions.
Reviewable artifact: Worker egress policy.
Acceptance criterion: Only necessary approved endpoints are reachable.
Input dependency: Quarantine and job envelopes.
Scope constraint: Restricted network and resource-limited execution.
Risk to control: Parser exploits accessing secrets or other documents.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A hostile fixture cannot exceed approved resource or network scope.
Completion record: JF-03-07-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-07-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “worker egress policy” against “only necessary approved endpoints are reachable”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-07-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “worker egress policy” against “only necessary approved endpoints are reachable”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-07-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “worker egress policy” against “only necessary approved endpoints are reachable”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-07-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “worker egress policy” against “only necessary approved endpoints are reachable”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver worker egress policy to the next dependent owner with JF-03-07-D3 and its acceptance evidence.
Before exposure, resolve parser exploits accessing secrets or other documents for the approved scope; communicate remaining limitations.

### JF-03-07-D4 — Define temporary storage

#### Proposed delivery contract

Implementation instruction: Define temporary storage.
Reviewable artifact: Temporary-file lifecycle.
Acceptance criterion: Files are scoped and removed after work.
Input dependency: Quarantine and job envelopes.
Scope constraint: Restricted network and resource-limited execution.
Risk to control: Parser exploits accessing secrets or other documents.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A hostile fixture cannot exceed approved resource or network scope.
Completion record: JF-03-07-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-07-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “temporary-file lifecycle” against “files are scoped and removed after work”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-07-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “temporary-file lifecycle” against “files are scoped and removed after work”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-07-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “temporary-file lifecycle” against “files are scoped and removed after work”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-07-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “temporary-file lifecycle” against “files are scoped and removed after work”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver temporary-file lifecycle to the next dependent owner with JF-03-07-D4 and its acceptance evidence.
Before exposure, resolve parser exploits accessing secrets or other documents for the approved scope; communicate remaining limitations.

### JF-03-07-D5 — Define parser lifecycle

#### Proposed delivery contract

Implementation instruction: Define parser lifecycle.
Reviewable artifact: Parser update process.
Acceptance criterion: Security updates undergo fixture regression.
Input dependency: Quarantine and job envelopes.
Scope constraint: Restricted network and resource-limited execution.
Risk to control: Parser exploits accessing secrets or other documents.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A hostile fixture cannot exceed approved resource or network scope.
Completion record: JF-03-07-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-07-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “parser update process” against “security updates undergo fixture regression”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-07-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “parser update process” against “security updates undergo fixture regression”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-07-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “parser update process” against “security updates undergo fixture regression”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-07-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “parser update process” against “security updates undergo fixture regression”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver parser update process to the next dependent owner with JF-03-07-D5 and its acceptance evidence.
Before exposure, resolve parser exploits accessing secrets or other documents for the approved scope; communicate remaining limitations.

### JF-03-07-D6 — Define crash handling

#### Proposed delivery contract

Implementation instruction: Define crash handling.
Reviewable artifact: Worker failure procedure.
Acceptance criterion: A crash yields a visible recoverable job state.
Input dependency: Quarantine and job envelopes.
Scope constraint: Restricted network and resource-limited execution.
Risk to control: Parser exploits accessing secrets or other documents.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A hostile fixture cannot exceed approved resource or network scope.
Completion record: JF-03-07-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-07-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “worker failure procedure” against “a crash yields a visible recoverable job state”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-07-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “worker failure procedure” against “a crash yields a visible recoverable job state”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-07-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “worker failure procedure” against “a crash yields a visible recoverable job state”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-07-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “worker failure procedure” against “a crash yields a visible recoverable job state”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-07-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver worker failure procedure to the next dependent owner with JF-03-07-D6 and its acceptance evidence.
Before exposure, resolve parser exploits accessing secrets or other documents for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-07 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Quarantine and job envelopes.
Confirm measured evidence for: A hostile fixture cannot exceed approved resource or network scope.
Confirm the intended scope remains: Restricted network and resource-limited execution.
Confirm the owner has addressed: Parser exploits accessing secrets or other documents.
Link relevant master-plan decisions before moving JF-03-07 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-08 — Public API contracts

### Purpose and implementation decision

Outcome: Make client behavior predictable and secure.
Boundary: HTTP contracts before partner API launch.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Entity, authorization and status models.
Primary risk: Ambiguous errors encouraging unsafe retries.
Workstream success measure: All MVP operations have stable request, response and error semantics.

### Delivery sequence

1. Confirm the inputs and constraints for public api contracts.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review all mvp operations have stable request, response and error semantics against the stated measurement cohort.
4. Resolve ambiguous errors encouraging unsafe retries before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-08-D1 — Define operation inventory

#### Proposed delivery contract

Implementation instruction: Define operation inventory.
Reviewable artifact: API operation catalogue.
Acceptance criterion: Create, upload, evaluate, correct and export are included.
Input dependency: Entity, authorization and status models.
Scope constraint: HTTP contracts before partner API launch.
Risk to control: Ambiguous errors encouraging unsafe retries.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: All MVP operations have stable request, response and error semantics.
Completion record: JF-03-08-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-08-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “api operation catalogue” against “create, upload, evaluate, correct and export are included”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-08-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “api operation catalogue” against “create, upload, evaluate, correct and export are included”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-08-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “api operation catalogue” against “create, upload, evaluate, correct and export are included”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-08-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “api operation catalogue” against “create, upload, evaluate, correct and export are included”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver api operation catalogue to the next dependent owner with JF-03-08-D1 and its acceptance evidence.
Before exposure, resolve ambiguous errors encouraging unsafe retries for the approved scope; communicate remaining limitations.

### JF-03-08-D2 — Define request validation

#### Proposed delivery contract

Implementation instruction: Define request validation.
Reviewable artifact: Validation contract.
Acceptance criterion: Bounds and nested fields are validated server-side.
Input dependency: Entity, authorization and status models.
Scope constraint: HTTP contracts before partner API launch.
Risk to control: Ambiguous errors encouraging unsafe retries.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: All MVP operations have stable request, response and error semantics.
Completion record: JF-03-08-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-08-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “validation contract” against “bounds and nested fields are validated server-side”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-08-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “validation contract” against “bounds and nested fields are validated server-side”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-08-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “validation contract” against “bounds and nested fields are validated server-side”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-08-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “validation contract” against “bounds and nested fields are validated server-side”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver validation contract to the next dependent owner with JF-03-08-D2 and its acceptance evidence.
Before exposure, resolve ambiguous errors encouraging unsafe retries for the approved scope; communicate remaining limitations.

### JF-03-08-D3 — Define error taxonomy

#### Proposed delivery contract

Implementation instruction: Define error taxonomy.
Reviewable artifact: Error schema.
Acceptance criterion: Unauthorized, invalid, stale and unavailable differ.
Input dependency: Entity, authorization and status models.
Scope constraint: HTTP contracts before partner API launch.
Risk to control: Ambiguous errors encouraging unsafe retries.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: All MVP operations have stable request, response and error semantics.
Completion record: JF-03-08-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-08-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “error schema” against “unauthorized, invalid, stale and unavailable differ”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-08-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “error schema” against “unauthorized, invalid, stale and unavailable differ”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-08-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “error schema” against “unauthorized, invalid, stale and unavailable differ”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-08-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “error schema” against “unauthorized, invalid, stale and unavailable differ”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver error schema to the next dependent owner with JF-03-08-D3 and its acceptance evidence.
Before exposure, resolve ambiguous errors encouraging unsafe retries for the approved scope; communicate remaining limitations.

### JF-03-08-D4 — Define pagination rules

#### Proposed delivery contract

Implementation instruction: Define pagination rules.
Reviewable artifact: Pagination contract.
Acceptance criterion: Stable ordering avoids missing or duplicated records.
Input dependency: Entity, authorization and status models.
Scope constraint: HTTP contracts before partner API launch.
Risk to control: Ambiguous errors encouraging unsafe retries.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: All MVP operations have stable request, response and error semantics.
Completion record: JF-03-08-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-08-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “pagination contract” against “stable ordering avoids missing or duplicated records”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-08-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “pagination contract” against “stable ordering avoids missing or duplicated records”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-08-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “pagination contract” against “stable ordering avoids missing or duplicated records”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-08-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “pagination contract” against “stable ordering avoids missing or duplicated records”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver pagination contract to the next dependent owner with JF-03-08-D4 and its acceptance evidence.
Before exposure, resolve ambiguous errors encouraging unsafe retries for the approved scope; communicate remaining limitations.

### JF-03-08-D5 — Define concurrency tokens

#### Proposed delivery contract

Implementation instruction: Define concurrency tokens.
Reviewable artifact: Revision conflict contract.
Acceptance criterion: Stale writes cannot silently overwrite corrections.
Input dependency: Entity, authorization and status models.
Scope constraint: HTTP contracts before partner API launch.
Risk to control: Ambiguous errors encouraging unsafe retries.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: All MVP operations have stable request, response and error semantics.
Completion record: JF-03-08-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-08-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “revision conflict contract” against “stale writes cannot silently overwrite corrections”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-08-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “revision conflict contract” against “stale writes cannot silently overwrite corrections”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-08-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “revision conflict contract” against “stale writes cannot silently overwrite corrections”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-08-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “revision conflict contract” against “stale writes cannot silently overwrite corrections”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver revision conflict contract to the next dependent owner with JF-03-08-D5 and its acceptance evidence.
Before exposure, resolve ambiguous errors encouraging unsafe retries for the approved scope; communicate remaining limitations.

### JF-03-08-D6 — Define idempotent mutation behavior

#### Proposed delivery contract

Implementation instruction: Define idempotent mutation behavior.
Reviewable artifact: Mutation retry contract.
Acceptance criterion: Lost acknowledgements do not duplicate effects.
Input dependency: Entity, authorization and status models.
Scope constraint: HTTP contracts before partner API launch.
Risk to control: Ambiguous errors encouraging unsafe retries.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: All MVP operations have stable request, response and error semantics.
Completion record: JF-03-08-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-08-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “mutation retry contract” against “lost acknowledgements do not duplicate effects”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-08-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “mutation retry contract” against “lost acknowledgements do not duplicate effects”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-08-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “mutation retry contract” against “lost acknowledgements do not duplicate effects”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-08-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “mutation retry contract” against “lost acknowledgements do not duplicate effects”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-08-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver mutation retry contract to the next dependent owner with JF-03-08-D6 and its acceptance evidence.
Before exposure, resolve ambiguous errors encouraging unsafe retries for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-08 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Entity, authorization and status models.
Confirm measured evidence for: All MVP operations have stable request, response and error semantics.
Confirm the intended scope remains: HTTP contracts before partner API launch.
Confirm the owner has addressed: Ambiguous errors encouraging unsafe retries.
Link relevant master-plan decisions before moving JF-03-08 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-09 — Frontend state management

### Purpose and implementation decision

Outcome: Keep the interface aligned with actual server revisions.
Boundary: Responsive browser experience first.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: API and report state contracts.
Primary risk: Stale green status surviving a document change.
Workstream success measure: Every visible report identifies its active run or stale state.

### Delivery sequence

1. Confirm the inputs and constraints for frontend state management.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review every visible report identifies its active run or stale state against the stated measurement cohort.
4. Resolve stale green status surviving a document change before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-09-D1 — Define client entity cache

#### Proposed delivery contract

Implementation instruction: Define client entity cache.
Reviewable artifact: Client cache specification.
Acceptance criterion: Entities key by tenant and revision.
Input dependency: API and report state contracts.
Scope constraint: Responsive browser experience first.
Risk to control: Stale green status surviving a document change.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every visible report identifies its active run or stale state.
Completion record: JF-03-09-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-09-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “client cache specification” against “entities key by tenant and revision”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-09-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “client cache specification” against “entities key by tenant and revision”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-09-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “client cache specification” against “entities key by tenant and revision”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-09-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “client cache specification” against “entities key by tenant and revision”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver client cache specification to the next dependent owner with JF-03-09-D1 and its acceptance evidence.
Before exposure, resolve stale green status surviving a document change for the approved scope; communicate remaining limitations.

### JF-03-09-D2 — Define optimistic updates

#### Proposed delivery contract

Implementation instruction: Define optimistic updates.
Reviewable artifact: Optimistic interaction policy.
Acceptance criterion: Only reversible metadata actions update optimistically.
Input dependency: API and report state contracts.
Scope constraint: Responsive browser experience first.
Risk to control: Stale green status surviving a document change.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every visible report identifies its active run or stale state.
Completion record: JF-03-09-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-09-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “optimistic interaction policy” against “only reversible metadata actions update optimistically”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-09-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “optimistic interaction policy” against “only reversible metadata actions update optimistically”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-09-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “optimistic interaction policy” against “only reversible metadata actions update optimistically”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-09-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “optimistic interaction policy” against “only reversible metadata actions update optimistically”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver optimistic interaction policy to the next dependent owner with JF-03-09-D2 and its acceptance evidence.
Before exposure, resolve stale green status surviving a document change for the approved scope; communicate remaining limitations.

### JF-03-09-D3 — Define upload progress model

#### Proposed delivery contract

Implementation instruction: Define upload progress model.
Reviewable artifact: Progress-state specification.
Acceptance criterion: Transport completion differs from processing completion.
Input dependency: API and report state contracts.
Scope constraint: Responsive browser experience first.
Risk to control: Stale green status surviving a document change.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every visible report identifies its active run or stale state.
Completion record: JF-03-09-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-09-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “progress-state specification” against “transport completion differs from processing completion”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-09-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “progress-state specification” against “transport completion differs from processing completion”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-09-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “progress-state specification” against “transport completion differs from processing completion”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-09-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “progress-state specification” against “transport completion differs from processing completion”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver progress-state specification to the next dependent owner with JF-03-09-D3 and its acceptance evidence.
Before exposure, resolve stale green status surviving a document change for the approved scope; communicate remaining limitations.

### JF-03-09-D4 — Define report polling behavior

#### Proposed delivery contract

Implementation instruction: Define report polling behavior.
Reviewable artifact: Polling contract.
Acceptance criterion: Pending, error and cancelled states terminate predictably.
Input dependency: API and report state contracts.
Scope constraint: Responsive browser experience first.
Risk to control: Stale green status surviving a document change.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every visible report identifies its active run or stale state.
Completion record: JF-03-09-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-09-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “polling contract” against “pending, error and cancelled states terminate predictably”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-09-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “polling contract” against “pending, error and cancelled states terminate predictably”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-09-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “polling contract” against “pending, error and cancelled states terminate predictably”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-09-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “polling contract” against “pending, error and cancelled states terminate predictably”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver polling contract to the next dependent owner with JF-03-09-D4 and its acceptance evidence.
Before exposure, resolve stale green status surviving a document change for the approved scope; communicate remaining limitations.

### JF-03-09-D5 — Define stale-view handling

#### Proposed delivery contract

Implementation instruction: Define stale-view handling.
Reviewable artifact: Stale UI rules.
Acceptance criterion: Replaced evidence clears current ready presentation.
Input dependency: API and report state contracts.
Scope constraint: Responsive browser experience first.
Risk to control: Stale green status surviving a document change.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every visible report identifies its active run or stale state.
Completion record: JF-03-09-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-09-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “stale ui rules” against “replaced evidence clears current ready presentation”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-09-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “stale ui rules” against “replaced evidence clears current ready presentation”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-09-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “stale ui rules” against “replaced evidence clears current ready presentation”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-09-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “stale ui rules” against “replaced evidence clears current ready presentation”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver stale ui rules to the next dependent owner with JF-03-09-D5 and its acceptance evidence.
Before exposure, resolve stale green status surviving a document change for the approved scope; communicate remaining limitations.

### JF-03-09-D6 — Define route privacy

#### Proposed delivery contract

Implementation instruction: Define route privacy.
Reviewable artifact: Navigation privacy rules.
Acceptance criterion: Protected details do not enter public URLs or titles.
Input dependency: API and report state contracts.
Scope constraint: Responsive browser experience first.
Risk to control: Stale green status surviving a document change.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Every visible report identifies its active run or stale state.
Completion record: JF-03-09-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-09-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “navigation privacy rules” against “protected details do not enter public urls or titles”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-09-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “navigation privacy rules” against “protected details do not enter public urls or titles”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-09-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “navigation privacy rules” against “protected details do not enter public urls or titles”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-09-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “navigation privacy rules” against “protected details do not enter public urls or titles”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-09-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver navigation privacy rules to the next dependent owner with JF-03-09-D6 and its acceptance evidence.
Before exposure, resolve stale green status surviving a document change for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-09 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: API and report state contracts.
Confirm measured evidence for: Every visible report identifies its active run or stale state.
Confirm the intended scope remains: Responsive browser experience first.
Confirm the owner has addressed: Stale green status surviving a document change.
Link relevant master-plan decisions before moving JF-03-09 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-10 — Evidence retrieval and search

### Purpose and implementation decision

Outcome: Find packet evidence within authorized scope.
Boundary: Relational indexes first, vector search deferred.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Evidence graph and permission boundaries.
Primary risk: Search results leaking sensitive document snippets.
Workstream success measure: Search never expands access beyond the caller's granted packet scope.

### Delivery sequence

1. Confirm the inputs and constraints for evidence retrieval and search.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review search never expands access beyond the caller's granted packet scope against the stated measurement cohort.
4. Resolve search results leaking sensitive document snippets before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-10-D1 — Define searchable fields

#### Proposed delivery contract

Implementation instruction: Define searchable fields.
Reviewable artifact: Search field allowlist.
Acceptance criterion: Only necessary metadata and approved extracted fields are indexed.
Input dependency: Evidence graph and permission boundaries.
Scope constraint: Relational indexes first, vector search deferred.
Risk to control: Search results leaking sensitive document snippets.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Search never expands access beyond the caller's granted packet scope.
Completion record: JF-03-10-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-10-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “search field allowlist” against “only necessary metadata and approved extracted fields are indexed”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-10-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “search field allowlist” against “only necessary metadata and approved extracted fields are indexed”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-10-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “search field allowlist” against “only necessary metadata and approved extracted fields are indexed”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-10-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “search field allowlist” against “only necessary metadata and approved extracted fields are indexed”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver search field allowlist to the next dependent owner with JF-03-10-D1 and its acceptance evidence.
Before exposure, resolve search results leaking sensitive document snippets for the approved scope; communicate remaining limitations.

### JF-03-10-D2 — Define index updates

#### Proposed delivery contract

Implementation instruction: Define index updates.
Reviewable artifact: Index revision procedure.
Acceptance criterion: Updates match the active document revision.
Input dependency: Evidence graph and permission boundaries.
Scope constraint: Relational indexes first, vector search deferred.
Risk to control: Search results leaking sensitive document snippets.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Search never expands access beyond the caller's granted packet scope.
Completion record: JF-03-10-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-10-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “index revision procedure” against “updates match the active document revision”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-10-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “index revision procedure” against “updates match the active document revision”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-10-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “index revision procedure” against “updates match the active document revision”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-10-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “index revision procedure” against “updates match the active document revision”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver index revision procedure to the next dependent owner with JF-03-10-D2 and its acceptance evidence.
Before exposure, resolve search results leaking sensitive document snippets for the approved scope; communicate remaining limitations.

### JF-03-10-D3 — Define result authorization

#### Proposed delivery contract

Implementation instruction: Define result authorization.
Reviewable artifact: Search permission contract.
Acceptance criterion: Every result remains tenant-filtered.
Input dependency: Evidence graph and permission boundaries.
Scope constraint: Relational indexes first, vector search deferred.
Risk to control: Search results leaking sensitive document snippets.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Search never expands access beyond the caller's granted packet scope.
Completion record: JF-03-10-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-10-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “search permission contract” against “every result remains tenant-filtered”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-10-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “search permission contract” against “every result remains tenant-filtered”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-10-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “search permission contract” against “every result remains tenant-filtered”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-10-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “search permission contract” against “every result remains tenant-filtered”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver search permission contract to the next dependent owner with JF-03-10-D3 and its acceptance evidence.
Before exposure, resolve search results leaking sensitive document snippets for the approved scope; communicate remaining limitations.

### JF-03-10-D4 — Define snippet redaction

#### Proposed delivery contract

Implementation instruction: Define snippet redaction.
Reviewable artifact: Snippet display rules.
Acceptance criterion: Sensitive fields appear only in authorized contexts.
Input dependency: Evidence graph and permission boundaries.
Scope constraint: Relational indexes first, vector search deferred.
Risk to control: Search results leaking sensitive document snippets.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Search never expands access beyond the caller's granted packet scope.
Completion record: JF-03-10-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-10-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “snippet display rules” against “sensitive fields appear only in authorized contexts”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-10-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “snippet display rules” against “sensitive fields appear only in authorized contexts”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-10-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “snippet display rules” against “sensitive fields appear only in authorized contexts”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-10-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “snippet display rules” against “sensitive fields appear only in authorized contexts”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver snippet display rules to the next dependent owner with JF-03-10-D4 and its acceptance evidence.
Before exposure, resolve search results leaking sensitive document snippets for the approved scope; communicate remaining limitations.

### JF-03-10-D5 — Define anchor resolution

#### Proposed delivery contract

Implementation instruction: Define anchor resolution.
Reviewable artifact: Anchor resolution service contract.
Acceptance criterion: Results resolve to the intended immutable page.
Input dependency: Evidence graph and permission boundaries.
Scope constraint: Relational indexes first, vector search deferred.
Risk to control: Search results leaking sensitive document snippets.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Search never expands access beyond the caller's granted packet scope.
Completion record: JF-03-10-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-10-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “anchor resolution service contract” against “results resolve to the intended immutable page”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-10-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “anchor resolution service contract” against “results resolve to the intended immutable page”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-10-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “anchor resolution service contract” against “results resolve to the intended immutable page”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-10-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “anchor resolution service contract” against “results resolve to the intended immutable page”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver anchor resolution service contract to the next dependent owner with JF-03-10-D5 and its acceptance evidence.
Before exposure, resolve search results leaking sensitive document snippets for the approved scope; communicate remaining limitations.

### JF-03-10-D6 — Define search deletion

#### Proposed delivery contract

Implementation instruction: Define search deletion.
Reviewable artifact: Search erasure procedure.
Acceptance criterion: Deleted content disappears from all search surfaces.
Input dependency: Evidence graph and permission boundaries.
Scope constraint: Relational indexes first, vector search deferred.
Risk to control: Search results leaking sensitive document snippets.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Search never expands access beyond the caller's granted packet scope.
Completion record: JF-03-10-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-10-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “search erasure procedure” against “deleted content disappears from all search surfaces”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-10-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “search erasure procedure” against “deleted content disappears from all search surfaces”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-10-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “search erasure procedure” against “deleted content disappears from all search surfaces”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-10-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “search erasure procedure” against “deleted content disappears from all search surfaces”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-10-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver search erasure procedure to the next dependent owner with JF-03-10-D6 and its acceptance evidence.
Before exposure, resolve search results leaking sensitive document snippets for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-10 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Evidence graph and permission boundaries.
Confirm measured evidence for: Search never expands access beyond the caller's granted packet scope.
Confirm the intended scope remains: Relational indexes first, vector search deferred.
Confirm the owner has addressed: Search results leaking sensitive document snippets.
Link relevant master-plan decisions before moving JF-03-10 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-11 — Report generation service

### Purpose and implementation decision

Outcome: Produce consistent private report artifacts.
Boundary: Snapshot exports, not official certification.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Completed run snapshots and private storage.
Primary risk: Reports mixing changing inputs during generation.
Workstream success measure: Exported content matches one pinned evaluation run.

### Delivery sequence

1. Confirm the inputs and constraints for report generation service.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review exported content matches one pinned evaluation run against the stated measurement cohort.
4. Resolve reports mixing changing inputs during generation before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-11-D1 — Define generation requests

#### Proposed delivery contract

Implementation instruction: Define generation requests.
Reviewable artifact: Report job contract.
Acceptance criterion: Run ID and authorized requester are required.
Input dependency: Completed run snapshots and private storage.
Scope constraint: Snapshot exports, not official certification.
Risk to control: Reports mixing changing inputs during generation.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Exported content matches one pinned evaluation run.
Completion record: JF-03-11-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-11-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “report job contract” against “run id and authorized requester are required”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-11-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “report job contract” against “run id and authorized requester are required”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-11-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “report job contract” against “run id and authorized requester are required”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-11-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “report job contract” against “run id and authorized requester are required”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver report job contract to the next dependent owner with JF-03-11-D1 and its acceptance evidence.
Before exposure, resolve reports mixing changing inputs during generation for the approved scope; communicate remaining limitations.

### JF-03-11-D2 — Define report templates

#### Proposed delivery contract

Implementation instruction: Define report templates.
Reviewable artifact: Template revision contract.
Acceptance criterion: Content and limitations are versioned.
Input dependency: Completed run snapshots and private storage.
Scope constraint: Snapshot exports, not official certification.
Risk to control: Reports mixing changing inputs during generation.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Exported content matches one pinned evaluation run.
Completion record: JF-03-11-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-11-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “template revision contract” against “content and limitations are versioned”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-11-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “template revision contract” against “content and limitations are versioned”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-11-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “template revision contract” against “content and limitations are versioned”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-11-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “template revision contract” against “content and limitations are versioned”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver template revision contract to the next dependent owner with JF-03-11-D2 and its acceptance evidence.
Before exposure, resolve reports mixing changing inputs during generation for the approved scope; communicate remaining limitations.

### JF-03-11-D3 — Define rendering isolation

#### Proposed delivery contract

Implementation instruction: Define rendering isolation.
Reviewable artifact: Export worker contract.
Acceptance criterion: Untrusted text cannot execute active content.
Input dependency: Completed run snapshots and private storage.
Scope constraint: Snapshot exports, not official certification.
Risk to control: Reports mixing changing inputs during generation.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Exported content matches one pinned evaluation run.
Completion record: JF-03-11-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-11-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “export worker contract” against “untrusted text cannot execute active content”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-11-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “export worker contract” against “untrusted text cannot execute active content”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-11-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “export worker contract” against “untrusted text cannot execute active content”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-11-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “export worker contract” against “untrusted text cannot execute active content”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver export worker contract to the next dependent owner with JF-03-11-D3 and its acceptance evidence.
Before exposure, resolve reports mixing changing inputs during generation for the approved scope; communicate remaining limitations.

### JF-03-11-D4 — Define export lifecycle

#### Proposed delivery contract

Implementation instruction: Define export lifecycle.
Reviewable artifact: Export storage policy.
Acceptance criterion: Access and retention are bounded.
Input dependency: Completed run snapshots and private storage.
Scope constraint: Snapshot exports, not official certification.
Risk to control: Reports mixing changing inputs during generation.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Exported content matches one pinned evaluation run.
Completion record: JF-03-11-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-11-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “export storage policy” against “access and retention are bounded”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-11-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “export storage policy” against “access and retention are bounded”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-11-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “export storage policy” against “access and retention are bounded”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-11-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “export storage policy” against “access and retention are bounded”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver export storage policy to the next dependent owner with JF-03-11-D4 and its acceptance evidence.
Before exposure, resolve reports mixing changing inputs during generation for the approved scope; communicate remaining limitations.

### JF-03-11-D5 — Define report verification

#### Proposed delivery contract

Implementation instruction: Define report verification.
Reviewable artifact: Snapshot consistency check.
Acceptance criterion: Every evidence reference belongs to the selected run.
Input dependency: Completed run snapshots and private storage.
Scope constraint: Snapshot exports, not official certification.
Risk to control: Reports mixing changing inputs during generation.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Exported content matches one pinned evaluation run.
Completion record: JF-03-11-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-11-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “snapshot consistency check” against “every evidence reference belongs to the selected run”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-11-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “snapshot consistency check” against “every evidence reference belongs to the selected run”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-11-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “snapshot consistency check” against “every evidence reference belongs to the selected run”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-11-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “snapshot consistency check” against “every evidence reference belongs to the selected run”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver snapshot consistency check to the next dependent owner with JF-03-11-D5 and its acceptance evidence.
Before exposure, resolve reports mixing changing inputs during generation for the approved scope; communicate remaining limitations.

### JF-03-11-D6 — Define failed exports

#### Proposed delivery contract

Implementation instruction: Define failed exports.
Reviewable artifact: Export retry behavior.
Acceptance criterion: Failure does not charge for a completed artifact.
Input dependency: Completed run snapshots and private storage.
Scope constraint: Snapshot exports, not official certification.
Risk to control: Reports mixing changing inputs during generation.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Exported content matches one pinned evaluation run.
Completion record: JF-03-11-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-11-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “export retry behavior” against “failure does not charge for a completed artifact”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-11-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “export retry behavior” against “failure does not charge for a completed artifact”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-11-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “export retry behavior” against “failure does not charge for a completed artifact”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-11-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “export retry behavior” against “failure does not charge for a completed artifact”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-11-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver export retry behavior to the next dependent owner with JF-03-11-D6 and its acceptance evidence.
Before exposure, resolve reports mixing changing inputs during generation for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-11 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Completed run snapshots and private storage.
Confirm measured evidence for: Exported content matches one pinned evaluation run.
Confirm the intended scope remains: Snapshot exports, not official certification.
Confirm the owner has addressed: Reports mixing changing inputs during generation.
Link relevant master-plan decisions before moving JF-03-11 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-12 — Notifications and preferences

### Purpose and implementation decision

Outcome: Deliver actionable operational notices privately.
Boundary: Transactional notices first, marketing opt-in separate.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Source-change and processing state contracts.
Primary risk: Sensitive findings appearing in lock-screen messages.
Workstream success measure: Notification payloads contain no unnecessary document or identity content.

### Delivery sequence

1. Confirm the inputs and constraints for notifications and preferences.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review notification payloads contain no unnecessary document or identity content against the stated measurement cohort.
4. Resolve sensitive findings appearing in lock-screen messages before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-12-D1 — Define notification triggers

#### Proposed delivery contract

Implementation instruction: Define notification triggers.
Reviewable artifact: Trigger catalogue.
Acceptance criterion: Ready, failed, changed and incident notices differ.
Input dependency: Source-change and processing state contracts.
Scope constraint: Transactional notices first, marketing opt-in separate.
Risk to control: Sensitive findings appearing in lock-screen messages.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Notification payloads contain no unnecessary document or identity content.
Completion record: JF-03-12-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-12-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “trigger catalogue” against “ready, failed, changed and incident notices differ”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-12-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “trigger catalogue” against “ready, failed, changed and incident notices differ”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-12-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “trigger catalogue” against “ready, failed, changed and incident notices differ”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-12-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “trigger catalogue” against “ready, failed, changed and incident notices differ”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver trigger catalogue to the next dependent owner with JF-03-12-D1 and its acceptance evidence.
Before exposure, resolve sensitive findings appearing in lock-screen messages for the approved scope; communicate remaining limitations.

### JF-03-12-D2 — Define message payloads

#### Proposed delivery contract

Implementation instruction: Define message payloads.
Reviewable artifact: Payload allowlist.
Acceptance criterion: Messages link to authorized review rather than exposing evidence.
Input dependency: Source-change and processing state contracts.
Scope constraint: Transactional notices first, marketing opt-in separate.
Risk to control: Sensitive findings appearing in lock-screen messages.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Notification payloads contain no unnecessary document or identity content.
Completion record: JF-03-12-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-12-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “payload allowlist” against “messages link to authorized review rather than exposing evidence”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-12-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “payload allowlist” against “messages link to authorized review rather than exposing evidence”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-12-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “payload allowlist” against “messages link to authorized review rather than exposing evidence”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-12-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “payload allowlist” against “messages link to authorized review rather than exposing evidence”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver payload allowlist to the next dependent owner with JF-03-12-D2 and its acceptance evidence.
Before exposure, resolve sensitive findings appearing in lock-screen messages for the approved scope; communicate remaining limitations.

### JF-03-12-D3 — Define delivery retries

#### Proposed delivery contract

Implementation instruction: Define delivery retries.
Reviewable artifact: Notification retry contract.
Acceptance criterion: Duplicate delivery is bounded and traceable.
Input dependency: Source-change and processing state contracts.
Scope constraint: Transactional notices first, marketing opt-in separate.
Risk to control: Sensitive findings appearing in lock-screen messages.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Notification payloads contain no unnecessary document or identity content.
Completion record: JF-03-12-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-12-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “notification retry contract” against “duplicate delivery is bounded and traceable”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-12-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “notification retry contract” against “duplicate delivery is bounded and traceable”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-12-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “notification retry contract” against “duplicate delivery is bounded and traceable”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-12-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “notification retry contract” against “duplicate delivery is bounded and traceable”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver notification retry contract to the next dependent owner with JF-03-12-D3 and its acceptance evidence.
Before exposure, resolve sensitive findings appearing in lock-screen messages for the approved scope; communicate remaining limitations.

### JF-03-12-D4 — Define preference scope

#### Proposed delivery contract

Implementation instruction: Define preference scope.
Reviewable artifact: Preference model.
Acceptance criterion: Optional communications and essential notices are distinguished.
Input dependency: Source-change and processing state contracts.
Scope constraint: Transactional notices first, marketing opt-in separate.
Risk to control: Sensitive findings appearing in lock-screen messages.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Notification payloads contain no unnecessary document or identity content.
Completion record: JF-03-12-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-12-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “preference model” against “optional communications and essential notices are distinguished”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-12-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “preference model” against “optional communications and essential notices are distinguished”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-12-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “preference model” against “optional communications and essential notices are distinguished”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-12-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “preference model” against “optional communications and essential notices are distinguished”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver preference model to the next dependent owner with JF-03-12-D4 and its acceptance evidence.
Before exposure, resolve sensitive findings appearing in lock-screen messages for the approved scope; communicate remaining limitations.

### JF-03-12-D5 — Define timezone handling

#### Proposed delivery contract

Implementation instruction: Define timezone handling.
Reviewable artifact: Timezone presentation contract.
Acceptance criterion: Application deadline zones are preserved.
Input dependency: Source-change and processing state contracts.
Scope constraint: Transactional notices first, marketing opt-in separate.
Risk to control: Sensitive findings appearing in lock-screen messages.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Notification payloads contain no unnecessary document or identity content.
Completion record: JF-03-12-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-12-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “timezone presentation contract” against “application deadline zones are preserved”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-12-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “timezone presentation contract” against “application deadline zones are preserved”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-12-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “timezone presentation contract” against “application deadline zones are preserved”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-12-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “timezone presentation contract” against “application deadline zones are preserved”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver timezone presentation contract to the next dependent owner with JF-03-12-D5 and its acceptance evidence.
Before exposure, resolve sensitive findings appearing in lock-screen messages for the approved scope; communicate remaining limitations.

### JF-03-12-D6 — Define delivery reconciliation

#### Proposed delivery contract

Implementation instruction: Define delivery reconciliation.
Reviewable artifact: Delivery-status workflow.
Acceptance criterion: Undelivered important notices remain visible in the app.
Input dependency: Source-change and processing state contracts.
Scope constraint: Transactional notices first, marketing opt-in separate.
Risk to control: Sensitive findings appearing in lock-screen messages.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Notification payloads contain no unnecessary document or identity content.
Completion record: JF-03-12-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-12-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “delivery-status workflow” against “undelivered important notices remain visible in the app”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-12-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “delivery-status workflow” against “undelivered important notices remain visible in the app”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-12-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “delivery-status workflow” against “undelivered important notices remain visible in the app”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-12-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “delivery-status workflow” against “undelivered important notices remain visible in the app”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-12-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver delivery-status workflow to the next dependent owner with JF-03-12-D6 and its acceptance evidence.
Before exposure, resolve sensitive findings appearing in lock-screen messages for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-12 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Source-change and processing state contracts.
Confirm measured evidence for: Notification payloads contain no unnecessary document or identity content.
Confirm the intended scope remains: Transactional notices first, marketing opt-in separate.
Confirm the owner has addressed: Sensitive findings appearing in lock-screen messages.
Link relevant master-plan decisions before moving JF-03-12 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-13 — Observability and operations data

### Purpose and implementation decision

Outcome: Diagnose failures without copying sensitive packets.
Boundary: Redacted logs and scoped operational metrics.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Privacy allowlist and service boundaries.
Primary risk: Debugging turning logs into document storage.
Workstream success measure: Production observability passes a field-level privacy review.

### Delivery sequence

1. Confirm the inputs and constraints for observability and operations data.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review production observability passes a field-level privacy review against the stated measurement cohort.
4. Resolve debugging turning logs into document storage before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-13-D1 — Define correlation identifiers

#### Proposed delivery contract

Implementation instruction: Define correlation identifiers.
Reviewable artifact: Correlation contract.
Acceptance criterion: Request, job and run references join without raw identity data.
Input dependency: Privacy allowlist and service boundaries.
Scope constraint: Redacted logs and scoped operational metrics.
Risk to control: Debugging turning logs into document storage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Production observability passes a field-level privacy review.
Completion record: JF-03-13-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-13-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “correlation contract” against “request, job and run references join without raw identity data”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-13-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “correlation contract” against “request, job and run references join without raw identity data”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-13-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “correlation contract” against “request, job and run references join without raw identity data”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-13-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “correlation contract” against “request, job and run references join without raw identity data”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver correlation contract to the next dependent owner with JF-03-13-D1 and its acceptance evidence.
Before exposure, resolve debugging turning logs into document storage for the approved scope; communicate remaining limitations.

### JF-03-13-D2 — Define structured log fields

#### Proposed delivery contract

Implementation instruction: Define structured log fields.
Reviewable artifact: Log schema.
Acceptance criterion: Document text and secrets are excluded.
Input dependency: Privacy allowlist and service boundaries.
Scope constraint: Redacted logs and scoped operational metrics.
Risk to control: Debugging turning logs into document storage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Production observability passes a field-level privacy review.
Completion record: JF-03-13-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-13-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “log schema” against “document text and secrets are excluded”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-13-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “log schema” against “document text and secrets are excluded”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-13-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “log schema” against “document text and secrets are excluded”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-13-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “log schema” against “document text and secrets are excluded”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver log schema to the next dependent owner with JF-03-13-D2 and its acceptance evidence.
Before exposure, resolve debugging turning logs into document storage for the approved scope; communicate remaining limitations.

### JF-03-13-D3 — Define processing metrics

#### Proposed delivery contract

Implementation instruction: Define processing metrics.
Reviewable artifact: Metric inventory.
Acceptance criterion: Latency, queue age, retries and unknown reasons are visible.
Input dependency: Privacy allowlist and service boundaries.
Scope constraint: Redacted logs and scoped operational metrics.
Risk to control: Debugging turning logs into document storage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Production observability passes a field-level privacy review.
Completion record: JF-03-13-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-13-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “metric inventory” against “latency, queue age, retries and unknown reasons are visible”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-13-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “metric inventory” against “latency, queue age, retries and unknown reasons are visible”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-13-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “metric inventory” against “latency, queue age, retries and unknown reasons are visible”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-13-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “metric inventory” against “latency, queue age, retries and unknown reasons are visible”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver metric inventory to the next dependent owner with JF-03-13-D3 and its acceptance evidence.
Before exposure, resolve debugging turning logs into document storage for the approved scope; communicate remaining limitations.

### JF-03-13-D4 — Define alert thresholds

#### Proposed delivery contract

Implementation instruction: Define alert thresholds.
Reviewable artifact: Alert rule brief.
Acceptance criterion: Thresholds identify customer impact rather than noise.
Input dependency: Privacy allowlist and service boundaries.
Scope constraint: Redacted logs and scoped operational metrics.
Risk to control: Debugging turning logs into document storage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Production observability passes a field-level privacy review.
Completion record: JF-03-13-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-13-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “alert rule brief” against “thresholds identify customer impact rather than noise”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-13-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “alert rule brief” against “thresholds identify customer impact rather than noise”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-13-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “alert rule brief” against “thresholds identify customer impact rather than noise”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-13-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “alert rule brief” against “thresholds identify customer impact rather than noise”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver alert rule brief to the next dependent owner with JF-03-13-D4 and its acceptance evidence.
Before exposure, resolve debugging turning logs into document storage for the approved scope; communicate remaining limitations.

### JF-03-13-D5 — Define trace retention

#### Proposed delivery contract

Implementation instruction: Define trace retention.
Reviewable artifact: Trace lifecycle policy.
Acceptance criterion: Purpose and retention are explicit.
Input dependency: Privacy allowlist and service boundaries.
Scope constraint: Redacted logs and scoped operational metrics.
Risk to control: Debugging turning logs into document storage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Production observability passes a field-level privacy review.
Completion record: JF-03-13-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-13-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “trace lifecycle policy” against “purpose and retention are explicit”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-13-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “trace lifecycle policy” against “purpose and retention are explicit”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-13-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “trace lifecycle policy” against “purpose and retention are explicit”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-13-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “trace lifecycle policy” against “purpose and retention are explicit”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver trace lifecycle policy to the next dependent owner with JF-03-13-D5 and its acceptance evidence.
Before exposure, resolve debugging turning logs into document storage for the approved scope; communicate remaining limitations.

### JF-03-13-D6 — Define diagnostic access

#### Proposed delivery contract

Implementation instruction: Define diagnostic access.
Reviewable artifact: Operational access matrix.
Acceptance criterion: Debug access is role-scoped and audited.
Input dependency: Privacy allowlist and service boundaries.
Scope constraint: Redacted logs and scoped operational metrics.
Risk to control: Debugging turning logs into document storage.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Production observability passes a field-level privacy review.
Completion record: JF-03-13-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-13-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “operational access matrix” against “debug access is role-scoped and audited”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-13-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “operational access matrix” against “debug access is role-scoped and audited”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-13-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “operational access matrix” against “debug access is role-scoped and audited”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-13-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “operational access matrix” against “debug access is role-scoped and audited”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-13-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver operational access matrix to the next dependent owner with JF-03-13-D6 and its acceptance evidence.
Before exposure, resolve debugging turning logs into document storage for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-13 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Privacy allowlist and service boundaries.
Confirm measured evidence for: Production observability passes a field-level privacy review.
Confirm the intended scope remains: Redacted logs and scoped operational metrics.
Confirm the owner has addressed: Debugging turning logs into document storage.
Link relevant master-plan decisions before moving JF-03-13 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-14 — Delivery and environment management

### Purpose and implementation decision

Outcome: Ship reviewable changes with reproducible configuration.
Boundary: No production deployment during this planning task.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Architecture and quality gates.
Primary risk: Configuration drift bypassing controls.
Workstream success measure: A release records artifact, configuration and reviewed gate evidence.

### Delivery sequence

1. Confirm the inputs and constraints for delivery and environment management.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review a release records artifact, configuration and reviewed gate evidence against the stated measurement cohort.
4. Resolve configuration drift bypassing controls before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-14-D1 — Define development environments

#### Proposed delivery contract

Implementation instruction: Define development environments.
Reviewable artifact: Environment isolation plan.
Acceptance criterion: Synthetic data is the default outside production.
Input dependency: Architecture and quality gates.
Scope constraint: No production deployment during this planning task.
Risk to control: Configuration drift bypassing controls.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A release records artifact, configuration and reviewed gate evidence.
Completion record: JF-03-14-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-14-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “environment isolation plan” against “synthetic data is the default outside production”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-14-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “environment isolation plan” against “synthetic data is the default outside production”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-14-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “environment isolation plan” against “synthetic data is the default outside production”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-14-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “environment isolation plan” against “synthetic data is the default outside production”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver environment isolation plan to the next dependent owner with JF-03-14-D1 and its acceptance evidence.
Before exposure, resolve configuration drift bypassing controls for the approved scope; communicate remaining limitations.

### JF-03-14-D2 — Define secret handling

#### Proposed delivery contract

Implementation instruction: Define secret handling.
Reviewable artifact: Secret management contract.
Acceptance criterion: Secrets never enter repository or build logs.
Input dependency: Architecture and quality gates.
Scope constraint: No production deployment during this planning task.
Risk to control: Configuration drift bypassing controls.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A release records artifact, configuration and reviewed gate evidence.
Completion record: JF-03-14-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-14-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “secret management contract” against “secrets never enter repository or build logs”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-14-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “secret management contract” against “secrets never enter repository or build logs”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-14-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “secret management contract” against “secrets never enter repository or build logs”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-14-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “secret management contract” against “secrets never enter repository or build logs”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver secret management contract to the next dependent owner with JF-03-14-D2 and its acceptance evidence.
Before exposure, resolve configuration drift bypassing controls for the approved scope; communicate remaining limitations.

### JF-03-14-D3 — Define build provenance

#### Proposed delivery contract

Implementation instruction: Define build provenance.
Reviewable artifact: Build artifact record.
Acceptance criterion: Source revision and dependencies are recorded.
Input dependency: Architecture and quality gates.
Scope constraint: No production deployment during this planning task.
Risk to control: Configuration drift bypassing controls.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A release records artifact, configuration and reviewed gate evidence.
Completion record: JF-03-14-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-14-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “build artifact record” against “source revision and dependencies are recorded”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-14-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “build artifact record” against “source revision and dependencies are recorded”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-14-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “build artifact record” against “source revision and dependencies are recorded”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-14-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “build artifact record” against “source revision and dependencies are recorded”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver build artifact record to the next dependent owner with JF-03-14-D3 and its acceptance evidence.
Before exposure, resolve configuration drift bypassing controls for the approved scope; communicate remaining limitations.

### JF-03-14-D4 — Define release automation

#### Proposed delivery contract

Implementation instruction: Define release automation.
Reviewable artifact: Delivery pipeline specification.
Acceptance criterion: Required assurance gates block promotion.
Input dependency: Architecture and quality gates.
Scope constraint: No production deployment during this planning task.
Risk to control: Configuration drift bypassing controls.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A release records artifact, configuration and reviewed gate evidence.
Completion record: JF-03-14-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-14-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “delivery pipeline specification” against “required assurance gates block promotion”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-14-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “delivery pipeline specification” against “required assurance gates block promotion”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-14-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “delivery pipeline specification” against “required assurance gates block promotion”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-14-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “delivery pipeline specification” against “required assurance gates block promotion”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver delivery pipeline specification to the next dependent owner with JF-03-14-D4 and its acceptance evidence.
Before exposure, resolve configuration drift bypassing controls for the approved scope; communicate remaining limitations.

### JF-03-14-D5 — Define configuration validation

#### Proposed delivery contract

Implementation instruction: Define configuration validation.
Reviewable artifact: Configuration schema.
Acceptance criterion: Unsafe defaults fail before launch.
Input dependency: Architecture and quality gates.
Scope constraint: No production deployment during this planning task.
Risk to control: Configuration drift bypassing controls.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A release records artifact, configuration and reviewed gate evidence.
Completion record: JF-03-14-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-14-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “configuration schema” against “unsafe defaults fail before launch”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-14-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “configuration schema” against “unsafe defaults fail before launch”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-14-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “configuration schema” against “unsafe defaults fail before launch”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-14-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “configuration schema” against “unsafe defaults fail before launch”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver configuration schema to the next dependent owner with JF-03-14-D5 and its acceptance evidence.
Before exposure, resolve configuration drift bypassing controls for the approved scope; communicate remaining limitations.

### JF-03-14-D6 — Define rollback procedure

#### Proposed delivery contract

Implementation instruction: Define rollback procedure.
Reviewable artifact: Rollback runbook.
Acceptance criterion: Application and data compatibility are assessed.
Input dependency: Architecture and quality gates.
Scope constraint: No production deployment during this planning task.
Risk to control: Configuration drift bypassing controls.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: A release records artifact, configuration and reviewed gate evidence.
Completion record: JF-03-14-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-14-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “rollback runbook” against “application and data compatibility are assessed”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-14-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “rollback runbook” against “application and data compatibility are assessed”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-14-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “rollback runbook” against “application and data compatibility are assessed”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-14-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “rollback runbook” against “application and data compatibility are assessed”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-14-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver rollback runbook to the next dependent owner with JF-03-14-D6 and its acceptance evidence.
Before exposure, resolve configuration drift bypassing controls for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-14 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Architecture and quality gates.
Confirm measured evidence for: A release records artifact, configuration and reviewed gate evidence.
Confirm the intended scope remains: No production deployment during this planning task.
Confirm the owner has addressed: Configuration drift bypassing controls.
Link relevant master-plan decisions before moving JF-03-14 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-15 — Backup and disaster recovery

### Purpose and implementation decision

Outcome: Restore service without restoring erased access.
Boundary: Measured restore targets, not untested guarantees.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Persistence, object lifecycle and deletion records.
Primary risk: Backups resurrecting deleted evidence.
Workstream success measure: An isolated restore applies deletion tombstones before user access.

### Delivery sequence

1. Confirm the inputs and constraints for backup and disaster recovery.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review an isolated restore applies deletion tombstones before user access against the stated measurement cohort.
4. Resolve backups resurrecting deleted evidence before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-15-D1 — Define recovery scenarios

#### Proposed delivery contract

Implementation instruction: Define recovery scenarios.
Reviewable artifact: Disaster scenario register.
Acceptance criterion: Database, object and key loss are considered.
Input dependency: Persistence, object lifecycle and deletion records.
Scope constraint: Measured restore targets, not untested guarantees.
Risk to control: Backups resurrecting deleted evidence.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: An isolated restore applies deletion tombstones before user access.
Completion record: JF-03-15-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-15-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “disaster scenario register” against “database, object and key loss are considered”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-15-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “disaster scenario register” against “database, object and key loss are considered”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-15-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “disaster scenario register” against “database, object and key loss are considered”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-15-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “disaster scenario register” against “database, object and key loss are considered”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver disaster scenario register to the next dependent owner with JF-03-15-D1 and its acceptance evidence.
Before exposure, resolve backups resurrecting deleted evidence for the approved scope; communicate remaining limitations.

### JF-03-15-D2 — Define backup schedules

#### Proposed delivery contract

Implementation instruction: Define backup schedules.
Reviewable artifact: Backup policy.
Acceptance criterion: Coverage matches the proposed recovery point target.
Input dependency: Persistence, object lifecycle and deletion records.
Scope constraint: Measured restore targets, not untested guarantees.
Risk to control: Backups resurrecting deleted evidence.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: An isolated restore applies deletion tombstones before user access.
Completion record: JF-03-15-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-15-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “backup policy” against “coverage matches the proposed recovery point target”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-15-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “backup policy” against “coverage matches the proposed recovery point target”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-15-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “backup policy” against “coverage matches the proposed recovery point target”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-15-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “backup policy” against “coverage matches the proposed recovery point target”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver backup policy to the next dependent owner with JF-03-15-D2 and its acceptance evidence.
Before exposure, resolve backups resurrecting deleted evidence for the approved scope; communicate remaining limitations.

### JF-03-15-D3 — Define key recovery

#### Proposed delivery contract

Implementation instruction: Define key recovery.
Reviewable artifact: Key recovery procedure.
Acceptance criterion: Recovery does not depend on one employee.
Input dependency: Persistence, object lifecycle and deletion records.
Scope constraint: Measured restore targets, not untested guarantees.
Risk to control: Backups resurrecting deleted evidence.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: An isolated restore applies deletion tombstones before user access.
Completion record: JF-03-15-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-15-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “key recovery procedure” against “recovery does not depend on one employee”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-15-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “key recovery procedure” against “recovery does not depend on one employee”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-15-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “key recovery procedure” against “recovery does not depend on one employee”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-15-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “key recovery procedure” against “recovery does not depend on one employee”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver key recovery procedure to the next dependent owner with JF-03-15-D3 and its acceptance evidence.
Before exposure, resolve backups resurrecting deleted evidence for the approved scope; communicate remaining limitations.

### JF-03-15-D4 — Define restore ordering

#### Proposed delivery contract

Implementation instruction: Define restore ordering.
Reviewable artifact: Restore sequence.
Acceptance criterion: Metadata and objects reconcile before reports reopen.
Input dependency: Persistence, object lifecycle and deletion records.
Scope constraint: Measured restore targets, not untested guarantees.
Risk to control: Backups resurrecting deleted evidence.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: An isolated restore applies deletion tombstones before user access.
Completion record: JF-03-15-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-15-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “restore sequence” against “metadata and objects reconcile before reports reopen”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-15-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “restore sequence” against “metadata and objects reconcile before reports reopen”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-15-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “restore sequence” against “metadata and objects reconcile before reports reopen”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-15-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “restore sequence” against “metadata and objects reconcile before reports reopen”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver restore sequence to the next dependent owner with JF-03-15-D4 and its acceptance evidence.
Before exposure, resolve backups resurrecting deleted evidence for the approved scope; communicate remaining limitations.

### JF-03-15-D5 — Define deletion replay

#### Proposed delivery contract

Implementation instruction: Define deletion replay.
Reviewable artifact: Tombstone replay contract.
Acceptance criterion: Erased content stays unavailable after restore.
Input dependency: Persistence, object lifecycle and deletion records.
Scope constraint: Measured restore targets, not untested guarantees.
Risk to control: Backups resurrecting deleted evidence.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: An isolated restore applies deletion tombstones before user access.
Completion record: JF-03-15-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-15-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “tombstone replay contract” against “erased content stays unavailable after restore”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-15-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “tombstone replay contract” against “erased content stays unavailable after restore”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-15-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “tombstone replay contract” against “erased content stays unavailable after restore”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-15-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “tombstone replay contract” against “erased content stays unavailable after restore”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver tombstone replay contract to the next dependent owner with JF-03-15-D5 and its acceptance evidence.
Before exposure, resolve backups resurrecting deleted evidence for the approved scope; communicate remaining limitations.

### JF-03-15-D6 — Define recovery drills

#### Proposed delivery contract

Implementation instruction: Define recovery drills.
Reviewable artifact: Restore drill evidence.
Acceptance criterion: Actual time and data gaps are measured.
Input dependency: Persistence, object lifecycle and deletion records.
Scope constraint: Measured restore targets, not untested guarantees.
Risk to control: Backups resurrecting deleted evidence.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: An isolated restore applies deletion tombstones before user access.
Completion record: JF-03-15-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-15-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “restore drill evidence” against “actual time and data gaps are measured”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-15-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “restore drill evidence” against “actual time and data gaps are measured”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-15-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “restore drill evidence” against “actual time and data gaps are measured”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-15-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “restore drill evidence” against “actual time and data gaps are measured”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-15-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver restore drill evidence to the next dependent owner with JF-03-15-D6 and its acceptance evidence.
Before exposure, resolve backups resurrecting deleted evidence for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-15 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Persistence, object lifecycle and deletion records.
Confirm measured evidence for: An isolated restore applies deletion tombstones before user access.
Confirm the intended scope remains: Measured restore targets, not untested guarantees.
Confirm the owner has addressed: Backups resurrecting deleted evidence.
Link relevant master-plan decisions before moving JF-03-15 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

## JF-03-16 — Capacity and cost controls

### Purpose and implementation decision

Outcome: Keep processing bounded and economically observable.
Boundary: Scale after measured demand, not forecast hype.
Accountable owner: Technical lead.
Delivery phase: MVP.
Predecessor: Telemetry and packet cost model.
Primary risk: Unbounded OCR or repeated evaluation costs.
Workstream success measure: Per-packet processing cost is measurable by workload class.

### Delivery sequence

1. Confirm the inputs and constraints for capacity and cost controls.
2. Complete the six deliverables below in order unless an explicit dependency permits overlap.
3. Review per-packet processing cost is measurable by workload class against the stated measurement cohort.
4. Resolve unbounded ocr or repeated evaluation costs before exposing the affected claim or capability.
5. Record a phase decision with the owner; unfinished deliverables remain visibly open.

### JF-03-16-D1 — Define pilot load profile

#### Proposed delivery contract

Implementation instruction: Define pilot load profile.
Reviewable artifact: Load model.
Acceptance criterion: Pages, formats, concurrent packets and OCR share are stated.
Input dependency: Telemetry and packet cost model.
Scope constraint: Scale after measured demand, not forecast hype.
Risk to control: Unbounded OCR or repeated evaluation costs.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Per-packet processing cost is measurable by workload class.
Completion record: JF-03-16-D1, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-16-D1-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “load model” against “pages, formats, concurrent packets and ocr share are stated”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D1-A1; unresolved failure keeps this exposure scope open.

##### JF-03-16-D1-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “load model” against “pages, formats, concurrent packets and ocr share are stated”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D1-A2; unresolved failure keeps this exposure scope open.

##### JF-03-16-D1-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “load model” against “pages, formats, concurrent packets and ocr share are stated”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D1-A3; unresolved failure keeps this exposure scope open.

##### JF-03-16-D1-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “load model” against “pages, formats, concurrent packets and ocr share are stated”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D1-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver load model to the next dependent owner with JF-03-16-D1 and its acceptance evidence.
Before exposure, resolve unbounded ocr or repeated evaluation costs for the approved scope; communicate remaining limitations.

### JF-03-16-D2 — Define admission limits

#### Proposed delivery contract

Implementation instruction: Define admission limits.
Reviewable artifact: Capacity policy.
Acceptance criterion: Limits provide clear retry or queue feedback.
Input dependency: Telemetry and packet cost model.
Scope constraint: Scale after measured demand, not forecast hype.
Risk to control: Unbounded OCR or repeated evaluation costs.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Per-packet processing cost is measurable by workload class.
Completion record: JF-03-16-D2, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-16-D2-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “capacity policy” against “limits provide clear retry or queue feedback”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D2-A1; unresolved failure keeps this exposure scope open.

##### JF-03-16-D2-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “capacity policy” against “limits provide clear retry or queue feedback”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D2-A2; unresolved failure keeps this exposure scope open.

##### JF-03-16-D2-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “capacity policy” against “limits provide clear retry or queue feedback”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D2-A3; unresolved failure keeps this exposure scope open.

##### JF-03-16-D2-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “capacity policy” against “limits provide clear retry or queue feedback”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D2-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver capacity policy to the next dependent owner with JF-03-16-D2 and its acceptance evidence.
Before exposure, resolve unbounded ocr or repeated evaluation costs for the approved scope; communicate remaining limitations.

### JF-03-16-D3 — Define autoscaling bounds

#### Proposed delivery contract

Implementation instruction: Define autoscaling bounds.
Reviewable artifact: Scaling policy.
Acceptance criterion: Maximum spend and minimum recovery capacity are explicit.
Input dependency: Telemetry and packet cost model.
Scope constraint: Scale after measured demand, not forecast hype.
Risk to control: Unbounded OCR or repeated evaluation costs.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Per-packet processing cost is measurable by workload class.
Completion record: JF-03-16-D3, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-16-D3-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “scaling policy” against “maximum spend and minimum recovery capacity are explicit”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D3-A1; unresolved failure keeps this exposure scope open.

##### JF-03-16-D3-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “scaling policy” against “maximum spend and minimum recovery capacity are explicit”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D3-A2; unresolved failure keeps this exposure scope open.

##### JF-03-16-D3-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “scaling policy” against “maximum spend and minimum recovery capacity are explicit”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D3-A3; unresolved failure keeps this exposure scope open.

##### JF-03-16-D3-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “scaling policy” against “maximum spend and minimum recovery capacity are explicit”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D3-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver scaling policy to the next dependent owner with JF-03-16-D3 and its acceptance evidence.
Before exposure, resolve unbounded ocr or repeated evaluation costs for the approved scope; communicate remaining limitations.

### JF-03-16-D4 — Define cost attribution

#### Proposed delivery contract

Implementation instruction: Define cost attribution.
Reviewable artifact: Cost ledger.
Acceptance criterion: Retries and supplier calls attach to operation IDs.
Input dependency: Telemetry and packet cost model.
Scope constraint: Scale after measured demand, not forecast hype.
Risk to control: Unbounded OCR or repeated evaluation costs.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Per-packet processing cost is measurable by workload class.
Completion record: JF-03-16-D4, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-16-D4-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “cost ledger” against “retries and supplier calls attach to operation ids”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D4-A1; unresolved failure keeps this exposure scope open.

##### JF-03-16-D4-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “cost ledger” against “retries and supplier calls attach to operation ids”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D4-A2; unresolved failure keeps this exposure scope open.

##### JF-03-16-D4-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “cost ledger” against “retries and supplier calls attach to operation ids”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D4-A3; unresolved failure keeps this exposure scope open.

##### JF-03-16-D4-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “cost ledger” against “retries and supplier calls attach to operation ids”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D4-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver cost ledger to the next dependent owner with JF-03-16-D4 and its acceptance evidence.
Before exposure, resolve unbounded ocr or repeated evaluation costs for the approved scope; communicate remaining limitations.

### JF-03-16-D5 — Define load verification

#### Proposed delivery contract

Implementation instruction: Define load verification.
Reviewable artifact: Load evaluation protocol.
Acceptance criterion: Targets use reproducible realistic fixtures.
Input dependency: Telemetry and packet cost model.
Scope constraint: Scale after measured demand, not forecast hype.
Risk to control: Unbounded OCR or repeated evaluation costs.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Per-packet processing cost is measurable by workload class.
Completion record: JF-03-16-D5, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-16-D5-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “load evaluation protocol” against “targets use reproducible realistic fixtures”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D5-A1; unresolved failure keeps this exposure scope open.

##### JF-03-16-D5-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “load evaluation protocol” against “targets use reproducible realistic fixtures”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D5-A2; unresolved failure keeps this exposure scope open.

##### JF-03-16-D5-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “load evaluation protocol” against “targets use reproducible realistic fixtures”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D5-A3; unresolved failure keeps this exposure scope open.

##### JF-03-16-D5-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “load evaluation protocol” against “targets use reproducible realistic fixtures”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D5-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver load evaluation protocol to the next dependent owner with JF-03-16-D5 and its acceptance evidence.
Before exposure, resolve unbounded ocr or repeated evaluation costs for the approved scope; communicate remaining limitations.

### JF-03-16-D6 — Define scale triggers

#### Proposed delivery contract

Implementation instruction: Define scale triggers.
Reviewable artifact: Capacity decision rules.
Acceptance criterion: Observed saturation justifies infrastructure changes.
Input dependency: Telemetry and packet cost model.
Scope constraint: Scale after measured demand, not forecast hype.
Risk to control: Unbounded OCR or repeated evaluation costs.
Accountable role and phase: Technical lead; MVP.
Measurement relationship: Per-packet processing cost is measurable by workload class.
Completion record: JF-03-16-D6, artifact revision, reviewer, measured outcome and outstanding limits.

#### Acceptance situations

##### JF-03-16-D6-A1 — Normal operation

Given the authorized request and its required dependencies are available, evaluate “capacity decision rules” against “observed saturation justifies infrastructure changes”.
Then: Produce the specified artifact under the declared version and tenant boundary.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D6-A1; unresolved failure keeps this exposure scope open.

##### JF-03-16-D6-A2 — Dependency loss

Given a required database, queue, storage service or worker is unavailable, evaluate “capacity decision rules” against “observed saturation justifies infrastructure changes”.
Then: Expose a retriable or terminal error according to the operation contract.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D6-A2; unresolved failure keeps this exposure scope open.

##### JF-03-16-D6-A3 — Duplicate delivery

Given the same operation is delivered twice after an acknowledgement is lost, evaluate “capacity decision rules” against “observed saturation justifies infrastructure changes”.
Then: Apply the effect once and return the existing operation result.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D6-A3; unresolved failure keeps this exposure scope open.

##### JF-03-16-D6-A6 — Recovery after failure

Given a failed operation is resumed after dependencies recover, evaluate “capacity decision rules” against “observed saturation justifies infrastructure changes”.
Then: Resume from the recorded checkpoint and preserve original correlation and cost records.
Review evidence: link the input revision, outcome and reviewer to JF-03-16-D6-A6; unresolved failure keeps this exposure scope open.

#### Handoff

Deliver capacity decision rules to the next dependent owner with JF-03-16-D6 and its acceptance evidence.
Before exposure, resolve unbounded ocr or repeated evaluation costs for the approved scope; communicate remaining limitations.

### Workstream completion review

Confirm all six JF-03-16 deliverables have reviewed artifacts.
Confirm the predecessor remains valid: Telemetry and packet cost model.
Confirm measured evidence for: Per-packet processing cost is measurable by workload class.
Confirm the intended scope remains: Scale after measured demand, not forecast hype.
Confirm the owner has addressed: Unbounded OCR or repeated evaluation costs.
Link relevant master-plan decisions before moving JF-03-16 into a later phase.
If this workstream is deferred, state the user-visible effect and the reason for deferral.

