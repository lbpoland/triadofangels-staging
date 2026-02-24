# TOA Mega Wave J — File Manifest

Purpose: atomic manifest for MEGA WAVE J (SEO indexing hygiene).

| File | Purpose |
|---|---|
| `tools/generate-static.mjs` | Removed non-HTML lyrics TXT URL collection from sitemap generation so the crawler corpus stays canonical HTML-only. |
| `sitemap.xml` | Regenerated canonical sitemap from indexable HTML routes only (404/template/query endpoints and lyrics text files excluded). |
| `robots.txt` | Aligned robots policy with canonical indexing strategy by disallowing `/404.html` and legacy query templates (`/album.html`, `/track.html`, `/book.html`). |
| `docs/toa/TOA_Mega_Wave_J_Plan.md` | Defines Wave J scope, checklist linkage, QA strategy, and exit criteria. |
| `docs/toa/TOA_MEGA_WAVE_J_FILE_MANIFEST.md` | Records every file changed in MEGA WAVE J with one-line purpose. |
| `docs/toa/TOA_Audit_Ledger_Master.md` | Adds Wave J execution log and new issue ID-033 with evidence and status linkage. |
| `docs/toa/TOA_Master_Checklist_Live.md` | Updates live checklist/session log for Wave J and next-wave recommendation. |
| `docs/toa/TOA_Mega_Implementation_Checklist.md` | Advances backlog statuses for `G-04.1` and `G-04.2` and appends Wave J patch note. |
| `docs/toa/TOA_Release_QA_Matrix.md` | Captures Wave J QA evidence and browser-gate local execution dependency notes. |
| `docs/toa/TOA_Decisions_Log.md` | Adds DEC-025 for canonical HTML-only sitemap/robots indexing policy. |
