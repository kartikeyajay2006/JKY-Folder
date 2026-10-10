import { defineConfig, devices } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const testOrigin = 'http://127.0.0.1:5180';
// Workers inherit this from the main process, so tests can read the server's email outbox.
const dataDir = (process.env.JKY_E2E_DATA ||= join(tmpdir(), `jky-browser-${process.pid}`));
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45000,
  use: {
    baseURL: testOrigin,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'npm run dev',
    url: testOrigin,
    reuseExistingServer: false,
    env: {
      PORT: '3102',
      WEB_PORT: '5180',
      APP_ORIGIN: testOrigin,
      DATA_DIR: dataDir,
      MAIL_TRANSPORT: 'outbox',
    },
    timeout: 60000,
  },
});
