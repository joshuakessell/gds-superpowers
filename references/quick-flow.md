# Quick Flow Lite

This is the authoritative increment procedure. BMAD-inspired discovery defines the game; installed Superpowers supplies engineering. Full [lifecycle](lifecycle.md) documentation is optional, not the default.

## Milestones

| Milestone | Target | Exit evidence |
|---|---|---|
| Discover | Direction, genres, visuals and first hypothesis | User approval of shown direction |
| Prototype | Defining interaction with minimal content | Running build, technical checks, human observations |
| Slice | Miniature complete loop | Representative completion, save/return, and feedback |
| Expand | One proven encounter, build family, route or unlock | Regressions and relevant human evidence |
| Release | Stability, accessibility, performance and distribution | Fresh evidence and explicit publication approval |

For an approved persistent-roguelite profile, the slice spans two runs: select one of three temporary upgrades, collect/secure loot, die or complete, purchase a base unlock, and start with a new option. Do not impose this structure on another genre.

## One increment

1. Inspect actual code, state and relevant results. Select the highest-value uncertainty. Use the [interview](interview.md) only for missing intent that affects this increment.
2. Put one hypothesis, usually one to three tasks, dependencies, allowed files, acceptance checks, a non-goal, and a human-test question in the current plan. Show the compact design and implementation scope together where appropriate.
3. Obtain the approval defined in SKILL.md. A previous scope or revision does not authorize an expanded slice. Reuse verified consent; do not ask again for each authorized edit.
4. Use [engineering](engineering.md) for approved changes and [ownership](ownership.md) before admissions. Preserve uncommitted work. Read only relevant role briefs; independent proposals precede one cross-review and revision. Default concurrency is three, including research jobs.
5. Verify the actual diff, technical behavior, specification compliance and quality. Report baseline and new failures separately. After two unsuccessful repairs, stop for diagnosis or a revised plan rather than patching indefinitely.
6. Give launch instructions and one focused question. Wait for human observation for gameplay changes. Infrastructure can use technical evidence; do not relabel gameplay as infrastructure to evade its gate. Automated play and personas remain separate evidence categories.
7. Keep, tune, pivot or cut. Record the observed result and next action before replacing the plan. Default execution stops after one approved slice, not an unbounded feature-generation loop.

**Keep** when acceptance and relevant observations support the mechanic. **Tune** one variable when possible. **Pivot** through the preservation inventory in [continuity](continuity.md), seeking approval for the delta. **Cut** is a proposal until removal is authorized. Record mixed and negative feedback; a good prototype does not establish long-term retention or profit.

## Three working records

`game.md` holds direction, genre/system rules, visuals, exclusions and a short future outline. `next.md` holds only the current increment and evidence pointers. Canonical `schema_version: 3` in `state.json` holds answer provenance, milestone, approvals, tasks/jobs, concise decisions and next action. The coordinator is their sole writer. Existing Superpowers plans or GDDs can fill these roles through pointers.

Keep useful history through version control or bounded archival, not repeated full transcripts. Add a separate spec only when an identified engineering risk requires it. Source, tests, save schemas, assets, licenses and requested manuals are not planning bureaucracy. No mandatory sprint boards, epics, empty architecture files or competing ledgers.

Old schema 1 and quick-v2 state must follow [explicit migration](../MIGRATION.md), not an installer side effect. Preserve approvals and source data without inventing validity. Helpers check structure; the coordinator still inspects actual evidence. Use the observer only under the mode and ownership rules in SKILL.md. Unattended work requires bounded authorization and host support; these instructions do not create a scheduler.
