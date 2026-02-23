# TOA Mega Wave F — Music Route Integrity & Duplicate-Content Risk Reduction

**Plan date:** 2026-02-23 (Australia/Brisbane)  
**Wave objective:** Reduce SEO/indexing risk by enforcing strict alignment between music catalog source data and pre-rendered static routes.  
**Architectural layer:** Data integrity + static route governance (no visual/theme changes).

---

## Scope (Wave F)

1. Add a hard validation gate in `tools/dev-check.mjs` that verifies:
   - all catalog album routes exist in `/music/albums/<album>/index.html`
   - all catalog track routes exist in `/music/tracks/<album>/<track>/index.html`
   - no orphan pre-rendered album/track routes exist outside catalog source of truth (`js/data.js`)
2. Remove orphan pre-rendered track pages detected by the new gate.
3. Update governance artifacts to record decision, issue status, and QA evidence.

---

## Checklist / Ledger IDs addressed

- **I-02.1** Track slug uniqueness; canonical routing (avoid duplicates) — moved to **IN PROGRESS**
- **I-02.2** JSON validation scripts for music catalog — moved to **DONE**
- **ID-015** Duplicate track slugs / route duplication risk — risk reduced by route-integrity gate + orphan cleanup
- **ID-032** New wave tracking entry for this implementation

---

## Files likely touched

- `tools/dev-check.mjs`
- `music/tracks/**` (orphan route removals only)
- `docs/toa/TOA_Audit_Ledger_Master.md`
- `docs/toa/TOA_Mega_Implementation_Checklist.md`
- `docs/toa/TOA_Master_Checklist_Live.md`
- `docs/toa/TOA_Decisions_Log.md`
- `docs/toa/TOA_Release_QA_Matrix.md`

---

## Validation gates (required)

- `node tools/dev-check.mjs --ci`
- `node tools/dev-check.mjs --runtime --ci`
- `node tools/link-scan.mjs --ci`

