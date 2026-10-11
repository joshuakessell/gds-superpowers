# Modes

Each mode is bounded: it has inputs, a procedure, outputs, and a stop. Announce `Using gds-superpowers (<mode>) to <purpose>` first. Every mode begins with the Startup block in SKILL.md. "SP:" names the Superpowers skill routed to (see `superpowers-integration.md`).

## Orientation

**`tools`** — Inventory runtime capabilities: subagent tool, `superpowers:*` skills, Bash, file write, installed `gds-*` agents. Output a table and the resolved `state.mode`. Stop. No design work.

**`status`** — Read state and docs index. Report phase, approvals (ids), blocked items, open decisions, agent budget spent/remaining, last receipt. Stop.

**`start`** — Inputs: user's theme sentence, existing repo. Steps: inspect existing work first (never restart) → draft `charter.md` from the template → evidence plan (`research-plan.md`, 3–5 questions) → smallest prototype recommendation (one hypothesis). Stop after those three; ask for charter approval. SP: `brainstorming` for the charter conversation.

**`resume`** — Read state, decisions, tests. Reuse existing Superpowers specs/plans (`docs/superpowers/`, `docs/plans/`) rather than creating copies. Report current phase, approved, blocked, next bounded action. Stop.

**`handoff`** — Produce `templates/handoff.md` into `docs/gds/handoffs/`. Stop.

**`self-test`** — Run `node scripts/check-package.mjs`, and `node --test tests/*.test.mjs` when `tests/` exists (installed copies omit it), if Bash exists; paste output verbatim. Then re-read SKILL.md invariants and list any state field that violates them. Never flip eval statuses. SP: `verification-before-completion`, `diagnosing-superpowers` when a session went wrong.

## Discovery

**`research`** — Inputs: a question tied to the contract. Research Analyst brief. Output `docs/gds/research/<slug>.md` with facts (cited) separated from inferences; market or reception claims carry sources and dates. SP: `dispatching-parallel-agents` when questions are independent and an Agent tool exists.

**`concept`** — Theme coherence pass: map base / run / one-of-three / loot / retention / facilities onto the theme; draft visual-bible sketch (Art Director). Output a decision record. SP: `brainstorming`.

**`council`** — Inputs: one decision question. Procedure: choose 2–4 relevant roles (not all 13) → independent proposals (`templates/proposal.md`) → Producer cost challenge → one cross-review → one revision → Architect recommendation with explicit loss/retention rules and the smallest experiment. Record every dispatch in `agentBudget.spent`. Follow Delegation honesty when no Agent tool. Stop before implementation.

## Design

**`design`** — Turn council outcomes into the approved loop: offer rules, loss/retention table, run structure (Encounter Designer), economy knobs (Economy & Balance Designer). Output `DEC-` records; request `design` approval. SP: `brainstorming` → written design doc.

**`progression`** — Design four layers (Progression Designer) in `state.progression.layers`, each with run achievement, retained resource, requirement, unlock, interaction with an earlier layer, verifying test, cost. Run `project.mjs check`. Family access ≠ per-run grant is a stated test for every family.

**`plan`** — Inputs: approved design. Output task packets (`templates/task-packet.md`) with ids, dependencies (acyclic), approval refs, write leases, failing-test-first, verify commands; register them in `state.tasks`. Request `plan` approval. SP: `writing-plans`.

**`pivot`** — Inputs: existing implementation + approved contract. Inventory the code (read, do not edit) → classify every system KEEP / CHANGE / ADD / REMOVE / DEFER with a reason → delta plan as packets → stop for approval. No code changes before approval. SP: `writing-plans`.

**`expand`** — Add a system to an approved design without reopening the charter: council (small) → decision → packets. SP: `writing-plans`.

## Build

**`prototype`** — One hypothesis, smallest experiment, throwaway allowed but labeled; must end in a human observation session plan (`templates/playtest.md`). SP: `test-driven-development` for anything kept.

**`slice`** — Vertical slice: base → run → one-of-three → death → retained resource → facility. Packets executed with reviews; ends with a playtest. SP: `subagent-driven-development` with Agent tool, else `executing-plans`.

**`build`** — Execute approved packets. Each: lease check → failing test → implementation → verify command → receipt with evidence → spec review → quality review. SP: `subagent-driven-development` / `executing-plans`, `test-driven-development`, `using-git-worktrees` for parallel writers.

**`review`** — Two stages: spec compliance against the packet, then code quality. Fresh integration verification at the end (run the full verify commands, paste output). SP: `requesting-code-review`, `receiving-code-review`, `verification-before-completion`.

**`debug`** — Reproduce first; root cause; fix; add the regression test; verify. SP: `systematic-debugging`.

## Production and release

**`art`** — Inputs: approved visual bible. Produce asset records (`templates/asset-record.md`) typed `concept mockup` / `in-engine capture` / `final`; audit cohesion across every system; only `in-engine capture` is ever called a screenshot. Art Director brief.

**`pitch`** — Concept package: flyer, gameplay-style mockup, three-choice reward screen, home-base screen, selling points, technical gameplay manual. Every non-captured image is labeled "concept mockup". No platform availability or release claims. Producer + Art Director.

**`playtest`** — Playtest Coordinator: hypothesis, build id + seed, human participants (count ≥ 1 or it is not a playtest), protocol, verbatim observations, separated inferences, outcome retain / revise / cut, evidence entry `method: human-playtest`. Simulations and persona passes are recorded with their own method, never as playtests.

**`balance`** — Inputs: telemetry + playtest evidence. Economy & Balance Designer proposes knob changes with expected effect and the test that pins them; each change is a packet. No balance claim without a human observation after the change.

**`ship`** — Release checklist, verification output, honest availability statement (intended vs. verified platforms), merge / PR decision presented to the user. SP: `finishing-a-development-branch`, `verification-before-completion`.
