#!/usr/bin/env node
/**
 * TOA — MEGA WAVE C helper
 * Add/normalize preconnect + dns-prefetch for required external origins (fonts) across ALL HTML.
 * This addresses Lighthouse `uses-rel-preconnect` and improves font delivery consistency.
 *
 * Usage:
 *   node tools/toa-mega-wave-c__preconnect-normalize.mjs --check
 *   node tools/toa-mega-wave-c__preconnect-normalize.mjs --apply
 *
 * Report:
 *   tools/toa-mega-wave-c__preconnect-normalize__report.json
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

const BLOCK = [
  `  <link rel="preconnect" href="https://fonts.googleapis.com">`,
  `  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
  `  <link rel="dns-prefetch" href="https://fonts.googleapis.com">`,
  `  <link rel="dns-prefetch" href="https://fonts.gstatic.com">`
].join("\n");

function normalizePreconnectInHead(html) {
  const headMatch = html.match(/<head\b[^>]*>[\s\S]*?<\/head>/i);
  if (!headMatch) return { html, changed: false, actions: [] };
  const headFull = headMatch[0];
  let head = headFull;
  const actions = [];

  const hasFonts = /fonts\.googleapis\.com\/css2\?/i.test(head);
  if (!hasFonts) return { html, changed: false, actions };

  // Remove any existing preconnect/dns-prefetch lines for these origins to avoid duplicates
  const before = head;
  head = head.replace(/\n\s*<!--\s*Preconnect \(performance\)\s*-->\s*/gi, "\n");
  head = head.replace(/\n\s*<link\s+rel=["']preconnect["']\s+href=["']https:\/\/fonts\.googleapis\.com["'][^>]*>\s*/gi, "\n");
  head = head.replace(/\n\s*<link\s+rel=["']preconnect["']\s+href=["']https:\/\/fonts\.gstatic\.com["'][^>]*>\s*/gi, "\n");
  head = head.replace(/\n\s*<link\s+rel=["']dns-prefetch["']\s+href=["']https:\/\/fonts\.googleapis\.com["'][^>]*>\s*/gi, "\n");
  head = head.replace(/\n\s*<link\s+rel=["']dns-prefetch["']\s+href=["']https:\/\/fonts\.gstatic\.com["'][^>]*>\s*/gi, "\n");
  if (head !== before) actions.push("PRECONNECT_DEDUPED");

  // Insert block near the fonts stylesheet if possible
  const fontsLink = head.match(/<link\s+rel=["']stylesheet["']\s+href=["']https:\/\/fonts\.googleapis\.com\/css2\?[^"']+["'][^>]*>/i);
  if (fontsLink) {
    head = head.replace(fontsLink[0], `${BLOCK}\n  ${fontsLink[0]}`);
    actions.push("PRECONNECT_INSERTED");
  } else {
    // fallback: insert before </head>
    head = head.replace(/<\/head>/i, `${BLOCK}\n</head>`);
    actions.push("PRECONNECT_INSERTED");
  }

  head = head.replace(/\n{3,}/g, "\n\n");
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
    const { html: next, changed, actions } = normalizePreconnectInHead(original);
    for (const a of actions) actionCounts[a] = (actionCounts[a] || 0) + 1;
    if (changed) {
      changedCount++;
      changedFiles.push(toPosix(rel));
      if (APPLY) await fs.writeFile(abs, next, "utf8");
    }
  }

  const report = {
    tool: "tools/toa-mega-wave-c__preconnect-normalize.mjs",
    generatedAt: new Date().toISOString(),
    root: REPO_ROOT,
    mode: APPLY ? "apply" : "check",
    htmlFilesScanned: htmlFiles.length,
    changedFilesCount: changedCount,
    actions: actionCounts,
    changedFiles
  };

  const reportPath = path.join(REPO_ROOT, "tools", "toa-mega-wave-c__preconnect-normalize__report.json");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n✅ Preconnect normalization complete.\n");
  console.log(`Mode: ${report.mode}`);
  console.log(`HTML scanned: ${report.htmlFilesScanned}`);
  console.log(`Files changed: ${report.changedFilesCount}`);
  console.log(`Report: ${toPosix(path.relative(REPO_ROOT, reportPath))}\n`);

  // In check mode, fail if changes would occur (useful as a gate).
  if (!APPLY && changedCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error("\n❌ Script failed:\n", err);
  process.exit(1);
});
