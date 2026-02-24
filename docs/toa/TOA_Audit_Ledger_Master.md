# TOA Website — Audit Ledger (Master)

**Last updated:** 2026-02-24 (Australia/Brisbane) — MEGA WAVE N update  
**Scope:** Baseline normalization + tracker hardening (no code changes in this session)  
**Canonical domain:** https://www.triadofangels.com  
**Hosting:** GitHub Pages (static hosting)

---

## Authority + Source Pack (for this ledger)
**Authority order (hard law):**
1) Latest Website Rules & Master Outline (v5.0)  
2) Project Instructions (v2 LOCKED)  
3) Latest `TOA_SITE_MANIFEST__*.json`  
4) Latest `TOA_SITE_BUNDLE__*.md`  
5) Latest Lighthouse / QA artifacts  
6) deep-research-report(3).md (seed only; **NOT PRESENT in current project files**)  
7) Screenshots (QA evidence only)

**Files used (present in this project pack):**
- `/TOA_Website_Rules_Master_Outline_v5.md`
- `/TOA_Project_Instructions_v2_LOCKED.md`
- `/TOA_SITE_MANIFEST__2026-02-23_091020.json`
- `/TOA_SITE_BUNDLE__2026-02-23_091020.md`
- `/TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json` (+ `.md`)
- `/TOA_Session_Delivery_Contract.md`
- `/TOA_Website_Session_Response_Contract_v1.md`
- `/TOA_Website_Audit_Execution_Bridge_v1.md`

**Missing:** `deep-research-report(3).md` (cannot merge its findings until it’s uploaded into this Project pack)

---

## Severity Definitions
- **P0 Critical:** broken flows, blocking accessibility failures, severe mobile regressions, console errors, security/trust blockers
- **P1 High:** major UX/perf/SEO issues, duplicate content routes, significant polish gaps affecting conversion/discovery
- **P2 Medium:** meaningful enhancements, build pipeline hardening, performance polish
- **P3 Future:** platform expansion, optional premium upgrades, long-horizon tooling

---

## Bundle / HTML Baseline (quick structural sanity)
- HTML pages checked (bundle): **280**
- Skip link present: **280/280**
- `<main id="main-content">` present: **280/280**
- Exactly one `<h1>` present: **280/280**

---

## Lighthouse Baseline Snapshot (from `TOA_LIGHTHOUSE_SUMMARY__2026-02-23_091020.json`)
> Scores shown as **%** (0–100). Perf shown as **min/median** across 3 runs per page.

| Page | Runs | Perf (min/med) | A11y (min) | BP (min) | SEO (min) | LCP (median ms) | CLS (max) | Notes |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `/publishing.html` | 3 | 51/51 | 91 | 96 | 100 | 5793 | 0.397 | Severe CLS + a11y fails |
| `/music.html` | 3 | 67/67 | 96 | 96 | 100 | 7440 | 0.026 | Worst LCP |
| `/privacy.html` | 3 | 74/75 | 93 | 96 | 100 | 6306 | 0 |  |
| `/contact.html` | 3 | 75/75 | 96 | 96 | 100 | 6156 | 0 |  |
| `/digital-store.html` | 3 | 77/78 | 91 | 96 | 100 | 5863 | 0 |  |
| `/index.html` | 3 | 77/78 | 95 | 96 | 100 | 6235 | 0 |  |
| `/search/` | 3 | 79/79 | 96 | 96 | 100 | 5408 | 0.02 |  |
| `/album.html?album=wings-of-fire` | 3 | 81/81 | 96 | 96 | 100 | 3488 | 0 |  |
| `/track.html?album=wings-of-fire&track=awakening-the-triad` | 3 | 81/81 | 96 | 96 | 100 | 3489 | 0.009 |  |
| `/404.html` | 3 | 85/85 | 93 | 96 | 69 | 4356 | 0 | SEO low expected (noindex) |

---

## Patch Wave 01 — P0 Implementation Log
- **Date:** 2026-02-23 (Australia/Brisbane)
- **Scope:** P0 only (ID-005/006/007/008/009/011/012/013)
- **Files changed:** `css/style.css`, `js/global.js`, `publishing.html`, `css/publishing.css`, `js/publishing.js`
- **Verification state:** **PENDING LOCAL QA** (run dev-check + LHCI per `TOA_P0_Patch_Wave_01_Plan.md`)


## Patch Wave 02 — Mega Wave C (Head Connection Warm-Up)
- **Date:** 2026-02-24 (Australia/Brisbane)
- **Scope:** Performance head normalization aligned to DEC-017 and checklist G-01.5 / ID-014 risk reduction
- **Files changed:** 280 HTML files (site-wide sweep) + tracker docs + `tools/toa-mega-wave-c__preconnect-normalize__report.json`
- **Implementation:** Added/normalized `preconnect` + `dns-prefetch` for `fonts.googleapis.com` and `fonts.gstatic.com` in every HTML file that loads Google Fonts.
- **Verification state:** **PARTIAL PASS / PENDING LOCAL BROWSER QA**
  - `node tools/dev-check.mjs --ci` PASS
  - `node tools/link-scan.mjs` PASS
  - `node tools/dev-check.mjs --runtime --ci` FAIL in sandbox due missing Playwright browser executable
  - LHCI mobile+desktop blocked in sandbox due missing Chrome/Chromium binary


## Patch Wave 03 — Mega Wave G (Canonical Track Route Hardening)
- **Date:** 2026-02-24 (Australia/Brisbane)
- **Scope:** SEO/routing integrity for pre-rendered track corpus (ID-015 / I-02.1).
- **Files changed:** 10 legacy alias track pages removed + governance tracker updates.
- **Verification state:** **PARTIAL PASS / PENDING LOCAL BROWSER QA**
  - `node tools/dev-check.mjs --ci` PASS
  - `node tools/link-scan.mjs --ci` PASS
  - `node tools/dev-check.mjs --runtime --ci` FAIL in sandbox due missing Playwright browser executable
  - LHCI mobile+desktop blocked in sandbox due missing Chrome/Chromium binary



## Patch Wave 04 — Mega Wave H (Publishing CLS + Empty-State Stabilization)
- **Date:** 2026-02-24 (Australia/Brisbane)
- **Scope:** Publishing layout stability hardening under static/no-placeholder constraints (ID-012 / H-01.1 / F-01.2).
- **Files changed:** `publishing.html`, `css/publishing.css`, `js/publishing.js` + governance tracker updates.
- **Verification state:** **PARTIAL PASS / PENDING LOCAL BROWSER QA**
  - `node tools/dev-check.mjs --ci` PASS
  - `node tools/link-scan.mjs --ci` PASS
  - `node tools/dev-check.mjs --runtime --ci` FAIL in sandbox due missing Playwright browser executable
  - LHCI mobile+desktop blocked in sandbox due missing Chrome/Chromium binary



## Patch Wave 05 — Mega Wave I (Critical Path LCP Containment)
- **Date:** 2026-02-24 (Australia/Brisbane)
- **Scope:** Performance critical-path reduction for core routes by limiting heavyweight ToA background imagery to Home + preloading Home hero candidate (ID-014 / ID-016 / F-01.1 / F-02.3).
- **Files changed:** `css/style.css`, `index.html` + governance tracker updates.
- **Verification state:** **PARTIAL PASS / PENDING LOCAL BROWSER QA**
  - `node tools/dev-check.mjs --ci` PASS
  - `node tools/link-scan.mjs --ci` PASS
  - `node tools/dev-check.mjs --runtime --ci` FAIL in sandbox due missing Playwright browser executable
  - LHCI mobile+desktop blocked in sandbox due missing Chrome/Chromium binary


## Patch Wave 06 — Mega Wave J (SEO Indexing Hygiene)
- **Date:** 2026-02-24 (Australia/Brisbane)
- **Scope:** SEO indexing hygiene for canonical crawl corpus and robots/sitemap alignment (ID-033 / G-04.1 / G-04.2).
- **Files changed:** `tools/generate-static.mjs`, `sitemap.xml`, `robots.txt` + governance tracker updates.
- **Verification state:** **PARTIAL PASS / PENDING LOCAL BROWSER QA**
  - `node tools/dev-check.mjs --ci` PASS
  - `node tools/link-scan.mjs --ci` PASS
  - `node tools/dev-check.mjs --runtime --ci` FAIL in sandbox due missing Playwright browser executable
  - LHCI mobile+desktop blocked in sandbox due missing Chrome/Chromium binary


## Patch Wave 07 — Mega Wave K (Games / Apps / Store Truth-First Readiness)
- **Date:** 2026-02-24 (Australia/Brisbane)
- **Scope:** Platform readiness and trust hardening for Games/Apps/Store static hubs (ID-021 / ID-034 / K-01.1 / K-02.1 / K-03.1).
- **Files changed:** `games.html`, `apps.html`, `digital-store.html`, `merch.html` + governance tracker updates.
- **Verification state:** **PARTIAL PASS / PENDING LOCAL BROWSER QA**
  - `node tools/dev-check.mjs --ci` PASS
  - `node tools/link-scan.mjs --ci` PASS
  - `node tools/dev-check.mjs --runtime --ci` FAIL in sandbox due missing Playwright browser executable
  - LHCI mobile+desktop blocked in sandbox due missing Chrome/Chromium binary


## Patch Wave 08 — Mega Wave L (Console/CSP Hard Gate Reinforcement)
- **Date:** 2026-02-24 (Australia/Brisbane)
- **Scope:** Console/CSP hardening layer by extending dev-check to fail on inline handlers and enforcing no-inline scripts in CI/runtime commands (ID-013 / ID-032 / L-01.1 / L-01.2).
- **Files changed:** `tools/dev-check.mjs`, `package.json` + governance tracker updates.
- **Verification state:** **PARTIAL PASS / PENDING LOCAL BROWSER QA**
  - `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` PASS
  - `node tools/link-scan.mjs --ci` PASS
  - `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler --runtime --require-playwright` FAIL in sandbox due missing Playwright browser executable (`chrome-headless-shell`)
  - LHCI mobile+desktop blocked in sandbox due missing Chrome/Chromium binary



## Patch Wave 09 — Mega Wave M (Navigation Desktop Dropdown Stability)
- **Date:** 2026-02-24 (Australia/Brisbane)
- **Scope:** Navigation-layer hardening for desktop dropdown placement and interaction continuity (ID-005 / B-02.1 / B-02.3 / B-03.1).
- **Files changed:** `js/global.js`, `css/style.css` + governance tracker updates.
- **Verification state:** **PARTIAL PASS / PENDING LOCAL BROWSER QA**
  - `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` PASS
  - `node tools/link-scan.mjs --ci` PASS
  - `node tools/dev-check.mjs --runtime --ci` FAIL in sandbox due missing Playwright browser executable (`chrome-headless-shell`)
  - LHCI mobile+desktop blocked in sandbox due missing Chrome/Chromium binary



## Patch Wave 10 — Mega Wave N (Home Featured Albums Rail Stabilization)
- **Date:** 2026-02-24 (Australia/Brisbane)
- **Scope:** Homepage carousel interaction/accessibility stability for Featured Albums rail (ID-006 / C-01.1 / C-01.2 / C-01.3).
- **Files changed:** `index.html`, `css/style.css`, `js/global.js` + governance tracker updates.
- **Verification state:** **PARTIAL PASS / PENDING LOCAL BROWSER QA**
  - `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` PASS
  - `node tools/link-scan.mjs --ci` PASS
  - `node tools/dev-check.mjs --runtime --ci` FAIL in sandbox due missing Playwright browser executable (`chrome-headless-shell`)
  - LHCI mobile+desktop blocked in sandbox due missing Chrome/Chromium binary

## Issue Index (quick navigation)
| ID | Severity | Status | Category | Summary | Primary files |
|---|---|---|---|---|---|
| ID-001 | P1 | OPEN | Governance | Normalize audit into living tracker docs | `TOA_*.md` trackers |
| ID-002 | P1 | OPEN | Workflow | Prevent “minimum page” audit drift | rules + instructions |
| ID-003 | P0 | OPEN (process control) | Workflow | Atomic delivery enforcement | delivery contract + process |
| ID-004 | P1 | BLOCKED | Audit | Deep-report reconciliation pending upload | deep-research-report(3).md |
| ID-005 | P0 | FIX IMPLEMENTED (PENDING LOCAL QA) | Navigation / Mobile | Mobile/desktop header dropdown alignment + submenu stability hardening applied (Wave 01 + Wave M) | `css/style.css`, `js/global.js`, header HTML generation |
| ID-006 | P0 | IMPLEMENTED (PENDING LOCAL QA) | Home / UX | Home Featured Albums rail hardened with single keyboard handler path, SR instructions, and mobile snap-width stability improvements | `index.html`, `css/style.css`, `js/global.js` |
| ID-007 | P0 | IMPLEMENTED (PENDING QA) | Responsive | Content “box” frames overflow viewport on S24 (horizontal clipping/edge bleed) | `css/style.css` (+ page CSS where needed) |
| ID-008 | P0 | IMPLEMENTED (PENDING QA) | Accessibility | `label-content-name-mismatch` across pages (visible text vs aria-label mismatch) | global HTML, footer/header, `css/style.css`, `js/album.js`, `js/track.js`, `js/book.js` |
| ID-009 | P0 | IMPLEMENTED (PENDING QA) | Accessibility | `color-contrast` failures (light/dark parity) | `css/style.css` (+ page CSS) |
| ID-010 | P1 | IMPLEMENTED (PENDING QA) | Accessibility | `link-in-text-block`: links rely on color only | `css/style.css` |
| ID-011 | P0 | IMPLEMENTED (PENDING QA) | Accessibility | Publishing page `aria-required-children` | `publishing.html`, `js/publishing.js`, `css/publishing.css` |
| ID-012 | P0 | HARDENED (PENDING QA) | Performance / UX | Publishing CLS mitigation strengthened (empty-state-first structure + deterministic UI state handling) | `publishing.html`, `css/publishing.css`, `js/publishing.js` |
| ID-013 | P0 | FIX IMPLEMENTED (PENDING LOCAL QA) | Stability | Lighthouse reports console errors on core pages; Wave L added stricter no-inline handler/style gate enforcement in dev-check/CI but browser runtime proof still pending locally | `js/global.js`, page modules, `tools/dev-check.mjs`, `package.json` |
| ID-014 | P1 | FIX IMPLEMENTED (PENDING QA) | Performance | LCP containment patch applied (Home-only heavy cinematic background + Home hero preload); awaiting local LHCI confirmation | images + CSS + critical path |
| ID-015 | P1 | FIX IMPLEMENTED (PENDING QA) | SEO | Duplicate/alias track static routes pruned to canonical-only corpus (10 alias routes removed) | `music/tracks/**/index.html` |
| ID-016 | P1 | IN PROGRESS | Performance / UX | Search perf baseline remains open; non-home heavy-background containment applied to reduce first-view cost pending local LHCI verification | `search/search.js`, `search/search.css`, `css/style.css` |
| ID-017 | P2 | OPEN | Build / Perf | Lighthouse flags minification + cache + compression strategy | tooling + build pipeline |
| ID-018 | P2 | OPEN | UX / Perf | `bf-cache` prevented on most pages (investigate) | global JS + embed patterns |
| ID-019 | P2 | OPEN | SEO | 404 SEO low (noindex/is-crawlable) — confirm intentional | `404.html` |
| ID-020 | P2 | OPEN | Platform | Publishing data + content roadmap (truthful, no placeholders) | `js/publishing-data.js`, `publishing.html` |
| ID-021 | P2 | FIX IMPLEMENTED (PENDING LOCAL QA) | Platform / Trust | Store/Merch/Digital Store truth + consistency pass | `merch.html`, `digital-store.html`, `streaming.html` |
| ID-034 | P2 | FIX IMPLEMENTED (PENDING LOCAL QA) | Platform / Readiness | Games/Apps truth-first hub readiness pass | `games.html`, `apps.html` |
| ID-032 | P1 | FIX IMPLEMENTED (PENDING QA) | Performance + Accessibility | ToA global background rendering hardening (mobile variant, reduced-motion, forced-colors, no fixed attachment) | `css/style.css` |
| ID-033 | P1 | FIX IMPLEMENTED (PENDING QA) | SEO / Indexing | Sitemap now indexes canonical HTML pages only and robots disallows legacy templates + 404 path | `tools/generate-static.mjs`, `sitemap.xml`, `robots.txt` |

---

## Issues (detailed)

### ID-001 — Full Coverage Audit Not Normalized Into Project Tracking Files
- **Severity:** P1
- **Category:** Governance
- **Status:** IN PROGRESS
- **Affected pages:** All
- **Affected files:** `TOA_Audit_Ledger_Master.md`, `TOA_Master_Checklist_Live.md`, `TOA_Release_QA_Matrix.md`
- **Root cause:** Audit narrative existed, but the project lacked a maintained tracker system.
- **Why it matters:** Causes drift and repeated rediscovery of the same problems.
- **Required fix:** Maintain these trackers as canonical living documents; every patch wave must update statuses and close issues with evidence.
- **Acceptance criteria:**
  - Trackers exist in Project and are updated after every patch wave.
  - Patch sessions reference Issue IDs in the patch summary + checklist.
- **QA verification:** Confirm trackers are present and updated; confirm patch session outputs reference Issue IDs.

---

### ID-002 — Core Release Gate Misread Risk (“Minimum Page” Confusion)
- **Severity:** P1
- **Category:** Workflow
- **Status:** OPEN
- **Affected pages:** Audit process
- **Affected files:** rules + project instructions
- **Root cause:** Core page set can be mistaken for full audit scope.
- **Why it matters:** Whole systems/files can be skipped.
- **Required fix:** Enforce Full Coverage Rule + Coverage Map on audits; keep Core Gate as regression floor only.
- **Acceptance criteria:**
  - Coverage Map included for audit sessions.
  - Anything not audited is explicitly listed with reason.
- **QA verification:** Audit session outputs include Coverage Map + “Not Audited” list.

---

### ID-003 — Atomic Delivery Failures (Missing Files Claimed As Done)
- **Severity:** P0
- **Category:** Workflow
- **Status:** OPEN (process control)
- **Affected pages:** Session delivery process
- **Affected files:** `TOA_Session_Delivery_Contract.md`, `TOA_Project_Instructions_v2_LOCKED.md`
- **Root cause:** Past patch sessions occasionally claimed completion without shipping all files in downloads.
- **Why it matters:** Wastes time and breaks trust in patch handoff.
- **Required fix:** Strict atomic delivery rule: only downloadable files count as DONE; manifest must match ZIP contents.
- **Acceptance criteria:**
  - Every patch session outputs: Patch Summary → File Manifest → ZIP → Checklist → QA Checklist → Continuation Prompt.
  - ZIP contents == manifest == DONE list.
- **QA verification:** Compare ZIP with manifest and checklist for every patch wave.

---

### ID-004 — Deep-Research Findings Require Bundle-Level Reconciliation
- **Severity:** P1
- **Category:** Audit
- **Status:** BLOCKED (missing file)
- **Affected pages:** All
- **Affected files:** deep-research-report(3).md (not present), current bundle/manifest/Lighthouse
- **Root cause:** Deep report is referenced but not included in current Project pack.
- **Why it matters:** Cannot reliably merge and mark findings as verified/superseded without the source.
- **Required fix:** Upload `deep-research-report(3).md` into the Project; then reconcile each finding against the current bundle and assign Issue IDs or mark superseded.
- **Acceptance criteria:** Deep report is present; each deep-report item is mapped to an Issue ID or marked superseded.
- **QA verification:** Ledger contains a “Deep Report Reconciliation” section with per-item status.

---

### ID-005 — Mobile Header Dropdown Misalignment + Nested Submenu Gap
- **Severity:** P0
- **Category:** Navigation / Mobile
- **Status:** FIX IMPLEMENTED (PENDING LOCAL QA)
- **Evidence:** User S24 screenshots: dropdown panel shifted too far right; left gap; nested “Music” submenu expands creating massive vertical blank space.
- **Affected pages:** All (global header)
- **Affected files:** `css/style.css`, `js/global.js`, header markup in all HTML pages (prefer fixing via `tools/generate-static.mjs` patterns if header is templated)
- **Root cause (likely):** Mobile menu container sizing + alignment rules; nested dropdown expands in-flow instead of in a dedicated subpanel.
- **Wave 01 implementation:** Mobile submenu rebuilt as **second-panel navigation** (Option B). Removed mobile flyout transform + removed CSP-blocked inline style shifting. Mobile menu width normalized for S24-class devices; submenu panel overlays the primary panel with Back control, stable scroll, no blank gap.
- **Wave M implementation (2026-02-24):** Added desktop viewport-edge-aware submenu alignment (`.nav-submenu--align-right`) and resize-time repositioning for open dropdowns so nested navigation avoids clipping/interaction traps near viewport boundaries while preserving inside-click behavior and ESC/outside-close semantics.
- **Why it matters:** Core navigation becomes visually broken on mobile; harms conversion and trust.
- **Required fix (target behavior):**
  - Mobile menu panel width is intentional, centered/anchored consistently.
  - Top-level dropdown opens a dedicated nested panel (not huge whitespace expansion).
  - Tap targets remain ≥44px; keyboard navigation still works.
- **Acceptance criteria:**
  - On S24 viewport (412×915), menu aligns cleanly with no horizontal gap drift.
  - Opening Music submenu does **not** introduce excessive blank space; submenu lists are visible and scrollable if needed.
  - No layout shift when toggling submenu.
- **QA verification:**
  - Manual: S24 + small phone + tablet, light/dark, touch + keyboard.
  - Lighthouse: re-check “layout shift” and “tap targets” (manual).

---

### ID-006 — Home Featured Albums Not Behaving Like a Horizontal Carousel (Mobile)
- **Severity:** P0
- **Category:** Home / UX
- **Status:** IMPLEMENTED (PENDING LOCAL QA)
- **Evidence:** User reported Featured Albums stack vertically on Home instead of a left-right scroll rail.
- **Affected pages:** `index.html`
- **Affected files:** `index.html`, `css/style.css`, `js/global.js`
- **Root cause (likely):** Markup/class mismatch with existing carousel CSS, or missing JS initialization for the home rail.
- **Wave 01 implementation:** Home Featured Albums now uses a real **horizontal rail** on mobile via global CSS. Added keyboard scrolling + tabindex enhancement (ArrowLeft/ArrowRight/Home/End) for accessibility.
- **Mega Wave N implementation (2026-02-24):** Removed duplicate keyboard listeners so Arrow/Home/End does not double-scroll, added explicit screen-reader rail instructions (`aria-describedby`), and tightened mobile card width/snap padding to preserve horizontal behavior and prevent edge bleed.
- **Why it matters:** Breaks premium discovery feel and massively increases scroll friction on mobile.
- **Required fix:** Ensure Featured Albums uses the established carousel/rail pattern (scroll-snap + buttons + touch drag).
- **Acceptance criteria:**
  - Mobile: horizontal rail with snap and smooth drag; nav buttons work; no vertical stacking.
  - Keyboard: left/right controls available and labeled.
- **QA verification:** S24 + iOS/Safari-class behavior; check reduced motion.

---

### ID-007 — Mobile Content Cards Overflow / Edge Bleed (S24)
- **Severity:** P0
- **Category:** Responsive / Layout
- **Status:** IMPLEMENTED (PENDING QA)
- **Evidence:** User S24 screenshots show section “boxes” extending beyond viewport edges.
- **Affected pages:** Multiple (global component pattern)
- **Affected files:** `css/style.css` (core cards/sections), plus page CSS as needed
- **Root cause (likely):** Fixed widths, excessive horizontal padding, or `width: 100%` + border/shadow combined with negative margins; missing `box-sizing` constraints.
- **Wave 01 implementation:** Added global overflow guardrails (viewport-safe clipping) and media max-width rules to eliminate horizontal bleed on S24 while preserving intentional horizontal rails.
- **Why it matters:** Causes horizontal scrolling/clipping; looks broken and unprofessional.
- **Required fix:** Ensure cards/section frames clamp to viewport with consistent gutter and no overflow.
- **Acceptance criteria:**
  - No horizontal scroll on mobile.
  - Visual gutters consistent in light/dark.
- **QA verification:** Mobile (360×740 and 412×915) + forced-colors mode.

---

### ID-008 — Accessibility: Label / Accessible Name Mismatch (Site-wide)
- **Severity:** P0
- **Category:** Accessibility
- **Status:** IMPLEMENTED (PENDING QA)
- **Evidence:** Lighthouse audit `label-content-name-mismatch` failing on multiple pages.
- **Affected pages:** Multiple (global pattern)
- **Affected files:** Many HTML pages; header/footer link patterns; potentially `tools/generate-static.mjs` if it mass-edits head/footers
- **Root cause (confirmed pattern):** Links with visible text use `aria-label` that does **not** match visible text (example pattern: visible “Search” but aria-label “Open site search”).
- **Wave 01 implementation:** Added global runtime normalizer that removes mismatched `aria-label` from visibly-labeled links/buttons (so visible label becomes accessible name). Also converted glyph icons to generated content to reduce false-positive label detection.
- **Mega Wave D implementation (2026-02-24):** Updated runtime-generated album/track/book outbound-link `aria-label` patterns to start with visible text (e.g., `Spotify (opens in a new tab)`), aligning with DEC-018 and reducing mismatch risk before Lighthouse parsing.
- **Why it matters:** Screen readers announce a different name than what sighted users see; fails WCAG and Lighthouse.
- **Required fix:** 
  - Remove `aria-label` from links/buttons that already have clear visible text.
  - Keep `aria-label` only for icon-only controls or ambiguous controls.
  - If an `aria-label` is necessary, ensure it contains the visible label string verbatim.
- **Acceptance criteria:** Lighthouse `label-content-name-mismatch` passes on core pages.
- **QA verification:** Lighthouse + screen-reader spot checks (NVDA/VoiceOver as available).

---

### ID-009 — Accessibility: Color Contrast Failures
- **Severity:** P0
- **Category:** Accessibility
- **Status:** IMPLEMENTED (PENDING QA)
- **Evidence:** Lighthouse `color-contrast` failing on multiple pages.
- **Affected pages:** Multiple
- **Affected files:** `css/style.css` (tokens + global), plus page CSS
- **Root cause (unknown specifics):** Some text/background combinations under 4.5:1 (likely in light mode and/or muted copy).
- **Wave 01 implementation:** Light theme accent updated to WCAG-safe gold tone; link colors/tokenized to improve contrast and parity.
- **Why it matters:** WCAG failure; harms readability and trust.
- **Required fix:** Adjust color tokens and component states to meet contrast targets while preserving premium aesthetic.
- **Acceptance criteria:** Lighthouse color contrast passes on core pages in both light and dark.
- **QA verification:** Lighthouse + manual contrast checks for key components (header, cards, footers, links, badges).

---

### ID-010 — Accessibility: Links Rely on Color Only in Text Blocks
- **Severity:** P1
- **Category:** Accessibility
- **Status:** IMPLEMENTED (PENDING QA)
- **Evidence:** Lighthouse `link-in-text-block` failing (links not distinguishable without color).
- **Affected pages:** Some pages with inline links (404 and others)
- **Affected files:** `css/style.css`
- **Root cause:** Inline links likely not underlined or otherwise distinguished.
- **Wave F implementation:** Added explicit prose-link selectors so links in paragraph/list copy remain underlined (non-color indicator), while nav/button patterns remain exempt. Forced-colors overrides now set `LinkText` and Canvas/CanvasText treatment for interactive controls to preserve contrast and discoverability.
- **Why it matters:** Users with color vision deficiencies and forced-colors modes may not detect links.
- **Required fix:** Default underline or non-color indicator for inline text links; preserve premium styling.
- **Acceptance criteria:** Lighthouse `link-in-text-block` passes; forced-colors still shows links clearly.
- **QA verification:** Lighthouse + forced-colors check.

---

### ID-011 — Publishing Page ARIA Required Children Failure
- **Severity:** P0
- **Category:** Accessibility
- **Status:** IMPLEMENTED (PENDING QA)
- **Evidence:** Lighthouse `aria-required-children` failing specifically on Publishing.
- **Affected pages:** `publishing.html`
- **Affected files:** `publishing.html`, `js/publishing.js`, `css/publishing.css`
- **Root cause (likely):** Some element has an ARIA role expecting specific child roles (e.g., tablist/listbox/menu) but children do not match.
- **Wave 01 implementation:** Publishing `#library-chips` role changed from `list` → `group` and the page now renders a stable empty-state without invalid ARIA required-children patterns when no books exist.
- **Why it matters:** Screen-reader structure breaks; Lighthouse a11y gate fails.
- **Required fix:** Align ARIA roles/structure to spec OR remove unnecessary roles and use semantic HTML.
- **Acceptance criteria:** Lighthouse a11y passes on Publishing; no ARIA required-children failures.
- **QA verification:** Lighthouse + keyboard navigation of Publishing UI.

---

### ID-012 — Publishing Page Severe CLS (~0.397)
- **Severity:** P0
- **Category:** Performance / UX
- **Status:** HARDENED (PENDING QA)
- **Evidence:** Lighthouse shows CLS ~0.397 on Publishing (max across runs).
- **Affected pages:** `publishing.html`
- **Affected files:** `publishing.html`, `css/publishing.css`, `js/publishing.js`, images/fonts used by page
- **Root cause (likely):** Late-loading fonts/images or JS-inserted content without reserved space.
- **Wave 01 implementation:** Publishing CLS mitigations: removed JS runtime insertion of shelves; avoided DOM-heavy chip building when `books` is empty; replaced skeleton-first layout with stable empty state to prevent large post-load reflow.
- **Wave H implementation (2026-02-24):** Removed malformed skeleton scaffold from `publishing.html`, added static empty-state-first markup, and introduced explicit `empty/results` state management in `js/publishing.js` with grid min-height/container hardening in `css/publishing.css`.
- **Why it matters:** Visibly “jumps” the page; damages premium feel and can misclick users.
- **Required fix:** Reserve layout space (min-heights, aspect-ratio), stabilize above-the-fold, preconnect/preload critical assets if needed.
- **Acceptance criteria:** CLS ≤ 0.10 on Publishing (mobile).
- **QA verification:** Lighthouse mobile; manual slow-connection test.

---

### ID-013 — Console Errors on Core Pages
- **Severity:** P0
- **Category:** Stability
- **Status:** IMPLEMENTED (PENDING QA)
- **Evidence:** Lighthouse `errors-in-console` failing across core pages.
- **Affected pages:** At least Home/Music/Publishing/Search and possibly others.
- **Affected files:** likely `js/global.js` plus page modules (`js/music.js`, `js/publishing.js`, `search/search.js`, etc.)
- **Root cause:** Not visible in summary; requires capturing console log details from LHR or runtime instrumentation.
- **Wave 01 implementation:** Removed CSP-blocked inline style mutations in `js/global.js` (submenu shift logic). Added guardrails for submenu/mobile overlay interactions to prevent error cascades; remaining console errors require local runtime/dev-check evidence if any persist.
- **Required fix:** Use `tools/dev-check.mjs --runtime` to capture and resolve console errors; enforce “console clean” gate.
- **Acceptance criteria:** Lighthouse “errors-in-console” passes for all Core Release Gate pages.
- **QA verification:** dev-check runtime report + Lighthouse rerun.

---

### ID-014 — Performance: LCP Too High on Multiple Core Pages
- **Severity:** P1
- **Category:** Performance
- **Status:** FIX IMPLEMENTED (PENDING QA)
- **Evidence:** LCP median values (ms): Music ~7440, Index ~6235, Publishing ~5793, Search ~5408, Contact/Privacy ~6150–6300.
- **Affected pages:** Core pages above
- **Affected files:** hero images, CSS critical path, font loading, any above-the-fold embeds
- **Root cause (likely):** Large hero/cover images not optimized for first view, font load delays, heavy render work, or missing preload hints.
- **Required fix:** Optimize LCP element (identify, compress, size), preload critical assets, reduce render-blocking overhead.
- **Mega Wave I update (2026-02-24):** Scoped full-page ToA background hero image loading to Home only (`body.index-page`) with lightweight non-home ToA gradient fallback, and added Home responsive hero image preload hint to improve critical image discovery.
- **Acceptance criteria:** LCP ≤ 2500ms target on mobile for core pages.
- **QA verification:** Lighthouse mobile/desktop + WebPageTest style throttling if used.

---

### ID-015 — SEO: Duplicate Track Pages (Same Title, Multiple Slugs)
- **Severity:** P1
- **Category:** SEO / Routing
- **Status:** FIX IMPLEMENTED (PENDING QA)
- **Evidence:** Duplicate `<title>` values found across multiple distinct track URLs in the bundle.
- **Affected pages:** Track pages under `music/tracks/**`
- **Affected files:** `music/tracks/**/index.html`, sitemap generation, internal link generation
- **Why it matters:** Duplicate content can dilute rankings and confuse crawlers/users; can create inconsistent canonicalization.
- **Duplicate titles observed (sample list):**
- **Ashes &amp; Blueprints — The Quiet War II: Faultline Testament | Triad of Angels**
  - `music/tracks/the-quiet-war-2/ashes-and-blueprints/index.html` → canonical: `https://www.triadofangels.com/music/tracks/the-quiet-war-2/ashes-and-blueprints/`
  - `music/tracks/the-quiet-war-2/ashes-blueprints/index.html` → canonical: `https://www.triadofangels.com/music/tracks/the-quiet-war-2/ashes-blueprints/`
- **Boot, Scoot &amp; Spin — Echoes on the Dirt Road | Triad of Angels**
  - `music/tracks/echoes-on-the-dirt-road/boot-scoot-and-spin/index.html` → canonical: `https://www.triadofangels.com/music/tracks/echoes-on-the-dirt-road/boot-scoot-and-spin/`
  - `music/tracks/echoes-on-the-dirt-road/boot-scoot-spin/index.html` → canonical: `https://www.triadofangels.com/music/tracks/echoes-on-the-dirt-road/boot-scoot-spin/`
- **Friday Nights &amp; Broken Lights — Echoes on the Dirt Road | Triad of Angels**
  - `music/tracks/echoes-on-the-dirt-road/friday-nights-and-broken-lights/index.html` → canonical: `https://www.triadofangels.com/music/tracks/echoes-on-the-dirt-road/friday-nights-and-broken-lights/`
  - `music/tracks/echoes-on-the-dirt-road/friday-nights-broken-lights/index.html` → canonical: `https://www.triadofangels.com/music/tracks/echoes-on-the-dirt-road/friday-nights-broken-lights/`
- **Harmony’s Call — Celestia: The Light Within | Triad of Angels**
  - `music/tracks/celestia-the-light-within/harmony-s-call/index.html` → canonical: `https://www.triadofangels.com/music/tracks/celestia-the-light-within/harmony-s-call/`
  - `music/tracks/celestia-the-light-within/harmonys-call/index.html` → canonical: `https://www.triadofangels.com/music/tracks/celestia-the-light-within/harmonys-call/`
- **Heaven’s Burning — Phoenix Rising | Triad of Angels**
  - `music/tracks/phoenix-rising/heaven-s-burning/index.html` → canonical: `https://www.triadofangels.com/music/tracks/phoenix-rising/heaven-s-burning/`
  - `music/tracks/phoenix-rising/heavens-burning/index.html` → canonical: `https://www.triadofangels.com/music/tracks/phoenix-rising/heavens-burning/`
- **Mirrors &amp; Dust — Serpent&#39;s Veil | Triad of Angels**
  - `music/tracks/serpents-veil/mirrors-and-dust/index.html` → canonical: `https://www.triadofangels.com/music/tracks/serpents-veil/mirrors-and-dust/`
  - `music/tracks/serpents-veil/mirrors-dust/index.html` → canonical: `https://www.triadofangels.com/music/tracks/serpents-veil/mirrors-dust/`
- **Probed &amp; Confused — Probed &amp; Confused | Triad of Angels**
  - `music/tracks/probed-and-confused/probed-and-confused/index.html` → canonical: `https://www.triadofangels.com/music/tracks/probed-and-confused/probed-and-confused/`
  - `music/tracks/probed-and-confused/probed-confused/index.html` → canonical: `https://www.triadofangels.com/music/tracks/probed-and-confused/probed-confused/`
- **Rust &amp; Roses — Echoes on the Dirt Road | Triad of Angels**
  - `music/tracks/echoes-on-the-dirt-road/rust-and-roses/index.html` → canonical: `https://www.triadofangels.com/music/tracks/echoes-on-the-dirt-road/rust-and-roses/`
  - `music/tracks/echoes-on-the-dirt-road/rust-roses/index.html` → canonical: `https://www.triadofangels.com/music/tracks/echoes-on-the-dirt-road/rust-roses/`
- **Serpent’s Veil — Serpent&#39;s Veil | Triad of Angels**
  - `music/tracks/serpents-veil/serpent-s-veil/index.html` → canonical: `https://www.triadofangels.com/music/tracks/serpents-veil/serpent-s-veil/`
  - `music/tracks/serpents-veil/serpents-veil/index.html` → canonical: `https://www.triadofangels.com/music/tracks/serpents-veil/serpents-veil/`
- **Venom &amp; Velvet — Phoenix Rising | Triad of Angels**
  - `music/tracks/phoenix-rising/venom-and-velvet/index.html` → canonical: `https://www.triadofangels.com/music/tracks/phoenix-rising/venom-and-velvet/`
  - `music/tracks/phoenix-rising/venom-velvet/index.html` → canonical: `https://www.triadofangels.com/music/tracks/phoenix-rising/venom-velvet/`
- **Required fix:** Choose one canonical slug per track; make all alternates non-indexed and/or redirect to canonical (GitHub Pages-safe).
- **Wave update (Phase 1):** De-indexed legacy alias pages for `harmony-s-call` and `probed-confused` by pointing canonical/OG/Twitter/JSON-LD URLs to canonical slugs and setting `meta robots` to `noindex, follow`; removed alias URLs from `sitemap.xml` to keep sitemap canonical-only.
- **Wave update (Phase 2 / Mega Wave G):** Removed 10 legacy alias pre-rendered track routes flagged as `orphan-static-route` by dev-check so only canonical track slugs from `js/data.js` remain in the static corpus.
- **Acceptance criteria:** Only one indexable URL per track; sitemap lists canonical only; alternates redirect or noindex+canonical to primary.
- **QA verification:** Link scan + sitemap check + Lighthouse SEO consistency.

---

### ID-016 — Search Page Performance / UX Baseline
- **Severity:** P1
- **Category:** Performance / UX
- **Status:** IN PROGRESS
- **Evidence:** Lighthouse perf ~0.79, LCP ~5.4s median.
- **Affected pages:** `/search/`
- **Affected files:** `search/search.js`, `search/search.css`, `css/style.css`
- **Root cause (likely):** Heavy initial render or large background assets; potential layout shifts.
- **Required fix:** Optimize search UI first render; reduce above-the-fold cost; ensure keyboard + screen-reader behavior stays perfect.
- **Wave I update (2026-02-24):** Search route now avoids the heavyweight full-page ToA hero background image under ToA theme, reducing first-view byte pressure before local LHCI confirmation.
- **Acceptance criteria:** Perf ≥ 0.95 on search; LCP within targets; no console errors.
- **QA verification:** Lighthouse + keyboard search behavior tests.

---

### ID-017 — Build/Perf: Minification + Cache + Compression Strategy
- **Severity:** P2
- **Category:** Build / Performance
- **Status:** OPEN
- **Evidence:** Lighthouse flags `unminified-css`, `unminified-javascript`, `uses-text-compression`, and cache policy items on some runs.
- **Affected pages:** Many
- **Affected files:** `css/*.css`, `js/*.js`, `tools/static-serve.mjs`, possible future `src→dist` pipeline
- **Root cause:** Current repo serves readable source assets; some local servers may not compress or set long cache.
- **Required fix:** Decide and implement a static-friendly build step:
  - minify CSS/JS into `/dist` (or same paths) while keeping source readable in `/src`
  - verify GitHub Pages caching behavior; use hashed asset filenames if needed
  - ensure local QA server uses gzip/brotli for accurate Lighthouse
- **Acceptance criteria:** Lighthouse no longer flags minification/compression on production-origin runs; local QA environment matches production.
- **QA verification:** Lighthouse run against production URL; compare with local.

---

### ID-018 — Back/Forward Cache Prevented
- **Severity:** P2
- **Category:** UX / Performance
- **Status:** OPEN
- **Evidence:** Lighthouse `bf-cache` failing across most pages.
- **Root cause:** Not yet identified (common causes include unload listeners, cache-control, or certain Web APIs).
- **Required fix:** Identify the bfcache blocker in runtime; remove/adjust offending patterns.
- **Acceptance criteria:** `bf-cache` passes on core pages.
- **QA verification:** Lighthouse + Chrome DevTools bfcache diagnostics.

---

### ID-019 — 404 SEO Low (Noindex / Crawlability)
- **Severity:** P2
- **Category:** SEO
- **Status:** OPEN
- **Evidence:** Lighthouse SEO for `/404.html` ~0.69 and flags crawlability.
- **Reality check:** 404 pages often should be **noindex**; Lighthouse can penalize this.
- **Required fix:** Confirm decision:
  - Keep 404 noindex (recommended) but accept Lighthouse SEO penalty, OR
  - Adjust SEO checks to exclude 404 from “SEO must be 100” gate.
- **Acceptance criteria:** Decision recorded; QA matrix reflects expected behavior.
- **QA verification:** Confirm robots/meta for 404 aligns with decision.

---

### ID-020 — Publishing Platform Readiness (Truthful Content)
- **Severity:** P2
- **Category:** Platform / Publishing
- **Status:** OPEN
- **Context:** `js/publishing-data.js` currently contains empty arrays (good: no placeholders), but Publishing page must remain truthful and polished.
- **Required fix:** Ensure Publishing page:
  - gracefully handles “no books yet” state
  - does not claim catalogs that don’t exist
  - has stable layout (ties to CLS issue)
- **Acceptance criteria:** Publishing page looks intentional even with empty data; no layout shift; a11y passes.
- **QA verification:** Lighthouse + manual UX review.

---

### ID-021 — Store/Merch/Digital Store Truth + Consistency Pass
- **Severity:** P2
- **Category:** Platform / Trust
- **Status:** FIX IMPLEMENTED (PENDING LOCAL QA)
- **Required fix:** Ensure Store-related pages:
  - clearly communicate “hub” vs “checkout”
  - do not imply on-site secure checkout unless external provider is used
  - are consistent in navigation labels
- **Acceptance criteria:** Copy is truthful; privacy/terms mention any third parties used.
- **QA verification:** Manual content audit + link scan.

---

## Closing Protocol
When an issue is fixed, update:
- **Status** → FIXED (and then VERIFIED after QA evidence)
- Add exact patch reference: bundle timestamp + commit hash (if used)
- Add QA evidence: Lighthouse snapshot + device screenshots where relevant

---

### ID-022 — Link Scan Failure: Case-Sensitive Album Route (Celestia)
- **Severity:** P0
- **Category:** Link Integrity / SEO
- **Status:** FIXED (Pending QA)
- **Evidence:** Link scan reports missing target for `/music/albums/Celetia-the-light-within/` referenced in `index.html`.
- **Root cause:** Incorrect casing + misspelling in route slug (GitHub Pages paths are case-sensitive).
- **Required fix:** Update `index.html` link to the real route: `/music/albums/celestia-the-light-within/`.
- **Acceptance criteria:** Link-scan shows **0 broken**; the route returns 200.
- **QA verification:** `node tools/link-scan.mjs` (PASS) + manual click test.

---

### ID-023 — Dev-Check Failure: Missing CSP Hash Tokens (Inline JSON-LD)
- **Severity:** P0
- **Category:** CSP / Security / Build Gate
- **Status:** FIXED (Pending QA)
- **Evidence:** `dev-check --ci` reports missing `csp.hash` tokens in:
  - `apps.html` (`'sha256-+U2PETXAt65V3BWWw2QVzQA44jEIIXC1AcJ81JMygSo='`)
  - `digital-store.html` (`'sha256-cf/tNqy4jxmdaA1NFSDvkgTm8aWTnOnZlDAlbopWP5I='`)
  - `index.html` (`'sha256-iwDw71KrGhY61o7MFMl54hEGwIpMj9fHoOGD0n6eciM='`)
- **Root cause:** CSP `script-src` hash allowlist drifted from current inline JSON-LD content.
- **Required fix:** Add the missing sha256 tokens to each page’s CSP `script-src` directive.
- **Acceptance criteria:** `node tools/dev-check.mjs --ci` shows PASS (0 errors).
- **QA verification:** dev-check CI + manual spot-check in DevTools console (no CSP blocked inline JSON-LD).

### ID-024 — Duplicate canonical link tags on album.html and track.html (dev-check FAIL)
- **Severity:** P0
- **Category:** SEO / Head metadata
- **Status:** VERIFIED (PASS)
- **Detected by:** dev-check (DEFAULT) after MEGA WAVE A head normalization
- **Symptoms:** duplicate canonical (count=2) on `album.html` and `track.html`
- **Fix:** ran `node tools/toa-mega-wave-a__canonical-dedupe.mjs --apply` to keep `#dynamic-canonical` when present and remove extra `<link rel="canonical">`.
- **Files touched:** `album.html`, `track.html`, `tools/toa-mega-wave-a__canonical-dedupe.mjs`
- **QA verification:** `node tools/dev-check.mjs` PASS (0 errors) and link-scan PASS (0 broken).
- **Entry:** 2026-02-23T08:35:37Z

### ID-025 — UX/Design parity regressions on Music/Album/Track/Streaming/Publishing (fonts, buttons, blur, light mode)
- **Severity:** P0
- **Category:** UX / Design parity / Theme system
- **Status:** FIX IMPLEMENTED (PENDING QA)
- **Symptoms:** typography mismatch vs other pages; inconsistent button colors; track page appears washed/blurred; light mode only partially applies.
- **Root causes:**
  - `css/track.css` selector typo prevented correct layering (`..track-page`) causing content/footer to be affected by blur.
  - Page-specific CSS hard-coded dark-only RGBA values (`music.css`, `publishing.css`) overriding theme tokens in light mode.
  - Duplicate `.link-tab` hover styles used fixed accent RGB instead of theme tokens.
  - Fonts link inconsistency (some pages used `media="print"` which can prevent fonts from applying).
- **Fixes (this patch):**
  - Track: fix selector + isolate stacking context; push `.track-bg` behind with `z-index:-1`; tokenized accent gradients.
  - Tokenize `music.css`, `publishing.css`, `streaming.css`, `album.css` to use `--panel`, `--stroke`, `--accent-rgb`, `--shadow-*`, `--text`.
  - Global `.link-tab` hover uses `rgba(var(--accent-rgb),...)` (no hard-coded gold).
  - Added offline tool: `tools/toa-mega-wave-b__fonts-normalize.mjs` to remove `media="print"` from Google fonts link and enforce one canonical fonts link per page.
- **Files touched:** `css/style.css`, `css/music.css`, `css/publishing.css`, `css/album.css`, `css/track.css`, `css/streaming.css`, `tools/toa-mega-wave-b__fonts-normalize.mjs`
- **QA verification:** local smoke on S24 + desktop; toggle light/dark; confirm track page no longer washed; run `node tools/dev-check.mjs` + `node tools/link-scan.mjs` (expect PASS).
- **Entry:** 2026-02-23T11:20:37Z

### ID-026 — Fix heading-order failures (Home, Publishing, Digital Store)
- **Severity:** P0
- **Category:** Accessibility / Content structure
- **Status:** FIX IMPLEMENTED (PENDING QA)
- **Symptoms (Lighthouse):** heading-order failures on `index.html`, `publishing.html`, `digital-store.html` (H1→H4, H1→H3, skeleton headings).
- **Fixes:**
  - `index.html`: Featured album titles changed from `<h4>` to `<h3 class="album-block__title">` (no heading level skips).
  - `publishing.html`: skeleton book card title element changed from `<h3>` to non-heading `<div class="book-card__title" aria-hidden="true">…</div>`.
  - `digital-store.html`: category headings changed from `<h3>` to `<h2 class="store-card__title">` (FAQ keeps H3 under the FAQ H2).
- **Files touched:** `index.html`, `publishing.html`, `digital-store.html`, `css/style.css`
- **QA verification:** Lighthouse re-run; `heading-order` should pass on these pages.
- **Entry:** 2026-02-23T12:03:28Z

### ID-027 — Reduce label-content-name mismatch via runtime ARIA normalization
- **Severity:** P0
- **Category:** Accessibility
- **Status:** FIX IMPLEMENTED (PENDING QA)
- **Symptoms (Lighthouse):** `label-content-name-mismatch` observed (notably on `album.html?album=wings-of-fire`).
- **Fix:** Added CSP-safe runtime normalizer in `js/global.js` that prefixes `aria-label` with visible text where missing (ignores glyph-only labels) and watches DOM mutations for dynamically generated UI.
- **Files touched:** `js/global.js`
- **QA verification:** Lighthouse re-run on `album.html?album=wings-of-fire` should pass `label-content-name-mismatch`.
- **Entry:** 2026-02-23T12:03:28Z

### ID-028 — Add fonts preconnect normalization tool (performance + Lighthouse uses-rel-preconnect)

- **Severity:** P1
- **Category:** Performance / Head metadata
- **Status:** FIX IMPLEMENTED (PENDING LOCAL LIGHTHOUSE VERIFICATION)
- **Fix:** Added `tools/toa-mega-wave-c__preconnect-normalize.mjs` and executed `--apply` to inject preconnect + dns-prefetch for Google Fonts across all HTML (deduped).
- **Files touched:** `tools/toa-mega-wave-c__preconnect-normalize.mjs`, `tools/toa-mega-wave-c__preconnect-normalize__report.json`, all `*.html` documents (280 files)
- **QA verification:** `node tools/toa-mega-wave-c__preconnect-normalize.mjs --check` now reports 0 pending changes after apply; confirm Lighthouse `uses-rel-preconnect` reduction locally.
- **Entry:** 2026-02-23T12:03:28Z

### ID-029 — Improve global contrast for muted text + brand subtitle
- **Severity:** P1
- **Category:** Accessibility / Theme parity
- **Status:** FIX IMPLEMENTED (PENDING QA)
- **Fix:** `css/style.css` replaced low-opacity `.muted` and brand subtitle opacity usage with `var(--text-muted)` (opacity=1) to improve contrast in both themes.
- **Files touched:** `css/style.css`
- **QA verification:** Lighthouse `color-contrast` reductions on core pages; manual light/dark check for readability.
- **Entry:** 2026-02-23T12:03:28Z

### ID-030 — Runtime dev-check fails on legacy templates (canonical/og/twitter query + empty dynamic JSON-LD)
- **Severity:** P0
- **Category:** Runtime / SEO / JSON-LD
- **Status:** FIX IMPLEMENTED (PENDING QA)
- **Detected by:** `node tools/dev-check.mjs --runtime --ci` (checks expect query-string URLs on legacy templates and valid JSON-LD)
- **Symptoms:** canonical, og:url, twitter:url missing query on `album.html`, `track.html`, `book.html`; `#dynamic-jsonld` empty on book template when book data not found → JSON.parse('') fails.
- **Fix:** legacy template URL mode uses canonical with query (album/track/book); book template always injects valid JSON-LD even when book is missing (truthful “not found” state).
- **Files touched:** `js/album.js`, `js/track.js`, `js/book.js`
- **QA verification:** re-run `node tools/dev-check.mjs --runtime --ci` and confirm PASS.
- **Entry:** 2026-02-23T19:33:25Z

### ID-031 — Add responsive album cover images (variants + manifest-driven srcset) to reduce Lighthouse “properly size images”
- **Severity:** P1
- **Category:** Performance / Images
- **Status:** FIX IMPLEMENTED (PENDING QA + PENDING VARIANT GENERATION)
- **Goal:** Reduce bandwidth and improve LCP by serving appropriately sized cover art on mobile/desktop.
- **Approach:** optional manifest-driven responsive images:
  - JS applies `srcset/sizes` only if `/assets/images/albums/variants/manifest.json` exists (no broken refs if missing).
  - Local tool generates variants and manifest.
- **Files touched:** `js/music.js`, `js/album.js`, `js/track.js`, `js/variants.js`, `tools/toa-mega-wave-e__generate_album_cover_variants.py`
- **QA verification:** run generator tool, then verify in DevTools Network that smaller `-w320/-w480` assets are chosen on mobile; rerun Lighthouse.
- **Entry:** 2026-02-23T19:33:25Z



### ID-032 — Runtime/Lighthouse QA gate blocked by missing browser executables in sandbox
- **Severity:** P1
- **Category:** QA Environment / Validation gates
- **Status:** BLOCKED (LOCAL EXECUTION REQUIRED)
- **Detected by:** `node tools/dev-check.mjs --runtime --ci`, `node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json`, `node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json`
- **Symptoms:** Playwright cannot launch (`Executable doesn't exist ... chrome-headless-shell`); Lighthouse wrapper reports no Chrome/Edge/Chromium executable detected.
- **Required action:** Execute LOCAL QA PACK commands on a machine with Playwright Chromium + Chrome/Chromium installed and attach outputs.
- **Entry:** 2026-02-23T23:09:00Z


### ID-033 — Sitemap/Robots indexing hygiene for canonical HTML corpus
- **Severity:** P1
- **Category:** SEO / Indexing
- **Status:** FIX IMPLEMENTED (PENDING QA)
- **Detected by:** Governance checklist gap (`G-04.1`, `G-04.2`) and sitemap inclusion of non-HTML lyrics text endpoints.
- **Symptoms:** `sitemap.xml` previously included `lyrics/**/*.txt` URLs, and robots directives did not explicitly keep legacy query templates out of crawl/index scope.
- **Fix:** Updated `tools/generate-static.mjs` sitemap builder to include canonical HTML URLs only; regenerated `sitemap.xml`; updated `robots.txt` to disallow `/404.html`, `/album.html`, `/track.html`, and `/book.html` while preserving global allow + sitemap declaration.
- **Files touched:** `tools/generate-static.mjs`, `sitemap.xml`, `robots.txt`
- **QA verification:** `node tools/dev-check.mjs --ci` and `node tools/link-scan.mjs --ci` pass in sandbox; runtime/LHCI SEO confirmation pending local browser-enabled execution.
- **Entry:** 2026-02-24T10:45:00Z


### ID-034 — Games/Apps Hub Truth-First Readiness Pass
- **Severity:** P2
- **Category:** Platform / Readiness
- **Status:** FIX IMPLEMENTED (PENDING LOCAL QA)
- **Required fix:**
  - convert Games hub to truthful launch-readiness catalog with explicit “no live games” state
  - convert Apps hub to truthful launch links using only live website experiences
  - avoid implied live app-store installs until official links exist
- **Acceptance criteria:** Games/Apps pages list only real availability states and links; no fake release/install claims.
- **QA verification:** manual content audit + `node tools/link-scan.mjs --ci` + local runtime/Lighthouse pass.
