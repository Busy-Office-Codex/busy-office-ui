#!/usr/bin/env node
// Pre-compiles `examples/Launcher.tsx` and `examples/Dashboard.tsx` into browser-ready ESM +
// compiled StyleX CSS, written only into this project's own `src/generated/` — never into the
// root package's `dist/`, and no entry is added to its `package.json` `exports` map.
//
// Why this exists: `Launcher`/`Dashboard` (unlike `AppShell`/`ListReport`/`RecordDetail`) have no
// `@busyoffice/design-system/examples/*` subpath — adding one is a one-way change to a boundary
// file this batch is not authorized to make (AGENTS.md/LOOP.md). But the ROADMAP item 15 Accept
// still asks the Patterns section to render all four sample screens live. Importing their .tsx
// source straight into an Astro/Vite page fails at runtime — the source calls
// `stylex.defineVars`/`createTheme` directly, and those only work compiled by StyleX's
// babel/esbuild plugin (the same plugin the root package's own `build.mjs` already runs for
// `AppShell`/`ListReport`/`RecordDetail`); left uncompiled they throw
// "Unexpected 'stylex.defineVars' call at runtime". This script runs that same compile step,
// scoped to just these two files, so their live demos render with real, correctly atomized
// styling — without touching anything under the root package's own build boundary.
import { build } from 'esbuild';
import stylexPlugin from '@stylexjs/esbuild-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const docsSiteDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(docsSiteDir, '..');
const outdir = path.join(docsSiteDir, 'src/generated');

await build({
  entryPoints: {
    launcher: path.join(repoRoot, 'examples/Launcher.tsx'),
    dashboard: path.join(repoRoot, 'examples/Dashboard.tsx'),
  },
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  platform: 'browser',
  external: ['react', 'react/jsx-runtime', 'react-dom'],
  outdir,
  plugins: [
    stylexPlugin({
      generatedCSSFileName: path.join(outdir, 'examples.css'),
      unstable_moduleResolution: { type: 'commonJS', rootDir: repoRoot },
    }),
  ],
});

console.log(`Compiled Launcher/Dashboard examples into ${path.relative(docsSiteDir, outdir)}/`);
