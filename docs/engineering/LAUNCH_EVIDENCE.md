# Recorded launch evidence

The current application does not claim public readiness from automated test success. `npm run launch:evidence` combines the exact independently published source pack, actual evaluation against registered reviewer labels and signed records for deployment, storage, operations, security, privacy, accessibility and a consented pilot. Missing records stay pending; invalid, expired, revoked or changed records fail. Exit code 2 means gates remain open. This is an evidence checker, not legal advice, certification or proof that a reviewer actually performed the work.

## Freeze the scope

Create a private, non-secret environment JSON with these exact fields: `deploymentId`, HTTPS `origin`, `hostPolicyHash` (SHA-256 of the actual reviewed host policy), `storageDescription`, `repositoryDescription`, `scannerVersion`, `smtpProvider`, and `pushBrowsers` (browser/OS descriptions). Descriptions must identify the environment, not contain credentials. No password/token fields are accepted. Use the actual release checkout:

```sh
npm run launch:evidence -- target /private/environment.json /private/target.json
```

The target binds the Git commit, a content hash of software/dependency/deployment files, and the non-secret environment hash. The report CLI checks the current software hash. Changes to software or environment invalidate older assessment scopes; obtain a new review rather than editing signed evidence. For a Docker checkout without Git metadata, set `RELEASE_COMMIT` to the actual image build commit. This value identifies the release; content hashes independently bind the files.

## Outside assessment records

The actual reviewer creates one JSON record per gate with:

- `version: 1`, a supported `gate`, the exact `target`, accountable `author` and different `reviewer`, and `independenceAttested: true`.
- `qualificationEvidence` explaining the separately verified qualification/scope; `observedAt` and `expiresAt` in ISO UTC. Approval lasts at most 90 days and is invalid after expiry.
- `tasks`: exactly the gate's task IDs below, each with `outcome` (`passed`, `failed` or `pending`) and a substantive observation of at least 40 characters. No task may be silently omitted.
- `openCritical` and `openHigh` counts. Nonzero counts block approval.
- `evidence`: relative paths and SHA-256 hashes for actual private attachments. Distinct files must remain inside the evidence directory, including symlink resolution. Each file is at most 64 MiB; total attachments at most 256 MiB. Never include applicant originals, emails, tokens or unnecessary participant identifiers.
- A `correctness` record also supplies the exact `benchmarkHash` of the actually executed manifest. It records privately frozen cases and separate authorship; the ordinary public regression corpus cannot establish this evidence.
- A `pilot` record also supplies `pilot: { plannedParticipants, observedParticipants, consentRecorded: true, unresolvedBlockingTasks }`. Observations must meet the approved participant plan, and every blocking task must be resolved/retested. Counts are actual observations, not generated fixtures.

| Gate | Required task IDs |
| --- | --- |
| correctness | private_manifest_frozen, separate_authorship, representative_boundaries |
| hosting | https_origin, secure_sessions, password_reset_inbox, guardian_inbox, reminder_inbox, closed_browser_push, scanner_engine |
| storage | volume_encryption, separate_failure_domain, retention_and_erasure, recovery_rehearsal, erasure_boundary |
| operations | on_call_receiver, outage_alert_drill, backup_alert_drill, capacity_budget, incident_owner |
| security | cross_account_access, session_and_link_replay, csrf_and_origins, parser_boundary, malware_and_limits, deletion_recovery, support_revocation |
| privacy | qualified_review, processing_notice, guardian_policy, processor_agreements, retention_notice |
| accessibility | keyboard, screen_reader, mobile_zoom, reduced_motion, error_recovery |
| pilot | consent, task_observations, correction_accuracy, blocked_tasks_retested, exit_decision |

The operator verifies the real reviewer identity, key, qualifications and independence using the existing [reviewer registry](INDEPENDENT_REVIEW.md). The reviewer signs their completed assessment using their own owner-only Ed25519 key:

```sh
npm run launch:evidence -- sign /private/security.json /private/reviewer.pem /private/security.signed.json
```

This signature uses a distinct launch-assessment domain; source-pack, benchmark and adjudication signatures cannot be substituted. Revoked or recovery-cleared registrations no longer authorize records. A valid signature establishes possession of the registered key, not the truth of observations or professional credentials. The accountable operator checks those separately. No real external assessments have been fabricated or signed by the development agent.

## Evaluate the bundle

The bundle JSON contains `target`, `packId`, `packVersion`, optional file paths `manifest`, `labels`, `adjudication`, an `assessments` array of signed JSON file paths and `evidenceDirectory`. `manifest` is the raw frozen version-3 manifest, not its export envelope; extract it while preserving its hash. Labels and any adjudication retain their registered signatures. The source-pack approval is read and reverified from the selected `DATA_DIR`.

```sh
DATA_DIR=/private/runtime npm run launch:evidence -- report /private/bundle.json /private/launch-report.json
```

The checker re-executes every independently labelled case, requires exact official-pack profile/evidence coverage and zero mismatches/critical false passes, and binds held-out-authorship evidence to the same manifest. A generic signed checklist cannot replace official source review or correctness execution. Every outside record must match the frozen target and actual attachment bytes. Duplicate/malformed assessments fail rather than disappearing from the report. A final `ready: true` means this selected release's recorded gates passed, subject to operator verification of the real evidence and any additional launch requirements. Deferred scaling, payments, new packs and other business features are separate scope decisions.
