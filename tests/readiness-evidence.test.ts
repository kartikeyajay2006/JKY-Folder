import { expect, it } from 'vitest';
import { validArchiveAcknowledgement } from '../server/readiness';
import { repositoryHash } from '../server/offsite-backup';
it('does not reuse successful recovery evidence after repository or interval changes', () => {
  const env = {
      RESTIC_REPOSITORY: 'rest:https://synthetic.example.test',
      BACKUP_INTERVAL_HOURS: '24',
    },
    now = Date.now(),
    receipt = {
      repositoryHash: repositoryHash(env.RESTIC_REPOSITORY),
      archive: { completedAt: new Date(now).toISOString(), snapshot: 'abcdef01' },
    };
  expect(validArchiveAcknowledgement(receipt, env, now)).toBe(true);
  for (const changed of [
    { ...env, RESTIC_REPOSITORY: 'rest:https://other.example.test' },
    { ...env, BACKUP_INTERVAL_HOURS: 'Infinity' },
    { ...env, BACKUP_INTERVAL_HOURS: '0' },
  ])
    expect(validArchiveAcknowledgement(receipt, changed, now)).toBe(false);
  expect(
    validArchiveAcknowledgement(
      { ...receipt, archive: { ...receipt.archive, snapshot: 'invalid' } },
      env,
      now,
    ),
  ).toBe(false);
  expect(validArchiveAcknowledgement(receipt, env, now + 49 * 3600000)).toBe(false);
  expect(validArchiveAcknowledgement({}, env, now)).toBe(false);
});
