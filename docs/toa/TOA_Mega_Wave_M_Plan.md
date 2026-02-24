# TOA MEGA WAVE M — Navigation Desktop Dropdown Stability Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Navigation / Header / Dropdown interaction stability  
**Objective:** Execute the next highest-impact navigation-layer wave by hardening desktop dropdown placement/interaction behavior while preserving the existing mobile second-panel architecture.

## Scope
- Keep work strictly in **navigation layer** (no cross-layer perf/content/legal changes).
- Implement edge-aware desktop dropdown alignment so submenu panels do not clip off-screen on narrow desktop/tablet-landscape viewports.
- Preserve click-inside interaction (no premature close) while maintaining outside-click and ESC close semantics.
- Re-run all available validation gates and document browser-gate limitations exactly.
- Update governance artifacts (ledger/checklists/QA matrix/decisions) with Wave M evidence and linkage.

## Wave Plan (target IDs)
- `B-02.1` Desktop dropdown positioning / clipping prevention — **IMPLEMENTED (pending local QA)**
- `B-02.3` Click-outside behavior while interacting inside submenu — **IMPLEMENTED (pending local QA confirmation)**
- `B-03.1` Nav ARIA + ESC/focus return continuity — **maintained and re-verified in code path (pending local QA)**
- `ID-005` Global nav stability issue cluster — advanced toward **VERIFIED (pending local QA only)**
- `ID-032` Browser-runtime verification dependency — remains documented as **pending local execution**

## Files likely touched
- `js/global.js`
- `css/style.css`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`
- `docs/toa/TOA_Mega_Wave_M_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_M_FILE_MANIFEST.md`

## Acceptance criteria
### DONE (environment-verifiable here)
1. Desktop submenu open path performs viewport-edge alignment logic in `js/global.js` without inline-handler/style-policy regressions.
2. Navigation submenu alignment class exists in CSS and is scoped to dropdown layer only.
3. `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` passes.
4. `node tools/link-scan.mjs --ci` passes.

### PENDING LOCAL QA (required browser/runtime gates)
1. `node tools/dev-check.mjs --runtime --ci` completes with Playwright browser installed locally.
2. `node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json` completes with local Chrome/Chromium.
3. `node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json` completes with local Chrome/Chromium.
4. Manual nav regression sweep on S24 + desktop verifies no dropdown clipping/hover traps/focus loss.
