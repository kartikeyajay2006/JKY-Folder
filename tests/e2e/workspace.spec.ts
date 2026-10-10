import { test, expect } from '@playwright/test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
async function navigate(page: import('@playwright/test').Page, label: string) {
  if (await page.getByRole('button', { name: 'Open navigation' }).isVisible())
    await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('navigation', { name: 'Workspace' })
    .getByRole('button', { name: label, exact: label !== 'Requirements' })
    .click();
}
async function demo(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore the demo' }).click();
  await expect(page.getByRole('heading', { name: 'Application overview' })).toBeVisible();
}
test('demo → evidence review → dated report → stale report → deletion', async ({ page }) => {
  const errors: string[] = [];
  const serverFailures: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (response) => {
    if (response.status() >= 500) serverFailures.push(response.url());
  });
  await demo(page);
  await navigate(page, 'Requirements');
  await page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Signature', exact: true }) })
    .getByRole('button', { name: 'Review evidence' })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect
    .poll(() =>
      page
        .getByRole('img', { name: 'Uploaded evidence: signature.jpg' })
        .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  await page.getByLabel('I reviewed the content').check();
  await page
    .getByLabel('Review note')
    .fill('I inspected the full signature on the fictional original.');
  await page.getByRole('button', { name: 'Save evidence link' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Run review', exact: true }).click();
  await navigate(page, 'Readiness report');
  await expect(
    page.getByRole('heading', { name: 'A few things need your attention.' }),
  ).toBeVisible();
  await navigate(page, 'Requirements');
  await page.getByRole('button', { name: 'Edit application details' }).click();
  await page.getByLabel('Application category', { exact: true }).selectOption('general');
  await page.getByRole('button', { name: 'Confirm my answers' }).click();
  await navigate(page, 'Readiness report');
  await expect(
    page.getByText('This report is historical. Your packet changed after this review.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Run a fresh review' }).click();
  await expect(
    page.getByText('This report is historical. Your packet changed after this review.'),
  ).not.toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('jky-folder-report.json');
  await navigate(page, 'My documents');
  await page.getByRole('button', { name: 'Delete signature.jpg', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, delete' }).click();
  await expect(
    page.getByRole('button', { name: 'Delete signature.jpg', exact: true }),
  ).not.toBeVisible();
  await navigate(page, 'Readiness report');
  await expect(page.getByRole('heading', { name: 'Your first review is waiting.' })).toBeVisible();
  expect(errors).toEqual([]);
  expect(serverFailures).toEqual([]);
});
test('create a packet, inspect a real PDF and connect a page', async ({ page }) => {
  await demo(page);
  await page.getByRole('button', { name: 'New application', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /UCEED 2027/ })
    .click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Application name', { exact: true }).fill('Browser-tested packet');
  await page.getByRole('button', { name: 'Review checklist', exact: true }).click();
  await page.getByRole('button', { name: 'Create application', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Qualifying examination', { exact: true }).selectOption('completed');
  await page.getByLabel('Application category', { exact: true }).selectOption('general');
  await page.getByRole('button', { name: 'Confirm my answers' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await navigate(page, 'My documents');
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  pdf
    .addPage()
    .drawText('Synthetic browser test - age evidence', { x: 50, y: 700, font, size: 16 });
  const bytes = await pdf.save();
  await page.getByLabel('Choose documents to upload').setInputFiles({
    name: 'browser-age.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(bytes),
  });
  await expect(page.getByText('Inspected', { exact: true })).toBeVisible({ timeout: 25000 });
  await navigate(page, 'Requirements');
  await page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Proof of age', exact: true }) })
    .getByRole('button', { name: 'Connect evidence' })
    .click();
  await expect(page.getByText('Synthetic browser test - age evidence')).toBeVisible();
  await page.getByRole('button', { name: 'Save evidence link' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(
    page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: 'Proof of age', exact: true }) }),
  ).toContainText('Needs your review');
});
test('dialog traps keyboard focus and narrow screens avoid horizontal overflow', async ({
  page,
}) => {
  await demo(page);
  await page.getByRole('button', { name: 'New application', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Continue', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
