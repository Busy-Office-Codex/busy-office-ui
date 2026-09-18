#!/usr/bin/env node
// Serves docs-site/dist/ as a plain static file server. M10 (issue #24): `astro preview` itself
// was found to daemonize even without `--background` in this environment (each invocation logs
// "Preview server already running" against a *different* PID than the one just spawned, and the
// port never actually accepts a connection afterward) — reproduced directly, not assumed, and
// confirmed unrelated to a stale lock (fresh after `astro preview stop`). Playwright's `webServer`
// needs a plain foreground process it can manage itself, so this sidesteps the CLI daemon
// entirely rather than fighting it — the same "own a small script instead of a black-box tool"
// choice this repo already made for `../preview/server.mjs` and `../scripts/generate-palette.mjs`.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsSiteDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDirectory = path.join(docsSiteDir, 'dist');
const host = process.env.BUSYOFFICE_DOCS_PREVIEW_HOST ?? '127.0.0.1';
const port = Number(process.env.BUSYOFFICE_DOCS_PREVIEW_PORT ?? '4321');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

async function resolveFile(pathname) {
  // Directory-style routes (Astro's static output: /components/input/ -> index.html inside it),
  // and the site root.
  const candidates = pathname.endsWith('/') || pathname === ''
    ? [path.join(distDirectory, pathname, 'index.html')]
    : [path.join(distDirectory, pathname), path.join(distDirectory, pathname, 'index.html')];
  for (const candidate of candidates) {
    // Never serve outside dist/ — reject any resolved path that escapes it (a decoded `..` in
    // the URL, for example).
    if (!candidate.startsWith(distDirectory + path.sep) && candidate !== distDirectory) continue;
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const pathname = decodeURIComponent(new URL(request.url ?? '/', `http://${host}`).pathname);
  const filePath = await resolveFile(pathname);
  if (!filePath) {
    response.writeHead(404).end();
    return;
  }
  try {
    const body = await readFile(filePath);
    const contentType = contentTypes[path.extname(filePath)] ?? 'application/octet-stream';
    response.writeHead(200, { 'content-type': contentType, 'cache-control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(port, host, () => {
  console.log(`Busy Office UI docs preview: http://${host}:${port}`);
});
