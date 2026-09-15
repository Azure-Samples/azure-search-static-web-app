import { defineConfig } from '@playwright/test';
import process from 'node:process';
import baseConfig from './playwright.config.js';

process.env.DESIGN_SYSTEM_MODE = 'design';

export default defineConfig({
  ...baseConfig,
  snapshotPathTemplate: '{testDir}/__screenshots__/design/{arg}{ext}',
});
