import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import corpus from '../fixtures/benchmark-v2.json' with { type: 'json' };
import { createStore } from '../../server/store';
import { digest, packScopeHash, saveDraft, transitionPack } from '../../server/rule-packs';
import { adjudicateBenchmark, blindBenchmark } from '../../server/benchmark-review';
import { benchmarkWorkbook, packWorkbook } from '../../server/review-workbook';
import { templateRequirement } from '../../shared/templates';
import type { RulePack } from '../../shared/model';

test.skip(({ isMobile }) => isMobile, 'The offline workbooks are desktop tools for reviewers.');

test('a reviewer completes the pack workbook and its signed file passes the review gate', async ({
  page,
}) => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-workbook-'));
  try {
    const content = 'Submit birth certificate as PDF.';
    const source = {
      id: 's',
      url: 'https://official.example.test',
      title: 'Official source',
      content,
      sha256: digest(content),
      retrievedAt: '2026-10-10',
    };
    const pack: RulePack = {
      id: 'review',
      version: '1',
      title: 'Official scope',
      stage: 'registration',
      cycle: '2027',
      checkedAt: '2026-10-10',
      sourceUrl: source.url,
      assurance: 'reference',
      authoredBy: 'author',
      requirements: [
        { ...templateRequirement('Birth certificate', 0, 'pdf'), id: 'r', sourceAnchor: 's:0:32' },
      ],
      sources: [source],
      obligations: [
        {
          id: 'o',
          sourceId: 's',
          anchor: 's:0:32',
          instruction: 'Birth certificate PDF',
          disposition: 'implemented',
          requirementIds: ['r'],
          rationale: 'The explicit source requires this original.',
        },
      ],
      coverage: [
        {
          id: 'section',
          sourceId: 's',
          anchor: 's:0:32',
          title: 'Registration instructions',
          disposition: 'in_scope',
          obligationIds: ['o'],
        },
      ],
      limitations: [],
    } as RulePack;
    const file = join(dir, 'review.html');
    writeFileSync(
      file,
      packWorkbook({ pack, snapshots: [source], scopeHash: packScopeHash(pack) }),
    );
    await page.goto(pathToFileURL(file).href);
    await expect(page.locator('blockquote')).toHaveText(content);
    await expect(page.getByText('Birth certificate PDF', { exact: false })).toBeVisible();
    const download = page.getByRole('button', { name: 'Download signed review' });
    await page.getByLabel('Reviewer name').fill('author');
    await page.getByLabel(/did not author this pack/).check();
    await expect(page.getByRole('status')).toHaveText('The author cannot review their own work.');
    await expect(download).toBeDisabled();
    await page.getByLabel('Reviewer name').fill('reviewer');
    await page.getByLabel('Accept').check();
    await page
      .getByLabel('Reviewer note for Registration instructions')
      .fill('Read the whole source section; the birth certificate obligation is mapped.');
    await expect(page.getByText('1 of 1 sections decided')).toBeVisible();
    // Progress survives a reload.
    await page.reload();
    await expect(page.getByLabel('Accept')).toBeChecked();
    const saved = page.waitForEvent('download');
    await download.click();
    const signed = JSON.parse(readFileSync((await (await saved).path())!, 'utf8'));
    const store = createStore(join(dir, 'data'));
    try {
      store.db.prepare('INSERT INTO source_snapshots VALUES(?,?)').run('s', JSON.stringify(source));
      saveDraft(store, pack, 'author');
      const reviewed = transitionPack(store, 'review', '1', 'review', 'reviewer', signed);
      expect(reviewed.lifecycle).toBe('reviewed');
    } finally {
      store.db.close();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a reviewer labels the blind benchmark and the labels pass adjudication import', async ({
  page,
}) => {
  const dir = mkdtempSync(join(tmpdir(), 'jky-labels-'));
  try {
    const manifest = blindBenchmark();
    const manifestHash = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
    const file = join(dir, 'labels.html');
    writeFileSync(file, benchmarkWorkbook({ manifest, manifestHash }));
    await page.goto(pathToFileURL(file).href);
    // The author's answers must not be present anywhere in the reviewer's file.
    const html = readFileSync(file, 'utf8');
    for (const c of corpus.cases) expect(html).not.toContain(c.rationale);
    await page.getByLabel('Reviewer name').fill('Independent Reviewer');
    await page.getByLabel(/labelled these cases independently/).check();
    for (const c of corpus.cases) {
      const card = page.locator(`article[data-id="${c.id}"]`);
      await card.getByRole('radio', { name: c.expected, exact: true }).check();
      await card
        .getByRole('textbox')
        .fill(`Applied the written state definitions to case ${c.id} from its inputs.`);
    }
    await expect(
      page.getByText(`${corpus.cases.length} of ${corpus.cases.length} cases labelled`),
    ).toBeVisible();
    const saved = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download labels' }).click();
    const labels = JSON.parse(readFileSync((await (await saved).path())!, 'utf8'));
    const report = adjudicateBenchmark(labels);
    expect(report.status).toBe('reviewer_labels_recorded');
    expect(report.disagreements).toEqual([]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
