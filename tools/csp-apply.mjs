#!/usr/bin/env node
/**
 * tools/csp-apply.mjs
 * Deterministically:
 *  1) Minifies ALL inline JSON-LD blocks (type="application/ld+json") by parsing + stable-stringifying
 *  2) Computes SHA-256 hashes for each inline JSON-LD block (including empty scaffolds)
 *  3) Rewrites/creates the CSP meta tag so strict CSP passes without 'unsafe-inline'
 *
 * Usage:
 *   node tools/csp-apply.mjs --write
 *   node tools/csp-apply.mjs --check
 *
 * Notes:
 * - This tool intentionally focuses on JSON-LD blocks only. No other inline scripts are permitted.
 * - If JSON-LD is invalid JSON, the tool will error (unless the block is empty).
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SITE_ORIGIN = 'https://www.triadofangels.com';

const args = new Set(process.argv.slice(2));
const MODE_WRITE = args.has('--write');
const MODE_CHECK = args.has('--check') || !MODE_WRITE;

const repoRoot = process.cwd();

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

const stableClone = (value) => {
  if (Array.isArray(value)) return value.map(stableClone);
  if (isObject(value)) {
    const out = {};
    for (const k of Object.keys(value).sort()) out[k] = stableClone(value[k]);
    return out;
  }
  return value;
};

const stableMinifyJson = (raw) => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const parsed = JSON.parse(trimmed);
  const stabilized = stableClone(parsed);
  return JSON.stringify(stabilized);
};

const sha256Base64 = (s) =>
  crypto.createHash('sha256').update(s, 'utf8').digest('base64');

const buildCsp = (hashTokens) => {
  const hashes = hashTokens.length ? ` ${hashTokens.join(' ')}` : '';
  // Keep sources needed per project rules (self, Google Fonts, YouTube images, YouTube/Boomplay frames).
  return [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `script-src 'self' https://www.youtube.com https://www.gstatic.com${hashes}`,
    `script-src-attr 'none'`,
    `style-src 'self' https://fonts.googleapis.com`,
    `style-src-attr 'none'`,
    `font-src 'self' https://fonts.gstatic.com`,
    // Allow the production origin explicitly so local QA (served from LAN/IP) can still load prod-absolute assets if present.
    `img-src 'self' data: ${SITE_ORIGIN} https://img.youtube.com https://i.ytimg.com https://www.boomplay.com`,
    `frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.boomplay.com`,
    `connect-src 'self'`,
  ].join('; ') + ';';
};

const cspMetaTag = (csp) =>
  `<meta http-equiv="Content-Security-Policy" content="${csp}">`;

const findHtmlFiles = async () => {
  // P0 scope: root HTML + /search/index.html + 404.html
  const out = [];
  const entries = await fs.readdir(repoRoot, { withFileTypes: true });
  for (const e of entries) {
    if (e.isFile() && e.name.endsWith('.html')) out.push(path.join(repoRoot, e.name));
  }
  const searchIndex = path.join(repoRoot, 'search', 'index.html');
  try {
    await fs.stat(searchIndex);
    out.push(searchIndex);
  } catch {}
  // sort stable
  return out.sort((a, b) => a.localeCompare(b));
};

const replaceOrInsertCspMeta = (html, newMeta) => {
  // Remove ANY existing CSP meta tags (attribute order varies across pages).
  const reAll = /<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi;
  let stripped = html.replace(reAll, '');

  // Normalize "blank" lines (including whitespace-only) so repeated runs are deterministic.
  // - Collapse 3+ blank lines → 2 blank lines
  // - Collapse whitespace-only blank lines too
  stripped = stripped
    .replace(/\r\n/g, '\n')
    .replace(/\n[ \t]*\n([ \t]*\n)+/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n');

  // Insert after <meta charset> if present, else after <head>.
  // IMPORTANT: don't capture trailing whitespace into the match, or the insertion point becomes non-deterministic.
  const charsetRe = /(<meta\s+charset=["'][^"']+["']\s*>)/i;
  if (charsetRe.test(stripped)) {
    return stripped.replace(charsetRe, (m) => `${m}\n  ${newMeta}\n  `);
  }

  const headRe = /<head>\s*/i;
  if (headRe.test(stripped)) {
    return stripped.replace(headRe, (m) => `${m}${newMeta}\n  `);
  }

  return `${newMeta}\n${stripped}`;
};

const processHtml = (html) => {
  const jsonLdRe = /<script\b([^>]*?)\btype=["']application\/ld\+json["']([^>]*?)>([\s\S]*?)<\/script>/gi;

  const hashes = [];
  let changed = false;

  const out = html.replace(jsonLdRe, (full, a1, a2, inner) => {
    const original = inner;
    const minified = stableMinifyJson(original);
    // Note: even empty JSON-LD blocks are hashed (hash of empty string).
    const hash = sha256Base64(minified);
    hashes.push(`'sha256-${hash}'`);

    if (original !== minified) changed = true;

    // Preserve attributes as-is, but normalize content to minified string (no surrounding whitespace).
    return `<script${a1}type="application/ld+json"${a2}>${minified}</script>`;
  });

  const csp = buildCsp(hashes);
  const out2 = replaceOrInsertCspMeta(out, cspMetaTag(csp));
  if (out2 !== out) changed = true;

  return { html: out2, hashes, changed };
};

const main = async () => {
  const files = await findHtmlFiles();
  const results = [];

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const { html, hashes, changed } = processHtml(raw);
    results.push({ file: path.relative(repoRoot, file), hashes: hashes.length, changed });

    if (MODE_WRITE) {
      if (changed) await fs.writeFile(file, html, 'utf8');
    } else {
      // check mode: if changed would occur, fail
      if (changed) {
        throw new Error(`CSP/JSON-LD not normalized for: ${path.relative(repoRoot, file)} (run: node tools/csp-apply.mjs --write)`);
      }
    }
  }

  const changedCount = results.filter(r => r.changed).length;
  const hashTotal = results.reduce((a, r) => a + r.hashes, 0);

  const summary = [
    `CSP Apply: ${MODE_WRITE ? 'WRITE' : 'CHECK'}`,
    `Files: ${results.length}`,
    `Changed: ${changedCount}`,
    `JSON-LD blocks hashed: ${hashTotal}`,
  ].join(' | ');

  // eslint-disable-next-line no-console
  console.log(summary);
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err?.message || err);
  process.exit(1);
});