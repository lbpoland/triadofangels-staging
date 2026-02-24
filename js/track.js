// js/track.js — Track detail page controller (ESM)
// - Supports canonical folder routes and legacy query templates.
// - Renders track meta + lyrics/story/BTS/video from js/data.js.
// - Updates head/meta and injects JSON-LD (runtime) for correctness.

import * as MusicData from './data.js';
import { sanitizeTrackId } from './utils.js';
import {
  getTrackIds,
  albumCanonicalPath,
  albumCanonicalAbs,
  trackCanonicalAbs,
  trackCanonicalPath,
} from './routes.js';
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

const DEFAULT_ART = '/assets/images/og/og-track.webp';

function hideIfEmpty(elm) {
  if (!elm) return;
  const t = (elm.textContent || '').trim();
  elm.hidden = !t;
}

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
  const key = Object.keys(lyrics).find((k) => sanitizeTrackId(k) === trackId);
  return key ? lyrics[key] : null;
}

function orderedLinks(links) {
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
  const list = $('more-tracks');
  if (list) {
    list.setAttribute('aria-busy', isBusy ? 'true' : 'false');
    list.dataset.loading = isBusy ? 'true' : 'false';
  }
}

function renderNotFound(message) {
  setBusy(false);
  safeText($('track-title'), 'Track not found');
  safeText($('track-artist'), '');
  safeText($('track-album'), '');
  safeText($('track-description'), message || 'This track could not be located.');

  const lyricsWrap = $('lyrics-wrap');
  if (lyricsWrap) {
    clear(lyricsWrap);
    lyricsWrap.appendChild(el('div', { class: 'notice' }, [el('p', { text: message || 'Track not found.' })]));
  }
}

function parseDurationToIso(duration) {
  // Accept "3:24" or "03:24" or "1:02:03".
  const d = asString(duration);
  if (!d) return '';
  const parts = d.split(':').map((p) => Number(p));
  if (parts.some((n) => !Number.isFinite(n))) return '';
  if (parts.length === 2) {
    const [m, s] = parts;
    return `PT${m}M${s}S`;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return `PT${h}H${m}M${s}S`;
  }
  return '';
}

function updateHead(album, trackTitle, canonAbs, coverAbs, descText, duration) {
  const albumTitle = asString(album?.title) || 'Album';
  const title = `${trackTitle || 'Track'} — ${albumTitle} | Triad of Angels & ToA Studios`;
  const desc = clampDescription(descText || `Official track page for ${trackTitle || 'this track'} from ${albumTitle}.`);

  setTitle(title);
  setCanonical(canonAbs);

  setMetaName('description', desc);
  setMetaProperty('og:type', 'music.song');
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
    '@type': 'MusicRecording',
    name: trackTitle || '',
    url: canonAbs,
    inAlbum: {
      '@type': 'MusicAlbum',
      name: albumTitle,
      url: albumCanonicalAbs(asString(album?.id) || ''),
    },
    byArtist: {
      '@type': 'MusicGroup',
      name: asString(album?.artist) || 'Triad of Angels & ToA Studios',
    },
    image: coverAbs || undefined,
  };

  const iso = parseDurationToIso(duration);
  if (iso) ld.duration = iso;

  injectJsonLd(ld);
}

function wireCopyLink(btn, url) {
  if (!btn) return;
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(url);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy link'; }, 1400);
    } catch {
      const ta = el('textarea', { class: 'sr-only' });
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy link'; }, 1400);
    }
  });
}

function wireShareLinks(canonAbs, trackTitle) {
  const encUrl = encodeURIComponent(canonAbs);
  const encText = encodeURIComponent(`${trackTitle} — Triad of Angels & ToA Studios`);

  const x = $('share-x');
  const fb = $('share-facebook');
  const li = $('share-linkedin');
  const em = $('share-email');

  if (x) x.href = `https://twitter.com/intent/tweet?url=${encUrl}&text=${encText}`;
  if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;
  if (li) li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`;
  if (em) em.href = `mailto:?subject=${encText}&body=${encUrl}`;
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
            'aria-label': `${l.label} (opens in a new tab)`,
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

function renderLinkTabs(albumLinks, trackLinks) {
  const wrap = $('track-links');
  if (!wrap) return;
  clear(wrap);

  // Prefer track-level links; if empty, fall back to album links.
  const links = orderedLinks(trackLinks).length ? orderedLinks(trackLinks) : orderedLinks(albumLinks);

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
        'aria-label': `${l.label} (opens in a new tab)`,
      }, [el('span', { text: l.label })])
    );
  });

  // Mobile/tablet: tidy dropdown selector (CSS hides on desktop).
  wrap.appendChild(buildStreamingDropdown(links, 'Stream'));
}

function renderTextBlock(hostId, content) {
  const host = $(hostId);
  if (!host) return;

  const text = asString(content);
  if (!text) {
    host.hidden = true;
    return;
  }

  host.hidden = false;
  clear(host);

  // Split into paragraphs, preserve blank lines.
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (!paras.length) {
    host.appendChild(el('p', { text }));
    return;
  }

  paras.forEach((p) => {
    host.appendChild(el('p', { text: p }));
  });
}

async function renderLyrics(lyricsFilePath) {
  const wrap = $('lyrics-wrap');
  if (!wrap) return;

  const file = ensureSitePath(lyricsFilePath);
  clear(wrap);

  if (!file) {
    wrap.appendChild(el('p', { class: 'lyrics-box__empty', text: 'Lyrics coming soon.' }));
    return;
  }

  try {
    const res = await fetch(file, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const pre = el('pre', { class: 'lyrics-pre' });
    pre.textContent = text.replace(/\r\n/g, '\n');

    // Wrap to allow scrolling and selection.
    wrap.appendChild(pre);
  } catch {
    wrap.appendChild(el('p', { class: 'lyrics-box__empty', text: 'Lyrics are unavailable right now.' }));
  }
}

function youtubeIdFromUrl(url) {
  const u = asString(url);
  if (!u) return '';
  try {
    const parsed = new URL(u);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\//, '');
      return id || '';
    }
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/embed/')[1]?.split(/[?#]/)[0] || '';
      const v = parsed.searchParams.get('v');
      if (v) return v;
    }
    return '';
  } catch {
    return '';
  }
}

function renderVideo(videoUrl) {
  const wrap = $('video-wrap');
  if (!wrap) return;

  const url = asString(videoUrl);
  if (!url) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden = false;
  clear(wrap);

  const yt = youtubeIdFromUrl(url);
  if (yt) {
    const iframe = el('iframe', {
      title: 'Video',
      width: '560',
      height: '315',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: 'true',
      loading: 'lazy',
      referrerpolicy: 'strict-origin-when-cross-origin',
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}`,
    });
    wrap.appendChild(iframe);
    return;
  }

  // Allow Boomplay embeds if provided
  if (/boomplay\.com\/(embed|player)/i.test(url)) {
    const iframe = el('iframe', {
      title: 'Video',
      width: '560',
      height: '315',
      loading: 'lazy',
      referrerpolicy: 'strict-origin-when-cross-origin',
      src: url,
    });
    wrap.appendChild(iframe);
    return;
  }

  // As a last resort, provide an outbound link
  wrap.appendChild(
    el('a', {
      class: 'btn',
      href: url,
      target: '_blank',
      rel: 'noopener',
    }, ['Watch video'])
  );
}

function renderMoreTracks(album, albumId, currentTrackId) {
  const list = $('more-tracks');
  if (!list) return;

  clear(list);

  const tracks = normalizeTracks(album);
  const others = tracks.filter((t) => t.id && t.id !== currentTrackId);

  if (!others.length) {
    list.appendChild(el('p', { text: 'No other tracks listed yet.' }));
    setBusy(false);
    return;
  }

  const max = 10;
  others.slice(0, max).forEach((t) => {
    const entry = getLyricsEntry(album, t.id);
    const duration = asString(entry?.duration) || asString(t?.duration);
    const hasLyrics = !!asString(entry?.file) || !!asString(entry?.text);

    list.appendChild(
      el('a', { class: 'more-track', href: trackCanonicalPath(albumId, t.id) }, [
        el('div', { class: 'more-track__meta' }, [
          el('strong', { text: t.title || t.id }),
          el('div', { class: 'more-track__sub', text: [duration, hasLyrics ? 'Lyrics' : ''].filter(Boolean).join(' • ') }),
        ]),
        el('span', { class: `pill${hasLyrics ? ' pill--accent' : ''}`, text: hasLyrics ? 'Lyrics' : 'Open' }),
      ])
    );
  });

  setBusy(false);
}

async function main() {
  setBusy(true);

  const { albumId, trackId } = getTrackIds();
  if (!albumId || !trackId) {
    renderNotFound('Missing album or track id.');
    return;
  }

  const albums = pickAlbums(MusicData);
  const album = albums.find((a) => asString(a?.id) === albumId) || albums.find((a) => asString(a?.slug) === albumId) || null;
  if (!album) {
    renderNotFound(`Album not found: ${albumId}`);
    return;
  }

  const tracks = normalizeTracks(album);
  const current = tracks.find((t) => t.id === trackId) || null;
  const trackIndex = tracks.findIndex((t) => t.id === trackId);
  const trackNumLabel = trackIndex >= 0 ? ('Track ' + String(trackIndex + 1).padStart(2, '0')) : 'Track';
  const trackTitle = asString(current?.title) || trackId;

  const entry = getLyricsEntry(album, trackId);
  const duration = asString(entry?.duration) || asString(current?.duration);
  const story = asString(entry?.story);
  const bts = asString(entry?.behindTheScenes);
  const video = entry?.video;

  const coverPath = ensureSitePath(album?.cover) || DEFAULT_ART;
  const coverAbs = absolutizeMaybe(coverPath) || '';

  const isLegacyTemplate = /\/track\.html$/i.test(window.location.pathname);
  const canonAbs = isLegacyTemplate
    ? `${SITE_ORIGIN}/track.html?album=${encodeURIComponent(albumId)}&track=${encodeURIComponent(trackId)}`
    : trackCanonicalAbs(albumId, trackId);

  // Background
  const bg = $('track-background-image');
  if (bg && coverPath) bg.style.backgroundImage = `url('${coverPath}')`;

  // Breadcrumb + hero
  const albumTitle = asString(album?.title) || albumId;
  safeText($('track-album'), albumTitle);
  safeText($('track-title'), trackTitle);
  safeText($('track-artist'), asString(album?.artist) || 'Triad of Angels & ToA Studios');

  const coverEl = $('track-cover');
  if (coverEl && coverPath) {
    coverEl.setAttribute('src', coverPath);
    coverEl.setAttribute('alt', `${trackTitle} cover art`);
  }

  // Pills
  safeText($('track-pill-album'), albumTitle);
  safeText($('track-pill-track'), trackNumLabel);
  safeText($('track-pill-duration'), duration);

  // Description
  const description = asString(entry?.description) || '';
  const descText = description || (story ? story.split(/\n\s*\n/)[0].trim() : '') || `From the album ${albumTitle}.`;
  safeText($('track-description'), descText);

  // Breadcrumb album link
  const albumLink = $('track-album-link');
  if (albumLink) albumLink.setAttribute('href', albumCanonicalPath(albumId));

  const back = $('track-back');
  if (back) back.setAttribute('href', '/music.html');

  // Link tabs
  renderLinkTabs(album?.links, entry?.links);

  // Share
  wireShareLinks(canonAbs, trackTitle);
  wireCopyLink($('copy-link'), canonAbs);

  // Content sections
  await renderLyrics(entry?.file);
  renderTextBlock('story-wrap', story);
  renderTextBlock('bts-wrap', bts);
  renderVideo(video);
  renderMoreTracks(album, albumId, trackId);

  // Head/meta
  updateHead(album, trackTitle, canonAbs, coverAbs, descText, duration);

  const dynCanon = document.getElementById('dynamic-canonical');
  if (dynCanon) dynCanon.setAttribute('href', canonAbs);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { main(); }, { once: true });
} else {
  // eslint-disable-next-line no-void
  void main();
}
