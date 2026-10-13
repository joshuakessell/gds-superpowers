# Task-Observer integration

Adapted from Eoghan Henn / Rebelytics' One Skill to Rule Them All, CC BY 4.0. [Attribution, source, license and modifications](../companions/task-observer/ATTRIBUTION.md) apply to this guide. This is not the complete upstream runtime.

## Resolve and initialize

Use `scripts/observer-status.mjs --project /absolute/repo --host claude|codex`; add `--explicit` for a requested single pass. Inspect its actual output and referenced configuration. Missing mode is manual; project manual overrides global auto. Later explicit project preferences and unreconciled legacy-off or migration states remain authoritative. The helper reports eligibility, never proof that a model initialized.

Load the configured companion only when effective auto or an explicit request permits. Inspect existing SKILL.md, compatibility and log before reuse. Select one capture owner: `native-reuse`, `gds-lite`, `instruction-fallback`, `off`, or `unavailable`. Preserve existing files/history. An incompatible or absent observer is a reported blocker, not permission to rewrite it. See [migration compatibility](../MIGRATION.md) before using older helpers.

In auto mode initialize in the active session, then observe corrections, meaningful results/failures, council decisions, verification, human feedback and handoff. Do not repeat the installation question or invent a finding. `/gdsuperpowers observe` (Codex: `$gdsuperpowers observe`) requests one pass without enabling future capture. Installation configuration, prompt submission and actual initialization are separate statuses; [INSTALL.md](../INSTALL.md) owns setup and launcher instructions.

## Capture and changes

Use the companion's observation procedure. The coordinator alone writes the optional observer object in existing state, or points to the native log. No duplicate ledger, extra mandatory planning document or background process. Use only scoped evidence, at most three useful findings, and a short report unless a decision is needed. Child suggestions count within the existing budget.

Manual/off stays quiet except an eligible explicit pass. Read-only or blocked storage returns an unsaved handoff; do not bypass the boundary or claim persistence. Independent native hooks are not disabled by a GDS preference.

`observer on/off` is an explicit persistent preference, not a side effect of observing. Review, staging, live installation and rollback follow the companion's [maintenance protocol](../companions/task-observer/references/protocol.md). Accepting a proposal permits staging only; an exact live change needs separate approval and fresh verification. No self-issued consent or weakened safeguards.
