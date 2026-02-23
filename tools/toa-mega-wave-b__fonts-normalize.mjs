#!/usr/bin/env node
/**
 * TOA — MEGA WAVE B helper
 * Normalize Google Fonts link across HTML by removing media="print" (which can prevent fonts from applying)
 * and ensuring a single canonical fonts link exists in <head>.
 *
 * This is offline-only and CSP-safe (no runtime JS changes).
 *
 * Usage:
 *   node tools/toa-mega-wave-b__fonts-normalize.mjs --check
 *   node tools/toa-mega-wave-b__fonts-normalize.mjs --apply
 *
 * Report:
 *   tools/toa-mega-wave-b__fonts-normalize__report.json
 */

import { promises as fs } from "fs";
import path from "path";

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const CHECK = args.has("--check") || !APPLY;

const REPO_ROOT = process.cwd();

const SKIP_DIRS = new Set([
  "node_modules",".git",".github","dist","build","out",".cache","cache","archive","lighthouse","reports"
]);

const toPosix = (p) => p.split(path.sep).join("/");

async function walk(dirRel, out = []) {
  const abs = path.join(REPO_ROOT, dirRel);
  const entries = await fs.readdir(abs, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      await walk(path.join(dirRel, ent.name), out);
      continue;
    }
    if (ent.isFile() && ent.name.toLowerCase().endsWith(".html")) out.push(path.join(dirRel, ent.name));
  }
  return out;
}

const FONTS_HREF = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Montserrat:wght@300;400;600;700&display=swap";
const FONTS_LINK = `<link rel="stylesheet" href="${FONTS_HREF}">`;

function normalizeFontsInHead(html) {
  const headMatch = html.match(/<head\b[^>]*>[\s\S]*?<\/head>/i);
  if (!headMatch) return { html, changed: false, actions: [] };
  const headFull = headMatch[0];
  let head = headFull;
  const actions = [];

  // Remove any media="print" from the fonts link (or convert to all)
  head = head.replace(
    /<link\s+rel=["']stylesheet["']\s+href=["']https:\/\/fonts\.googleapis\.com\/css2\?[^"']+["']\s+media=["']print["']\s*\/?\s*>/gi,
    () => { actions.push("FONTS_MEDIA_PRINT_REMOVED"); return FONTS_LINK; }
  );

  // If fonts link exists with different attrs, normalize to exact link
  head = head.replace(
    /<link\s+rel=["']stylesheet["']\s+href=["']https:\/\/fonts\.googleapis\.com\/css2\?[^"']+["'][^>]*>/gi,
    (m) => {
      if (m.includes("fonts.googleapis.com") && !m.includes(FONTS_HREF)) {
        actions.push("FONTS_LINK_NORMALIZED");
        return FONTS_LINK;
      }
      if (m.includes(FONTS_HREF) && m !== FONTS_LINK) {
        actions.push("FONTS_LINK_ATTRS_NORMALIZED");
        return FONTS_LINK;
      }
      return m;
    }
  );

  // Ensure exactly one fonts link exists; remove duplicates
  const matches = head.match(new RegExp(FONTS_LINK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || [];
  if (matches.length > 1) {
    let first = true;
    head = head.replace(new RegExp(FONTS_LINK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), () => {
      if (first) { first = false; return FONTS_LINK; }
      actions.push("FONTS_DUPLICATE_REMOVED");
      return "";
    });
  }

  // If no fonts link exists at all, insert near other stylesheet links
  if (!head.includes(FONTS_HREF)) {
    // Insert after style.css if present, else before </head>
    const styleMatch = head.match(/<link\s+rel=["']stylesheet["']\s+href=["']\/css\/style\.css[^"']*["'][^>]*>/i);
    if (styleMatch) {
      head = head.replace(styleMatch[0], `${styleMatch[0]}\n  ${FONTS_LINK}`);
      actions.push("FONTS_LINK_INSERTED");
    } else {
      head = head.replace(/<\/head>/i, `  ${FONTS_LINK}\n</head>`);
      actions.push("FONTS_LINK_INSERTED");
    }
  }

  if (head === headFull) return { html, changed: false, actions };
  const outHtml = html.replace(headFull, head);
  return { html: outHtml, changed: outHtml !== html, actions };
}

async function main() {
  const htmlFiles = await walk(".");
  let changedCount = 0;
  const changedFiles = [];
  const actionCounts = {};

  for (const rel of htmlFiles) {
    const abs = path.join(REPO_ROOT, rel);
    const original = await fs.readFile(abs, "utf8");
    const { html: next, changed, actions } = normalizeFontsInHead(original);
    for (const a of actions) actionCounts[a] = (actionCounts[a] || 0) + 1;
    if (changed) {
      changedCount++;
      changedFiles.push(toPosix(rel));
      if (APPLY) await fs.writeFile(abs, next, "utf8");
    }
  }

  const report = {
    tool: "tools/toa-mega-wave-b__fonts-normalize.mjs",
    generatedAt: new Date().toISOString(),
    root: REPO_ROOT,
    mode: APPLY ? "apply" : "check",
    htmlFilesScanned: htmlFiles.length,
    changedFilesCount: changedCount,
    actions: actionCounts,
    changedFiles
  };

  const reportPath = path.join(REPO_ROOT, "tools", "toa-mega-wave-b__fonts-normalize__report.json");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n✅ Fonts normalization complete.\n");
  console.log(`Mode: ${report.mode}`);
  console.log(`HTML scanned: ${report.htmlFilesScanned}`);
  console.log(`Files changed: ${report.changedFilesCount}`);
  console.log(`Report: ${toPosix(path.relative(REPO_ROOT, reportPath))}\n`);

  // In check mode, fail if changes would occur (helps gating).
  if (!APPLY && changedCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error("\n❌ Script failed:\n", err);
  process.exit(1);
});
