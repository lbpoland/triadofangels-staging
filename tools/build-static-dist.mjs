#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

const argMap = new Map();
for (const raw of process.argv.slice(2)) {
  const [k, v] = raw.split('=');
  if (!k) continue;
  argMap.set(k.replace(/^--/, ''), v ?? true);
}

const OUT_DIR = path.resolve(ROOT, String(argMap.get('out') || 'dist'));
const EXCLUDE_DIRS = new Set(['.git', 'node_modules', 'reports', 'lighthouse', '.lighthouseci', 'dist']);

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function minifyHtml(html) {
  return html
    .replace(/<!--(?!\s*\[if|\s*\{\{)[\s\S]*?-->/g, '')
    .replace(/\n\s*\n+/g, '\n')
    .trim() + '\n';
}

function minifyJsSafe(js) {
  // Conservative minifier: removes comments and collapses blank lines while
  // preserving strings/templates and most regex literals.
  let out = '';
  let i = 0;
  let mode = 'code';
  let quote = '';
  while (i < js.length) {
    const ch = js[i];
    const next = js[i + 1] || '';

    if (mode === 'line-comment') {
      if (ch === '\n') {
        mode = 'code';
        out += '\n';
      }
      i += 1;
      continue;
    }

    if (mode === 'block-comment') {
      if (ch === '*' && next === '/') {
        mode = 'code';
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }

    if (mode === 'string') {
      out += ch;
      if (ch === '\\') {
        out += next;
        i += 2;
        continue;
      }
      if (ch === quote) {
        mode = 'code';
      }
      i += 1;
      continue;
    }

    if (mode === 'template') {
      out += ch;
      if (ch === '\\') {
        out += next;
        i += 2;
        continue;
      }
      if (ch === '`') {
        mode = 'code';
      }
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'") {
      mode = 'string';
      quote = ch;
      out += ch;
      i += 1;
      continue;
    }

    if (ch === '`') {
      mode = 'template';
      out += ch;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '/') {
      mode = 'line-comment';
      i += 2;
      continue;
    }

    if (ch === '/' && next === '*') {
      mode = 'block-comment';
      i += 2;
      continue;
    }

    out += ch;
    i += 1;
  }

  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim() + '\n';
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      if (rel.startsWith('docs/toa')) continue;
      yield* walk(full);
      continue;
    }

    if (entry.isFile()) yield full;
  }
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function run() {
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const report = {
    outDir: path.relative(ROOT, OUT_DIR) || '.',
    generatedAt: new Date().toISOString(),
    filesCopied: 0,
    htmlMinified: 0,
    cssMinified: 0,
    jsMinified: 0
  };

  for await (const file of walk(ROOT)) {
    const rel = path.relative(ROOT, file);
    const outPath = path.join(OUT_DIR, rel);
    await ensureDir(outPath);

    const ext = path.extname(file).toLowerCase();
    if (ext === '.html' || ext === '.css' || ext === '.js' || ext === '.mjs') {
      const src = await fs.readFile(file, 'utf8');
      let out = src;
      if (ext === '.html') {
        out = minifyHtml(src);
        report.htmlMinified += 1;
      } else if (ext === '.css') {
        out = minifyCss(src);
        report.cssMinified += 1;
      } else {
        out = minifyJsSafe(src);
        report.jsMinified += 1;
      }
      await fs.writeFile(outPath, out, 'utf8');
    } else {
      await fs.copyFile(file, outPath);
    }

    report.filesCopied += 1;
  }

  const reportPath = path.join(OUT_DIR, 'build-report.json');
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`Built static dist at ${report.outDir}`);
  console.log(JSON.stringify(report, null, 2));
}

run().catch((error) => {
  console.error('[build-static-dist] failed:', error);
  process.exit(1);
});
