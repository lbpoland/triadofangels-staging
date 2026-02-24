# TOA MEGA WAVE K — Games / Apps / Store Readiness Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Platform readiness (Games + Apps + Store hubs, static-first truthfulness)  
**Objective:** Convert Games/Apps/Store surfaces into truthful static hubs with real launch links/disclosures and no fake checkout or release claims.

## Scope
- Refactor `games.html` into a truthful hub with readiness filters and explicit playable-now status.
- Refactor `apps.html` into a launch hub that links only to currently live web experiences.
- Align `digital-store.html` and `merch.html` copy with static checkout reality (no fake product delivery claims, no implied on-site payments).
- Keep work strictly within Mega Wave K architectural layer (platform readiness + trust copy for hubs).
- Run non-browser validation gates in sandbox; attempt runtime/browser gates once and defer to local QA pack when executables are unavailable.
- Update governance trackers (ledger/checklists/QA matrix/decisions) with issue linkage and evidence.

## Checklist IDs / Ledger Linkage
- `K-01.1` (Games hub curated catalog + filters): NOT STARTED → IN PROGRESS
- `K-02.1` (Apps hub install/launch links, truthful): NOT STARTED → IN PROGRESS
- `K-03.1` (Store hub disclosures + no fake cart): NOT STARTED → IN PROGRESS
- `ID-021` (Store/Merch/Digital Store truth + consistency): OPEN → FIX IMPLEMENTED (PENDING LOCAL QA)
- `ID-034` (new): Games/Apps hub truth-first readiness pass (FIX IMPLEMENTED, PENDING LOCAL QA)

## Files likely touched
- `games.html`
- `apps.html`
- `digital-store.html`
- `merch.html`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`
- `docs/toa/TOA_Mega_Wave_K_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_K_FILE_MANIFEST.md`

## Exit criteria
1. `node tools/dev-check.mjs --ci` PASS.
2. `node tools/link-scan.mjs --ci` PASS.
3. `games.html`, `apps.html`, `digital-store.html`, and `merch.html` contain truthful status/disclosure copy with no fake checkout or release claims.
4. Runtime/Lighthouse evidence captured (PASS locally, or environment-blocked notes + exact local commands).
