# TOA MEGA WAVE I — Critical Path LCP Containment Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Performance (critical render path / LCP payload containment)  
**Objective:** Reduce first-view mobile LCP pressure by scoping heavyweight cinematic background imagery to Home only and preloading the Home hero image candidate.

## Scope
- Contain ToA full-page hero background image loading to `index.html` only (ToA theme), replacing non-home ToA pages with a lightweight gradient fallback.
- Keep Home cinematic intent intact while reducing cross-site hero-image cost on pages called out in ID-014 / ID-016 (Music/Search and other core pages).
- Preload Home hero image candidate with responsive `imagesrcset`/`imagesizes` so the above-fold hero is discovered earlier.
- Run required non-browser validation gates in sandbox and attempt runtime/Lighthouse gates once; defer browser-only gates to LOCAL QA PACK when executables are unavailable.
- Update governance trackers (ledger/checklists/QA matrix/decisions) with wave linkage and evidence.

## Checklist IDs / Ledger Linkage
- `ID-014` (LCP too high on core pages): OPEN → FIX IMPLEMENTED (PENDING LOCAL QA)
- `ID-016` (Search perf baseline): OPEN → IN PROGRESS (risk reduced by non-home heavy-background removal)
- `F-01.1` (Reduce LCP on Home and Music): IN PROGRESS (advanced)
- `F-02.3` (Preload only true LCP): NOT STARTED → IN PROGRESS

## Files likely touched
- `css/style.css`
- `index.html`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`
- `docs/toa/TOA_Mega_Wave_I_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_I_FILE_MANIFEST.md`

## Exit criteria
1. `node tools/dev-check.mjs --ci` PASS.
2. `node tools/link-scan.mjs --ci` PASS.
3. Home hero image is explicitly preloaded as image candidate.
4. ToA heavy full-page background image is no longer applied to non-home pages.
5. Runtime/Lighthouse evidence captured (PASS locally, or environment-blocked notes + exact local commands).
