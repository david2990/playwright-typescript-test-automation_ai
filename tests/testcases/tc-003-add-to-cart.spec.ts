import { env, requireCredentials } from '../../src/config/env';
import { expect, test } from '../../src/fixtures/base.fixture';

/**
 * Manual test case TC-003 - add to cart
 *
 * 1. Login with email and password
 * 2. Click on Computers -> Desktops
 * 3. Click on add to cart
 *
 * Every desktop that can be bought from the listing ("Simple Computer" and the
 * "Build your own ..." range) has required Processor/RAM/HDD options, so the
 * listing's Add to cart opens the product page; step 3 is completed there with
 * the default options. The cart counter is compared before and after because the
 * test account keeps whatever a previous run left in its cart.
 */
test.describe('TC-003 Add to cart @regression @tc-003', () => {
  test('adds a desktop to the cart while signed in', async ({
    homePage,
    header,
    loginPage,
    categoryPage,
    productPage,
    page,
  }) => {
    test.skip(!env.hasCredentials, 'TEST_USER / TEST_PASS are not configured');

    const { email, password } = requireCredentials();

    // Step 1: log in.
    await homePage.open();
    await header.loginLink.click();
    await expect(page).toHaveURL(/\/login$/);
    await loginPage.login(email, password);
    await expect(header.accountLink).toHaveText(email);

    const cartCountBefore = await header.cartItemCount();

    // Step 2: Computers -> Desktops via the top menu.
    await header.openSubCategory('Computers', 'Desktops');
    await expect(page).toHaveURL(/\/desktops$/);
    await categoryPage.expectHeading('Desktops');
    await expect(categoryPage.productItems.first()).toBeVisible();

    // Step 3: click Add to cart on the desktop's listing tile.
    const productName = 'Simple Computer';
    await categoryPage.addNamedProductToCart(productName);

    // Required options send us to the product page; accept the defaults and add there.
    await expect(page).toHaveURL(/\/simple-computer$/);
    await productPage.expectLoaded();
    await expect(productPage.name).toHaveText(productName);

    await productPage.selectDefaultOptions();
    await productPage.addToCart();

    await expect.poll(() => header.cartItemCount()).toBe(cartCountBefore + 1);
  });
});
