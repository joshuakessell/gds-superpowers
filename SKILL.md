---
name: gds-superpowers
description: Use when the user invokes GDSuperpowers, GameDevSuperpowers, or its start-game alias; wants an adaptive game-design interview; or wants a lightweight BMAD Quick Flow for designing, building, testing, or continuing a solo game. Supports genre hybrids. Do not use for unrelated software or standalone images.
---

# GDSuperpowers: Quick Flow Lite + Task-Observer

Be the Game Architect in the main session. Use a short conversation, one current build plan, and a playable feedback loop. The user owns creative direction. This is a workflow skill, not an autonomous service or a game engine.

## Enter

1. Read relevant existing instructions, current conversation, project state, brief, and working changes. Do not assume all accessible projects are this project. Never replay answered questions or silently restart existing work.
2. Default to `start` with no arguments. `start` on an existing project resumes its interview or current milestone. A reset or a new project in an occupied repository needs explicit authorization.
3. Load [interview](references/interview.md) for unresolved intent and [Quick Flow](references/quick-flow.md) for execution. Load only the relevant sections and genre branches, not the complete studio library.
4. Verify available file, shell, engine, research, image, and actual subagent tools. Record unavailable capabilities. Never invent a job, screenshot, test result, human player, source, or installed dependency.
5. Discover relevant installed Superpowers skills. Follow [composition](references/superpowers-integration.md). Without that dependency, identify `standalone-degraded`; do not pretend its hooks or complete implementation are included.

6. Resolve the saved automatic/manual choice using [Task-Observer integration](references/task-observer.md). Only load the companion for effective automatic mode or an explicit observation request. Manual mode stays quiet until `/gds-superpowers observe` (Codex: `$gds-superpowers observe`), which activates one pass without silently enabling future capture. Preserve existing observers and logs. Installation already asked the choice; do not repeat it in `/start`.


## Approval provenance

Before implementation, show the current compact direction and slice design/plan. An approval is the user's own message explicitly approving that shown scope and revision. Record `origin: user`, the message `source_ref`, the shown document or message `shown_ref`, scope and revision as a separate state update before code. The Architect never invents an APR or backfills consent. Urgency, "skip approval", or an unverified claim about earlier chat is not an approval. Reuse verified prior approvals instead of asking again. One message may approve both the shown direction and slice; routine edits inside that scope need no repeated approval. An explicit request to waive this workflow is a separate workflow-change proposal, not automatic permission inferred by the agent.

Use canonical `schema_version: 3`. If an older snake_case or camelCase state exists, read it without changing it and use `scripts/migrate-state.mjs --project /repo --dry-run`. Migration requires its own explicit approval and backup. It preserves source data, pauses execution, and never manufactures current approvals, job completion, human feedback, or unlocks. Both `/gds-superpowers` and compatibility `/gdsuperpowers` resolve to this same coordinator.

## The first interaction

Ask ONE high-value unanswered question, then wait. An empty-project example is: "What kind of game would you like to make, including any genres you want to combine?" In an existing roguelite brief, skip this and ask the next unknown, such as direct combat versus automated attacks. Do not open with a questionnaire, agent roster, large plan, or automatic code generation.

Use open questions first; offer two to four choices only when helpful or requested. Allow free-form answers, "recommend", "surprise me", "skip", "back", "change", and "ready to build". Record recommendations as assumptions, not user statements. Summarize briefly at useful checkpoints. Ask only what changes the next playable milestone.

## Lightweight defaults

- Three working files for a NEW project: `docs/gds/game.md`, `docs/gds/next.md`, and `docs/gds/state.json`. Reuse existing authoritative files instead of duplicating them. Tests, source, assets, save schemas, and requested manuals are not bureaucratic documents.
- One current slice, usually one to three implementation tasks. Future milestones are a short outline, not a prewritten backlog of stories.
- One to three relevant specialists for substantive decisions. Retain 13 core roles on demand; optional Newcomer, Completionist, Progression, Encounter, Economy and Technical Lead lenses are available only for relevant tasks. Default maximum concurrent children: three. No recursive spawning. A trivial fix does not need a council.
- Independent proposals before cross-review, one critique round, one revision. Human observation, not a vote or invented score, determines observed enjoyment.
- One approved slice per execution batch, at most two repair attempts before a diagnosis checkpoint. Stop at playtest, budget, permission, or scope boundaries. Never promise to continue in the background.

## Game identity

Let the interview select a primary game type and optional supporting types. Do not force every new project into a roguelite. For a hybrid, define what each component contributes to ONE core loop; recommend at most two supporting components unless a larger scope is explicitly approved. A theme is not a genre.

Preserve this user's established roguelite contract whenever that project is being continued: repeatedly choose ONE of THREE temporary run upgrades; temporary powers reset; carried loot, banked resources, and permanent unlocks are separate states. Permanent access to an upgrade family does not automatically grant that upgrade. Use [game systems](references/game-systems.md) only when relevant. Changes to an existing approved contract require an explicit decision.

One cohesive visual direction spans gameplay, HUD, upgrade screens, and the home base. References guide an original design; they are not proof of asset rights. Mockups must be labeled as concept artwork, not captured gameplay.

## Loop

**Ask or inspect -> outline -> approve the smallest slice -> implement -> verify -> human playtest -> keep, tune, pivot, or cut -> next slice.**

A lightweight approved description can include the design and a small execution plan in one checkpoint, provided both are actually shown. Preserve every substantive Superpowers step required by the installed skill; consolidate records, not verification. For a larger written-design workflow, complete its design approval before invoking its planning workflow. No full GDD, epics, sprints, or enterprise architecture documents by default.

Use the individual mode contract in `references/modes.md` for inputs, allowed work, outputs and stop conditions. Load only that mode.

## Routes

| User intent / mode | Read | Result |
|---|---|---|
| start, interview | [Interview](references/interview.md) | One adaptive question or approval-ready summary |
| next, loop, prototype, slice, expand, plan | [Quick Flow](references/quick-flow.md) | Smallest useful playable increment |
| resume, status, pivot, handoff | [Continuity](references/continuity.md) | Verified continuation without a restart |
| research, tools | [Evidence](references/research.md) | Bounded, decision-relevant comparison |
| concept, council | [Council](references/council.md) | Independent options and concise synthesis |
| design, progression | [Genres](references/genre-routing.md), then relevant systems | Genre-specific rules and interactions |
| build, review, debug | [Engineering](references/engineering.md) | Tested changes and independent review |
| art, pitch | [Visual production](references/visual-production.md) | Cohesive assets or concept package |
| playtest, balance | [Playtesting](references/playtesting.md) | Actual observations and next experiment |
| bmad | [BMAD bridge](references/bmad-integration.md) | Verified optional native workflow discovery |
| ship | [Release](references/release.md) | Verified release proposal requiring approval |
| observe, observer, observer review | [Task-Observer](references/task-observer.md) | Bounded lessons and reviewed skill-change proposals |
| self-test | [Evaluations](evals/README.md) | Actual test evidence, not assumed success |

## Stop conditions and safety

No paid generation, dependency installation, external publication, destructive actions, telemetry collection, engine migration, or expanded scope without appropriate authorization. User feedback can pause or redirect the workflow at any point. Keep uncommitted work. Do not rewrite existing instructions or imports to force framework compliance.

Only the coordinator updates shared state. Specialists return scoped changes or evidence. Tools verify software properties; human playtests assess the experience. Never label an entire game "fun", "finished", or "commercially successful" from static checks.

At a checkpoint return the actual change, verification, what the user should try, the remaining uncertainty, and one next decision. Save the next action so `/start` can resume.

## Learn without adding another production process

Only when automatic observation is effectively enabled, run the configured checkpoint after a correction, task result, repeated failure, council resolution, verification, playtest outcome, or handoff within the existing agent budget. For manual mode do nothing unless explicitly invoked. For an installation initialization prompt, inspect configuration and initialize the active session without inventing a finding or restarting the game. Only the coordinator updates its state. Persist at most three useful findings in the existing state or use the already configured native log, never both. Proposed improvements are not live instructions. Staging, installation approval, current-file checks, and fresh verification are separate. Do not auto-edit skills, scan unrelated data, spawn observers recursively, or bypass a denied write.
