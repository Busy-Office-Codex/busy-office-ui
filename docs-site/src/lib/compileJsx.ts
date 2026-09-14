import { transformSync } from 'esbuild';

/**
 * Compiles a doc page's fenced code sample into a single JS expression string the client-side
 * `<LiveDemo>` island can hand to `new Function` and evaluate against the real package's
 * exports. Most samples are bare JSX (often several sibling elements, not one expression —
 * see e.g. docs/Button.md), wrapped in a Fragment. A sample that needs local state to be
 * self-contained (see docs/Modal.md) is instead a full expression already — an IIFE calling a
 * `() => { ...; return <Jsx/>; }` — so it's parenthesized, not Fragment-wrapped; wrapping an
 * arbitrary JS expression in `<>...</>` would be invalid JSX. esbuild (already a build
 * dependency of the root package, reused here rather than adding a second JSX toolchain) does
 * the actual JSX -> `React.createElement` transform either way; `tsx` loader also lets a
 * sample use TS type annotations (see docs/Shell.md) without a separate strip step.
 */
export function compileJsxSample(source: string): string {
  const trimmed = source.trim();
  const wrapped = trimmed.startsWith('<') ? `<>\n${trimmed}\n</>;` : `(${trimmed});`;
  const { code } = transformSync(wrapped, {
    loader: 'tsx',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  });
  return code.trim().replace(/;$/, '');
}
