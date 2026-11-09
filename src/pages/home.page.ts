import { expect, type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from './header.component';

export class HomePage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly featuredProducts: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.featuredProducts = page.locator('.product-grid .product-item');
    this.footer = page.locator('.footer');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Demo Web Shop/);
    await expect(this.header.searchInput).toBeVisible();
    await expect(this.header.menuLinks.first()).toBeVisible();
  }
}
