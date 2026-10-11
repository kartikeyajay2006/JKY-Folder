import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { inspectFile } from '../server/inspection';
import { inspectionMode, validateProductionConfig, verifySandbox } from '../server/runtime-config';
import { acquireInstanceLock } from '../server/instance-lock';
const dirs: string[] = [];
function temp() {
  const dir = mkdtempSync(join(tmpdir(), 'jky-isolation-test-'));
  dirs.push(dir);
  return dir;
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});
it('rejects a second runtime, then releases the kernel workspace lock cleanly', async () => {
  const directory = temp();
  const first = await acquireInstanceLock(directory, () => {
    throw Error('Lock lost');
  });
  try {
    await expect(acquireInstanceLock(directory, () => {})).rejects.toThrow('Another server');
  } finally {
    await first();
  }
  const second = await acquireInstanceLock(directory, () => {
    throw Error('Lock lost');
  });
  const waiting = acquireInstanceLock(
    directory,
    () => {
      throw Error('Lock lost');
    },
    { waitSeconds: 1 },
  );
  await second();
  const next = await waiting;
  await next();
});
it('refuses production without isolation, scanning, recovery email and encrypted backups', () => {
  const env = {
    NODE_ENV: 'production',
    APP_ORIGIN: 'https://example.test',
    CLAMAV_HOST: 'clamav',
    SMTP_HOST: 'smtp.example.test',
    MAIL_FROM: 'support@example.test',
    BACKUP_DIR: '/backups',
    BACKUP_PASSWORD: 'a-long-synthetic-password',
  };
  expect(() => validateProductionConfig(env)).not.toThrow();
  for (const key of [
    'CLAMAV_HOST',
    'SMTP_HOST',
    'MAIL_FROM',
    'BACKUP_DIR',
    'BACKUP_PASSWORD',
    'APP_ORIGIN',
  ])
    expect(() => validateProductionConfig({ ...env, [key]: '' })).toThrow();
  expect(() =>
    validateProductionConfig({ ...env, APP_ORIGIN: 'https://user:pass@example.test/a' }),
  ).toThrow();
  expect(() => inspectionMode({ ...env, INSPECTION_MODE: 'process' })).toThrow();
  expect(inspectionMode({})).toBe('process');
});
it('rejects oversized output, malformed outcomes and metadata injection from a worker', async () => {
  const dir = temp(),
    file = join(dir, 'input'),
    program = join(dir, 'probe.mjs');
  writeFileSync(file, 'synthetic');
  for (const output of [
    "process.stdout.write('x'.repeat(9 * 1024 * 1024));",
    "process.stdout.write('{}');",
    "process.stdout.write(JSON.stringify({ok:true,result:{id:'injected'}}));",
  ]) {
    writeFileSync(program, output);
    expect((await inspectFile(file, { mode: 'process', program })).ok).toBe(false);
  }
});
it('kills workers that do not complete within the time budget', async () => {
  const dir = temp(),
    file = join(dir, 'input'),
    program = join(dir, 'probe.mjs');
  writeFileSync(file, 'synthetic');
  writeFileSync(program, 'setInterval(() => {}, 1000);');
  expect(await inspectFile(file, { mode: 'process', program, timeoutMs: 100 })).toMatchObject({
    ok: false,
    error: expect.stringContaining('time limit'),
  });
});
// CI installs bubblewrap and verifies its user namespace policy before running this suite.
it.runIf(process.env.TEST_OS_SANDBOX === '1')(
  'actually denies private files, input writes, credential inheritance and host networking',
  async () => {
    await verifySandbox();
  },
);
it.runIf(process.env.TEST_OS_SANDBOX === '1')(
  'inspects an actual PDF inside the operating-system sandbox',
  async () => {
    const dir = temp(),
      file = join(dir, 'original');
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    pdf.addPage().drawText('Synthetic isolated evidence', { font, x: 40, y: 700 });
    writeFileSync(file, await pdf.save());
    const result = await inspectFile(file, { mode: 'bubblewrap' });
    expect(result.ok).toBe(true);
    expect(result.result?.pages?.[0].text).toContain('Synthetic isolated evidence');
  },
);
