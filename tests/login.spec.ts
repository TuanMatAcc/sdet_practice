// Location: tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

// Tags decide which pipeline stage runs a test:
//   @smoke   -> every pull request and the production smoke check (fast, critical paths)
//   @slow    -> nightly only
//   no tag   -> post-merge regression and nightly

const username = process.env.TEST_USERNAME || 'standard_user';

// The password comes from the TEST_PASSWORD secret in CI, or from your terminal locally.
// It is never written in the code. Failing loudly beats a confusing login error later.
function requirePassword(): string {
  const password = process.env.TEST_PASSWORD;
  if (!password) {
    throw new Error(
      'TEST_PASSWORD is not set. Add it as a repository secret in GitHub, ' +
        'or set it in your terminal for local runs (see README).',
    );
  }
  return password;
}

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
  });

  test('standard user can log in', { tag: '@smoke' }, async ({ page }) => {
    await loginPage.logIn(username, requirePassword());

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByTestId('title')).toHaveText('Products');
  });

  test('wrong password shows an error', async ({ page }) => {
    await loginPage.logIn(username, 'definitely-not-the-password');

    await expect(loginPage.errorMessage).toContainText('Username and password do not match');
    await expect(page).not.toHaveURL(/inventory/);
  });

  test('locked-out user cannot log in', async () => {
    await loginPage.logIn('locked_out_user', requirePassword());

    await expect(loginPage.errorMessage).toContainText('this user has been locked out');
  });

  test('empty username shows a validation error', async () => {
    await loginPage.logIn('', 'any-password');

    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('performance glitch user can still log in', { tag: '@slow' }, async ({ page }) => {
    // This demo user has a built-in ~5 second delay after login.
    // test.slow() triples the timeout; the @slow tag keeps it out of fast pipeline stages.
    test.slow();
    await loginPage.logIn('performance_glitch_user', requirePassword());

    await expect(page.getByTestId('inventory-list')).toBeVisible({ timeout: 15_000 });
  });
});
