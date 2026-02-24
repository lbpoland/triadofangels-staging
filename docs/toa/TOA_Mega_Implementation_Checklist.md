# TOA Mega Implementation Checklist (Living Backlog + Handoff Control)

**Project:** Triad of Angels / ToA Studios Website (GitHub Pages static hosting)  
**Last updated:** 2026-02-24 (Australia/Brisbane) — MEGA WAVE G  
**Purpose:** One always-on, always-current implementation checklist that survives session changes without drift.  
**How to use:** This file is the master execution backlog. Every patch session must (1) reference checklist IDs, (2) tick statuses, and (3) write QA notes + evidence/commands where applicable.

---

## Status Legend (use one per item)

- **[DONE]** Implemented + verified by local QA (dev-check + Lighthouse + manual smoke)
- **[IN PROGRESS]** Partially implemented / pending QA / pending dependent patch
- **[NOT STARTED]** Not implemented
- **[BLOCKED]** Cannot proceed due to missing info, missing assets, tooling, or external decision

---

## Session Handoff Protocol (MANDATORY)

When starting a new ChatGPT session, paste:
1) Authority Order
2) Latest Bundle + Manifest + Lighthouse artifacts
3) Tracker Files (Audit Ledger / Master Checklist / QA Matrix / Decisions Log / Patch Plan)
4) This file: TOA_Mega_Implementation_Checklist.md
5) Then say: “Continue with checklist items: <IDs>” and paste any new local QA outputs.

Do not re-audit from scratch unless explicitly requested. Use checklists + ledger as execution memory.

---

## Core Commands (Local QA)

Run after major batches (not after tiny edits):

- node tools/dev-check.mjs --ci
- node tools/dev-check.mjs --runtime --ci
- node tools/link-scan.mjs
- node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json
- node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json
- Bundle refresh:
  - python .\toa_bundle.py --profile chatgpt --clean-lighthouse archive

Record outputs in: TOA_Release_QA_Matrix.md + TOA_Audit_Ledger_Master.md.

---

# A) GOVERNANCE + NON-DRIFT CONTROLS

### A-01 Project tracker hygiene
- [IN PROGRESS] A-01.1 Ensure all tracker docs exist + are current (ledger/checklist/qa/decisions/patch plans)
- [NOT STARTED] A-01.2 Add “Delivery Safety Protocol” to project instructions (8k-safe) and enforce each patch session
- [NOT STARTED] A-01.3 Create/maintain a rolling “Release Notes” log per patch wave

### A-02 Repo/tooling consistency
- [NOT STARTED] A-02.1 Confirm node tooling versions + remove deprecated packages where feasible (without breaking)
- [NOT STARTED] A-02.2 Ensure dev-check covers: CSP, broken links, duplicate IDs, JSON-LD validity, sitemap, robots
- [NOT STARTED] A-02.3 Add a “console-clean” CI gate script (optional) that loads core pages and fails on console errors

---

# B) NAVIGATION / HEADER / MOBILE MENU (Premium UX + A11y)

### B-01 Mobile menu layout + behavior
- [IN PROGRESS] B-01.1 Mobile menu panel sizing + alignment (S24) — no gaps, premium spacing
- [IN PROGRESS] B-01.2 Submenu Option B second-panel: open/close/back; keyboard support; scroll containment
- [DONE] B-01.3 Touch ergonomics: tap targets ≥ 44px; safe padding; no accidental closes (Wave F global nav controls + links)

### B-02 Desktop nav + dropdown stability
- [NOT STARTED] B-02.1 Desktop dropdown positioning: no clipping; correct z-index; no overflow hidden traps
- [NOT STARTED] B-02.2 Multi-level submenu: pointer + keyboard parity; no hover traps
- [NOT STARTED] B-02.3 Click-outside rules: never close while interacting inside submenu

### B-03 Accessibility + semantics
- [IN PROGRESS] B-03.1 Nav ARIA: expanded states correct; ESC closes; focus returns to trigger
- [DONE] B-03.2 Skip-link: visible on focus; lands on #main (Wave F style/focus hardening)
- [DONE] B-03.3 Focus rings: visible in all themes + forced-colors; no outline suppression (Wave F forced-colors focus overrides)
- [IN PROGRESS] B-03.4 Typography parity: brand/header/menu typography consistent across all pages (fonts link normalized; display/body tokens applied)

---

# C) HOMEPAGE / FEATURED ALBUMS / CAROUSELS

### C-01 Featured Albums rail
- [IN PROGRESS] C-01.1 Mobile horizontal rail: scroll-snap, smooth, no vertical stacking, no overflow bleed
- [NOT STARTED] C-01.2 Keyboard rail controls: ArrowLeft/Right, Home/End, optional prev/next buttons
- [IN PROGRESS] C-01.3 Reduced motion: avoid smooth scroll when prefers-reduced-motion

### C-02 Hero section polish
- [NOT STARTED] C-02.1 Hero typography scale across breakpoints; prevent text overlap
- [NOT STARTED] C-02.2 CTA button a11y + focus
- [NOT STARTED] C-02.3 LCP optimization for hero background (see Performance)

---

# D) RESPONSIVE LAYOUT + OVERFLOW HARDENING

### D-01 Global overflow and safe gutters
- [IN PROGRESS] D-01.1 Prevent horizontal page scroll on small devices; fix “card edge bleed”
- [NOT STARTED] D-01.2 Standardize container padding per breakpoint; avoid elements touching viewport edges
- [NOT STARTED] D-01.3 Clamp long titles/URLs; ensure word-break behavior does not break layout

### D-02 Component sizing
- [NOT STARTED] D-02.1 Card system: consistent radius/shadow/borders; equal vertical rhythm
- [NOT STARTED] D-02.2 Headings blocks: never overflow; ensure safe padding; responsive line-length targets

---

# E) ACCESSIBILITY (A11Y) — SITE-WIDE

### E-01 Lighthouse A11y blockers
- [IN PROGRESS] E-01.1 Fix label-content-name-mismatch at scale (remove mismatched aria-label or align)
- [IN PROGRESS] E-01.2 Fix color-contrast across both themes (text, buttons, badges, links)
- [IN PROGRESS] E-01.3 Fix aria-required-children on Publishing filters
- [IN PROGRESS] E-01.4 Fix any remaining heading-order issues (maintain single H1 per page)

### E-02 Mode support
- [IN PROGRESS] E-02.1 Forced-colors: ensure borders, focus rings, interactive states visible (decorative ToA background layers now disabled in forced-colors mode)
- [IN PROGRESS] E-02.2 Reduced motion: disable smooth scrolling/animated transitions where applicable (ToA cinematic background effects simplified under prefers-reduced-motion)
- [NOT STARTED] E-02.3 Screen reader: verify landmarks (header/nav/main/footer), labels, aria-current

---

# F) PERFORMANCE (Lighthouse + CWV)

### F-01 Core Web Vitals
- [IN PROGRESS] F-01.1 Reduce LCP on Home and Music (hero + above-fold images)
- [NOT STARTED] F-01.2 CLS ≤ 0.10 on Publishing and any other failing page
- [NOT STARTED] F-01.3 INP improvements: reduce heavy JS, avoid layout thrash

### F-02 Assets + caching
- [NOT STARTED] F-02.1 Images: modern formats + correct dimensions
- [IN PROGRESS] F-02.2 Responsive images srcset/sizes for above-fold assets
- [NOT STARTED] F-02.3 Preload only true LCP; avoid over-preloading
- [IN PROGRESS] F-02.4 Normalize Google Fonts preconnect/dns-prefetch on all HTML pages (tool + sweep complete; LHCI verification pending local run)

---

# G) SEO + SOCIAL (OG/TWITTER) + SCHEMA — SITE-WIDE

### G-01 Baseline meta system
- [NOT STARTED] G-01.1 Unique title + description for every page
- [IN PROGRESS] G-01.2 Canonical URLs correct for every page
- [NOT STARTED] G-01.3 Robots directives correct + truthful; no accidental noindex
- [DONE] G-01.4 Canonical uniqueness: 1 canonical per page; keep #dynamic-canonical on album/track; dedupe extras after head sweeps

### G-02 OG/Twitter cards
- [NOT STARTED] G-02.1 Every page has OG tags: title/description/url/image/type
- [NOT STARTED] G-02.2 Every page has Twitter tags: card/title/description/image
- [NOT STARTED] G-02.3 Image pipeline: 1200x630 webp q82–88; correct filenames/folders

### G-03 JSON-LD
- [NOT STARTED] G-03.1 Organization schema consistent + truthful
- [NOT STARTED] G-03.2 Music schema (Album/MusicRecording) for album/track pages
- [NOT STARTED] G-03.3 Book schema for Publishing detail pages
- [NOT STARTED] G-03.4 Breadcrumb schema for nested routes (if used)

### G-04 Search / indexing
- [NOT STARTED] G-04.1 sitemap.xml covers all routes; excludes 404/dev artifacts
- [NOT STARTED] G-04.2 robots.txt aligns with sitemap + desired indexing
- [NOT STARTED] G-04.3 Search UX: snippets, highlighting, grouping, speed

---

# H) PUBLISHING PLATFORM

### H-01 Library UX
- [IN PROGRESS] H-01.1 No-placeholder empty state: premium, clear next actions
- [IN PROGRESS] H-01.2 Remove ARIA list misuse; ensure filters are proper buttons/controls
- [NOT STARTED] H-01.3 Add category/series/era chips matching real data (no fake books)

### H-02 Detail pages readiness
- [NOT STARTED] H-02.1 Book detail page template and routing
- [NOT STARTED] H-02.2 Purchase/read links via external storefronts; truthful disclosures

---

# I) MUSIC PLATFORM

### I-01 Music discovery UX
- [NOT STARTED] I-01.1 Consistent category chips + sorting across Music and Home
- [NOT STARTED] I-01.2 Album/track pages: hero background correctness; consistent controls/help
- [NOT STARTED] I-01.3 Stream dropdown: stable, accessible, no clipping

### I-02 Data integrity
- [IN PROGRESS] I-02.1 Track slug uniqueness; canonical routing (avoid duplicates) — phase 2 alias route pruning applied (10 orphan aliases removed), pending local SEO/LHCI verification
- [NOT STARTED] I-02.2 JSON validation scripts for music catalog

---

# J) TRUST CENTER / LEGAL / CONTACT

### J-01 Legal truthfulness + completeness
- [NOT STARTED] J-01.1 Privacy: disclosures for external services + analytics (if any)
- [NOT STARTED] J-01.2 Terms: store providers; refunds; licensing disclaimers
- [NOT STARTED] J-01.3 Contact: spam-safe mailto; accessible alternatives (no backend claims)

---

# K) GAMES / APPS / STORE READINESS (Static-first)

### K-01 Games
- [NOT STARTED] K-01.1 Games hub page: curated catalog; instant-play filters
- [NOT STARTED] K-01.2 First game MVP: pause/restart, keyboard, touch, accessibility plan
- [NOT STARTED] K-01.3 Optional leaderboard: external service, disclosed

### K-02 Apps/Tools
- [NOT STARTED] K-02.1 Apps hub with install/launch links (truthful)
- [NOT STARTED] K-02.2 Tool pages: performance + privacy notes

### K-03 Store
- [NOT STARTED] K-03.1 Store hub: external checkout links; disclosures; no fake cart
- [NOT STARTED] K-03.2 Product schema for items (if static catalog exists)

---

# L) CONSOLE-CLEAN + CSP HARDENING

### L-01 Console errors gate
- [IN PROGRESS] L-01.1 Eliminate errors-in-console across core gate pages
- [NOT STARTED] L-01.2 Ensure CSP does not rely on style attributes; no inline handlers

---

## Next Work Template (copy/paste)

Continue work on checklist items: <IDs>  
Files to focus: <paths>  
Local QA results pasted:
- dev-check strict:
- dev-check runtime:
- link-scan:
- LHCI mobile:
- LHCI desktop:
- manual S24 notes:

---

## Change Log
- Created as a session-handoff safe master backlog.

---

## Patch Notes (Append-Only)
- **2026-02-24 (AEST)** — MEGA WAVE D (Accessible-name alignment): normalized runtime-generated streaming/book links so `aria-label` begins with visible label text (e.g., `Spotify (opens in a new tab)`), reducing `label-content-name-mismatch` risk across album/track/book surfaces. (Ledger: ID-008, Checklist: E-01.1)
- **2026-02-23 (AEST)** — Micro patch: fixed `index.html` Celestia album route casing + added missing CSP `script-src` hashes for inline JSON-LD on `index.html`, `apps.html`, `digital-store.html`. (Ledger: ID-022, ID-023)
- [IN PROGRESS] G-01.5 Head performance: preconnect/dns-prefetch sweep APPLIED via MEGA WAVE C; pending local Lighthouse verification

- [IN PROGRESS] L-01.3 Runtime dev-check blocked in sandbox (Playwright browser binary unavailable); pending local runtime execution pack
