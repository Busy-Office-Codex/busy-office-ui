import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Reads the actual literal token values out of `src/tokens.stylex.ts` (ROADMAP item 15's
 * tokens page: "read real values, don't hand-copy a stale table"). This is deliberately not a
 * runtime `import` — `stylex.defineVars()` compiles each value away into an opaque hashed CSS
 * custom property (see docs/design-conventions.md, "never write CSS ... against these names"),
 * so the only place the literal `#f8fafc`-style values still exist is the source text itself.
 * A tiny regex extraction, not a TS/AST parser.
 *
 * `space`/`font` are flat `key: 'value'` `stylex.defineVars()` blocks — `extractPairs` reads
 * those directly. `color` is not (ROADMAP item 19): each entry is `key: { default:
 * lightPalette.key, '@media (prefers-color-scheme: dark)': darkPalette.key }` — identifier
 * references, not string literals — so its real values live one level up, in the flat
 * `lightPalette`/`darkPalette` object literals `color` is built from. `readColorTokens()`
 * extracts those two directly instead of trying to parse `color` itself.
 */

export type TokenEntry = { name: string; value: string };
type ColorTokenEntry = { name: string; light: string; dark: string };

function readTokensSource(): string {
  // Resolved from the docs-site project root (Astro/Vite bundles this module into a chunk at
  // build time, so a path relative to `import.meta.url` would point at the wrong place once
  // relocated) rather than from this file's own location.
  const tokensPath = path.resolve(process.cwd(), '..', 'src', 'tokens.stylex.ts');
  return readFileSync(tokensPath, 'utf8');
}

/**
 * The package's closed icon set (ROADMAP issue #18: "a closed IconName union"), read from
 * `src/components/Icon.tsx`'s own `export type IconName = 'a' | 'b';` line — the same
 * read-the-real-source-text technique as `readTokensSource()` above, for the same reason: the
 * union only exists as source text, nothing to import and introspect at runtime. Was a hand-
 * copied array in docs-site/src/pages/base-styles.astro before an independent review caught it
 * as an undisclosed drift risk (2026-09-17) — every other value on this page reads live from
 * source; this one should too.
 */
export function readIconNames(): string[] {
  const iconPath = path.resolve(process.cwd(), '..', 'src', 'components', 'Icon.tsx');
  const source = readFileSync(iconPath, 'utf8');
  const match = source.match(/export type IconName = ([^;]+);/);
  if (!match) throw new Error('Could not find "export type IconName = ...;" in Icon.tsx — has it moved or been renamed?');
  const names = Array.from(match[1].matchAll(/'([^']+)'/g), (m) => m[1]);
  if (names.length === 0) throw new Error('Found "IconName" but extracted zero glyph names from it — has its shape changed?');
  return names;
}

function extractBlock(source: string, declaration: string): string {
  const start = source.indexOf(declaration);
  if (start === -1) throw new Error(`Could not find "${declaration}" in tokens.stylex.ts`);
  const braceStart = source.indexOf('{', start);
  let depth = 0;
  for (let i = braceStart; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(braceStart + 1, i);
    }
  }
  throw new Error(`Unbalanced braces in "${declaration}" block`);
}

function extractPairs(block: string): TokenEntry[] {
  const entries: TokenEntry[] = [];
  const pattern = /(\w+):\s*'([^']*)'/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(block))) {
    entries.push({ name: match[1], value: match[2] });
  }
  return entries;
}

export function readTokens(exportName: 'space' | 'font' | 'radius' | 'shadow' | 'glass'): TokenEntry[] {
  const source = readTokensSource();
  return extractPairs(extractBlock(source, `export const ${exportName} = stylex.defineVars({`));
}

/**
 * `motion`'s duration entries aren't flat strings either (ROADMAP: durations "collapse to 0
 * under prefers-reduced-motion") — each is `key: { default: 'Xms', '@media
 * (prefers-reduced-motion: reduce)': '0ms' }`, the same per-value-media-query shape `color` uses
 * for dark mode. Its two easing curves (`easeStandard`/`easeEmphasized`) ARE flat strings in the
 * same block; `readTokens('motion')` would work for those alone, but a bare `extractPairs` over
 * the whole block also picks up each duration's own `default:` key as a spurious flat entry
 * (since "default" itself matches the same `key: 'value'` shape) — filtered out here, not a
 * fragile assumption: no real motion token is ever named "default".
 *
 * Assumes `default` is each entry's FIRST key (true for every current duration, matching
 * `color`'s own established ordering convention) — a reordered `{ '@media...': '0ms', default:
 * 'Xms' }` would silently extract nothing for that entry. Not hardened against this because
 * changing the convention everywhere else in this file would be the real fix, not a more
 * elaborate regex here.
 */
export function readMotionDurations(): TokenEntry[] {
  const source = readTokensSource();
  const block = extractBlock(source, 'export const motion = stylex.defineVars({');
  const entries: TokenEntry[] = [];
  const pattern = /(\w+):\s*\{\s*default:\s*'([^']*)'/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(block))) {
    entries.push({ name: match[1], value: match[2] });
  }
  return entries;
}

export function readMotionEasing(): TokenEntry[] {
  const source = readTokensSource();
  const block = extractBlock(source, 'export const motion = stylex.defineVars({');
  return extractPairs(block).filter((entry) => entry.name !== 'default');
}

/** Resolved light + dark hex for every `color.*` token, read straight from `lightPalette`/`darkPalette`. */
export function readColorTokens(): ColorTokenEntry[] {
  const source = readTokensSource();
  const light = extractPairs(extractBlock(source, 'export const lightPalette = {'));
  const dark = extractPairs(extractBlock(source, 'export const darkPalette = {'));
  const darkByName = new Map(dark.map((entry) => [entry.name, entry.value]));
  return light.map((entry) => {
    const darkValue = darkByName.get(entry.name);
    // Failing loudly, not falling back to the light value: this page's whole purpose is not
    // silently drifting from the real token source, so a `lightPalette` key with no matching
    // `darkPalette` entry should break the build, not render a wrong "dark" swatch that's
    // actually still light.
    if (darkValue === undefined) throw new Error(`darkPalette is missing a "${entry.name}" entry that lightPalette has`);
    return { name: entry.name, light: entry.value, dark: darkValue };
  });
}
