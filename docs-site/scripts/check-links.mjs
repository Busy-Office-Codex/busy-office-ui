#!/usr/bin/env node
// Walks the built `dist/` HTML output, extracts every internal <a href>, and fails (non-zero
// exit) if any target path doesn't exist in the build. Run after `astro build`. Out of scope for
// v1 per ROADMAP item 15's Accept: this is a link check, not a search index or a general
// broken-link/spellcheck tool, and it never touches the root package's own `pnpm test`.
import { readdir, readFile, stat } from 'node:fs/promises';
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

function extractHrefs(html) {
  const hrefs = [];
  const pattern = /<a\b[^>]*\shref="([^"]+)"/gi;
  let match;
  while ((match = pattern.exec(html))) hrefs.push(match[1]);
  return hrefs;
}

function isInternal(href) {
  if (href.startsWith('http://') || href.startsWith('https://')) return false;
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  return href.startsWith('/');
}

/** Does `target` (a same-origin absolute path, e.g. "/components/Button/") exist in `dist/`? */
async function targetExists(target) {
  const [pathname] = target.split('#');
  const clean = pathname.split('?')[0];
  const relative = clean.replace(/^\/+/, '');
  const candidates = relative === ''
    ? ['index.html']
    : [relative, path.join(relative, 'index.html'), `${relative}.html`];
  for (const candidate of candidates) {
    try {
      const info = await stat(path.join(distDir, candidate));
      if (info.isFile()) return true;
    } catch {
      // try next candidate
    }
  }
  return false;
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
    const hrefs = extractHrefs(html).filter(isInternal);
    for (const href of hrefs) {
      if (!(await targetExists(href))) {
        broken.push({ file: path.relative(distDir, file), href });
      }
    }
  }

  if (broken.length > 0) {
    console.error(`Found ${broken.length} broken internal link(s):`);
    for (const { file, href } of broken) console.error(`  ${file} -> ${href}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Checked internal links across ${htmlFiles.length} page(s) — all resolved.`);
}

await main();
