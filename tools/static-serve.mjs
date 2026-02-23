#!/usr/bin/env node
/*
  tools/static-serve.mjs
  Zero-dependency static server for local QA (LHCI + manual testing).
  - Serves repo root as site root.
  - Resolves clean routes:
      /           -> /index.html
      /foo/       -> /foo/index.html
      /search/    -> /search/index.html
  - Returns /404.html (status 404) when missing.
  - Safe path normalization to prevent directory traversal.
*/

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const argMap = new Map();
for (const raw of process.argv.slice(2)) {
  const [k, v] = raw.split('=');
  if (!k) continue;
  argMap.set(k.replace(/^--/, ''), v ?? true);
}

const PORT = Number(argMap.get('port') || 4173);
const HOST = String(argMap.get('host') || '127.0.0.1');

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.mjs', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2']
]);

function safeDecode(s) {
  try { return decodeURIComponent(s); } catch { return s; }
}

function toFsPath(urlPath) {
  let p = safeDecode(urlPath || '/');

  // Strip query/hash handled upstream; just normalize slashes
  if (!p.startsWith('/')) p = '/' + p;

  // Route normalization
  if (p === '/') p = '/index.html';
  if (p.endsWith('/')) p = p + 'index.html';

  // No extension? treat as directory route
  const base = path.posix.basename(p);
  if (!base.includes('.')) p = p + '/index.html';

  // Normalize and ensure it stays within ROOT
  const joined = path.join(ROOT, p);
  const normalized = path.normalize(joined);

  if (!normalized.startsWith(ROOT)) return null;
  return normalized;
}

function send(res, status, body, type) {
  res.statusCode = status;
  if (type) res.setHeader('Content-Type', type);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(body);
}

function shouldGzip(req, ext, type) {
  const ae = String(req.headers['accept-encoding'] || '');
  if (!ae.includes('gzip')) return false;

  // Range requests must stay uncompressed (byte ranges are undefined on transformed bodies).
  if (req.headers.range) return false;

  // Only compress known-textual assets.
  const TEXT_EXTS = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.json', '.xml', '.svg', '.txt']);
  if (!TEXT_EXTS.has(ext)) return false;

  // MIME safety: compress only text/* or a small allowlist of known textual application types.
  if (type.startsWith('text/')) return true;
  if (type === 'application/javascript' || type === 'application/x-javascript') return true;
  if (type === 'application/json') return true;
  if (type === 'application/xml' || type === 'image/svg+xml') return true;

  return false;
}

const gzipCache = new Map(); // key: fsPath -> Buffer (gzipped)
function getGzipped(fsPath, data) {
  const cached = gzipCache.get(fsPath);
  if (cached) return cached;
  const gz = zlib.gzipSync(data, { level: 6 });
  // Keep cache bounded to avoid runaway memory in long sessions.
  if (gzipCache.size > 300) gzipCache.clear();
  gzipCache.set(fsPath, gz);
  return gz;
}

function serveFile(req, res, fsPath, status = 200) {
  try {
    const ext = path.extname(fsPath).toLowerCase();
    const type = MIME.get(ext) || 'application/octet-stream';
    const data = fs.readFileSync(fsPath);

    res.statusCode = status;
    res.setHeader('Content-Type', type);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Keep cache off for QA determinism (no regressions vs previous behavior)
    res.setHeader('Cache-Control', 'no-store');

    if (shouldGzip(req, ext, type) && data.length > 220) {
      const gz = getGzipped(fsPath, data);
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      res.end(gz);
      return true;
    }

    res.end(data);
    return true;
  } catch {
    return false;
  }
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url || '/', `http://${HOST}:${PORT}`);
  const fsPath = toFsPath(u.pathname);

  if (!fsPath) {
    const fallback404 = path.join(ROOT, '404.html');
    if (fs.existsSync(fallback404)) return serveFile(req, res, fallback404, 404);
    return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  }

  if (fs.existsSync(fsPath) && fs.statSync(fsPath).isFile()) {
    return serveFile(req, res, fsPath, 200);
  }

  const fallback404 = path.join(ROOT, '404.html');
  if (fs.existsSync(fallback404)) return serveFile(req, res, fallback404, 404);
  return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
});

server.listen(PORT, HOST, () => {
  console.log(`Static QA server listening on http://${HOST}:${PORT}`);
});
