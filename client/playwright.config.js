import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';

const apiURL = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:7071';
const clientURL = process.env.PLAYWRIGHT_CLIENT_URL || 'http://127.0.0.1:3000';

export default defineConfig({
  forbidOnly: true,
  fullyParallel: false,
  outputDir: 'test-results',
  reporter: 'list',
  retries: process.env.CI ? 1 : 0,
  snapshotPathTemplate: '{testDir}/__screenshots__/current/{arg}{ext}',
  timeout: 30_000,
  workers: 1,
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: apiURL,
      },
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: clientURL,
      },
    },
    {
      name: 'visual',
      testDir: './tests/visual',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: clientURL,
      },
    },
  ],
});
