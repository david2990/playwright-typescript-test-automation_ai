import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly rows: Locator;
  readonly productNames: Locator;
  readonly removeCheckboxes: Locator;
  readonly updateCartButton: Locator;
  readonly emptyMessage: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('.page-title h1');
    this.rows = page.locator('.cart-item-row');
    this.productNames = page.locator('.cart-item-row .product-name');
    this.removeCheckboxes = page.locator('input[name="removefromcart"]');
    this.updateCartButton = page.locator('input[name="updatecart"]');
    this.emptyMessage = page.getByText('Your Shopping Cart is empty!');
    this.checkoutButton = page.locator('#checkout');
  }

  async open(): Promise<void> {
    await this.page.goto('/cart');
    await expect(this.heading).toHaveText(/shopping cart/i);
  }

  async rowCount(): Promise<number> {
    return this.rows.count();
  }

  /** Empties the cart regardless of how many items a previous run left behind. */
  async emptyCart(): Promise<void> {
    await this.open();
    const count = await this.removeCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await this.removeCheckboxes.nth(i).check();
    }
    if (count > 0) {
      await this.updateCartButton.click();
    }
    await expect(this.emptyMessage).toBeVisible();
  }
}
