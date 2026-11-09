import { expect, type Locator, type Page } from '@playwright/test';

/** Shared site header: search, account links, cart counter and the top category menu. */
export class HeaderComponent {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly cartLink: Locator;
  readonly cartQuantity: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly accountLink: Locator;
  readonly logoutLink: Locator;
  readonly menuLinks: Locator;
  readonly subMenuLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('#small-searchterms');
    this.searchButton = page.locator('.search-box-button');
    this.cartLink = page.locator('.header-links a.ico-cart').first();
    this.cartQuantity = this.cartLink.locator('.cart-qty');
    this.loginLink = page.locator('.header-links a.ico-login');
    this.registerLink = page.locator('.header-links a.ico-register');
    // This theme renders the signed-in email with class "account" (not nopCommerce's "ico-account").
    this.accountLink = page.locator('.header-links a.account');
    this.logoutLink = page.locator('.header-links a.ico-logout');
    this.menuLinks = page.locator('.header-menu .top-menu > li > a');
    this.subMenuLinks = page.locator('.header-menu .sublist a');
  }

  async searchFor(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async openCategory(name: string): Promise<void> {
    await this.menuLinks.filter({ hasText: name }).first().click();
  }

  /** Sub-categories (Computers > Desktops) only appear once the parent is hovered. */
  async openSubCategory(parent: string, child: string): Promise<void> {
    await this.menuLinks.filter({ hasText: parent }).first().hover();
    await this.subMenuLinks.filter({ hasText: child }).first().click();
  }

  async categoryNames(): Promise<string[]> {
    return (await this.menuLinks.allInnerTexts()).map((name) => name.trim());
  }

  /** The cart counter renders as "(2)"; return it as a number. */
  async cartItemCount(): Promise<number> {
    const text = (await this.cartQuantity.innerText()).trim();
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
    await expect(this.loginLink).toBeVisible();
  }
}
