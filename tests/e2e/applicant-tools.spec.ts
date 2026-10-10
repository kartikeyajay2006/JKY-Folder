import { test, expect, type Page } from '@playwright/test';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { createCanvas } from '@napi-rs/canvas';
import { expectAccessible } from './support';

const outbox = join(process.env.JKY_E2E_DATA || '', 'outbox');
async function signup(page: Page, extra?: (page: Page) => Promise<void>) {
  const email = `tools-${crypto.randomUUID()}@example.test`;
  await page.goto('/');
  await page.getByLabel('Your name').fill('Kartikeya Yadav');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('synthetic-browser-password');
  if (extra) await extra(page);
  else await page.getByLabel('I am 18 or older.').check();
  await page.getByLabel(/I agree to this development/).check();
  await page.getByRole('button', { name: 'Create my workspace' }).click();
  if (!extra) await page.getByRole('heading', { name: 'Welcome, Kartikeya.' }).waitFor();
  return email;
}
async function csrf(page: Page) {
  return (await (await page.request.get('/api/me')).json()).csrf as string;
}
async function pdf(text: string) {
  const doc = await PDFDocument.create(),
    font = await doc.embedFont(StandardFonts.Helvetica);
  doc.addPage().drawText(text, { font, x: 40, y: 700, size: 16, lineHeight: 22 });
  return Buffer.from(await doc.save());
}
function jpeg(width: number, height: number) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#6f8fbf');
  gradient.addColorStop(1, '#d9c27a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#f3e3cf';
  ctx.beginPath();
  ctx.ellipse(width / 2, height * 0.42, width * 0.2, height * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  return canvas.encodeSync('jpeg', 92);
}
async function intake(page: Page, token: string, name: string, buffer: Buffer) {
  const r = await page.request.post('/api/intake', {
    headers: { 'x-csrf-token': token },
    multipart: {
      file: {
        name,
        mimeType: name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        buffer,
      },
    },
  });
  expect(r.ok()).toBe(true);
  return (await r.json()).packetId as string;
}
async function inspected(page: Page, packetId: string) {
  await expect
    .poll(
      async () =>
        (await (await page.request.get(`/api/packets/${packetId}`)).json()).documents.every(
          (d: { status: string }) => d.status === 'ready',
        ),
      { timeout: 20000 },
    )
    .toBe(true);
}
async function cleanup(page: Page) {
  const me = await page.request.get('/api/me');
  if (me.ok())
    await page.request.delete('/api/account', {
      headers: { 'x-csrf-token': (await me.json()).csrf },
      data: { confirmation: 'DELETE' },
    });
}
function mailFor(address: string, kind: 'guardian' | 'guardian-manage') {
  if (!existsSync(outbox)) return '';
  for (const file of readdirSync(outbox).sort().reverse()) {
    const text = readFileSync(join(outbox, file), 'utf8');
    const token = text.match(new RegExp(`#${kind}=([a-f0-9]{64})`))?.[1];
    if (token && text.includes(address)) return token;
  }
  return '';
}

test('one library of originals: add a document to another application without uploading it again', async ({
  page,
}) => {
  await signup(page);
  try {
    const token = await csrf(page);
    const first = await intake(
      page,
      token,
      'class-10-marksheet.pdf',
      await pdf('Name: Kartikeya Yadav'),
    );
    const second = await intake(
      page,
      token,
      'scholarship-form.pdf',
      await pdf('Scholarship application form'),
    );
    await inspected(page, first);
    await inspected(page, second);
    await page.goto('/?view=library');
    await expect(page.getByRole('heading', { name: 'My documents' })).toBeVisible();
    const row = page.locator('.library-row', { hasText: 'class-10-marksheet.pdf' });
    await row.getByLabel('Add class-10-marksheet.pdf to an application').selectOption(second);
    await row.getByRole('button', { name: 'Add class-10-marksheet.pdf' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Added class-10-marksheet.pdf' }),
    ).toBeVisible();
    await expect(row.locator('.use-chip')).toHaveCount(2);
    await expectAccessible(page);
    if (page.viewportSize()!.width > 1000)
      await page.screenshot({ path: 'docs/engineering/screenshots/my-documents-gold.png' });
    // From the other side: pick documents inside an application.
    await page.goto(`/?view=documents&application=${first}`);
    await page.getByRole('button', { name: 'From my documents' }).click();
    const dialog = page.getByRole('dialog', { name: 'Add from my documents' });
    await dialog.getByRole('checkbox', { name: /scholarship-form\.pdf/ }).check();
    await expectAccessible(page);
    await dialog.getByRole('button', { name: 'Add 1 document' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Added a document' })).toBeVisible();
    await expect(page.locator('.document-row', { hasText: 'scholarship-form.pdf' })).toContainText(
      'Added from My documents',
    );
  } finally {
    await cleanup(page);
  }
});

test('a photo that breaks the size limits is fitted in the browser and saved as a new version', async ({
  page,
}) => {
  await signup(page);
  try {
    const token = await csrf(page);
    const pid = await intake(page, token, 'photo.jpg', jpeg(900, 1100));
    await inspected(page, pid);
    let detail = await (await page.request.get(`/api/packets/${pid}`)).json();
    const set = await page.request.put(`/api/packets/${pid}/instructions`, {
      headers: { 'x-csrf-token': token },
      data: {
        expectedRevision: detail.packet.revision,
        templateId: 'custom',
        requirements: [
          {
            id: 'photo',
            title: 'Recent photograph',
            description: 'A recent colour photograph.',
            group: 'Identity',
            condition: { op: 'always' },
            mime: 'image/jpeg',
            extension: '.jpg',
            minBytes: 10 * 1024,
            maxBytes: 50 * 1024,
            maxWidth: 200,
            maxHeight: 230,
            sourceSection: 'Photograph',
            reviewHint: 'Check the face is clear.',
          },
        ],
      },
    });
    expect(set.ok()).toBe(true);
    detail = await (await page.request.get(`/api/packets/${pid}`)).json();
    await page.request.put(`/api/packets/${pid}/evidence/photo`, {
      headers: { 'x-csrf-token': token },
      data: {
        expectedRevision: detail.packet.revision,
        documentId: detail.documents[0].id,
        pageFrom: 1,
        pageTo: 1,
        review: 'unreviewed',
        note: '',
      },
    });
    await page.goto(`/?view=requirements&application=${pid}`);
    await page.getByRole('button', { name: 'Fix to fit' }).click();
    const dialog = page.getByRole('dialog', { name: 'Fit photo or signature' });
    await expect(dialog.getByText('Limits from your checklist:')).toContainText(
      'width at most 200 px',
    );
    const save = dialog.getByRole('button', { name: /Save as photo-\d+x\d+\.jpg/ });
    await expect(save).toBeEnabled({ timeout: 15000 });
    await expect(dialog.locator('.fixer-checks .is-off')).toHaveCount(0);
    // The frame moves with the keyboard.
    const frame = dialog.getByRole('group', { name: 'Crop area' });
    await frame.focus();
    const before = await frame.evaluate((el) => (el as HTMLElement).style.top);
    await page.keyboard.press('-');
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => frame.evaluate((el) => (el as HTMLElement).style.top)).not.toBe(before);
    await expect(save).toBeEnabled({ timeout: 15000 });
    await expectAccessible(page);
    if (page.viewportSize()!.width > 1000)
      await page.screenshot({ path: 'docs/engineering/screenshots/photo-fixer-gold.png' });
    await save.click();
    await expect(
      page
        .getByRole('status')
        .filter({ hasText: /for Recent photograph\. The original is kept\./ }),
    ).toBeVisible();
    await inspected(page, pid);
    detail = await (await page.request.get(`/api/packets/${pid}`)).json();
    expect(detail.documents).toHaveLength(2);
    const fitted = detail.documents[1];
    expect(fitted.width).toBeLessThanOrEqual(200);
    expect(fitted.height).toBeLessThanOrEqual(230);
    expect(fitted.size).toBeLessThanOrEqual(50 * 1024);
    expect(fitted.size).toBeGreaterThanOrEqual(10 * 1024);
    expect(fitted.derivedFrom.name).toBe('photo.jpg');
    expect(detail.live.checks[0].fileState).toBe('pass');
  } finally {
    await cleanup(page);
  }
});

test('names and dates of birth are compared across documents with plain explanations', async ({
  page,
}) => {
  await signup(page);
  try {
    const token = await csrf(page);
    const pid = await intake(
      page,
      token,
      'class-10-marksheet.pdf',
      await pdf(
        'Candidate Name: KARTIKEYA YADAV\nFather’s Name: RAJESH YADAV\nDate of Birth: 12/03/2008',
      ),
    );
    for (const [name, text] of [
      ['aadhaar.pdf', 'Name: Kartikeya Yadav\nDOB: 2008-03-12'],
      ['category-certificate.pdf', 'Name: Kartikeye Yadav\nDate of birth: 12 March 2008'],
    ]) {
      const detail = await (await page.request.get(`/api/packets/${pid}`)).json();
      const r = await page.request.post(`/api/packets/${pid}/documents`, {
        headers: { 'x-csrf-token': token },
        multipart: { file: { name, mimeType: 'application/pdf', buffer: await pdf(text) } },
      });
      expect(r.ok(), JSON.stringify(detail.packet.revision)).toBe(true);
    }
    await inspected(page, pid);
    await page.goto(`/?application=${pid}`);
    const panel = page.getByRole('region', { name: 'Name and date of birth' });
    await expect(panel.getByRole('status')).toContainText('1 difference to check');
    await expect(panel.locator('li', { hasText: 'Kartikeye Yadav' })).toContainText(
      'Spelled differently',
    );
    await expect(panel).not.toContainText('RAJESH');
    await expect(panel.locator('li', { hasText: '12 March 2008' })).toContainText('Matches');
    await expectAccessible(page);
    if (page.viewportSize()!.width > 1000)
      await panel.screenshot({ path: 'docs/engineering/screenshots/identity-check-gold.png' });
    await panel.getByLabel('Compare with').selectOption({ label: 'category-certificate.pdf' });
    await expect(panel.getByRole('status')).toContainText('2 differences to check');
    await panel
      .getByRole('button', { name: 'Open aadhaar.pdf, page 1, to check the name' })
      .click();
    await expect(page.getByRole('dialog', { name: 'aadhaar.pdf' })).toBeVisible();
  } finally {
    await cleanup(page);
  }
});

test('an under-18 applicant waits for a guardian, who approves and can later withdraw', async ({
  page,
  browser,
}) => {
  const year = new Date().getFullYear() - 16;
  const guardianEmail = `parent-${crypto.randomUUID()}@example.test`;
  await signup(page, async (p) => {
    await p.getByLabel('I am under 18.').check();
    await p.getByLabel('Month of birth').selectOption({ label: 'March' });
    await p.getByLabel('Year of birth').selectOption(String(year));
    await p.getByLabel('Parent’s or guardian’s email').fill(guardianEmail);
  });
  await expect(
    page.getByRole('heading', { name: 'Waiting for your parent or guardian.' }),
  ).toBeVisible();
  await expect(page.getByText(guardianEmail)).toBeVisible();
  await expectAccessible(page);
  if (page.viewportSize()!.width > 1000)
    await page.screenshot({ path: 'docs/engineering/screenshots/guardian-waiting-gold.png' });
  const blocked = await page.request.post('/api/intake', {
    headers: { 'x-csrf-token': await csrf(page) },
    multipart: {
      file: { name: 'x.pdf', mimeType: 'application/pdf', buffer: await pdf('x') },
    },
  });
  expect(blocked.status()).toBe(403);
  await expect.poll(() => mailFor(guardianEmail, 'guardian'), { timeout: 15000 }).not.toBe('');
  const context = await browser.newContext();
  const parent = await context.newPage();
  try {
    await parent.goto('/#guardian=' + mailFor(guardianEmail, 'guardian'));
    await expect(
      parent.getByRole('heading', { name: 'Approve Kartikeya’s account' }),
    ).toBeVisible();
    await parent.getByLabel('Your full name').fill('Sunita Yadav');
    await parent.getByLabel('Parent', { exact: true }).check();
    await parent.getByLabel(/I am Kartikeya’s parent or legal guardian/).check();
    await expectAccessible(parent);
    await parent.getByRole('button', { name: 'Approve account' }).click();
    await expect(parent.getByRole('status')).toContainText('Approved.');
    await page.getByRole('button', { name: 'Check again' }).click();
    await expect(page.getByRole('heading', { name: 'Upload your first document.' })).toBeVisible();
    await expect
      .poll(() => mailFor(guardianEmail, 'guardian-manage'), { timeout: 15000 })
      .not.toBe('');
    await parent.goto('/#guardian-manage=' + mailFor(guardianEmail, 'guardian-manage'));
    await parent.getByLabel('Type WITHDRAW to confirm').fill('WITHDRAW');
    await parent.getByRole('button', { name: 'Withdraw approval and delete the account' }).click();
    await expect(parent.getByRole('status')).toContainText('Consent withdrawn.');
    expect((await page.request.get('/api/me')).status()).toBe(401);
  } finally {
    await context.close();
    await cleanup(page);
  }
});
