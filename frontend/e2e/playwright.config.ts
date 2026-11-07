import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end suite. Requires the stack to be running (dev: backend + `npm start`;
 * demo: `docker compose up` with E2E_BASE_URL=http://localhost:4000).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  // All tests share one backend database, so they must not run at the same time.
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:4200',
    locale: 'es-CO',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
});
