#!/usr/bin/env node
/**
 * LHCI wrapper that makes Lighthouse CI usable on machines without Google Chrome installed.
 *
 * Fixes:
 * - Detect Chrome / Edge / Chromium on Windows, macOS, Linux.
 * - Avoid Windows spawn issues with npm .cmd shims by invoking the LHCI CLI via Node.
 * - Work whether deps are installed at repo root or under /server.
 *
 * Usage (from repo root):
 *   node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

const cwd = process.cwd();
const argv = process.argv.slice(2);

function takeFlagValue(flag) {
  const idx = argv.findIndex((a) => a === flag || a.startsWith(`${flag}=`));
  if (idx === -1) return null;
  const token = argv[idx];
  if (token.includes('=')) return token.split('=').slice(1).join('=').trim() || null;
  const next = argv[idx + 1];
  if (!next || next.startsWith('-')) return null;
  return next.trim();
}

function removeFlag(flag) {
  const out = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === flag) {
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) i += 1;
      continue;
    }
    if (a.startsWith(`${flag}=`)) continue;
    out.push(a);
  }
  return out;
}

function existsFile(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function isExecutable(p) {
  if (!existsFile(p)) return false;
  if (process.platform === 'win32') return true;
  try {
    const st = fs.statSync(p);
    return (st.mode & 0o111) !== 0;
  } catch {
    return false;
  }
}

function dirnameSafe(p) {
  try {
    return path.dirname(p);
  } catch {
    return cwd;
  }
}

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function windowsCandidates() {
  const env = process.env;
  const pf = env.ProgramFiles || 'C:\\Program Files';
  const pfx86 = env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  const local = env.LOCALAPPDATA || '';
  const roaming = env.APPDATA || '';

  return [
    // Chrome
    path.join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(pfx86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(local, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    // Edge
    path.join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(pfx86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(local, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    // Chromium
    path.join(local, 'Chromium', 'Application', 'chrome.exe'),
    path.join(roaming, 'Chromium', 'Application', 'chrome.exe')
  ].filter(Boolean);
}

function macCandidates() {
  return [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    path.join(os.homedir(), 'Applications', 'Google Chrome.app', 'Contents', 'MacOS', 'Google Chrome'),
    path.join(os.homedir(), 'Applications', 'Microsoft Edge.app', 'Contents', 'MacOS', 'Microsoft Edge')
  ];
}

function linuxCandidates() {
  return [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    '/usr/bin/microsoft-edge',
    '/usr/bin/microsoft-edge-stable',
    '/opt/google/chrome/chrome',
    '/opt/chromium/chrome'
  ];
}

function detectBrowserPath() {
  const fromEnv = [
    process.env.CHROME_PATH,
    process.env.LIGHTHOUSE_CHROMIUM_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH
  ].filter(Boolean);

  for (const p of fromEnv) {
    if (isExecutable(p)) return p;
  }

  const list =
    process.platform === 'win32'
      ? windowsCandidates()
      : process.platform === 'darwin'
        ? macCandidates()
        : linuxCandidates();

  for (const p of list) {
    if (isExecutable(p)) return p;
  }
  return null;
}

function findUp(startDir, relPath) {
  let cur = startDir;
  for (let i = 0; i < 30; i += 1) {
    const candidate = path.join(cur, relPath);
    if (existsFile(candidate)) return candidate;
    const parent = path.dirname(cur);
    if (!parent || parent === cur) break;
    cur = parent;
  }
  return null;
}

function resolveLhciCliEntry(startDir) {
  // Prefer the canonical entry used by the LHCI npm package.
  const primary = findUp(startDir, path.join('node_modules', '@lhci', 'cli', 'src', 'cli.js'));
  if (primary) return primary;

  // Some repos install deps under /server.
  const serverTry = findUp(startDir, path.join('server', 'node_modules', '@lhci', 'cli', 'src', 'cli.js'));
  if (serverTry) return serverTry;

  return null;
}

function resolvePackageRootFromCli(cliPath) {
  // Walk up until we find a package root that owns the node_modules containing the CLI.
  let cur = dirnameSafe(cliPath);
  for (let i = 0; i < 30; i += 1) {
    const pkg = path.join(cur, 'package.json');
    const nm = path.join(cur, 'node_modules');
    if (existsFile(pkg) && fs.existsSync(nm)) return cur;
    const parent = path.dirname(cur);
    if (!parent || parent === cur) break;
    cur = parent;
  }
  return cwd;
}

function normPath(p) {
  return String(p || '').replace(/\\/g, '/');
}

const configArg = takeFlagValue('--config');
if (!configArg) {
  die('[LHCI] Missing required --config argument (example: --config=./.lighthouserc.mobile.json).', 2);
}

const configAbs = path.isAbsolute(configArg) ? configArg : path.resolve(cwd, configArg);
if (!existsFile(configAbs)) {
  die(`[LHCI] Config file not found: ${configAbs}`, 2);
}

const lhciCli = resolveLhciCliEntry(dirnameSafe(configAbs));
if (!lhciCli) {
  die(
    '[LHCI] Could not find @lhci/cli (node_modules/@lhci/cli/src/cli.js). Run npm install in the repo root (or in /server if this repo installs deps there).',
    2
  );
}

const browserPath = detectBrowserPath();
if (!browserPath) {
  const hint =
    process.platform === 'win32'
      ? 'Install Google Chrome or Microsoft Edge (recommended), or set CHROME_PATH to your browser exe.'
      : process.platform === 'darwin'
        ? 'Install Google Chrome or Microsoft Edge in /Applications, or set CHROME_PATH to your browser binary.'
        : 'Install google-chrome-stable / chromium, or set CHROME_PATH to your browser binary.';
  die(`[LHCI] No Chrome/Edge/Chromium executable detected. ${hint}`, 2);
}

const lhciCwd = resolvePackageRootFromCli(lhciCli);

process.env.CHROME_PATH = browserPath;
process.env.LIGHTHOUSE_CHROMIUM_PATH = browserPath;
process.env.PUPPETEER_EXECUTABLE_PATH = browserPath;

const passthroughArgs = removeFlag('--config');
const lhciArgs = ['autorun', `--config=${configAbs}`, ...passthroughArgs];

process.stdout.write(`[LHCI] Using browser: ${browserPath}\n`);
process.stdout.write(`[LHCI] LHCI CLI: ${normPath(lhciCli)}\n`);
process.stdout.write(`[LHCI] Working directory: ${lhciCwd}\n`);
process.stdout.write(`[LHCI] Running: node ${normPath(lhciCli)} ${lhciArgs.join(' ')}\n`);

const child = spawn(process.execPath, [lhciCli, ...lhciArgs], {
  stdio: 'inherit',
  cwd: lhciCwd,
  env: { ...process.env }
});

child.on('error', (err) => {
  die(`[LHCI] Failed to start lhci: ${err?.message || String(err)}`);
});

child.on('exit', (code, signal) => {
  if (typeof code === 'number') process.exit(code);
  die(`[LHCI] lhci terminated by signal: ${signal || 'unknown'}`);
});