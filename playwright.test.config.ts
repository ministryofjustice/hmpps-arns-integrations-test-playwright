import { defineConfig, devices } from '@playwright/test';

// Load environment variables from .env only if running locally
if (!process.env.CI) {
  require('dotenv').config();
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  globalSetup: require.resolve('./utils/global-setup.ts'),
  testDir: './tests/arns-assessment-platform',
  /* Maximum time one test can run for. */
  timeout: 300 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: process.env.CI ? 30000 : 10000,
  },
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['playwright-ctrf-json-reporter', { outputDir: 'ctrf' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    permissions: ['clipboard-read', 'clipboard-write'],
    // API https://arns-assessment-platform-api-test.hmpps.service.justice.gov.uk
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://arns-assessment-platform-test.hmpps.service.justice.gov.uk',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'edge',
      use: { ...devices['Desktop Edge'] },
    },
    {
      name: 'chromium_aap',
      use: { ...devices['Desktop Chrome'] },
      testDir: '../tests/arns-assessment-platform/dev/aap',
    },
    {
      name: 'edge_aap',
      use: { ...devices['Desktop Edge'] },
      testDir: '../tests/arns-assessment-platform/dev/aap',
    },
  ],
});
