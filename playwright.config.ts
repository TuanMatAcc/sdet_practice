// Location: playwright.config.ts (repository root)
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI; // GitHub Actions (and most CI tools) set CI=true automatically

// Practice version: everything points at the public Swag Labs demo site.
// In a real project, the pipeline sets BASE_URL per environment (staging, production),
// and a `webServer` block here would start your own app for local runs and pull requests.
// `||` rather than `??` so an empty value from an unset GitHub variable also falls back.
const baseURL = process.env.BASE_URL || 'https://www.saucedemo.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,

  // Fail the build if someone accidentally commits test.only
  forbidOnly: isCI,

  // One retry on CI absorbs rare infrastructure hiccups. A test that only passes
  // on retry is marked "flaky" in the report, so flakiness stays visible, not hidden.
  retries: isCI ? 1 : 0,

  // Playwright recommends one worker per CI machine for stability.
  // Speed comes from sharding the suite across machines instead (see the workflow).
  workers: isCI ? 1 : undefined,

  reporter: isCI
    ? [
        ['html', { open: 'never' }],                     // full report, uploaded as a build artifact
        ['junit', { outputFile: 'results/junit.xml' }],  // machine-readable results for CI tools or Xray
        ['github'],                                      // failure annotations shown directly on the PR
      ]
    : [['html', { open: 'on-failure' }]],

  use: {
    baseURL,
    // The demo app's developers added data-test="..." attributes for automation, so
    // getByTestId('username') finds data-test="username". Agreeing on attributes like this
    // with developers is common SDET practice: they survive redesigns and wording changes.
    testIdAttribute: 'data-test',

    // Evidence for diagnosing failures without having to rerun them
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
