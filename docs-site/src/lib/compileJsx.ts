import { transformSync } from 'esbuild';

/**
 * Compiles a doc page's fenced JSX sample (which is often several sibling elements, not one
 * expression — see e.g. docs/Button.md) into a single JS expression string the client-side
 * `<LiveDemo>` island can hand to `new Function` and evaluate against the real package's
 * exports. Wrapping in a Fragment is the only change made to the sample text itself; esbuild
 * (already a build dependency of the root package, reused here rather than adding a second
 * JSX toolchain) does the actual JSX -> `React.createElement` transform.
 */
export function compileJsxSample(source: string): string {
  const wrapped = `<>\n${source}\n</>;`;
  const { code } = transformSync(wrapped, {
    loader: 'jsx',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  });
  return code.trim().replace(/;$/, '');
}
