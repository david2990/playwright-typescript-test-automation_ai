import { expect, test } from '../../src/fixtures/base.fixture';
import type { RegistrationDetails } from '../../src/pages/register.page';

/**
 * Manual test case TC-001 - Register
 *
 * 1. Click on the url https://demowebshop.tricentis.com
 * 2. Click on register button
 * 3. Complete the registration
 * 4. Click on Log out link
 *
 * Each run registers a brand new customer, because the demo shop rejects a
 * duplicate email address. Tagged @regression (not @smoke) so the 2-hourly
 * smoke pack does not create an account on every run.
 */
test.describe('TC-001 Register @regression @tc-001', () => {
  test('registers a new customer and logs out', async ({
    homePage,
    header,
    registerPage,
    page,
  }) => {
    const details: RegistrationDetails = {
      gender: 'female',
      firstName: 'QA',
      lastName: 'Automation',
      email: `qa.tc001.${Date.now()}@mailinator.com`,
      password: 'Str0ng!Pass2026',
    };

    // Step 1: open the storefront.
    await homePage.open();

    // Step 2: open the registration form from the header.
    await header.registerLink.click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(registerPage.heading).toHaveText(/register/i);

    // Step 3: complete the registration - the customer is signed in afterwards.
    await registerPage.register(details);
    await registerPage.expectRegistered();
    await expect(header.accountLink).toHaveText(details.email);

    // Step 4: log out and confirm the guest header is back.
    await header.logout();
    await expect(page).toHaveURL(/\/$/);
    await expect(header.loginLink).toBeVisible();
    await expect(header.logoutLink).toHaveCount(0);
  });
});
