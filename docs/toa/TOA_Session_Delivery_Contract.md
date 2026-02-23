# TOA Website — Session Delivery Contract (Atomic Patch Protocol)

## Hard Rules
1) Only files attached in this response are counted as DONE.
2) Provide one ZIP of completed files in this response.
3) Prefer individual file downloads too.
4) DONE list must match ZIP contents exactly.
5) Unfinished files must be listed as IN PROGRESS (not DONE).
6) No truncated code/files.

## Patch Session Output (Required)
1. ZIP download
2. Individual file downloads (preferred)
3. Website Work Checklist
   - DONE
   - IN PROGRESS
   - NEXT
   - Risks / QA Notes
4. QA Checklist (PASS / FAIL / NOT RUN)
5. Continuation Prompt

## Audit Session Output (Required)
No code delivery.
Must include:
- Coverage Map
- Scorecard
- Issue Ledger
- File Action Map
- QA Matrices
- Roadmap
- Next Patch Prompt

## Local Workflow Alignment
User tests locally, runs dev-check and Lighthouse, then bundles with:
python .\toa_bundle.py --profile chatgpt --clean-lighthouse archive
