import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createServer as netServer } from 'node:net';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { randomUUID, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createApp } from './app';
import { writeOperationalState } from './operational-state';
import { PDFDocument } from 'pdf-lib';
const delay = (ms: number) => new Promise((done) => setTimeout(done, ms));
async function port() {
  const server = netServer();
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const value = (server.address() as { port: number }).port;
  await new Promise<void>((done) => server.close(() => done()));
  return value;
}
async function docker(args: string[]) {
  return new Promise<void>((done, error) => {
    const child = spawn('docker', args, { stdio: 'ignore' });
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      error(Error('Docker control timed out.'));
    }, 15000);
    child.once('error', () => {
      clearTimeout(timer);
      error(Error('Docker is unavailable.'));
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      code === 0 ? done() : error(Error('Docker monitoring fixture failed to start or stop.'));
    });
  });
}
/** Exercises actual Prometheus -> Alertmanager -> local webhook delivery, using disposable faults. */
export async function monitoringDrill() {
  const cancellation = new AbortController();
  const interrupt = () => cancellation.abort(Error('Monitoring drill interrupted.'));
  process.once('SIGINT', interrupt);
  process.once('SIGTERM', interrupt);
  const directory = mkdtempSync(join(tmpdir(), 'jky-alert-drill-')),
    configuration = join(directory, 'config'),
    token = randomBytes(32).toString('hex');
  mkdirSync(configuration, { mode: 0o700 });
  const names = {
    prometheus: 'jky-drill-prom-' + randomUUID(),
    alertmanager: 'jky-drill-alert-' + randomUUID(),
  };
  const receipts: { name: string; status: string }[] = [],
    stages: { fault: string; firing: boolean; resolved: boolean }[] = [];
  let scannerUnavailable = false;
  const runtime = createApp({
    dataDir: join(directory, 'data'),
    background: false,
    monitoring: { token, backupDir: join(directory, 'data') },
    scan: async () =>
      scannerUnavailable
        ? { status: 'unavailable', reason: 'Synthetic outage' }
        : { status: 'clean' },
  });
  let api = runtime.app.listen(0, '127.0.0.1'),
    apiPort = 0;
  const receiver = createServer((req, res) => {
    if (req.url !== '/synthetic-alerts' || req.method !== 'POST') {
      res.writeHead(404).end();
      return;
    }
    let bytes = 0,
      text = '';
    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > 65536) {
        req.destroy();
        return;
      }
      text += chunk.toString();
    });
    req.on('end', () => {
      try {
        const body = JSON.parse(text);
        if (!Array.isArray(body.alerts)) throw Error();
        for (const alert of body.alerts) {
          if (
            typeof alert.labels?.alertname === 'string' &&
            ['firing', 'resolved'].includes(alert.status)
          )
            receipts.push({ name: alert.labels.alertname, status: alert.status });
        }
        res.writeHead(204).end();
      } catch {
        res.writeHead(400).end();
      }
    });
  });
  await new Promise<void>((done) => receiver.listen(0, '127.0.0.1', done));
  try {
    if (!api.listening)
      await new Promise<void>((done, error) => {
        api.once('listening', done);
        api.once('error', error);
      });
    apiPort = (api.address() as { port: number }).port;
    const prometheusPort = await port(),
      alertmanagerPort = await port(),
      receiverPort = (receiver.address() as { port: number }).port;
    // Accelerated timing only in the disposable drill; production rules are unchanged.
    const rules = readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), '../deploy/monitoring/alerts.yml'),
      'utf8',
    )
      .replace(/for: \d+m/g, 'for: 2s')
      .replace(/\[(5|10)m\]/g, '[5s]');
    writeFileSync(join(configuration, 'alerts.yml'), rules, { mode: 0o600 });
    writeFileSync(join(configuration, 'token'), token, { mode: 0o600 });
    writeFileSync(
      join(configuration, 'prometheus.yml'),
      `global:\n  scrape_interval: 1s\n  evaluation_interval: 1s\nrule_files: [/config/alerts.yml]\nalerting:\n  alertmanagers:\n    - static_configs:\n        - targets: ['127.0.0.1:${alertmanagerPort}']\nscrape_configs:\n  - job_name: jky-folder\n    metrics_path: /api/ops/metrics\n    authorization:\n      credentials_file: /config/token\n    static_configs:\n      - targets: ['127.0.0.1:${apiPort}']\n`,
      { mode: 0o600 },
    );
    writeFileSync(
      join(configuration, 'alertmanager.yml'),
      `route:\n  receiver: synthetic-local\n  group_by: [alertname]\n  group_wait: 1s\n  group_interval: 1s\n  repeat_interval: 1m\nreceivers:\n  - name: synthetic-local\n    webhook_configs:\n      - url: http://127.0.0.1:${receiverPort}/synthetic-alerts\n        send_resolved: true\n`,
      { mode: 0o600 },
    );
    const common = [
      'run',
      '-d',
      '--rm',
      '--network',
      'host',
      '--read-only',
      '--cap-drop',
      'ALL',
      '--security-opt',
      'no-new-privileges:true',
      '--user',
      `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`,
      '--tmpfs',
      '/tmp:size=128m,mode=1777',
      '--pids-limit',
      '64',
      '--memory',
      '256m',
      '--mount',
      `type=bind,src=${configuration},dst=/config,readonly`,
    ];
    await docker([
      ...common,
      '--name',
      names.alertmanager,
      'prom/alertmanager:v0.34.1@sha256:e9733bafb1bdef9b00e25a21f8f99dc26a22224bf16641ad754d1649f4c3357a',
      '--config.file=/config/alertmanager.yml',
      '--storage.path=/tmp/alerts',
      `--web.listen-address=127.0.0.1:${alertmanagerPort}`,
      '--cluster.listen-address=',
    ]);
    await docker([
      ...common,
      '--name',
      names.prometheus,
      'prom/prometheus:v3.15.0@sha256:efd719c99d83b060d9daefdcf00360461adf279f45ef5391f8d111892118753e',
      '--config.file=/config/prometheus.yml',
      '--storage.tsdb.path=/tmp/prometheus',
      `--web.listen-address=127.0.0.1:${prometheusPort}`,
    ]);
    for (const p of [prometheusPort, alertmanagerPort]) {
      cancellation.signal.throwIfAborted();
      let ready = false;
      for (let n = 0; n < 50; n++) {
        cancellation.signal.throwIfAborted();
        try {
          ready = (
            await fetch(`http://127.0.0.1:${p}/-/ready`, { signal: AbortSignal.timeout(1000) })
          ).ok;
        } catch {}
        if (ready) break;
        await delay(200);
      }
      if (!ready) throw Error('Monitoring process did not become ready.');
    }
    await delay(3000);
    const wait = async (name: string, status: string) => {
      for (let i = 0; i < 50; i++) {
        cancellation.signal.throwIfAborted();
        if (receipts.some((r) => r.name === name && r.status === status)) return true;
        await delay(250);
      }
      return false;
    };
    // Keep private app storage open; stopping/restarting the HTTP listener exercises actual scrape loss.
    await new Promise<void>((done) => api.close(() => done()));
    const outageFiring = await wait('JkyRuntimeUnavailable', 'firing');
    api = runtime.app.listen(apiPort, '127.0.0.1');
    await new Promise<void>((done) => api.once('listening', done));
    stages.push({
      fault: 'runtime_http_outage',
      firing: outageFiring,
      resolved: await wait('JkyRuntimeUnavailable', 'resolved'),
    });
    writeOperationalState(join(runtime.store.directory, 'backup-status.json'), {
      status: 'failed',
      failedAt: new Date().toISOString(),
    });
    const backupFiring = await wait('JkyBackupFailed', 'firing');
    writeOperationalState(join(runtime.store.directory, 'backup-status.json'), {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    stages.push({
      fault: 'backup_failure_state',
      firing: backupFiring,
      resolved: await wait('JkyBackupFailed', 'resolved'),
    });
    // An actual queued original meets the injected scanner outage; it is never parsed unscanned.
    const origin = `http://127.0.0.1:${apiPort}`,
      signup = await fetch(origin + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Synthetic Alert',
          email: 'alert@example.test',
          password: 'Synthetic-Alert-Password-42!',
          adult: true,
          consent: true,
        }),
      });
    const cookie =
        signup.headers
          .getSetCookie()
          .find((c) => c.startsWith('jky_session='))
          ?.split(';')[0] || '',
      csrf = (await signup.json()).csrf;
    if (signup.status !== 201 || !cookie || !csrf)
      throw Error('Synthetic alert account setup failed.');
    scannerUnavailable = true;
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Synthetic scanner alert');
    const form = new FormData();
    form.append(
      'file',
      new Blob([Buffer.from(await pdf.save())], { type: 'application/pdf' }),
      'scanner.pdf',
    );
    const upload = await fetch(origin + '/api/intake', {
      method: 'POST',
      headers: { Cookie: cookie, 'x-csrf-token': csrf },
      body: form,
    });
    if (upload.status !== 202) throw Error('Synthetic scanner intake failed.');
    const scanFiring = await wait('JkyScannerUnavailable', 'firing');
    scannerUnavailable = false;
    stages.push({
      fault: 'scanner_outage',
      firing: scanFiring,
      resolved: await wait('JkyScannerUnavailable', 'resolved'),
    });
    return {
      version: 1,
      scope: 'local_monitoring_delivery_drill',
      createdAt: new Date().toISOString(),
      passed: stages.every((s) => s.firing && s.resolved),
      stages,
      limitations: [
        'Actual Prometheus, Alertmanager and a local HTTP receiver were exercised; this does not prove delivery to a real on-call person.',
        'Only the disposable drill accelerates rule durations and lookback windows. Production timing is covered separately by promtool rule tests.',
        'Backup failure is injected as operational state; scanner outage uses a scanner fixture. Provider outages and actual ClamAV engine operation need separate evidence.',
      ],
    };
  } finally {
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', interrupt);
    await Promise.allSettled(Object.values(names).map((name) => docker(['rm', '-f', name])));
    await new Promise<void>((done) => api.close(() => done()));
    await new Promise<void>((done) => receiver.close(() => done()));
    runtime.close();
    rmSync(directory, { recursive: true, force: true });
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2),
    report = await monitoringDrill();
  const index = args.indexOf('--out');
  if (index >= 0) {
    if (!args[index + 1]) throw Error('Use a new private report filename.');
    writeFileSync(args[index + 1], JSON.stringify(report, null, 2) + '\n', {
      mode: 0o600,
      flag: 'wx',
    });
  }
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}
