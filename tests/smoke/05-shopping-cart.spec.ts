import { expect, test } from '../../src/fixtures/base.fixture';

test.describe('Shopping cart', () => {
  test('adds a product to the cart, shows it, then removes it @smoke', async ({
    homePage,
    header,
    categoryPage,
    productPage,
    cartPage,
  }) => {
    await homePage.open();
    await header.openCategory('Books');
    await categoryPage.expectHeading('Books');

    await categoryPage.productTitles.first().click();
    await productPage.expectLoaded();
    const productName = await productPage.productName();
    await productPage.addToCart();

    await expect.poll(() => header.cartItemCount()).toBeGreaterThanOrEqual(1);

    await cartPage.open();
    await expect(cartPage.rows.first()).toBeVisible();
    await expect(cartPage.productNames.first()).toContainText(productName);
    await expect(cartPage.checkoutButton).toBeVisible();

    await cartPage.emptyCart();
    await expect(cartPage.emptyMessage).toBeVisible();
    await expect.poll(() => header.cartItemCount()).toBe(0);
  });
});
