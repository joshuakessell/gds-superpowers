# Quick-track override

Use at most three active children by default. Activate only relevant roles. All role briefs remain available; the previous four-agent setting is a configurable legacy limit, not a requirement. Only the coordinator writes the current brief, plan, and state.

# Orchestration contract

## Coordinator

The Game Architect lives in the main session. Only it dispatches specialists, integrates output, advances the project ledger, or presents a gate for user approval. A request for an architect agent should therefore configure the coordinator role, not bury the entire project inside a child that may lack delegation tools.

A specialist can ask the coordinator to create another task. It does not recursively spawn agents. Use actual host execution primitives only when present. The native adapters are role configuration files; installing them does not itself start sessions.

## Capability receipt

At session start, record: host, accessible repository, installed Superpowers status/version, delegation API availability, image tools, browser/research tools, test runner, engine/editor, capture tools, and permission constraints. Each is `verified`, `unavailable`, or `unverified`, with the observation supporting it.

Execution modes:

- `actual-subagents`: record real tool/job/session IDs and actual completion receipts.
- `sequential-independent`: use distinct available sessions in sequence; do not call them concurrent.
- `persona-simulation`: a single model examines multiple lenses; label it explicitly and do not claim independent review.
- `unverified`: no capability check yet.

Different role names do not imply different models or providers. Use different models only when accessible and approved. Never claim statistical independence, consensus validation, or true player representation merely because several agents agree.

## Bounded task packet

Use `templates/task.md`. Required fields: task ID, phase, outcome, role, exact authoritative inputs, dependencies, allowed read scope, allowed write paths, excluded paths, budget, acceptance criteria, required evidence, and stop conditions. Supply the minimal relevant context, not the entire conversation.

Specialist response: recommendation; evidence; assumptions; alternatives; risks; requested follow-up; files or patches; verification performed; unresolved items. Default written result target is 600 words excluding code or indispensable evidence. Large source material belongs in a cited file, not every agent's context.

## Scheduling

Quick-track maximum is three active child jobs, one critique round, one revision round, and two repair attempts before architect triage. An existing approved legacy limit can be retained until deliberately changed. These are configurable planning limits, not claims of optimality. The bundled validator checks the recorded state; only the host runtime can enforce actual concurrency or spending limits.

Parallelize independent research, initial creative proposals, and read-only diagnosis. Serialize implementation that touches shared interfaces, scenes, state, dependencies, or assets. Parallel implementation requires approved disjoint write leases or isolated worktrees and a single integration owner. Do not merge conflicting changes automatically.

Choose roles by task. Do not dispatch the entire roster for trivial edits. Research roles can batch into two or three investigators; the same creative council is reserved for meaningful design choices.

## Costs and stop conditions

Record observed token or money usage when the host exposes it; otherwise label usage unknown. Choose inexpensive adequate models for extraction and bounded checks, reserving stronger reasoning for architecture and disagreements. Refresh model capabilities and prices from primary documentation before a cost-based tool recommendation.

Do not create a custom agent service, database, queue, or framework solely to orchestrate this skill. Existing host tools plus durable files are the default. Propose infrastructure only to solve a demonstrated operational need.

Stop and report when permissions are missing, a dependency blocks a task, input evidence is unavailable, a budget is exhausted, two repairs fail, or agents disagree about an unapproved requirement. Continue other independent approved work when possible; do not spin in negotiation.

## Decision authority

Agents recommend. The Architect integrates. The user approves the charter, production plan, significant scope changes, paid services, public publishing, and destructive operations. Once a bounded plan is approved, routine tasks and reviews proceed without redundant approvals. A missing approval remains pending, not assumed.

## Session continuity

Persist enough to resume: repository and branch, exact artifact revisions, task leases, active job IDs if still available, test commands/results, decisions, blockers, and the next action. Never promise continued execution outside the current session without an actually configured host facility.

## Task-Observer checkpoint

Use [Task-Observer integration](task-observer.md) at meaningful corrections, completed or failed tasks, review/playtest results, and handoff. Reuse available evidence and the existing state or native observer log. Do not create another required document or duplicate native observations. Record scope and uncertainty. Findings never approve their own installation; the user approves the exact staged change separately.
