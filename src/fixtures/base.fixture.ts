import { test as base, expect } from '@playwright/test';
import { CartPage } from '../pages/cart.page';
import { CategoryPage } from '../pages/category.page';
import { HeaderComponent } from '../pages/header.component';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { ProductPage } from '../pages/product.page';
import { RegisterPage } from '../pages/register.page';
import { SearchPage } from '../pages/search.page';

type PageFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  categoryPage: CategoryPage;
  productPage: ProductPage;
  cartPage: CartPage;
  searchPage: SearchPage;
  registerPage: RegisterPage;
  header: HeaderComponent;
};

/**
 * Tests import `test` from here instead of @playwright/test so every spec gets
 * page objects injected with no boilerplate.
 */
export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
});

export { expect };
