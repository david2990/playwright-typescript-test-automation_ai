import { expect, type Locator, type Page } from '@playwright/test';

export class CategoryPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly productItems: Locator;
  readonly productTitles: Locator;
  /** Parent categories (e.g. Computers) list sub-categories instead of products. */
  readonly subCategories: Locator;
  readonly addToCartButtons: Locator;
  readonly successNotification: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('.page-title h1');
    this.productItems = page.locator('.product-grid .product-item');
    this.productTitles = page.locator('.product-grid .product-title a');
    this.subCategories = page.locator('.sub-category-item');
    this.addToCartButtons = page.locator('.product-box-add-to-cart-button');
    this.successNotification = page.locator('.bar-notification.success');
  }

  /**
   * Clicks the listing's Add to cart button for the named product.
   * Products that carry required options (most desktops) open their detail page instead
   * of adding, so the caller may need to finish the add on the product page.
   */
  async addNamedProductToCart(name: string): Promise<void> {
    const item = this.productItems.filter({ hasText: name }).first();
    await item.locator('.product-box-add-to-cart-button').click();
  }

  async expectListingVisible(): Promise<void> {
    await expect(this.productItems.or(this.subCategories).first()).toBeVisible();
  }

  async expectHeading(name: string): Promise<void> {
    await expect(this.heading).toHaveText(name, { ignoreCase: true });
  }

  async openProduct(productName: string): Promise<void> {
    await this.productTitles.filter({ hasText: productName }).first().click();
  }
}
