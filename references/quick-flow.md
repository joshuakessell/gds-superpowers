# Quick Flow Lite

## Operating model

One coordinator keeps the project coherent. BMAD-inspired discovery identifies the game. Superpowers supplies the installed engineering procedures. Open GSD-inspired bounded milestones and durable handoffs keep work resumable. None of these names grants a tool, service, background process, or additional permission.

Default track: `quick`. The prior full lifecycle remains available in [lifecycle](lifecycle.md) for explicit structured-production needs, not as a mandatory sequence of documents.

## Milestones

| Milestone | Build or decide | Exit evidence |
|---|---|---|
| Discover | Adaptive questions, brief, primary/secondary genres, visual direction, slice outline | Actual user approval of the direction |
| Core prototype | Small arena/scene, defining interaction, readable feedback | Running build, technical checks, first human observations |
| Complete slice | A miniature version of the entire loop | Loop completion and representative save/return behavior |
| Expand | One proven build family, encounter, route, or unlock at a time | Regression checks and relevant human feedback |
| Release | Stability, inputs, accessibility, performance, packaging, actual captures | Fresh release evidence and explicit publication approval |

For the established roguelite, a complete slice spans two runs: one of three powers, loot collection, safe banking, death or completion, a base purchase, and a changed option in the next run. Other genres define their own complete loop. Do not force death, permanent progression, procedural maps, or a home base into a game that does not need them.

## The repeated loop

1. **Inspect:** read current state and actual code, then select the highest-value uncertainty.
2. **Ask or outline:** settle only the choices needed for this increment. Summarize a new feature in a few paragraphs.
3. **Plan:** record one hypothesis, one to three scoped tasks, acceptance checks, an explicit non-goal, and a playtest question in `next.md` or the existing authoritative plan.
4. **Approve:** get approval covering the shown design and execution scope. A previous slice's approval does not cover an expanded new slice.
5. **Build:** use relevant installed Superpowers skills; isolated ownership, failing tests for production behavior, minimal implementation, and no broad refactor unless authorized.
6. **Verify:** inspect changes against the specification and code quality, rerun real commands, and capture actual gameplay when available. Two repair attempts maximum before pausing to diagnose or revise the hypothesis.
7. **Play:** tell the human how to launch, what to try, and what question the test addresses. Ask for observation. Automated play is separately labeled and cannot fill a human-playtest evidence field.
8. **Decide:** keep, tune, pivot, or cut using the observations. Retain the reason in state. Replace the current plan with the next bounded one only after preserving its outcome.

"Generative looping" means iteration on evidence. It does not mean endlessly generating features or running until an agent declares a game fun. Default: one approved slice per batch; stop at the human-play checkpoint. Several already-approved technical tasks may run together. They do not need an extra approval for each edit.

## Four checkpoint outcomes

**Keep:** the behavior met its acceptance criteria and the relevant observation supports retaining it.

**Tune:** retain the mechanic and test one change, such as reward spacing or encounter density. Avoid changing many variables without a reason.

**Pivot:** revise the design with KEEP / CHANGE / ADD / REMOVE / DEFER and seek approval for the consequential delta.

**Cut:** recommend removing a weak or expensive feature; do not delete user work without authorization.

Record mixed and negative feedback. An enjoyable short prototype does not establish retention or commercial success.

## Agent budget

Use two or three contrasting design roles for a substantive question; bring in the other perspectives in later decisions. All six player lenses should influence the initial design review when relevant, in bounded batches, not six repetitive reports on every tweak. Use a separate implementer and reviewer for nontrivial code when real delegation is available. A fresh verifier can be useful for save integrity or complex integration.

Only the coordinator writes the shared brief, plan, and state. Task packets contain the approved description, file boundaries, acceptance criteria, dependencies, context pointers, and stopping conditions. No overlapping writers in one worktree. Separate worktrees still need an integration owner and fresh integration tests. Record actual run IDs when provided by the host.

## Three working records

`game.md`: the approved game direction and compact system/visual rules, usually a few pages at most. Include a short future outline and no more than a few important evidence links. Existing GDD or design specs can serve this role.

`next.md`: only the current slice, with its tasks, check commands, test evidence pointers, and immediate playtest question. Existing Superpowers plans can serve this role.

`state.json`: answers with origins, current milestone and loop status, approvals, capabilities, task references, concise decisions, and next action. The coordinator owns it. Do not paste entire tool transcripts here.

Generated code, tests, assets, machine-readable upgrade tables, save schemas, and necessary licenses do not count as planning overhead. A needed technical detail should exist once in the most useful location. Add a separate written spec only when a concrete engineering risk cannot be managed in the current plan. A requested flyer/manual is a deliverable, not a standing process requirement.

Keep records small through summaries and pointers to actual logs or version history. Do not duplicate a full transcript per role. Do not auto-create epics, sprint boards, narrative bibles, or empty architecture files. Archive a completed plan only at a useful milestone or when version history is unavailable; do not erase meaningful evidence to satisfy a size target.

## Approvals and evidence

Directions and plans have revisions. Approval references name the revision and scope. Editing an approved genre contract, visual direction, platform, persistence rule, or slice scope invalidates the affected approval, not the entire project. "Looks good" approves only the description actually shown.

The optional state helper validates reference structure and recommends the next checkpoint. It cannot verify that an approval is genuine, that a test ran, or that the player enjoyed the game. Inspect the referenced evidence yourself.

Unattended continuation requires explicit bounded authorization and actual host support. A skill instruction does not create a scheduler. Spending, publishing, destructive changes, telemetry, and sensitive external actions remain separately controlled.

## Existing project compatibility

Existing `docs/gds/state.json` schema 1 remains supported by the old validator. Preserve its gate labels and document pointers; use a lean current-slice entry in the existing ledger instead of making a second ledger. Do not automatically rewrite it to the canonical schema or claim old milestones are approved. New projects use canonical `schema_version: 3`. Older schema 1 and quick-v2 state is converted only through `scripts/migrate-state.mjs` after a preview and explicit approval; a state migration is an explicit reviewed change, not an installer side effect.

When Superpowers expects its own document locations, use the user's lightweight-document preference where permitted and link to the single canonical brief/plan. Do not bypass a required check simply to reduce file count. The same prose can satisfy two frameworks without two copies.

## Task-Observer checkpoint

When effective automatic observation is enabled, use [Task-Observer integration](task-observer.md) at meaningful corrections, completed or failed tasks, review/playtest results, and handoff. Reuse available evidence and the existing state or native observer log. Do not create another required document or duplicate native observations. Record scope and uncertainty. Findings never approve their own installation; the user approves the exact staged change separately.
