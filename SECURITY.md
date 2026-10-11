# Security and sensitive data

This is a local development MVP. Use synthetic documents until the public release gates are approved.

Do not attach identity documents, certificates, private reports, credentials or database files to public issues. Contact the repository owner privately before sharing sensitive reproduction material. Synthetic reproduction steps are preferred.

Current controls include authenticated ownership checks, CSRF tokens, HTTP-only same-site sessions, salted password hashing, file envelope and parser limits, quarantined originals, revision checks and deletion workflows. Production additionally requires malware scanning, a verified Linux parser namespace sandbox and encrypted scheduled backups. Worker output is schema-checked and bounded. A kernel workspace lock prevents accidental duplicate SQLite runtimes. These controls are not an independent security certification.

The host policy and limits are documented in [parser isolation](deploy/SANDBOX.md). Production startup fails if namespace isolation is unavailable. Public hosting, independent security review, volume encryption verification and the remaining [release gates](docs/engineering/RELEASE_GATES.md) require separate evidence; no forensic erasure guarantee is claimed.
