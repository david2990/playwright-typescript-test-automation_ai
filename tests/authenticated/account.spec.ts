import { env } from '../../src/config/env';
import { expect, test } from '@playwright/test';

test.describe('Authenticated session', () => {
  test('saved session state opens the account page @smoke', async ({ page }) => {
    await page.goto('/customer/info');

    await expect(page.locator('.page-title h1')).toHaveText(/my account/i);
    await expect(page.locator('.header-links a.ico-logout')).toBeVisible();
    await expect(page.locator('.header-links a.ico-login')).toHaveCount(0);
    if (env.hasCredentials) {
      await expect(page.locator('#Email')).toHaveValue(env.credentials.email);
    }
  });
});
