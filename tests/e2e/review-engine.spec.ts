import { test, expect, type Page } from '@playwright/test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { expectAccessible } from './support';
async function signup(page: Page) {
  await page.goto('/');
  await page.getByLabel('Your name').fill('Review Applicant');
  await page.getByLabel('Email address').fill(`review-${crypto.randomUUID()}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('synthetic-browser-password');
  await page.getByLabel('I am 18 or older.').check();
  await page.getByLabel(/I agree to this development/).check();
  await page.getByRole('button', { name: 'Create my workspace' }).click();
  await page.getByRole('heading', { name: 'Welcome, Review.' }).waitFor();
  const me = await (await page.request.get('/api/me')).json();
  return me.csrf as string;
}
async function nav(page: Page, name: string) {
  await page
    .locator('.workspace-header')
    .getByRole('button', { name, exact: name !== 'Checklist' && name !== 'Settings' })
    .click();
}
async function create(page: Page, csrf: string) {
  const created = await page.request.post('/api/packets', {
    headers: { 'x-csrf-token': csrf },
    data: {
      title: 'Two-form application',
      templateId: 'custom',
      deadline: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
      requirements: [
        {
          id: 'forms',
          title: 'Both application forms',
          description: 'Review both forms.',
          group: 'Supporting evidence',
          condition: { op: 'always' },
          mime: 'application/pdf',
          extension: '.pdf',
          sourceSection: 'Synthetic instructions',
          reviewHint: 'Compare each form with the original.',
          evidenceMode: 'all',
          evidenceSlots: ['First form', 'Second form'],
          minPages: 1,
          maxPages: 2,
        },
      ],
    },
  });
  expect(created.ok()).toBe(true);
  return (await created.json()).id as string;
}
async function upload(page: Page, csrf: string, pid: string, name: string, text: string) {
  const pdf = await PDFDocument.create(),
    font = await pdf.embedFont(StandardFonts.Helvetica);
  pdf.addPage().drawText(text, { font, x: 40, y: 700, size: 16 });
  const bytes = Buffer.from(await pdf.save());
  const result = await page.request.post(`/api/packets/${pid}/documents`, {
    headers: { 'x-csrf-token': csrf },
    multipart: { file: { name, mimeType: 'application/pdf', buffer: bytes } },
  });
  expect(result.ok()).toBe(true);
  await expect
    .poll(async () => {
      const detail = await (await page.request.get(`/api/packets/${pid}`)).json();
      return detail.documents.find((d: { name: string }) => d.name === name)?.status;
    })
    .toBe('ready');
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
test('multiple evidence components, fact correction and source details work in both themes', async ({
  page,
}) => {
  const csrf = await signup(page);
  try {
    const pid = await create(page, csrf);
    await upload(page, csrf, pid, 'first-form.pdf', 'Name: Synthetic Applicant\nFirst form');
    await upload(page, csrf, pid, 'second-form.pdf', 'Second form');
    await page.goto(`/?application=${pid}&view=requirements`);
    // Use normal navigation so the test does not depend on URL parameter spelling.
    await page.locator('#workspace-navigation').waitFor();
    await nav(page, 'Checklist');
    await page
      .locator('.requirement-row')
      .filter({ hasText: 'Both application forms' })
      .getByRole('button')
      .click();
    await page
      .getByRole('combobox', { name: 'Supporting document', exact: true })
      .selectOption({ label: 'first-form.pdf' });
    await page.getByLabel('I reviewed the content', { exact: true }).check();
    await page
      .getByLabel('Review note', { exact: false })
      .first()
      .fill('Compared the first form with the instructions.');
    await page.getByRole('button', { name: 'Add another evidence file or page range' }).click();
    await page
      .getByRole('combobox', { name: 'Supporting file', exact: true })
      .selectOption({ label: 'second-form.pdf' });
    await page
      .getByRole('combobox', { name: 'Component', exact: true })
      .selectOption('Second form');
    await page
      .getByRole('combobox', { name: 'Content review', exact: true })
      .selectOption('confirmed');
    await page
      .getByLabel('Review note', { exact: false })
      .last()
      .fill('Compared the second form with the instructions.');
    await expectAccessible(page);
    if (page.viewportSize()!.width > 1000)
      await page.screenshot({ path: 'docs/engineering/screenshots/evidence-gold.png' });
    await page.getByRole('button', { name: 'Save evidence link', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const detail = await (await page.request.get(`/api/packets/${pid}`)).json();
    expect(detail.live.checks[0].state).toBe('pass');
    expect(detail.live.checks[0].evidenceSet).toHaveLength(2);
    await page.getByText('Checklist sources & coverage', { exact: true }).click();
    await expect(page.getByText('Independent completeness review is still open.')).toBeVisible();
    await expectAccessible(page);
    await nav(page, 'Documents');
    await page.getByRole('button', { name: 'Open first-form.pdf', exact: true }).click();
    await page.getByLabel('Confirmed value').fill('Reviewed Applicant');
    await page
      .getByLabel('What did you check?')
      .fill('Compared the original name with the instructions.');
    await page.getByRole('button', { name: 'Confirm fact', exact: true }).click();
    await expect(page.getByText('Confirmed by you', { exact: false })).toBeVisible();
    await page.getByText('Correction history (1)').click();
    await expect(page.getByText(/Revision 1: Reviewed Applicant/)).toBeVisible();
    await page.getByRole('button', { name: 'Show original location' }).click();
    await expectAccessible(page);
    await page.keyboard.press('Escape');
    await nav(page, 'Settings');
    await page.getByRole('radio', { name: 'Silver (dark)' }).check();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expectAccessible(page);
    if (page.viewportSize()!.width > 1000)
      await page.screenshot({ path: 'docs/engineering/screenshots/reminders-silver.png' });
    await page.getByRole('checkbox', { name: 'Application deadlines', exact: true }).uncheck();
    await expect
      .poll(
        async () =>
          (await (await page.request.get('/api/notification-preferences')).json()).deadlines,
      )
      .toBe(false);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= Math.ceil(visualViewport!.width),
      ),
    ).toBe(true);
  } finally {
    await cleanup(page).catch(() => {});
  }
});
test('a lost upload response retries without duplicates and cancellation preserves existing originals', async ({
  page,
}) => {
  const csrf = await signup(page);
  try {
    const pid = await create(page, csrf);
    await upload(page, csrf, pid, 'baseline.pdf', 'Existing synthetic original.');
    await page.reload();
    await page.locator('#workspace-navigation').waitFor();
    await nav(page, 'Documents');
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText('Synthetic upload');
    const buffer = Buffer.from(await pdf.save());
    let first = true;
    await page.route('**/api/uploads/*/complete', async (route) => {
      if (first) {
        first = false;
        await route.fetch();
        await route.abort('failed');
      } else await route.continue();
    });
    await page
      .locator('input[type=file]')
      .setInputFiles({ name: 'network.pdf', mimeType: 'application/pdf', buffer });
    await expect(page.getByText('Connection interrupted.', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Retry failed uploads' }).click();
    await expect(page.getByRole('button', { name: 'Open network.pdf', exact: true })).toBeVisible();
    expect((await (await page.request.get(`/api/packets/${pid}`)).json()).documents).toHaveLength(
      2,
    );
    await page.unroute('**/api/uploads/*/complete');
    await page.route('**/api/uploads/*', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.abort('aborted').catch(() => {});
    });
    await page
      .locator('input[type=file]')
      .setInputFiles({ name: 'cancel.pdf', mimeType: 'application/pdf', buffer });
    await page.getByRole('button', { name: 'Cancel remaining uploads' }).click();
    await expect(page.getByText('Upload paused.', { exact: false })).toBeVisible();
    await expectAccessible(page);
    await page.unroute('**/api/uploads/*');
  } finally {
    await cleanup(page).catch(() => {});
  }
});
