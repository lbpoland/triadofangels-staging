# TOA MEGA WAVE N — Home Featured Albums Rail Stabilization Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Homepage featured-carousel interaction/accessibility layer  
**Objective:** Execute the next highest-impact homepage carousel-layer wave by stabilizing the Featured Albums rail interaction model on mobile/keyboard while preserving reduced-motion behavior and static-first constraints.

## Scope
- Keep work strictly in **Homepage Featured Albums carousel layer**.
- Ensure one keyboard interaction path (ArrowLeft/ArrowRight/Home/End) to avoid double scroll jumps.
- Improve SR discoverability for rail keyboard controls without adding fake controls.
- Harden mobile rail sizing/snap padding to preserve horizontal behavior and avoid edge bleed.
- Update governance artifacts (ledger/checklists/QA matrix/decisions) with Wave N linkage and evidence.

## Wave Plan (target IDs)
- `C-01.1` Mobile horizontal rail behavior (snap/no stacking/no edge bleed) — **IMPLEMENTED (pending local QA)**
- `C-01.2` Keyboard rail controls parity — **IMPLEMENTED (pending local QA)**
- `C-01.3` Reduced motion auto-scroll behavior continuity — **IMPLEMENTED (pending local QA)**
- `ID-006` Home Featured Albums carousel issue cluster — advanced to **IMPLEMENTED (pending local QA only)**

## Files likely touched
- `index.html`
- `css/style.css`
- `js/global.js`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`
- `docs/toa/TOA_Mega_Wave_N_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_N_FILE_MANIFEST.md`

## Acceptance criteria
### DONE (environment-verifiable here)
1. Home Featured Albums rail has no duplicate keyboard listeners in `js/global.js`.
2. Rail is labeled as a region and references explicit SR keyboard-help text in `index.html`.
3. Mobile rail column sizing/snap padding are hardened in `css/style.css`.
4. `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` passes.
5. `node tools/link-scan.mjs --ci` passes.

### PENDING LOCAL QA (required browser/runtime gates)
1. `node tools/dev-check.mjs --runtime --ci` completes with Playwright browser installed locally.
2. `node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json` completes with local Chrome/Chromium.
3. `node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json` completes with local Chrome/Chromium.
4. Manual Home rail sweep validates touch drag + keyboard arrows/Home/End + reduced-motion behavior on S24 and iOS/Safari-class browser.
