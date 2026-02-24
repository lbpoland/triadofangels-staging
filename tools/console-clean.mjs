#!/usr/bin/env node
/**
 * tools/console-clean.mjs
 * Verifies core release gate pages are console-clean under Playwright Chromium.
 */

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const CORE_PAGES = [
  '/index.html',
  '/music.html',
  '/album.html?album=wings-of-fire',
  '/track.html?album=wings-of-fire&track=awakening-the-triad',
  '/publishing.html',
  '/merch.html',
  '/contact.html',
  '/privacy.html'
];

const argv = process.argv.slice(2);
const originArg = argv.find((a) => a.startsWith('--origin='));
const externalOrigin = originArg ? originArg.slice('--origin='.length).replace(/\/+$/g, '') : '';

const startStaticServer = async (rootDir) => {
  const { default: serve } = await import('./static-serve.mjs');
  const port = 4273;
  const server = http.createServer((req, res) => serve(req, res, rootDir));
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return { server, origin: `http://127.0.0.1:${port}` };
};

const main = async () => {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error('[Console-Clean] FAIL: Playwright package is not installed.');
    process.exit(1);
  }

  let browser;
  let server = null;
  let origin = externalOrigin;

  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    console.error(`[Console-Clean] FAIL: Unable to launch Chromium (${String(e?.message || e)}).`);
    process.exit(1);
  }

  if (!origin) {
    const started = await startStaticServer(ROOT);
    server = started.server;
    origin = started.origin;
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  const failures = [];

  for (const rel of CORE_PAGES) {
    const url = `${origin}${rel}`;
    const errors = [];

    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    page.removeAllListeners('requestfailed');

    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${String(err?.message || err)}`));
    page.on('requestfailed', (req) => errors.push(`requestfailed: ${req.url()} (${req.failure()?.errorText || 'unknown'})`));

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      if (!response || !response.ok()) {
        errors.push(`navigation: ${url} -> HTTP ${response ? response.status() : 'NO_RESPONSE'}`);
      }
    } catch (e) {
      errors.push(`navigation exception: ${String(e?.message || e)}`);
    }

    if (errors.length > 0) {
      failures.push({ page: rel, errors });
      console.log(`✗ ${rel}`);
      for (const err of errors) console.log(`  - ${err}`);
    } else {
      console.log(`✓ ${rel}`);
    }
  }

  await page.close().catch(() => {});
  await context.close().catch(() => {});
  await browser.close().catch(() => {});
  if (server) await new Promise((resolve) => server.close(resolve));

  if (failures.length > 0) {
    console.error(`\n[Console-Clean] FAIL: ${failures.length} page(s) emitted console/runtime/network errors.`);
    process.exit(1);
  }

  console.log('\n[Console-Clean] PASS: Core release gate pages are console-clean.');
};

main().catch((e) => {
  console.error('[Console-Clean] FAIL (unhandled error)');
  console.error(e);
  process.exit(1);
});
