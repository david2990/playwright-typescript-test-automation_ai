import { expect, type Locator, type Page } from '@playwright/test';

export class SearchPage {
  readonly page: Page;
  readonly results: Locator;
  readonly resultTitles: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.results = page.locator('.product-grid .product-item');
    this.resultTitles = page.locator('.product-grid .product-title a');
    this.noResultsMessage = page.getByText(/no products were found that matched your criteria/i);
  }

  async expectResults(): Promise<void> {
    await expect(this.results.first()).toBeVisible();
  }

  async expectNoResults(): Promise<void> {
    await expect(this.noResultsMessage).toBeVisible();
  }
}
