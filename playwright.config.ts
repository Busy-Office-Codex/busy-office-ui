import { defineConfig } from '@playwright/test';

const baseURL = process.env.BUSYOFFICE_UI_PREVIEW_BASE_URL ?? 'http://127.0.0.1:4174';

export default defineConfig({
  testDir: './test/browser',
  use: { baseURL, headless: true },
  webServer: baseURL === 'http://127.0.0.1:4174'
    ? { command: 'pnpm build:preview && pnpm preview', url: baseURL, reuseExistingServer: process.env.BUSYOFFICE_REUSE_UI_PREVIEW === '1' }
    : undefined,
});
