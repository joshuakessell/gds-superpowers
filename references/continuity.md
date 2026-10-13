# Start, resume, pivot, and handoff

## Start

Read existing files and decisions before asking for details. The current conversation's explicit requirements outrank stale summaries. When a selected theme exists, preserve it. When no direction is established, run the adaptive one-question-at-a-time interview in `references/interview.md`; do not choose a theme silently. Resume known answers and stop at the first useful playable-slice proposal.

Record assumptions that can be revised cheaply. During explicit discovery, ask one relevant unanswered question at a time. Outside discovery, ask only for a consequential unresolved constraint that accessible files cannot settle. Do not repeatedly ask for known information.

Prepare a capability receipt, current phase, proposed first milestone, exclusions, and approval needs. No implementation before the appropriate design/plan approval. A request for a planning outline is not permission to launch full production.

## Resume

Read the authoritative ledger, document index, decisions, branch/worktree, open tasks, and fresh repository state. Verify that referenced files and tools still exist. Previous 'done' text is not fresh test evidence. Reconcile actual changes and task status before dispatching work.

## Pivot

Produce KEEP / CHANGE / ADD / REMOVE / DEFER against the approved new direction. Include effects on code, assets, saves, progression, tooling, and tests. Preserve existing work and explain reusable portions. Return an approved delta plan, not a restart or large speculative rewrite.

No automatic branch resets, mass deletion, engine migrations, or file overwrites. Proposed removals remain proposals until specifically authorized.

## Durable records

For new quick-track projects, use `docs/gds/game.md`, `next.md`, and schema-2 `state.json` as described in `references/quick-flow.md`. An existing `docs/gds/index.md` remains a pointer to authoritative documents; do not create a duplicate index or new competing ledger. Existing Superpowers specs/plans remain where they are. `docs/gds/state.json` stores lightweight status, task references, gate evidence, approvals, and capability observations; do not put an entire research report there.

The coordinator is the only writer to shared status and decision logs. Specialists return changes or bounded output artifacts. A user approval record contains a real message reference/date and its scope. Do not self-approve gates.

## Handoff

Return current objective and phase; selected theme and immutable constraints; repository/branch/worktree; approved artifacts; actual completed work; fresh tests with results; pending tasks and dependencies; decision disagreements; known failures; capabilities; and the next bounded action. Mark stale or unavailable evidence explicitly.

The receiving agent should be able to continue without guessing the game's identity or replaying every chat. Never imply an active agent survives a session unless its host reports that it does.

## Task-Observer checkpoint

Use [Task-Observer integration](task-observer.md) at meaningful corrections, completed or failed tasks, review/playtest results, and handoff. Reuse available evidence and the existing state or native observer log. Do not create another required document or duplicate native observations. Record scope and uncertainty. Findings never approve their own installation; the user approves the exact staged change separately.
