#!/usr/bin/env node
// Independent consumer proof (ROADMAP item 53, issue #22).
//
// Until this script existed, nothing packed this workspace and installed the
// tarball into a project outside the pnpm workspace. Every export path,
// dist/design-system.css, and the "sideEffects": false tree-shaking guarantee
// were only ever exercised through the pnpm workspace symlink (docs-site
// importing this package via the workspace protocol), which bypasses the real
// packaging boundary (package.json's "files": ["dist"] + "exports" map) that
// an actual external consumer depends on.
//
// This script:
//   1. Builds this package (`pnpm build`).
//   2. Packs it into a real tarball (`pnpm pack`).
//   3. Creates a fixture project in a fresh OS temp directory — not a member
//      of pnpm-workspace.yaml (which only lists '.' and 'docs-site') — and
//      installs the tarball into it with `npm install`, never `pnpm`, so the
//      workspace's symlinked node_modules can't leak in.
//   4. From that isolated fixture, bundles the root export ('.'), './shell',
//      './styles.css', and './examples/app-shell' with esbuild and asserts
//      each resolves and bundles successfully.
//   5. Measures the real size of a Button-only bundle built from the isolated
//      consumer's own esbuild output (not this repo's dist/) and asserts the
//      bundle does NOT contain ECharts/ZRender.
//
// Runnable non-interactively in CI. Cleans up its temp dir + tarball on
// success; leaves them in place (path printed) if it fails, for debugging.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function run(cmd, args, opts = {}) {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  return execFileSync(cmd, args, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'inherit'],
    encoding: 'utf8',
    ...opts,
  });
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(2)}KB`;
}

let fixtureDir;
let tarballPath;

async function main() {
  console.log('=== [1/6] Build package (pnpm build) ===');
  run('pnpm', ['build']);

  console.log('\n=== [2/6] Pack tarball (pnpm pack) ===');
  const packDestination = mkdtempSync(path.join(tmpdir(), 'boui-tarball-'));
  const packJson = run('pnpm', ['pack', '--pack-destination', packDestination, '--json']);
  const packResult = JSON.parse(packJson);
  const packedFile = Array.isArray(packResult) ? packResult[0] : packResult;
  tarballPath = path.isAbsolute(packedFile.filename)
    ? packedFile.filename
    : path.join(packDestination, packedFile.filename);
  statSync(tarballPath);
  console.log(`Packed tarball: ${tarballPath}`);

  console.log('\n=== [3/6] Create isolated fixture OUTSIDE the pnpm workspace ===');
  fixtureDir = mkdtempSync(path.join(tmpdir(), 'boui-consumer-fixture-'));
  console.log(`Fixture dir: ${fixtureDir}`);
  console.log(
    '(This directory is a fresh OS temp dir, not listed in pnpm-workspace.yaml — pnpm-workspace.yaml only declares "." and "docs-site" as members — so it is not a workspace member, and installs into it use npm, not pnpm, so nothing from the workspace node_modules can leak in.)'
  );

  const fixturePkg = {
    name: 'boui-consumer-fixture',
    private: true,
    version: '0.0.0',
    type: 'module',
    dependencies: {
      '@busyoffice/design-system': `file:${tarballPath}`,
      react: '^19.2.0',
      'react-dom': '^19.2.0',
    },
  };
  writeFileSync(path.join(fixtureDir, 'package.json'), JSON.stringify(fixturePkg, null, 2));

  console.log('\n=== [4/6] Install the tarball with npm (not pnpm, not the workspace) ===');
  run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], { cwd: fixtureDir });

  // Sanity: the fixture must have actually installed real echarts + stylex as
  // transitive dependencies of the packed tarball (both are "dependencies",
  // not peerDependencies, of @busyoffice/design-system) — this is the
  // baseline that makes the "no echarts in a Button-only bundle" check below
  // meaningful (if echarts were never installed at all, "not found" would be
  // a trivial, uninteresting pass).
  const installedEchartsPkg = path.join(fixtureDir, 'node_modules', 'echarts', 'package.json');
  statSync(installedEchartsPkg);
  console.log('Confirmed: echarts is installed in the isolated fixture as a real transitive dependency.');

  console.log("\n=== [5/6] Bundle every required export from the fixture's own install ===");
  const entriesDir = path.join(fixtureDir, 'entries');
  mkdirSync(entriesDir);

  writeFileSync(
    path.join(entriesDir, 'root.js'),
    `import { Button } from '@busyoffice/design-system';
if (typeof Button !== 'function') throw new Error('root export (.) did not resolve a Button component');
export { Button };
`
  );
  writeFileSync(
    path.join(entriesDir, 'shell.js'),
    `import { Shell } from '@busyoffice/design-system/shell';
if (typeof Shell !== 'function') throw new Error('./shell export did not resolve a Shell component');
export { Shell };
`
  );
  writeFileSync(
    path.join(entriesDir, 'appshell.jsx'),
    `import { AppShell } from '@busyoffice/design-system/examples/app-shell';
if (typeof AppShell !== 'function') throw new Error('./examples/app-shell export did not resolve an AppShell component');
export { AppShell };
`
  );
  writeFileSync(path.join(entriesDir, 'styles.css'), `@import "@busyoffice/design-system/styles.css";\n`);

  const outdir = path.join(fixtureDir, 'dist');
  const esbuildShared = {
    absWorkingDir: fixtureDir,
    bundle: true,
    format: 'esm',
    jsx: 'automatic',
    platform: 'browser',
    external: ['react', 'react/jsx-runtime', 'react-dom'],
  };

  await esbuild.build({
    ...esbuildShared,
    entryPoints: {
      root: 'entries/root.js',
      shell: 'entries/shell.js',
      appshell: 'entries/appshell.jsx',
      styles: 'entries/styles.css',
    },
    outdir,
  });

  for (const expected of ['root.js', 'shell.js', 'appshell.js', 'styles.css']) {
    statSync(path.join(outdir, expected));
  }
  console.log(
    'OK: root export (.), ./shell, ./styles.css, and ./examples/app-shell all resolved and bundled successfully from the isolated consumer.'
  );

  console.log('\n=== [6/6] Measure the real Button-only bundle size and assert no ECharts ===');
  const rawBundle = readFileSync(path.join(outdir, 'root.js'), 'utf8');
  const rawBytes = Buffer.byteLength(rawBundle, 'utf8');

  const minResult = await esbuild.build({
    ...esbuildShared,
    entryPoints: { 'root-min': 'entries/root.js' },
    outdir: path.join(fixtureDir, 'dist-min'),
    minify: true,
    write: false,
  });
  const minOutputFile = minResult.outputFiles.find((f) => f.path.endsWith('.js'));
  if (!minOutputFile) {
    throw new Error(
      `esbuild produced no minified .js output file for the Button-only entry (got: ${minResult.outputFiles.map((f) => f.path).join(', ')})`
    );
  }
  const minText = minOutputFile.text;
  const minBytes = Buffer.byteLength(minText, 'utf8');
  const gzipBytes = gzipSync(Buffer.from(minText, 'utf8')).length;

  const echartsPattern = /echarts|zrender/i;
  const rawHasEcharts = echartsPattern.test(rawBundle);
  const minHasEcharts = echartsPattern.test(minText);

  console.log('');
  console.log('--- Button-only bundle: current, real, automation-checked numbers ---');
  console.log(`  raw (unminified) bundle:  ${rawBytes} bytes (${kb(rawBytes)})`);
  console.log(`  minified bundle:          ${minBytes} bytes (${kb(minBytes)})`);
  console.log(`  minified + gzip:          ${gzipBytes} bytes (${kb(gzipBytes)})`);
  console.log(`  contains "echarts"/"zrender" (raw):       ${rawHasEcharts}`);
  console.log(`  contains "echarts"/"zrender" (minified):  ${minHasEcharts}`);
  console.log('');

  if (rawHasEcharts || minHasEcharts) {
    throw new Error(
      `FAIL: a Button-only import from @busyoffice/design-system pulled ECharts/ZRender into the bundle ` +
        `(raw: ${rawHasEcharts}, minified: ${minHasEcharts}). The "sideEffects": false tree-shaking guarantee is broken.`
    );
  }

  console.log(
    `PASS: Button-only import ships ${kb(minBytes)} minified / ${kb(gzipBytes)} gzipped with zero echarts/zrender code, verified against a real isolated npm install of the packed tarball.`
  );
}

main()
  .then(() => {
    console.log('\n=== Cleaning up temp fixture + tarball ===');
    if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
    if (tarballPath) rmSync(path.dirname(tarballPath), { recursive: true, force: true });
    console.log('verify:consumer PASSED.');
  })
  .catch((err) => {
    console.error('\nverify:consumer FAILED.');
    console.error(err?.stack ?? err);
    if (fixtureDir) console.error(`Fixture left in place for debugging: ${fixtureDir}`);
    if (tarballPath) console.error(`Tarball left in place for debugging: ${tarballPath}`);
    process.exitCode = 1;
  });
