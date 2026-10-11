import { it, expect } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { prepareOfficialPack } from '../server/official-pack';
import { packScopeHash } from '../server/pack-validation';

// Synthetic source wording and pages exercise preparation; these are never official evidence.
async function sourceFiles(dir: string, pages = 74) {
  const registration = join(dir, 'registration.html'),
    faq = join(dir, 'faq.html'),
    brochure = join(dir, 'brochure.pdf');
  writeFileSync(
    registration,
    [
      'A recent colour photograph',
      'A clear image',
      'Proof of age',
      'If appeared in the year',
      'For candidates appearing',
      'In case of a difference',
      'Valid OBC-NCL certificate',
      'Valid SC certificate',
      'Valid ST certificate',
      'Valid EWS certificate',
      'Valid UDID card and/or',
      'Dyslexic candidates need',
      'PwD candidates who require',
      'Nationality Certificate',
      'OCI/PIO card –',
      'The facility of scribe may',
      'In the case of disabilities other',
    ]
      .map((phrase) => `<p>${phrase} synthetic instruction only.</p>`)
      .join(''),
  );
  writeFileSync(
    faq,
    '<p>You may upload synthetic NIOS alternatives for this preparation test.</p>',
  );
  const pdf = await PDFDocument.create();
  for (let n = 1; n <= pages; n++) pdf.addPage().drawText('Synthetic source page ' + n);
  writeFileSync(brochure, await pdf.save());
  return { registration, faq, brochure };
}
it('prepares a new immutable source revision with a different approval hash instead of reusing version 3', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-prepare-version-'));
  try {
    const files = await sourceFiles(dir);
    const first = await prepareOfficialPack(files, 'Synthetic author');
    const refreshed = await prepareOfficialPack(files, 'Synthetic author', '2027.reference.4');
    expect(first.pack.version).toBe('2027.reference.3');
    expect(refreshed.pack.version).toBe('2027.reference.4');
    expect(refreshed.scopeHash).toBe(packScopeHash(refreshed.pack));
    expect(refreshed.scopeHash).not.toBe(first.scopeHash);
    expect(refreshed.pack.lifecycle).toBe('draft');
    expect(refreshed.pack.reviewedBy).toBeUndefined();
    expect(refreshed.pack.coverage).toHaveLength(76);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}, 20000);
it('refuses stale fixed brochure page mappings and invalid revision names before approval', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-prepare-layout-'));
  try {
    const files = await sourceFiles(dir, 1);
    await expect(prepareOfficialPack(files, 'Synthetic author')).rejects.toThrow(/layout changed/);
    await expect(prepareOfficialPack(files, 'Synthetic author', '../invalid')).rejects.toThrow(
      /revision version/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
