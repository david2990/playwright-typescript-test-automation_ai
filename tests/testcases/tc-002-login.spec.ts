import { env, requireCredentials } from '../../src/config/env';
import { expect, test } from '../../src/fixtures/base.fixture';

/**
 * Manual test case TC-002 - Login
 *
 * 1. Click on Login
 * 2. Enter the email & Password
 * 3. Click on Login
 *
 * Uses the registered test account from TEST_USER / TEST_PASS, so it is skipped
 * (not failed) when those variables are absent.
 */
test.describe('TC-002 Login @regression @tc-002', () => {
  test('signs in with the email and password', async ({ homePage, header, loginPage, page }) => {
    test.skip(!env.hasCredentials, 'TEST_USER / TEST_PASS are not configured');

    const { email, password } = requireCredentials();

    await homePage.open();

    // Step 1: open the login form from the header.
    await header.loginLink.click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.heading).toHaveText(/welcome, please sign in/i);

    // Steps 2 and 3: enter the credentials and submit.
    await loginPage.login(email, password);

    // Signed in: back on the storefront with the account name in the header.
    await expect(page).toHaveURL(/\/$/);
    await expect(header.accountLink).toHaveText(email);
    await expect(header.logoutLink).toBeVisible();
  });
});
