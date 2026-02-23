// js/album.js — Album detail page controller (ESM)
// - Supports canonical folder routes and legacy query templates.
// - Renders album meta + tracklist from js/data.js.
// - Updates head/meta and injects JSON-LD (runtime) for correctness.

import * as MusicData from './data.js';
import { sanitizeTrackId } from './utils.js';
import { SITE_ORIGIN, getAlbumId, albumCanonicalAbs, albumCanonicalPath, trackCanonicalPath, trackCanonicalAbs } from './routes.js';
import { applyAlbumCoverVariants } from './variants.js';

import {
  $,
  clear,
  el,
  safeText,
  setTitle,
  setCanonical,
  setMetaName,
  setMetaProperty,
  injectJsonLd,
  absolutizeMaybe,
  clampDescription,
} from './music-ui.js';

const DEFAULT_ART = '/assets/images/og/og-album.webp';

function pickAlbums(mod) {
  if (Array.isArray(mod?.albums)) return mod.albums;
  if (Array.isArray(mod?.default?.albums)) return mod.default.albums;
  if (Array.isArray(mod?.ALBUMS)) return mod.ALBUMS;
  return [];
}

function asString(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function ensureSitePath(pathOrUrl) {
  const s = asString(pathOrUrl);
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/')) return s;
  return `/${s.replace(/^\/+/, '')}`;
}

function normalizeGenre(genre) {
  if (Array.isArray(genre)) return genre.map((g) => asString(g)).filter(Boolean).join(', ');
  return asString(genre);
}

function normalizeTracks(album) {
  const raw = album?.tracks;
  if (Array.isArray(raw)) {
    return raw
      .map((t) => {
        if (typeof t === 'string') {
          const title = t.trim();
          const id = sanitizeTrackId(title);
          return { id, title };
        }
        if (t && typeof t === 'object') {
          const title = asString(t.title || t.name);
          const id = asString(t.id || t.slug) || (title ? sanitizeTrackId(title) : '');
          return { id, title, ...t };
        }
        return null;
      })
      .filter(Boolean);
  }
  return [];
}

function getLyricsEntry(album, trackId) {
  const lyrics = album?.lyrics && typeof album.lyrics === 'object' ? album.lyrics : null;
  if (!lyrics) return null;
  const direct = lyrics[trackId];
  if (direct) return direct;
  // Sometimes keys may be un-sanitized; attempt a light scan.
  const key = Object.keys(lyrics).find((k) => sanitizeTrackId(k) === trackId);
  return key ? lyrics[key] : null;
}

function orderedStreamLinks(links) {
  const src = links && typeof links === 'object' ? links : {};
  const ORDER = [
    ['spotify', 'Spotify'],
    ['appleMusic', 'Apple Music'],
    ['youTubeMusic', 'YouTube Music'],
    ['amazonMusic', 'Amazon Music'],
    ['tidal', 'TIDAL'],
    ['deezer', 'Deezer'],
    ['boomplay', 'Boomplay'],
    ['iHeartRadio', 'iHeartRadio'],
    ['iTunes', 'iTunes'],
    ['youtube', 'YouTube'],
  ];

  const out = [];
  const seen = new Set();

  for (const [k, label] of ORDER) {
    const u = asString(src[k]);
    if (u) {
      out.push({ key: k, label, url: u });
      seen.add(k);
    }
  }

  for (const [k, v] of Object.entries(src)) {
    if (seen.has(k)) continue;
    const u = asString(v);
    if (!u) continue;
    out.push({ key: k, label: k, url: u });
  }

  return out;
}

function setBusy(isBusy) {
  const list = $('album-tracklist');
  if (!list) return;
  list.setAttribute('aria-busy', isBusy ? 'true' : 'false');
  list.dataset.loading = isBusy ? 'true' : 'false';
}

function renderNotFound(message) {
  setBusy(false);
  safeText($('album-title'), 'Album not found');
  safeText($('album-artist'), '');
  safeText($('album-year'), '');
  safeText($('album-genre'), '');
  safeText($('album-description'), message || 'This album could not be located.');
  const list = $('album-tracklist');
  if (list) {
    clear(list);
    list.appendChild(el('div', { class: 'notice' }, [el('p', { text: message || 'Album not found.' })]));
  }
}

function updateHeadForAlbum(album, canonAbs, coverAbs) {
  const title = `${asString(album?.title) || 'Album'} — Album | Triad of Angels & ToA Studios`;
  const desc = clampDescription(
    asString(album?.artistInfo) || asString(album?.description) || `Official album page for ${asString(album?.title) || 'this release'}.`
  );

  setTitle(title);
  setCanonical(canonAbs);

  setMetaName('description', desc);
  setMetaProperty('og:type', 'music.album');
  setMetaProperty('og:title', title);
  setMetaProperty('og:description', desc);
  setMetaProperty('og:url', canonAbs);
  if (coverAbs) setMetaProperty('og:image', coverAbs);

  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', title);
  setMetaName('twitter:description', desc);
  setMetaName('twitter:url', canonAbs);
  if (coverAbs) setMetaName('twitter:image', coverAbs);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: asString(album?.title) || '',
    url: canonAbs,
    image: coverAbs || undefined,
    byArtist: {
      '@type': 'MusicGroup',
      name: asString(album?.artist) || 'Triad of Angels & ToA Studios',
    },
  };

  const year = asString(album?.year);
  if (year) ld.datePublished = year;

  const tlist = normalizeTracks(album);
  if (tlist.length) {
    ld.numTracks = tlist.length;
    ld.track = tlist.map((t, idx) => ({
      '@type': 'MusicRecording',
      name: t.title,
      position: idx + 1,
      url: trackCanonicalAbs(asString(album?.id) || '', t.id),
    }));
  }

  injectJsonLd(ld);
}

function wireShare(albumTitle, canonAbs) {
  const btn = $('album-share');
  if (!btn) return;
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const text = canonAbs;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy link'; }, 1400);
    } catch {
      // Fallback
      const ta = el('textarea', { class: 'sr-only' });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy link'; }, 1400);
    }
  });

  // Also wire social share row if present (future-proof)
  const shareX = $('share-x');
  const shareFb = $('share-facebook');
  const shareLi = $('share-linkedin');
  const shareEmail = $('share-email');
  const encUrl = encodeURIComponent(canonAbs);
  const encText = encodeURIComponent(`${albumTitle} — Triad of Angels & ToA Studios`);
  if (shareX) shareX.href = `https://twitter.com/intent/tweet?url=${encUrl}&text=${encText}`;
  if (shareFb) shareFb.href = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;
  if (shareLi) shareLi.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`;
  if (shareEmail) shareEmail.href = `mailto:?subject=${encText}&body=${encUrl}`;
}

function wireStreamingDropdown(details) {
  if (!details) return;

  const summary = details.querySelector('summary');

  const close = () => {
    details.open = false;
  };

  const onDocClick = (e) => {
    if (!details.open) return;
    if (!details.contains(e.target)) close();
  };

  const onKey = (e) => {
    if (!details.open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      if (summary) summary.focus({ preventScroll: true });
    }
  };

  const arm = () => {
    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey, true);
  };

  const disarm = () => {
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKey, true);
  };

  details.addEventListener('toggle', () => {
    if (details.open) arm();
    else disarm();
  });

  details.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      close();
    });
  });
}

function buildStreamingDropdown(links, summaryLabel = 'Stream') {
  const safeLinks = Array.isArray(links) ? links : [];

  const details = el('details', { class: 'streaming stream-dropdown' });

  const summary = el('summary', {
    class: 'link-tab stream-summary',
    'aria-label': 'Open streaming services menu',
  }, [
    el('span', { class: 'stream-summary__label', text: summaryLabel }),
    el('span', { class: 'stream-summary__meta', 'aria-hidden': 'true', text: String(safeLinks.length) + ' services ▾' }),
  ]);

  const ul = el('ul', { class: 'menu', role: 'list', 'aria-label': 'Streaming services' });

  if (!safeLinks.length) {
    ul.appendChild(el('li', { class: 'menu__empty', text: 'No streaming links yet.' }));
  } else {
    safeLinks.slice(0, 14).forEach((l) => {
      ul.appendChild(
        el('li', {}, [
          el('a', {
            href: l.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            'aria-label': 'Open ' + l.label + ' in a new tab',
          }, [
            el('span', { text: l.label }),
          ]),
        ])
      );
    });
  }

  details.appendChild(summary);
  details.appendChild(ul);

  wireStreamingDropdown(details);
  return details;
}

function renderLinkTabs(album) {
  const wrap = $('link-tabs');
  if (!wrap) return;
  clear(wrap);

  const links = orderedStreamLinks(album?.links);
  if (!links.length) {
    wrap.appendChild(el('span', { class: 'pill' }, ['No streaming links yet.']));
    return;
  }

  links.slice(0, 10).forEach((l) => {
    wrap.appendChild(
      el('a', {
        class: 'link-tab',
        href: l.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': 'Open ' + l.label + ' in a new tab',
      }, [
        el('span', { text: l.label }),
      ])
    );
  });

  // Mobile/tablet: tidy dropdown selector (CSS hides on desktop).
  wrap.appendChild(buildStreamingDropdown(links, 'Stream'));
}

function renderEmbeds(album) {
  const section = document.getElementById('album-embeds');
  const area = document.getElementById('embed-area');
  if (!section || !area) return;

  const boom = asString(album?.boomplayEmbed);

  if (!boom) {
    section.hidden = true;
    clear(area);
    area.dataset.loading = 'false';
    area.setAttribute('aria-busy', 'false');
    return;
  }

  section.hidden = false;
  clear(area);
  area.dataset.loading = 'false';
  area.setAttribute('aria-busy', 'false');

  const iframe = el('iframe', {
    class: 'embed-frame',
    src: boom,
    title: 'Boomplay player',
    loading: 'lazy',
    allow: 'encrypted-media; fullscreen',
    referrerpolicy: 'no-referrer',
  });

  const card = el('div', { class: 'embed-card' }, [iframe]);
  area.appendChild(card);
}

function renderTracklist(album, albumId) {
  const list = $('album-tracklist');
  if (!list) return;

  clear(list);
  const tracks = normalizeTracks(album);

  if (!tracks.length) {
    list.appendChild(el('div', { class: 'notice' }, [el('p', { text: 'No tracks listed for this album yet.' })]));
    setBusy(false);
    return;
  }

  tracks.forEach((t, idx) => {
    const entry = getLyricsEntry(album, t.id);
    const duration = asString(entry?.duration) || asString(t?.duration);
    const hasLyrics = !!asString(entry?.file) || !!asString(entry?.text);
    const hasVideo = !!asString(entry?.video);

    const subParts = [];
    if (duration) subParts.push(duration);
    if (hasLyrics) subParts.push('Lyrics');
    if (!subParts.length) subParts.push('');

    const badgeWrap = el('div', { class: 'track-row__badges', 'aria-label': 'Track info' });
    if (hasLyrics) badgeWrap.appendChild(el('span', { class: 'pill pill--accent', text: 'Lyrics' }));
    if (hasVideo) badgeWrap.appendChild(el('span', { class: 'pill', text: 'Video' }));

    const href = trackCanonicalPath(albumId, t.id);

    list.appendChild(
      el('a', {
        class: 'track-row',
        href,
        'aria-label': `Open track: ${t.title}`,
      }, [
        el('div', { class: 'track-row__num', text: String(idx + 1).padStart(2, '0') }),
        el('div', { class: 'track-row__title' }, [
          el('strong', { text: t.title || `Track ${idx + 1}` }),
          el('div', { class: 'track-row__sub', text: subParts.filter(Boolean).join(' • ') }),
        ]),
        badgeWrap,
      ])
    );
  });

  setBusy(false);
}

function main() {
  setBusy(true);

  const albums = pickAlbums(MusicData);
  const albumId = getAlbumId();
  if (!albumId) {
    renderNotFound('Missing album id.');
    return;
  }

  const album = albums.find((a) => asString(a?.id) === albumId) || albums.find((a) => asString(a?.slug) === albumId) || null;
  if (!album) {
    renderNotFound(`Album not found: ${albumId}`);
    return;
  }

  const title = asString(album.title) || albumId;
  const artist = asString(album.artist) || 'Triad of Angels & ToA Studios';
  const year = asString(album.year);
  const genre = normalizeGenre(album.genre);
  const desc = asString(album.artistInfo) || asString(album.description);

  const coverPath = ensureSitePath(album.cover) || DEFAULT_ART;
  const coverAbs = absolutizeMaybe(coverPath) || '';

  // Ambient background
  const bg = $('album-background-image');
  if (bg && coverPath) bg.style.backgroundImage = `url('${coverPath}')`;

  // Hero
  safeText($('album-breadcrumb'), title);
  safeText($('album-artist'), artist);
  safeText($('album-title'), title);
  safeText($('album-year'), year);
  safeText($('album-genre'), genre);
  safeText($('album-description'), desc);

  const coverEl = $('album-cover');
  if (coverEl && coverPath) {
    coverEl.setAttribute('src', coverPath);
    coverEl.setAttribute('alt', `${title} album cover`);
    // Optional responsive variants (manifest-driven; no broken refs if manifest missing)
    applyAlbumCoverVariants(coverEl, coverPath, { sizes: '(max-width: 520px) 70vw, (max-width: 980px) 360px, 420px' });
  }

  const isLegacyTemplate = /\/album\.html$/i.test(window.location.pathname);
  const canonAbs = isLegacyTemplate
    ? `${SITE_ORIGIN}/album.html?album=${encodeURIComponent(albumId)}`
    : albumCanonicalAbs(albumId);

  // Buttons
  const back = $('album-back');
  if (back) back.setAttribute('href', '/music.html');

  wireShare(title, canonAbs);
  renderLinkTabs(album);
  renderTracklist(album, albumId);

  updateHeadForAlbum(album, canonAbs, coverAbs);

  // Make legacy template canonicalized
  const dynCanon = document.getElementById('dynamic-canonical');
  if (dynCanon) dynCanon.setAttribute('href', canonAbs);

  const dynOg = document.getElementById('dynamic-og-url');
  if (dynOg) dynOg.setAttribute('content', canonAbs);

  const dynTw = document.getElementById('dynamic-twitter-url');
  if (dynTw) dynTw.setAttribute('content', canonAbs);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main, { once: true });
} else {
  main();
}
