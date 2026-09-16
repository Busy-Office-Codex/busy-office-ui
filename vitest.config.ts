import { defineConfig } from 'vitest/config';

export default defineConfig({
  // `fileParallelism: false` — found live while landing the M7 batch (Icon/Theme/Breadcrumbs/
  // Chart→ECharts): 5 test files (components, shell-navigation, app-shell-navigation,
  // state-channels, sample-page-states) each independently rebuild `dist/` via
  // `execFileSync(..., 'build.mjs', ...)` in their own `beforeAll`. Vitest runs test FILES in
  // parallel worker threads by default, so those builds raced on the same shared `dist/` output —
  // a pre-existing latent bug that became a real, reproducible flake once this batch gave
  // build.mjs more to compile (Icon/Theme/Chart), widening the race window. Running files
  // sequentially costs a few seconds of wall-clock for a suite that already runs in ~1s; a
  // per-file isolated build output would avoid that cost but is a bigger change for a suite this
  // fast to bother with.
  test: { include: ['test/**/*.test.{ts,mjs}'], fileParallelism: false },
});
