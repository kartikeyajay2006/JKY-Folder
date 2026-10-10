import { test, expect } from '@playwright/test';
import { expectAccessible } from './support';
test('forgot password explains disabled delivery; token forms remove fragments and validate input', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Forgot password?' }).click();
  await page.getByLabel('Email address').fill('synthetic@example.test');
  await expect(page.getByLabel('Password', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('alert')).toContainText('Email recovery is unavailable');
  await expectAccessible(page);
  await page.goto('/#reset=' + 'a'.repeat(64));
  await expect(page.getByRole('heading', { name: 'Choose a new password' })).toBeVisible();
  await expect.poll(() => new URL(page.url()).hash).toBe('');
  await page.getByLabel('New password', { exact: true }).fill('synthetic-new-password');
  await page.getByLabel('Confirm new password').fill('synthetic-wrong-password');
  await page.getByRole('button', { name: 'Save new password' }).click();
  await expect(page.getByRole('alert')).toHaveText('Passwords must match.');
  await page.getByLabel('Confirm new password').fill('synthetic-new-password');
  await page.getByRole('button', { name: 'Save new password' }).click();
  await expect(page.getByRole('alert')).toContainText('invalid or expired');
  await expectAccessible(page);
  await page.goto('/#verify=' + 'b'.repeat(64));
  await page.getByRole('button', { name: 'Verify email address' }).click();
  await expect(page.getByRole('alert')).toContainText('invalid or expired');
  await expectAccessible(page);
});
