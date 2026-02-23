// js/publishing-data.js — Publishing library data (ESM)
// Single source of truth for the Publishing section.
// This repo is GitHub Pages (static hosting): keep data truthful. No fake titles, no placeholders.
//
// Add books later by filling the arrays below. The UI will automatically render:
// - /publishing.html (library grid + filters)
// - /book.html?id=<bookId> (detail page)
// - optional pre-rendered pages: /publishing/books/<bookId>/
//
// Minimal required fields for a book entry:
// {
//   id: "stable-slug",
//   title: "Book Title",
//   author: "Triad of Angels & ToA Studios",
//   year: "2026" (or "2026-02-21"),
//   description: "Short description",
//   covers: { portrait: "/assets/images/books/<id>/cover-portrait.webp", square: "...", wide: "..." },
//   genres: ["epic-fantasy", "theology-fantasy"],
//   stores: { amazon: "https://...", googlePlayBooks: "https://...", appleBooks: "https://..." }
// }
//
// IMPORTANT:
// - IDs are permanent once published (URLs + SEO).
// - If a field is unknown, omit it or set it to "" / null. Do not fabricate.

const SITE_ORIGIN = "https://www.triadofangels.com";

const ensureString = (v) => (typeof v === "string" ? v : "");
const ensureArray = (v) => (Array.isArray(v) ? v : []);

const safeDate = (d) => {
  const s = ensureString(d).trim();
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
};

// ------------------------
// DATA (truthful: empty until you add real releases)
// ------------------------
export const sagas = [];
export const series = [];
export const books = [];

// ------------------------
// LOOKUPS
// ------------------------
export const getSagaById = (id) => {
  const key = ensureString(id).trim();
  if (!key) return null;
  return sagas.find((s) => s.id === key) || null;
};

export const getSeriesById = (id) => {
  const key = ensureString(id).trim();
  if (!key) return null;
  return series.find((s) => s.id === key) || null;
};

// ------------------------
// URL HELPERS
// ------------------------
export const toAbsoluteSiteUrl = (path) => {
  const p = ensureString(path).trim();
  if (!p) return SITE_ORIGIN;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.startsWith("/") ? p : `/${p}`;
  return `${SITE_ORIGIN}${clean}`;
};

// ------------------------
// SORT HELPERS (used by /js/publishing.js)
// ------------------------
export const parseApproxDate = (item) => {
  // Accept year ("2026"), ISO date ("2026-02-21"), or releaseDate fields.
  const year = ensureString(item?.year).trim();
  const release = ensureString(item?.releaseDate).trim();
  const date = ensureString(item?.date).trim();

  const direct = safeDate(release) ?? safeDate(date);
  if (direct !== null) return direct;

  if (/^\d{4}$/.test(year)) {
    // Mid-year for stable ordering.
    const t = Date.parse(`${year}-06-30T00:00:00Z`);
    return Number.isFinite(t) ? t : 0;
  }

  const y = safeDate(year);
  return y !== null ? y : 0;
};

// ------------------------
// OPTIONAL: genre bucket inference (kept tiny; non-authoritative)
// ------------------------
export const inferBookBuckets = (book) => {
  const out = new Set();
  const genres = ensureArray(book?.genres).map((g) => ensureString(g).toLowerCase().trim()).filter(Boolean);
  const title = ensureString(book?.title).toLowerCase();
  const desc = ensureString(book?.description).toLowerCase();

  for (const g of genres) {
    out.add(g.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  }

  if (title.includes("worship") || desc.includes("worship")) out.add("worship");
  if (title.includes("theology") || desc.includes("theology")) out.add("theology");

  return out.size ? [...out] : ["other"];
};
