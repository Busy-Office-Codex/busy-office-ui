import { defineConfig } from '@playwright/test';

// M10 (issue #24): docs-site's first interactive browser-test target — until now, docs-site was
// only checked by `pnpm build` (does it compile) and `check-links.mjs` (do internal links
// resolve), neither of which can prove a specimen page's own interactive behavior (the new
// theme/density toggle controls, `LiveDemo.tsx`) actually works. Mirrors the root package's own
// `playwright.config.ts` shape (`BUSYOFFICE_UI_PREVIEW_BASE_URL`/`BUSYOFFICE_REUSE_UI_PREVIEW`)
// for consistency, scoped to docs-site's own default preview port (4321) instead of the root
// package's 4174 — the two suites never share a server, so they can run in the same job without
// a port conflict.
//
// webServer runs `scripts/preview-server.mjs`, not `astro preview`: reproduced directly (not
// assumed) that `astro preview` daemonizes even without `--background` in this environment —
// each invocation reports "Preview server already running" against a fresh PID and the port never
// actually accepts a connection, so Playwright's own process-management can't tell it apart from
// a real foreground server. The plain node:http script sidesteps that CLI entirely.
const baseURL = process.env.BUSYOFFICE_DOCS_PREVIEW_BASE_URL ?? 'http://127.0.0.1:4321';

export default defineConfig({
  testDir: './test/browser',
  use: { baseURL, headless: true },
  webServer: baseURL === 'http://127.0.0.1:4321'
    ? {
        command: 'pnpm build && node scripts/preview-server.mjs',
        url: baseURL,
        reuseExistingServer: process.env.BUSYOFFICE_REUSE_DOCS_PREVIEW === '1',
      }
    : undefined,
});
