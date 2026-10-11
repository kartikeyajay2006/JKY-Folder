# Monitoring and capacity evidence

Operational metrics are separate from applicant activity. `/api/ops/metrics` is disabled unless `MONITOR_TOKEN` is configured. It requires a dedicated bearer token (32–256 URL-safe random characters), is rate-limited, has `no-store` and never accepts an applicant session as authentication. Labels use fixed request groups and status families; no document contents, identifiers, emails, filenames, IP addresses or URL queries enter metrics.

The supplied [Prometheus configuration](../../deploy/monitoring/prometheus.yml) scrapes every 15 seconds and evaluates [alert rules](../../deploy/monitoring/alerts.yml). [Prometheus authorization](https://prometheus.io/docs/prometheus/latest/configuration/configuration/) reads the token from a mounted credential file. Set the same value privately in the app environment. Keep the host file owner-readable only by the intended runtime identity; standalone Compose secret mounts do not necessarily remap file ownership. Verify the scrape rather than relaxing access to a production secret. Start with the base Compose, the required host policy override and `-f deploy/compose.monitoring.yml`. Set `MONITOR_TOKEN_FILE` to the absolute private credential file. Monitoring UIs bind only loopback.

Alerts cover runtime/scrape loss, server errors, scanner outages, inspection failures/backlog, email and push failures, unavailable/low disk, event-loop delay, backup failure and stale repository acknowledgements. Initial queue/latency/disk thresholds are conservative starting values; tune them using measured workload and documented recovery targets. API RSS excludes parser children. Counters restart with the API; persisted queue counts and backup acknowledgements survive restart.

The supplied Alertmanager receiver deliberately sends no external notification. A public deployment needs an accountable on-call receiver configured according to [Alertmanager documentation](https://prometheus.io/docs/alerting/latest/configuration/), with credentials mounted privately. Test a runtime outage, unavailable scanner and failed backup against that receiver, acknowledge receipt, resolve the injected fault and verify the resolution. Record the release, environment, alert, receiver, observed times and operator privately. Rule syntax and simulated alert firing do not prove actual receiver delivery. No message has been sent to an outside person by this setup.

Validate rules locally with the pinned tooling used in CI:

```sh
docker run --rm --network none --entrypoint promtool \
  -v "$PWD/deploy/monitoring:/etc/prometheus:ro" prom/prometheus:v3.5.0 \
  check rules /etc/prometheus/alerts.yml
docker run --rm --network none --entrypoint promtool -w /etc/prometheus \
  -v "$PWD/deploy/monitoring:/etc/prometheus:ro" prom/prometheus:v3.5.0 \
  test rules alerts.test.yml
```
