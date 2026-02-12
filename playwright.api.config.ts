import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/tests-api',
  globalSetup: require.resolve('./utils/global-setup.ts'),
});
