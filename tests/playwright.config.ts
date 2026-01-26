import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    trace: 'on-first-retry',

    // 🎯 Add automatic screenshot capture on failure
    screenshot: 'only-on-failure',

    // Optional: Also capture video on failure
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

export const TEST_CONFIG = {
  TIMEOUTS: {
    DEFAULT: 5000,
    PAGE_LOAD: 10000,
    API_CALL: 10000,
  },
  URLS: {
    BASE: process.env.BASE_URL || 'http://localhost:9002',
  },
} as const;
