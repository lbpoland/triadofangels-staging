# TOA MEGA WAVE O — Homepage Hero Polish Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Homepage hero presentation/accessibility/perf-hint layer  
**Objective:** Execute the next highest-impact homepage layer by hardening hero typography responsiveness, CTA accessibility focus behavior, and responsive hero image candidate selection while preserving GitHub Pages static constraints.

## Scope
- Keep work strictly in the **Homepage hero layer** (no cross-layer nav/platform rewrites).
- Implement fluid hero typography and subtitle spacing to prevent text overlap across breakpoints.
- Improve CTA accessibility via explicit focus-visible treatment and minimum touch target sizing.
- Add responsive `img srcset/sizes` hints for the Home hero image to support LCP candidate selection.
- Update governance artifacts (ledger/checklists/QA matrix) with Wave O linkage and evidence.

## Wave Plan (target IDs)
- `C-02.1` Hero typography scale across breakpoints — **IMPLEMENTED (pending local QA)**
- `C-02.2` CTA button a11y + focus — **IMPLEMENTED (pending local QA)**
- `C-02.3` Hero LCP optimization follow-up — **IMPLEMENTED (pending local LHCI verification)**
- `ID-014` Performance LCP cluster — advanced with responsive hero candidate hints (**pending local LHCI proof**)
- `ID-006` Homepage UX cluster — advanced with hero legibility/focus continuity adjacent to Featured rail (**pending local runtime/manual proof**)

## Files likely touched
- `index.html`
- `css/style.css`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Mega_Wave_O_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_O_FILE_MANIFEST.md`

## Acceptance criteria
### DONE (environment-verifiable here)
1. Home hero heading/subtitle/strapline typography is fluid and bounded using breakpoint-safe sizing.
2. Home hero CTA exposes explicit `:focus-visible` ring and keeps target height at least 44px.
3. Home hero image `<img>` includes responsive `srcset` and `sizes` attributes.
4. `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` passes.
5. `node tools/link-scan.mjs --ci` passes.

### PENDING LOCAL QA (required browser/runtime gates)
1. `node tools/dev-check.mjs --runtime --ci` completes with local Playwright browser install.
2. `node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json` completes with local Chrome/Chromium.
3. `node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json` completes with local Chrome/Chromium.
4. Manual Home hero regression: 360x740 + 412x915 + tablet + desktop; confirm no hero text overlap and CTA focus ring in light/dark/reduced-motion.
