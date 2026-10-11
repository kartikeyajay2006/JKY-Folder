import { expect, it } from 'vitest';
import { rehearseRecovery } from '../server/recovery-rehearsal';
it.runIf(!!process.env.TEST_RESTIC_BINARY)(
  'restores real encrypted repository originals while retaining newer account and document erasures',
  async () => {
    const report = await rehearseRecovery({
      resticBinary: process.env.TEST_RESTIC_BINARY,
      mode: process.env.TEST_OS_SANDBOX === '1' ? 'bubblewrap' : 'process',
    });
    expect(report.passed).toBe(true);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.scope).toBe('synthetic_local_repository_recovery');
  },
  300000,
);
