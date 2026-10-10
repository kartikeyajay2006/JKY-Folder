import { test, expect, type Page } from '@playwright/test';
import { expectAccessible } from './support';
import { PDFDocument, StandardFonts } from 'pdf-lib';
async function nav(page: Page, label: string) {
  await page.locator('#workspace-navigation').waitFor({ state: 'attached' });
  await page
    .locator('.workspace-header')
    .getByRole('button', { name: label, exact: label !== 'Checklist' })
    .click();
}
async function signup(page: Page) {
  const email = `fresh-${crypto.randomUUID()}@example.test`;
  await page.goto('/');
  await page.getByLabel('Your name').fill('Fresh Applicant');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('synthetic-browser-password');
  await page.getByLabel('I am 18 or older.').check();
  await page.getByLabel(/I agree to this development/).check();
  await page.getByRole('button', { name: 'Create my workspace' }).click();
  await page.getByRole('heading', { name: 'Welcome, Fresh.' }).waitFor();
  return email;
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
test('fresh account has useful distinct sections and accessible setup', async ({ page }) => {
  await signup(page);
  try {
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(
      page.getByRole('heading', { name: 'You have no applications yet.' }),
    ).toBeVisible();
    // A new account sees only the explanation and the path: nothing pre-filled or ticked.
    await expect(page.getByRole('list', { name: 'How to prepare an application' })).toContainText(
      'Start here',
    );
    await expect(page.locator('.state-mark, .starter-tile, .folder-card')).toHaveCount(0);
    await expectAccessible(page);
    await nav(page, 'Checklist');
    await expect(
      page.getByRole('heading', { name: 'Your checklist will appear here.' }),
    ).toBeVisible();
    await expectAccessible(page);
    await nav(page, 'Documents');
    await expect(
      page.getByRole('heading', { name: 'Your documents will appear here.' }),
    ).toBeVisible();
    await expectAccessible(page);
    await nav(page, 'Report');
    await expect(
      page.getByRole('heading', { name: 'Your readiness report will appear here.' }),
    ).toBeVisible();
    await expectAccessible(page);
    await nav(page, 'Activity');
    await expect(page.getByRole('heading', { name: 'Account created', exact: true })).toHaveCount(
      0,
    );
    expect(await (await page.request.get('/api/activity')).json()).toEqual([]);
    expect(await (await page.request.get('/api/notifications')).json()).toEqual([]);
    await nav(page, 'Overview');
    await page.getByRole('button', { name: 'Create your first application' }).click();
    await expectAccessible(page);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expectAccessible(page);
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
test('custom instructions become a working editable application with archive and account settings', async ({
  page,
}) => {
  await signup(page);
  try {
    await nav(page, 'Checklist');
    await page.getByRole('button', { name: 'Create your first application' }).click();
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
    await nav(page, 'Report');
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
    await expectAccessible(page);
  } finally {
    await cleanup(page).catch(() => {});
  }
});
test('documents-first onboarding inspects and renders real PDF pages', async ({ page }) => {
  await signup(page);
  try {
    await nav(page, 'Documents');
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    pdf.addPage().drawText('Synthetic resume - Fresh Applicant', { x: 40, y: 700, size: 18, font });
    pdf.addPage().drawText('Synthetic portfolio - second page', { x: 40, y: 700, size: 18, font });
    await page.getByLabel('Choose documents to upload').setInputFiles({
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
    await nav(page, 'Checklist');
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
    await nav(page, 'Report');
    await expect(
      page.getByRole('heading', { name: 'Your supported checks are reviewed.' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= Math.ceil(visualViewport!.width),
      ),
    ).toBe(true);
  } finally {
    await cleanup(page).catch(() => {});
  }
});

test('batch intake keeps valid files after a rejected file and explains duplicates', async ({
  page,
}) => {
  await signup(page);
  try {
    await nav(page, 'Documents');
    async function fixture(text: string) {
      const pdf = await PDFDocument.create();
      pdf.addPage().drawText(text, { x: 40, y: 700 });
      return Buffer.from(await pdf.save());
    }
    const resume = await fixture('Synthetic resume for batch intake');
    await page.getByLabel('Choose documents to upload').setInputFiles([
      { name: 'resume.pdf', mimeType: 'application/pdf', buffer: resume },
      {
        name: 'unsupported.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Unsupported synthetic text'),
      },
      {
        name: 'qualification.pdf',
        mimeType: 'application/pdf',
        buffer: await fixture('Synthetic qualification for batch intake'),
      },
    ]);
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /Job application/ })
      .click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByLabel('Application name', { exact: true }).fill('Batch intake application');
    await page.getByRole('button', { name: 'Review checklist' }).click();
    await page.getByRole('button', { name: 'Create application', exact: true }).click();
    const queue = page.getByRole('region', { name: 'Upload results' });
    await expect(queue.getByText('2 of 3 files accepted.', { exact: false })).toBeVisible();
    await expect(queue.getByText('Use a PDF or JPEG file with a simple filename.')).toBeVisible();
    await expect(page.getByText('Inspected', { exact: true })).toHaveCount(2, { timeout: 25000 });
    await expectAccessible(page);
    await page
      .getByLabel('Choose documents to upload')
      .setInputFiles({ name: 'resume-copy.pdf', mimeType: 'application/pdf', buffer: resume });
    await expect(
      queue.getByText('Already in this folder. No second copy was created.'),
    ).toBeVisible();
    await expect(page.getByText('Inspected', { exact: true })).toHaveCount(2);
    await page.getByRole('button', { name: 'Dismiss upload results' }).click();
    await expect(queue).not.toBeVisible();
  } finally {
    await cleanup(page).catch(() => {});
  }
});

test('application URLs survive refresh and Back and account password controls remain usable', async ({
  page,
}) => {
  const email = await signup(page);
  try {
    async function create(name: string) {
      await nav(page, 'Applications');
      await page.getByRole('button', { name: 'New application', exact: true }).click();
      await page
        .getByRole('dialog')
        .getByRole('button', { name: /Job application/ })
        .click();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByLabel('Application name', { exact: true }).fill(name);
      await page.getByRole('button', { name: 'Review checklist' }).click();
      await page.getByRole('button', { name: 'Create application', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Requirements & evidence' })).toBeVisible();
    }
    await create('First synthetic application');
    await nav(page, 'Documents');
    const firstUrl = page.url();
    expect(new URL(firstUrl).searchParams.get('view')).toBe('documents');
    await create('Second synthetic application');
    await nav(page, 'Documents');
    const secondUrl = page.url();
    expect(new URL(secondUrl).searchParams.get('application')).not.toBe(
      new URL(firstUrl).searchParams.get('application'),
    );
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Documents', exact: true })).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Breadcrumb' })
        .getByText('Second synthetic application', { exact: true }),
    ).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Checklist', exact: true })).toBeVisible();
    await page.goBack();
    await expect(
      page.getByRole('heading', { name: 'Your applications', exact: true }),
    ).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(firstUrl);
    await expect(page.getByRole('heading', { name: 'Documents', exact: true })).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Breadcrumb' })
        .getByText('First synthetic application', { exact: true }),
    ).toBeVisible();
    await nav(page, 'Settings & privacy');
    await page.getByLabel('Current password', { exact: true }).fill('synthetic-browser-password');
    await page
      .getByLabel('New password', { exact: true })
      .fill('synthetic-updated-browser-password');
    await page
      .getByLabel('Confirm new password', { exact: true })
      .fill('synthetic-updated-browser-password');
    await page.getByRole('button', { name: 'Update password' }).click();
    await expect(
      page
        .getByRole('status')
        .filter({ hasText: 'Password updated. Other sessions have been signed out.' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Sign out other sessions', exact: true }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Other sessions have been signed out.' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Sign out', exact: true }).last().click();
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('synthetic-updated-browser-password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
    await expect(
      page.getByRole('heading', { name: 'Second synthetic application', level: 1 }),
    ).toBeVisible();
    await nav(page, 'Settings & privacy');
    await expect(page.getByLabel('Display name')).toHaveValue('Fresh Applicant');
  } finally {
    await cleanup(page).catch(() => {});
  }
});
