# TOA MEGA WAVE L — Console/CSP Hardening Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Console-clean + CSP hardening (tooling enforcement)  
**Objective:** Strengthen static governance gates so inline handlers/style attributes are blocked by CI and runtime QA scripts, and advance console/CSP layer items toward local verification.

## Scope
- Extend `tools/dev-check.mjs` with a strict inline-handler detector (`on*=`) as a hard gate.
- Wire no-inline handler/style gates into CI/runtime npm scripts in `package.json`.
- Keep work strictly within Mega Wave L layer (console/CSP governance + validation enforcement).
- Attempt all standard QA gates once in sandbox; record browser-tooling failures exactly and provide local QA pack.
- Update governance trackers (ledger/checklists/QA matrix/decisions) with Wave L evidence and status transitions.

## Checklist IDs / Ledger Linkage
- `L-01.1` (Eliminate console errors across core gate pages): **IN PROGRESS** (tooling guardrails strengthened; local runtime/LHCI still required)
- `L-01.2` (CSP no inline handlers/style-attr reliance): **IN PROGRESS** (strict gate implemented, pending local runtime/LHCI verification)
- `ID-013` (console errors on core pages): **FIX IMPLEMENTED (PENDING LOCAL QA)**
- `ID-032` (runtime/LHCI blocked in sandbox): remains **FIX IMPLEMENTED (PENDING QA)** with updated Wave L evidence.

## Files likely touched
- `tools/dev-check.mjs`
- `package.json`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`
- `docs/toa/TOA_Mega_Wave_L_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_L_FILE_MANIFEST.md`

## Exit criteria
1. `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` PASS.
2. `node tools/link-scan.mjs --ci` PASS.
3. Runtime gate attempted once and documented if blocked due missing Playwright browser executable.
4. LHCI mobile + desktop attempted once and documented if blocked due missing Chrome/Chromium executable.
5. Governance docs updated with Wave L status/evidence and local QA continuation commands.
