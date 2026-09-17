import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const previewDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.join(previewDirectory, 'dist');
// Defaults to loopback-only for local `pnpm preview` (unchanged behavior); a container that
// publishes this port needs 0.0.0.0 instead, since a socket bound to 127.0.0.1 only accepts
// connections from inside its own network namespace, not through container port-publishing
// (confirmed directly: reachable via `podman run --network container:<id>`, unreachable via
// the published `-p` port from the host).
const host = process.env.BUSYOFFICE_UI_PREVIEW_HOST ?? '127.0.0.1';
const port = Number(process.env.BUSYOFFICE_UI_PREVIEW_PORT ?? '4174');
// ROADMAP item 14 (2026-09-14 design review, confirmed MEDIUM finding): the UA default stylesheet
// gives `body` an 8px margin on every side — never reset here before — which added ~16px to every
// vertical (and horizontal) measurement taken against this preview host that has nothing to do
// with the actual design system being measured (e.g. it was silently baked into the sample pages'
// heading x-position and `document.scrollingElement.scrollHeight`). `body{margin:0}` removes it;
// this is the preview host's own inline HTML shell, not a design-system export, so it's the right
// place for a host-level reset.
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Busy Office UI preview</title><style>body{margin:0}</style><link rel="stylesheet" href="/client.css"><link rel="stylesheet" href="/stylex.css"></head><body><div id="root"></div><script type="module" src="/client.js"></script></body></html>`;
const contentTypes = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.woff2': 'font/woff2' };

createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', `http://${host}`).pathname;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  if (pathname === '/' || pathname === '/index.html') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : html);
    return;
  }
  const fileName = path.basename(pathname);
  const filePath = path.join(distDirectory, fileName);
  if (pathname !== `/${fileName}` || !(path.extname(fileName) in contentTypes)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const body = await readFile(filePath);
    response.writeHead(200, { 'content-type': contentTypes[path.extname(fileName)], 'cache-control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(port, host, () => {
  console.log(`Busy Office UI preview: http://${host}:${port}`);
});
