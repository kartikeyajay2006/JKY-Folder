import { test, expect, type Page } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { expectAccessible } from './support';
async function signup(page: Page) {
  await page.goto('/');
  await page.getByLabel('Your name').fill('Upload User');
  await page.getByLabel('Email address').fill(`upload-${crypto.randomUUID()}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('synthetic-browser-password');
  await page.getByLabel('I am 18 or older.').check();
  await page.getByLabel(/I agree to this development/).check();
  await page.getByRole('button', { name: 'Create my workspace' }).click();
  await page.getByRole('heading', { name: 'Upload your first document.' }).waitFor();
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
test('no application or checklist exists before upload; afterwards only uploaded originals appear', async ({
  page,
}) => {
  await signup(page);
  try {
    const tabs = page.locator('#workspace-navigation');
    for (const name of ['Applications', 'Checklist', 'Documents', 'Report'])
      await expect(tabs.getByRole('button', { name, exact: false })).toHaveCount(0);
    await expect(page.locator('.folder-card,.starter-tile,.requirement-row')).toHaveCount(0);
    await expectAccessible(page);
    if (page.viewportSize()!.width > 1000)
      await page.screenshot({ path: 'docs/engineering/screenshots/upload-start-gold.png' });
    await page.getByRole('button', { name: 'Quick actions', exact: true }).click();
    await expect(
      page
        .getByRole('dialog')
        .getByRole('button', { name: /Go to.*Checklist|Your applications|Run a readiness/ }),
    ).toHaveCount(0);
    await page.keyboard.press('Escape');
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Synthetic handwriting original.');
    const bytes = Buffer.from(await pdf.save());
    await page
      .getByLabel('Choose documents to upload')
      .setInputFiles({ name: 'handwriting.pdf', mimeType: 'application/pdf', buffer: bytes });
    await expect(
      page.getByRole('button', { name: 'Open handwriting.pdf', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('Inspected', { exact: true })).toBeVisible({ timeout: 20000 });
    await tabs.getByRole('button', { name: /Checklist/ }).click();
    await expect(page.locator('.requirement-row')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'handwriting.pdf', exact: true })).toBeVisible();
    for (const name of [
      'Recent photograph',
      'Signature',
      'Proof of age',
      'Category certificate',
      'Principal / board certificate',
    ])
      await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Use dark theme' }).click();
    await expectAccessible(page);
    if (page.viewportSize()!.width > 1000)
      await page.screenshot({ path: 'docs/engineering/screenshots/uploaded-checklist-silver.png' });
    await page.reload();
    await expect(page.locator('.requirement-row')).toHaveCount(1);
    await tabs.getByRole('button', { name: 'Documents', exact: true }).click();
    await page.getByRole('button', { name: 'Delete handwriting.pdf' }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Yes, delete', exact: true })
      .click();
    await expect(page.getByRole('heading', { name: 'Upload your first document.' })).toBeVisible();
    await expect(
      tabs.getByRole('button', { name: /Applications|Checklist|Documents|Report/ }),
    ).toHaveCount(0);
  } finally {
    await cleanup(page).catch(() => {});
  }
});
test('a rejected first file leaves no folder or preset checklist behind', async ({ page }) => {
  await signup(page);
  try {
    await page.getByLabel('Choose documents to upload').setInputFiles({
      name: 'invalid.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('not a PDF'),
    });
    await expect(page.getByText('This is not a supported PDF or JPEG file.')).toBeVisible();
    expect(await (await page.request.get('/api/packets')).json()).toEqual([]);
    await expect(page.locator('.folder-card,.requirement-row')).toHaveCount(0);
    await expectAccessible(page);
  } finally {
    await cleanup(page).catch(() => {});
  }
});
test('a lost first-upload response recovers its folder and retries without another folder', async ({
  page,
}) => {
  await signup(page);
  try {
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Synthetic first upload retry.');
    await page.route('**/api/uploads/*/complete', async (route) => {
      await route.fetch();
      await route.abort('failed');
    });
    await page.getByLabel('Choose documents to upload').setInputFiles({
      name: 'first.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(await pdf.save()),
    });
    await expect(page.getByRole('button', { name: 'Open first.pdf', exact: true })).toBeVisible();
    await expect(page.getByText('Connection interrupted.', { exact: false })).toBeVisible();
    await page.unroute('**/api/uploads/*/complete');
    await page.getByRole('button', { name: 'Retry failed uploads' }).click();
    await expect(
      page.getByText('Already in this folder. No second copy was created.'),
    ).toBeVisible();
    const rows = await (await page.request.get('/api/packets')).json();
    expect(rows).toHaveLength(1);
    expect(rows[0].documentCount).toBe(1);
  } finally {
    await cleanup(page).catch(() => {});
  }
});
test('resumes from a durable chunk after reload and confirms a PDF checklist with source decisions', async ({
  page,
}) => {
  await signup(page);
  try {
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Submit passport as PDF.');
    const bytes = Buffer.concat([Buffer.from(await pdf.save()), Buffer.alloc(700000, 32)]);
    let chunks = 0;
    await page.route('**/api/uploads/*', async (route) => {
      if (route.request().method() === 'PUT' && ++chunks === 2) await route.abort('failed');
      else await route.continue();
    });
    await page
      .getByLabel('Choose documents to upload')
      .setInputFiles({ name: 'instructions.pdf', mimeType: 'application/pdf', buffer: bytes });
    await expect(page.getByText('Connection interrupted.', { exact: false })).toBeVisible();
    expect(await (await page.request.get('/api/packets')).json()).toEqual([]);
    await page.unroute('**/api/uploads/*');
    await page.reload();
    const offsets: string[] = [];
    await page.route('**/api/uploads/*', async (route) => {
      if (route.request().method() === 'PUT')
        offsets.push(route.request().headers()['upload-offset']);
      await route.continue();
    });
    await page
      .getByLabel('Choose documents to upload')
      .setInputFiles({ name: 'instructions.pdf', mimeType: 'application/pdf', buffer: bytes });
    await expect(page.getByText('Inspected', { exact: true })).toBeVisible({ timeout: 20000 });
    expect(offsets).toEqual(['524288']);
    await page
      .locator('#workspace-navigation')
      .getByRole('button', { name: /Checklist/ })
      .click();
    await page.getByRole('button', { name: 'Draft from instructions PDF' }).click();
    await page.getByRole('button', { name: 'Generate draft' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Requirement 1 name')).toHaveValue('Submit passport as PDF.');
    await dialog.getByText('Source page 1: Submit passport as PDF.', { exact: true }).click();
    await dialog
      .getByLabel('Acceptance reason')
      .fill('Checked source page 1 and confirmed the passport format.');
    await dialog.getByLabel(/I read every source page/).check();
    await expectAccessible(page);
    await dialog.getByRole('button', { name: 'Confirm and activate checklist' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'Submit passport as PDF.', exact: true }),
    ).toBeVisible();
  } finally {
    await cleanup(page).catch(() => {});
  }
});
