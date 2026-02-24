# TOA MEGA WAVE P — Navigation Submenu Parity Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Navigation submenu interaction parity (desktop pointer + keyboard)  
**Objective:** Execute the next highest-impact navigation layer by closing desktop submenu pointer/keyboard parity gaps without crossing into unrelated architecture layers.

## Scope
- Keep work strictly in the **Navigation / Header layer** (B-series checklist scope).
- Implement desktop submenu pointer parity with keyboard-open behavior so parent nav items open consistently for pointer and keyboard users.
- Add submenu keyboard traversal (ArrowUp/ArrowDown/Home/End) for parity and faster non-tab navigation.
- Preserve existing mobile Option-B second-panel behavior and outside-click/focus close safety.
- Update governance artifacts (ledger/checklists/QA matrix) with Wave P linkage and evidence.

## Wave Plan (target IDs)
- `B-02.2` Multi-level submenu pointer + keyboard parity; no hover traps — **IMPLEMENTED (pending local QA)**
- `B-03.1` Nav ARIA + ESC/focus-return continuity — **ADVANCED (pending local QA)**
- `ID-005` Navigation/mobile-dropdown stability cluster — **ADVANCED via parity controls (pending local runtime/LHCI/manual proof)**
- `ID-013` Console-clean interaction stability — **REGRESSION GUARDED (pending local runtime browser proof)**

## Files likely touched
- `js/global.js`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Mega_Wave_P_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_P_FILE_MANIFEST.md`

## Acceptance criteria
### DONE (environment-verifiable here)
1. Desktop nav submenu toggles support ArrowUp/ArrowDown opening, plus Enter/Space toggling from trigger buttons.
2. Open desktop submenu supports ArrowUp/ArrowDown/Home/End focus traversal across submenu items.
3. Desktop pointer-enter opens submenus and pointer-leave closes only when focus is no longer inside the nav item.
4. Existing ESC close + focus return behavior remains intact.
5. `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` passes.
6. `node tools/link-scan.mjs --ci` passes.

### PENDING LOCAL QA (required browser/runtime gates)
1. `node tools/dev-check.mjs --runtime --ci` completes with local Playwright browser install.
2. `node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json` completes with local Chrome/Chromium.
3. `node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json` completes with local Chrome/Chromium.
4. Manual desktop nav regression (1366x768 + 2560x1440): pointer hover/open-close, keyboard arrows/home/end traversal, ESC return focus, outside click/focus close, no trapped open menus.
