import { test, expect, type Page } from '@playwright/test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import AxeBuilder from '@axe-core/playwright';
async function nav(page: Page, label: string) {
  if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
    await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('complementary')
    .getByRole('button', { name: label, exact: label !== 'Requirements' })
    .click();
}
async function signup(page: Page) {
  await page.goto('/');
  await page.getByLabel('Your name').fill('Fresh Applicant');
  await page.getByLabel('Email address').fill(`fresh-${crypto.randomUUID()}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('synthetic-browser-password');
  await page.getByLabel('I am 18 or older.').check();
  await page.getByLabel(/I agree to this development/).check();
  await page.getByRole('button', { name: 'Create my workspace' }).click();
  await page.getByRole('heading', { name: 'Welcome, Fresh.' }).waitFor();
}
async function cleanup(page: Page) {
  const me = await page.request.get('/api/me');
  if (me.ok()) {
    const { csrf } = await me.json();
    await page.request.delete('/api/account', {
      headers: { 'x-csrf-token': csrf },
      data: { confirmation: 'DELETE' },
    });
  }
}
async function checkAccessibility(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    );
  });
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
}
test('fresh account has useful distinct sections and accessible setup', async ({ page }) => {
  await signup(page);
  try {
    await expect(
      page.getByRole('heading', { name: 'A clear path from documents to done.' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Get ready in three steps' })).toBeVisible();
    await checkAccessibility(page);
    await nav(page, 'Requirements');
    await expect(
      page.getByRole('heading', { name: 'A checklist that matches your application.' }),
    ).toBeVisible();
    await checkAccessibility(page);
    await nav(page, 'My documents');
    await expect(
      page.getByRole('heading', { name: 'Your documents deserve a proper home.' }),
    ).toBeVisible();
    await checkAccessibility(page);
    await nav(page, 'Readiness report');
    await expect(
      page.getByRole('heading', { name: 'Know what is ready before you submit.' }),
    ).toBeVisible();
    await checkAccessibility(page);
    await nav(page, 'Activity');
    await expect(page.getByRole('heading', { name: 'Account created', exact: true })).toBeVisible();
    await nav(page, 'Overview');
    await page.getByRole('button', { name: 'Create your first application' }).click();
    await checkAccessibility(page);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await checkAccessibility(page);
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  } finally {
    await cleanup(page).catch(() => {});
  }
});
test('custom instructions become a working editable application with archive and account settings', async ({
  page,
}) => {
  await signup(page);
  try {
    await nav(page, 'Requirements');
    await page.getByRole('button', { name: 'Build my checklist' }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByLabel('Application name', { exact: true }).fill('Product designer application');
    await page.getByLabel('Institution or company').fill('Example Studio');
    await page.getByLabel('Application deadline').fill('2026-12-15');
    await page.getByLabel(/Paste your document instructions/).fill('Resume\nPortfolio');
    await page.getByRole('button', { name: 'Use these lines as requirements' }).click();
    await page.getByLabel('Requirement 1 format').selectOption('application/pdf');
    await page.getByRole('button', { name: 'Create application', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Requirements & evidence' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Resume', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Portfolio', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Edit checklist' }).click();
    await page.getByLabel('Requirement 2 name').fill('Selected work');
    await page.getByRole('dialog').getByLabel('Optional', { exact: true }).nth(1).check();
    await page.getByRole('button', { name: 'Save checklist' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Selected work', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Run review', exact: true }).click();
    await nav(page, 'Readiness report');
    await expect(
      page.getByRole('heading', { name: 'A few things need your attention.' }),
    ).toBeVisible();
    const zip = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download folder' }).click();
    expect((await zip).suggestedFilename()).toBe('jky-folder-application.zip');
    await nav(page, 'Applications');
    await page.getByRole('button', { name: 'Archive Product designer application' }).click();
    await expect(page.getByRole('heading', { name: 'No active applications' })).toBeVisible();
    await page.getByRole('button', { name: 'Archived', exact: true }).click();
    await page.getByRole('button', { name: 'Restore Product designer application' }).click();
    await page.getByRole('button', { name: 'Active', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Product designer application', exact: true }),
    ).toBeVisible();
    await nav(page, 'Settings & privacy');
    await page.getByLabel('Display name').fill('Updated Applicant');
    await page.getByRole('button', { name: 'Save profile' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Your display name has been updated.' }),
    ).toBeVisible();
    await page.reload();
    await nav(page, 'Settings & privacy');
    await expect(page.getByLabel('Display name')).toHaveValue('Updated Applicant');
    await checkAccessibility(page);
  } finally {
    await cleanup(page).catch(() => {});
  }
});
test('documents-first onboarding inspects and renders real PDF pages', async ({ page }) => {
  await signup(page);
  try {
    await nav(page, 'My documents');
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    pdf.addPage().drawText('Synthetic resume - Fresh Applicant', { x: 40, y: 700, size: 18, font });
    pdf.addPage().drawText('Synthetic portfolio - second page', { x: 40, y: 700, size: 18, font });
    await page
      .getByLabel('Choose documents to upload')
      .setInputFiles({
        name: 'resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from(await pdf.save()),
      });
    await expect(page.getByRole('dialog')).toBeVisible();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /Job application/ })
      .click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByLabel('Application name', { exact: true }).fill('Documents-first application');
    await page.getByRole('button', { name: 'Review checklist' }).click();
    await page.getByRole('button', { name: 'Create application', exact: true }).click();
    await expect(page.getByText('Inspected', { exact: true })).toBeVisible({ timeout: 25000 });
    await nav(page, 'Requirements');
    await page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: 'Resume', exact: true }) })
      .getByRole('button', { name: 'Connect evidence' })
      .click();
    await expect(
      page.getByRole('img', { name: 'Document preview: resume.pdf, page 1' }),
    ).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Synthetic resume - Fresh Applicant')).toBeVisible();
    await page.getByRole('button', { name: 'Next PDF page' }).click();
    await expect(
      page.getByRole('img', { name: 'Document preview: resume.pdf, page 2' }),
    ).toBeVisible();
    await expect(page.getByLabel('First page')).toHaveValue('2');
    await page.getByLabel('I reviewed the content').check();
    await page
      .getByLabel('Review note')
      .fill('Inspected the second synthetic original page for this requirement.');
    await page.getByRole('button', { name: 'Save evidence link' }).click();
    await page.getByRole('button', { name: 'Run review', exact: true }).click();
    await nav(page, 'Readiness report');
    await expect(
      page.getByRole('heading', { name: 'Your supported checks are reviewed.' }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  } finally {
    await cleanup(page).catch(() => {});
  }
});
