# Deployment

JKY-Folder supports one Linux Node.js service serving the web app and API, with private data on persistent storage. A kernel lock rejects a second runtime on the same workspace. Capacity still needs measurement; distributed deployments require database, object-storage and coordination changes. Production requires the verified [parser host policy](../../deploy/SANDBOX.md), ClamAV, SMTP and encrypted scheduled backups.

## What you need

- A compatible Linux server with persistent storage, working user namespaces and an independently reviewed security policy. Verify encryption of the complete data and backup volumes, including SQLite, upload chunks and temporary storage; private file permissions do not establish encryption.
- A domain name and HTTPS. Production refuses to start without an `https://` `APP_ORIGIN`.
- An SMTP account for email (password reset, guardian approval, reminders). Without it, under-18 sign-up and password reset are unavailable in production.
- A long random `BACKUP_PASSWORD` (16+ characters), stored somewhere other than the server.

## Compatible Linux server with Docker (automatic HTTPS)

```sh
git clone https://github.com/kartikeyajay2006/JKY-Folder.git && cd JKY-Folder
cp .env.example .env
# Edit .env: NODE_ENV=production, APP_ORIGIN=https://your-domain, SMTP_*, MAIL_FROM,
# BACKUP_PASSWORD, VAPID_SUBJECT=mailto:you@your-domain, CLAMAV_HOST=clamav
# Configure a physically separate RESTIC_REPOSITORY and its credentials; initialise once.
DOMAIN=your-domain docker compose --profile https --profile scan up -d
```

Point the domain's DNS A record at the server first; Caddy then obtains and renews the certificate. The app binds all interfaces inside its container, while its host port is restricted to `127.0.0.1:3001`; Caddy is the public entry. Production refuses to start without scanning configuration or a working parser sandbox. For Ubuntu AppArmor hosts, first load the supplied policy and add the override as described in [parser isolation](../../deploy/SANDBOX.md). Do not disable host policies or use a privileged container to bypass a failed probe.

Update with `git pull && docker compose --profile https --profile scan up -d --build`.

## Managed hosts, including Render

1. First verify that the host supports the required unprivileged namespace and seccomp/AppArmor policy. The supplied Render blueprint is a starting configuration, not a verified working deployment; a provider that prohibits those controls needs a separately isolated parser adapter. There is no unsandboxed production fallback.
2. If compatible, [`render.yaml`](../../render.yaml) describes the web service, persistent disk, health check and generated backup password.
3. Fill in `APP_ORIGIN` (for example `https://jky-folder.onrender.com`, or your own domain), the SMTP values and `VAPID_SUBJECT`.
4. Deploy only after the host probe passes. Render provides HTTPS. For virus scanning, run a ClamAV private service and set `CLAMAV_HOST` to its internal address.

## Settings

| Variable | Purpose |
| --- | --- |
| `NODE_ENV=production` | Secure cookies, no development outbox, strict origin checks |
| `APP_ORIGIN` | The public `https://` address; used in emails and origin checks |
| `HOST`, `PORT`, `DATA_DIR` | Set by the Docker image to `0.0.0.0`, `3001`, `/data` |
| `TRUST_PROXY` | Hops of trusted proxies (`1` behind Caddy or Render) so rate limits see real client addresses |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Email delivery; port 465 uses TLS, others STARTTLS |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Web Push; keys are generated into `DATA_DIR/vapid.json` if unset |
| `CLAMAV_HOST`, `CLAMAV_PORT` | Virus scanning with clamd before any file is inspected |
| `INSPECTION_MODE` | Production requires `bubblewrap`; development defaults to `process` |
| `BACKUP_DIR`, `BACKUP_PASSWORD`, `BACKUP_INTERVAL_HOURS`, `BACKUP_KEEP` | Scheduled encrypted backups (default every 24 hours, newest 7 kept) |
| `RESTIC_REPOSITORY`, `RESTIC_PASSWORD` or `RESTIC_PASSWORD_FILE` | Automatic encrypted repository uploads; provider credentials remain private |

## Backups and recovery

Scheduled backups are encrypted with AES-256-GCM. When a restic repository is configured, each completed archive is uploaded before local retention pruning; failed uploads retain the local archive. Initialise the repository once with `npm run backup:offsite -- init`, then verify it with `npm run backup:offsite -- check`. Repository passwords and archive passwords are separate secrets kept outside the server. A same-disk test repository verifies the mechanism, not off-site disaster protection.

The newest deletion ledger is mirrored every 15 seconds while the service is running, separately from full archives. Network outages extend that interval; this is not zero-loss erasure replication. `DATA_DIR/offsite-status.json` records acknowledged snapshot IDs and times. Recover offline using both the selected archive and the newest ledger snapshot plus any newer surviving ledger. Verify the erasure boundary before opening recovered data. [Recovery operations](RUNBOOK.md) explain the commands; staging, database checks and exact object hashes prevent partially restored workspaces from being published.

No remote retention policy is applied automatically: keep/forget/prune decisions need an approved retention period. In particular, restic snapshots can retain erased bytes until the approved expiry/prune. Protect both the repository and decrypted restore directories.

## Verification commands

```sh
# Inside the configured runtime. --smtp authenticates with TLS but sends no email.
npm run readiness -- preflight --smtp --repository --out /private/preflight.json
# Read-only checks on the actual HTTPS deployment.
npm run readiness -- smoke https://your-domain --out /private/smoke.json
# Explicitly creates and erases one synthetic adult account, with no email sends.
npm run readiness -- smoke https://your-domain --journey --out /private/journey.json
```

Reports distinguish checked controls from pending evidence. Local `--local` HTTP checks do not certify HTTPS; SMTP authentication does not establish inbox delivery. Verify password reset, guardian email and reminders in the actual inbox, and Web Push on the intended Chrome/Firefox/Safari devices while the app is closed. Follow the [pilot and outside-review packet](PILOT_AND_EXTERNAL_REVIEW.md) before enabling real applicants.

## Health and monitoring

`GET /api/health` returns `{"status":"ok"}` only when the database answers, and the Docker image uses it as its health check. Logs are deliberately terse event names (`backup.completed`, `scan.unavailable`, `mail.worker_failed`) and never contain document contents, tokens or email bodies. Alert on `scan.unavailable` and `backup.failed`.

## Before real students use it

Use the [release gates](RELEASE_GATES.md) as the checklist: independent rule-pack review, legal review of privacy and the under-18 policy, an outside security test, and a small pilot.

## Validate Docker locally with disposable fixtures

This does not need a public domain or SMTP credentials. It builds the production image and executes actual isolated parsing, fresh-account intake and encrypted repository/recovery tests with synthetic originals and a scanner protocol fixture. The test runner does not serve the normal API, so its image health check is not an application availability result.

```sh
docker build -t jky-folder:verification .
docker run --rm --read-only --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --security-opt seccomp=deploy/parser-host-seccomp.json \
  --tmpfs /tmp:size=512m,mode=1777 \
  --pids-limit 256 --memory 2g --memory-swap 2g --cpus 2 \
  -e XDG_DATA_HOME=/tmp/.local/share \
  -e TEST_OS_SANDBOX=1 -e TEST_DEPLOYMENT_SMOKE=1 \
  -e TEST_RESTIC_BINARY=/usr/bin/restic \
  --entrypoint node jky-folder:verification \
  node_modules/vitest/vitest.mjs run --configLoader runner \
  --fsModuleCachePath /tmp/vitest-cache \
  tests/isolation.test.ts tests/offsite.test.ts \
  tests/deployment.test.ts tests/recovery.test.ts
```

On AppArmor hosts, first load the supplied policy and also add `--security-opt apparmor=jky-parser-host`. CI exercises this policy on Ubuntu 24.04. Local repository fixtures verify exact recovery mechanics; they do not establish separate off-site durability, actual ClamAV feed availability, inbox delivery or public HTTPS. The repository integrity rehearsal allows five minutes for encryption and checksum work under the container CPU budget.
