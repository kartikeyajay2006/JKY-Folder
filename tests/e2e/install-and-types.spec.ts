import { test, expect } from '@playwright/test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { expectAccessible } from './support';

test('the app can be installed and recognises what an uploaded document is', async ({ page }) => {
  const manifest = await page.request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).display).toBe('standalone');
  expect((await page.request.get('/offline.html')).ok()).toBe(true);
  await page.goto('/');
  await page.getByLabel('Your name').fill('Install Applicant');
  await page.getByLabel('Email address').fill(`install-${crypto.randomUUID()}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('synthetic-browser-password');
  await page.getByLabel('I am 18 or older.').check();
  await page.getByLabel(/I agree to this development/).check();
  await page.getByRole('button', { name: 'Create my workspace' }).click();
  await page.getByRole('heading', { name: 'Welcome, Install.' }).waitFor();
  const csrf = (await (await page.request.get('/api/me')).json()).csrf as string;
  try {
    const pdf = await PDFDocument.create(),
      font = await pdf.embedFont(StandardFonts.Helvetica);
    pdf
      .addPage()
      .drawText('Unique Identification Authority of India', { font, x: 40, y: 700, size: 16 });
    const intake = await page.request.post('/api/intake', {
      headers: { 'x-csrf-token': csrf },
      multipart: {
        file: {
          name: 'scan-0042.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from(await pdf.save()),
        },
      },
    });
    const { packetId } = await intake.json();
    await page.goto(`/?view=documents&application=${packetId}`);
    await expect(page.locator('.document-row', { hasText: 'scan-0042.pdf' })).toContainText(
      'Looks like: Aadhaar card',
      { timeout: 20000 },
    );
    await page.goto('/?view=settings');
    await expect(page.getByRole('heading', { name: 'Install on this device' })).toBeVisible();
    await expectAccessible(page);
  } finally {
    await page.request.delete('/api/account', {
      headers: { 'x-csrf-token': csrf },
      data: { confirmation: 'DELETE' },
    });
  }
});
