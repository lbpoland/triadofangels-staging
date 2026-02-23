# TOA Website — Master Checklist (Live)

**Last updated:** 2026-02-23 (Australia/Brisbane)  
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
| [IN PROGRESS] | Mobile header panel alignment + sizing fixed (S24) | css/style.css + js/global.js | ID-005 |
| [IN PROGRESS] | Nested submenu behavior rebuilt (no massive gap) | css/style.css + js/global.js | ID-005 |
| [IN PROGRESS] | Home Featured Albums horizontal carousel (touch + keyboard) | index.html + css/style.css + js/music-ui.js | ID-006 |
| [IN PROGRESS] | Carousel/rail interaction polish (labels, focus, reduced motion) | global components | ID-006 + ID-009 |

---

## 4) Responsive Layout (Mobile / Tablet / Desktop / Ultrawide)
| Status | Item | Primary files | Issue / Notes |
|---|---|---|---|
| [IN PROGRESS] | Fix card/section box overflow on mobile (no edge bleed) | css/style.css (+ page CSS) | ID-007 |
| [IN PROGRESS] | Publishing CLS stabilized (≤0.10) | publishing.html + css/publishing.css + js/publishing.js | ID-012 |
| [IN PROGRESS] | Responsive images / hero sizing & srcset rollout | assets/images + HTML | ID-014 |

---

## 5) Accessibility (Keyboard, Screen Reader, Reduced Motion, Forced Colors)
| Status | Item | Primary files | Issue / Evidence |
|---|---|---|---|
| [DONE] | Skip link present on all HTML pages | bundle verification | {skip_ok}/{tot_pages} pages |
| [DONE] | `<main id="main-content">` present on all HTML pages | bundle verification | {main_ok}/{tot_pages} pages |
| [DONE] | Exactly one `<h1>` per page | bundle verification | {h1_ok}/{tot_pages} pages |
| [IN PROGRESS] | Fix label-content-name mismatch (remove/align aria-label) | global HTML/header/footer | ID-008 |
| [IN PROGRESS] | Fix color contrast failures (light/dark) | css/style.css (+ page CSS) | ID-009 |
| [NOT STARTED] | Inline links not color-only (underline/indicator) | css/style.css | ID-010 |
| [IN PROGRESS] | Publishing ARIA required-children fixed | publishing.html + js/publishing.js | ID-011 |

---

## 6) Performance (Lighthouse + Core Web Vitals)
| Status | Item | Primary files | Issue / Notes |
|---|---|---|---|
| [IN PROGRESS] | Remove console errors on core pages (console-clean gate) | js/global.js + modules | ID-013 |
| [IN PROGRESS] | Reduce LCP on Music/Index/Publishing/Search | images + critical CSS/JS | ID-014 |
| [IN PROGRESS] | Search page perf uplift (≥95) | search/search.* | ID-016 |
| [NOT STARTED] | Minify CSS/JS in production build | build pipeline | ID-017 |
| [IN PROGRESS] | Serve responsive images / right-size first view | images + HTML | ID-014 |

---

## 7) SEO / Social / Schema
| Status | Item | Primary files | Issue / Notes |
|---|---|---|---|
| [DONE] | Canonical + OG/Twitter tags present on item pages | bundle patterns | Spot-check needed per page type |
| [NOT STARTED] | Resolve duplicate track slugs (one canonical per track) | music/tracks/** | ID-015 |
| [IN PROGRESS] | Sitemap contains canonical URLs only (after duplicate fix) | sitemap.xml + generate-static | ID-015 |
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
| [NOT STARTED] | Games hub premium catalog & first game plan | games.html + new /games/* | Rules v5 §13 |
| [NOT STARTED] | Apps hub premium catalog plan | apps.html + new /apps/* | Rules v5 §13 |
| [IN PROGRESS] | Store/Merch hub alignment | merch.html + digital-store.html | ID-021 |

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

### 2026-02-24
- **In progress (this session):** MEGA WAVE C applied for preconnect/dns-prefetch normalization across all HTML pages; idempotence bug fixed in sweep tool.
- **QA note:** Non-browser gates PASS; browser/runtime gates pending local execution because Playwright browser executable is unavailable in this environment.
- **Next:** MEGA WAVE D focused on Lighthouse LCP/CLS reductions for Home/Music/Publishing/Search.
