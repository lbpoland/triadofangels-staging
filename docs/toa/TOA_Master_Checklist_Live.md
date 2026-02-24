# TOA Website — Master Checklist (Live)

**Last updated:** 2026-02-24 (Australia/Brisbane) — MEGA WAVE O  
**Purpose:** Single source of truth for “what’s done vs next” across the entire static platform.  
**Status legend:** `[DONE]` `[IN PROGRESS]` `[NOT STARTED]` `[BLOCKED]`  
**Issue references:** Use `TOA_Audit_Ledger_Master.md` Issue IDs (ID-###) for precision.

---

## 1) Governance + Project Baseline
| Status | Item | Artifact / Path | Notes / Issue ID |
|---|---|---|---|
| [DONE] | Rules & Master Outline v5 present | /TOA_Website_Rules_Master_Outline_v5.md | — |
| [DONE] | Project Instructions v2 LOCKED present | /TOA_Project_Instructions_v2_LOCKED.md | — |
| [DONE] | Latest Bundle present | /TOA_SITE_BUNDLE__2026-02-23_091020.md | — |
| [DONE] | Latest Manifest present | /TOA_SITE_MANIFEST__2026-02-23_091020.json | — |
| [DONE] | Latest Lighthouse summaries present | /TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.* | — |
| [DONE] | Audit Ledger updated and authoritative | /TOA_Audit_Ledger_Master.md | This file |
| [DONE] | Master Checklist converted to status-driven live tracker | /TOA_Master_Checklist_Live.md | This file |
| [DONE] | Release QA Matrix baseline present | /TOA_Release_QA_Matrix.md | Updated in this session |
| [DONE] | Delivery contract present | /TOA_Session_Delivery_Contract.md | — |
| [DONE] | Audit execution bridge present | /TOA_Website_Audit_Execution_Bridge_v1.md | — |
| [BLOCKED] | Deep research seed report available for reconciliation | deep-research-report(3).md | Not present in /mnt/data (upload to unblock) — ID-004 |

---

## 2) Architecture + Tooling
| Status | Item | Primary files | Issue / Notes |
|---|---|---|---|
| [DONE] | Static hosting constraints enforced (no server-side secrets) | Rules v5 | — |
| [DONE] | Core tooling exists: dev-check, link-scan, generate-static, static-serve | /tools/*.mjs | — |
| [DONE] | Pre-rendered music track pages exist (static SEO path) | /music/tracks/**/index.html | — |
| [IN PROGRESS] | Minification / build pipeline strategy (src→dist) | /tools + repo structure | ID-017 |
| [IN PROGRESS] | bfcache blocker identification + resolution | global JS/runtime | ID-018 |
| [IN PROGRESS] | Global head preconnect normalization applied + idempotent | all HTML + tools/toa-mega-wave-c__preconnect-normalize.mjs | ID-028, ID-032 (pending local LHCI) |

---

## 3) Navigation / Dropdowns / Carousels

**Wave 01 note:** P0 fixes have been implemented in code and are awaiting local QA + Lighthouse confirmation.

| Status | Item | Primary files | Issue / Notes |
|---|---|---|---|
| [IN PROGRESS] | Mobile header panel alignment + sizing fixed (S24) | css/style.css + js/global.js | ID-005 (Wave M desktop edge-alignment follow-up applied; pending local QA) |
| [IN PROGRESS] | Nested submenu behavior rebuilt (no massive gap) | css/style.css + js/global.js | ID-005 (Wave M desktop submenu edge-alignment + outside-click stability applied; pending local QA) |
| [IN PROGRESS] | Home Featured Albums horizontal carousel (touch + keyboard) | index.html + css/style.css + js/global.js | ID-006 (Wave N listener de-dup + SR guidance + mobile rail sizing; pending local QA) |
| [IN PROGRESS] | Carousel/rail interaction polish (labels, focus, reduced motion) | global components | ID-006 + ID-009 + ID-032 (Wave N reduced-motion/shared-handler continuity retained; pending local QA) |

---

## 4) Responsive Layout (Mobile / Tablet / Desktop / Ultrawide)
| Status | Item | Primary files | Issue / Notes |
|---|---|---|---|
| [IN PROGRESS] | Fix card/section box overflow on mobile (no edge bleed) | css/style.css (+ page CSS) | ID-007 |
| [IN PROGRESS] | Publishing CLS stabilized (≤0.10) | publishing.html + css/publishing.css + js/publishing.js | ID-012 (Wave H structural hardening applied; local LHCI verification pending) |
| [IN PROGRESS] | Responsive images / hero sizing & srcset rollout | assets/images + HTML | ID-014 (Wave O added Home hero `img srcset/sizes`; broader asset variant rollout still pending) |

---

## 5) Accessibility (Keyboard, Screen Reader, Reduced Motion, Forced Colors)
| Status | Item | Primary files | Issue / Evidence |
|---|---|---|---|
| [DONE] | Skip link present on all HTML pages | bundle verification | {skip_ok}/{tot_pages} pages |
| [DONE] | `<main id="main-content">` present on all HTML pages | bundle verification | {main_ok}/{tot_pages} pages |
| [DONE] | Exactly one `<h1>` per page | bundle verification | {h1_ok}/{tot_pages} pages |
| [IN PROGRESS] | Fix label-content-name mismatch (remove/align aria-label) | global HTML/header/footer + js/album.js + js/track.js + js/book.js | ID-008 (Wave D applied; local runtime/LHCI verification pending) |
| [IN PROGRESS] | Fix color contrast failures (light/dark) | css/style.css (+ page CSS) | ID-009 |
| [IN PROGRESS] | Inline links not color-only (underline/indicator) | css/style.css | ID-010 (Wave F patch applied; pending LHCI verification) |
| [IN PROGRESS] | Publishing ARIA required-children fixed | publishing.html + js/publishing.js | ID-011 |
| [DONE] | Forced-colors + reduced-motion support hardened for global nav controls | css/style.css + js/global.js | ID-032 |

---

## 6) Performance (Lighthouse + Core Web Vitals)
| Status | Item | Primary files | Issue / Notes |
|---|---|---|---|
| [IN PROGRESS] | Remove console errors on core pages (console-clean gate) | js/global.js + modules | ID-013 |
| [IN PROGRESS] | Enforce no inline handlers / no inline style attrs via CI dev-check gates | tools/dev-check.mjs + package.json | ID-013 + ID-032 (Wave L tooling applied; pending local runtime/LHCI verification) |
| [IN PROGRESS] | Reduce LCP on Music/Index/Publishing/Search | images + critical CSS/JS + head hints | ID-014 + ID-028 (Wave I containment + Wave O Home hero responsive `img` candidate hint applied; pending LHCI verification) |
| [IN PROGRESS] | Search page perf uplift (≥95) | search/search.* | ID-016 (Wave I reduced non-home first-view payload; further search-specific optimization still needed) |
| [NOT STARTED] | Minify CSS/JS in production build | build pipeline | ID-017 |
| [IN PROGRESS] | Serve responsive images / right-size first view | images + HTML | ID-014 (Home hero responsive preload + Wave O `img srcset/sizes` applied; variant generation still pending) |

---

## 7) SEO / Social / Schema
| Status | Item | Primary files | Issue / Notes |
|---|---|---|---|
| [DONE] | Canonical + OG/Twitter tags present on item pages | bundle patterns | Spot-check needed per page type |
| [IN PROGRESS] | Resolve duplicate track slugs (one canonical per track) | music/tracks/** | ID-015 (Phase 2 alias route pruning applied; local SEO/LHCI verification pending) |
| [IN PROGRESS] | Sitemap contains canonical HTML URLs only (legacy query/templates + lyrics TXT excluded) | sitemap.xml + tools/generate-static.mjs | ID-015 + ID-033 (Wave J implementation applied; local runtime/LHCI verification pending) |
| [IN PROGRESS] | Decide how to score 404 SEO (noindex expected) | 404.html | ID-019 |

---

## 8) Privacy / Legal / Trust
| Status | Item | Primary files | Issue / Notes |
|---|---|---|---|
| [IN PROGRESS] | Store/Merch/Digital store truth + consistency review | merch.html + digital-store.html | ID-021 |
| [IN PROGRESS] | Privacy/Terms reflect any third-party services (embeds, analytics, commerce) | privacy.html + terms.html | ID-021 |
| [NOT STARTED] | Accessibility statement page (target-required) | new page | Rules v5 §12 |

---

## 9) Platform Readiness (Music / Publishing / Games / Apps / Store)
| Status | Item | Primary files | Issue / Notes |
|---|---|---|---|
| [DONE] | Music library + album/track templates present | music.html + album.html + track.html | — |
| [IN PROGRESS] | Publishing page polished empty state + stable layout | publishing.html | ID-020 + ID-012 |
| [IN PROGRESS] | Games hub premium catalog & first game plan | games.html + new /games/* | Wave K added truthful hub/catalog + quick filters (pending local QA) — ID-034 |
| [IN PROGRESS] | Apps hub premium catalog plan | apps.html + new /apps/* | Wave K added truthful launch-now links to live web tools (pending local QA) — ID-034 |
| [IN PROGRESS] | Store/Merch hub alignment | merch.html + digital-store.html | Wave K disclosure hardening applied; awaiting local QA + external storefront URLs — ID-021 |

---

## 10) How This Checklist Must Be Maintained (Anti-Drift Rules)
1) Every patch session must reference Issue IDs and update statuses in **both**:
   - `TOA_Audit_Ledger_Master.md` (issue state: OPEN → FIXED → VERIFIED)
   - `TOA_Master_Checklist_Live.md` (status tags + short notes)
2) If a patch changes global UI (header/footer/tokens), QA must re-run **Core Release Gate**.
3) Any item marked `[DONE]` must have **evidence**:
   - bundle timestamp, Lighthouse run, or device screenshots.
4) Anything uncertain becomes `[BLOCKED]` with the exact missing dependency.

---

## 11) Session Log (append-only)
### 2026-02-23
- **Done (this session):** Tracker normalization; ledger/checklist/QA matrix/decisions log/p0 plan created or updated.
- **Next:** Patch Wave 01 (P0) implementation.

### 2026-02-23 (MEGA WAVE C)
- **Done:** Applied preconnect/dns-prefetch normalization across all HTML via `tools/toa-mega-wave-c__preconnect-normalize.mjs --apply` (ID-028 / G-01.5).
- **QA:** `dev-check --ci` PASS, `link-scan --ci` PASS, runtime+Lighthouse blocked in sandbox due to missing browser executables (ID-032).
- **Next:** Run LOCAL QA PACK (Playwright + LHCI) and then advance to duplicate track route canonicalization (ID-015).


### 2026-02-24 (MEGA WAVE G)
- **Done:** Pruned 10 legacy duplicate track alias static routes so only canonical pre-rendered track pages remain (ID-015 / I-02.1).
- **QA:** `dev-check --ci` PASS, `link-scan --ci` PASS; runtime+Lighthouse blocked in sandbox due to missing browser executables.
- **Next:** Run LOCAL QA PACK for runtime + LHCI, then advance to Publishing CLS/LCP wave (ID-012 / ID-014).

### 2026-02-24 (MEGA WAVE H)
- **Done:** Stabilized Publishing library structure and empty-state rendering to reduce CLS risk (ID-012 / H-01.1 / F-01.2).
- **QA:** `dev-check --ci` PASS, `link-scan --ci` PASS; runtime+Lighthouse blocked in sandbox due to missing browser executables.
- **Next:** Run LOCAL QA PACK for Publishing runtime + LHCI, then advance to Home/Music LCP optimization (ID-014 / F-01.1).


### 2026-02-24 (MEGA WAVE I)
- **Done:** Applied performance-layer critical path containment by limiting full-page ToA hero image background to Home and adding responsive Home hero image preload hint (ID-014 / ID-016 / F-01.1 / F-02.3).
- **QA:** `dev-check --ci` PASS, `link-scan --ci` PASS; runtime+Lighthouse blocked in sandbox due to missing browser executables.
- **Next:** Run LOCAL QA PACK for runtime + LHCI and then execute search-specific render/JS budget optimization (ID-016).


### 2026-02-24 (MEGA WAVE J)
- **Done:** Implemented SEO indexing hygiene layer by updating sitemap generation to include canonical HTML routes only, regenerated `sitemap.xml` without lyrics TXT URLs, and aligned `robots.txt` crawl directives to keep legacy templates and `/404.html` out of indexing scope (ID-033, G-04.1, G-04.2).
- **QA:** `dev-check --ci` PASS, `link-scan --ci` PASS; runtime+Lighthouse blocked in sandbox due to missing browser executables.
- **Next:** Run LOCAL QA PACK for runtime + LHCI SEO checks, then advance to site-wide OG/Twitter completeness sweep (G-02.1/G-02.2).



### 2026-02-24 (MEGA WAVE K)
- **Done:** Converted Games/Apps/Store surfaces into truthful static hubs: Games readiness filters + planning catalog, Apps launch-now links to live web tools, Store/Merch checkout/disclosure-first copy.
- **QA:** `dev-check --ci` PASS, `link-scan --ci` PASS; runtime+Lighthouse blocked in sandbox due missing browser executables.
- **Next:** Run LOCAL QA PACK for runtime + LHCI, then implement K-01.2 first-playable game MVP controls/accessibility plan.

### 2026-02-24 (MEGA WAVE L)
- **Done:** Hardened console/CSP governance layer by adding `--strict-no-inline-handler` gate in `tools/dev-check.mjs` and wiring no-inline handler/style enforcement into CI/runtime npm scripts.
- **QA:** `dev-check --ci` PASS, `link-scan --ci` PASS; runtime+Lighthouse blocked in sandbox due missing Playwright Chrome Headless Shell and no Chrome/Chromium binary.
- **Next:** Run LOCAL QA PACK runtime + LHCI commands, then close ID-013/L-01.1 once browser gate confirms console-clean across core pages.


### 2026-02-24 (MEGA WAVE M)
- **Done:** Hardened desktop navigation dropdown stability by adding viewport-edge-aware submenu alignment and resize-time repositioning to prevent clipping/trap behavior while preserving inside-click interaction (ID-005 / B-02.1 / B-02.3).
- **QA:** `dev-check --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` PASS, `link-scan --ci` PASS; runtime+Lighthouse blocked in sandbox due missing Playwright `chrome-headless-shell` and missing Chrome/Chromium executable.
- **Next:** Run LOCAL QA PACK runtime + LHCI + manual nav regression matrix, then close B-layer nav items to VERIFIED.

### 2026-02-24 (MEGA WAVE N)
- **Done:** Hardened Home Featured Albums rail by removing duplicate keyboard handlers, adding explicit screen-reader instructions, and tightening mobile card width/snap padding to keep horizontal rail behavior stable (ID-006 / C-01.1 / C-01.2 / C-01.3).
- **QA:** `dev-check --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` PASS, `link-scan --ci` PASS; runtime+Lighthouse blocked in sandbox due missing browser executables.
- **Next:** Run LOCAL QA PACK for runtime + LHCI + manual Home rail keyboard/touch regression, then advance to C-02 hero typography/LCP polish.

### 2026-02-24 (MEGA WAVE O)
- **Done:** Applied Homepage hero polish layer: fluid hero typography across breakpoints, dedicated subtitle styling, CTA focus-visible/touch-target hardening, and responsive hero image candidate hints via `srcset/sizes` (ID-014 / ID-006 / C-02.1 / C-02.2 / C-02.3).
- **QA:** `dev-check --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` PASS, `link-scan --ci` PASS; runtime+Lighthouse blocked in sandbox due missing browser executables.
- **Next:** Run LOCAL QA PACK for runtime + LHCI + manual Home hero typography/focus regression, then advance to B-02.2 desktop multi-level submenu parity.
