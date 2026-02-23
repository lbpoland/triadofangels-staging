// js/music.js — Music library page controller (ESM)
// Renders the album catalog from js/data.js with fast filtering + stable layout.
// No unsafe HTML injection; everything is created via DOM APIs.

import { albums, buildAlbumTrackList, inferAlbumBuckets, toAbsoluteSiteUrl, parseApproxDate } from './data.js';
import { albumCanonicalPath } from './routes.js';
import { applyAlbumCoverVariants, loadAlbumVariantManifest } from './variants.js';

const SITE_ORIGIN = 'https://www.triadofangels.com';

// Optional responsive cover variants; safe fallback if manifest missing.
const variantsPromise = loadAlbumVariantManifest();

const $ = (sel) => document.querySelector(sel);

const KNOWN_STREAM_ORDER = [
  'spotify',
  'appleMusic',
  'youTubeMusic',
  'amazonMusic',
  'tidal',
  'deezer',
  'boomplay',
  'iTunes'
];

const STREAM_LABELS = {
  spotify: 'Spotify',
  appleMusic: 'Apple Music',
  youTubeMusic: 'YouTube Music',
  amazonMusic: 'Amazon Music',
  tidal: 'TIDAL',
  deezer: 'Deezer',
  boomplay: 'Boomplay',
  iTunes: 'iTunes'
};

const safeText = (v, fallback = '') => (typeof v === 'string' && v.trim() ? v.trim() : fallback);

const normalize = (s) => safeText(s).toLowerCase();

const state = {
  query: '',
  bucket: 'all',
  sort: 'featured'
};

const buildStreamingMenu = (links) => {
  const ul = document.createElement('ul');
  ul.className = 'menu';
  ul.setAttribute('role', 'list');

  const entries = Object.entries(links || {})
    .filter(([, v]) => typeof v === 'string' && v.trim());

  const ordered = [
    ...KNOWN_STREAM_ORDER
      .filter((k) => entries.some(([ek]) => ek === k))
      .map((k) => [k, links[k]]),
    ...entries.filter(([k]) => !KNOWN_STREAM_ORDER.includes(k))
  ];

  if (!ordered.length) {
    const li = document.createElement('li');
    li.className = 'menu__empty';
    li.textContent = 'No streaming links yet.';
    ul.appendChild(li);
    return ul;
  }

  ordered.forEach(([key, url]) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = STREAM_LABELS[key] || key;
    a.setAttribute('aria-label', `Open ${STREAM_LABELS[key] || key} in a new tab`);
    li.appendChild(a);
    ul.appendChild(li);
  });

  return ul;
};

const buildAlbumCard = (album, idx = 0) => {
  const albumId = safeText(album.id);
  const title = safeText(album.title, albumId);
  const artist = safeText(album.artist, 'Triad of Angels & ToA Studios');
  const genre = safeText(album.genre);
  const year = safeText(album.year);
  const coverRel = safeText(album.cover);
  const cover = coverRel ? (coverRel.startsWith('http') ? coverRel : '/' + coverRel.replace(/^\//, '')) : '/assets/images/default-cover.svg';
  const albumUrl = albumCanonicalPath(albumId);

  const card = document.createElement('article');
  card.className = 'album-card';
  card.dataset.albumId = albumId;

  const coverLink = document.createElement('a');
  coverLink.className = 'album-card__cover';
  coverLink.href = albumUrl;
  coverLink.setAttribute('aria-label', `Open album: ${title}`);

  if (cover) {
    const img = document.createElement('img');
    img.src = cover;
    img.alt = `${title} album cover`;
    // Apply responsive srcset if a variants manifest exists (no broken refs if missing)
    applyAlbumCoverVariants(img, cover, { sizes: '(max-width: 520px) 50vw, (max-width: 980px) 33vw, 260px' });
    img.loading = idx < 6 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.width = 800;
    img.height = 800;
    if (idx === 0) {
      img.setAttribute('fetchpriority', 'high');
    }
    coverLink.appendChild(img);
  } else {
    const fb = document.createElement('div');
    fb.className = 'album-card__coverFallback';
    fb.setAttribute('aria-hidden', 'true');
    fb.textContent = (title || albumId).slice(0, 2).toUpperCase();
    coverLink.appendChild(fb);
  }

  const body = document.createElement('div');
  body.className = 'album-card__body';

  const h = document.createElement('h2');
  h.className = 'album-card__title';
  const titleLink = document.createElement('a');
  titleLink.href = albumUrl;
  titleLink.textContent = title;
  h.appendChild(titleLink);

  const meta = document.createElement('p');
  meta.className = 'album-card__meta';
  meta.textContent = year ? `${artist} • ${year}` : artist;

  const g = document.createElement('p');
  g.className = 'album-card__genre';
  g.textContent = genre;

  const tracks = buildAlbumTrackList(album);
  const stats = document.createElement('div');
  stats.className = 'album-card__stats';

  const pillTracks = document.createElement('span');
  pillTracks.className = 'pill';
  pillTracks.textContent = `${tracks.length} track${tracks.length === 1 ? '' : 's'}`;
  stats.appendChild(pillTracks);

  const hasLyrics = tracks.some((t) => (t.file && typeof t.file === 'string' && t.file.trim()) || (t.text && typeof t.text === 'string' && t.text.trim()));
  if (hasLyrics) {
    const pillLyrics = document.createElement('span');
    pillLyrics.className = 'pill pill--accent';
    pillLyrics.textContent = 'Lyrics';
    stats.appendChild(pillLyrics);
  }

  const actions = document.createElement('div');
  actions.className = 'album-card__actions';

  const openBtn = document.createElement('a');
  openBtn.href = albumUrl;
  openBtn.className = 'btn';
  openBtn.textContent = 'Open album';
  actions.appendChild(openBtn);

  const details = document.createElement('details');
  details.className = 'streaming';

  const summary = document.createElement('summary');
  summary.className = 'btn btn--ghost';
  summary.textContent = 'Stream';
  details.appendChild(summary);
  details.appendChild(buildStreamingMenu(album.links || {}));
  actions.appendChild(details);

  body.appendChild(h);
  body.appendChild(meta);
  if (genre) body.appendChild(g);
  body.appendChild(stats);
  body.appendChild(actions);

  card.appendChild(coverLink);
  card.appendChild(body);

  return card;
};

const matchesBucket = (album, bucket) => {
  if (bucket === 'all') return true;
  const artist = normalize(album.artist);
  if (bucket === 'triad') return artist.includes('triad');
  if (bucket === 'toa') return artist.includes('toa') || artist.includes('studios');

  const inferred = inferAlbumBuckets(album);
  return inferred.includes(bucket);
};

const matchesQuery = (album, q) => {
  if (!q) return true;
  const hay = [
    album.title,
    album.artist,
    album.genre,
    album.year,
    ...(Array.isArray(album.tracks) ? album.tracks : [])
  ].map(normalize).join(' ');
  return hay.includes(q);
};

const sortAlbums = (list, mode) => {
  const arr = [...list];

  if (mode === 'az' || mode === 'za') {
    arr.sort((a, b) => safeText(a.title).localeCompare(safeText(b.title), undefined, { sensitivity: 'base' }));
    if (mode === 'za') arr.reverse();
    return arr;
  }

  if (mode === 'newest' || mode === 'oldest') {
    arr.sort((a, b) => parseApproxDate(a) - parseApproxDate(b));
    if (mode === 'newest') arr.reverse();
    return arr;
  }

  // featured: Triad of Angels first, then by approx date desc
  arr.sort((a, b) => {
    const aTriad = normalize(a.artist).includes('triad') ? 0 : 1;
    const bTriad = normalize(b.artist).includes('triad') ? 0 : 1;
    if (aTriad !== bTriad) return aTriad - bTriad;
    return parseApproxDate(b) - parseApproxDate(a);
  });
  return arr;
};

const renderChips = () => {
  const wrap = $('#music-filter-chips');
  if (!wrap) return;

  wrap.setAttribute('aria-busy', 'true');
  wrap.dataset.loading = 'true';

  const base = [
    { id: 'all', label: 'All' },
    { id: 'triad', label: 'Triad' },
    { id: 'toa', label: 'ToA Studios' },
    { id: 'worship', label: 'Worship / Christian' },
    { id: 'pop', label: 'Pop' },
    { id: 'edm', label: 'EDM / Dance' },
    { id: 'hip-hop', label: 'Hip Hop / Rap' },
    { id: 'rock', label: 'Rock' },
    { id: 'metal', label: 'Metal' },
    { id: 'country', label: 'Country' },
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'other', label: 'Other' },
  ];

  const present = new Set();
  for (const a of albums) {
    for (const b of inferAlbumBuckets(a)) present.add(b);
  }

  const chips = base.filter((c) => c.id === 'all' || c.id === 'triad' || c.id === 'toa' || present.has(c.id));

  renderFilterSelect(chips);

  const frag = document.createDocumentFragment();
  for (const c of chips) {
    const li = document.createElement('li');
    li.className = 'chip-row__item';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.dataset.bucket = c.id;
    btn.setAttribute('aria-pressed', state.bucket === c.id ? 'true' : 'false');
    btn.textContent = c.label;

    btn.addEventListener('click', () => {
      if (state.bucket === c.id) return;
      state.bucket = c.id;
      updateChipStates();
      render();
    });

    li.appendChild(btn);
    frag.appendChild(li);
  }

  wrap.replaceChildren(frag);

  wrap.setAttribute('aria-busy', 'false');
  delete wrap.dataset.loading;
};


const renderFilterSelect = (chips) => {
  const sel = document.getElementById('music-filter-select');
  if (!sel) return;

  const existing = sel.value || '';
  sel.replaceChildren();

  for (const c of chips) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.label;
    sel.appendChild(opt);
  }

  sel.value = state.bucket && chips.some((c) => c.id === state.bucket) ? state.bucket : 'all';

  if (!sel.__toaBound) {
    sel.__toaBound = true;
    sel.addEventListener('change', () => {
      const next = sel.value || 'all';
      if (state.bucket === next) return;
      state.bucket = next;
      updateChipStates();
      render();
    });
  }
};

const updateChipStates = () => {
  const wrap = $('#music-filter-chips');
  if (!wrap) return;
  [...wrap.querySelectorAll('.chip')].forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.bucket === state.bucket));
  });
};

const renderJsonLd = (visibleAlbums) => {
  const el = document.getElementById('dynamic-jsonld');
  if (!el) return;

  const items = visibleAlbums.map((a, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "url": `${SITE_ORIGIN}${albumCanonicalPath(safeText(a.id))}`
  }));

  const json = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Triad of Angels & ToA Studios — Albums",
    "itemListOrder": "http://schema.org/ItemListOrderAscending",
    "numberOfItems": items.length,
    "itemListElement": items
  };

  el.textContent = JSON.stringify(json);
};

const render = () => {
  const grid = $('#music-album-grid');
  const meta = $('#music-results-meta');
  if (!grid) return;

  grid.setAttribute('data-loading', 'true');
  grid.setAttribute('aria-busy', 'true');

  const q = normalize(state.query);
  const filtered = albums
    .filter((a) => matchesBucket(a, state.bucket))
    .filter((a) => matchesQuery(a, q));

  const sorted = sortAlbums(filtered, state.sort);

  const frag = document.createDocumentFragment();
  sorted.forEach((a, i) => frag.appendChild(buildAlbumCard(a, i)));

  grid.replaceChildren(frag);

  grid.setAttribute('data-loading', 'false');
  grid.setAttribute('aria-busy', 'false');

  updateChipStates();
  renderJsonLd(sorted);

  if (meta) {
    const total = albums.length;
    const shown = sorted.length;
    meta.textContent =
      shown === total
        ? `${total} album${total === 1 ? '' : 's'} in the library.`
        : `${shown} of ${total} albums shown.`;
  }
};;

const init = () => {
  renderChips();

  const input = $('#music-search-input');
  if (input) {
    input.addEventListener('input', () => {
      state.query = input.value || '';
      render();
    });
  }

  const sort = $('#music-sort-select');
  if (sort) {
    sort.addEventListener('change', () => {
      state.sort = sort.value;
      render();
    });
  }

  render();
};

init();
