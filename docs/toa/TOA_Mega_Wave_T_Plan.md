# TOA MEGA WAVE T — Accessibility Mode Support (Publishing) Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Accessibility (mode support: forced-colors + reduced motion)  
**Objective:** Execute the next highest-impact accessibility layer by extending reduced-motion and forced-colors resilience across Publishing interactive surfaces.

## Scope
- Keep work strictly in the **Accessibility layer** (E-series checklist scope).
- Expand reduced-motion compliance for Publishing cards/chips/buttons and horizontal shelf behavior.
- Expand forced-colors compatibility for Publishing form controls, shelf/card surfaces, and focus indicators.
- Update governance artifacts (ledger/checklists/QA matrix/decisions/manifest) with Wave T linkage and evidence.

## Wave Plan (target IDs)
- `E-02.1` Forced-colors interactive-state visibility — **IMPLEMENTED (pending local QA)**
- `E-02.2` Reduced-motion suppression on interactive transitions/scroll behavior — **IMPLEMENTED (pending local QA)**
- `ID-032` Mode-support hardening cluster — **HARDENED (pending local QA)**

## Files likely touched
- `css/publishing.css`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`
- `docs/toa/TOA_Mega_Wave_T_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_T_FILE_MANIFEST.md`

## Acceptance criteria
### DONE (environment-verifiable here)
1. Publishing reduced-motion mode suppresses transition/transform effects and avoids smooth scroll behavior.
2. Publishing forced-colors mode applies system-color compliant backgrounds/borders/text and explicit focus-visible outlines.
3. `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` passes.
4. `node tools/link-scan.mjs --ci` passes.

### PENDING LOCAL QA (required browser/runtime gates)
1. `node tools/dev-check.mjs --runtime --ci` completes with local Playwright browser install.
2. `node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json` completes with local Chrome/Chromium.
3. `node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json` completes with local Chrome/Chromium.
4. Manual accessibility smoke verifies Publishing forced-colors boundaries/focus cues and reduced-motion behavior in OS/browser accessibility settings.
