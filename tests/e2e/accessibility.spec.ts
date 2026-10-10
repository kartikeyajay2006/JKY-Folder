import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function check(page: import('@playwright/test').Page) {
  // Scan stable rendered states: fast CI runners can otherwise inspect a fading dialog.
  await page.evaluate(async () => {
    await document.fonts.ready;
    const finiteAnimations = document
      .getAnimations()
      .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);
    await Promise.all(finiteAnimations.map((animation) => animation.finished.catch(() => {})));
  });
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
}
async function nav(page: import('@playwright/test').Page, label: string) {
  await page
    .locator('.workspace-header')
    .getByRole('button', { name: label, exact: label !== 'Checklist' })
    .click();
}
test('automated accessibility of welcome, workspace views and review dialogs', async ({ page }) => {
  await page.goto('/');
  await check(page);
  await page.getByRole('button', { name: 'Explore the demo' }).click();
  await page.getByRole('heading', { name: 'Where this application stands' }).waitFor();
  await check(page);
  await nav(page, 'Checklist');
  await check(page);
  await page.getByRole('button', { name: 'Edit application details' }).click();
  await page.getByRole('dialog').waitFor();
  await check(page);
  await page.keyboard.press('Escape');
  await page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Signature', exact: true }) })
    .getByRole('button', { name: 'Review evidence' })
    .click();
  await page.getByRole('dialog').waitFor();
  await check(page);
  await page.keyboard.press('Escape');
  await nav(page, 'Documents');
  await check(page);
  await nav(page, 'Report');
  await check(page);
  await nav(page, 'Applications');
  await check(page);
  await page.getByRole('button', { name: 'Help & guidance' }).click();
  await check(page);
});
