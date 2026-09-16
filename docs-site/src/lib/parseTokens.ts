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

export function readTokens(exportName: 'space' | 'font'): TokenEntry[] {
  const source = readTokensSource();
  return extractPairs(extractBlock(source, `export const ${exportName} = stylex.defineVars({`));
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
