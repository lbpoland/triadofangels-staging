# TOA MEGA WAVE V — File Manifest

## Scope
Architecture + Tooling layer only (dist minification pipeline / ID-017).

## Changed Files
- `tools/build-static-dist.mjs` — Added zero-dependency dist build script that copies site files into `dist/`, minifies HTML/CSS/JS, and emits `dist/build-report.json`.
- `tools/static-serve.mjs` — Added `--root=<dir>` support so QA server can serve either source root or built `dist/` tree.
- `package.json` — Added `build:dist` and `qa:serve:dist` scripts for standardized dist build + QA workflow.
- `docs/toa/TOA_Audit_Ledger_Master.md` — Logged Patch Wave 18 (Mega Wave V), updated ID-017 status/details, and added QA evidence notes.
- `docs/toa/TOA_Master_Checklist_Live.md` — Updated wave header/date, architecture/performance checklist statuses for ID-017, and appended Mega Wave V execution summary.
- `docs/toa/TOA_Mega_Implementation_Checklist.md` — Updated wave header/date, advanced A-02.1 status narrative, and appended Wave V patch note.
- `docs/toa/TOA_Release_QA_Matrix.md` — Added Mega Wave V run context + QA execution notes with sandbox browser-limit evidence.
- `docs/toa/TOA_Decisions_Log.md` — Added DEC-033 to lock dist-first minification workflow decision.
- `docs/toa/TOA_Mega_Wave_V_Plan.md` — Added Wave V plan (scope, targets, acceptance criteria).
- `docs/toa/TOA_MEGA_WAVE_V_FILE_MANIFEST.md` — Added Wave V manifest for delivery traceability.
