/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Taskly **demo**.
 *
 * The demo is auth-free and fully client-side: every visitor gets a single seeded
 * workspace persisted in localStorage (see `core/services/demo`). There is no login,
 * no real API and no SignalR, so — unlike the full product — there is no auth `setup`
 * project and no stored `storageState`. Tests just navigate and assert against the
 * self-seeded demo data.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['html', { outputFolder: 'e2e/playwright-report' }]],
  outputDir: 'e2e/test-results',

  use: {
    baseURL: 'http://localhost:2026',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:2026',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
