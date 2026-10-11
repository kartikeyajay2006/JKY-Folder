# Monitoring and capacity evidence

Operational metrics are separate from applicant activity. `/api/ops/metrics` is disabled unless `MONITOR_TOKEN` is configured. It requires a dedicated bearer token (32–256 URL-safe random characters), is rate-limited, has `no-store` and never accepts an applicant session as authentication. Labels use fixed request groups and status families; no document contents, identifiers, emails, filenames, IP addresses or URL queries enter metrics.

The supplied [Prometheus configuration](../../deploy/monitoring/prometheus.yml) scrapes every 15 seconds and evaluates [alert rules](../../deploy/monitoring/alerts.yml). [Prometheus authorization](https://prometheus.io/docs/prometheus/latest/configuration/configuration/) reads the token from a mounted credential file. Set the same value privately in the app environment. Keep the host file owner-readable only by the intended runtime identity; standalone Compose secret mounts do not necessarily remap file ownership. Verify the scrape rather than relaxing access to a production secret. Start with the base Compose, the required host policy override and `-f deploy/compose.monitoring.yml`. Set `MONITOR_TOKEN_FILE` to the absolute private credential file. Monitoring UIs bind only loopback.

Alerts cover runtime/scrape loss, server errors, scanner outages, inspection failures/backlog, email and push failures, unavailable/low disk, event-loop delay, backup failure and stale repository acknowledgements. Initial queue/latency/disk thresholds are conservative starting values; tune them using measured workload and documented recovery targets. API RSS excludes parser children. Counters restart with the API; persisted queue counts and backup acknowledgements survive restart.

The supplied Alertmanager receiver deliberately sends no external notification. A public deployment needs an accountable on-call receiver configured according to [Alertmanager documentation](https://prometheus.io/docs/alerting/latest/configuration/), with credentials mounted privately. Test a runtime outage, unavailable scanner and failed backup against that receiver, acknowledge receipt, resolve the injected fault and verify the resolution. Record the release, environment, alert, receiver, observed times and operator privately. Rule syntax and simulated alert firing do not prove actual receiver delivery. No message has been sent to an outside person by this setup.

Validate rules locally with the pinned tooling used in CI:

```sh
docker run --rm --network none --entrypoint promtool \
  -v "$PWD/deploy/monitoring:/etc/prometheus:ro" prom/prometheus:v3.15.0 \
  check rules /etc/prometheus/alerts.yml
docker run --rm --network none --entrypoint promtool -w /etc/prometheus \
  -v "$PWD/deploy/monitoring:/etc/prometheus:ro" prom/prometheus:v3.15.0 \
  test rules alerts.test.yml
```

## Reproducible capacity measurements

`npm run capacity -- --concurrency 3 --rounds 3 --out /private/capacity.json` starts one disposable loopback runtime and creates synthetic adult accounts. Concurrent clients upload actual native PDFs, scanned PDFs and JPEGs, wait for extraction, verify downloaded original bytes and erase their accounts. No existing URL or personal `DATA_DIR` is used. Bounds are 1–8 clients, 1–10 documents per client and a finite total time budget. `--sandbox` requires the actual OS boundary.

Reports include upload response and queued inspection latency by document kind (p50/p95/max), documents per minute, observed API and process-tree RSS, workspace bytes, free space and enclosing cgroup CPU/memory ceilings. RSS sampling runs every 50 ms and can miss short peaks; summing process RSS double-counts shared pages. Host RAM/CPU information is context, not a claim about container limits. Synthetic OCR and a scanner protocol fixture do not measure representative uploads or the real ClamAV engine.

Run the same command inside the restricted production image, with the [sandbox limits](../../deploy/SANDBOX.md), as `node_modules/tsx/dist/cli.mjs server/capacity.ts --sandbox --concurrency 3 --rounds 3 --out /tmp/capacity.json`. Capture the report privately before removing the container. For each actual deployment, agree acceptable upload/inspection p95, maximum queue delay and recovery targets first. Repeat at rising concurrency with consented synthetic equivalents of realistic page counts/file sizes; record the exact release and host policy. Saturation must produce queued or explicit error states rather than successful checks. Do not extrapolate this small baseline to unlimited traffic or multiple runtimes.

## Actual local alert-delivery drill

With Docker available, pull the pinned `prom/prometheus:v3.15.0` and `prom/alertmanager:v0.34.1` images, then run `npm run monitoring:drill -- --out /private/alert-drill.json`. The tool creates a disposable app, metrics credential, private configuration and two named monitoring containers. Containers use host networking solely to reach loopback fixtures; their web listeners and the webhook receiver bind loopback, clustering is disabled, capabilities are dropped and the root filesystem is read-only. Production Compose keeps its separate network configuration.

The drill stops/restarts the real HTTP listener, injects backup failure state and queues a real synthetic original against an unavailable scanner fixture. It requires firing and resolved notifications for all three faults through actual Prometheus → Alertmanager → local webhook delivery. Only disposable drill timings/lookback windows are shortened; production rules and their full-duration rule tests remain unchanged. Containers and synthetic storage are removed after completion. SIGINT/SIGTERM request cleanup during a run; after a hard kill, remove only the matching `jky-drill-*` containers and the deliberately disposable `jky-alert-drill-*` directory.

This proves the local notification mechanism. It does not prove a real on-call recipient received an alert, an actual backup provider failed, or the ClamAV engine was exercised. Those observations belong in the signed operations/hosting assessment. Private metrics rate limits accommodate the accelerated one-second scrape while remaining bounded.
