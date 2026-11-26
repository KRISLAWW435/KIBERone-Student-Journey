import fs from 'fs';
import { chromium, defineConfig } from '@playwright/test';

function resolveHeadlessExecutable(): string | undefined {
  const defaultPath = chromium.executablePath();
  if (defaultPath && fs.existsSync(defaultPath)) {
    return undefined;
  }
  const systemFallback =
    '/ms-playwright/chrome-headless-shell-linux64/chrome-headless-shell';
  if (fs.existsSync(systemFallback)) {
    return systemFallback;
  }
  return undefined;
}

const fallbackExecutablePath = resolveHeadlessExecutable();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    viewport: { width: 1440, height: 900 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      ...(fallbackExecutablePath
        ? { executablePath: fallbackExecutablePath }
        : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
