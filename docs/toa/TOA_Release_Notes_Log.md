# TOA Website — Release Notes Log (Rolling)

**Last updated:** 2026-02-24 (Australia/Brisbane) — MEGA WAVE S  
**Purpose:** Append-only release wave summary for fast operator handoff and non-drift session continuity.

---

## 2026-02-24 — MEGA WAVE S (Governance + Tooling Safety)
- Added Delivery Safety Protocol to project instructions to enforce 8k-safe patch discipline and browser-gate handling rules in constrained runtimes.
- Added repository SEO artifact validation to `tools/dev-check.mjs` for root `robots.txt`/`sitemap.xml` presence and sitemap URL sanity checks.
- Added `tools/console-clean.mjs` and wired package scripts (`ci:console-clean`, `qa:console-clean`) to establish optional console-clean runtime gate coverage across core release pages.
- Updated governance trackers for A-layer closure progress and local QA dependency notes.

## 2026-02-24 — MEGA WAVE R (Accessibility Landmark + Current-Page Semantics)
- Hardened `js/global.js` landmark role/label fallback behavior and footer `aria-current` mapping.
- Added `main` fallback `tabindex="-1"` safeguard for skip-link focus reliability.

## 2026-02-24 — MEGA WAVE Q (Responsive Overflow + Gutters)
- Added global inline gutter/panel spacing tokens and long-string wrap guards in shared CSS.

## 2026-02-24 — MEGA WAVE P (Navigation Submenu Parity)
- Added desktop pointer-enter/pointer-leave parity and expanded keyboard traversal for submenu controls.

