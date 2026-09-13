import { build } from 'esbuild';
import stylexPlugin from '@stylexjs/esbuild-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const previewDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageDirectory = path.resolve(previewDirectory, '..');

await build({
  entryPoints: [path.join(previewDirectory, 'client.tsx')],
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  platform: 'browser',
  outfile: path.join(previewDirectory, 'dist/client.js'),
  loader: { '.woff2': 'file' },
  plugins: [
    stylexPlugin({
      generatedCSSFileName: path.join(previewDirectory, 'dist/stylex.css'),
      unstable_moduleResolution: { type: 'commonJS', rootDir: packageDirectory },
    }),
  ],
});
