import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const isCI = !!process.env.CI;
const baseURL = process.env.BASE_URL?.trim() || 'https://demowebshop.tricentis.com';

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? Number(process.env.WORKERS ?? 4) : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'results/junit.xml' }],
  ],
  use: {
    baseURL,
    locale: 'en-US',
    timezoneId: 'UTC',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // SLOWMO=800 slows every action down so a run can be watched; VIDEO=on records any run, not just failures.
    launchOptions: { slowMo: Number(process.env.SLOWMO ?? 0) },
    video: process.env.VIDEO === 'on' ? 'on' : 'retain-on-failure',
  },
  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: [/authenticated\//, /auth\.setup\.ts/],
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['auth-setup'],
    },
    {
      name: 'chromium-authenticated',
      testMatch: /authenticated\//,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/standard-user.json',
      },
      dependencies: ['auth-setup'],
    },
  ],
});
