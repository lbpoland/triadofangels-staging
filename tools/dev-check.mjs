#!/usr/bin/env node
/**
 * tools/dev-check.mjs
 * Triad of Angels — Dev Checks (P1+)
 *
 * Usage:
 *   node tools/dev-check.mjs
 *   node tools/dev-check.mjs --strict
 *   node tools/dev-check.mjs --runtime
 *   node tools/dev-check.mjs --strict --runtime
 *   node tools/dev-check.mjs --strict-a11y-head
 *   node tools/dev-check.mjs --strict --strict-a11y-head --runtime
 *   node tools/dev-check.mjs --strict --strict-a11y-head --runtime --origin=http://127.0.0.1:8080
 *   node tools/dev-check.mjs --strict-no-inline-style
 *   node tools/dev-check.mjs --strict-no-inline-handler
 *   node tools/dev-check.mjs --strict --strict-a11y-head --strict-no-inline-style
 *   node tools/dev-check.mjs --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler
 *   node tools/dev-check.mjs --strict --strict-a11y-head --strict-no-inline-style --runtime
 *
 * What it does:
 * 1) Crawls all HTML files and checks head/meta for:
 *    - Uniqueness (duplicates) for: <title>, meta description, canonical, OG fields, Twitter fields.
 *    - Presence (required fields) with --strict.
 *
 *    Duplicates are always FAIL.
 *    Missing required fields are WARN by default, FAIL with --strict.
 *    A11y/head-required fields (og:image:alt, twitter:image:alt, og:image dims, favicons, skip link, main landmark) are enforced with --strict-a11y-head.
 *    Inline style attributes are forbidden (opt-in) with --strict-no-inline-style.
 *    Inline event handlers are forbidden (opt-in) with --strict-no-inline-handler.
 *
 * 2) Validates JSON-LD blocks:
 *    - Parses every <script type="application/ld+json"> as JSON, except:
 *      - #dynamic-jsonld scaffold MUST exist on dynamic pages and MUST be empty at template time.
 *
 * 3) Data integrity checks (js/data.js + pre-rendered route integrity):
 *    - unique album ids
 *    - each album.links is a plain object
 *    - per album: unique sanitized track ids
 *    - per track meta (album.lyrics[trackId]): links object present
 *    - every data album/track has a matching pre-rendered static route
 *    - no orphaned pre-rendered album/track routes that are missing in source data
 *
 * 4) Runtime validation (optional):
 *    - With --runtime, attempts Playwright (if installed) to load:
 *        /album.html?album=<sampleAlbumId>
 *        /track.html?album=<sampleAlbumId>&track=<sampleTrackId>
 *      and asserts that after JS runs:
 *        - title / description / canonical / og / twitter are updated
 *        - #dynamic-jsonld contains valid JSON-LD with expected schema types
 *    - If Playwright is not installed, the runtime section is marked as SKIPPED and a
 *      deterministic fallback validation runs (template + expected URL shapes).
 *
 * Output:
 *  - Writes JSON report into /reports/dev-check__<timestamp>.json
 *  - Prints a console summary (PASS/FAIL + counts)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const SITE_ORIGIN = 'https://www.triadofangels.com';

// Tool-local helpers (Node-safe; do not import browser modules here).
const safeText = (value, max = 400) => {
  if (value === null || value === undefined) return '';
  const s = String(value).replace(/\s+/g, ' ').trim();
  if (!s) return '';
  return s.length > max ? s.slice(0, max) : s;
};

const argv = process.argv.slice(2);
const ARGS = new Set(argv);

const getOptValue = (name) => {
  const idx = argv.findIndex((a) => a === name || a.startsWith(name + '='));
  if (idx === -1) return '';
  const a = argv[idx];
  if (a.startsWith(name + '=')) return a.slice(name.length + 1).trim();
  const next = argv[idx + 1];
  if (!next || next.startsWith('--')) return '';
  return String(next).trim();
};
const OPTS = {
  strict: ARGS.has('--strict'),
  strictA11yHead: ARGS.has('--strict-a11y-head'),
  strictNoInlineStyle: ARGS.has('--strict-no-inline-style'),
  strictNoInlineHandler: ARGS.has('--strict-no-inline-handler'),
  runtime: ARGS.has('--runtime'),
  // CI mode:
  // - auto-enabled when process.env.CI is truthy, or via --ci
  // - treats WARN as FAIL (forces true “clean” runs)
  // - exits immediately on FAIL (more reliable in CI runners)
  ci: ARGS.has('--ci') || process.env.CI === '1' || String(process.env.CI || '').toLowerCase() === 'true',
  // If set, --runtime will FAIL when Playwright is missing (instead of falling back).
  requirePlaywright: ARGS.has('--require-playwright'),
  // Optional: use an existing origin instead of the ephemeral internal server.
  // Example: node tools/dev-check.mjs --runtime --origin=http://127.0.0.1:8080
  origin: (getOptValue('--origin') || process.env.TOA_ORIGIN || process.env.BASE_URL || '').replace(/\/+$/g, ''),
};

const NOW = new Date();
const stamp = NOW.toISOString().replace(/[:.]/g, '-');
const REPORT_DIR = path.join(ROOT, 'reports');
const REPORT_PATH = path.join(REPORT_DIR, `dev-check__${stamp}.json`);

const OG_PROPS = ['og:title', 'og:description', 'og:type', 'og:url', 'og:image'];
const TW_NAMES = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:url', 'twitter:image'];

const isPlainObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const walk = async (dir) => {
  const out = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const it of items) {
    if (it.name.startsWith('.')) continue;
    if (it.name === 'node_modules') continue;
    if (it.name === 'reports') continue;
    if (it.name === '.git') continue;
    // Tooling artifacts / report output folders should never be treated as site pages.
    if (it.name === 'lighthouse') continue;
    if (it.name === '.lighthouseci') continue;

    const full = path.join(dir, it.name);
    if (it.isDirectory()) out.push(...await walk(full));
    else {
      // Ignore generated Lighthouse HTML reports that sometimes end up in repo root.
      // Example: 127_0_0_1-_album_html-YYYY_MM_DD_HH_MM_SS.report.html
      if (/\.report\.html$/i.test(it.name)) continue;
      out.push(full);
    }
  }
  return out;
};

const readText = async (p) => fs.readFile(p, 'utf8');

const countMatches = (re, s) => {
  const m = s.match(re);
  return m ? m.length : 0;
};

const extractAttr = (tag, attr) => {
  const re = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'i');
  const m = re.exec(tag);
  return m ? m[1] : '';
};

const firstTag = (html, re) => {
  const m = re.exec(html);
  return m ? m[0] : '';
};

const extractTitleText = (html) => {
  const m = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return m ? (m[1] ?? '').trim() : '';
};

const extractMetaContentByName = (html, name) => {
  const m = new RegExp(`<meta\\b[^>]*\\bname\\s*=\\s*["']${name}["'][^>]*>`, 'i').exec(html);
  if (!m) return '';
  return extractAttr(m[0], 'content');
};

const extractMetaContentByProp = (html, prop) => {
  const m = new RegExp(`<meta\\b[^>]*\\bproperty\\s*=\\s*["']${prop}["'][^>]*>`, 'i').exec(html);
  if (!m) return '';
  return extractAttr(m[0], 'content');
};

const classifyMissing = (strict) => (strict ? 'error' : 'warning');

const pushIssue = (arr, strict, issue) => {
  arr.push(issue);
  return strict;
};

const checkHtmlMeta = (html, relPath, opts) => {
  const strict = !!opts?.strict;
  const strictA11yHead = !!opts?.strictA11yHead;
  const strictNoInlineStyle = !!opts?.strictNoInlineStyle;
  const strictNoInlineHandler = !!opts?.strictNoInlineHandler;
  const errors = [];
  const warnings = [];

  // INLINE STYLE ATTRIBUTES (opt-in hard gate)
  if (strictNoInlineStyle) {
    const matches = [...html.matchAll(/<([a-z][a-z0-9:-]*)\b[^>]*\sstyle\s*=\s*(["'])[^\2]*?\2[^>]*>/gi)];
    if (matches.length > 0) {
      const examples = matches.slice(0, 5).map((m) => (m[0] || '').trim()).filter(Boolean);
      errors.push({
        kind: 'forbidden',
        field: 'inline-style',
        count: matches.length,
        note: 'Inline style attributes are forbidden. Move to CSS classes in css/style.css (or page CSS) to keep performance/cacheability and policy consistency.',
        examples,
      });
    }
  }

  // INLINE EVENT HANDLERS (opt-in hard gate)
  if (strictNoInlineHandler) {
    const matches = [...html.matchAll(/<([a-z][a-z0-9:-]*)\b[^>]*\son[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi)];
    if (matches.length > 0) {
      const examples = matches.slice(0, 5).map((m) => (m[0] || '').trim()).filter(Boolean);
      errors.push({
        kind: 'forbidden',
        field: 'inline-handler',
        count: matches.length,
        note: 'Inline event handlers are forbidden by policy. Move behavior to JS modules using addEventListener and class/data selectors.',
        examples,
      });
    }
  }

  // TITLE
  const titleCount = countMatches(/<title\b/gi, html);
  if (titleCount > 1) errors.push({ kind: 'duplicate', field: 'title', count: titleCount });
  if (titleCount === 0) {
    (strict ? errors : warnings).push({ kind: 'missing', field: 'title' });
  } else {
    const titleText = extractTitleText(html);
    if (!titleText) (strict ? errors : warnings).push({ kind: 'empty', field: 'title.text' });
  }

  // DESCRIPTION
  const descCount = countMatches(/<meta\b[^>]*\bname\s*=\s*["']description["']/gi, html);
  if (descCount > 1) errors.push({ kind: 'duplicate', field: 'description', count: descCount });
  if (descCount === 0) {
    (strict ? errors : warnings).push({ kind: 'missing', field: 'description' });
  } else {
    const d = extractMetaContentByName(html, 'description');
    if (!d) (strict ? errors : warnings).push({ kind: 'empty', field: 'description.content' });
  }

  // CANONICAL
  const canonCount = countMatches(/<link\b[^>]*\brel\s*=\s*["']canonical["']/gi, html);
  if (canonCount > 1) errors.push({ kind: 'duplicate', field: 'canonical', count: canonCount });
  if (canonCount === 0) {
    (strict ? errors : warnings).push({ kind: 'missing', field: 'canonical' });
  } else {
    const canonTag = firstTag(html, /<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/i);
    const href = canonTag ? extractAttr(canonTag, 'href') : '';
    if (!href) (strict ? errors : warnings).push({ kind: 'empty', field: 'canonical.href' });
    else {
      const isAbs = href.startsWith('http://') || href.startsWith('https://');
      if (!isAbs) (strict ? errors : warnings).push({ kind: 'non-absolute', field: 'canonical.href', href });
      else if (!href.startsWith(SITE_ORIGIN)) (strict ? errors : warnings).push({ kind: 'non-site-origin', field: 'canonical.href', href });
    }
  }

  // OG
  for (const prop of OG_PROPS) {
    const c = countMatches(new RegExp(`<meta\\b[^>]*\\bproperty\\s*=\\s*["']${prop}["']`, 'gi'), html);
    if (c > 1) errors.push({ kind: 'duplicate', field: prop, count: c });
    if (c === 0) (strict ? errors : warnings).push({ kind: 'missing', field: prop });

    if (c >= 1) {
      const content = extractMetaContentByProp(html, prop);
      if (!content) (strict ? errors : warnings).push({ kind: 'empty', field: `${prop}.content` });
      else {
        if ((prop === 'og:url' || prop === 'og:image') && (content.startsWith('http://') || content.startsWith('https://'))) {
          if (!content.startsWith(SITE_ORIGIN)) (strict ? errors : warnings).push({ kind: 'non-site-origin', field: `${prop}.content`, content });
        }
        if ((prop === 'og:url' || prop === 'og:image') && content.startsWith('/')) {
          // Social crawlers are more reliable with absolute; keep as warning even in strict.
          warnings.push({ kind: 'non-absolute', field: `${prop}.content`, content });
        }
      }
    }
  }

  // Twitter
  for (const name of TW_NAMES) {
    const c = countMatches(new RegExp(`<meta\\b[^>]*\\bname\\s*=\\s*["']${name}["']`, 'gi'), html);
    if (c > 1) errors.push({ kind: 'duplicate', field: name, count: c });
    if (c === 0) (strict ? errors : warnings).push({ kind: 'missing', field: name });

    if (c >= 1) {
      const content = extractMetaContentByName(html, name);
      if (!content) (strict ? errors : warnings).push({ kind: 'empty', field: `${name}.content` });
      else {
        if ((name === 'twitter:url' || name === 'twitter:image') && (content.startsWith('http://') || content.startsWith('https://'))) {
          if (!content.startsWith(SITE_ORIGIN)) (strict ? errors : warnings).push({ kind: 'non-site-origin', field: `${name}.content`, content });
        }
        if ((name === 'twitter:url' || name === 'twitter:image') && content.startsWith('/')) {
          warnings.push({ kind: 'non-absolute', field: `${name}.content`, content });
        }
      }
    }
  }


  // A11y/head enforcement (optional)
  if (strictA11yHead) {
    const require = (ok, field, note) => {
      if (!ok) errors.push({ kind: 'missing', field, note });
    };

    const ogAlt = extractMetaContentByProp(html, 'og:image:alt');
    const twAlt = extractMetaContentByName(html, 'twitter:image:alt');
    const ogW = extractMetaContentByProp(html, 'og:image:width');
    const ogH = extractMetaContentByProp(html, 'og:image:height');

    require(!!ogAlt, 'og:image:alt', 'Missing or empty og:image:alt');
    require(!!twAlt, 'twitter:image:alt', 'Missing or empty twitter:image:alt');

    const wOk = !!ogW && /^[0-9]{2,5}$/.test(String(ogW).trim());
    const hOk = !!ogH && /^[0-9]{2,5}$/.test(String(ogH).trim());
    require(wOk, 'og:image:width', 'Missing or non-numeric og:image:width');
    require(hOk, 'og:image:height', 'Missing or non-numeric og:image:height');

    const hasFavicon = /<link\b[^>]*\brel\s*=\s*["']icon["'][^>]*>/i.test(html);
    const hasAppleIcon = /<link\b[^>]*\brel\s*=\s*["']apple-touch-icon["'][^>]*>/i.test(html);
    require(hasFavicon, 'favicon', 'Missing rel="icon" links');
    require(hasAppleIcon, 'apple-touch-icon', 'Missing rel="apple-touch-icon"');

    const hasSkipLink = /<a\b[^>]*\bclass\s*=\s*["'][^"']*\bskip-link\b[^"']*["'][^>]*\bhref\s*=\s*["']#main-content["'][^>]*>/i.test(html);
    require(hasSkipLink, 'skip-link', 'Missing skip link: <a class="skip-link" href="#main-content">');

    const hasMainId = /<main\b[^>]*\bid\s*=\s*["']main-content["'][^>]*>/i.test(html);
    const hasMainRole = /<main\b[^>]*\brole\s*=\s*["']main["'][^>]*>/i.test(html);
    require(hasMainId && hasMainRole, 'main-landmark', 'Missing main landmark: <main id="main-content" role="main">');
  }

  // Dynamic scaffolds (album/track)
  const isAlbum = relPath === 'album.html';
  const isTrack = relPath === 'track.html';
  if (isAlbum || isTrack) {
    const dynJson = /<script\b[^>]*\bid\s*=\s*["']dynamic-jsonld["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
    if (!dynJson) errors.push({ kind: 'missing', field: '#dynamic-jsonld' });
    else {
      const body = (dynJson[1] ?? '').trim();
      if (body.length !== 0) errors.push({ kind: 'not-empty', field: '#dynamic-jsonld', note: 'dynamic-jsonld must be empty in template HTML (runtime fills it)' });
    }

    const dynCanonical = /<link\b[^>]*\bid\s*=\s*["']dynamic-canonical["'][^>]*\brel\s*=\s*["']canonical["'][^>]*>/i.exec(html);
    if (!dynCanonical) warnings.push({ kind: 'missing', field: '#dynamic-canonical', note: 'Recommended for dynamic canonical updates.' });

    const dynTitle = /<title\b[^>]*\bid\s*=\s*["']dynamic-title["'][^>]*>/i.exec(html);
    if (!dynTitle) warnings.push({ kind: 'missing', field: '#dynamic-title', note: 'Recommended for runtime title updates (still updates document.title).' });
  }

  return { errors, warnings };
};

const snippetAt = (text, index, radius = 120) => {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return text.slice(start, end);
};

const lineColAt = (text, index) => {
  const pre = text.slice(0, index);
  const lines = pre.split(/\r?\n/);
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  return { line, col };
};

const parseJsonLdBlocks = (html, relPath) => {
  const errors = [];
  const blocks = [...html.matchAll(/<script\b([^>]*)type\s*=\s*["']application\/ld\+json["']([^>]*)>([\s\S]*?)<\/script>/gi)];
  for (const b of blocks) {
    const attrs = (b[1] || '') + ' ' + (b[2] || '');
    const body = (b[3] || '');
    const idMatch = /\bid\s*=\s*["']([^"']+)["']/i.exec(attrs);
    const id = idMatch ? idMatch[1] : '';

    // dynamic-jsonld is validated elsewhere (must be empty)
    if (id === 'dynamic-jsonld') continue;

    const trimmed = body.trim();
    if (!trimmed) continue;

    try {
      JSON.parse(trimmed);
    } catch (e) {
      const idx = html.indexOf(body);
      const loc = idx >= 0 ? lineColAt(html, idx) : { line: 0, col: 0 };
      errors.push({
        file: relPath,
        id,
        message: String(e?.message || e),
        location: loc,
        excerpt: snippetAt(trimmed, 0, 220)
      });
    }
  }
  return errors;
};


import crypto from 'node:crypto';

const sha256Base64 = (txt) => crypto.createHash('sha256').update(txt, 'utf8').digest('base64');

const extractCspContent = (html) => {
  // Capture content="..." (or content='...') while allowing the opposite quote inside.
  const m = /<meta\b[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*\bcontent\s*=\s*(["'])([^]*?)\1[^>]*>/i.exec(html);
  return m ? String(m[2] || '').trim() : '';
};

const collectJsonLdBlocks = (html) => {
  const blocks = [];
  const re = /<script\b([^>]*)type\s*=\s*["']application\/ld\+json["']([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    const attrs = (m[1] || '') + ' ' + (m[2] || '');
    const body = (m[3] || '');
    const idMatch = /\bid\s*=\s*["']([^"']+)["']/i.exec(attrs);
    const id = idMatch ? idMatch[1] : '';
    blocks.push({ id, body: body.trim() });
  }
  return blocks;
};

const validateCspAndJsonLdHashes = (html, relPath) => {
  const errors = [];
  const csp = extractCspContent(html);
  if (!csp) {
    errors.push({ kind: 'missing', field: 'csp', file: relPath });
    return errors;
  }

  // HARD rules: no unsafe-inline, and attr directives locked down.
  if (/unsafe-inline/i.test(csp)) errors.push({ kind: 'unsafe-inline', field: 'csp', file: relPath });

  if (!/script-src-attr\s+'none'/i.test(csp)) errors.push({ kind: 'missing', field: 'csp.script-src-attr', file: relPath });
  if (!/style-src-attr\s+'none'/i.test(csp)) errors.push({ kind: 'missing', field: 'csp.style-src-attr', file: relPath });

  // Hash coverage for every inline JSON-LD block (including empty scaffolds).
  const present = new Set((csp.match(/'sha256-[^']+'/g) || []).map((t) => t.trim()));
  const blocks = collectJsonLdBlocks(html);

  for (const b of blocks) {
    const hash = sha256Base64(b.body);
    const token = `'sha256-${hash}'`;
    if (!present.has(token)) {
      errors.push({ kind: 'missing', field: 'csp.hash', file: relPath, id: b.id || '(no id)', token });
    }
  }

  return errors;
};

const validateJsonLdStructure = (html, relPath) => {
  const errors = [];
  const blocks = collectJsonLdBlocks(html);

  for (const b of blocks) {
    // Skip dynamic-jsonld scaffold: runtime fills it; template is empty by design.
    if (b.id === 'dynamic-jsonld') continue;
    if (!b.body) continue;

    let parsed;
    try {
      parsed = JSON.parse(b.body);
    } catch {
      // Parsing errors are already handled elsewhere; don't duplicate here.
      continue;
    }

    const hasContext = (node) => {
      if (!node) return false;
      if (Array.isArray(node)) return node.some(hasContext);
      if (typeof node !== 'object') return false;
      if (node['@context']) return true;
      if (Array.isArray(node['@graph'])) return node['@graph'].some(hasContext);
      return false;
    };

    const hasType = (node) => {
      if (!node) return false;
      if (Array.isArray(node)) return node.some(hasType);
      if (typeof node !== 'object') return false;
      if (node['@type']) return true;
      if (Array.isArray(node['@graph'])) return node['@graph'].some(hasType);
      return false;
    };

    if (!hasContext(parsed)) errors.push({ kind: 'missing', field: 'jsonld.@context', file: relPath, id: b.id || '(no id)' });
    if (!hasType(parsed)) errors.push({ kind: 'missing', field: 'jsonld.@type', file: relPath, id: b.id || '(no id)' });
  }

  return errors;
};

const validatePlaceholders = (html, relPath) => {
  const errors = [];

  // Strip comments + scripts/styles for text scanning.
  const noComments = html.replace(/<!--[\s\S]*?-->/g, '');
  const noScriptStyle = noComments
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  const textOnly = noScriptStyle.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

  const textBad = [
    'coming soon',
    'under construction',
    'lorem ipsum',
    'tbd',
    'todo',
    'your text here',
    'placeholder'
  ];

  for (const needle of textBad) {
    if (textOnly.includes(needle)) errors.push({ kind: 'placeholder-text', field: 'content', file: relPath, value: needle });
  }

  // URL attributes: ellipsis + placeholder-* assets.
  const attrRe = /\b(href|src|content)\s*=\s*["']([^"']+)["']/gi;
  for (const m of noComments.matchAll(attrRe)) {
    const v = String(m[2] || '').trim();
    if (!v) continue;

    const isUrlish = v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/') || v.startsWith('./') || v.startsWith('../');
    if (!isUrlish) continue;

    if (v.includes('…') || v.includes('...')) errors.push({ kind: 'ellipsis-url', field: m[1], file: relPath, value: v });
    if (/placeholder-/i.test(v)) errors.push({ kind: 'placeholder-asset', field: m[1], file: relPath, value: v });
  }

  return errors;
};

const loadData = async () => {
  const dataUrl = pathToFileURL(path.join(ROOT, 'js', 'data.js')).href;
  const utilsUrl = pathToFileURL(path.join(ROOT, 'js', 'utils.js')).href;

  // Publishing inventory is a separate module.
  const publishingUrl = pathToFileURL(path.join(ROOT, 'js', 'publishing-data.js')).href;

  const [{ albums }, { sanitizeTrackId }, { books }] = await Promise.all([
    import(dataUrl),
    import(utilsUrl),
    import(publishingUrl)
  ]);

  return {
    albums: Array.isArray(albums) ? albums : [],
    sanitizeTrackId,
    books: Array.isArray(books) ? books : []
  };
};

const dataIntegrityChecks = (albums, sanitizeTrackId, htmlRelPaths = []) => {
  const errors = [];
  const warnings = [];

  const expectedAlbumPages = new Set();
  const expectedTrackPages = new Set();

  const ids = new Set();
  for (const album of albums) {
    const id = album?.id;
    if (!id) {
      errors.push({ kind: 'album', field: 'id', message: 'Album missing id' });
      continue;
    }
    if (ids.has(id)) errors.push({ kind: 'album', field: 'id', message: `Duplicate album id: ${id}` });
    ids.add(id);

    if (!isPlainObject(album.links)) errors.push({ kind: 'album', field: 'links', message: `Album ${id} missing links object` });

    expectedAlbumPages.add(`music/albums/${id}/index.html`);

    const titles = Array.isArray(album.tracks) ? album.tracks : [];
    const trackIds = new Set();
    for (const t of titles) {
      const tid = sanitizeTrackId(t);
      if (!tid) errors.push({ kind: 'track', field: 'id', message: `Album ${id} has track with empty sanitized id`, trackTitle: String(t) });
      if (trackIds.has(tid)) errors.push({ kind: 'track', field: 'id', message: `Album ${id} has duplicate sanitized track id: ${tid}`, trackTitle: String(t) });
      trackIds.add(tid);
      expectedTrackPages.add(`music/tracks/${id}/${tid}/index.html`);
    }

    if (isPlainObject(album.lyrics)) {
      for (const [tid, meta] of Object.entries(album.lyrics)) {
        if (!isPlainObject(meta)) continue;
        if (!isPlainObject(meta.links)) errors.push({ kind: 'track', field: 'links', message: `Album ${id} track ${tid} missing links object` });
      }
    } else {
      warnings.push({ kind: 'album', field: 'lyrics', message: `Album ${id} has no lyrics object (ok, but track pages may not resolve)` });
    }
  }

  const albumPageRe = /^music\/albums\/[^/]+\/index\.html$/i;
  const trackPageRe = /^music\/tracks\/[^/]+\/[^/]+\/index\.html$/i;

  const actualAlbumPages = new Set(htmlRelPaths.filter((p) => albumPageRe.test(p)));
  const actualTrackPages = new Set(htmlRelPaths.filter((p) => trackPageRe.test(p)));

  for (const expected of expectedAlbumPages) {
    if (!actualAlbumPages.has(expected)) {
      errors.push({ kind: 'album', field: 'static-route', message: `Missing pre-rendered album route: ${expected}` });
    }
  }

  for (const expected of expectedTrackPages) {
    if (!actualTrackPages.has(expected)) {
      errors.push({ kind: 'track', field: 'static-route', message: `Missing pre-rendered track route: ${expected}` });
    }
  }

  for (const actual of actualAlbumPages) {
    if (!expectedAlbumPages.has(actual)) {
      errors.push({ kind: 'album', field: 'orphan-static-route', message: `Orphan pre-rendered album route (not in js/data.js): ${actual}` });
    }
  }

  for (const actual of actualTrackPages) {
    if (!expectedTrackPages.has(actual)) {
      errors.push({ kind: 'track', field: 'orphan-static-route', message: `Orphan pre-rendered track route (not in js/data.js): ${actual}` });
    }
  }

  return { errors, warnings };
};

const pickSampleIds = (albums, sanitizeTrackId, books) => {
  const album = albums.find((a) => a && a.id && Array.isArray(a.tracks) && a.tracks.length > 0) || albums[0];
  if (!album || !album.id) return null;

  const albumId = album.id;
  const trackTitle = (Array.isArray(album.tracks) && album.tracks[0]) ? album.tracks[0] : '';
  const trackId = sanitizeTrackId(trackTitle);

  const firstBook = (Array.isArray(books) ? books : []).find((b) => b && b.id && (b.title || b.subtitle)) || (Array.isArray(books) ? books[0] : null);
  const bookId = safeText(firstBook?.id) || 'unseen-age-v1-before-breath';
  const bookTitle = safeText(firstBook?.title) || '';

  return { albumId, albumTitle: String(album.title || ''), trackId, trackTitle: String(trackTitle || ''), bookId, bookTitle };
};

const runtimeFallbackValidation = async (sample, htmlMap) => {
  const result = {
    mode: 'fallback-static',
    skipped: true,
    pass: true,
    sample,
    checks: [],
    manualChecklist: []
  };

  if (!sample) {
    result.pass = false;
    result.checks.push({ pass: false, label: 'Pick sample IDs', note: 'No album with id found in data.js' });
    return result;
  }

  const { albumId, trackId } = sample;
  const albumUrl = `${SITE_ORIGIN}/album.html?album=${encodeURIComponent(albumId)}`;
  const trackUrl = `${SITE_ORIGIN}/track.html?album=${encodeURIComponent(albumId)}&track=${encodeURIComponent(trackId)}`;

  result.sample.albumUrl = albumUrl;
  result.sample.trackUrl = trackUrl;

  const albumHtml = htmlMap.get('album.html') || '';
  const trackHtml = htmlMap.get('track.html') || '';

  const mustHave = (html, label, re) => {
    const ok = re.test(html);
    result.checks.push({ pass: ok, label });
    if (!ok) result.pass = false;
  };

  mustHave(albumHtml, 'album.html has #dynamic-jsonld scaffold', /id\s*=\s*["']dynamic-jsonld["']/i);
  mustHave(albumHtml, 'album.html has meta[name="twitter:url"] scaffold', /name\s*=\s*["']twitter:url["']/i);
  mustHave(trackHtml, 'track.html has #dynamic-jsonld scaffold', /id\s*=\s*["']dynamic-jsonld["']/i);
  mustHave(trackHtml, 'track.html has meta[name="twitter:url"] scaffold', /name\s*=\s*["']twitter:url["']/i);

  result.checks.push({
    pass: true,
    label: 'Playwright not detected in this environment',
    note: 'Runtime automation skipped here. On your machine: npm i -D playwright && npx playwright install && rerun with --runtime.'
  });

  result.manualChecklist.push(
    `Playwright runtime automation (recommended):`,
    `  1) npm i -D playwright`,
    `  2) npx playwright install`,
    `  3) node tools/dev-check.mjs --strict --strict-a11y-head --runtime`,
    ``,
    `Manual runtime validation (if Playwright is unavailable):`,
    `  1) Start a local static server from repo root (example): npx http-server -p 4173`,
    `  2) Open: http://127.0.0.1:4173/album.html?album=${encodeURIComponent(albumId)}`,
    `     - <title> contains album title`,
    `     - meta description is album-specific`,
    `     - canonical includes ?album=${encodeURIComponent(albumId)}`,
    `     - og:url and twitter:url exactly match canonical (including query)`,
    `     - #dynamic-jsonld contains valid JSON and includes @type MusicAlbum`,
    `  3) Open: http://127.0.0.1:4173/track.html?album=${encodeURIComponent(albumId)}&track=${encodeURIComponent(trackId)}`,
    `     - <title> contains track title`,
    `     - canonical includes both album and track params`,
    `     - og:url and twitter:url exactly match canonical`,
    `     - #dynamic-jsonld contains valid JSON and includes @type MusicRecording`
  );

  return result;
};

const mimeTypeFor = (p) => {
  const ext = path.extname(p).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js' || ext === '.mjs') return 'application/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.txt') return 'text/plain; charset=utf-8';
  return 'application/octet-stream';
};

const startStaticServer = async (rootDir) => {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith('/')) pathname += 'index.html';
      if (pathname === '') pathname = '/index.html';

      const fsPath = path.join(rootDir, pathname.replace(/^\//, ''));
      const normalized = path.normalize(fsPath);
      if (!normalized.startsWith(path.normalize(rootDir))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      const data = await fs.readFile(normalized);
      res.setHeader('Content-Type', mimeTypeFor(normalized));
      // Development server: no aggressive caching.
      res.setHeader('Cache-Control', 'no-store');
      res.writeHead(200);
      res.end(data);
    } catch (e) {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  const port = addr && typeof addr === 'object' ? addr.port : 0;

  return { server, port, origin: `http://127.0.0.1:${port}` };
};

const probeOrigin = async (origin) => {
  const o = safeText(origin).replace(/\/+$/, '');
  if (!o) return { ok: false, note: 'origin not provided' };
  const url = `${o}/index.html`;
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 2500);
    const res = await fetch(url, { method: 'GET', signal: ac.signal, redirect: 'manual' });
    clearTimeout(t);
    // Consider any non-5xx response as "reachable" for our purposes.
    if (res && typeof res.status === 'number' && res.status < 500) return { ok: true, note: `status ${res.status}` };
    return { ok: false, note: `status ${res?.status || 'unknown'}` };
  } catch (e) {
    return { ok: false, note: String(e?.message || e) };
  }
};

const runtimePlaywrightValidation = async (sample, htmlMap) => {
  const result = {
    mode: 'playwright',
    available: false,
    skipped: false,
    pass: true,
    sample,
    checks: []
  };

  if (!sample) {
    result.pass = false;
    result.checks.push({ pass: false, label: 'Pick sample IDs', note: 'No album with id found in data.js' });
    return result;
  }

  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    // Playwright not installed: fall back to deterministic runtime validation + exact manual checklist.
    const fb = await runtimeFallbackValidation(sample, htmlMap || new Map());

    // If you want runtime automation to be REQUIRED (ideal for CI once Playwright is installed),
    // use: --runtime --require-playwright
    const mustHavePlaywright = !!OPTS.requirePlaywright;

    return {
      mode: 'playwright',
      available: false,
      skipped: true,
      pass: mustHavePlaywright ? false : fb.pass,
      sample: fb.sample,
      checks: [
        ...(fb.checks || []),
        ...(mustHavePlaywright ? [{
          pass: false,
          label: 'Playwright required but unavailable',
          note: 'Run: npm install && npx playwright install chromium (or use npm run pw:install:chromium). Then re-run dev-check with --runtime.'
        }] : [{
          pass: true,
          label: 'Playwright unavailable',
          note: 'Install Playwright to enable full --runtime automation: npm install && npx playwright install chromium'
        }])
      ],
      manualChecklist: fb.manualChecklist || [],
      fallback: fb
    };
  }

  result.available = true;

  let server = null;
  let origin = safeText(OPTS.origin).replace(/\/+$/, '');
  if (!origin) {
    const started = await startStaticServer(ROOT);
    server = started.server;
    origin = started.origin;
    result.checks.push({ pass: true, label: 'Runtime automation origin', note: `No --origin provided; using ${origin}` });
  } else {
    const probe = await probeOrigin(origin);
    if (!probe.ok) {
      const started = await startStaticServer(ROOT);
      server = started.server;
      result.checks.push({
        pass: true,
        label: 'Runtime automation origin preflight fallback',
        note: `Provided --origin was unreachable (${probe.note}); using ${started.origin}`
      });
      origin = started.origin;
    }
  }

  const { albumId, trackId, albumTitle, trackTitle, bookId, bookTitle } = sample;
  const albumUrl = `${origin}/album.html?album=${encodeURIComponent(albumId)}`;
  const trackUrl = `${origin}/track.html?album=${encodeURIComponent(albumId)}&track=${encodeURIComponent(trackId)}`;
  const bookUrl = `${origin}/book.html?id=${encodeURIComponent(bookId)}`;

  result.sample.albumUrl = albumUrl;
  result.sample.trackUrl = trackUrl;
  result.sample.bookUrl = bookUrl;

  const { chromium } = playwright;
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
  });
  const page = await context.newPage();

  const assert = (pass, label, note) => {
    result.checks.push({ pass: !!pass, label, note });
    if (!pass) result.pass = false;
  };

  const readMeta = async (selector) => {
    return page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return '';
      return (el.getAttribute('content') || '').trim();
    }, selector);
  };

  const readHref = async (selector) => {
    return page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return '';
      return (el.getAttribute('href') || '').trim();
    }, selector);
  };

  const waitForHydration = async (timeoutMs = 30000) => {
    try {
      await page.waitForFunction(() => {
        const s = document.getElementById('dynamic-jsonld');
        const json = s ? (s.textContent || '').trim() : '';
        const canon = document.querySelector('link[rel=\"canonical\"]')?.getAttribute('href') || '';
        const t = (document.title || '').trim();
        const rt = (window.__TOA_RUNTIME && typeof window.__TOA_RUNTIME === 'object') ? window.__TOA_RUNTIME : null;
        const ready = !!(rt && rt.ready);
        return ready || (json.length > 0) || (t.length > 0 && canon.length > 0);
      }, { timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  };

  const readJsonLd = async () => {
    return page.evaluate(() => {
      const s = document.getElementById('dynamic-jsonld');
      return s ? (s.textContent || '').trim() : '';
    });
  };

  const checkPage = async (kind, url, expect) => {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
    } catch (e) {
      const msg = String(e?.message || e);
      const navFail = (
        msg.includes('net::ERR_') ||
        msg.includes('ERR_CONNECTION_REFUSED') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('ERR_NAME_NOT_RESOLVED')
      );
      if (navFail) throw new Error(`RUNTIME_NAVIGATION_FAILED:${msg}`);
      throw e;
    }
    const ready = await waitForHydration(30000);

    if (!ready) {
      const currentUrl = (page.url && typeof page.url === 'function') ? page.url() : '';
      if (currentUrl && currentUrl.startsWith('chrome-error://')) {
        throw new Error(`RUNTIME_NAVIGATION_FAILED::${kind}::${url}::${currentUrl}`);
      }
      const titleNow = (await page.title()).trim();
      const canonNow = await readHref('link[rel=\"canonical\"]');
      const descNow = await readMeta('meta[name=\"description\"]');
      assert(false, `${kind}: runtime hydration timeout`, `Timed out waiting for hydration. url=${url} title=${titleNow || '(empty)'} canonical=${canonNow || '(empty)'} description=${descNow ? 'present' : '(empty)'}; likely a JS/runtime error. Open the URL in a browser and check DevTools console.`);
      return;
    }

    const title = (await page.title()).trim();
    const desc = await readMeta('meta[name="description"]');
    const canon = await readHref('link[rel="canonical"]');

    const ogUrl = await readMeta('meta[property="og:url"]');
    const twUrl = await readMeta('meta[name="twitter:url"]');

    const jsonText = await readJsonLd();

    assert(!!title, `${kind}: title is non-empty`);
    if (expect.titleIncludes) assert(title.toLowerCase().includes(expect.titleIncludes.toLowerCase()), `${kind}: title includes expected text`, `expected substring: ${expect.titleIncludes}`);

    assert(!!desc, `${kind}: meta description non-empty`);

    assert(!!canon, `${kind}: canonical non-empty`);
    assert(canon.startsWith(SITE_ORIGIN), `${kind}: canonical uses site origin`, canon);

    assert(!!ogUrl, `${kind}: og:url present`);
    assert(ogUrl.startsWith(SITE_ORIGIN), `${kind}: og:url uses site origin`, ogUrl);

    assert(!!twUrl, `${kind}: twitter:url present`);
    assert(twUrl.startsWith(SITE_ORIGIN), `${kind}: twitter:url uses site origin`, twUrl);

    if (expect.canonicalMustInclude) {
      assert(canon.includes(expect.canonicalMustInclude), `${kind}: canonical includes query`, expect.canonicalMustInclude);
      assert(ogUrl.includes(expect.canonicalMustInclude), `${kind}: og:url includes query`, expect.canonicalMustInclude);
      assert(twUrl.includes(expect.canonicalMustInclude), `${kind}: twitter:url includes query`, expect.canonicalMustInclude);
    }


    // Consistency: canonical / og:url / twitter:url should match exactly
    assert(canon === ogUrl, `${kind}: og:url matches canonical`, `canonical: ${canon} og:url: ${ogUrl}`);
    assert(canon === twUrl, `${kind}: twitter:url matches canonical`, `canonical: ${canon} twitter:url: ${twUrl}`);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
      assert(true, `${kind}: dynamic JSON-LD parses as JSON`);
    } catch (e) {
      assert(false, `${kind}: dynamic JSON-LD parses as JSON`, String(e?.message || e));
      return;
    }

    // Schema type check (support object, array, and @graph)
    const types = new Set();
    const addType = (t) => {
      if (!t) return;
      if (Array.isArray(t)) t.forEach((x) => types.add(String(x)));
      else types.add(String(t));
    };

    const walkNode = (node) => {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach(walkNode);
        return;
      }
      if (typeof node !== 'object') return;
      addType(node['@type']);
      // Common patterns
      if (Array.isArray(node['@graph'])) node['@graph'].forEach(walkNode);
      if (Array.isArray(node['itemListElement'])) node['itemListElement'].forEach(walkNode);
      if (Array.isArray(node['hasPart'])) node['hasPart'].forEach(walkNode);
      if (Array.isArray(node['workExample'])) node['workExample'].forEach(walkNode);
    };

    walkNode(parsed);

    assert(types.has(expect.schemaType), `${kind}: JSON-LD includes @type ${expect.schemaType}`, `types: ${[...types].join(', ')}`);  };

  const runChecks = async () => {
    await checkPage('ALBUM', albumUrl, {
      titleIncludes: albumTitle || albumId,
      canonicalMustInclude: `?album=${encodeURIComponent(albumId)}`,
      schemaType: 'MusicAlbum'
    });

    await checkPage('TRACK', trackUrl, {
      titleIncludes: trackTitle || trackId,
      canonicalMustInclude: `?album=${encodeURIComponent(albumId)}&track=${encodeURIComponent(trackId)}`,
      schemaType: 'MusicRecording'
    });

    await checkPage('BOOK', bookUrl, {
      titleIncludes: bookTitle || '',
      canonicalMustInclude: `?id=${encodeURIComponent(bookId)}`,
      schemaType: 'Book'
    });
  };

  try {
    await runChecks();
  } catch (e) {
    const msg = String(e?.message || e);

    // If a user-provided --origin cannot be reached by the Playwright browser context,
    // retry once using the internal ephemeral server (127.0.0.1).
    if (msg.startsWith('RUNTIME_NAVIGATION_FAILED') && OPTS.origin) {
      try {
        const started = await startStaticServer(ROOT);
        server = started.server;
        origin = started.origin;

        const albumUrl2 = `${origin}/album.html?album=${encodeURIComponent(albumId)}`;
        const trackUrl2 = `${origin}/track.html?album=${encodeURIComponent(albumId)}&track=${encodeURIComponent(trackId)}`;
        const bookUrl2 = `${origin}/book.html?id=${encodeURIComponent(bookId)}`;

        result.sample.albumUrl = albumUrl2;
        result.sample.trackUrl = trackUrl2;
        result.sample.bookUrl = bookUrl2;

        assert(true, 'Runtime automation origin fallback', `Provided origin was not reachable in Playwright. Retried with internal server: ${origin}`);
        // overwrite URLs used by runChecks
        await checkPage('ALBUM', albumUrl2, {
          titleIncludes: albumTitle || albumId,
          canonicalMustInclude: `?album=${encodeURIComponent(albumId)}`,
          schemaType: 'MusicAlbum'
        });

        await checkPage('TRACK', trackUrl2, {
          titleIncludes: trackTitle || trackId,
          canonicalMustInclude: `?album=${encodeURIComponent(albumId)}&track=${encodeURIComponent(trackId)}`,
          schemaType: 'MusicRecording'
        });

        await checkPage('BOOK', bookUrl2, {
          titleIncludes: bookTitle || '',
          canonicalMustInclude: `?id=${encodeURIComponent(bookId)}`,
          schemaType: 'Book'
        });
      } catch (e2) {
        assert(false, 'Runtime automation', `Origin fallback also failed: ${String(e2?.message || e2)}`);
      }
    } else {
      assert(false, 'Runtime automation', msg);
    }
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    if (server) await new Promise((resolve) => server.close(resolve));
  }

  return result;
};

const main = async () => {
  await ensureDir(REPORT_DIR);

  const all = await walk(ROOT);
  const htmlFiles = all.filter((p) => p.toLowerCase().endsWith('.html'));

  const htmlMap = new Map();
  const perFile = [];
  const jsonldErrors = [];

  let errorCount = 0;
  let warnCount = 0;

  for (const f of htmlFiles) {
    const relPath = path.relative(ROOT, f).replace(/\\/g, '/');
    const html = await readText(f);
    htmlMap.set(relPath, html);

    const meta = checkHtmlMeta(html, relPath, OPTS);
    const errors = [...(meta.errors || [])];
    const warnings = [...(meta.warnings || [])];

    const ldErrors = parseJsonLdBlocks(html, relPath);

    // P0 audit-closure validations (CSP + JSON-LD hash coverage + placeholder detection + JSON-LD structure)
    const cspErrors = validateCspAndJsonLdHashes(html, relPath);
    const jsonldStructureErrors = validateJsonLdStructure(html, relPath);
    const placeholderErrors = validatePlaceholders(html, relPath);

    errors.push(...cspErrors, ...jsonldStructureErrors, ...placeholderErrors);

    perFile.push({
      file: relPath,
      errors,
      warnings,
      jsonldErrors: ldErrors
    });

    errorCount += errors.length + ldErrors.length;
    warnCount += warnings.length;

    jsonldErrors.push(...ldErrors);
  }

  // Data integrity + runtime selection
  let dataIntegrity = { errors: [], warnings: [] };
  let runtimeValidation = { mode: 'none', pass: true, checks: [] };

  try {
    const { albums, sanitizeTrackId, books } = await loadData();
    const htmlRelPaths = htmlFiles
      .map((p) => path.relative(ROOT, p).replace(/\\/g, '/'));
    dataIntegrity = dataIntegrityChecks(albums, sanitizeTrackId, htmlRelPaths);
    errorCount += dataIntegrity.errors.length;
    warnCount += dataIntegrity.warnings.length;

    const sample = pickSampleIds(albums, sanitizeTrackId, books);

    if (OPTS.runtime) runtimeValidation = await runtimePlaywrightValidation(sample, htmlMap);
    else runtimeValidation = await runtimeFallbackValidation(sample, htmlMap);

    if (runtimeValidation && runtimeValidation.pass === false) errorCount += 1;
  } catch (e) {
    dataIntegrity.errors.push({ kind: 'import', message: `Failed to import data.js/utils.js for integrity checks: ${String(e?.message || e)}` });
    errorCount += 1;
    runtimeValidation = {
      mode: OPTS.runtime ? 'playwright' : 'fallback-static',
      pass: false,
      checks: [{ pass: false, label: 'Runtime validation', note: 'Import failed; cannot select sample IDs.' }]
    };
  }

  const pass = (errorCount === 0) && (!OPTS.ci || warnCount === 0);

  const report = {
    tool: 'tools/dev-check.mjs',
    generatedAt: NOW.toISOString(),
    root: ROOT,
    options: OPTS,
    pass,
    totals: {
      htmlFiles: htmlFiles.length,
      errors: errorCount,
      warnings: warnCount,
      jsonLdErrors: jsonldErrors.length
    },
    perFile,
    dataIntegrity,
    runtimeValidation
  };

  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  // Console output
  const status = pass ? 'PASS' : 'FAIL';
  console.log(`\n[Dev-Check] ${status}`);
  console.log(`Mode:       ${OPTS.strict ? 'STRICT' : 'DEFAULT'}${OPTS.strictA11yHead ? ' + A11Y_HEAD' : ''}${OPTS.strictNoInlineStyle ? ' + NO_INLINE_STYLE' : ''}${OPTS.strictNoInlineHandler ? ' + NO_INLINE_HANDLER' : ''}${OPTS.runtime ? ' + RUNTIME' : ''}${OPTS.ci ? ' + CI' : ''}${OPTS.requirePlaywright ? ' + REQUIRE_PLAYWRIGHT' : ''}`);
  console.log(`HTML files: ${htmlFiles.length}`);
  console.log(`Errors:     ${errorCount}`);
  console.log(`Warnings:   ${warnCount}`);
  console.log(`Report:     ${path.relative(ROOT, REPORT_PATH).replace(/\\/g, '/')}`);
  console.log('');

  if (!pass) {
    if (OPTS.ci) process.exit(1);
    process.exitCode = 1;
  }
};

main().catch((e) => {
  console.error('[Dev-Check] FAIL (unhandled error)');
  console.error(e);
  process.exitCode = 1;
});
