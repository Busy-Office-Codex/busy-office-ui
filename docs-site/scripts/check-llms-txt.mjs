#!/usr/bin/env node
// Fails (non-zero exit) if the built `dist/llms.txt` (src/pages/llms.txt.ts) is missing, empty, or
// doesn't list every real docs/*.md component doc. Run after `astro build`, alongside
// check-links.mjs/check-live-demos.mjs — the same "build succeeded ≠ the generated output is
// actually right" gap those two scripts already close for their own concerns.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const docsSiteDir = path.resolve(scriptDir, '..');
const docsDir = path.resolve(docsSiteDir, '..', 'docs');
const llmsTxtPath = path.join(docsSiteDir, 'dist', 'llms.txt');

// Mirrors content.config.ts's `docs` collection exclusions (design-conventions.md/layouts.md have
// no component doc of their own) — not every docs/*.md file is a component this index should name.
const NON_COMPONENT_STEMS = new Set(['design-conventions', 'layouts']);

async function main() {
  const docFiles = (await readdir(docsDir)).filter((name) => name.endsWith('.md'));
  const expectedIds = docFiles
    .map((name) => path.basename(name, '.md').toLowerCase())
    .filter((id) => !NON_COMPONENT_STEMS.has(id));

  let content;
  try {
    content = await readFile(llmsTxtPath, 'utf8');
  } catch {
    console.error(`${llmsTxtPath} does not exist — did "astro build" run first?`);
    process.exitCode = 1;
    return;
  }

  if (content.trim().length === 0) {
    console.error(`${llmsTxtPath} is empty.`);
    process.exitCode = 1;
    return;
  }

  // Every doc's id should appear somewhere in the file — most as a `/components/<id>/` link
  // (llms.txt.ts's default), the 4 pattern docs as a `/patterns/<slug>/` link instead (see its
  // own patternSlug helper) — checking for the bare id covers both without duplicating that
  // slug logic here.
  const missing = expectedIds.filter((id) => !content.includes(id));

  if (missing.length > 0) {
    console.error(`llms.txt is missing ${missing.length} expected component id(s): ${missing.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Checked llms.txt — ${expectedIds.length} component doc(s) present.`);
}

await main();
