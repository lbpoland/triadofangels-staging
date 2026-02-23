# TOA Website — Decisions Log (Anti-Drift)

**Last updated:** 2026-02-23 (Australia/Brisbane)  
**Purpose:** Record decisions, constraints, and standards so work never re-litigates the same topics.

---

## Decision Format
- **ID:** DEC-###
- **Date:** YYYY-MM-DD (Australia/Brisbane)
- **Decision:** What we decided
- **Rationale:** Why
- **Implications:** What it changes / constrains
- **Artifacts:** Files that encode the decision

---

## DEC-001 — GitHub Pages Reality Model (Static Hosting Law)
- **Date:** 2026-02-23
- **Decision:** The site is static-first on GitHub Pages. No server-side secrets, auth, payments, or private delivery can be implemented securely on-site.
- **Rationale:** GitHub Pages is static hosting; repo contents are public. Security cannot be faked client-side.
- **Implications:** Accounts, checkout, leaderboards, forms, gated downloads require reputable external providers and explicit privacy disclosures.
- **Artifacts:** `TOA_Website_Rules_Master_Outline_v5.md` §3, §12

---

## DEC-002 — Authority Order (Conflict Resolution)
- **Date:** 2026-02-23
- **Decision:** Resolve conflicts in this order:
  1) Rules & Master Outline (v5)  
  2) Project Instructions (v2 LOCKED)  
  3) Latest Manifest  
  4) Latest Bundle  
  5) Lighthouse/QA  
  6) Deep-research report (seed only)  
  7) Screenshots (QA evidence only)
- **Rationale:** Prevent drift; ensure the newest canonical artifacts dominate.
- **Implications:** When something “feels wrong,” we check the authority chain before changing code.
- **Artifacts:** `TOA_Website_Rules_Master_Outline_v5.md` §2, `TOA_Project_Instructions_v2_LOCKED.md`

---

## DEC-003 — Atomic Delivery Law (Definition of DONE)
- **Date:** 2026-02-23
- **Decision:** A file is **only DONE** if it is downloadable in the same patch-session response. ZIP contents must match manifest and DONE list exactly.
- **Rationale:** Eliminates missing-file regressions and wasted local testing cycles.
- **Implications:** Patch sessions must always output: Patch Summary → File Manifest → Downloads → Work Checklist → QA Checklist → Continuation Prompt.
- **Artifacts:** `TOA_Session_Delivery_Contract.md`, `TOA_Project_Instructions_v2_LOCKED.md`

---

## DEC-004 — Quality Gates (Release Standard)
- **Date:** 2026-02-23
- **Decision:** Target Lighthouse (Mobile + Desktop) on Core Release Gate pages:
  - Performance 95–100
  - Accessibility 100
  - SEO 100
  - Best Practices 95–100  
  and Core Web Vitals: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms.
- **Rationale:** Premium platform expectation + stable scale foundation.
- **Implications:** Any global change requires a Core Release Gate QA sweep.
- **Artifacts:** `TOA_Website_Rules_Master_Outline_v5.md` §5

---

## DEC-005 — Accessibility Doctrine (Non-Negotiable)
- **Date:** 2026-02-23
- **Decision:** Accessibility is mandatory: skip link, one main landmark, visible focus, keyboard navigation, reduced motion support, forced-colors support, and correct ARIA usage.
- **Rationale:** Premium UX requires inclusive UX; also a release gate per Rules.
- **Implications:** Avoid unnecessary ARIA; prioritize semantic HTML; icon-only controls must have accessible names; visible labels must match accessible names.
- **Artifacts:** `TOA_Website_Rules_Master_Outline_v5.md` §5.2, §6, §9

---

## DEC-006 — “No Placeholders” Truth Rule (UI + Data + Schema)
- **Date:** 2026-02-23
- **Decision:** No placeholder UI copy or fake features. Data and schema must be truthful and reflect what exists.
- **Rationale:** Trust + compliance; prevents SEO and UX damage.
- **Implications:** When content is not ready, use a polished “coming soon / empty state” rather than fake catalogs.
- **Artifacts:** `TOA_Project_Instructions_v2_LOCKED.md`, `TOA_Website_Rules_Master_Outline_v5.md`

---

## DEC-007 — 404 Indexing Behavior
- **Date:** 2026-02-23
- **Decision:** 404 pages should typically be **noindex** even if Lighthouse SEO penalizes crawlability.
- **Rationale:** Prevent 404 pages from ranking or being treated as real content.
- **Implications:** Exclude `/404.html` from “SEO must be 100” gating, or treat its SEO score as expected.
- **Artifacts:** `TOA_Audit_Ledger_Master.md` (ID-019), `TOA_Release_QA_Matrix.md` (baseline notes)

---

## DEC-008 — Deep Research Is a Seed, Not a Source of Truth
- **Date:** 2026-02-23
- **Decision:** Deep Research outputs are used as a **seed audit only** and must be reconciled against the latest bundle/manifest/Lighthouse before becoming actionable issues.
- **Rationale:** Prevents acting on outdated or generic findings.
- **Implications:** Deep report items must be mapped to Issue IDs and marked VERIFIED/SUPERSEDED.
- **Artifacts:** `TOA_Website_Audit_Execution_Bridge_v1.md`, `TOA_Audit_Ledger_Master.md` (ID-004)

---

## DEC-009 — Preferred Page Strategy: Static Pre-render Where Possible
- **Date:** 2026-02-23
- **Decision:** Pre-render static item pages (albums/tracks/books) for SEO and share reliability; JS is enhancement, not requirement for discovery.
- **Rationale:** GitHub Pages static hosting and SEO reliability.
- **Implications:** Tools/pipeline should support generation and consistent head/meta/schema.
- **Artifacts:** `tools/generate-static.mjs`, `TOA_Website_Rules_Master_Outline_v5.md` §3, §6, §10

---

## DEC-010 — Tracker Files Are Canonical Project Memory
- **Date:** 2026-02-23
- **Decision:** The tracker docs are the canonical “project memory”:
  - `TOA_Audit_Ledger_Master.md`
  - `TOA_Master_Checklist_Live.md`
  - `TOA_Release_QA_Matrix.md`
  - `TOA_Decisions_Log.md`
- **Rationale:** Eliminates drift across sessions and prevents repeating debates.
- **Implications:** Every patch wave must update all four.
- **Artifacts:** These documents

## DEC-011 — Mobile Submenu Uses Second-Panel Navigation (Option B)
- **Date:** 2026-02-23
- **Decision:** Mobile nav submenus (e.g., Music) open in a dedicated **second panel** with a Back control, rather than expanding inline or flyout shifting.
- **Rationale:** Eliminates S24 gap/blank-space regression; improves touch ergonomics and consistency with premium mobile IA patterns.
- **Implications:** Requires `css/style.css` mobile nav panel styles + `js/global.js` submenu controller to manage open/close + focus.
- **Artifacts:** `css/style.css` (mobile nav + .nav-subpanel), `js/global.js` (submenu controller)

---

## DEC-012 — CSP Hash Policy for Inline JSON-LD (Dev-Check Gate)
- **Date:** 2026-02-23
- **Decision:** Pages that include inline `<script type="application/ld+json">` must have matching `sha256-...` hashes present in the page CSP `script-src` directive, otherwise `dev-check --ci` fails.
- **Rationale:** The site enforces CSP without `unsafe-inline`; JSON-LD is inline script, so it must be explicitly allowed by hash.
- **Implications:** Any change to inline JSON-LD content requires updating the CSP hash list for that page. Prefer stable JSON-LD generation and avoid unnecessary churn.
- **Artifacts:** `dev-check__*.json` (csp.hash failures), CSP meta on affected pages (apps.html, digital-store.html, index.html)

## DEC-013 — Canonical Slug Casing (GitHub Pages is Case-Sensitive)
- **Date:** 2026-02-23
- **Decision:** All internal links to generated routes must use canonical lowercase slugs (e.g., `/music/albums/celestia-the-light-within/`). Never rely on Windows case-insensitivity.
- **Rationale:** GitHub Pages file paths are case-sensitive; incorrect casing produces 404s and breaks SEO/link integrity.
- **Implications:** Link-scan is a release gate; any casing mismatch must be fixed immediately.
- **Artifacts:** `link-scan-report.md` (broken link), `index.html` featured albums link

## 2026-02-23 — DEC-014: Canonical uniqueness + dynamic-canonical precedence
- Every HTML document must contain exactly one `<link rel="canonical">`.
- For `album.html` and `track.html`, keep `<link id="dynamic-canonical" rel="canonical" ...>` as the only canonical (runtime updates include query params).
- If duplicates exist: keep `#dynamic-canonical` if present; else keep the first canonical and remove the rest.
- Enforcement tool: `tools/toa-mega-wave-a__canonical-dedupe.mjs` (run after large head normalization sweeps).

## 2026-02-23 — DEC-015: Font loading consistency and no media=print font hacks
- Fonts must apply consistently across all pages (no page-to-page typography drift).
- Disallow `media="print"` Google Fonts link hacks unless paired with CSP-safe loader; prefer a single normal stylesheet link.
- Enforcement tool: `tools/toa-mega-wave-b__fonts-normalize.mjs` (offline sweep).
- Brand typography: keep body text on `--font-body` and brand title/subtitle on `--font-display`.

## 2026-02-23 — DEC-016: Heading semantics policy (no decorative/skeleton headings)
- Skeleton placeholders must not use heading tags (`h2–h6`). Use non-heading elements with appropriate classes and `aria-hidden="true"` where applicable.
- Content headings must not skip levels (no H1→H3/H4 leaps). Feature card titles should be H2/H3 depending on section depth, not H4 by default.

## 2026-02-23 — DEC-017: Preconnect policy for external font origins
- If Google Fonts are used, include:
  - `preconnect` to `https://fonts.googleapis.com`
  - `preconnect` to `https://fonts.gstatic.com` with `crossorigin`
  - (optional) `dns-prefetch` for both
- Enforce with offline sweep tool: `tools/toa-mega-wave-c__preconnect-normalize.mjs`.

## 2026-02-23 — DEC-018: ARIA label-content-name mismatch prevention at runtime
- If an element has both visible label text and `aria-label`, the `aria-label` must include the visible text (as a prefix) to avoid mismatch audits and preserve clarity.
- Dynamic UIs must be normalized after DOM updates (MutationObserver throttle).
- Enforced in `js/global.js` (CSP-safe, no inline handlers).

## 2026-02-23 — DEC-019: Legacy template URL mode for runtime checks
- Legacy templates (`/album.html`, `/track.html`, `/book.html`) must set canonical + og:url + twitter:url to include the query string used to select content.
- Pre-rendered folder pages (`/music/albums/.../`, `/music/tracks/.../`, `/publishing/books/.../`) keep clean folder canonical URLs.
- Implementation: compute canonical based on `window.location.pathname` (template vs folder route) and write into `#dynamic-canonical`, `#dynamic-og-url`, `#dynamic-twitter-url`.

## 2026-02-23 — DEC-020: Optional responsive cover variants (manifest-driven, zero-404 policy)
- Responsive cover variants must never introduce broken image references.
- Strategy: apply `srcset/sizes` only after a manifest is successfully fetched; if manifest is missing, use the original cover src.
- Variants generator: `tools/toa-mega-wave-e__generate_album_cover_variants.py` outputs variants + `assets/images/albums/variants/manifest.json`.


## 2026-02-24 — DEC-021: Global interaction accessibility floor (touch + forced-colors + reduced-motion)
- All global header/nav interactive controls must meet a minimum **44px touch target** on mobile-class viewports.
- Forced-colors mode must preserve visible control borders and focus outlines for nav/theme/skip-link interactions.
- Reduced-motion mode must disable transform/transition-driven nav animations that are not required for comprehension.
- Implementation baseline: `css/style.css` (`@media (forced-colors: active)`, `@media (prefers-reduced-motion: reduce)`, nav/skip-link sizing) and `js/global.js` (mobile menu close behavior parity on resize + Escape).

