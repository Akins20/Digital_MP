import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for DigitalDock
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run tests sequentially for database consistency
  forbidOnly: !!process.env.CI, // Fail CI if you accidentally left test.only
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run one test at a time to avoid database conflicts
  reporter: [
    ['html'],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
