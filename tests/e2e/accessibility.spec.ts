import { test, expect } from '@playwright/test';
import { expectAccessible } from './support';
async function nav(page: import('@playwright/test').Page, label: string) {
  await page
    .locator('.workspace-header')
    .getByRole('button', { name: label, exact: label !== 'Checklist' })
    .click();
}
test('automated accessibility of welcome, workspace views and review dialogs', async ({ page }) => {
  await page.goto('/');
  await expectAccessible(page);
  await page.getByRole('button', { name: 'Explore the demo' }).click();
  await page.getByRole('heading', { name: 'Where this application stands' }).waitFor();
  await expectAccessible(page);
  await nav(page, 'Checklist');
  await expectAccessible(page);
  await page.getByRole('button', { name: 'Edit application details' }).click();
  await page.getByRole('dialog').waitFor();
  await expectAccessible(page);
  await page.keyboard.press('Escape');
  await page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Signature', exact: true }) })
    .getByRole('button', { name: 'Review evidence' })
    .click();
  await page.getByRole('dialog').waitFor();
  await expectAccessible(page);
  await page.keyboard.press('Escape');
  await nav(page, 'Documents');
  await expectAccessible(page);
  await nav(page, 'Report');
  await expectAccessible(page);
  await nav(page, 'Applications');
  await expectAccessible(page);
  await page.getByRole('button', { name: 'Help & guidance' }).click();
  await expectAccessible(page);
});
