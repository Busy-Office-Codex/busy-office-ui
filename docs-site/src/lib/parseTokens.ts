import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Reads the actual literal token values out of `src/tokens.stylex.ts` (ROADMAP item 15's
 * tokens page: "read real values, don't hand-copy a stale table"). This is deliberately not a
 * runtime `import` — `stylex.defineVars()` compiles each value away into an opaque hashed CSS
 * custom property (see docs/design-conventions.md, "never write CSS ... against these names"),
 * so the only place the literal `#f8fafc`-style values still exist is the source text itself.
 * A tiny regex extraction, not a TS/AST parser: every `color`/`space`/`font` entry here is a
 * flat `key: 'value'` pair (unlike `density`/`shadow`/`motion`, which this page doesn't need).
 */

export type TokenEntry = { name: string; value: string };

function readTokensSource(): string {
  // Resolved from the docs-site project root (Astro/Vite bundles this module into a chunk at
  // build time, so a path relative to `import.meta.url` would point at the wrong place once
  // relocated) rather than from this file's own location.
  const tokensPath = path.resolve(process.cwd(), '..', 'src', 'tokens.stylex.ts');
  return readFileSync(tokensPath, 'utf8');
}

function extractBlock(source: string, exportName: string): string {
  const start = source.indexOf(`export const ${exportName} = stylex.defineVars({`);
  if (start === -1) throw new Error(`Could not find "${exportName}" token block in tokens.stylex.ts`);
  const braceStart = source.indexOf('{', start);
  let depth = 0;
  for (let i = braceStart; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(braceStart + 1, i);
    }
  }
  throw new Error(`Unbalanced braces in "${exportName}" token block`);
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

export function readTokens(exportName: 'color' | 'space' | 'font'): TokenEntry[] {
  const source = readTokensSource();
  return extractPairs(extractBlock(source, exportName));
}
