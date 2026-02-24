# TOA MEGA WAVE H — Publishing CLS + Empty-State Stabilization Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Publishing page layout stability + truthful empty-state UX  
**Objective:** Reduce Publishing layout shift risk (ID-012) by removing unstable skeleton markup, hardening empty-state rendering, and keeping the page truthful when `js/publishing-data.js` is empty.

## Scope
- Refactor `publishing.html` library section to use a clean, static-first empty-state block (no malformed skeleton markup).
- Update `js/publishing.js` to explicitly manage `empty/results` states and keep copy truthful for both “no catalog data” and “no filter results.”
- Tune `css/publishing.css` layout containers/min-heights so the library block remains visually stable while JS initializes.
- Run non-browser validation gates in sandbox and attempt runtime/Lighthouse gates once; defer browser-only gates to LOCAL QA PACK if executables are unavailable.
- Update governance artifacts with checklist linkage, QA evidence, and pending local-browser notes.

## Checklist IDs / Ledger Linkage
- `ID-012` (Publishing CLS): IMPLEMENTED (PENDING LOCAL QA) → HARDENED (PENDING LOCAL QA)
- `H-01.1` (Publishing no-placeholder empty state): IN PROGRESS (stabilized UI state model)
- `F-01.2` (CLS ≤ 0.10): NOT STARTED → IN PROGRESS (implementation patch applied; Lighthouse confirmation pending local run)

## Files likely touched
- `publishing.html`
- `css/publishing.css`
- `js/publishing.js`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`

## Exit criteria
1. `node tools/dev-check.mjs --ci` PASS.
2. `node tools/link-scan.mjs --ci` PASS.
3. Publishing page has valid library structure (no malformed skeleton fragments, no duplicate/stray tags).
4. Runtime and Lighthouse evidence captured (PASS locally, or environment-blocked notes + exact local commands).
