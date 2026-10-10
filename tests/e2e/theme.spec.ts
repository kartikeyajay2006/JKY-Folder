import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function accessible(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState === 'running' &&
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
}

test('dark theme follows the device, can be chosen explicitly and stays accessible', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  await expect.poll(background).toBe('rgb(8, 8, 10)');
  await accessible(page);
  await page.getByRole('button', { name: 'Use light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect.poll(background).toBe('rgb(243, 245, 250)');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Use dark theme' }).click();
  await page.getByRole('button', { name: 'Explore the demo' }).click();
  try {
    await page.getByRole('heading', { name: 'My design school application', level: 1 }).waitFor();
    await accessible(page);
    await page
      .locator('.workspace-header')
      .getByRole('button', { name: /^Checklist/ })
      .click();
    await accessible(page);
    await page.locator('.workspace-header').getByRole('button', { name: 'Report' }).click();
    await accessible(page);
    await page.getByRole('button', { name: 'Settings & privacy' }).click();
    await page.getByLabel('Match my device').check();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    expect(await page.evaluate(() => localStorage.getItem('jky-theme'))).toBeNull();
    await accessible(page);
  } finally {
    const me = await page.request.get('/api/me');
    if (me.ok()) {
      const { csrf } = await me.json();
      await page.request.delete('/api/account', {
        headers: { 'x-csrf-token': csrf },
        data: { confirmation: 'DELETE' },
      });
    }
  }
});
