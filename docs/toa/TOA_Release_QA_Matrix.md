# TOA Website — Release QA Matrix (Baseline)

**Last updated:** 2026-02-24 (Australia/Brisbane) — MEGA WAVE P  
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
**MEGA WAVE J applied:** yes (SEO indexing hygiene: canonical HTML-only sitemap + robots alignment).
**MEGA WAVE K applied:** yes (Games/Apps/Store truth-first hub readiness copy + disclosures).
**MEGA WAVE L applied:** yes (Console/CSP guardrail hardening: no-inline-handler gate + CI wiring).
**MEGA WAVE M applied:** yes (Navigation desktop dropdown stability: edge-aware submenu alignment + resize repositioning).
**MEGA WAVE N applied:** yes (Home Featured Albums rail stabilization: single keyboard handler path + SR rail instructions + mobile snap-width hardening).
**MEGA WAVE O applied:** yes (Homepage hero polish: fluid typography/subtitle spacing + CTA focus-visible/touch target hardening + responsive hero `img srcset/sizes`).
**MEGA WAVE P applied:** yes (Navigation submenu parity: desktop pointer-enter/leave behavior + trigger/menu keyboard traversal hardening).

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
| sitemap.xml present + correct | IN PROGRESS | Wave J regenerated sitemap from canonical HTML routes only; local runtime/LHCI verification pending. |
| robots.txt aligned | IN PROGRESS | Wave J disallows `/404.html`, `/album.html`, `/track.html`, `/book.html` and keeps sitemap pointer; local SEO verification pending. |
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


## 10) 2026-02-24 — MEGA WAVE J execution notes
- Applied SEO indexing hygiene by removing non-HTML lyrics TXT URLs from sitemap generation, regenerating `sitemap.xml` from canonical HTML routes only, and aligning `robots.txt` with canonical indexing policy.
- Non-browser gates in sandbox: PASS (`node tools/dev-check.mjs --ci`, `node tools/link-scan.mjs --ci`).
- Browser-dependent gates are BLOCKED in sandbox:
  - Runtime dev-check: missing Playwright browser executable (`chrome-headless-shell`).
  - LHCI mobile/desktop: no Chrome/Edge/Chromium executable detected.
- Local execution is required before marking Wave J as VERIFIED.


## 11) 2026-02-24 — MEGA WAVE K execution notes
- Applied platform-readiness truth pass on `games.html`, `apps.html`, `digital-store.html`, and `merch.html` to remove implied live-checkout/live-product claims and keep launch status explicit.
- Non-browser gates in sandbox: PASS (`node tools/dev-check.mjs --ci`, `node tools/link-scan.mjs --ci`).
- Browser-dependent gates are BLOCKED in sandbox:
  - Runtime dev-check: missing Playwright browser executable (`chrome-headless-shell`).
  - LHCI mobile/desktop: no Chrome/Edge/Chromium executable detected.
- Local execution is required before marking Wave K as VERIFIED.


## 12) 2026-02-24 — MEGA WAVE L execution notes
- Applied console/CSP hardening at tooling layer by adding `--strict-no-inline-handler` enforcement in `tools/dev-check.mjs` and wiring this flag into CI/runtime npm scripts (`ci:check`, `ci:check:runtime`, `dev:check:no-inline`, `dev:check:runtime:no-inline`, `qa:check:ci`).
- Non-browser gates in sandbox: PASS (`node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler`, `node tools/link-scan.mjs --ci`).
- Browser-dependent gates attempted and BLOCKED in sandbox:
  - Runtime dev-check failed because Playwright browser executable is missing (`chrome-headless-shell` not installed).
  - LHCI mobile/desktop failed because no Chrome/Edge/Chromium executable is available.
- Local execution is required before marking Wave L as VERIFIED for L-01.1 / ID-013.


## 13) 2026-02-24 — MEGA WAVE M execution notes
- Applied navigation-layer desktop dropdown stability in `js/global.js` and `css/style.css` by adding viewport-edge-aware submenu alignment (`.nav-submenu--align-right`) and resize-time repositioning for open desktop dropdowns.
- Non-browser gates in sandbox: PASS (`node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler`, `node tools/link-scan.mjs --ci`).
- Browser-dependent gates attempted once and BLOCKED in sandbox:
  - Runtime dev-check failed due missing Playwright executable (`chrome-headless-shell`).
  - LHCI mobile/desktop failed due no Chrome/Edge/Chromium executable.
- Screenshot attempt via browser container was attempted but blocked by container-to-localhost connection failure (`Page.goto: net::ERR_EMPTY_RESPONSE`).
- Local execution is required before marking Wave M as VERIFIED for B-layer nav closure.


## 14) 2026-02-24 — MEGA WAVE N execution notes
- Applied Home Featured Albums rail stabilization by removing duplicate keyboard listeners from `js/global.js`, adding SR instruction linkage (`aria-describedby`) in `index.html`, and hardening mobile rail card sizing/snap padding in `css/style.css`.
- Non-browser gates in sandbox: PASS (`node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler`, `node tools/link-scan.mjs --ci`).
- Browser-dependent gates attempted once and BLOCKED in sandbox:
  - Runtime dev-check failed due missing Playwright executable (`chrome-headless-shell`).
  - LHCI mobile/desktop failed due no Chrome/Edge/Chromium executable.
- Local execution is required before marking Wave N as VERIFIED for C-01.1/C-01.2/C-01.3 and ID-006.

## 15) 2026-02-24 — MEGA WAVE O execution notes
- Applied homepage hero-layer polish on `index.html` + `css/style.css`: fluid breakpoint-safe typography (`clamp`), dedicated subtitle styling, CTA `:focus-visible` ring and 44px minimum tap target, and responsive hero image candidate hinting (`srcset` + `sizes`) for LCP support.
- Non-browser gates in sandbox: PASS (`node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler`, `node tools/link-scan.mjs --ci`).
- Browser-dependent gates attempted once and BLOCKED in sandbox:
  - Runtime dev-check failed due missing Playwright executable (`chrome-headless-shell`).
  - LHCI mobile/desktop failed due no Chrome/Edge/Chromium executable.
- Local execution is required before marking Wave O as VERIFIED for C-02.1/C-02.2/C-02.3 and ID-014 closure evidence.


## 16) 2026-02-24 — MEGA WAVE P execution notes
- Applied navigation interaction parity on `js/global.js`: desktop pointer-enter/leave submenu behavior aligned with keyboard behavior, trigger support for Enter/Space + ArrowUp/ArrowDown, and submenu ArrowUp/ArrowDown/Home/End traversal.
- Non-browser gates in sandbox: PASS (`node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler`, `node tools/link-scan.mjs --ci`).
- Browser-dependent gates attempted once and BLOCKED in sandbox:
  - Runtime dev-check failed due missing Playwright executable (`chrome-headless-shell`).
  - LHCI mobile/desktop failed due no Chrome/Edge/Chromium executable.
- Local execution is required before marking Wave P as VERIFIED for B-02.2/B-03.1 and ID-005 closure evidence.
