# TOA MEGA WAVE Q — Responsive Overflow + Safe Gutter Hardening Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Responsive layout hardening (overflow control + consistent gutters + long-text wrapping)  
**Objective:** Execute the next highest-impact responsive layer by closing viewport-edge bleed risks and standardizing section/container padding behavior across breakpoints.

## Scope
- Keep work strictly in the **Responsive Layout layer** (D-series checklist scope).
- Normalize main-content gutters so section cards do not touch viewport edges on small devices.
- Standardize inner section horizontal padding with shared tokens across breakpoints.
- Harden long text/URL wrapping in section content to avoid horizontal overflow.
- Update governance artifacts (ledger/checklists/QA matrix) with Wave Q linkage and evidence.

## Wave Plan (target IDs)
- `D-01.1` Prevent horizontal page scroll on small devices; fix card edge bleed — **ADVANCED (pending local QA)**
- `D-01.2` Standardize container padding per breakpoint; avoid elements touching viewport edges — **IMPLEMENTED (pending local QA)**
- `D-01.3` Clamp long titles/URLs; ensure word-break behavior does not break layout — **IMPLEMENTED (pending local QA)**
- `ID-007` Responsive overflow cluster — **ADVANCED via shared gutter + wrap hardening (pending local runtime/LHCI/manual proof)**

## Files likely touched
- `css/style.css`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Mega_Wave_Q_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_Q_FILE_MANIFEST.md`

## Acceptance criteria
### DONE (environment-verifiable here)
1. Shared layout tokens exist for page gutters and section inline padding.
2. `main` container constrains inline width + applies responsive inline gutter to prevent edge collisions.
3. Inner page section cards use tokenized inline padding and width clamping (`max-width: min(1200px, 100%)`).
4. Section text + links gain long-string wrapping guards (`overflow-wrap`) to reduce URL/title overflow risk.
5. `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` passes.
6. `node tools/link-scan.mjs --ci` passes.

### PENDING LOCAL QA (required browser/runtime gates)
1. `node tools/dev-check.mjs --runtime --ci` completes with local Playwright browser install.
2. `node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json` completes with local Chrome/Chromium.
3. `node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json` completes with local Chrome/Chromium.
4. Manual responsive matrix (360x740 + 412x915 + 768x1024 + 1366x768): verify no horizontal bleed on card/section surfaces and long URLs do not force viewport overflow.
