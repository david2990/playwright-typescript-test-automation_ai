import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, test as setup } from '@playwright/test';
import { env, requireCredentials } from '../../src/config/env';
import { LoginPage } from '../../src/pages/login.page';

// Tagged @smoke so `--grep @smoke` still runs the dependency for the authenticated project.
setup('sign in and save session state @smoke', async ({ page }) => {
  if (!env.hasCredentials) {
    setup.skip(true, 'TEST_USER / TEST_PASS are not configured, skipping session setup');
  }

  const { email, password } = requireCredentials();
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login(email, password);
  await expect(page.locator('.header-links a.account')).toHaveText(email);

  mkdirSync(dirname(env.storageStatePath), { recursive: true });
  await page.context().storageState({ path: env.storageStatePath });
});
