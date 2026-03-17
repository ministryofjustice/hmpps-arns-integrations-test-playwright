import { defineConfig } from '@playwright/test';

// Load environment variables from .env only if running locally
if (!process.env.CI) {
  require('dotenv').config();
}

export default defineConfig({
  testDir: './tests/arns-assessment-platform/dev/aap/api',
  globalSetup: require.resolve('./utils/global-setup.ts'),
  use: {
    baseURL: process.env.BASE_URL || 'https://arns-assessment-platform-dev.hmpps.service.justice.gov.uk',
  },
});
