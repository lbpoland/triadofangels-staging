# TOA Website — Release QA Matrix (Baseline)

**Last updated:** 2026-02-24 (Australia/Brisbane) — MEGA WAVE I  
**Purpose:** Single checklist to validate releases across devices, themes, browsers, and systems.  
**Allowed verdicts:** `PASS` `FAIL` `NOT RUN`  
**Evidence rule:** Every `PASS` should have a short note (device/browser + any screenshots/Lighthouse refs).

---

## 0) Test Context (fill each run)

**Patch Wave 01 applied:** yes (P0).
**MEGA WAVE C applied:** yes (head preconnect normalization across all HTML).
**MEGA WAVE G applied:** yes (canonical track alias route pruning).
**MEGA WAVE H applied:** yes (Publishing CLS + empty-state stabilization).
**MEGA WAVE I applied:** yes (LCP critical-path containment: Home-only heavy background + Home hero preload).

| Field | Value |
|---|---|
| Date (local) | 2026-02-24 |
| Tester | Luke (local) / ChatGPT (analysis) |
| Local origin used | http://127.0.0.1:4173 (LHCI baseline) |
| Bundle timestamp | TOA_SITE_BUNDLE__2026-02-23_091020 |
| Manifest timestamp | TOA_SITE_MANIFEST__2026-02-23_091020 |
| Lighthouse bundle | TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020 |

---

## 1) Core Release Gate — Page-Level Matrix (primary)
**Pages included (regression floor):** Home, Music, Album, Track, Publishing, Store/Merch, Contact, Privacy.

### 1.1 Viewports
| Page | 360×740 (small phone) | 412×915 (S24) | 768×1024 (tablet P) | 1024×768 (tablet L) | 1366×768 (desktop) | 2560×1440 (ultrawide) | Notes |
|---|---|---|---|---|---|---|---|
| Home (`/index.html`) | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Music (`/music.html`) | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Album (`/album.html?album=wings-of-fire`) | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Track (`/track.html?album=wings-of-fire&track=awakening-the-triad`) | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Publishing (`/publishing.html`) | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Store/Merch (`/merch.html` + `/digital-store.html`) | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Contact (`/contact.html`) | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Privacy (`/privacy.html`) | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |

### 1.2 Modes
| Page | Light | Dark | Reduced Motion | Forced Colors | Notes |
|---|---|---|---|---|---|
| Home | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Music | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Album | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Track | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Publishing | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Store/Merch | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Contact | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Privacy | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |

### 1.3 Browsers (as evidence allows)
| Page | Chromium | Firefox | Safari (iOS/WebKit class) | Samsung Internet | Notes |
|---|---|---|---|---|---|
| Home | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Music | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Album | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Track | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Publishing | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Store/Merch | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Contact | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |
| Privacy | NOT RUN | NOT RUN | NOT RUN | NOT RUN |  |

---

## 2) System-Level QA (interactive components)
| System | PASS/FAIL/NOT RUN | Test notes (device/browser/mode) |
|---|---|---|
| Header nav (desktop) | NOT RUN |  |
| Mobile menu open/close | NOT RUN |  |
| Dropdowns + nested submenus | NOT RUN |  |
| Focus visible + tab order | NOT RUN |  |
| Skip link jumps to main | NOT RUN |  |
| Theme toggle + persistence | NOT RUN |  |
| Carousels/rails (touch + keyboard) | NOT RUN |  |
| Album → Track routing (valid + invalid states) | NOT RUN |  |
| Search (typeahead, enter/escape, URL sync) | NOT RUN |  |
| Footer social icon links | NOT RUN |  |
| Embeds (YouTube, Boomplay etc) | NOT RUN |  |
| 404 page behavior (no broken nav) | NOT RUN |  |

---

## 3) SEO / Schema QA
| Check | PASS/FAIL/NOT RUN | Notes |
|---|---|---|
| Unique titles | NOT RUN |  |
| Unique meta descriptions | NOT RUN |  |
| Canonical URLs correct | NOT RUN |  |
| OG tags correct | NOT RUN |  |
| Twitter tags correct | NOT RUN |  |
| JSON-LD valid + truthful | NOT RUN |  |
| sitemap.xml present + correct | NOT RUN |  |
| robots.txt aligned | NOT RUN |  |
| Duplicate track routes resolved | IN PROGRESS | Phase 2 applied: removed 10 orphan alias pre-rendered track routes; verify locally via runtime + LHCI SEO rerun. |

---

## 4) Lighthouse Baseline (Recorded)
> This is the baseline to beat. Update this table after each patch wave.

| Route | Profile | Perf | A11y | BP | SEO | LCP(ms) | CLS | Notes |
|---|---|---|---|---|---|---|---|---|
| `/404.html` | Mobile (LHCI) | 85 | 93 | 96 | 69 | 4356 | 0 | From TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json (3 runs) |
| `/album.html?album=wings-of-fire` | Mobile (LHCI) | 81 | 96 | 96 | 100 | 3488 | 0 | From TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json (3 runs) |
| `/contact.html` | Mobile (LHCI) | 75 | 96 | 96 | 100 | 6156 | 0 | From TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json (3 runs) |
| `/digital-store.html` | Mobile (LHCI) | 78 | 91 | 96 | 100 | 5863 | 0 | From TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json (3 runs) |
| `/index.html` | Mobile (LHCI) | 78 | 95 | 96 | 100 | 6235 | 0 | From TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json (3 runs) |
| `/music.html` | Mobile (LHCI) | 67 | 96 | 96 | 100 | 7440 | 0.026 | From TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json (3 runs) |
| `/privacy.html` | Mobile (LHCI) | 75 | 93 | 96 | 100 | 6306 | 0 | From TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json (3 runs) |
| `/publishing.html` | Mobile (LHCI) | 51 | 91 | 96 | 100 | 5793 | 0.397 | From TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json (3 runs) |
| `/search/` | Mobile (LHCI) | 79 | 96 | 96 | 100 | 5408 | 0.02 | From TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json (3 runs) |
| `/track.html?album=wings-of-fire&track=awakening-the-triad` | Mobile (LHCI) | 81 | 96 | 96 | 100 | 3489 | 0.009 | From TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json (3 runs) |

---

## 5) Notes / Known Baseline Failures (as of 2026-02-24)
- 2026-02-24 update: MEGA WAVE D adjusted runtime-generated outbound-link accessible names on album/track/book pages; rerun runtime + Lighthouse gates locally to confirm `label-content-name-mismatch` closure.
- Runtime/browser gates pending in Codex environment due missing browser executable (`playwright` Chromium + Chrome/Chromium for LHCI). Run locally: `npm run pw:install:chromium`, `npm run ci:check:runtime`, `npm run qa:lighthouse:mobile`, `npm run qa:lighthouse:desktop`. Expected: `[Dev-Check] PASS` and LHCI route summaries without executable errors.

- Accessibility scores are below 100 on multiple pages due to: `label-content-name-mismatch`, `color-contrast`, and Publishing-specific ARIA issues. (See Issue IDs: ID-008, ID-009, ID-011)
- Publishing CLS is far above target (Issue ID-012).
- Performance is below target on multiple core pages (Issue ID-014).

## 6) 2026-02-23 — MEGA WAVE C execution notes
- Applied global head preconnect/dns-prefetch normalization for Google Fonts across 280 HTML files.
- Non-browser gates in sandbox: PASS (`node tools/dev-check.mjs --ci`, `node tools/link-scan.mjs --ci`).
- Browser-dependent gates are BLOCKED in sandbox:
  - Runtime dev-check: missing Playwright browser executable (`chrome-headless-shell`).
  - LHCI mobile/desktop: no Chrome/Edge/Chromium executable detected.
- Local execution is required before marking Wave C as VERIFIED.

## 7) 2026-02-24 — MEGA WAVE G execution notes
- Applied canonical track route hardening by removing 10 legacy alias static track pages flagged by `dev-check` as orphan routes.
- Non-browser gates in sandbox: PASS (`node tools/dev-check.mjs --ci`, `node tools/link-scan.mjs --ci`).
- Browser-dependent gates are BLOCKED in sandbox:
  - Runtime dev-check: missing Playwright browser executable (`chrome-headless-shell`).
  - LHCI mobile/desktop: no Chrome/Edge/Chromium executable detected.
- Local execution is required before marking Wave G as VERIFIED.


## 8) 2026-02-24 — MEGA WAVE H execution notes
- Applied Publishing layout stabilization by replacing malformed skeleton grid scaffold with truthful static empty-state-first markup.
- Updated `js/publishing.js` to drive explicit empty/results UI states for no-data vs no-filter-results behavior.
- Non-browser gates in sandbox: PASS (`node tools/dev-check.mjs --ci`, `node tools/link-scan.mjs --ci`).
- Browser-dependent gates are BLOCKED in sandbox:
  - Runtime dev-check: missing Playwright browser executable (`chrome-headless-shell`).
  - LHCI mobile/desktop: no Chrome/Edge/Chromium executable detected.
- Local execution is required before marking Wave H as VERIFIED.


## 9) 2026-02-24 — MEGA WAVE I execution notes
- Applied performance-layer critical path containment by limiting ToA full-page hero image background to Home (`body.index-page`) and using a lightweight gradient fallback for non-home ToA pages.
- Added responsive hero image preload hint on Home (`imagesrcset` + `imagesizes`) for earlier LCP candidate discovery.
- Non-browser gates in sandbox: PASS (`node tools/dev-check.mjs --ci`, `node tools/link-scan.mjs --ci`).
- Browser-dependent gates are BLOCKED in sandbox:
  - Runtime dev-check: missing Playwright browser executable (`chrome-headless-shell`).
  - LHCI mobile/desktop: no Chrome/Edge/Chromium executable detected.
- Local execution is required before marking Wave I as VERIFIED.
