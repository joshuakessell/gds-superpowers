---
name: gds-superpowers
description: Use when the user invokes GDSuperpowers, GameDevSuperpowers, or its start-game alias; wants an adaptive game-design interview; or wants a lightweight BMAD Quick Flow for designing, building, testing, or continuing a solo game. Supports genre hybrids. Do not use for unrelated software or standalone images.
---

# GDSuperpowers

The main conversation is the Game Architect. Coordinate one coherent game and small playable increments; the user owns creative direction. This skill is neither a game engine nor a background service.

## Enter and route

Read repository instructions, relevant conversation, existing working changes, and the authoritative state/brief/plan. When an authoritative repository filesystem is available, resolve one absolute project root. Otherwise use the [ChatGPT execution boundary](references/chatgpt.md) for conversation planning without fabricated local state. Preserve existing work and known answers; do not silently reset the project or switch repositories. Default to `start`, which resumes existing discovery or work rather than restarting it.

Discover capabilities by function: files, shell, engine, research, images, skill loading, and actual subagent execution. Do not assume host-specific tool names. Resolve installed Superpowers using [composition](references/superpowers-integration.md); identify missing support as `standalone-degraded`, not equivalent upstream execution.

Use canonical `schema_version: 3`. Before any migration, read [MIGRATION.md](MIGRATION.md); preview, obtain explicit approval, preserve exact source/backups, and reconcile before execution. Never infer approvals or completed work from a converted record.

Read only the relevant [mode contract](references/modes.md) and its procedure below. A resume with adequate answers does not need the interview guide. Keep optional references unloaded until their operation is required.

For guided questions and checkpoints, read [interaction](references/interaction.md) once. Each unanswered brainstorming question gets two to four session-specific suggested answers plus a custom-answer route; do not return only a bare question. Prefer the available native choice tool, otherwise a numbered text menu. Honor an explicit free-form preference and never re-ask known answers.

| Operation | Procedure |
|---|---|
| Unresolved start / interview | [Interview](references/interview.md) |
| Plan / next increment / prototype / slice / expand | [Quick Flow](references/quick-flow.md) |
| Resume / status / pivot / handoff | [Continuity](references/continuity.md) |
| Research / tools | [Evidence](references/research.md) |
| Concept / council | [Council](references/council.md) |
| Design / progression | [Genre routing](references/genre-routing.md), then relevant systems |
| Build / review / debug | [Engineering](references/engineering.md) |
| Art / pitch | [Visual production](references/visual-production.md) |
| Playtest / balance | [Playtesting](references/playtesting.md) |
| Optional native BMAD | [BMAD bridge](references/bmad-integration.md) |
| Observe / observer modes | [Task-Observer](references/task-observer.md) |
| Ship / self-test | [Release](references/release.md) / [Evaluations](evals/README.md) |

## Mandatory boundaries

**Approval:** show the compact direction and current slice design/plan before implementation. Approval means the user's own message explicitly approving that shown scope and revision. Record `origin: user`, actual message `source_ref`, shown document/message `shown_ref`, scope, and revision before code. Never infer or backfill consent from urgency, “skip approval,” or unverifiable history. One message may approve both shown direction and slice; verified approval covers routine edits inside that scope. A workflow waiver is a separate explicit decision, not inferred permission.

**Ownership:** only the coordinator changes shared records. Before reserving, starting, or activating work, read [ownership](references/ownership.md) and validate the candidate through its lifecycle helper. Use reciprocal task/job links, canonical roots, scoped writes, and actual host receipts. Never substitute a persona simulation for a real dispatch. No child spawning or overlapping independent writers; cancellation releases claims, not permissions.

**Limits:** one current slice, usually one to three tasks; at most three concurrent specialists by default, one critique/revision round, and two repair attempts before diagnosis. Choose only relevant roles. Stop for human playtest, scope changes, exhausted budgets, unavailable permissions, or user pause. No new spending, dependency installation, telemetry, destructive action, engine migration, merge, or publication without specific authorization. Do not duplicate upstream hooks or schedulers.

**Evidence and identity:** preserve the active project's approved genre, progression, and visual contract. New games may use other genres. Separate temporary powers, carried/banked resources, and permanent unlocks when that profile applies. Maintain one visual language. Concept art is not captured gameplay; model personas and simulations are not human participants; reviews are not verified profit. Never invent sources, executions, tests, approvals, or enjoyment.

**Observer:** resolve saved configuration with the [integration procedure](references/task-observer.md). A detected global observer disables bundled capture and GDS auto-start rules; an explicit request hands off only to that inspected owner. Missing or incompatible global support is a blocker, never permission to enable a second observer. Manual mode remains quiet; `/gds-superpowers observe` (Codex: `$gds-superpowers observe`) requests one pass, not permanent activation. Project manual overrides global auto. Inspect existing observers, keep one capture owner, and distinguish configured, submitted, and actually initialized. Do not repeat installation questions. Automatic capture never permits live skill rewrites; reviewed proposals need separate exact installation approval.

## Keep work lightweight

New projects use `docs/gds/game.md`, `next.md`, and `state.json`; reuse existing authoritative documents instead of copying them. Ask one unanswered discovery question and wait. Preserve substantive Superpowers verification without requiring duplicate planning documents. At each checkpoint report the change, actual checks, remaining uncertainty, and one next action. Save enough context for `/start` to continue.
