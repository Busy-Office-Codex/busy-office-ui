import { build } from 'esbuild';
import stylexPlugin from '@stylexjs/esbuild-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: {
    index: 'src/index.ts',
    'examples/app-shell': 'examples/AppShell.tsx',
    'examples/list-report': 'examples/ListReport.tsx',
    'examples/record-detail': 'examples/RecordDetail.tsx',
  },
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  platform: 'browser',
  external: ['react', 'react/jsx-runtime', 'react-dom'],
  outdir: 'dist',
  plugins: [
    stylexPlugin({
      generatedCSSFileName: path.resolve(__dirname, 'dist/design-system.css'),
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: __dirname,
      },
    }),
  ],
});
