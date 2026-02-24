# Triad of Angels Staging

Staging repository for the static-first Triad of Angels website.

## CI
- `TOA CI / ci-validate` runs on pull requests to `main` (`npm ci` + `npm run ci:validate`).
- `TOA CI / runtime` is available as a manual `workflow_dispatch` run for Playwright-backed runtime validation.
