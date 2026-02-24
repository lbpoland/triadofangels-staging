// js/book.js — Book detail page controller (ESM)
// - Supports canonical folder routes and legacy query templates.
// - Renders book meta + store actions + formats from js/publishing-data.js.
// - Updates head/meta and injects JSON-LD (runtime) for correctness.

import * as PubData from './publishing-data.js';
import { getBookId, bookCanonicalAbs, bookCanonicalPath } from './routes.js';
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

const DEFAULT_COVER = '/assets/images/default-cover.svg';

function pickBooks(mod) {
  if (Array.isArray(mod?.books)) return mod.books;
  if (Array.isArray(mod?.default?.books)) return mod.default.books;
  if (Array.isArray(mod?.BOOKS)) return mod.BOOKS;
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

function normalizeGenres(genres) {
  if (Array.isArray(genres)) return genres.map((g) => asString(g)).filter(Boolean);
  const g = asString(genres);
  return g ? g.split(',').map((x) => x.trim()).filter(Boolean) : [];
}

function orderedStoreLinks(stores) {
  const s = stores && typeof stores === 'object' ? stores : {};
  const ORDER = [
    ['amazon', 'Amazon'],
    ['kindle', 'Kindle'],
    ['kobo', 'Kobo'],
    ['appleBooks', 'Apple Books'],
    ['googlePlayBooks', 'Google Play Books'],
    ['barnesNoble', 'Barnes & Noble'],
    ['gumroad', 'Gumroad'],
    ['itch', 'itch.io'],
    ['website', 'Website'],
  ];

  const out = [];
  const seen = new Set();

  for (const [k, label] of ORDER) {
    const u = asString(s[k]);
    if (u) {
      out.push({ key: k, label, url: u });
      seen.add(k);
    }
  }

  for (const [k, v] of Object.entries(s)) {
    if (seen.has(k)) continue;
    const u = asString(v);
    if (!u) continue;
    out.push({ key: k, label: k, url: u });
  }

  return out;
}

function formatCards(formats) {
  const list = [];
  if (!formats || typeof formats !== 'object') return list;

  for (const [k, v] of Object.entries(formats)) {
    if (!v) continue;

    if (typeof v === 'string') {
      list.push({ key: k, label: k, note: v, url: '' });
      continue;
    }

    if (typeof v === 'object') {
      list.push({
        key: k,
        label: asString(v.label) || k,
        note: asString(v.note) || asString(v.description) || '',
        url: asString(v.url),
      });
      continue;
    }
  }

  return list;
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

function updateHead(book, canonAbs, coverAbs) {
  const titleText = asString(book?.title) || 'Book';
  const title = `${titleText} — Publishing | Triad of Angels & ToA Studios`;

  const desc = clampDescription(
    asString(book?.description) || asString(book?.blurb) || asString(book?.logline) || `Official publishing page for ${titleText}.`
  );

  setTitle(title);
  setCanonical(canonAbs);

  setMetaName('description', desc);
  setMetaProperty('og:type', 'book');
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
    '@type': 'Book',
    name: titleText,
    url: canonAbs,
    image: coverAbs || undefined,
    author: {
      '@type': 'Organization',
      name: 'Triad of Angels & ToA Studios',
    },
  };

  const year = asString(book?.year);
  if (year) ld.datePublished = year;

  const genre = normalizeGenres(book?.genres);
  if (genre.length) ld.genre = genre;

  const series = asString(book?.series);
  const number = typeof book?.numberInSeries === 'number' ? book.numberInSeries : null;
  if (series) {
    ld.isPartOf = {
      '@type': 'BookSeries',
      name: series,
    };
    if (number) ld.position = number;
  }

  injectJsonLd(ld);
}

function renderBook(book, bookId) {
  const title = asString(book?.title) || bookId;
  const series = asString(book?.series);
  const status = asString(book?.status);
  const year = asString(book?.year);
  const logline = asString(book?.logline);
  const blurb = asString(book?.description) || asString(book?.blurb);

  const coverPath = ensureSitePath(book?.covers?.portrait || book?.cover || '') || DEFAULT_COVER;
  const coverAbs = absolutizeMaybe(coverPath) || '';

  safeText($('book-breadcrumb'), title);
  safeText($('book-context'), asString(book?.context) || (series ? `${series}` : 'Publishing'));
  safeText($('book-title'), title);

  safeText($('book-year'), year);
  safeText($('book-status'), status);
  safeText($('book-series'), series);
  safeText($('book-logline'), logline);
  safeText($('book-blurb'), blurb);

  const cover = $('book-cover');
  if (cover) {
    cover.setAttribute('src', coverPath);
    cover.setAttribute('alt', `${title} cover`);
  }

  const bg = $('book-background-image');
  if (bg && coverPath) bg.style.backgroundImage = `url('${coverPath}')`;

  // Genre pills
  const genreRow = $('book-genre-row');
  if (genreRow) {
    clear(genreRow);
    const genres = normalizeGenres(book?.genres);
    if (!genres.length) {
      genreRow.hidden = true;
    } else {
      genreRow.hidden = false;
      genres.slice(0, 10).forEach((g) => genreRow.appendChild(el('span', { class: 'pill', text: g })));
    }
  }

  // Store actions
  const storeWrap = $('book-store-actions');
  if (storeWrap) {
    clear(storeWrap);
    const links = orderedStoreLinks(book?.stores);
    if (!links.length) {
      storeWrap.appendChild(el('span', { class: 'pill' }, ['Store links coming soon.']));
    } else {
      links.slice(0, 8).forEach((l) => {
        storeWrap.appendChild(
          el('a', {
            class: 'btn btn--ghost',
            href: l.url,
            target: '_blank',
            rel: 'noopener',
            'aria-label': `${l.label} (opens in a new tab)`,
          }, [l.label])
        );
      });
    }
  }

  // Formats
  const formatsWrap = $('book-formats');
  if (formatsWrap) {
    clear(formatsWrap);
    const cards = formatCards(book?.formats);
    if (!cards.length) {
      formatsWrap.appendChild(el('div', { class: 'format-card' }, [
        el('p', { class: 'format-card__title', text: 'Formats coming soon.' }),
      ]));
    } else {
      cards.forEach((c) => {
        const meta = el('div', { class: 'format-card__meta' });
        if (c.note) meta.appendChild(el('span', { class: 'pill', text: c.note }));

        const box = el('div', { class: 'format-card' }, [
          el('p', { class: 'format-card__title', text: c.label }),
          meta,
        ]);

        if (c.url) {
          box.appendChild(el('a', { class: 'btn btn--ghost', href: c.url, target: '_blank', rel: 'noopener' }, ['Get format']));
        }

        formatsWrap.appendChild(box);
      });
    }
  }

  // Series card
  const seriesCard = $('book-series-card');
  if (seriesCard) {
    clear(seriesCard);
    const saga = asString(book?.saga);
    const number = typeof book?.numberInSeries === 'number' ? book.numberInSeries : null;

    const lines = [];
    if (saga) lines.push(`Saga: ${saga}`);
    if (series) lines.push(`Series: ${series}`);
    if (number) lines.push(`Volume: ${number}`);

    if (!lines.length) {
      seriesCard.appendChild(el('p', { text: 'Series details coming soon.' }));
    } else {
      lines.forEach((line) => seriesCard.appendChild(el('p', { text: line })));
    }
  }

  // Extras
  const extras = $('book-extras');
  if (extras) {
    clear(extras);
    const extrasLines = [];
    const era = asString(book?.era);
    const audience = asString(book?.audience);
    const isbn = asString(book?.isbn);
    if (era) extrasLines.push(`Era: ${era}`);
    if (audience) extrasLines.push(`Audience: ${audience}`);
    if (isbn) extrasLines.push(`ISBN: ${isbn}`);

    if (!extrasLines.length) {
      extras.appendChild(el('p', { text: 'Extras coming soon.' }));
    } else {
      extrasLines.forEach((line) => extras.appendChild(el('p', { text: line })));
    }
  }

  return { coverAbs };
}

function main() {
  const bookId = getBookId();

  // Canonical must match the current URL style:
  // - Legacy template: /book.html?id=<id>
  // - Pre-rendered: /publishing/books/<id>/
  const isLegacyTemplate = /\/book\.html$/i.test(window.location.pathname);
  const canonAbs = bookId
    ? (isLegacyTemplate
        ? `${SITE_ORIGIN}/book.html?id=${encodeURIComponent(bookId)}`
        : bookCanonicalAbs(bookId))
    : `${SITE_ORIGIN}${window.location.pathname}`;

  const books = pickBooks(PubData);
  const book = bookId
    ? (books.find((b) => asString(b?.id) === bookId) || books.find((b) => asString(b?.slug) === bookId) || null)
    : null;

  // Render page (truthful empty state if missing)
  if (!bookId) {
    safeText($('book-title'), 'Book not found');
    safeText($('book-blurb'), 'Missing book id.');
    updateHead(null, canonAbs, '');
  } else if (!book) {
    safeText($('book-title'), 'Book not found');
    safeText($('book-blurb'), `Book not found: ${bookId}`);
    // Still inject valid JSON-LD so runtime checks and crawlers get a valid document.
    updateHead({ title: bookId, description: `This publishing URL is reserved for ${bookId}.` }, canonAbs, '');
  } else {
    const { coverAbs } = renderBook(book, bookId);
    updateHead(book, canonAbs, coverAbs);

    const share = $('book-share');
    wireCopyLink(share, canonAbs);
  }

  const dynCanon = document.getElementById('dynamic-canonical');
  if (dynCanon) dynCanon.setAttribute('href', canonAbs);

  const dynOg = document.getElementById('dynamic-og-url');
  if (dynOg) dynOg.setAttribute('content', canonAbs);

  const dynTw = document.getElementById('dynamic-twitter-url');
  if (dynTw) dynTw.setAttribute('content', canonAbs);

  const back = $('book-back');
  if (back) back.setAttribute('href', '/publishing.html');
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main, { once: true });
} else {
  main();
}
