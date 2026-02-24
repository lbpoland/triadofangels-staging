# TOA MEGA WAVE G — Canonical Track Route Hardening Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** SEO routing integrity (pre-rendered track corpus)  
**Objective:** Remove non-canonical alias track pages that fail route integrity checks and preserve a canonical-only static corpus aligned with `js/data.js`.

## Scope
- Remove pre-rendered `music/tracks/**/index.html` files that are not canonical track IDs derived from `js/data.js`.
- Re-run non-browser validation gates (`dev-check --ci`, `link-scan --ci`) to confirm route integrity and no broken links.
- Attempt runtime and Lighthouse gates once in sandbox; if browser binaries are unavailable, record exact failures and defer to LOCAL QA PACK.
- Update governance artifacts (ledger/checklist/QA matrix/decisions) with checklist/issue linkage and QA evidence.

## Checklist IDs / Ledger Linkage
- `ID-015` (SEO duplicate track routes): IN PROGRESS → FIX IMPLEMENTED (PENDING QA)
- `I-02.1` (Mega checklist): IN PROGRESS (phase 2 complete, local SEO/LHCI verification pending)
- `G-04.1` (sitemap/indexing alignment): IN PROGRESS with canonical-only route corpus

## Files likely touched
- `music/tracks/**/index.html` (legacy alias pages removed)
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`

## Exit criteria
1. `node tools/dev-check.mjs --ci` PASS with zero orphan track-route errors.
2. `node tools/link-scan.mjs --ci` PASS with zero broken links.
3. Runtime + LHCI evidence captured (PASS locally, or environment-blocked notes + exact local command pack).
