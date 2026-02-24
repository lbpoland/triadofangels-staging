# TOA MEGA WAVE V — Architecture/Tooling dist Minification Pipeline Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Architecture + Tooling (A-series / build pipeline)  
**Objective:** Execute the next highest-impact architecture/tooling slice by implementing a static-friendly dist build pathway for minification/compression parity checks.

## Scope
- Keep work strictly in the **Architecture + Tooling layer**.
- Resolve the highest-impact open build/performance tooling gap tied to `ID-017`.
- Implement a reproducible dist build output that preserves source readability while enabling minified artifact QA.
- Update governance artifacts (ledger/checklists/QA matrix/decisions/manifest) with Wave V linkage and evidence.

## Wave Plan (target IDs)
- `ID-017` Build/Perf: minification + cache + compression strategy — **FIX IMPLEMENTED (pending local QA)**
- `A-02.1` Repo/tooling consistency checkpoint — **IN PROGRESS** (dist workflow introduced; dependency/version cleanup still pending)

## Files likely touched
- `tools/build-static-dist.mjs`
- `tools/static-serve.mjs`
- `package.json`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`
- `docs/toa/TOA_Mega_Wave_V_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_V_FILE_MANIFEST.md`

## Acceptance criteria
### DONE (environment-verifiable here)
1. Dist build command exists and runs (`node tools/build-static-dist.mjs --out=dist`).
2. Dist output includes minified HTML/CSS/JS and build summary report.
3. Local static server supports serving alternate roots (`--root=dist`).
4. `node tools/dev-check.mjs --ci --strict --strict-a11y-head --strict-no-inline-style --strict-no-inline-handler` passes.
5. `node tools/link-scan.mjs --ci` passes.

### PENDING LOCAL QA (required browser/runtime gates)
1. `node tools/dev-check.mjs --runtime --ci` completes with local Playwright browser install.
2. `npm run qa:serve:dist` + LHCI mobile/desktop complete with local Chrome/Chromium.
3. Dist-origin Lighthouse confirms `unminified-css`, `unminified-javascript`, and compression findings are resolved/acceptable.
4. Production-origin Lighthouse confirms parity with dist-origin improvements before marking `ID-017` VERIFIED.
