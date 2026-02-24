# TOA MEGA WAVE S — Accessibility Contrast + Publishing List Semantics Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Accessibility (contrast + required-child semantics)  
**Objective:** Execute the next highest-impact accessibility layer by hardening text contrast tokens and replacing ARIA-role list scaffolding with native list semantics for Publishing shelves.

## Scope
- Keep work strictly in the **Accessibility layer** (E-series checklist scope).
- Improve contrast resilience by strengthening muted/footer text tokens across ToA, Dark, and Light themes.
- Remove fragile role-based list semantics in Publishing shelf rows and ship semantic `ul/li` structure to reduce `aria-required-children` risk.
- Replace opacity-driven metadata text styling with explicit token-driven colors to maintain readable contrast.
- Update governance artifacts (ledger/checklists/QA matrix/manifest) with Wave S linkage and evidence.

## Wave Plan (target IDs)
- `E-01.2` Color contrast hardening across theme text surfaces — **IMPLEMENTED (pending local QA)**
- `E-01.3` Publishing required-children semantics hardening — **IMPLEMENTED (pending local QA)**
- `ID-009` Accessibility contrast cluster — **HARDENED (pending local QA)**
- `ID-011` Publishing ARIA required-children cluster — **HARDENED (pending local QA)**

## Files likely touched
- `css/style.css`
- `css/publishing.css`
- `js/publishing.js`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`
- `docs/toa/TOA_Mega_Wave_S_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_S_FILE_MANIFEST.md`

## Acceptance criteria
### DONE (environment-verifiable here)
1. Theme token updates increase muted/footer text contrast floors without breaking existing theme architecture.
2. Publishing shelf rows use native semantic lists (`ul > li > a`) instead of role-based list/listitem attributes.
3. Publishing card/shelf secondary text uses explicit token colors rather than opacity-only fades.
4. `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` passes.
5. `node tools/link-scan.mjs --ci` passes.

### PENDING LOCAL QA (required browser/runtime gates)
1. `node tools/dev-check.mjs --runtime --ci` completes with local Playwright browser install.
2. `node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json` completes with local Chrome/Chromium.
3. `node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json` completes with local Chrome/Chromium.
4. Manual accessibility smoke verifies Publishing shelf list semantics in browser accessibility tree and confirms readable contrast for muted/footer text in ToA/Dark/Light themes.
