import { defineConfig } from '@playwright/test';
import process from 'node:process';
import baseConfig from './playwright.config.js';

process.env.DESIGN_SYSTEM_MODE = 'design';
const snapshotPlatform = process.env.PLAYWRIGHT_SNAPSHOT_PLATFORM === 'linux' ? '/linux' : '';

export default defineConfig({
  ...baseConfig,
  projects: baseConfig.projects.filter(project =>
    ['design-theme', 'visual-diagnostic'].includes(project.name)),
  snapshotPathTemplate: `{testDir}/__screenshots__/design${snapshotPlatform}/{arg}{ext}`,
});
