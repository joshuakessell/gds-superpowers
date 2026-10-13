# Development lifecycle

**Quick-track entry:** Use [Quick Flow](quick-flow.md) by default. The phases below are a detailed reference, not nine required documents or an obligatory waterfall. Existing schema-1 gate names remain valid; do not automatically migrate them.

Select the phase from actual repository evidence. Do not force a nearly finished project back to concept. Every phase has a bounded deliverable, required evidence, and an explicit exit condition.

| Phase | Main work | Parallel candidates | Exit evidence |
|---|---|---|---|
| 0 Charter | Theme, player fantasy, pillars, contract, platform assumptions, exclusions | Producer and Art Director read-only review | User-approved charter |
| 1 Evidence | Mechanical comparators and AI-assisted production claims | Research lanes plus skeptical audit | Decision-relevant evidence and unknowns |
| 2 Concept | Independent proposals and cross-review | Six player lenses in bounded batches | Selected signature mechanic and test hypothesis |
| 3 Systems | Run rules, economy, unlock graph, controls, art bible, architecture | Progression, interface, technical analysis | Consistent specifications and approved prototype plan |
| 4 Prototype | Movement, combat, reward choices, first synergy | Isolated implementation and independent review | Working prototype and recorded human observation |
| 5 Slice | Entire first and second run, saving, banking, base upgrade | Bounded systems, content, art, and QA tasks | Complete two-run loop and production decision |
| 6 Production | Reusable content, additional encounters and builds | Disjoint content packages under fixed interfaces | Content-complete alpha within agreed budget |
| 7 Validation | Balance, performance, accessibility, crash and save tests | Playtest analysis and independent verification | Release criteria met or exceptions explicitly accepted |
| 8 Release | Actual capture, packaging, credits, store materials, support | Release checks and marketing review | User-approved publication |

## Approval boundaries

Approve the charter, prototype plan, post-slice production plan, material scope change, spending, and publication. Small tasks inside an approved plan proceed without requesting approval after every edit. If a phase produces only a proposal, mark the gate pending.

No automatic phase advance based on agent confidence. Code tests, visual capture, human observations, and user approvals have their own evidence fields. A pass from one type does not fill another.

## Prototype before production

Separate throwaway uncertainty spikes from production work. An approved spike must have one question, a content cap, a discard/rebuild rule, and an exit artifact. Do not quietly promote experimental code into production to avoid proper tests.

The core prototype tests repeatability of combat without a long progression treadmill. The vertical slice tests a complete loop over two runs, including persistence and a new strategic possibility in run two. Both are needed before broad content expansion.

## Small versus medium scope

Proposed small-release envelope: one primary platform, single-player, one coherent 2D visual system, three biomes, three starters, roughly 30–45 distinct upgrades, several build families, and three branching facilities. The producer revises the envelope after observing actual content costs in the slice.

A medium project expands proven content and interaction depth. New major systems must displace something or carry an approved budget. Do not equate medium size with multiplayer, live services, unlimited procedural content, or a second game genre.

## Planning quality

Each milestone decomposes into small tasks with concrete paths, interface ownership, tests, playtest dependencies, and required evidence. Define production command lines from the actual repository rather than inventing engine paths or assuming a test runner. Reference an existing Superpowers plan and ledger when present.

Re-estimate after every slice-sized increment using observed rework, art cleanup, content creation, and integration effort. Treat early numbers as hypotheses. Do not claim AI removes asset-production or testing work.

## Minimum gate records

`G0`: charter approval.
`G1`: prototype-plan approval, required before prototype implementation.
`G2`: core-loop human observation, required before declaring the core experience validated.
`G3`: complete two-run slice with save/bank evidence.
`G4`: production-plan approval.
`G5`: release quality review and fresh build evidence.
`G6`: publication approval.

These gates are not evidence that the game will sell. Ship decisions should carry known limitations and measured facts.
