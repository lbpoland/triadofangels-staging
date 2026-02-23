#!/usr/bin/env node
/*
  tools/link-scan.mjs
  Internal link scanner for a static repo.

  Scope:
  - Crawls all HTML files.
  - Extracts href/src/srcset references.
  - Validates internal HTML routes exist:
    - "/" => index.html
    - "/foo/" => /foo/index.html
    - strips query/hash when checking existence
  - Treats /assets/... as "static assets". If the assets tree is missing in the scan root (common in partial workdirs), asset existence checks are skipped and reported as SKIPPED (not BROKEN).

  Flags:
    --ci  Exit non-zero on FAIL
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'reports');

const args = new Set(process.argv.slice(2));
const FLAG_CI = args.has('--ci');

function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function listHtmlFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    for (const ent of fs.readdirSync(cur, { withFileTypes: true })) {
      if (ent.name === 'node_modules' || ent.name === '.git') continue;
      const p = path.join(cur, ent.name);
      if (ent.isDirectory()) stack.push(p);
      else if (ent.isFile() && ent.name.toLowerCase().endsWith('.html')) out.push(p);
    }
  }
  out.sort();
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).replaceAll(path.sep, '/');
}

function isExternal(u) {
  const s = (u || '').trim().toLowerCase();
  return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('mailto:') || s.startsWith('tel:') || s.startsWith('sms:');
}

function stripQueryHash(u) {
  const i = u.indexOf('#');
  const j = u.indexOf('?');
  let end = u.length;
  if (i !== -1) end = Math.min(end, i);
  if (j !== -1) end = Math.min(end, j);
  return u.slice(0, end);
}

function normalizePath(fromFile, href) {
  const raw = (href || '').trim();
  if (!raw) return null;

  if (raw === '#') return null;
  if (raw.startsWith('#')) return null; // anchor-only

  if (raw.startsWith('javascript:')) return null;
  if (raw.startsWith('data:')) return null;

  // Absolute site URLs
  if (raw.startsWith('https://www.triadofangels.com/')) {
    return '/' + raw.replace('https://www.triadofangels.com/', '');
  }

  if (raw.startsWith('http://www.triadofangels.com/')) {
    return '/' + raw.replace('http://www.triadofangels.com/', '');
  }

  // Root-relative
  if (raw.startsWith('/')) return raw;

  // Relative: resolve against containing directory
  const baseDir = path.dirname('/' + rel(fromFile));
  const resolved = path.posix.normalize(path.posix.join(baseDir, raw));
  return resolved.startsWith('/') ? resolved : '/' + resolved;
}

function extractCandidates(src) {
  const cands = [];

  // href
  for (const m of src.matchAll(/\bhref\s*=\s*("([^"]+)"|'([^']+)')/gi)) {
    const v = m[2] || m[3] || '';
    cands.push({ kind: 'href', value: v });
  }

  // src
  for (const m of src.matchAll(/\bsrc\s*=\s*("([^"]+)"|'([^']+)')/gi)) {
    const v = m[2] || m[3] || '';
    cands.push({ kind: 'src', value: v });
  }

  // srcset (split by comma)
  for (const m of src.matchAll(/\bsrcset\s*=\s*("([^"]+)"|'([^']+)')/gi)) {
    const v = (m[2] || m[3] || '').trim();
    if (!v) continue;
    const parts = v.split(',').map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const url = part.split(/\s+/)[0];
      if (url) cands.push({ kind: 'srcset', value: url });
    }
  }

  // OG/Twitter meta images (ensure we track them even if link extraction misses)
  for (const m of src.matchAll(/<meta\b[^>]*(property|name)\s*=\s*("|')(og:image|twitter:image)(\2)[^>]*>/gi)) {
    const tag = m[0];
    const cm = /\bcontent\s*=\s*("([^"]+)"|'([^']+)')/i.exec(tag);
    const v = cm ? (cm[2] || cm[3] || '') : '';
    if (v) cands.push({ kind: 'meta-image', value: v });
  }

  return cands;
}

function resolveToFsPath(urlPath) {
  // urlPath is normalized and query/hash-free
  let p = urlPath;
  if (p === '/') p = '/index.html';
  if (p.endsWith('/')) p = `${p}index.html`;

  // No extension: treat as route directory
  if (!path.posix.basename(p).includes('.')) {
    p = p.endsWith('/') ? `${p}index.html` : `${p}/index.html`;
  }

  return path.join(ROOT, p);
}


const BINARY_ASSET_EXT = new Set([
  '.webp', '.png', '.jpg', '.jpeg', '.gif', '.ico',
  '.woff', '.woff2', '.mp3', '.mp4', '.m4a', '.wav', '.ogg', '.pdf'
]);

function hasBinaryAssets(rootDir) {
  // Detect whether /assets contains real binary payloads.
  // This prevents false FAILs when scanning partial workdirs where binaries weren't pulled.
  const stack = [rootDir];
  let scanned = 0;

  while (stack.length) {
    const cur = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const ent of entries) {
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!ent.isFile()) continue;

      scanned += 1;
      const ext = path.extname(ent.name).toLowerCase();
      if (BINARY_ASSET_EXT.has(ext)) return true;

      // Hard cap to keep scan fast even if assets is massive.
      if (scanned > 6000) return false;
    }
  }

  return false;
}

function main() {
  ensureReportsDir();

  const htmlFiles = listHtmlFiles(ROOT);

  const assetsRoot = path.join(ROOT, 'assets');
  const assetsPresent = fs.existsSync(assetsRoot) && hasBinaryAssets(assetsRoot);

  const broken = [];
  const skippedAssets = [];
  const checked = [];

  for (const f of htmlFiles) {
    const src = fs.readFileSync(f, 'utf8');
    const cands = extractCandidates(src);

    for (const c of cands) {
      const raw = c.value;
      if (!raw) continue;
      if (isExternal(raw)) continue;

      const norm = normalizePath(f, raw);
      if (!norm) continue;

      const clean = stripQueryHash(norm);
      if (!clean || clean === '#') continue;

      // Asset policy
      if (clean.startsWith('/assets/')) {
        const fsPath = resolveToFsPath(clean);
        if (assetsPresent) {
          if (!fs.existsSync(fsPath)) {
            broken.push({ file: rel(f), url: raw, normalized: clean, reason: 'Missing asset file' });
          } else {
            checked.push({ file: rel(f), url: raw, normalized: clean });
          }
        } else {
          skippedAssets.push({ file: rel(f), url: raw, normalized: clean, reason: 'assets/ tree not present in scan root' });
        }
        continue;
      }

      // Internal HTML/routes
      const fsPath = resolveToFsPath(clean);
      if (!fs.existsSync(fsPath)) {
        broken.push({ file: rel(f), url: raw, normalized: clean, reason: 'Missing target file' });
      } else {
        checked.push({ file: rel(f), url: raw, normalized: clean });
      }
    }
  }

  const ok = broken.length === 0;
  const result = {
    ok,
    generatedAt: new Date().toISOString(),
    root: ROOT,
    totals: {
      htmlFiles: htmlFiles.length,
      checked: checked.length,
      broken: broken.length,
      skippedAssets: skippedAssets.length,
      assetsPresent
    },
    broken,
    skippedAssets
  };

  const jsonPath = path.join(REPORTS_DIR, 'link-scan-report.json');
  const mdPath = path.join(REPORTS_DIR, 'link-scan-report.md');

  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');

  const md = [];
  md.push('# Link Scan Report');
  md.push('');
  md.push(`Generated: ${result.generatedAt}`);
  md.push('');
  md.push('## Summary');
  md.push('');
  md.push(`Status: **${ok ? 'PASS' : 'FAIL'}**`);
  md.push('');
  md.push(`HTML files: ${result.totals.htmlFiles}`);
  md.push(`Checked references: ${result.totals.checked}`);
  md.push(`Broken: ${result.totals.broken}`);
  md.push(`Assets present in scan root: ${assetsPresent ? 'yes' : 'no'}`);
  md.push(`Skipped asset existence checks: ${result.totals.skippedAssets}`);

  if (broken.length) {
    md.push('');
    md.push('## Broken');
    md.push('');
    for (const b of broken) {
      md.push(`- ❌ ${b.file}: ${b.url}  →  ${b.reason} (${b.normalized})`);
    }
  }

  if (skippedAssets.length) {
    md.push('');
    md.push('## Skipped assets');
    md.push('');
    md.push('These were not marked broken because the /assets/ tree is missing in the current scan root. In the full repo, re-run link-scan with assets present to validate existence.');
    md.push('');
    for (const s of skippedAssets.slice(0, 40)) {
      md.push(`- ⚠️ ${s.file}: ${s.url}  →  ${s.reason}`);
    }
    if (skippedAssets.length > 40) md.push(`- … plus ${skippedAssets.length - 40} more.`);
  }

  md.push('');
  fs.writeFileSync(mdPath, md.join('\n'), 'utf8');

  console.log(`Link-scan: ${ok ? 'PASS' : 'FAIL'} | html=${htmlFiles.length} broken=${broken.length} skippedAssets=${skippedAssets.length}`);
  console.log(`Report: ${path.relative(process.cwd(), mdPath)}`);

  if (FLAG_CI && !ok) process.exit(1);
}

try {
  main();
} catch (e) {
  ensureReportsDir();
  const msg = (e && e.stack) ? e.stack : String(e);
  fs.writeFileSync(path.join(REPORTS_DIR, 'link-scan-fatal.log'), msg, 'utf8');
  console.error('Link-scan fatal error:', msg);
  process.exit(1);
}