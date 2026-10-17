import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:43191', browserName: 'chromium' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
  ],
  webServer: [
    {
      command: 'node --import tsx apps/api/src/server.ts',
      url: 'http://127.0.0.1:43190/api/health',
      env: { NODE_ENV: 'development', PORT: '43190' },
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -w @reservation-watch/web -- --port 43191',
      url: 'http://127.0.0.1:43191',
      env: { NODE_ENV: 'development', PORT: '43190' },
      reuseExistingServer: false,
    },
  ],
});
