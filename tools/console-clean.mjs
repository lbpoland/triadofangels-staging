#!/usr/bin/env node
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const argv = process.argv.slice(2);
const getOptValue = (name, fallback = '') => {
  const idx = argv.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (idx === -1) return fallback;
  const token = argv[idx];
  if (token.startsWith(`${name}=`)) return token.slice(name.length + 1);
  const next = argv[idx + 1];
  if (!next || next.startsWith('--')) return fallback;
  return next;
};

const PORT = Number(getOptValue('--port', '4173')) || 4173;
const HOST = getOptValue('--host', '127.0.0.1') || '127.0.0.1';
const CI = argv.includes('--ci') || process.env.CI === '1' || String(process.env.CI || '').toLowerCase() === 'true';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(ROOT, 'reports', `console-clean__${timestamp}.json`);
const corePaths = [
  '/index.html',
  '/music.html',
  '/album.html?album=wings-of-fire',
  '/track.html?album=wings-of-fire&track=awakening-the-triad',
  '/publishing.html',
  '/merch.html',
  '/digital-store.html',
  '/contact.html',
  '/privacy.html'
];

const contentTypeFor = (filePath) => {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.xml')) return 'application/xml; charset=utf-8';
  if (filePath.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
};

const safePath = (urlPath) => {
  const raw = decodeURIComponent((urlPath || '/').split('?')[0].split('#')[0]);
  const normalized = path.posix.normalize(raw);
  const withIndex = normalized.endsWith('/') ? `${normalized}index.html` : normalized;
  return withIndex === '/' ? '/index.html' : withIndex;
};

const startServer = () => new Promise((resolve) => {
  const server = http.createServer(async (req, res) => {
    const reqPath = safePath(req.url || '/');
    const abs = path.join(ROOT, reqPath.replace(/^\//, ''));

    if (!abs.startsWith(ROOT)) {
      res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    try {
      const data = await fs.readFile(abs);
      res.writeHead(200, {
        'content-type': contentTypeFor(abs),
        'cache-control': abs.endsWith('.html') ? 'no-cache, must-revalidate' : 'public, max-age=300'
      });
      res.end(data);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    }
  });

  server.listen(PORT, HOST, () => resolve(server));
});

await fs.mkdir(path.join(ROOT, 'reports'), { recursive: true });

let server;
let browser;
const result = {
  tool: 'tools/console-clean.mjs',
  generatedAt: new Date().toISOString(),
  origin: `http://${HOST}:${PORT}`,
  pass: true,
  pages: [],
  blocker: ''
};

try {
  server = await startServer();
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });

  for (const route of corePaths) {
    const page = await context.newPage();
    const logs = [];

    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        logs.push({ type, text: msg.text() });
      }
    });
    page.on('pageerror', (err) => logs.push({ type: 'pageerror', text: String(err?.message || err) }));
    page.on('requestfailed', (req) => logs.push({ type: 'requestfailed', text: `${req.method()} ${req.url()} :: ${req.failure()?.errorText || 'failed'}` }));

    const url = `${result.origin}${route}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    if (logs.length > 0) result.pass = false;
    result.pages.push({ route, consoleIssues: logs });
    await page.close();
  }

  await context.close();
} catch (error) {
  result.pass = false;
  result.blocker = String(error?.message || error);
} finally {
  if (browser) await browser.close().catch(() => {});
  if (server) await new Promise((resolve) => server.close(resolve));
  await fs.writeFile(reportPath, JSON.stringify(result, null, 2), 'utf8');
}

console.log(`console-clean: ${result.pass ? 'PASS' : 'FAIL'} | pages=${result.pages.length}`);
console.log(`report: ${path.relative(ROOT, reportPath).replace(/\\/g, '/')}`);
if (result.blocker) console.log(`blocker: ${result.blocker}`);

if (!result.pass) {
  if (CI) process.exit(1);
  process.exitCode = 1;
}
