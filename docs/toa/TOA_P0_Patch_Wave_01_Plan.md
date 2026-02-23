# TOA P0 Patch Wave 01 — Implementation Plan

**Plan date:** 2026-02-23 (Australia/Brisbane)  
**Wave objective:** Close all P0 blockers that prevent a “premium, stable, accessible” baseline on mobile and core pages.  
**Scope:** P0 issues only (see `TOA_Audit_Ledger_Master.md`).  
**This document is execution order** — follow it sequentially to reduce regressions.

---

## P0 Issues In Scope (Wave 01)
- **ID-005** Mobile header dropdown misalignment + nested submenu gap (S24)
- **ID-006** Home Featured Albums carousel behavior broken on mobile
- **ID-007** Mobile card/section overflow / edge bleed (S24)
- **ID-008** A11y label-content-name mismatch (site-wide)
- **ID-009** A11y color contrast failures
- **ID-011** Publishing ARIA required-children failure
- **ID-012** Publishing CLS ~0.397 (severe)
- **ID-013** Console errors on core pages (Lighthouse)

*Optional within Wave 01 if it’s “free” once touching global CSS:*
- **ID-010** Links rely on color (underline/indicator)

---

## Pre-Flight (must do before coding)
### PF-1 — Capture baseline evidence (do not skip)
1) Run static scan:
   - `node tools/dev-check.mjs --ci`
2) Run runtime scan (captures console):
   - `node tools/dev-check.mjs --runtime --ci`
3) Run link scan:
   - `node tools/link-scan.mjs`
4) Run Lighthouse (mobile + desktop) against local origin:
   - `node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json`
   - `node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json`

**Output artifacts to keep:** dev-check JSON report + any console traces + LHCI output.  
**Goal:** identify exact console errors and the elements causing a11y failures.

---

## Patch Order (Wave 01)

**Wave 01 implementation status (this session):** Code changes applied for PATCH 01–06 scope items; all require local QA + LHCI confirmation.


### PATCH 01 — Fix `label-content-name-mismatch` + link distinguishability + contrast foundations
**Targets:** ID-008, ID-010, ID-009  
**Why first:** These are global, affect Lighthouse across many pages, and are low-risk if done correctly.

**Files to change (expected):**
- `css/style.css` (link styling + contrast token adjustments + forced-colors safe)
- Header/footer link markup across pages (prefer a single-source edit if templated):
  - If header/footer is baked into every HTML file, update the generator path:
    - `tools/generate-static.mjs` (if it controls footer/header rewriting)
  - Otherwise: multi-file change across all top-level pages and any injected HTML fragments.

**Implementation rules:**
- Remove `aria-label` from links/buttons that already have clear visible text.
- Keep `aria-label` for icon-only controls; ensure the accessible name contains the visible label string.
- Ensure inline text links have an underline or non-color indicator by default.
- Fix contrast in both light and dark; keep the premium palette but pass WCAG.

**QA after PATCH 01:**
- Re-run:
  - `node tools/dev-check.mjs --ci`
  - `node tools/dev-check.mjs --runtime --ci`
- Quick Lighthouse on Home + Music + Publishing:
  - confirm `label-content-name-mismatch` and `link-in-text-block` improve/passing
  - confirm contrast improves (may need iteration)

---

### PATCH 02 — Mobile Header + Dropdown Architecture Fix (S24)
**Targets:** ID-005  
**Why second:** It’s the highest visible UX blocker; also interacts with any global a11y adjustments from Patch 01.

**Files to change (expected):**
- `css/style.css` (mobile menu panel layout, alignment, sizing, safe-area padding)
- `js/global.js` (menu open/close, nested submenu toggles, focus management)
- Potentially header markup (if submenu structure needs adjustment)

**Target behavior:**
- Mobile menu panel visually aligned and sized correctly on:
  - 360×740 and 412×915 (S24)
- Music submenu opens as a dedicated nested panel (not blank whitespace expansion).
- Submenu lists scroll inside the panel if needed; no page jump.

**QA after PATCH 02:**
- Manual:
  - S24 viewport: open/close menu, open music submenu, close submenu, rotate.
  - Keyboard: tab through menu; focus visible; escape closes.
- Automated:
  - `node tools/dev-check.mjs --runtime --ci`
  - Ensure no new console errors; no layout shift spikes.

---

### PATCH 03 — Fix Mobile “Box” Overflow / Edge Bleed
**Targets:** ID-007  
**Why now:** Overflow fixes rely on stable nav and global token states.

**Files to change (expected):**
- `css/style.css` (global section/card sizing; clamp widths; box-sizing; gutters)
- Possibly page CSS where specialized components break:
  - `css/music.css`, `css/publishing.css`, `css/album.css`, `css/track.css`

**QA after PATCH 03:**
- Manual:
  - S24: confirm no horizontal scroll; check the worst sections (cards, headings, any bordered blocks).
  - Forced-colors: check outlines and focus still visible.
- Lighthouse spot check: Home + Music (CLS stable, no overflow-related layout shift)

---

### PATCH 04 — Home Featured Albums Carousel Behavior (Mobile + Keyboard)
**Targets:** ID-006  
**Files to change (expected):**
- `index.html` (ensure correct carousel structure + classes)
- `css/style.css` (rail/scroll-snap polish)
- `js/music-ui.js` (or add a small home-only module if cleaner)

**Target behavior:**
- Mobile: horizontal rail (drag/scroll), snap points, no vertical stacking.
- Buttons: visible, labeled, keyboard-operable.
- Reduced-motion: disables animated scroll.

**QA after PATCH 04:**
- Manual: S24 + desktop mouse + keyboard.
- Automated: dev-check runtime; Lighthouse Home.

---

### PATCH 05 — Publishing Page ARIA + CLS Stabilization
**Targets:** ID-011, ID-012  
**Files to change (expected):**
- `publishing.html`
- `css/publishing.css`
- `js/publishing.js`
- `js/publishing-data.js` (only if needed; keep “no placeholders” truth rule)

**Target behavior:**
- No ARIA required-children failures.
- CLS ≤ 0.10 (mobile).
- Empty state (if no books) looks intentional and stable (no jump).

**QA after PATCH 05:**
- Lighthouse Publishing (mobile) until CLS and a11y pass.
- Keyboard navigation through Publishing UI.

---

### PATCH 06 — Console Errors: Root-Cause + Eliminate (Core Pages)
**Targets:** ID-013  
**Files to change (unknown until PF-1 evidence):**
- likely `js/global.js`, `js/utils.js`, and page modules (`js/music.js`, `js/publishing.js`, `search/search.js`)

**Implementation rule:**
- Fix root cause, not symptoms.  
- Enforce: “zero console errors” on Core Release Gate pages.

**QA after PATCH 06:**
- `node tools/dev-check.mjs --runtime --ci` must be clean.
- Lighthouse: errors-in-console must pass across core pages.

---

## Wave 01 Exit Criteria (Definition of Done)
Wave 01 is CLOSED only when:
1) **Mobile nav is premium-stable** on S24 + small phone (ID-005 CLOSED)
2) **Home Featured Albums** is a real carousel rail on mobile (ID-006 CLOSED)
3) **No horizontal overflow** on mobile for core pages (ID-007 CLOSED)
4) **Accessibility:**
   - `label-content-name-mismatch` passes (ID-008 CLOSED)
   - `color-contrast` passes (ID-009 CLOSED)
   - Publishing ARIA passes (ID-011 CLOSED)
5) **Publishing CLS ≤ 0.10** (ID-012 CLOSED)
6) **Console clean** on core pages (ID-013 CLOSED)
7) QA Matrix updated with PASS/FAIL evidence for:
   - viewports (including S24)
   - light/dark
   - reduced motion
   - forced colors

---

## Patch Session Output Contract (when executing this plan)
Every patch session must output:
1) Patch Summary
2) File Manifest (exact repo paths changed/added)
3) Downloads (ZIP + individual files if possible)
4) Website Work Checklist (DONE / NEXT / RISKS referencing Issue IDs)
5) QA Checklist (PASS / FAIL / NOT RUN)
6) Continuation Prompt

