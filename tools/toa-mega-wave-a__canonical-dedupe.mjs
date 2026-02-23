#!/usr/bin/env node
/**
 * TOA — MEGA WAVE A (Follow-up)
 * Canonical de-duplication sweep (fixes dev-check duplicate canonical errors).
 *
 * Goal:
 * - Ensure every HTML file contains EXACTLY ONE <link rel="canonical">.
 * - If #dynamic-canonical exists, it is authoritative and must be kept.
 * - Otherwise keep the first canonical link in document order and remove the rest.
 *
 * Usage:
 *   node tools/toa-mega-wave-a__canonical-dedupe.mjs --check
 *   node tools/toa-mega-wave-a__canonical-dedupe.mjs --apply
 *
 * Output report:
 *   tools/toa-mega-wave-a__canonical-dedupe__report.json
 */

import { promises as fs } from "fs";
import path from "path";

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const CHECK = args.has("--check") || !APPLY;

const REPO_ROOT = process.cwd();

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
  "reports"
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
    if (ent.isFile() && ent.name.toLowerCase().endsWith(".html")) {
      out.push(path.join(dirRel, ent.name));
    }
  }
  return out;
}

function dedupeCanonicalsInHead(html) {
  const headMatch = html.match(/<head\b[^>]*>[\s\S]*?<\/head>/i);
  if (!headMatch) return { html, changed: false, removed: 0 };

  const headFull = headMatch[0];
  let headInner = headFull;

  const canonRe = /<link\b[^>]*\brel=["']canonical["'][^>]*>/gi;
  const matches = headInner.match(canonRe) || [];
  if (matches.length <= 1) return { html, changed: false, removed: 0 };

  const keep = matches.find((m) => /\bid=["']dynamic-canonical["']/i.test(m)) || matches[0];

  let removed = 0;
  for (const m of matches) {
    if (m === keep) continue;
    const before = headInner;
    headInner = headInner.replace(m, "");
    if (headInner !== before) removed++;
  }

  headInner = headInner.replace(/\n{3,}/g, "\n\n");
  const outHtml = html.replace(headFull, headInner);
  return { html: outHtml, changed: outHtml !== html, removed };
}

async function main() {
  const htmlFiles = await walk(".");
  let changedCount = 0;
  const changedFiles = [];
  let removedTotal = 0;

  for (const rel of htmlFiles) {
    const abs = path.join(REPO_ROOT, rel);
    const original = await fs.readFile(abs, "utf8");
    const { html: next, changed, removed } = dedupeCanonicalsInHead(original);
    removedTotal += removed;

    if (changed) {
      changedCount++;
      changedFiles.push(toPosix(rel));
      if (APPLY) await fs.writeFile(abs, next, "utf8");
    }
  }

  const report = {
    tool: "tools/toa-mega-wave-a__canonical-dedupe.mjs",
    generatedAt: new Date().toISOString(),
    root: REPO_ROOT,
    mode: APPLY ? "apply" : "check",
    htmlFilesScanned: htmlFiles.length,
    changedFilesCount: changedCount,
    removedCanonicalLinksTotal: removedTotal,
    changedFiles
  };

  const reportPath = path.join(REPO_ROOT, "tools", "toa-mega-wave-a__canonical-dedupe__report.json");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n✅ Canonical de-duplication sweep complete.\n");
  console.log(`Mode: ${report.mode}`);
  console.log(`HTML scanned: ${report.htmlFilesScanned}`);
  console.log(`Files changed: ${report.changedFilesCount}`);
  console.log(`Canonical links removed: ${report.removedCanonicalLinksTotal}`);
  console.log(`Report: ${toPosix(path.relative(REPO_ROOT, reportPath))}\n`);

  // In check mode, fail if we detected removals (means drift exists).
  if (!APPLY && removedTotal > 0) process.exit(1);
}

main().catch((err) => {
  console.error("\n❌ Script failed:\n", err);
  process.exit(1);
});