import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 7000,
  },
  fullyParallel: false,
  reporter: 'list',
  webServer: [
    {
      command: 'npx vite preview --port 4173',
      cwd: './frontend/customer',
      port: 4173,
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'npx vite preview --port 4174',
      cwd: './frontend/admin',
      port: 4174,
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
  projects: [
    {
      name: 'Mobile Pixel 7 (390x844)',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'Desktop (1280x800)',
      use: {
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    },
  ],
});
