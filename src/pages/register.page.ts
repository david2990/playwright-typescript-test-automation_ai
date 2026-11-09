import { expect, type Locator, type Page } from '@playwright/test';

export type RegistrationDetails = {
  gender?: 'male' | 'female';
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export class RegisterPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly maleRadio: Locator;
  readonly femaleRadio: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('.page-title h1');
    this.maleRadio = page.locator('#gender-male');
    this.femaleRadio = page.locator('#gender-female');
    this.firstNameInput = page.locator('#FirstName');
    this.lastNameInput = page.locator('#LastName');
    this.emailInput = page.locator('#Email');
    this.passwordInput = page.locator('#Password');
    this.confirmPasswordInput = page.locator('#ConfirmPassword');
    this.registerButton = page.locator('#register-button');
    this.successMessage = page.locator('.result');
  }

  async open(): Promise<void> {
    await this.page.goto('/register');
    await expect(this.heading).toHaveText(/register/i);
  }

  /** Fills the registration form and submits it. Registration signs the customer in. */
  async register(details: RegistrationDetails): Promise<void> {
    if (details.gender === 'female') {
      await this.femaleRadio.check();
    } else if (details.gender === 'male') {
      await this.maleRadio.check();
    }

    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.emailInput.fill(details.email);
    await this.passwordInput.fill(details.password);
    await this.confirmPasswordInput.fill(details.password);
    await this.registerButton.click();
  }

  async expectRegistered(): Promise<void> {
    await expect(this.successMessage).toContainText(/registration completed/i);
  }
}
