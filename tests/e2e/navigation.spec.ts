import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('top navigation and account menu work with keyboard, search and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore the demo' }).click();
  await page.getByRole('heading', { name: 'My design school application', level: 1 }).waitFor();
  try {
    await expect(page.locator('aside,.sidebar,.sidebar-scrim')).toHaveCount(0);
    const header = page.locator('.workspace-header');
    await expect(header).toBeVisible();
    await header.getByRole('button', { name: 'Activity', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Activity', exact: true })).toBeVisible();
    await expect(header.getByRole('button', { name: 'Activity', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    const trigger = page.getByRole('button', { name: 'Open account menu' });
    await trigger.click();
    const menu = page.getByRole('menu', { name: 'Account actions' });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: 'Settings & privacy' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: 'Help & guidance' })).toBeFocused();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await menu.getByRole('menuitem', { name: 'Settings & privacy' }).click();
    await expect(
      page.getByRole('heading', { name: 'Settings & privacy', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Control+k');
    await expect(
      page.getByRole('searchbox', { name: 'Search requirements or documents' }),
    ).toBeFocused();
    await page
      .getByRole('searchbox', { name: 'Search requirements or documents' })
      .fill('signature');
    await expect(page.getByRole('heading', { name: 'Checklist', exact: true })).toBeVisible();
    await expect(page.locator('.requirement-row')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Signature', exact: true })).toBeVisible();
    await header.getByRole('button', { name: 'Applications', exact: true }).click();
    await page.getByRole('button', { name: 'New application', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await header.evaluate((element) => (element as HTMLElement).inert)).toBe(true);
    await page.keyboard.press('Escape');
    expect(await header.evaluate((element) => (element as HTMLElement).inert)).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      await page.evaluate(
        () =>
          document.getAnimations().filter((animation) => animation.playState === 'running').length,
      ),
    ).toBe(0);
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
