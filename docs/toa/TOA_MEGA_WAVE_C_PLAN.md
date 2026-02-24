# TOA MEGA WAVE C — Head Performance Normalization Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** Head metadata performance hints (static HTML normalization)  
**Objective:** Reduce Lighthouse `uses-rel-preconnect` waste and harden head consistency on all static pages that load Google Fonts.

## Scope
- Apply canonical Google Fonts preconnect + dns-prefetch hints across every HTML file that includes `fonts.googleapis.com/css2`.
- Ensure the sweep tool is idempotent (`--apply` then `--check` returns zero additional changes).
- Record governance and QA evidence updates (ledger/checklist/QA matrix/decisions).

## Checklist IDs / Ledger Linkage
- `ID-028` (Performance / head metadata): TOOL SHIPPED → FIX IMPLEMENTED (pending local LHCI verification)
- `ID-032` (Tooling idempotence hardening): new issue, verified by non-browser QA
- `F-02.4` (Mega checklist): IN PROGRESS (implementation complete, browser QA pending)

## Files likely touched
- `tools/toa-mega-wave-c__preconnect-normalize.mjs`
- All HTML pages matching font stylesheet usage pattern
- Governance docs:
  - `docs/toa/TOA_Audit_Ledger_Master.md`
  - `docs/toa/TOA_Master_Checklist_Live.md`
  - `docs/toa/TOA_Mega_Implementation_Checklist.md`
  - `docs/toa/TOA_Release_QA_Matrix.md`
  - `docs/toa/TOA_Decisions_Log.md`
  - `docs/toa/TOA_MEGA_WAVE_C_FILE_MANIFEST.md`
