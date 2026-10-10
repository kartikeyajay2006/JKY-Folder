import { test, expect, type Page } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { expectAccessible } from './support';

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

test('an applicant asks for help, shares time-limited access and revokes it', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Your name').fill('Support Applicant');
  await page.getByLabel('Email address').fill(`support-${crypto.randomUUID()}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('synthetic-browser-password');
  await page.getByLabel('I am 18 or older.').check();
  await page.getByLabel(/I agree to this development/).check();
  await page.getByRole('button', { name: 'Create my workspace' }).click();
  try {
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Synthetic marksheet for support.');
    await page.getByLabel('Choose documents to upload').setInputFiles({
      name: 'marksheet.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(await pdf.save()),
    });
    await expect(
      page.getByRole('button', { name: 'Open marksheet.pdf', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Help & guidance' }).click();
    const form = page.getByRole('region', { name: 'Contact support' });
    await form.getByLabel('A checklist result looks wrong').check();
    await form.getByLabel('Short summary').fill('The marksheet shows the wrong state');
    await form.getByLabel('For 24 hours').check();
    await form.getByRole('button', { name: 'Send request' }).click();
    await expect(form.getByRole('status')).toContainText('Support may view it until');
    await expect(
      form.getByText('Support can view this application until', { exact: false }),
    ).toBeVisible();
    await expectAccessible(page);
    await form.getByRole('button', { name: /Revoke access/ }).click();
    await expect(form.getByText('Access revoked.', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Activity', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Support access revoked', exact: true }),
    ).toBeVisible();
  } finally {
    await cleanup(page).catch(() => {});
  }
});
