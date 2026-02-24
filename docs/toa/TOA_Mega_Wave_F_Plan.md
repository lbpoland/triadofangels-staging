# TOA Mega Wave F Plan — Global Head Connection Hint Normalization

**Date:** 2026-02-23 (AEST)  
**Wave objective:** Improve cross-site font connection startup and reduce Lighthouse `uses-rel-preconnect` regressions by normalizing head connection hints across all static HTML pages.

## Why this wave is next (ROI + risk reduction)
- Existing governance and ledger explicitly shipped a preconnect normalization tool but left apply-state pending (`ID-028`).
- Applying one deterministic head-layer sweep across all HTML pages gives immediate, broad performance upside without content risk.
- Atomic architecture layer: **head metadata performance hints only** (no product/content changes).

## Scope
- Run offline enforcer: `node tools/toa-mega-wave-c__preconnect-normalize.mjs --apply`.
- Verify non-browser gates in sandbox: dev-check CI + link-scan.
- Attempt runtime + Lighthouse gates once; record environment constraints when browser binaries are unavailable.
- Update governance artifacts (ledger/checklist/QA matrix/decisions) with evidence and pending local gates.

## Files likely touched
- `*.html` site-wide (head section hint normalization).
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`

## Checklist / Ledger linkage
- **Checklist IDs:** G-01.5, F-01.1 (supporting), L-01.3 (verification dependency).
- **Ledger IDs:** ID-028 (implementation closure pending local LHCI), ID-032 (browser-gate environment blocker tracking).

## Exit criteria for wave closure
1. Preconnect sweep applied and committed in one atomic batch.
2. `node tools/dev-check.mjs --ci` PASS.
3. `node tools/link-scan.mjs` PASS.
4. Runtime + LHCI evidence captured (PASS locally, or environment-blocked note with exact errors + local command pack).
