# TOA Mega Wave S Plan — Governance + Tooling Safety Controls

**Wave:** MEGA WAVE S  
**Date:** 2026-02-24 (Australia/Brisbane)  
**Architectural layer:** A) Governance + Non-Drift Controls

---

## Scope Statement
Execute the next high-impact governance/tooling layer by closing A-section controls that reduce cross-session drift and harden QA gate reliability under GitHub Pages constraints.

## Targeted IDs
- **Checklist:** A-01.2, A-01.3, A-02.2, A-02.3
- **Ledger issues:** ID-001, ID-002, ID-013

## Planned File Touch List
- `docs/toa/TOA_Project_Instructions_v2_LOCKED.md`
- `docs/toa/TOA_Release_Notes_Log.md` (new)
- `tools/dev-check.mjs`
- `tools/console-clean.mjs` (new)
- `package.json`
- Governance trackers (ledger/checklists/QA/decisions as required by contract)

## Acceptance Criteria
### DONE (implementation complete)
- Delivery Safety Protocol codified in authority docs.
- Rolling release-notes artifact established and referenced in trackers.
- `dev-check` validates `robots.txt`/`sitemap.xml` baseline integrity.
- Console-clean runtime gate script exists and is wired to CI/QA scripts.

### VERIFIED (pending local QA where required)
- Non-browser checks pass in sandbox (`dev-check --ci ...`, `link-scan --ci`).
- Browser/runtime gate attempted once; if blocked by missing Playwright/Chromium executable, issue documented and moved to LOCAL QA PACK.

