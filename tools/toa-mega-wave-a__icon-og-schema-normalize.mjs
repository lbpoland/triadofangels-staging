#!/usr/bin/env node
/**
 * TOA — MEGA WAVE A
 * Elite icon system + OG/Twitter + schema image normalization across ALL HTML.
 *
 * - Replaces favicon/app-icon block in every HTML <head> with canonical elite block
 * - Ensures viewport-fit=cover + color-scheme + theme-color
 * - Ensures canonical link exists (computed if missing)
 * - Fixes known broken OG/Twitter references (apps/digital-store/music-banner/search)
 * - Fixes known broken JSON-LD image paths (apps/digital-store)
 * - Removes Product JSON-LD blocks that reference missing /assets/images/sample-music-pack.webp
 * - Fixes wings-of-fire-album filename mismatch (slug version -> existing file)
 *
 * Usage:
 *   node tools/toa-mega-wave-a__icon-og-schema-normalize.mjs --check
 *   node tools/toa-mega-wave-a__icon-og-schema-normalize.mjs --apply
 *
 * Notes:
 * - No query-string versioning is added to icon URLs (per your current policy).
 * - This script is CSP-safe: it only edits static files offline.
 */

import { promises as fs } from "fs";
import path from "path";

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const CHECK = args.has("--check") || !APPLY;

const REPO_ROOT = process.cwd();

// Keep this conservative (don’t touch build artifacts / node_modules).
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".github",
  "dist",
  "build",
  "out",
  ".cache",
  "cache",
  "archive",
  "lighthouse",
]);

const REQUIRED_FILES = [
  "favicon.ico",
  "favicon.svg",
  "apple-touch-icon.png",
  "site.webmanifest",
  path.join("assets", "favicons", "android-chrome-192x192.png"),
  path.join("assets", "favicons", "android-chrome-512x512.png"),
];

const CANONICAL_ICON_BLOCK = [
  `  <!-- Favicons / App Icons (Elite, cross-browser) -->`,
  `  <link rel="icon" href="/favicon.ico" sizes="any">`,
  `  <link rel="icon" type="image/svg+xml" href="/favicon.svg">`,
  ``,
  `  <!-- PNG fallbacks (most compatible favicon format) -->`,
  `  <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16x16.png">`,
  `  <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32x32.png">`,
  `  <link rel="icon" type="image/png" sizes="48x48" href="/assets/images/favicon-48x48.png">`,
  ``,
  `  <!-- WebP favicons (keep for modern browsers) -->`,
  `  <link rel="icon" type="image/webp" sizes="16x16" href="/assets/images/favicon-16x16.webp">`,
  `  <link rel="icon" type="image/webp" sizes="32x32" href="/assets/images/favicon-32x32.webp">`,
  `  <link rel="icon" type="image/webp" sizes="48x48" href="/assets/images/favicon-48x48.webp">`,
  ``,
  `  <!-- iOS home screen -->`,
  `  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`,
  ``,
  `  <!-- Manifest (PWA) -->`,
  `  <link rel="manifest" href="/site.webmanifest">`,
  ``,
  `  <!-- Safari pinned tab -->`,
  `  <link rel="mask-icon" href="/assets/images/safari-pinned-tab.svg" color="#d0a73a">`,
  ``,
  `  <!-- Windows tiles -->`,
  `  <meta name="msapplication-config" content="/assets/images/browserconfig.xml">`,
  `  <meta name="msapplication-TileColor" content="#0b0c10">`,
].join("\n");

function toPosix(p) {
  return p.split(path.sep).join("/");
}

async function exists(rel) {
  try {
    await fs.access(path.join(REPO_ROOT, rel));
    return true;
  } catch {
    return false;
  }
}

async function walk(dirRel, out = []) {
  const abs = path.join(REPO_ROOT, dirRel);
  const entries = await fs.readdir(abs, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      await walk(path.join(dirRel, ent.name), out);
      continue;
    }
    if (ent.isFile() && ent.name.toLowerCase().endsWith(".html")) {
      out.push(path.join(dirRel, ent.name));
    }
  }
  return out;
}

function computeCanonical(relPath) {
  const rp = toPosix(relPath).replace(/^\.?\//, "");
  // Directory index pages get trailing slash canonical.
  if (rp.endsWith("/index.html")) {
    const dir = rp.slice(0, -("/index.html".length));
    if (!dir) return "https://www.triadofangels.com/";
    return `https://www.triadofangels.com/${dir.replace(/\/+$/, "")}/`;
  }
  // Root index.html
  if (rp === "index.html") return "https://www.triadofangels.com/";
  return `https://www.triadofangels.com/${rp}`;
}

function pageKind(relPath) {
  const rp = toPosix(relPath).replace(/^\.?\//, "");
  if (rp === "music.html" || rp === "streaming.html") return "music";
  if (rp === "album.html" || rp.startsWith("music/albums/")) return "album";
  if (rp === "track.html" || rp.startsWith("music/tracks/")) return "track";
  if (rp === "lyrics/index.html") return "lyrics";
  if (rp === "search/index.html") return "search";
  if (rp === "apps.html") return "apps";
  if (rp === "digital-store.html") return "digital";
  return "generic";
}

function shareCardFor(kind, which /* og|twitter */) {
  const base = which === "og" ? "/assets/images/og/" : "/assets/images/twitter/";
  const map = {
    music: which === "og" ? "og-music.webp" : "twitter-music.webp",
    album: which === "og" ? "og-album.webp" : "twitter-album.webp",
    track: which === "og" ? "og-track.webp" : "twitter-track.webp",
    lyrics: which === "og" ? "og-lyrics.webp" : "twitter-lyrics.webp",
    search: which === "og" ? "og-search.webp" : "twitter-search.webp",
    apps: which === "og" ? "og-digital.webp" : "twitter-digital.webp",
    digital: which === "og" ? "og-digital.webp" : "twitter-digital.webp",
    generic: which === "og" ? "og-home.webp" : "twitter-home.webp",
  };
  return base + (map[kind] ?? map.generic);
}

function normalizeHead(html, relPath) {
  const headMatch = html.match(/<head\b[^>]*>[\s\S]*?<\/head>/i);
  if (!headMatch) return { html, changed: false, notes: ["NO_HEAD_FOUND"] };

  const headFull = headMatch[0];
  let headInner = headFull;

  const notes = [];

  // 1) Ensure viewport meta has viewport-fit=cover.
  if (/<meta\s+name=["']viewport["'][^>]*>/i.test(headInner)) {
    headInner = headInner.replace(
      /<meta\s+name=["']viewport["']\s+content=["']([^"']*)["']\s*\/?>/i,
      (m, content) => {
        const c = content.includes("viewport-fit=cover")
          ? content
          : `${content}, viewport-fit=cover`.replace(/\s+,/g, ",");
        if (c !== content) notes.push("VIEWPORT_FIT_ADDED");
        return `<meta name="viewport" content="${c}">`;
      }
    );
  } else {
    // Insert after charset if possible.
    const insertAfter = headInner.match(/<meta\s+charset=["'][^"']+["']\s*\/?>/i);
    const viewportTag = `  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n`;
    if (insertAfter) {
      headInner = headInner.replace(insertAfter[0], `${insertAfter[0]}\n${viewportTag}`);
    } else {
      headInner = headInner.replace(/<head\b[^>]*>/i, (m) => `${m}\n${viewportTag}`);
    }
    notes.push("VIEWPORT_INSERTED");
  }

  // 2) Ensure color-scheme meta exists.
  if (!/<meta\s+name=["']color-scheme["']/i.test(headInner)) {
    headInner = headInner.replace(/<head\b[^>]*>/i, (m) => `${m}\n  <meta name="color-scheme" content="dark light">`);
    notes.push("COLOR_SCHEME_INSERTED");
  }

  // 3) Ensure theme-color meta exists and uses #0b0c10.
  if (/<meta\s+name=["']theme-color["'][^>]*>/i.test(headInner)) {
    headInner = headInner.replace(
      /<meta\s+name=["']theme-color["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="theme-color" content="#0b0c10">`
    );
    notes.push("THEME_COLOR_NORMALIZED");
  } else {
    headInner = headInner.replace(/<head\b[^>]*>/i, (m) => `${m}\n  <meta name="theme-color" content="#0b0c10">`);
    notes.push("THEME_COLOR_INSERTED");
  }

  // 4) Ensure canonical exists (compute if missing).
  if (!/<link\s+rel=["']canonical["']/i.test(headInner)) {
    const canon = computeCanonical(relPath);
    // Place near robots/theme-color region if possible; otherwise after head open.
    const insertPoint = headInner.match(/<meta\s+name=["']theme-color["'][^>]*>\s*/i);
    if (insertPoint) {
      headInner = headInner.replace(insertPoint[0], `${insertPoint[0]}\n  <link rel="canonical" href="${canon}">`);
    } else {
      headInner = headInner.replace(/<head\b[^>]*>/i, (m) => `${m}\n  <link rel="canonical" href="${canon}">`);
    }
    notes.push("CANONICAL_INSERTED");
  }

  // 5) Remove any existing icon/app-icon tags.
  const beforeIcons = headInner;

  // Remove icon-related comments (keep structure clean).
  headInner = headInner.replace(/\n\s*<!--\s*Icons?\s*-->[^\n]*\n/gi, "\n");

  // Remove link rel=icon / shortcut icon / apple-touch-icon / manifest / mask-icon
  headInner = headInner.replace(
    /\n[ \t]*<link\b[^>]*\brel=["'](?:icon|shortcut icon|apple-touch-icon|manifest|mask-icon)["'][^>]*>\s*/gi,
    "\n"
  );

  // Remove msapplication config + tilecolor
  headInner = headInner.replace(
    /\n[ \t]*<meta\b[^>]*\bname=["']msapplication-config["'][^>]*>\s*/gi,
    "\n"
  );
  headInner = headInner.replace(
    /\n[ \t]*<meta\b[^>]*\bname=["']msapplication-TileColor["'][^>]*>\s*/gi,
    "\n"
  );
  headInner = headInner.replace(/\n{3,}/g, "\n\n");

  if (headInner !== beforeIcons) notes.push("ICON_BLOCK_REMOVED");

  // 6) Insert canonical icon block near Fonts/Styles if possible.
  const insertMarker =
    headInner.match(/\n\s*<!--\s*Fonts\s*-->[^\n]*\n/i) ||
    headInner.match(/\n\s*<!--\s*Styles\s*-->[^\n]*\n/i);

  if (insertMarker) {
    headInner = headInner.replace(insertMarker[0], `\n  <!-- Icons -->\n${CANONICAL_ICON_BLOCK}\n\n${insertMarker[0].trimStart()}`);
  } else {
    // Fallback: before </head>
    headInner = headInner.replace(/<\/head>/i, `\n  <!-- Icons -->\n${CANONICAL_ICON_BLOCK}\n\n</head>`);
  }
  notes.push("ICON_BLOCK_INSERTED");

  // Replace the head region in the full HTML
  const outHtml = html.replace(headFull, headInner);
  return { html: outHtml, changed: outHtml !== html, notes };
}

function normalizeOgTwitterAndSchema(html, relPath) {
  let out = html;
  const notes = [];
  const kind = pageKind(relPath);

  // Fix wings-of-fire slug mismatch everywhere.
  if (out.includes("wings-of-fire-album.webp")) {
    out = out.replaceAll("wings-of-fire-album.webp", "wingsoffire-album.webp");
    notes.push("WINGS_OF_FIRE_FILENAME_FIXED");
  }

  // Fix missing banner share cards (music-banner -> correct per page kind).
  if (out.includes("og-music-banner.webp") || out.includes("twitter-music-banner.webp")) {
    out = out.replaceAll("/assets/images/og/og-music-banner.webp", shareCardFor(kind, "og"));
    out = out.replaceAll("/assets/images/twitter/twitter-music-banner.webp", shareCardFor(kind, "twitter"));
    notes.push("MUSIC_BANNER_SHARECARD_REPOINTED");
  }

  // Apps page: repoint missing OG/Twitter and JSON-LD images to real existing cards.
  if (kind === "apps") {
    out = out.replaceAll("/assets/images/og/og-apps.webp", "/assets/images/og/og-digital.webp");
    out = out.replaceAll("/assets/images/twitter/twitter-apps.webp", "/assets/images/twitter/twitter-digital.webp");
    out = out.replaceAll("https://www.triadofangels.com/assets/images/og-apps.webp", "https://www.triadofangels.com/assets/images/og/og-digital.webp");
    notes.push("APPS_SHARECARDS_FIXED");
  }

  // Digital Store: repoint missing OG/Twitter and Store JSON-LD image path to existing digital card.
  if (kind === "digital") {
    out = out.replaceAll("/assets/images/og/og-digital-store.webp", "/assets/images/og/og-digital.webp");
    out = out.replaceAll("/assets/images/twitter/twitter-digital-store.webp", "/assets/images/twitter/twitter-digital.webp");
    out = out.replaceAll("https://www.triadofangels.com/assets/images/og-digital-store.webp", "https://www.triadofangels.com/assets/images/og/og-digital.webp");
    notes.push("DIGITAL_STORE_SHARECARDS_FIXED");
  }

  // Search page: use dedicated search cards (elite).
  if (kind === "search") {
    // Common older values observed in the gap ledger:
    out = out.replaceAll("/assets/images/og-banner.webp", "/assets/images/og/og-search.webp");
    out = out.replaceAll("twitter-index.webp", "twitter-search.webp");
    notes.push("SEARCH_SHARECARDS_UPGRADED");
  }

  // Remove Product JSON-LD blocks that reference missing sample image.
  // We only remove when we detect the specific missing asset to keep this truthful.
  if (out.includes("sample-music-pack.webp")) {
    out = out.replace(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?sample-music-pack\.webp[\s\S]*?<\/script>\s*/gi,
      ""
    );
    notes.push("PRODUCT_JSONLD_WITH_MISSING_IMAGE_REMOVED");
  }

  return { html: out, changed: out !== html, notes };
}

function countBadRefs(html) {
  const bad = [
    "og-music-banner.webp",
    "twitter-music-banner.webp",
    "/assets/images/og/og-apps.webp",
    "/assets/images/twitter/twitter-apps.webp",
    "/assets/images/og/og-digital-store.webp",
    "/assets/images/twitter/twitter-digital-store.webp",
    "https://www.triadofangels.com/assets/images/og-apps.webp",
    "https://www.triadofangels.com/assets/images/og-digital-store.webp",
    "sample-music-pack.webp",
  ];
  const hits = {};
  for (const b of bad) {
    const re = new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const m = html.match(re);
    if (m?.length) hits[b] = m.length;
  }
  return hits;
}

async function main() {
  // Preflight: ensure required asset files exist (after you unzip packs).
  const missing = [];
  for (const f of REQUIRED_FILES) {
    if (!(await exists(f))) missing.push(f);
  }
  if (missing.length) {
    console.error("\n❌ Required icon/PWA files are missing. Unzip the fallback pack into repo root first:\n");
    for (const m of missing) console.error(`  - ${m}`);
    console.error("\nThen re-run:\n  node tools/toa-mega-wave-a__icon-og-schema-normalize.mjs --check\n");
    process.exit(2);
  }

  const htmlFiles = await walk(".");
  let changedCount = 0;
  const changedFiles = [];
  const aggregateNotes = {};
  const aggregateBadBefore = {};
  const aggregateBadAfter = {};

  for (const rel of htmlFiles) {
    const abs = path.join(REPO_ROOT, rel);
    const original = await fs.readFile(abs, "utf8");

    // Track bad refs before.
    const badBefore = countBadRefs(original);
    for (const [k, v] of Object.entries(badBefore)) {
      aggregateBadBefore[k] = (aggregateBadBefore[k] || 0) + v;
    }

    // Head normalize.
    const step1 = normalizeHead(original, rel);
    // OG/Twitter/schema normalize.
    const step2 = normalizeOgTwitterAndSchema(step1.html, rel);

    const newHtml = step2.html;
    const changed = newHtml !== original;

    const notes = [...(step1.notes || []), ...(step2.notes || [])];
    for (const n of notes) aggregateNotes[n] = (aggregateNotes[n] || 0) + 1;

    // Track bad refs after.
    const badAfter = countBadRefs(newHtml);
    for (const [k, v] of Object.entries(badAfter)) {
      aggregateBadAfter[k] = (aggregateBadAfter[k] || 0) + v;
    }

    if (changed) {
      changedCount++;
      changedFiles.push(toPosix(rel));
      if (APPLY) await fs.writeFile(abs, newHtml, "utf8");
    }
  }

  const report = {
    tool: "tools/toa-mega-wave-a__icon-og-schema-normalize.mjs",
    generatedAt: new Date().toISOString(),
    root: REPO_ROOT,
    mode: APPLY ? "apply" : "check",
    htmlFilesScanned: htmlFiles.length,
    changedFilesCount: changedCount,
    changedFiles,
    notes: aggregateNotes,
    badRefs: {
      before: aggregateBadBefore,
      after: aggregateBadAfter,
    },
  };

  const reportPath = path.join(REPO_ROOT, "tools", "toa-mega-wave-a__report.json");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n✅ TOA MEGA WAVE A complete.\n");
  console.log(`Mode: ${report.mode}`);
  console.log(`HTML scanned: ${report.htmlFilesScanned}`);
  console.log(`Files changed: ${report.changedFilesCount}`);
  console.log(`Report: ${toPosix(path.relative(REPO_ROOT, reportPath))}\n`);

  const badAfterKeys = Object.keys(report.badRefs.after || {}).filter((k) => report.badRefs.after[k] > 0);
  if (badAfterKeys.length) {
    console.log("⚠️ Remaining known-bad references detected (should be 0):");
    for (const k of badAfterKeys) console.log(`  - ${k}: ${report.badRefs.after[k]}`);
    console.log("\nFix those before considering this wave closed.\n");
    process.exit(APPLY ? 1 : 0);
  } else {
    console.log("✅ No known-bad OG/Twitter/schema/icon references remain (for the tracked patterns).\n");
  }
}

main().catch((err) => {
  console.error("\n❌ Script failed:\n", err);
  process.exit(1);
});