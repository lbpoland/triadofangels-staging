# TOA Website — Audit Execution Bridge (Operational Blueprint)

## Recommended Mode Strategy
### Default for implementation
Use **GPT-5.2 Thinking (Extended)** in the Project for:
- coding
- page upgrades
- CSS/JS fixes
- file generation
- patch delivery

### Use Deep Research only for milestone audits
Deep Research is useful for:
- periodic full-site audits
- architecture reviews
- roadmap refreshes
Not as the default coding mode.

---

## Why the deep-research report felt incomplete
It produced a useful audit narrative and issue list, but it did not generate the project tracking files (ledger/checklist/QA matrix) and likely needs reconciliation against your latest local bundle state.

Treat it as a seed report, not the final canonical audit.

---

## Best Course of Action (Recommended)
1) Upload this new system pack into the Project
2) Replace Project Instructions with the v2 instructions
3) Keep your latest bundles/manifest/Lighthouse artifacts in Project
4) In GPT-5.2 Thinking mode, run an **audit normalization session**:
   - read rules + manifest + bundle + Lighthouse
   - read deep-research report
   - reconcile findings against current files
   - update Audit Ledger + Master Checklist + QA Matrix
5) Start Patch Wave 1 (P0) using atomic delivery
6) Repeat local test -> Lighthouse -> bundle -> upload loop

---

## Patch Wave Priority (Practical)
### P0
- accessibility baseline (skip links, main landmarks, headings, labels)
- nav/dropdown/carousel reliability and clipping
- console errors / invalid states / broken links
- head metadata baseline on core pages

### P1
- mobile/tablet polish (S24 included)
- hero/media optimization
- OG/Twitter/schema rollout
- 404 + search if missing
- trust/legal page alignment

### P2
- premium visual polish
- component consistency
- architecture cleanup and data model consistency
- pre-render planning

### P3
- games platform expansion
- apps platform expansion
- optional external auth/leaderboards

---

## Anti-Missing-Files Rule (Must Stay)
A file is only DONE if downloadable in the same response.
This prevents the exact issue you’ve been hitting with ZIPs missing files.

---

## Efficiency Note
Keeping chat text shorter helps a little, but the main token cost is:
- reading bundles
- reasoning across files
- generating code

Best practice:
- concise commentary
- detailed files/checklists
- strict tracker updates to avoid repeated context loss
