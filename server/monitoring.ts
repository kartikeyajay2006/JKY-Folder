import { timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync, statfsSync } from 'node:fs';
import { join } from 'node:path';
import { monitorEventLoopDelay } from 'node:perf_hooks';
import type { Express, RequestHandler } from 'express';
import type { Store } from './store';
import { rateLimit } from 'express-rate-limit';
import { statSync } from 'node:fs';
import { repositoryHash } from './offsite-backup';

export type OperationalEvent =
  | 'scan_clean'
  | 'scan_unavailable'
  | 'scan_error'
  | 'scan_infected'
  | 'inspection_ready'
  | 'inspection_error'
  | 'inspection_exception'
  | 'mail_sent'
  | 'mail_failed'
  | 'push_sent'
  | 'push_failed'
  | 'push_revoked';
export type OperationalObserver = (
  event: OperationalEvent,
  seconds?: number,
  ocr?: boolean,
) => void;
const EVENTS: OperationalEvent[] = [
  'scan_clean',
  'scan_unavailable',
  'scan_error',
  'scan_infected',
  'inspection_ready',
  'inspection_error',
  'inspection_exception',
  'mail_sent',
  'mail_failed',
  'push_sent',
  'push_failed',
  'push_revoked',
];
const BUCKETS = [0.05, 0.1, 0.5, 1, 5, 15, 30, 60, 120];
const GROUPS = new Set([
  'auth',
  'account',
  'uploads',
  'intake',
  'packets',
  'catalog',
  'notifications',
  'notification-preferences',
  'push',
  'support',
  'library',
  'activity',
]);
const group = (path: string) => {
  if (!path.startsWith('/api/')) return 'frontend';
  const part = path.split('/')[2];
  return GROUPS.has(part) ? part : 'other';
};
function age(value: unknown, now: number) {
  const time = typeof value === 'string' ? Date.parse(value) : NaN;
  return Number.isFinite(time) && time <= now + 300000 ? Math.max(0, (now - time) / 1000) : -1;
}
/** Fixed labels only: no emails, addresses, IDs, paths, queries, documents or exception text. */
export function createMonitoring(
  store: Store,
  options: {
    token?: string;
    backupDir?: string;
    backupHours?: number;
    offsite?: boolean;
    repository?: string;
    scanner?: boolean;
    sampleProcess?: boolean;
  } = {},
) {
  if (options.token && !/^[A-Za-z0-9_-]{32,256}$/.test(options.token))
    throw Error('MONITOR_TOKEN must contain 32–256 URL-safe random characters.');
  const started = Date.now(),
    events = new Map(EVENTS.map((e) => [e, 0]));
  const requests = new Map<string, number>();
  const hist = new Map<string, { count: number; sum: number; buckets: number[] }>();
  const lag =
    options.sampleProcess === false ? undefined : monitorEventLoopDelay({ resolution: 20 });
  lag?.enable();
  let loopP99 = 0;
  const timer = lag
    ? setInterval(() => {
        loopP99 = lag.percentile(99) / 1e9;
        lag.reset();
      }, 10000)
    : undefined;
  timer?.unref();
  function observe(name: string, value: number) {
    const h = hist.get(name) || { count: 0, sum: 0, buckets: BUCKETS.map(() => 0) };
    h.count++;
    h.sum += value;
    BUCKETS.forEach((bound, i) => {
      if (value <= bound) h.buckets[i]++;
    });
    hist.set(name, h);
  }
  const event: OperationalObserver = (name, seconds, ocr = false) => {
    events.set(name, (events.get(name) || 0) + 1);
    if (seconds !== undefined && Number.isFinite(seconds) && seconds >= 0)
      observe(`inspection:${ocr ? 'ocr' : 'native'}`, seconds);
  };
  const middleware: RequestHandler = (req, res, next) => {
    if (req.path === '/api/health' || req.path.startsWith('/api/ops/')) return next();
    const begin = performance.now(),
      route = group(req.path);
    res.once('finish', () => {
      const method = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(
        req.method,
      )
        ? req.method
        : 'OTHER';
      const key = `route="${route}",method="${method}",status="${Math.floor(res.statusCode / 100)}xx"`;
      requests.set(key, (requests.get(key) || 0) + 1);
      observe(`http:${route}`, (performance.now() - begin) / 1000);
    });
    next();
  };
  function render(now = Date.now()) {
    const lines: string[] = [];
    const metric = (name: string, help: string, samples: [string, number][], type = 'gauge') => {
      lines.push(`# HELP ${name} ${help}`, `# TYPE ${name} ${type}`);
      for (const [labels, value] of samples)
        lines.push(`${name}${labels ? `{${labels}}` : ''} ${Number.isFinite(value) ? value : -1}`);
    };
    metric('jky_uptime_seconds', 'Seconds since this runtime started.', [
      ['', (now - started) / 1000],
    ]);
    metric('jky_process_resident_bytes', 'API resident memory; excludes parser child processes.', [
      ['', process.memoryUsage().rss],
    ]);
    metric('jky_event_loop_p99_seconds', 'API event loop delay p99 over the last ten seconds.', [
      ['', loopP99],
    ]);
    metric(
      'jky_http_requests_total',
      'Completed requests by fixed route group and status family.',
      [...requests],
      'counter',
    );
    metric(
      'jky_operations_total',
      'Operational outcomes since runtime start.',
      [...events].map(([e, n]) => [`event="${e}"`, n]),
      'counter',
    );
    for (const [category, name] of [
      ['http', 'jky_http_duration_seconds'],
      ['inspection', 'jky_inspection_duration_seconds'],
    ]) {
      lines.push(`# HELP ${name} Observed ${category} duration.`, `# TYPE ${name} histogram`);
      for (const [key, h] of hist) {
        if (!key.startsWith(category + ':')) continue;
        const labels = `${category === 'http' ? 'route' : 'method'}="${key.split(':')[1]}"`;
        BUCKETS.forEach((b, i) =>
          lines.push(`${name}_bucket{${labels},le="${b}"} ${h.buckets[i]}`),
        );
        lines.push(
          `${name}_bucket{${labels},le="+Inf"} ${h.count}`,
          `${name}_sum{${labels}} ${h.sum}`,
          `${name}_count{${labels}} ${h.count}`,
        );
      }
    }
    const table = (name: string) =>
      !!store.db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name);
    metric(
      'jky_inspections',
      'Persisted job count by fixed status.',
      ['queued', 'processing', 'done'].map((status) => [
        `status="${status}"`,
        (
          store.db.prepare('SELECT count(*) n FROM jobs WHERE status=?').get(status) as {
            n: number;
          }
        ).n,
      ]),
    );
    const failed = (
      store.db
        .prepare("SELECT count(*) n FROM documents WHERE json_extract(payload,'$.status')='error'")
        .get() as { n: number }
    ).n;
    metric('jky_documents_failed', 'Current originals with inspection errors.', [['', failed]]);
    if (table('mail_queue')) {
      metric(
        'jky_mail_queue',
        'Persisted mail count by fixed status.',
        ['queued', 'sending', 'failed'].map((status) => [
          `status="${status}"`,
          (
            store.db.prepare('SELECT count(*) n FROM mail_queue WHERE status=?').get(status) as {
              n: number;
            }
          ).n,
        ]),
      );
      const oldest = (
        store.db
          .prepare("SELECT min(nextAttempt) n FROM mail_queue WHERE status='queued'")
          .get() as { n: number | null }
      ).n;
      metric('jky_mail_overdue_seconds', 'Seconds the oldest queued message is overdue.', [
        ['', oldest === null ? 0 : Math.max(0, (now - oldest) / 1000)],
      ]);
    }
    const paths = [
      ['data', store.directory],
      ...(options.backupDir ? [['backups', options.backupDir]] : []),
    ];
    metric(
      'jky_disk_available_bytes',
      'Free bytes available to this service; -1 means unavailable.',
      paths.map(([kind, path]) => {
        try {
          const s = statfsSync(path);
          return [`volume="${kind}"`, s.bavail * s.bsize];
        } catch {
          return [`volume="${kind}"`, -1];
        }
      }),
    );
    let backup: Record<string, unknown> = {},
      offsite: Record<string, { completedAt?: string; stamp?: string }> = {};
    try {
      backup = JSON.parse(readFileSync(join(store.directory, 'backup-status.json'), 'utf8'));
    } catch {}
    try {
      const stored = JSON.parse(readFileSync(join(store.directory, 'offsite-status.json'), 'utf8'));
      if (options.repository && stored.repositoryHash === repositoryHash(options.repository))
        offsite = stored;
    } catch {}
    metric('jky_backup_enabled', 'Whether scheduled backups are configured.', [
      ['', options.backupDir ? 1 : 0],
    ]);
    metric('jky_backup_interval_seconds', 'Configured backup interval.', [
      ['', (options.backupHours || 24) * 3600],
    ]);
    metric(
      'jky_backup_success_age_seconds',
      'Age of the last successful backup; -1 means no evidence.',
      [['', age(backup.completedAt, now)]],
    );
    metric('jky_backup_last_attempt_failed', 'Last completed backup attempt failed.', [
      ['', backup.status === 'failed' ? 1 : 0],
    ]);
    metric(
      'jky_offsite_enabled',
      'Whether a repository is configured; not proof of separate storage.',
      [['', options.offsite ? 1 : 0]],
    );
    metric(
      'jky_offsite_archive_age_seconds',
      'Age of acknowledged repository archive; -1 means missing.',
      [['', age(offsite.archive?.completedAt, now)]],
    );
    metric(
      'jky_ledger_mirror_age_seconds',
      'Age of last ledger acknowledgement; -1 means missing.',
      [['', age(offsite.ledger?.completedAt, now)]],
    );
    let ledgerPending = 0;
    try {
      const stat = statSync(join(store.directory, 'deletions.jsonl'));
      ledgerPending = offsite.ledger?.stamp === `${stat.size}:${stat.mtimeMs}` ? 0 : 1;
    } catch {}
    metric(
      'jky_ledger_unmirrored',
      'Whether current erasures lack a matching repository acknowledgement.',
      [['', ledgerPending]],
    );
    metric('jky_erasure_ledger_present', 'Whether a local erasure ledger exists.', [
      ['', existsSync(join(store.directory, 'deletions.jsonl')) ? 1 : 0],
    ]);
    metric('jky_scanner_configured', 'Whether inspection requires a scanner.', [
      ['', options.scanner ? 1 : 0],
    ]);
    return lines.join('\n') + '\n';
  }
  function routes(app: Express) {
    app.get(
      '/api/ops/metrics',
      rateLimit({ windowMs: 60000, limit: 120, standardHeaders: false, legacyHeaders: false }),
      (req, res) => {
        if (!options.token) {
          res.status(404).end();
          return;
        }
        const actual = Buffer.from(req.headers.authorization || ''),
          expected = Buffer.from('Bearer ' + options.token);
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
          res.status(401).end();
          return;
        }
        try {
          res.type('text/plain; version=0.0.4; charset=utf-8').send(render());
        } catch {
          res.status(503).end();
        }
      },
    );
  }
  return {
    event,
    middleware,
    routes,
    render,
    stop: () => {
      if (timer) clearInterval(timer);
      lag?.disable();
    },
  };
}
