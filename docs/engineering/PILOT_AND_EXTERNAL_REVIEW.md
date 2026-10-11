# Private pilot and external review packet

Use synthetic documents until source/correctness approval, hosting verification and the relevant external reviews are complete. This packet prepares the work; it is not a record that students or qualified reviewers have performed it. Keep completed findings outside Git in an owner-only directory.

## Evidence to collect

| Work | Material | Evidence required |
| --- | --- | --- |
| Official rules and correctness | [Independent review workflow](INDEPENDENT_REVIEW.md), original sources, private workbooks | Registered independent signatures, exact source scope, complete separately labelled cases and adjudication where needed |
| Live service | [Deployment](DEPLOY.md), `npm run readiness -- preflight`, `readiness -- smoke` | Report for actual HTTPS host, SMTP/inbox outcomes, real-device push, repository check and recovery rehearsal |
| Security | [Security policy](../../SECURITY.md), [sandbox configuration](../../deploy/SANDBOX.md), API tests and production configuration | Outside tester's identity/date/scope, findings, reproducible synthetic cases and closure/retest evidence |
| Privacy and guardian policy | Account entry text, guardian approval/withdrawal screens, retention and recovery runbook | Qualified reviewer decisions on notices, permissions, provider arrangements, guardian email verification and retention; unresolved items stay open |
| Accessibility | Existing axe/browser checks, keyboard routes, account/upload/review dialogs | Consented assistive-technology sessions and a scoped outside audit; automated tests alone do not establish conformance |
| Student pilot | Tasks below, synthetic packet originals and Help → Contact support | Consented observations, blocked tasks, correction accuracy and resolved defects, recorded without applicant documents |

## External security test scope

Use two disposable accounts to test cross-account packet/document/library/report/support access. Exercise expired/reused password links, CSRF and origin rejection, account/session changes, guardian processing locks and revocation of support access. Check crafted filenames, MIME mismatches, malformed/large PDFs, oversized worker output and scanner outages. Confirm the sandbox cannot read database/credentials/other originals, write its input, contact the host or survive its time/resource budget. Test crash restart, duplicate runtime refusal, failed recovery, newest deletion replay and reviewer revocation after recovery. Test the actual deployment policies, not only a local configuration file. Record critical findings before enabling real-document intake.

## Student tasks

1. Register an adult test account. Confirm there are no applications, checklists, documents, reports, reminders or visible activity before upload.
2. Upload the synthetic PDF from a phone. Interrupt the network and resume from the saved offset; cancel another upload. Confirm rejected intake does not create an empty folder.
3. Upload instructions, inspect page anchors, correct a proposal and explicitly confirm the resulting checklist. Explain the distinction between a suggested item and a reviewed official rule.
4. Link required multi-form evidence, test an accepted alternative, confirm extracted facts and correct a value. Find the original page and revision history.
5. Create a report with missing evidence and an unknown profile answer. Confirm neither is shown as a successful requirement. Remove evidence and confirm stale/deleted data cannot reappear in reports.
6. Recover the test password through the actual inbox; old sessions must stop working. Verify email, opt into one reminder and check delivery with the app closed. Record browser/OS and notification permission state.
7. Contact support without originals, optionally grant time-limited access, revoke it and confirm subsequent operator access is denied. Record no private documents in the observation notes.
8. Delete the final original, then the account. Confirm the workspace returns to upload entry and the account cannot sign in. Run the separate recovery rehearsal with a newer deletion ledger.

## Findings format and exit decision

For each session record a pseudonymous ID, consent date, device/browser, task IDs, completed/blocked status, description of the issue, severity, reproducible synthetic steps, and retest result. Do not record names, dates of birth, email addresses, recovery links or originals in these notes. Avoid session recordings until recording-specific consent and retention have been reviewed.

Any false successful result, cross-account disclosure, missing erasure, account takeover or unprocessed guardian restriction blocks a real-document pilot until fixed and retested. Track usability failures separately and retest their tasks. An operator signs the decision with its exact release commit and links to the real evidence. Do not substitute generated fixture results for outside findings, paid demand or student outcomes. Set retention and participant count with the responsible reviewer before recruiting; no participants have been invented for this repository.
