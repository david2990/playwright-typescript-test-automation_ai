import { expect, test } from '../../src/fixtures/base.fixture';

test.describe('Catalog search', () => {
  test('returns matching products for a known term @smoke', async ({
    homePage,
    header,
    searchPage,
    page,
  }) => {
    await homePage.open();
    await header.searchFor('book');

    await expect(page).toHaveURL(/\/search\?q=book/);
    await searchPage.expectResults();

    const titles = await searchPage.resultTitles.allInnerTexts();
    expect(titles.length).toBeGreaterThan(0);
  });

  test('shows an empty-state message when nothing matches @smoke', async ({
    homePage,
    header,
    searchPage,
  }) => {
    await homePage.open();
    await header.searchFor('zzzz-no-such-product-98765');

    await searchPage.expectNoResults();
  });
});
