# TOA MEGA WAVE J — SEO Indexing Hygiene Plan

**Date:** 2026-02-24 (AEST)  
**Architectural layer:** SEO / Indexing governance (sitemap + robots policy enforcement)  
**Objective:** Enforce a canonical-only crawl corpus by aligning sitemap generation and robots directives with static-route indexing strategy.

## Scope
- Update sitemap generation rules so only canonical HTML routes are included.
- Remove non-HTML endpoints (notably `lyrics/**/*.txt`) from `sitemap.xml`.
- Align `robots.txt` with canonical route strategy by disallowing legacy query templates and `/404.html` from crawl/index scope.
- Run non-browser validation gates in sandbox; attempt runtime/browser gates once and defer to local QA pack when executables are unavailable.
- Update governance trackers (ledger/checklists/QA matrix/decisions) with implementation and evidence.

## Checklist IDs / Ledger Linkage
- `ID-033` (new): OPEN gap → FIX IMPLEMENTED (PENDING LOCAL QA)
- `G-04.1` (sitemap coverage/indexing correctness): NOT STARTED → IN PROGRESS
- `G-04.2` (robots alignment): NOT STARTED → IN PROGRESS
- `ID-015` (canonical route integrity): remains FIX IMPLEMENTED (PENDING QA), reinforced by canonical-only sitemap policy

## Files likely touched
- `tools/generate-static.mjs`
- `sitemap.xml`
- `robots.txt`
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Release_QA_Matrix.md`
- `docs/toa/TOA_Decisions_Log.md`
- `docs/toa/TOA_Mega_Wave_J_Plan.md`
- `docs/toa/TOA_MEGA_WAVE_J_FILE_MANIFEST.md`

## Exit criteria
1. `node tools/dev-check.mjs --ci` PASS.
2. `node tools/link-scan.mjs --ci` PASS.
3. `sitemap.xml` contains canonical HTML routes only (no `.txt` lyrics URLs).
4. `robots.txt` explicitly aligns with canonical indexing policy for static GitHub Pages reality.
5. Runtime/Lighthouse evidence captured (PASS locally, or environment-blocked notes + exact local commands).
