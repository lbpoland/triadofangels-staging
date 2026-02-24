## Patch Summary
- What changed and why.

## File Manifest
- List every changed file with one-line purpose.

## QA Checklist (PASS/FAIL/NOT RUN)
- [ ] **PASS**
- [ ] **FAIL**
- [ ] **NOT RUN**

## Checklist IDs Referenced
- Include IDs from `/docs/toa/TOA_Mega_Implementation_Checklist.md` (example: `A-02.2`, `L-01.1`).

## Commands Run (copy/paste)
```bash
# Paste exact commands and concise outputs
```

## Risks / Notes
- Risks, tradeoffs, known limitations, or follow-up items.

## Continuation Prompt
```text
Continue work on checklist items: <IDs>
Files to focus: <paths>
Local QA results pasted:
- dev-check strict:
- dev-check runtime:
- link-scan:
- LHCI mobile:
- LHCI desktop:
- manual S24 notes:
```

## Required Status Checks Plan
After this workflow runs once, configure branch protection on `main` to require:
- `TOA CI / ci-validate`

`runtime` is provided as a manual `workflow_dispatch` gate for heavier Playwright validation.
