// js/publishing.js — Publishing library renderer (ESM)
// - Search + sort + filters (chips) + shelf browsing
// - Keyboard accessible and CLS-hardened covers
// - Dynamic JSON-LD ItemList injected into #dynamic-jsonld

import {
  books,
  sagas,
  series,
  getSagaById,
  getSeriesById,
  toAbsoluteSiteUrl,
  parseApproxDate,
} from './publishing-data.js';

const SITE_ORIGIN = 'https://www.triadofangels.com';

const $ = (id) => document.getElementById(id);

const UI = {
  search: $('library-search-input'),
  sort: $('library-sort-select'),
  chips: $('library-chips'),
  meta: $('library-results-meta'),
  grid: $('library-grid'),
  empty: $('library-empty'),
  jsonld: $('dynamic-jsonld'),
  toolbar: document.querySelector('.library-toolbar'),
};

const setGridBusy = (isBusy) => {
  if (!UI.grid) return;
  UI.grid.setAttribute('aria-busy', isBusy ? 'true' : 'false');
  UI.grid.dataset.loading = isBusy ? 'true' : 'false';
};


const normalize = (value) => {
  const s = (value ?? '').toString();
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

const slug = (value) => normalize(value).replace(/\s+/g, '-');

const titleize = (value) => {
  const s = (value ?? '').toString().trim();
  if (!s) return '';
  return s
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const prefersReducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

const bookHref = (bookId) => `/book.html?id=${encodeURIComponent(bookId)}`;
const bookAbsUrl = (bookId) => `${SITE_ORIGIN}/book.html?id=${encodeURIComponent(bookId)}`;

const getPrimaryCover = (book) => {
  const c = book?.covers || {};
  const portrait = typeof c.portrait === 'string' ? c.portrait.trim() : '';
  const square = typeof c.square === 'string' ? c.square.trim() : '';
  return portrait || square || '';
};

const pickPrimaryStoreLink = (book) => {
  const stores = book?.stores || {};
  const ordered = [
    ['amazon', 'Amazon'],
    ['kobo', 'Kobo'],
    ['appleBooks', 'Apple Books'],
    ['googlePlayBooks', 'Google Play Books'],
    ['gumroad', 'Gumroad'],
    ['itch', 'itch.io'],
    ['website', 'Website'],
  ];

  for (const [key, label] of ordered) {
    const url = stores?.[key];
    if (typeof url === 'string' && url.trim()) return { key, label, url: url.trim() };
  }
  return null;
};

const matchesAnyFormat = (book, selected) => {
  if (!selected.size) return true;
  const f = book?.formats || {};
  const check = (k) => !!(f?.[k] && f[k].available === true);
  for (const k of selected) {
    if (k === 'epub' && check('epub')) return true;
    if (k === 'pdf' && check('pdf')) return true;
    if (k === 'print' && check('print')) return true;
    if (k === 'audiobook' && check('audiobook')) return true;
  }
  return false;
};

const SAGA_ORDER = new Map(sagas.map((s, i) => [s.id, i]));
const SERIES_ORDER = new Map(series.map((s, i) => [s.id, i]));

const RECORDS = books.map((b) => {
  const saga = getSagaById(b.sagaId);
  const ser = getSeriesById(b.seriesId);
  const parts = [
    b.id,
    b.title,
    b.subtitle,
    b.author,
    saga?.title,
    saga?.shortTitle,
    ser?.title,
    ser?.shortTitle,
    ...(Array.isArray(b.genres) ? b.genres : []),
    ...(Array.isArray(b.tags) ? b.tags : []),
    b.logline,
    b.blurb,
  ].filter(Boolean);

  return {
    book: b,
    haystack: normalize(parts.join(' ')),
    title: normalize(b.title),
    date: parseApproxDate(b),
    sagaOrder: SAGA_ORDER.get(b.sagaId) ?? 999,
    seriesOrder: SERIES_ORDER.get(b.seriesId) ?? 999,
    seriesNumber: Number.isFinite(b.seriesNumber) ? b.seriesNumber : 999,
  };
});

const FORMAT_DEFS = [
  { key: 'epub', label: 'EPUB' },
  { key: 'pdf', label: 'PDF' },
  { key: 'print', label: 'Print' },
  { key: 'audiobook', label: 'Audiobook' },
];

const getDistinct = (arr) => [...new Set(arr.filter(Boolean))];

const DISTINCT_GENRES = getDistinct(
  books
    .flatMap((b) => (Array.isArray(b.genres) ? b.genres : []))
    .map((g) => slug(g))
    .filter(Boolean)
);

const DISTINCT_STATUSES = getDistinct(
  books
    .map((b) => (typeof b.status === 'string' ? slug(b.status) : ''))
    .filter(Boolean)
);

const state = {
  q: '',
  sort: 'featured',
  filters: {
    saga: new Set(),
    series: new Set(),
    genre: new Set(),
    status: new Set(),
    format: new Set(),
  },
};

const clearNode = (node) => {
  if (!node) return;
  while (node.firstChild) node.removeChild(node.firstChild);
};

const getTokens = (query) => {
  const q = normalize(query);
  if (!q) return [];
  return q.split(' ').filter(Boolean).slice(0, 8);
};

const isChipActive = (groupKey, value) => !!state.filters[groupKey]?.has(value);

const toggleChip = (groupKey, value) => {
  const set = state.filters[groupKey];
  if (!set) return;
  if (set.has(value)) set.delete(value);
  else set.add(value);
};

const clearAllFilters = () => {
  Object.values(state.filters).forEach((s) => s.clear());
};

const getActiveFilterSummary = () => {
  const parts = [];

  if (state.filters.saga.size) {
    const labels = [...state.filters.saga]
      .map((id) => getSagaById(id)?.shortTitle || getSagaById(id)?.title || id)
      .filter(Boolean);
    if (labels.length) parts.push(`Saga: ${labels.join(', ')}`);
  }

  if (state.filters.series.size) {
    const labels = [...state.filters.series]
      .map((id) => getSeriesById(id)?.shortTitle || getSeriesById(id)?.title || id)
      .filter(Boolean);
    if (labels.length) parts.push(`Series: ${labels.join(', ')}`);
  }

  if (state.filters.genre.size) {
    const labels = [...state.filters.genre].map((g) => titleize(g));
    if (labels.length) parts.push(`Genre: ${labels.join(', ')}`);
  }

  if (state.filters.status.size) {
    const labels = [...state.filters.status].map((s) => titleize(s));
    if (labels.length) parts.push(`Status: ${labels.join(', ')}`);
  }

  if (state.filters.format.size) {
    const labels = [...state.filters.format].map((f) => titleize(f));
    if (labels.length) parts.push(`Format: ${labels.join(', ')}`);
  }

  return parts.length ? parts.join(' • ') : 'No filters';
};

const bookMatchesFilters = (book) => {
  if (state.filters.saga.size && !state.filters.saga.has(book.sagaId)) return false;
  if (state.filters.series.size && !state.filters.series.has(book.seriesId)) return false;

  if (state.filters.genre.size) {
    const genres = Array.isArray(book.genres) ? book.genres : [];
    const slugs = genres.map((g) => slug(g)).filter(Boolean);
    if (!slugs.some((g) => state.filters.genre.has(g))) return false;
  }

  if (state.filters.status.size) {
    const s = typeof book.status === 'string' ? slug(book.status) : '';
    if (!s || !state.filters.status.has(s)) return false;
  }

  if (!matchesAnyFormat(book, state.filters.format)) return false;

  return true;
};

const byTitle = (a, b) => (a.book.title || '').localeCompare(b.book.title || '', undefined, { sensitivity: 'base' });

const sortRecords = (recs, mode) => {
  if (mode === 'az') return [...recs].sort(byTitle);
  if (mode === 'za') return [...recs].sort((a, b) => byTitle(b, a));

  if (mode === 'newest') return [...recs].sort((a, b) => (b.date || 0) - (a.date || 0) || byTitle(a, b));
  if (mode === 'oldest') return [...recs].sort((a, b) => (a.date || 0) - (b.date || 0) || byTitle(a, b));

  return [...recs].sort((a, b) => {
    if (a.sagaOrder !== b.sagaOrder) return a.sagaOrder - b.sagaOrder;
    if (a.seriesOrder !== b.seriesOrder) return a.seriesOrder - b.seriesOrder;
    if (a.seriesNumber !== b.seriesNumber) return a.seriesNumber - b.seriesNumber;
    if ((b.date || 0) !== (a.date || 0)) return (b.date || 0) - (a.date || 0);
    return byTitle(a, b);
  });
};

const scoreRecord = (rec, tokens) => {
  if (!tokens.length) return 0;
  let score = 0;
  for (const tok of tokens) {
    if (rec.title.includes(tok)) score += 6;
    else if (rec.haystack.includes(tok)) score += 2;
    else return -1;
  }
  return score;
};

const filterAndRank = () => {
  const tokens = getTokens(state.q);
  const base = RECORDS.filter((r) => bookMatchesFilters(r.book));

  if (!tokens.length) return sortRecords(base, state.sort);

  const scored = [];
  for (const rec of base) {
    const s = scoreRecord(rec, tokens);
    if (s >= 0) scored.push({ rec, score: s });
  }

  scored.sort((a, b) => b.score - a.score);
  const ranked = scored.map((x) => x.rec);
  return sortRecords(ranked, state.sort);
};

const buildCoverNode = (book) => {
  const href = bookHref(book.id);
  const a = document.createElement('a');
  a.className = 'book-card__cover';
  a.href = href;

  const cover = getPrimaryCover(book);
  if (cover) {
    const img = document.createElement('img');
    img.className = 'book-card__cover-img';
    img.src = cover;
    img.alt = `Cover art for ${book.title}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 900;
    img.height = 1200;
    a.appendChild(img);
    return a;
  }

  const fallback = document.createElement('div');
  fallback.className = 'book-card__cover-fallback';
  const initials = (book.title || 'Book')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
  fallback.textContent = initials || 'B';
  a.appendChild(fallback);
  return a;
};

const buildBookCard = (book) => {
  const card = document.createElement('article');
  card.className = 'book-card';
  card.setAttribute('data-book-id', book.id);

  card.appendChild(buildCoverNode(book));

  const body = document.createElement('div');
  body.className = 'book-card__body';

  const h3 = document.createElement('h3');
  h3.className = 'book-card__title';
  const titleLink = document.createElement('a');
  titleLink.href = bookHref(book.id);
  titleLink.textContent = book.title || book.id;
  h3.appendChild(titleLink);

  const sub = document.createElement('p');
  sub.className = 'book-card__subtitle';
  sub.textContent = book.subtitle ? book.subtitle : '';

  const meta = document.createElement('div');
  meta.className = 'book-card__meta';

  const addPill = (text) => {
    if (!text) return;
    const s = document.createElement('span');
    s.className = 'pill';
    s.textContent = text;
    meta.appendChild(s);
  };

  const saga = getSagaById(book.sagaId);
  const ser = getSeriesById(book.seriesId);

  addPill(saga?.shortTitle || saga?.title || '');
  addPill(ser?.shortTitle || ser?.title || '');
  if (Number.isFinite(book.seriesNumber)) addPill(`Book ${book.seriesNumber}`);
  if (book.status) addPill(book.status);
  if (Array.isArray(book.genres) && book.genres.length) addPill(book.genres[0]);

  const logline = document.createElement('p');
  logline.className = 'book-card__logline';
  logline.textContent = book.logline ? book.logline : '';

  const actions = document.createElement('div');
  actions.className = 'book-card__actions';

  const details = document.createElement('a');
  details.className = 'btn btn--ghost';
  details.href = bookHref(book.id);
  details.textContent = 'Details';
  actions.appendChild(details);

  const store = pickPrimaryStoreLink(book);
  if (store) {
    const buy = document.createElement('a');
    buy.className = 'btn';
    buy.href = store.url;
    buy.target = '_blank';
    buy.rel = 'noopener';
    buy.textContent = `Buy (${store.label})`;
    buy.setAttribute('aria-label', `Buy ${book.title} on ${store.label} (opens in a new tab)`);
    actions.appendChild(buy);
  }

  body.appendChild(h3);
  if (sub.textContent) body.appendChild(sub);
  if (meta.childNodes.length) body.appendChild(meta);
  if (logline.textContent) body.appendChild(logline);
  body.appendChild(actions);

  card.appendChild(body);
  return card;
};

const renderGrid = (recs) => {
  if (!UI.grid) return;
  setGridBusy(true);

  const frag = document.createDocumentFragment();
  for (const r of recs) frag.appendChild(buildBookCard(r));

  UI.grid.replaceChildren(frag);
  setGridBusy(false);
};;

const renderMeta = (count) => {
  if (!UI.meta) return;
  const q = normalize(state.q) ? `Query: “${state.q.trim()}”` : 'Query: (none)';
  const f = getActiveFilterSummary();
  UI.meta.textContent = `${count} book${count === 1 ? '' : 's'} • ${q} • ${f}`;
};

const injectJsonLd = (recs) => {
  if (!UI.jsonld) return;
  const list = recs.slice(0, 50).map((r, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: r.book.title || r.book.id,
    url: bookAbsUrl(r.book.id),
  }));

  const json = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Publishing Library | Triad of Angels',
    url: `${SITE_ORIGIN}/publishing.html`,
    numberOfItems: recs.length,
    itemListElement: list,
  };

  UI.jsonld.textContent = JSON.stringify(json);
};

const ensureShelvesRoot = () => {
  // CSP-safe + CLS-safe: do not create/insert elements at runtime.
  // The shelves root is declared in publishing.html and is optional.
  return document.getElementById('library-shelves');
};

const buildShelf = ({ heading, subheading, items, onViewAll }) => {
  const section = document.createElement('section');
  section.className = 'shelf';

  const header = document.createElement('div');
  header.className = 'shelf__header';

  const h2 = document.createElement('h2');
  h2.className = 'shelf__title';
  h2.textContent = heading;

  const actions = document.createElement('div');
  actions.className = 'shelf__actions';

  if (typeof onViewAll === 'function') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--ghost btn--sm';
    btn.textContent = 'View all';
    btn.addEventListener('click', onViewAll);
    actions.appendChild(btn);
  }

  header.appendChild(h2);
  header.appendChild(actions);
  section.appendChild(header);

  if (subheading) {
    const p = document.createElement('p');
    p.className = 'shelf__subtitle';
    p.textContent = subheading;
    section.appendChild(p);
  }

  const row = document.createElement('div');
  row.className = 'shelf__row';
  row.setAttribute('role', 'list');
  if (prefersReducedMotion()) row.classList.add('shelf__row--reduced');

  const frag = document.createDocumentFragment();
  items.forEach((book) => {
    const a = document.createElement('a');
    a.className = 'shelf-card';
    a.href = bookHref(book.id);
    a.setAttribute('role', 'listitem');

    const cover = getPrimaryCover(book);
    if (cover) {
      const img = document.createElement('img');
      img.className = 'shelf-card__img';
      img.src = cover;
      img.alt = `Cover art for ${book.title}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 720;
      img.height = 960;
      a.appendChild(img);
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'shelf-card__fallback';
      fallback.textContent = (book.title || 'Book').slice(0, 1).toUpperCase();
      a.appendChild(fallback);
    }

    const meta = document.createElement('div');
    meta.className = 'shelf-card__meta';

    const t = document.createElement('div');
    t.className = 'shelf-card__title';
    t.textContent = book.title || book.id;

    const s = document.createElement('div');
    s.className = 'shelf-card__sub';
    s.textContent = book.subtitle ? book.subtitle : (book.status || '');

    meta.appendChild(t);
    meta.appendChild(s);
    a.appendChild(meta);

    frag.appendChild(a);
  });

  row.appendChild(frag);
  section.appendChild(row);
  return section;
};

const renderShelves = () => {
  const root = ensureShelvesRoot();
  if (!root) return;
  clearNode(root);

  const frag = document.createDocumentFragment();

  sagas.forEach((saga) => {
    const items = sortRecords(
      RECORDS.filter((r) => r.book.sagaId === saga.id),
      'featured'
    )
      .map((r) => r.book)
      .slice(0, 10);

    if (!items.length) return;

    frag.appendChild(
      buildShelf({
        heading: saga.shortTitle || saga.title,
        subheading: saga.tagline || '',
        items,
        onViewAll: () => {
          clearAllFilters();
          state.filters.saga.add(saga.id);
          updateUi();
          UI.search?.focus();
        },
      })
    );
  });

  series.forEach((ser) => {
    const items = sortRecords(
      RECORDS.filter((r) => r.book.seriesId === ser.id),
      'featured'
    )
      .map((r) => r.book)
      .slice(0, 10);

    if (!items.length) return;

    frag.appendChild(
      buildShelf({
        heading: ser.shortTitle || ser.title,
        subheading: ser.tagline || '',
        items,
        onViewAll: () => {
          clearAllFilters();
          state.filters.series.add(ser.id);
          updateUi();
          UI.search?.focus();
        },
      })
    );
  });

  root.appendChild(frag);
};

const renderChips = () => {
  if (!UI.chips) return;
  clearNode(UI.chips);
  // If there is no publishing data yet, keep the toolbar stable and avoid layout churn.
  if (!Array.isArray(books) || books.length === 0) {
    UI.chips.hidden = true;
    return;
  }


  const group = (label) => {
    const wrap = document.createElement('div');
    wrap.className = 'chip-group';

    const p = document.createElement('p');
    p.className = 'chip-group__label eyebrow';
    p.textContent = label;

    const row = document.createElement('div');
    row.className = 'chip-row';

    wrap.appendChild(p);
    wrap.appendChild(row);
    UI.chips.appendChild(wrap);
    return row;
  };

  const makeChip = (groupKey, value, label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.dataset.group = groupKey;
    btn.dataset.value = value;
    btn.textContent = label;
    btn.setAttribute('aria-pressed', isChipActive(groupKey, value) ? 'true' : 'false');
    btn.addEventListener('click', () => {
      toggleChip(groupKey, value);
      updateUi();
    });
    return btn;
  };

  const sagaRow = group('Sagas');
  sagas.forEach((saga) => sagaRow.appendChild(makeChip('saga', saga.id, saga.shortTitle || saga.title)));

  const seriesRow = group('Series');
  series.forEach((ser) => seriesRow.appendChild(makeChip('series', ser.id, ser.shortTitle || ser.title)));

  const genreRow = group('Genres');
  DISTINCT_GENRES.sort((a, b) => a.localeCompare(b)).forEach((g) => genreRow.appendChild(makeChip('genre', g, titleize(g))));

  const statusRow = group('Status');
  DISTINCT_STATUSES.sort((a, b) => a.localeCompare(b)).forEach((s) => statusRow.appendChild(makeChip('status', s, titleize(s))));

  const formatRow = group('Formats');
  FORMAT_DEFS.forEach((f) => formatRow.appendChild(makeChip('format', f.key, f.label)));
};

let rafId = 0;

const updateUi = () => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    const recs = filterAndRank();

    if (UI.empty) UI.empty.hidden = recs.length !== 0;

    renderGrid(recs);
    renderMeta(recs.length);
    injectJsonLd(recs);

    // Sync aria-pressed states without rebuilding
    if (UI.chips) {
      UI.chips.querySelectorAll('.chip').forEach((btn) => {
        const groupKey = btn.dataset.group;
        const value = btn.dataset.value;
        btn.setAttribute('aria-pressed', isChipActive(groupKey, value) ? 'true' : 'false');
      });
    }
  });
};

const init = () => {
  if (!UI.toolbar || !UI.grid) return;

  // No-placeholder truth rule: when there are no books yet, show a stable empty state and
  // avoid DOM-heavy filter/shelf rendering that can cause CLS.
  if (!Array.isArray(books) || books.length === 0) {
    if (UI.search) {
      UI.search.disabled = true;
      UI.search.setAttribute('aria-disabled', 'true');
    }
    if (UI.sort) {
      UI.sort.disabled = true;
      UI.sort.setAttribute('aria-disabled', 'true');
    }
    if (UI.chips) {
      UI.chips.hidden = true;
      clearNode(UI.chips);
    }
    const recs = [];
    if (UI.empty) UI.empty.hidden = false;
    renderGrid(recs);
    renderMeta(0);
    injectJsonLd(recs);
    return;
  }

  renderChips();
  renderShelves();

  if (UI.search) {
    let t = 0;
    UI.search.addEventListener('input', () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        state.q = UI.search.value || '';
        updateUi();
      }, 90);
    });
  }

  if (UI.sort) {
    UI.sort.addEventListener('change', () => {
      state.sort = UI.sort.value || 'featured';
      updateUi();
    });
  }

  state.q = UI.search?.value || '';
  state.sort = UI.sort?.value || 'featured';
  updateUi();
};

init();