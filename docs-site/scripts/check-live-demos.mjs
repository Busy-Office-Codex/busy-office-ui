#!/usr/bin/env node
// Walks the built `dist/` HTML output and fails (non-zero exit) if any page's `LiveDemo` silently
// rendered an error instead of the real specimen. `LiveDemo.tsx` catches a compile/render error at
// RUNTIME and renders it as a visible `<pre role="alert">` instead of throwing — so `astro build`
// itself succeeds even when a fenced example is genuinely broken (M10 ButtonGroup scoring, issue
// #24: `docs/ButtonGroup.md`'s own fenced example referenced undefined `density`/`setDensity`
// variables, silently broken until this check was written to catch it, not found by build:docs or
// check-links.mjs — a build-succeeded/link-resolves state that still shipped a broken demo). Run
// after `astro build`, alongside check-links.mjs.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(scriptDir, '..', 'dist');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

async function main() {
  const htmlFiles = await walk(distDir);
  if (htmlFiles.length === 0) {
    console.error(`No HTML files found under ${distDir} — did "astro build" run first?`);
    process.exitCode = 1;
    return;
  }

  const broken = [];
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const match = html.match(/<pre role="alert">([^<]*)<\/pre>/);
    if (match) broken.push({ file: path.relative(distDir, file), message: match[1] });
  }

  if (broken.length > 0) {
    console.error(`Found ${broken.length} page(s) with a silently-broken live demo:`);
    for (const { file, message } of broken) console.error(`  ${file}: ${message}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Checked live demos across ${htmlFiles.length} page(s) — none rendered an error.`);
}

await main();
