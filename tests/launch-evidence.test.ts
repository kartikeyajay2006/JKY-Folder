import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { createStore } from '../server/store';
import { createReviewerKey, registerReviewer, revokeReviewer } from '../server/reviewer-identity';
import {
  EXTERNAL_TASKS,
  launchReport,
  signAssessment,
  verifyAssessment,
  type ExternalAssessment,
} from '../server/launch-evidence';
const dirs: string[] = [],
  close: (() => void)[] = [];
afterEach(() => {
  close.splice(0).forEach((f) => f());
  dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true }));
});
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'jky-external-evidence-'));
  dirs.push(dir);
  const store = createStore(join(dir, 'data'));
  close.push(() => store.db.close());
  const keys = createReviewerKey('Synthetic Independent Tester');
  registerReviewer(
    store,
    keys.publicIdentity,
    'Synthetic Operator',
    'Synthetic identity/key verification evidence used only in isolated tests.',
  );
  const target = {
    commit: 'a'.repeat(40),
    softwareHash: 'b'.repeat(64),
    environmentHash: 'c'.repeat(64),
  };
  writeFileSync(join(dir, 'findings.txt'), 'Synthetic external assessment fixture.');
  const assessment: ExternalAssessment = {
    version: 1,
    gate: 'security',
    target,
    author: 'Synthetic Developer',
    reviewer: keys.publicIdentity.identity,
    independenceAttested: true,
    qualificationEvidence: 'Synthetic qualification evidence for a disposable test registry only.',
    observedAt: new Date(Date.now() - 1000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    tasks: EXTERNAL_TASKS.security.map((id) => ({
      id,
      outcome: 'passed',
      detail:
        'Synthetic test observations for this exact boundary; no actual outside reviewer is claimed.',
    })),
    openCritical: 0,
    openHigh: 0,
    evidence: [
      {
        path: 'findings.txt',
        sha256: createHash('sha256').update('Synthetic external assessment fixture.').digest('hex'),
      },
    ],
  };
  return { dir, store, keys, target, assessment };
}
it('accepts actual evidence bytes only with an exact registered, scoped signature', () => {
  const f = fixture(),
    signed = signAssessment(f.assessment, f.keys.privateKey);
  expect(verifyAssessment(f.store, signed, f.target, f.dir).status).toBe(
    'recorded_independent_assessment',
  );
  expect(() =>
    verifyAssessment(f.store, signed, { ...f.target, environmentHash: 'd'.repeat(64) }, f.dir),
  ).toThrow('scope');
  signed.payload.tasks[0].detail += ' altered';
  expect(() => verifyAssessment(f.store, signed, f.target, f.dir)).toThrow('signature');
});
it('rejects self-review, revoked keys and edited or missing attachments', () => {
  const f = fixture();
  expect(() =>
    signAssessment({ ...f.assessment, reviewer: f.assessment.author }, f.keys.privateKey),
  ).toThrow('author');
  const signed = signAssessment(f.assessment, f.keys.privateKey);
  writeFileSync(join(f.dir, 'findings.txt'), 'changed');
  expect(() => verifyAssessment(f.store, signed, f.target, f.dir)).toThrow('altered');
  revokeReviewer(f.store, f.assessment.reviewer, 'Synthetic Operator');
  expect(() => verifyAssessment(f.store, signed, f.target, f.dir)).toThrow('revoked');
});
it('rejects stale dates, failed/missing tasks and unresolved critical findings', () => {
  const f = fixture();
  for (const assessment of [
    { ...f.assessment, expiresAt: new Date(Date.now() - 1000).toISOString() },
    { ...f.assessment, tasks: f.assessment.tasks.slice(1) },
    { ...f.assessment, openCritical: 1 },
    {
      ...f.assessment,
      tasks: f.assessment.tasks.map((t, i) => ({
        ...t,
        outcome: i === 0 ? ('pending' as const) : t.outcome,
      })),
    },
  ])
    expect(() =>
      verifyAssessment(f.store, signAssessment(assessment, f.keys.privateKey), f.target, f.dir),
    ).toThrow();
});
it('rejects parent traversal and symlinks outside the private evidence bundle', () => {
  const f = fixture();
  expect(() =>
    verifyAssessment(
      f.store,
      signAssessment(
        { ...f.assessment, evidence: [{ ...f.assessment.evidence[0], path: '../outside' }] },
        f.keys.privateKey,
      ),
      f.target,
      f.dir,
    ),
  ).toThrow('relative');
  const outside = mkdtempSync(join(tmpdir(), 'jky-outside-'));
  dirs.push(outside);
  writeFileSync(join(outside, 'file'), 'Synthetic external assessment fixture.');
  symlinkSync(join(outside, 'file'), join(f.dir, 'escape'));
  expect(() =>
    verifyAssessment(
      f.store,
      signAssessment(
        { ...f.assessment, evidence: [{ ...f.assessment.evidence[0], path: 'escape' }] },
        f.keys.privateKey,
      ),
      f.target,
      f.dir,
    ),
  ).toThrow('escaped');
});
it('requires real pilot counts, consent and closure for the planned scope', () => {
  const f = fixture(),
    pilot = {
      ...f.assessment,
      gate: 'pilot' as const,
      tasks: EXTERNAL_TASKS.pilot.map((id) => ({ ...f.assessment.tasks[0], id })),
    };
  expect(() =>
    verifyAssessment(f.store, signAssessment(pilot, f.keys.privateKey), f.target, f.dir),
  ).toThrow('pilot');
  const input = {
    ...pilot,
    pilot: {
      plannedParticipants: 5,
      observedParticipants: 4,
      consentRecorded: true as const,
      unresolvedBlockingTasks: 0,
    },
  };
  expect(() =>
    verifyAssessment(f.store, signAssessment(input, f.keys.privateKey), f.target, f.dir),
  ).toThrow('pilot');
});
it('keeps launch pending even when one external gate has an independently signed fixture', () => {
  const f = fixture(),
    report = launchReport(f.store, f.target, {
      packId: 'uceed',
      packVersion: 'test',
      assessments: [signAssessment(f.assessment, f.keys.privateKey)],
      evidenceDirectory: f.dir,
    });
  expect(report.ready).toBe(false);
  expect(report.gates.find((g) => g.id === 'security')?.status).toBe('passed');
  expect(report.gates.find((g) => g.id === 'official_source_review')?.status).toBe('pending');
  expect(report.gates.find((g) => g.id === 'correctness')?.status).toBe('pending');
  expect(() =>
    launchReport(f.store, f.target, { packId: 'x', packVersion: 'x', assessments: [{}] }),
  ).toThrow('Malformed');
});
