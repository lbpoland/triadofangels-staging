#!/usr/bin/env node
/**
 * CSP Fixer (Triad of Angels)
 *
 * Purpose:
 * - Ensures every inline JSON-LD (<script type="application/ld+json">) block in each HTML file has
 *   a corresponding SHA-256 hash token present in the page Content-Security-Policy meta tag.
 * - Keeps strict rules: no 'unsafe-inline'; requires script-src-attr 'none' and style-src-attr 'none'.
 *
 * Usage:
 *   node tools/csp-fix.mjs
 *   node tools/csp-fix.mjs --root="C:\\path\\to\\triadofangels" --write
 *
 * Defaults:
 * - root: process.cwd()
 * - dry-run: prints changes without writing
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const hit = argv.find((a) => a === name || a.startsWith(name + '='));
  if (!hit) return fallback;
  if (hit === name) return true;
  return hit.split('=', 2)[1] ?? fallback;
};

const ROOT = String(arg('--root', process.cwd()));
const WRITE = Boolean(arg('--write', false));
const VERBOSE = Boolean(arg('--verbose', false));

const sha256Base64 = (txt) => crypto.createHash('sha256').update(txt, 'utf8').digest('base64');

const isSkippableDir = (name) => {
  const n = String(name || '').toLowerCase();
  return (
    n === 'node_modules' ||
    n === '.git' ||
    n === '.github' ||
    n === '.vscode' ||
    n === 'dist' ||
    n === 'build' ||
    n === '.cache' ||
    n === '.lighthouseci'
  );
};

const walk = async (dir) => {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (isSkippableDir(e.name)) continue;
      out.push(...(await walk(path.join(dir, e.name))));
      continue;
    }
    if (e.isFile() && e.name.toLowerCase().endsWith('.html')) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
};

const extractCspMeta = (html) => {
  // Capture content="..." (or content='...') while allowing the opposite quote inside.
  const re = /<meta\b[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*\bcontent\s*=\s*(["'])([\s\S]*?)\1[^>]*>/i;
  const m = re.exec(html);
  if (!m) return null;
  return { full: m[0], content: String(m[2] || '').trim(), start: m.index, end: m.index + m[0].length };
};

const replaceCspContent = (metaHtml, newContent) => {
  // Replace the content attribute value inside a meta tag string.
  // Works for both single and double quotes.
  return metaHtml.replace(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i, (m, q) => `content=${q}${newContent}${q}`);
};

const collectJsonLdBodies = (html) => {
  const blocks = [];
  const re = /<script\b([^>]*)type\s*=\s*["']application\/ld\+json["']([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    const attrs = (m[1] || '') + ' ' + (m[2] || '');
    const body = String(m[3] || '').trim();
    const idMatch = /\bid\s*=\s*["']([^"']+)["']/i.exec(attrs);
    const id = idMatch ? idMatch[1] : '';
    if (id === 'dynamic-jsonld') continue; // runtime-filled
    if (!body) continue;
    blocks.push({ id, body });
  }
  return blocks;
};

const parseDirectives = (csp) => {
  const directives = new Map();
  const order = [];
  for (const raw of String(csp || '').split(';')) {
    const part = raw.trim();
    if (!part) continue;
    const tokens = part.split(/\s+/).filter(Boolean);
    const name = tokens.shift();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!directives.has(key)) order.push(key);
    directives.set(key, { name, tokens });
  }
  return { directives, order };
};

const serializeDirectives = ({ directives, order }) => {
  const parts = [];
  for (const key of order) {
    const d = directives.get(key);
    if (!d) continue;
    const tokens = [d.name, ...d.tokens].join(' ').trim();
    if (!tokens) continue;
    parts.push(tokens);
  }
  // Always end with a semicolon to match existing style.
  return parts.join('; ') + ';';
};

const ensureDirective = (parsed, keyLower, canonicalName) => {
  if (parsed.directives.has(keyLower)) return parsed.directives.get(keyLower);
  parsed.order.push(keyLower);
  const d = { name: canonicalName, tokens: [] };
  parsed.directives.set(keyLower, d);
  return d;
};

const uniquePush = (arr, token) => {
  if (!arr.includes(token)) arr.push(token);
};

const fixCspForHtml = (html, filePath) => {
  const meta = extractCspMeta(html);
  if (!meta) {
    return { changed: false, reason: 'no-csp', html };
  }

  const blocks = collectJsonLdBodies(html);
  if (!blocks.length) {
    return { changed: false, reason: 'no-jsonld', html };
  }

  const parsed = parseDirectives(meta.content);

  // Enforce strict attr directives.
  const scriptAttr = ensureDirective(parsed, 'script-src-attr', 'script-src-attr');
  const styleAttr = ensureDirective(parsed, 'style-src-attr', 'style-src-attr');

  // Keep them locked to 'none' (dev-check requires this substring at minimum).
  scriptAttr.tokens = scriptAttr.tokens.filter((t) => t !== "'unsafe-inline'");
  styleAttr.tokens = styleAttr.tokens.filter((t) => t !== "'unsafe-inline'");
  if (!scriptAttr.tokens.includes("'none'")) scriptAttr.tokens.unshift("'none'");
  if (!styleAttr.tokens.includes("'none'")) styleAttr.tokens.unshift("'none'");

  // Collect present hashes anywhere in CSP.
  const present = new Set((meta.content.match(/'sha256-[^']+'/g) || []).map((t) => t.trim()));

  // Ensure script-src exists.
  const scriptSrc = ensureDirective(parsed, 'script-src', 'script-src');

  const added = [];
  for (const b of blocks) {
    const hash = sha256Base64(b.body);
    const token = `'sha256-${hash}'`;
    if (!present.has(token) && !scriptSrc.tokens.includes(token)) {
      scriptSrc.tokens.push(token);
      added.push({ id: b.id || '(no id)', token });
    }
  }

  if (!added.length) {
    return { changed: false, reason: 'ok', html };
  }

  const newCsp = serializeDirectives(parsed);
  const newMeta = replaceCspContent(meta.full, newCsp);
  const outHtml = html.slice(0, meta.start) + newMeta + html.slice(meta.end);

  return { changed: true, reason: 'updated', html: outHtml, added, oldCsp: meta.content, newCsp };
};

const main = async () => {
  const htmlFiles = await walk(ROOT);
  const updates = [];

  for (const file of htmlFiles) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const src = await fs.readFile(file, 'utf8');
    const res = fixCspForHtml(src, file);

    if (res.changed) {
      updates.push({ file: rel, added: res.added });
      if (WRITE) await fs.writeFile(file, res.html, 'utf8');
      if (VERBOSE) {
        console.log(`UPDATED ${rel}`);
        for (const a of res.added) console.log(`  + ${a.token} (${a.id})`);
      }
    }
  }

  if (!updates.length) {
    console.log('CSP OK: no missing JSON-LD hashes found.');
    process.exitCode = 0;
    return;
  }

  console.log(`CSP FIX: ${updates.length} file(s) ${WRITE ? 'written' : 'would be written'}.`);
  for (const u of updates) {
    console.log(`- ${u.file}: +${u.added.length} hash(es)`);
  }

  if (!WRITE) {
    console.log('Dry-run mode. Re-run with --write to apply changes.');
  }
};

main().catch((err) => {
  console.error('CSP FIX FAILED:', err);
  process.exitCode = 1;
});
