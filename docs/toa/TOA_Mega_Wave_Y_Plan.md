# TOA Mega Wave Y Plan — Architecture/Tooling Dependency Convergence

**Wave:** Y  
**Layer:** A (Architecture + Tooling)  
**Date:** 2026-02-24 (Australia/Brisbane)

## Scope Statement
Close the remaining implementation debt in architecture/tooling checklist A-02.1 by removing unused duplicate Playwright dependency surface and consolidating runtime automation on a single Playwright package path that matches existing scripts.

## Target Ledger + Checklist IDs
- **Ledger:** ID-017, ID-013
- **Checklist:** A-02.1 (primary), A-02.3 (dependency consistency support)

## Planned File Touches
- `package.json`
- `package-lock.json`
- Governance docs (`TOA_Audit_Ledger_Master.md`, `TOA_Master_Checklist_Live.md`, `TOA_Mega_Implementation_Checklist.md`, `TOA_Release_QA_Matrix.md`, `TOA_Release_Notes_Log.md`, `TOA_MEGA_WAVE_GLOBAL_EXECUTION_REPORT.md`)

## Acceptance Criteria
### DONE (code complete)
- Unused `@playwright/test` package removed from dev dependencies to avoid dual-version Playwright drift in runtime tooling.
- Existing runtime scripts continue to resolve against `playwright` package and non-browser QA gates pass.
- Governance artifacts capture A-02.1 progression with exact evidence.

### PENDING LOCAL QA
- Browser-executable dependent runtime and Lighthouse gates remain pending local execution where sandbox lacks Playwright Chromium/Chrome binaries.
