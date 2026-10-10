import { test, expect, type Page } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import AxeBuilder from '@axe-core/playwright';
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
async function accessible(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
}

test('workflow preview supports keyboard selection and motion can be paused persistently', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
  // The folder plays its arrival sequence once: the sheet drops in and the marks are drawn.
  const folder = page.locator('.hero-folder');
  await expect(folder).toHaveClass(/is-intro/);
  await expect
    .poll(() =>
      folder.evaluate((element) =>
        element
          .getAnimations({ subtree: true })
          .some((animation) => animation.playState === 'running'),
      ),
    )
    .toBe(true);
  await expect(page.getByRole('tabpanel')).toContainText('Recent photograph');
  await page.getByRole('tab', { name: 'Checklist' }).click();
  await expect(folder).not.toHaveClass(/is-intro/);
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Report' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('A few things need your attention.');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Documents' })).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('recent-photograph.jpg');
  await page.getByRole('button', { name: 'Pause animations' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => animation.playState === 'running').length,
    ),
  ).toBe(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Resume animations' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume animations' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await expect(
    page.getByRole('button', { name: 'System reduced motion is enabled' }),
  ).toBeDisabled();
  await accessible(page);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= Math.ceil(visualViewport!.width),
    ),
  ).toBe(true);
});

test('quick actions run real reviews, readiness opens reports and file drops inspect originals', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore the demo' }).click();
  await page.getByRole('heading', { name: 'My design school application', level: 1 }).waitFor();
  try {
    await page.getByRole('button', { name: 'Signature: Needs your review' }).click();
    await expect(
      page.getByRole('dialog').getByRole('heading', { name: 'Signature' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await page
      .locator('.workspace-header')
      .getByRole('button', { name: 'Report', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Readiness report', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Control+.');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Quick actions' })).toBeVisible();
    await expect(page.getByLabel('Search quick actions')).toBeFocused();
    await page.getByLabel('Search quick actions').fill('run a readiness');
    await page.keyboard.press('ArrowDown');
    await expect(dialog.getByRole('button', { name: /Run a readiness review/ })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('status').filter({ hasText: 'Review snapshot saved.' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Quick actions', exact: true }).click();
    await page.getByLabel('Search quick actions').fill('not-a-real-action');
    await expect(dialog.getByRole('status')).toContainText('No matching actions');
    await page.getByLabel('Search quick actions').fill('upload documents');
    const chooserEvent = page.waitForEvent('filechooser');
    await dialog.getByRole('button', { name: /Upload documents/ }).click();
    const chooser = await chooserEvent;
    await chooser.setFiles([]);
    await expect(page.getByRole('heading', { name: 'Documents', exact: true })).toBeVisible();
    const pdf = await PDFDocument.create();
    pdf
      .addPage()
      .drawText('Synthetic file dropped through the interactive intake', { x: 40, y: 700 });
    const bytes = Array.from(await pdf.save());
    const transfer = await page.evaluateHandle((bytes) => {
      const transfer = new DataTransfer();
      transfer.items.add(
        new File([new Uint8Array(bytes)], 'interactive-drop.pdf', { type: 'application/pdf' }),
      );
      return transfer;
    }, bytes);
    const zone = page.locator('.upload-zone');
    await zone.dispatchEvent('dragenter', { dataTransfer: transfer });
    await expect(
      page.getByRole('heading', { name: 'Release to add your documents' }),
    ).toBeVisible();
    await zone.dispatchEvent('drop', { dataTransfer: transfer });
    await transfer.dispose();
    await expect(zone).not.toHaveClass(/is-dragging/);
    await expect(
      page.locator('.document-row').filter({ hasText: 'interactive-drop.pdf' }),
    ).toContainText('Inspected', { timeout: 25000 });
    await accessible(page);
    await page.getByRole('button', { name: 'Quick actions', exact: true }).click();
    await accessible(page);
    await page.getByLabel('Search quick actions').fill('create an application');
    await dialog.getByRole('button', { name: /Create an application/ }).click();
    await expect(
      page.getByRole('dialog').getByRole('heading', { name: 'Create an application', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= Math.ceil(visualViewport!.width),
      ),
    ).toBe(true);
  } finally {
    await cleanup(page).catch(() => {});
  }
});

test('files dropped on any page reach the current folder and the palette searches real data', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore the demo' }).click();
  await page.getByRole('heading', { name: 'My design school application', level: 1 }).waitFor();
  try {
    await page.keyboard.press('Control+.');
    await page.getByLabel('Search quick actions').fill('signature');
    const palette = page.getByRole('dialog');
    await expect(palette.getByRole('group', { name: 'This checklist' })).toContainText(
      'Needs your review',
    );
    await expect(palette.getByRole('group', { name: 'Documents' })).toContainText('signature.jpg');
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('dialog').getByRole('heading', { name: 'Signature', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Escape');

    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Synthetic file dropped on the overview page', { x: 40, y: 700 });
    const bytes = Array.from(await pdf.save());
    const transfer = await page.evaluateHandle((bytes) => {
      const transfer = new DataTransfer();
      transfer.items.add(
        new File([new Uint8Array(bytes)], 'overview-drop.pdf', { type: 'application/pdf' }),
      );
      return transfer;
    }, bytes);
    const target = page.locator('.file-cover');
    await target.dispatchEvent('dragenter', { dataTransfer: transfer });
    await expect(page.locator('.drop-overlay')).toContainText(
      'Drop to add to My design school application',
    );
    await target.dispatchEvent('drop', { dataTransfer: transfer });
    await transfer.dispose();
    await expect(page.locator('.drop-overlay')).toHaveCount(0);
    const toast = page.getByRole('status').filter({ hasText: '1 added' });
    await expect(toast).toBeVisible();
    await toast.getByRole('button', { name: 'Open checklist' }).click();
    await expect(page.getByRole('heading', { name: 'Checklist', exact: true })).toBeVisible();
    await page
      .locator('.workspace-header')
      .getByRole('button', { name: /^Documents/ })
      .click();
    await expect(
      page.locator('.document-row').filter({ hasText: 'overview-drop.pdf' }),
    ).toContainText('Inspected', { timeout: 25000 });
  } finally {
    await cleanup(page).catch(() => {});
  }
});
