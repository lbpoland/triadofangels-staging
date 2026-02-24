# TOA MEGA WAVE R — Accessibility Landmarks + Current-Page Semantics Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Accessibility (screen-reader landmarks + aria-current semantics)  
**Objective:** Execute the next highest-impact accessibility layer by hardening landmark fallbacks and current-page semantics for assistive tech users while staying GitHub Pages static-safe.

## Scope
- Keep work strictly in the **Accessibility layer** (E-series checklist scope).
- Add resilient runtime landmark role/label fallbacks (header/main/footer/footer-nav) without breaking existing semantic markup.
- Extend current-page semantics to footer navigation (`aria-current="page"`) so screen-reader users get consistent location cues in both header and footer nav systems.
- Maintain skip-link compatibility by ensuring `main` remains programmatically focusable (`tabindex="-1"` fallback only when absent).
- Update governance artifacts (ledger/checklists/QA matrix/manifest) with Wave R linkage and evidence.

## Wave Plan (target IDs)
- `E-02.3` Screen-reader landmark and current-page semantics verification — **IMPLEMENTED (pending local QA)**
- `E-01.4` Heading/landmark structural consistency hardening — **ADVANCED (pending local QA + Lighthouse confirmation)**
- `ID-008` Accessibility naming/semantics cluster — **ADVANCED via footer `aria-current` + landmark fallback hardening (pending local runtime/LHCI verification)**

## Files likely touched
- `js/global.js`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Mega_Wave_R_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_R_FILE_MANIFEST.md`

## Acceptance criteria
### DONE (environment-verifiable here)
1. Global runtime sets `aria-current="page"` for matching footer-nav route links while preserving one-current-per-nav behavior.
2. Landmark fallback hardening adds missing `role`/labels for header, footer, footer-nav, and `main` (without overriding existing explicit author intent).
3. `main` receives `tabindex="-1"` fallback only when absent to preserve skip-link/focus transfer reliability.
4. `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` passes.
5. `node tools/link-scan.mjs --ci` passes.

### PENDING LOCAL QA (required browser/runtime gates)
1. `node tools/dev-check.mjs --runtime --ci` completes with local Playwright browser install.
2. `node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json` completes with local Chrome/Chromium.
3. `node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json` completes with local Chrome/Chromium.
4. Manual screen-reader smoke (NVDA/VoiceOver): verify header nav + footer nav current-page announcement and skip-link focus movement to main on core pages.
