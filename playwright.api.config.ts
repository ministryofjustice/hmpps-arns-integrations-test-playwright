// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { getToken } from './utils/aapClient';

export default defineConfig({
  testDir: './tests/tests-api',
  globalSetup: require.resolve('./utils/global-setup.ts'),
  use: {
    baseURL: 'https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk',
    extraHTTPHeaders: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  },
});
