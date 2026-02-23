// search/search.js — Site search (ESM)
// Searches across Music (albums + tracks) and Publishing (books).
// - No unsafe HTML injection (DOM nodes only)
// - Works with /search/?q=... deep links
// - Keyboard-friendly: Enter triggers search, Escape clears
//
// Rendering targets (from /search/index.html):
// - #albums-results, #tracks-results, #books-results (grids)
// - #albums-heading, #tracks-heading, #books-heading (section headings)
// - #results-summary, #no-results

import { albums } from "../js/data.js";
import { books } from "../js/publishing-data.js";
import { sanitizeTrackId } from "../js/utils.js";
import { albumCanonicalPath, trackCanonicalPath, bookCanonicalPath } from "../js/routes.js";

const $ = (id) => document.getElementById(id);

const UI = {
  input: $("search-input"),
  btn: $("search-button"),
  clear: $("clear-button"),
  summary: $("results-summary"),
  noResults: $("no-results"),

  albumsWrap: $("albums-results"),
  tracksWrap: $("tracks-results"),
  booksWrap: $("books-results"),

  albumsHeading: $("albums-heading"),
  tracksHeading: $("tracks-heading"),
  booksHeading: $("books-heading"),
};

const norm = (v) =>
  String(v ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const safeStr = (v) => (typeof v === "string" ? v.trim() : "");

function ensureSitePath(pathOrUrl) {
  const s = safeStr(pathOrUrl);
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return s;
  return "/" + s.replace(/^\/+/, "");
}

const readQueryParam = () => {
  try {
    const u = new URL(window.location.href);
    return safeStr(u.searchParams.get("q"));
  } catch {
    return "";
  }
};

const writeQueryParam = (q) => {
  try {
    const u = new URL(window.location.href);
    if (q) u.searchParams.set("q", q);
    else u.searchParams.delete("q");
    window.history.replaceState({}, "", u.toString());
  } catch {
    // ignore
  }
};

function albumCover(album) {
  const c = safeStr(album?.cover);
  return ensureSitePath(c) || "/assets/images/og/og-album.webp";
}

function albumTitle(album) {
  return safeStr(album?.title) || safeStr(album?.name) || safeStr(album?.id) || "Album";
}

function albumArtist(album) {
  return safeStr(album?.artist) || "Triad of Angels";
}

function trackTitle(track) {
  return safeStr(track?.title) || safeStr(track?.name) || safeStr(track?.id) || "Track";
}

function trackId(track) {
  const explicit = safeStr(track?.id) || safeStr(track?.slug);
  if (explicit) return explicit;
  const t = trackTitle(track);
  return t ? sanitizeTrackId(t) : "";
}

function flattenTracks() {
  const out = [];
  for (const a of Array.isArray(albums) ? albums : []) {
    const albumId = safeStr(a?.id) || safeStr(a?.slug);
    if (!albumId) continue;

    const list = Array.isArray(a?.tracks) ? a.tracks : [];
    for (const t of list) {
      if (typeof t === "string") {
        const tid = sanitizeTrackId(t);
        if (!tid) continue;
        out.push({
          album: a,
          track: { id: tid, title: t },
        });
        continue;
      }
      const tid = trackId(t);
      if (!tid) continue;
      out.push({
        album: a,
        track: { ...t, id: tid, title: trackTitle(t) },
      });
    }
  }
  return out;
}

const TRACKS_INDEX = flattenTracks();

function makeCard({ href, coverSrc, coverAlt, title, meta, subtitle }) {
  const card = document.createElement("article");
  card.className = "album-card";

  const cover = document.createElement("a");
  cover.className = "album-card__cover";
  cover.href = href;

  const img = document.createElement("img");
  img.src = coverSrc;
  img.alt = coverAlt;
  img.width = 900;
  img.height = 900;
  img.decoding = "async";
  img.loading = "lazy";
  img.referrerPolicy = "no-referrer";

  cover.appendChild(img);

  const body = document.createElement("div");
  body.className = "album-card__body";

  const h = document.createElement("h3");
  h.className = "album-card__title";
  const a = document.createElement("a");
  a.href = href;
  a.textContent = title;
  h.appendChild(a);

  const pMeta = document.createElement("p");
  pMeta.className = "album-card__meta";
  pMeta.textContent = meta;

  body.appendChild(h);
  body.appendChild(pMeta);

  if (subtitle) {
    const pSub = document.createElement("p");
    pSub.className = "album-card__genre";
    pSub.textContent = subtitle;
    body.appendChild(pSub);
  }

  card.appendChild(cover);
  card.appendChild(body);
  return card;
}

function clearResults() {
  UI.albumsWrap?.replaceChildren();
  UI.tracksWrap?.replaceChildren();
  UI.booksWrap?.replaceChildren();

  if (UI.albumsHeading) UI.albumsHeading.textContent = "";
  if (UI.tracksHeading) UI.tracksHeading.textContent = "";
  if (UI.booksHeading) UI.booksHeading.textContent = "";

  if (UI.summary) UI.summary.textContent = "";
  if (UI.noResults) UI.noResults.hidden = true;
}

function renderEmpty(q) {
  clearResults();
  if (UI.summary) UI.summary.textContent = q ? `No results for “${q}”.` : "Type a search above.";
  if (UI.noResults) UI.noResults.hidden = !q;
}

function search(qRaw) {
  const q = norm(qRaw);
  if (!q) {
    renderEmpty("");
    writeQueryParam("");
    return;
  }

  writeQueryParam(qRaw);

  const albumMatches = [];
  for (const a of Array.isArray(albums) ? albums : []) {
    const hay = norm(
      [
        albumTitle(a),
        albumArtist(a),
        safeStr(a?.genre),
        safeStr(a?.year),
        safeStr(a?.description),
      ].join(" ")
    );
    if (hay.includes(q)) albumMatches.push(a);
  }

  const trackMatches = [];
  for (const item of TRACKS_INDEX) {
    const a = item.album;
    const t = item.track;
    const hay = norm(
      [
        trackTitle(t),
        albumTitle(a),
        albumArtist(a),
        safeStr(a?.genre),
        safeStr(a?.year),
      ].join(" ")
    );
    if (hay.includes(q)) trackMatches.push(item);
  }

  const bookMatches = [];
  for (const b of Array.isArray(books) ? books : []) {
    const hay = norm([safeStr(b?.title), safeStr(b?.subtitle), safeStr(b?.description), safeStr(b?.author)].join(" "));
    if (hay.includes(q)) bookMatches.push(b);
  }

  const total = albumMatches.length + trackMatches.length + bookMatches.length;

  clearResults();

  if (UI.summary) UI.summary.textContent = `${total} result${total === 1 ? "" : "s"} for “${qRaw}”.`;

  if (total === 0) {
    if (UI.noResults) UI.noResults.hidden = false;
    return;
  }

  // Tracks
  if (trackMatches.length) {
    if (UI.tracksHeading) UI.tracksHeading.textContent = `Tracks (${trackMatches.length})`;
    const frag = document.createDocumentFragment();
    for (const { album, track } of trackMatches.slice(0, 60)) {
      const albumId = safeStr(album?.id) || safeStr(album?.slug);
      const tid = safeStr(track?.id);
      const href = trackCanonicalPath(albumId, tid) || `/track.html?album=${encodeURIComponent(albumId)}&track=${encodeURIComponent(tid)}`;
      frag.appendChild(
        makeCard({
          href,
          coverSrc: albumCover(album),
          coverAlt: `${albumTitle(album)} cover`,
          title: trackTitle(track),
          meta: albumTitle(album),
          subtitle: "Music • Track",
        })
      );
    }
    UI.tracksWrap?.appendChild(frag);
  }

  // Books (currently empty until you add real data)
  if (bookMatches.length) {
    if (UI.booksHeading) UI.booksHeading.textContent = `Books (${bookMatches.length})`;
    const frag = document.createDocumentFragment();
    for (const b of bookMatches.slice(0, 40)) {
      const id = safeStr(b?.id) || safeStr(b?.slug);
      const href = bookCanonicalPath(id) || `/book.html?id=${encodeURIComponent(id)}`;
      frag.appendChild(
        makeCard({
          href,
          coverSrc: safeStr(b?.covers?.square) || safeStr(b?.covers?.portrait) || "/assets/images/og/og-publishing.webp",
          coverAlt: `${safeStr(b?.title) || "Book"} cover`,
          title: safeStr(b?.title) || "Book",
          meta: safeStr(b?.author) || "Publishing",
          subtitle: "Publishing • Book",
        })
      );
    }
    UI.booksWrap?.appendChild(frag);
  }

  // Albums
  if (albumMatches.length) {
    if (UI.albumsHeading) UI.albumsHeading.textContent = `Albums (${albumMatches.length})`;
    const frag = document.createDocumentFragment();
    for (const a of albumMatches.slice(0, 40)) {
      const id = safeStr(a?.id) || safeStr(a?.slug);
      const href = albumCanonicalPath(id) || `/album.html?album=${encodeURIComponent(id)}`;
      frag.appendChild(
        makeCard({
          href,
          coverSrc: albumCover(a),
          coverAlt: `${albumTitle(a)} cover`,
          title: albumTitle(a),
          meta: `${albumArtist(a)}${safeStr(a?.year) ? ` • ${safeStr(a.year)}` : ""}`,
          subtitle: safeStr(a?.genre) ? safeStr(a.genre) : "Music • Album",
        })
      );
    }
    UI.albumsWrap?.appendChild(frag);
  }
}

function bind() {
  if (!UI.input) return;

  const run = () => search(UI.input.value);

  UI.btn?.addEventListener("click", run);

  UI.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      UI.input.value = "";
      search("");
      UI.input.focus({ preventScroll: true });
    }
  });

  UI.clear?.addEventListener("click", () => {
    UI.input.value = "";
    search("");
    UI.input.focus({ preventScroll: true });
  });

  // Live-typing is not mandatory; keep it light. But clear the "No results" panel as soon as user edits.
  UI.input.addEventListener("input", () => {
    if (UI.noResults) UI.noResults.hidden = true;
  });

  // Auto-run if URL contains ?q=
  const initial = readQueryParam();
  if (initial) {
    UI.input.value = initial;
    search(initial);
  } else {
    renderEmpty("");
  }
}

bind();
