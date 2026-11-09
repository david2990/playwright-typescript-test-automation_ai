import { expect, type Locator, type Page } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly name: Locator;
  readonly price: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly breadcrumb: Locator;
  readonly successNotification: Locator;

  constructor(page: Page) {
    this.page = page;
    this.name = page.locator('.product-name h1');
    // The price container is stable across products; its inner span differs (price-value-N / actual-price).
    this.price = page.locator('.product-essential .product-price').first();
    this.quantityInput = page.locator('.qty-input').first();
    this.addToCartButton = page.locator('input.add-to-cart-button').first();
    this.breadcrumb = page.locator('.breadcrumb');
    this.successNotification = page.locator('.bar-notification.success');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.name).toBeVisible();
    await expect(this.price).toBeVisible();
    await expect(this.addToCartButton).toBeVisible();
  }

  async productName(): Promise<string> {
    return (await this.name.innerText()).trim();
  }

  /**
   * Checks the first value of every radio attribute group that has nothing preselected yet
   * (e.g. "Processor" on the configurable desktops). Groups that already have a default
   * (RAM, HDD) are left as the shop rendered them, and checkboxes/optional extras are untouched.
   */
  async selectDefaultOptions(): Promise<void> {
    const scoped = this.page.locator('.product-essential input[type="radio"]');
    const radios =
      (await scoped.count()) > 0 ? scoped : this.page.locator('input[name^="product_attribute_"]');

    const counts = await radios.count();
    const firstOfGroup = new Map<string, Locator>();
    const checkedGroups = new Set<string>();

    for (let i = 0; i < counts; i++) {
      const radio = radios.nth(i);
      const group = await radio.getAttribute('name');
      if (!group) continue;

      if (!firstOfGroup.has(group)) firstOfGroup.set(group, radio);
      if (await radio.isChecked()) checkedGroups.add(group);
    }

    for (const [group, radio] of firstOfGroup) {
      if (!checkedGroups.has(group)) await radio.check();
    }
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    await expect(this.successNotification).toBeVisible();
    await expect(this.successNotification).toContainText(/added to your shopping cart/i);
  }
}
