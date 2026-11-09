import { expect, test } from '../../src/fixtures/base.fixture';

test.describe('Product detail', () => {
  test('shows name, price, quantity and add-to-cart controls @smoke', async ({
    homePage,
    header,
    categoryPage,
    productPage,
  }) => {
    await homePage.open();
    await header.openCategory('Books');
    await categoryPage.expectHeading('Books');
    await categoryPage.productTitles.first().click();

    await productPage.expectLoaded();
    await expect(productPage.quantityInput).toBeVisible();
    await expect(productPage.breadcrumb).toBeVisible();
    await expect(productPage.price).toContainText(/\d/);
    expect((await productPage.productName()).length).toBeGreaterThan(0);
  });
});
