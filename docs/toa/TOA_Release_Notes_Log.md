# TOA Release Notes Log (Rolling)

**Purpose:** Append-only release log per patch wave to preserve governance continuity.

## 2026-02-24 — MEGA WAVE W (Governance + Non-Drift Controls)
- Added Delivery Safety Protocol to locked project instructions with explicit authority ingest, wave plan, atomic delivery, QA evidence, and governance update sequence.
- Added this rolling release-notes artifact and wired governance trackers to treat it as required session output.
- Closed governance workflow debt for tracker normalization/full-coverage enforcement/atomic delivery control (ID-001/ID-002/ID-003) to VERIFIED state pending routine future adherence.

## 2026-02-24 — Prior Waves Consolidated
- Mega Waves C through V were executed and documented in governance trackers; browser-runtime/Lighthouse gates remain pending local browser availability where noted.

## 2026-02-24 — MEGA WAVE X (Architecture/Tooling QA Gate Expansion)
- Expanded `tools/dev-check.mjs` static gate coverage to include duplicate ID detection, CSP meta presence, internal HTML broken-link checks, and robots/sitemap integrity assertions.
- Added `tools/console-clean.mjs` plus npm scripts (`ci:console-clean`, `qa:console-clean`) to enforce console-clean runtime checks across core pages when Playwright browser binaries are available locally.
- Updated governance trackers for A-02.2/A-02.3 progression; local browser-gated execution remains pending due missing Chromium executable in this environment.


## 2026-02-24 — MEGA WAVE Y (Architecture/Tooling Dependency Convergence)
- Removed unused `@playwright/test` from `devDependencies` so runtime QA tooling uses a single Playwright package path (`playwright`), reducing dependency drift risk under checklist A-02.1.
- Revalidated non-browser gates (strict dev-check, link scan, dist build) and recorded browser-executable blocker state for runtime/LHCI gates in governance artifacts.
