# Security and sensitive data

This is a local development MVP. Use synthetic documents until the public release gates are approved.

Do not attach identity documents, certificates, private reports, credentials or database files to public issues. Contact the repository owner privately before sharing sensitive reproduction material. Synthetic reproduction steps are preferred.

Current controls include authenticated ownership checks, CSRF tokens, HTTP-only same-site sessions, salted password hashing, file envelope and parser limits, quarantined originals, separate inspection processes, revision checks and deletion workflows. These are implemented controls, not an independent security certification.

The production requirements and current limitations are recorded in [release gates](docs/engineering/RELEASE_GATES.md). No hosted production application, public authentication service, forensic erasure guarantee or complete parser sandbox is claimed.
