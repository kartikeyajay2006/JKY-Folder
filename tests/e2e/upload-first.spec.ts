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
test('a lost first-upload response is recovered automatically without a second folder', async ({
  page,
}) => {
  await signup(page);
  try {
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Synthetic first upload retry.');
    let completes = 0;
    await page.route('**/api/uploads/*/complete', async (route) => {
      // The server accepts the first completion but its response never arrives.
      if (++completes === 1) {
        await route.fetch();
        await route.abort('failed');
      } else await route.continue();
    });
    await page.getByLabel('Choose documents to upload').setInputFiles({
      name: 'first.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(await pdf.save()),
    });
    await expect(page.getByRole('button', { name: 'Open first.pdf', exact: true })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: '1 added' })).toBeVisible();
    expect(completes).toBe(2);
    const rows = await (await page.request.get('/api/packets')).json();
    expect(rows).toHaveLength(1);
    expect(rows[0].documentCount).toBe(1);
  } finally {
    await cleanup(page).catch(() => {});
  }
});
test('going offline mid-upload pauses and continues from the saved chunk on reconnect', async ({
  page,
  context,
}) => {
  await signup(page);
  try {
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Synthetic offline upload.');
    const bytes = Buffer.concat([Buffer.from(await pdf.save()), Buffer.alloc(1200000, 32)]);
    const offsets: string[] = [];
    let firstChunk: () => void = () => {};
    const acknowledged = new Promise<void>((resolve) => (firstChunk = resolve));
    await page.route('**/api/uploads/*', async (route) => {
      if (route.request().method() !== 'PUT') return route.continue();
      offsets.push(route.request().headers()['upload-offset']);
      const response = await route.fetch();
      await route.fulfill({ response });
      if (offsets.length === 1) {
        firstChunk();
        await context.setOffline(true);
      }
    });
    await page
      .getByLabel('Choose documents to upload')
      .setInputFiles({ name: 'offline.pdf', mimeType: 'application/pdf', buffer: bytes });
    await acknowledged;
    await expect(page.getByText('You’re offline.', { exact: false })).toBeVisible();
    await context.setOffline(false);
    await expect(page.getByRole('button', { name: 'Open offline.pdf', exact: true })).toBeVisible({
      timeout: 20000,
    });
    // Bytes already saved were never sent again.
    expect(offsets[0]).toBe('0');
    expect(new Set(offsets).size).toBe(offsets.length);
    expect(offsets).toContain('524288');
  } finally {
    await context.setOffline(false);
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
    let firstSaved: () => void = () => {};
    const saved = new Promise<void>((resolve) => (firstSaved = resolve));
    await page.route('**/api/uploads/*', async (route) => {
      if (route.request().method() !== 'PUT') return route.continue();
      if (++chunks === 1) {
        await route.continue();
        firstSaved();
      }
      // Later chunks hang, like a connection that dies before the tab is closed.
    });
    await page
      .getByLabel('Choose documents to upload')
      .setInputFiles({ name: 'instructions.pdf', mimeType: 'application/pdf', buffer: bytes });
    await saved;
    await expect
      .poll(async () => (await (await page.request.get('/api/uploads')).json())[0]?.offset)
      .toBe(524288);
    expect(await (await page.request.get('/api/packets')).json()).toEqual([]);
    await page.unroute('**/api/uploads/*');
    await page.reload();
    const pending = page.getByRole('region', { name: 'Unfinished uploads' });
    await expect(pending).toContainText('instructions.pdf');
    await expect(pending).toContainText('% of');
    const offsets: string[] = [];
    await page.route('**/api/uploads/*', async (route) => {
      if (route.request().method() === 'PUT')
        offsets.push(route.request().headers()['upload-offset']);
      await route.continue();
    });
    const chooser = page.waitForEvent('filechooser');
    await pending.getByRole('button', { name: 'Finish upload of instructions.pdf' }).click();
    await (
      await chooser
    ).setFiles({ name: 'instructions.pdf', mimeType: 'application/pdf', buffer: bytes });
    await expect(page.getByText('Inspected', { exact: true })).toBeVisible({ timeout: 20000 });
    expect(offsets).toEqual(['524288']);
    await page
      .locator('#workspace-navigation')
      .getByRole('button', { name: /Checklist/ })
      .click();
    await page.getByRole('button', { name: 'Draft from instructions PDF' }).click();
    await page.getByRole('button', { name: 'Generate draft' }).click();
    const dialog = page.getByRole('dialog');
    const card = dialog.getByRole('group', { name: 'Proposal 1, page 1' });
    await expect(card.getByLabel('Item name')).toHaveValue('Passport');
    await expect(dialog.getByText('Source text, page 1')).toBeVisible();
    await expect(dialog.getByText('0 of 1 proposals decided')).toBeVisible();
    await card.getByLabel('Include in checklist').check();
    await card.getByLabel('Required for this application').check();
    await expect(card.getByLabel('Acceptance reason')).toHaveValue(
      'Matches the source wording on this page.',
    );
    await expect(dialog.getByText('1 of 1 proposals decided')).toBeVisible();
    await dialog.getByLabel(/I read every source page/).check();
    await expectAccessible(page);
    await dialog.getByRole('button', { name: 'Confirm and activate checklist' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Passport', exact: true })).toBeVisible();
  } finally {
    await cleanup(page).catch(() => {});
  }
});
