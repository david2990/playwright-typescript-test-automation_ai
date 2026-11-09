import { expect, test } from '../../src/fixtures/base.fixture';

test.describe('Home page', () => {
  test('loads the storefront with header, categories and footer @smoke', async ({
    homePage,
    header,
  }) => {
    await homePage.open();

    await expect(header.searchInput).toBeVisible();
    await expect(header.registerLink).toBeVisible();
    await expect(header.loginLink).toBeVisible();
    await expect(header.cartLink).toBeVisible();
    await expect(homePage.footer).toBeVisible();

    // The menu is uppercased via CSS text-transform, so compare case-insensitively.
    const categories = (await header.categoryNames()).map((name) => name.toLowerCase());
    expect(categories).toEqual(
      expect.arrayContaining([
        'books',
        'computers',
        'electronics',
        'apparel & shoes',
        'digital downloads',
        'jewelry',
        'gift cards',
      ]),
    );
  });

  test('renders without uncaught JavaScript errors @smoke', async ({ homePage, page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await homePage.open();

    expect(pageErrors, `Uncaught JavaScript errors:\n${pageErrors.join('\n')}`).toEqual([]);
  });
});
