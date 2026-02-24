# TOA MEGA WAVE U — Architecture/Tooling bfcache Gate Hardening Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Architecture + Tooling (A-series / runtime QA infrastructure)  
**Objective:** Execute the next highest-impact architecture/tooling slice by removing local QA cache policies that can falsely block bfcache diagnostics.

## Scope
- Keep work strictly in the **Architecture + Tooling layer**.
- Resolve the highest-impact open tooling/runtime blocker tied to bfcache diagnostics (`ID-018`).
- Align local QA server behavior with production-like navigation caching while preserving deterministic QA behavior.
- Update governance artifacts (ledger/checklists/QA matrix/decisions/manifest) with Wave U linkage and evidence.

## Wave Plan (target IDs)
- `ID-018` Back/Forward Cache Prevented — **FIX IMPLEMENTED (pending local QA)**
- `A-02.4` Resolve bfcache blockers in local QA/runtime stack — **IN PROGRESS (implementation done; local browser verification pending)**

## Files likely touched
- `tools/static-serve.mjs`
- `tools/dev-check.mjs`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`
- `docs/toa/TOA_Mega_Wave_U_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_U_FILE_MANIFEST.md`

## Acceptance criteria
### DONE (environment-verifiable here)
1. Local QA static server no longer defaults to `Cache-Control: no-store` for all responses.
2. `tools/dev-check.mjs` runtime server no longer defaults to `Cache-Control: no-store` for all responses.
3. `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` passes.
4. `node tools/link-scan.mjs --ci` passes.

### PENDING LOCAL QA (required browser/runtime gates)
1. `node tools/dev-check.mjs --runtime --ci` completes with local Playwright browser install.
2. `node tools/lhci-run.mjs --config=./.lighthouserc.mobile.json` completes with local Chrome/Chromium.
3. `node tools/lhci-run.mjs --config=./.lighthouserc.desktop.json` completes with local Chrome/Chromium.
4. Chrome DevTools bfcache diagnostics on core pages confirm restored bfcache eligibility where applicable.
