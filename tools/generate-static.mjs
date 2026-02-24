/* tools/generate-static.mjs
   Canonical static page generator + sitemap + footer normalization + head/meta audit.

   Generates:
   - /music/albums/<album>/index.html
   - /music/tracks/<album>/<track>/index.html
   - /publishing/books/<book>/index.html

   Inputs:
   - js/data.js
   - js/publishing-data.js

   Also:
   - Standardizes footer across all HTML files
   - Normalizes legacy query links to canonical folder routes (legacy templates remain functional)
   - Generates sitemap.xml from canonical URLs + lyrics TXT files (no query-string URLs)
   - Head/meta cleanup: dedupe title and description; align og:url & twitter:url to canonical
   - CSP maintenance: regenerates sha256 hashes for every inline JSON-LD block

   Run:
   node tools/generate-static.mjs
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SITE_ORIGIN = 'https://www.triadofangels.com';

const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.github', '.lighthouseci', 'reports', 'lighthouse']);

// Exclude legacy dynamic templates from sitemap even if they have canonicals (canonical set should be the folder routes).
const TEMPLATE_EXCLUDES = new Set(['album.html', 'track.html', 'book.html']);

const FOOTER_BLOCK = `<footer role="contentinfo" aria-label="Site footer">
    <p>© <span id="year"></span> Triad of Angels &amp; ToA Studios</p>
    <nav aria-label="Footer navigation">
      <ul>
        <li><a href="/privacy.html">Privacy</a></li>
        <li><a href="/terms.html">Terms</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </nav>
    <div class="divider" aria-hidden="true"></div>
    <div class="social-links" aria-label="Social media links">
      <a href="https://open.spotify.com" rel="noopener noreferrer" target="_blank">Spotify</a>
      <a href="https://music.apple.com" rel="noopener noreferrer" target="_blank">Apple Music</a>
      <a href="https://music.youtube.com" rel="noopener noreferrer" target="_blank">YouTube Music</a>
      <a href="https://www.youtube.com" rel="noopener noreferrer" target="_blank">YouTube</a>
      <a href="https://linktr.ee" rel="noopener noreferrer" target="_blank">Linktree</a>
    </div>
  </footer>`;

const sha256Base64 = (txt) => crypto.createHash('sha256').update(String(txt ?? ''), 'utf8').digest('base64');

const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const escapeAttr = (s) => escapeHtml(s);

function rewriteRelativeAssetUrlsToRootAbsolute(html) {
  // Convert common asset refs that are relative (no leading slash, no http)
  // to root-absolute so pages work from any depth.

  // href="css/..." -> href="/css/..." etc
  html = html.replace(/\bhref=(['"])(?!https?:\/\/|\/|#|mailto:|tel:)(css\/[^"']+)\1/gi, (m, q, p) => `href=${q}/${p}${q}`);
  html = html.replace(/\bhref=(['"])(?!https?:\/\/|\/|#|mailto:|tel:)(assets\/[^"']+)\1/gi, (m, q, p) => `href=${q}/${p}${q}`);
  html = html.replace(/\bhref=(['"])(?!https?:\/\/|\/|#|mailto:|tel:)(images\/[^"']+)\1/gi, (m, q, p) => `href=${q}/${p}${q}`);
  html = html.replace(/\bhref=(['"])(?!https?:\/\/|\/|#|mailto:|tel:)(fonts\/[^"']+)\1/gi, (m, q, p) => `href=${q}/${p}${q}`);

  // src="js/..." -> src="/js/..." etc
  html = html.replace(/\bsrc=(['"])(?!https?:\/\/|\/|data:)(js\/[^"']+)\1/gi, (m, q, p) => `src=${q}/${p}${q}`);
  html = html.replace(/\bsrc=(['"])(?!https?:\/\/|\/|data:)(assets\/[^"']+)\1/gi, (m, q, p) => `src=${q}/${p}${q}`);
  html = html.replace(/\bsrc=(['"])(?!https?:\/\/|\/|data:)(images\/[^"']+)\1/gi, (m, q, p) => `src=${q}/${p}${q}`);

  return html;
}

function enc(s) {
  return encodeURIComponent(String(s || '').trim());
}
function albumCanonicalPath(albumId) {
  return `/music/albums/${enc(albumId)}/`;
}
function trackCanonicalPath(albumId, trackId) {
  return `/music/tracks/${enc(albumId)}/${enc(trackId)}/`;
}
function bookCanonicalPath(bookId) {
  return `/publishing/books/${enc(bookId)}/`;
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.well-known') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      yield* walk(full);
    } else if (e.isFile()) {
      yield full;
    }
  }
}

function replaceFooter(html) {
  const footerRe = /<footer\b[\s\S]*?<\/footer>/i;
  if (footerRe.test(html)) return html.replace(footerRe, FOOTER_BLOCK);
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${FOOTER_BLOCK}\n</body>`);
  return `${html}\n${FOOTER_BLOCK}\n`;
}

function normalizeLegacyLinks(html) {
  // album.html?album=<id> or album.html?id=<id>
  html = html.replace(/(['"])\/?album\.html\?(?:album|id)=([^"'&#]+)([^"']*)\1/g, (m, q, id) => `${q}${albumCanonicalPath(id)}${q}`);
  // book.html?id=<id>
  html = html.replace(/(['"])\/?book\.html\?id=([^"'&#]+)([^"']*)\1/g, (m, q, id) => `${q}${bookCanonicalPath(id)}${q}`);
  // track.html?album=<a>&track=<t>
  html = html.replace(/(['"])\/?track\.html\?([^"']+)\1/g, (m, q, qs) => {
    try {
      const u = new URL(`${SITE_ORIGIN}/track.html?${qs}`);
      const a = u.searchParams.get('album');
      const t = u.searchParams.get('track');
      if (a && t) return `${q}${trackCanonicalPath(a, t)}${q}`;
    } catch {
      // ignore
    }
    return m;
  });
  return html;
}

function dedupeHead(html) {
  // TITLE (allow attributes)
  const titleTags = [...html.matchAll(/<title\b[^>]*>[\s\S]*?<\/title>/gi)];
  if (titleTags.length > 1) {
    // Prefer keeping the dynamic scaffold if present (id="dynamic-title"); else keep the first.
    const keepIndex = (() => {
      const idx = titleTags.findIndex((m) => /\bid\s*=\s*['"]dynamic-title['"]/i.test(m[0] || ''));
      return idx >= 0 ? idx : 0;
    })();

    let i = 0;
    html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, (m) => {
      const out = (i === keepIndex) ? m : '';
      i++;
      return out;
    });
  }

  // META DESCRIPTION
  const descTags = [...html.matchAll(/<meta\b[^>]*\bname\s*=\s*['"]description['"][^>]*>/gi)];
  if (descTags.length > 1) {
    let first = true;
    html = html.replace(/<meta\b[^>]*\bname\s*=\s*['"]description['"][^>]*>/gi, (m) => {
      if (first) {
        first = false;
        return m;
      }
      return '';
    });
  }

  return html;
}

function extractCanonical(html) {
  const m = html.match(/<link\b[^>]*\brel\s*=\s*['"]canonical['"][^>]*\bhref\s*=\s*['"]([^"']+)['"][^>]*>/i);
  return m ? m[1] : '';
}

function upsertCanonical(html, hrefAbs) {
  const re = /<link\b[^>]*\brel\s*=\s*['"]canonical['"][^>]*>/i;
  const tag = `<link rel="canonical" href="${escapeAttr(hrefAbs)}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/title>/i, `</title>\n    ${tag}`);
}

function alignOgTwitterUrl(html) {
  const canon = extractCanonical(html);
  if (!canon) return html;
  html = html.replace(/<meta\b[^>]*\bproperty\s*=\s*['"]og:url['"][^>]*>/i, `<meta property="og:url" content="${escapeAttr(canon)}">`);
  html = html.replace(/<meta\b[^>]*\bname\s*=\s*['"]twitter:url['"][^>]*>/i, `<meta name="twitter:url" content="${escapeAttr(canon)}">`);
  return html;
}

function setTitle(html, title) {
  const safe = escapeHtml(title);

  // Prefer the dynamic scaffold (<title id="dynamic-title">)
  const dynRe = /(<title\b[^>]*\bid\s*=\s*['"]dynamic-title['"][^>]*>)[\s\S]*?<\/title>/i;
  if (dynRe.test(html)) return html.replace(dynRe, `$1${safe}</title>`);

  // Otherwise replace the first title (allow attributes)
  const anyRe = /(<title\b[^>]*>)[\s\S]*?<\/title>/i;
  if (anyRe.test(html)) return html.replace(anyRe, `$1${safe}</title>`);

  // Fallback insert
  return html.replace(/<head\b[^>]*>/i, (m) => `${m}\n    <title>${safe}</title>`);
}

function setDescription(html, desc) {
  const safe = escapeAttr(desc);
  const re = /<meta\b[^>]*\bname\s*=\s*['"]description['"][^>]*>/i;
  const tag = `<meta name="description" content="${safe}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/title>/i, `</title>\n    ${tag}`);
}

function upsertMeta(html, attr, key, content) {
  const escKey = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const re = new RegExp(`<meta\\b[^>]*\\b${attr}\\s*=\\s*['"]${escKey}['"][^>]*>`, 'i');
  const tag = `<meta ${attr}="${escapeAttr(key)}" content="${escapeAttr(content)}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/title>/i, `</title>\n    ${tag}`);
}

function setJsonLd(html, obj) {
  // IMPORTANT: no leading/trailing whitespace inside the <script> body.
  // This makes CSP hashing deterministic and browser-correct.
  const json = JSON.stringify(obj);

  const dynRe = /<script\b[^>]*\bid\s*=\s*['"]dynamic-jsonld['"][^>]*type\s*=\s*['"]application\/ld\+json['"][^>]*>[\s\S]*?<\/script>/i;
  const dynReAlt = /<script\b[^>]*type\s*=\s*['"]application\/ld\+json['"][^>]*\bid\s*=\s*['"]dynamic-jsonld['"][^>]*>[\s\S]*?<\/script>/i;

  if (dynRe.test(html)) {
    return html.replace(dynRe, `<script type="application/ld+json" id="dynamic-jsonld">${json}</script>`);
  }
  if (dynReAlt.test(html)) {
    return html.replace(dynReAlt, `<script type="application/ld+json" id="dynamic-jsonld">${json}</script>`);
  }

  return html.replace(/<\/head>/i, `  <script type="application/ld+json" id="dynamic-jsonld">${json}</script>\n</head>`);
}

function updateCspHashesForInlineJsonLd(html) {
  // Ensures script-src contains sha256 hashes for EVERY inline JSON-LD block.
  // Hashing MUST match tools/dev-check.mjs:
  // - body is trimmed before hashing.

  const blocks = [...html.matchAll(/<script\b([^>]*)type\s*=\s*['"]application\/ld\+json['"]([^>]*)>([\s\S]*?)<\/script>/gi)]
    .map((m) => (m?.[3] ?? '').trim());

  if (blocks.length === 0) return html;

  const hashTokens = Array.from(new Set(blocks.map((b) => `'sha256-${sha256Base64(b)}'`)));

  const metaRe = /(<meta\b[^>]*http-equiv\s*=\s*['"]Content-Security-Policy['"][^>]*\bcontent\s*=\s*)(['"])([^]*?)(\2)([^>]*>)/i;
  const m = metaRe.exec(html);
  if (!m) return html;

  const prefix = m[1];
  const quote = m[2];
  const csp = String(m[3] || '').trim();
  const suffix = m[5];

  const parts = csp
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean);

  let hadScriptSrc = false;
  const nextParts = parts.map((p) => {
    const isScriptSrc = /^script-src\b/i.test(p);
    if (!isScriptSrc) return p;

    hadScriptSrc = true;
    const toks = p.split(/\s+/).filter(Boolean);
    const name = toks.shift() || 'script-src';
    const nonHash = toks.filter((t) => !/^'sha256-/i.test(t));

    // Preserve existing non-hash tokens (and their order), then append required hashes.
    const seen = new Set();
    const merged = [];
    for (const t of nonHash) {
      if (seen.has(t)) continue;
      seen.add(t);
      merged.push(t);
    }
    for (const h of hashTokens) {
      if (seen.has(h)) continue;
      seen.add(h);
      merged.push(h);
    }

    return `${name} ${merged.join(' ')}`.trim();
  });

  if (!hadScriptSrc) {
    // Extremely defensive fallback: add script-src with self + hashes.
    nextParts.push(`script-src 'self' ${hashTokens.join(' ')}`.trim());
  }

  const nextCsp = `${nextParts.join('; ')};`;
  return html.replace(metaRe, `${prefix}${quote}${nextCsp}${quote}${suffix}`);
}

function pickAlbums(mod) {
  return mod.albums || mod.ALBUMS || mod.MUSIC_ALBUMS || mod.MUSIC_LIBRARY?.albums || mod.LIBRARY?.albums || [];
}
function pickBooks(mod) {
  return mod.books || mod.BOOKS || mod.PUBLISHING_BOOKS || mod.PUBLISHING_LIBRARY?.books || mod.LIBRARY?.books || [];
}
function rawTracks(album) {
  return album?.tracks || album?.tracklist || album?.songs || album?.items || [];
}
function sanitizeTrackIdShared(input = '') {
  const s0 = String(input ?? '').trim().toLowerCase();
  if (!s0) return '';

  // Normalize unicode and remove diacritics (match js/utils.js).
  let s = s0.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  s = s
    .replace(/[’'`]/g, '')                 // apostrophes
    .replace(/[“”"]/g, '')                 // quotes
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ');

  s = s
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return s;
}
function normalizeTracks(album) {
  const t = rawTracks(album);
  if (!Array.isArray(t)) return [];
  return t
    .map((x) => {
      if (typeof x === 'string') return { id: sanitizeTrackIdShared(x), title: x };
      const title = x?.title || x?.name || '';
      const id = x?.id || x?.slug || (title ? sanitizeTrackIdShared(title) : '');
      return { ...x, id, title: x?.title || x?.name || title };
    })
    .filter((x) => x && x.id);
}
function clampDesc(s, max = 180) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trim() + '…';
}

function albumJsonLd(album) {
  const id = album?.id || album?.slug || '';
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: album?.title || album?.name || 'Album',
    url: `${SITE_ORIGIN}${albumCanonicalPath(id)}`,
    byArtist: { '@type': 'MusicGroup', name: album?.artist || 'Triad of Angels' },
    track: normalizeTracks(album).map((t, i) => ({
      '@type': 'MusicRecording',
      name: t?.title || `Track ${i + 1}`,
      url: `${SITE_ORIGIN}${trackCanonicalPath(id, t.id)}`,
      position: i + 1,
    })),
  };
}
function trackJsonLd(album, track) {
  const aid = album?.id || album?.slug || '';
  const tid = track?.id || track?.slug || '';
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: track?.title || track?.name || 'Track',
    url: `${SITE_ORIGIN}${trackCanonicalPath(aid, tid)}`,
    byArtist: { '@type': 'MusicGroup', name: track?.artist || album?.artist || 'Triad of Angels' },
    inAlbum: {
      '@type': 'MusicAlbum',
      name: album?.title || album?.name || 'Album',
      url: `${SITE_ORIGIN}${albumCanonicalPath(aid)}`,
    },
  };
}
function bookJsonLd(book) {
  const id = book?.id || book?.slug || '';
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book?.title || book?.name || 'Book',
    url: `${SITE_ORIGIN}${bookCanonicalPath(id)}`,
    author: { '@type': 'Organization', name: book?.author || 'ToA Studios Publishing' },
    publisher: { '@type': 'Organization', name: book?.publisher || 'ToA Studios Publishing' },
    description: book?.description || book?.blurb || undefined,
  };
}

async function standardizeCoreHtml() {
  let changed = 0;

  for await (const f of walk(ROOT)) {
    if (!f.endsWith('.html')) continue;
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');

    const prev = await fs.readFile(f, 'utf8');
    let html = prev;

    html = replaceFooter(html);
    html = normalizeLegacyLinks(html);
    html = rewriteRelativeAssetUrlsToRootAbsolute(html);

    if (!extractCanonical(html)) {
      const canon =
        rel === 'index.html' ? `${SITE_ORIGIN}/` :
        rel === 'search/index.html' ? `${SITE_ORIGIN}/search/` :
        rel.endsWith('/index.html') ? `${SITE_ORIGIN}/${rel.slice(0, -'/index.html'.length)}/` :
        `${SITE_ORIGIN}/${rel}`;

      html = upsertCanonical(html, canon);
      html = upsertMeta(html, 'property', 'og:url', canon);
      html = upsertMeta(html, 'name', 'twitter:url', canon);
    }

    html = alignOgTwitterUrl(html);
    html = dedupeHead(html);
    html = updateCspHashesForInlineJsonLd(html);

    if (prev !== html) {
      await fs.writeFile(f, html, 'utf8');
      changed++;
    }
  }

  return changed;
}

async function generateStaticPages() {
  const musicMod = await import(pathToFileURL(path.join(ROOT, 'js', 'data.js')).href);
  const pubMod = await import(pathToFileURL(path.join(ROOT, 'js', 'publishing-data.js')).href);

  const albums = pickAlbums(musicMod);
  const books = pickBooks(pubMod);

  const albumTpl = await fs.readFile(path.join(ROOT, 'album.html'), 'utf8');
  const trackTpl = await fs.readFile(path.join(ROOT, 'track.html'), 'utf8');
  const bookTpl = await fs.readFile(path.join(ROOT, 'book.html'), 'utf8');

  const counts = { albums: 0, tracks: 0, books: 0 };

  for (const album of albums) {
    const aid = album?.id || album?.slug;
    if (!aid) continue;

    const out = path.join(ROOT, 'music', 'albums', aid, 'index.html');
    await fs.mkdir(path.dirname(out), { recursive: true });

    const canon = `${SITE_ORIGIN}${albumCanonicalPath(aid)}`;
    const title = `${album?.title || album?.name || 'Album'} — Album | Triad of Angels`;
    const desc = clampDesc(album?.description || album?.blurb || `Official album page: ${album?.title || aid}.`);

    let html = albumTpl;

    html = setTitle(html, title);
    html = setDescription(html, desc);
    html = upsertCanonical(html, canon);
    html = upsertMeta(html, 'property', 'og:url', canon);
    html = upsertMeta(html, 'property', 'og:title', title);
    html = upsertMeta(html, 'property', 'og:description', desc);
    html = upsertMeta(html, 'name', 'twitter:url', canon);
    html = upsertMeta(html, 'name', 'twitter:title', title);
    html = upsertMeta(html, 'name', 'twitter:description', desc);
    html = setJsonLd(html, albumJsonLd(album));

    html = replaceFooter(html);
    html = normalizeLegacyLinks(html);
    html = rewriteRelativeAssetUrlsToRootAbsolute(html);
    html = dedupeHead(html);
    html = alignOgTwitterUrl(html);
    html = updateCspHashesForInlineJsonLd(html);

    await fs.writeFile(out, html, 'utf8');
    counts.albums++;

    for (const track of normalizeTracks(album)) {
      const tid = track?.id || track?.slug;
      if (!tid) continue;

      const outT = path.join(ROOT, 'music', 'tracks', aid, tid, 'index.html');
      await fs.mkdir(path.dirname(outT), { recursive: true });

      const canonT = `${SITE_ORIGIN}${trackCanonicalPath(aid, tid)}`;
      const tTitle = `${track?.title || track?.name || 'Track'} — ${album?.title || album?.name || 'Album'} | Triad of Angels`;
      const tDesc = clampDesc(track?.description || album?.description || `Official track page: ${track?.title || tid}.`);

      let th = trackTpl;

      th = setTitle(th, tTitle);
      th = setDescription(th, tDesc);
      th = upsertCanonical(th, canonT);
      th = upsertMeta(th, 'property', 'og:url', canonT);
      th = upsertMeta(th, 'property', 'og:title', tTitle);
      th = upsertMeta(th, 'property', 'og:description', tDesc);
      th = upsertMeta(th, 'name', 'twitter:url', canonT);
      th = upsertMeta(th, 'name', 'twitter:title', tTitle);
      th = upsertMeta(th, 'name', 'twitter:description', tDesc);
      th = setJsonLd(th, trackJsonLd(album, track));

      th = replaceFooter(th);
      th = normalizeLegacyLinks(th);
      th = rewriteRelativeAssetUrlsToRootAbsolute(th);
      th = dedupeHead(th);
      th = alignOgTwitterUrl(th);
      th = updateCspHashesForInlineJsonLd(th);

      await fs.writeFile(outT, th, 'utf8');
      counts.tracks++;
    }
  }

  for (const book of books) {
    const bid = book?.id || book?.slug;
    if (!bid) continue;

    const out = path.join(ROOT, 'publishing', 'books', bid, 'index.html');
    await fs.mkdir(path.dirname(out), { recursive: true });

    const canon = `${SITE_ORIGIN}${bookCanonicalPath(bid)}`;
    const title = `${book?.title || book?.name || 'Book'} — Publishing | Triad of Angels`;
    const desc = clampDesc(book?.description || book?.blurb || `Official book page: ${book?.title || bid}.`);

    let html = bookTpl;

    html = setTitle(html, title);
    html = setDescription(html, desc);
    html = upsertCanonical(html, canon);
    html = upsertMeta(html, 'property', 'og:url', canon);
    html = upsertMeta(html, 'property', 'og:title', title);
    html = upsertMeta(html, 'property', 'og:description', desc);
    html = upsertMeta(html, 'name', 'twitter:url', canon);
    html = upsertMeta(html, 'name', 'twitter:title', title);
    html = upsertMeta(html, 'name', 'twitter:description', desc);
    html = setJsonLd(html, bookJsonLd(book));

    html = replaceFooter(html);
    html = normalizeLegacyLinks(html);
    html = rewriteRelativeAssetUrlsToRootAbsolute(html);
    html = dedupeHead(html);
    html = alignOgTwitterUrl(html);
    html = updateCspHashesForInlineJsonLd(html);

    await fs.writeFile(out, html, 'utf8');
    counts.books++;
  }

  return counts;
}

function shouldIncludeCanonical(canon) {
  if (!canon) return false;
  if (canon.includes('?')) return false;
  for (const t of TEMPLATE_EXCLUDES) {
    if (canon.endsWith('/' + t) || canon.includes('/' + t + '?')) return false;
  }
  return true;
}

async function generateSitemap() {
  const canonSet = new Set();

  for await (const f of walk(ROOT)) {
    if (!f.endsWith('.html')) continue;
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    if (rel === '404.html') continue;

    const html = await fs.readFile(f, 'utf8');
    const canon =
      extractCanonical(html) ||
      (rel === 'index.html' ? `${SITE_ORIGIN}/` :
       rel === 'search/index.html' ? `${SITE_ORIGIN}/search/` :
       rel.endsWith('/index.html') ? `${SITE_ORIGIN}/${rel.slice(0, -'/index.html'.length)}/` :
       `${SITE_ORIGIN}/${rel}`);

    if (!shouldIncludeCanonical(canon)) continue;
    canonSet.add(canon);
  }

  const urls = Array.from(canonSet).sort();
  const lastmod = new Date().toISOString().slice(0, 10);

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`;

  await fs.writeFile(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
  return urls.length;
}

async function finalHeadCleanup() {
  let changed = 0;

  for await (const f of walk(ROOT)) {
    if (!f.endsWith('.html')) continue;
    const prev = await fs.readFile(f, 'utf8');
    let html = prev;

    html = normalizeLegacyLinks(html);
    html = replaceFooter(html);
    html = rewriteRelativeAssetUrlsToRootAbsolute(html);
    html = dedupeHead(html);
    html = alignOgTwitterUrl(html);
    html = updateCspHashesForInlineJsonLd(html);

    if (html !== prev) {
      await fs.writeFile(f, html, 'utf8');
      changed++;
    }
  }

  return changed;
}

async function main() {
  console.log('TOA generate-static: start');

  const core = await standardizeCoreHtml();
  console.log(`• Standardized core HTML: ${core} file(s) changed`);

  const counts = await generateStaticPages();
  console.log(`• Generated: albums=${counts.albums}, tracks=${counts.tracks}, books=${counts.books}`);

  const head = await finalHeadCleanup();
  console.log(`• Head/meta cleanup: ${head} file(s) adjusted`);

  const sm = await generateSitemap();
  console.log(`• sitemap.xml: ${sm} URL(s)`);

  console.log('TOA generate-static: DONE');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
