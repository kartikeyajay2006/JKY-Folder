import { expect, it } from 'vitest';
import { runCapacity, summarize } from '../server/capacity';
it('rejects unbounded capacity inputs before opening any workspace', async () => {
  for (const options of [
    { concurrency: 0 },
    { concurrency: 9 },
    { rounds: 11 },
    { rounds: NaN },
    { timeoutSeconds: Infinity },
  ])
    await expect(runCapacity(options)).rejects.toThrow('bounds');
});
it('calculates nearest-rank percentiles without hiding the worst measurement', () => {
  expect(summarize([400, 1, 2, 3, 4])).toEqual({ count: 5, p50Ms: 3, p95Ms: 400, maxMs: 400 });
});
it('measures concurrent actual PDF intake and leaves no synthetic accounts', async () => {
  const report = await runCapacity({ concurrency: 2, rounds: 1, timeoutSeconds: 30 });
  expect(report.passed).toBe(true);
  expect(report.readyDocuments).toBe(2);
  expect(report.resources.peakProcessTreeRssBytes).toBeGreaterThan(0);
  expect(report.latency.native_pdf.count).toBe(2);
  expect(report.failures).toEqual([]);
}, 45000);
