import { AppShell } from '../examples/AppShell.js';

/**
 * A dedicated preview route (`/#app-shell-fallback-lab`, see client.tsx) for
 * `test/browser/app-shell-fallback.spec.ts`. `AppShell`'s own doc comment says omitting the
 * `navigation` prop gives "a self-contained sample built from the module map above" — but that
 * fallback (`sampleRoutes()`, maps ALL of `AppShell.tsx`'s `NAV` table unconditionally) has no
 * real consumer anywhere: `preview/client.tsx` always supplies its own explicit `navigation`, so
 * this exact path was never actually exercised until docs-site's new `docs/AppShell.md` live
 * demo hit it live and found it broken (52 real routes today vs. the then-current
 * `SHELL_MAX_ROUTES` of 40 — fixed by raising the cap to 64, ROADMAP item 45). Same reasoning and
 * non-shipped status as `DensityLab.tsx`/`ButtonGroupLab.tsx`/`ShellBreadcrumbsLab.tsx`: not part
 * of the package's public example set (`examples/`) and not wired into `package.json`'s
 * `exports`. Exists purely so this exact fallback stays exercised in a real browser going
 * forward — the next `NAV` entry that pushes the real count past `SHELL_MAX_ROUTES` again should
 * fail a running test here, not silently break the one live page that happens to use it.
 */
export function AppShellFallbackLab() {
  return <AppShell />;
}
