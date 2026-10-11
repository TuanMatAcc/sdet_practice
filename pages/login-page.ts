// Location: pages/login-page.ts
import type { Page, Locator } from '@playwright/test';

// Page object: the only place that knows how the login screen is built.
// If the UI changes, you update this file and every test keeps working.
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // These match data-test="..." attributes (configured via testIdAttribute in playwright.config.ts)
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
  }

  async open() {
    await this.page.goto('/'); // relative to baseURL, so it works in every environment
  }

  async logIn(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
