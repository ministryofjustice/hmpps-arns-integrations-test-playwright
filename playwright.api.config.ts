// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { BASE_URL, getToken } from './utils/aapClient';

export default defineConfig({
  testDir: './tests/tests-api',
  globalSetup: require.resolve('./utils/global-setup.ts'),
  use: {
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  },
});
