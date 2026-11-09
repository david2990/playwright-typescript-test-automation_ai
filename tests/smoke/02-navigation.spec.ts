import { expect, test } from '../../src/fixtures/base.fixture';

const categories = [
  { name: 'Books', path: '/books' },
  { name: 'Computers', path: '/computers' },
  { name: 'Electronics', path: '/electronics' },
  { name: 'Apparel & Shoes', path: '/apparel-shoes' },
  { name: 'Digital downloads', path: '/digital-downloads' },
  { name: 'Jewelry', path: '/jewelry' },
  { name: 'Gift Cards', path: '/gift-cards' },
];

test.describe('Category navigation', () => {
  for (const category of categories) {
    test(`opens the "${category.name}" category @smoke`, async ({
      homePage,
      header,
      categoryPage,
      page,
    }) => {
      await homePage.open();
      await header.openCategory(category.name);

      await expect(page).toHaveURL(new RegExp(`${category.path}$`));
      await expect(categoryPage.heading).toHaveText(category.name, { ignoreCase: true });
      await categoryPage.expectListingVisible();
    });
  }
});
