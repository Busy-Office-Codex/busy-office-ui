import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const previewDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.join(previewDirectory, 'dist');
const host = '127.0.0.1';
const port = Number(process.env.BUSYOFFICE_UI_PREVIEW_PORT ?? '4174');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Busy Office UI preview</title><link rel="stylesheet" href="/client.css"><link rel="stylesheet" href="/stylex.css"></head><body><div id="root"></div><script type="module" src="/client.js"></script></body></html>`;
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
