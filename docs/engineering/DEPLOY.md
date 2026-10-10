# Deployment

JKY-Folder runs as one Node.js service that serves both the web app and the API, with private data on one persistent disk. That suits a private pilot of a few hundred students; larger deployments need the production database and object-storage work listed in the [release gates](RELEASE_GATES.md).

## What you need

- A server or container host with a persistent disk (10 GB is plenty to start).
- A domain name and HTTPS. Production refuses to start without an `https://` `APP_ORIGIN`.
- An SMTP account for email (password reset, guardian approval, reminders). Without it, under-18 sign-up and password reset are unavailable in production.
- A long random `BACKUP_PASSWORD` (16+ characters), stored somewhere other than the server.

## Option 1: any small server with Docker (automatic HTTPS)

```sh
git clone https://github.com/kartikeyajay2006/JKY-Folder.git && cd JKY-Folder
cp .env.example .env
# Edit .env: NODE_ENV=production, APP_ORIGIN=https://your-domain, SMTP_*, MAIL_FROM,
# BACKUP_PASSWORD, VAPID_SUBJECT=mailto:you@your-domain, CLAMAV_HOST=clamav
DOMAIN=your-domain docker compose --profile https --profile scan up -d
```

Point the domain's DNS A record at the server first; Caddy then obtains and renews the certificate. The app listens only on `127.0.0.1:3001` inside the server; Caddy is the only public entry. Leave out `--profile scan` (and `CLAMAV_HOST`) to run without virus scanning, which is not recommended once real documents arrive.

Update with `git pull && docker compose --profile https --profile scan up -d --build`.

## Option 2: Render

1. In Render, choose **New → Blueprint** and select this repository. [`render.yaml`](../../render.yaml) creates the web service, a 10 GB disk at `/data`, health checks on `/api/health` and a generated backup password.
2. Fill in `APP_ORIGIN` (for example `https://jky-folder.onrender.com`, or your own domain), the SMTP values and `VAPID_SUBJECT`.
3. Deploy. Render provides HTTPS. For virus scanning, run a ClamAV private service and set `CLAMAV_HOST` to its internal address.

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
| `BACKUP_DIR`, `BACKUP_PASSWORD`, `BACKUP_INTERVAL_HOURS`, `BACKUP_KEEP` | Scheduled encrypted backups (default every 24 hours, newest 7 kept) |

## Backups and recovery

Scheduled backups are encrypted with AES-256-GCM and written to `BACKUP_DIR`. They live on the same disk unless you copy them elsewhere; copy them off the server regularly (object storage or another machine) so a lost disk is recoverable. Restore with `npm run backup -- restore <file> <new-directory>` as described in the [runbook](RUNBOOK.md); restores replay the deletion ledger so erased documents stay erased.

## Health and monitoring

`GET /api/health` returns `{"status":"ok"}` only when the database answers, and the Docker image uses it as its health check. Logs are deliberately terse event names (`backup.completed`, `scan.unavailable`, `mail.worker_failed`) and never contain document contents, tokens or email bodies. Alert on `scan.unavailable` and `backup.failed`.

## Before real students use it

Use the [release gates](RELEASE_GATES.md) as the checklist: independent rule-pack review, legal review of privacy and the under-18 policy, an outside security test, and a small pilot.
