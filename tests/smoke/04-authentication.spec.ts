import { env, requireCredentials } from '../../src/config/env';
import { expect, test } from '../../src/fixtures/base.fixture';

test.describe('Authentication', () => {
  test('rejects invalid credentials @smoke', async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.login('not-a-real-user@example.com', 'WrongPassword1!');

    await loginPage.expectErrorMessage(/login was unsuccessful/i);
    await expect(page.locator('.header-links a.ico-login')).toBeVisible();
    await expect(page.locator('.header-links a.account')).toHaveCount(0);
  });

  test('signs in with valid credentials and signs out again @smoke', async ({
    loginPage,
    header,
    page,
  }) => {
    test.skip(!env.hasCredentials, 'TEST_USER / TEST_PASS are not configured');

    const { email, password } = requireCredentials();
    await loginPage.open();
    await loginPage.login(email, password);

    await expect(header.accountLink).toHaveText(email);

    await header.logout();
    await expect(page).toHaveURL(/\/$/);
    await expect(header.accountLink).toHaveCount(0);
  });
});
