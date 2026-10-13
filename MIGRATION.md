# Explicit state and command consolidation

## Inputs

The pinned Claude repository uses `schemaVersion: 1`, `phase`, `agentBudget`, and APR records. The original export also has snake_case schema 1; Quick Flow v0.3.1 uses snake_case schema 2. These are different formats, not interchangeable versions of one parser.

Canonical identity: `gds-superpowers`; `start` remains its shortcut. The unhyphenated command is no longer installed. Canonical state: `schema_version: 3`, Quick Flow fields, revision-aware approval provenance and recorded job lifecycle.

## Safe sequence

Inspect the existing files and preview:

```bash
node scripts/migrate-state.mjs --project "/absolute/game/root" --dry-run
```

The preview does not write. Unknown schemas, mixed naming markers, malformed arrays, unknown legacy phases, selected symlink roots and unsafe destination paths are refused.

After explicit approval of the migration, run:

```bash
node scripts/migrate-state.mjs --project "/absolute/game/root" --approve
```

The current bytes are rechecked, backed up under `.gdsuperpowers-backups/`, and replaced using the managed writer. The receipt identifies before/after hashes. An interruption is not an automatic rollback: inspect the receipt and current file before restoring anything.

## Preservation and reconciliation

The full original JSON, including unknown fields, approvals, decisions, tasks, receipts, evidence, progression and observer data, is retained in `migration.original_state`. A byte-exact backup preserves formatting as well. Quick Flow unknown top-level data is also preserved in the current object. Known game facts can be imported with source provenance. Document pointers are reused. No current approval, human playtest, completed job or milestone is invented.

Migration pauses the current execution loop and sets `migration.review_required`. Job dispatch and observer-status activation remain blocked until it is reconciled. For older formats, approval and task data remain in the original snapshot rather than being guessed into stronger current claims. Existing observer objects remain unchanged; an unknown native schema is a compatibility issue to inspect, not permission to rewrite its log.

The coordinator then reads the original snapshot and actual referenced evidence. Resolve the current document pointers, reattach verified task/receipt references, and identify the latest explicitly approved scope. Do not ask the same approval again when a real user message already proves it. A document-only APR without message provenance remains historical until its actual approval can be found. A new user's approval of a shown compact plan is another valid path, not an automatic migration assumption.

Mark `migration.review_required: false` only after recording the reconciliation evidence and decisions. Restore the prior loop status only if current schema validation and actual approval evidence permit it. Run `project.mjs check` before execution. A structurally valid reference is not proof that the referenced event happened.

For simultaneous old/new installations, finish the canonical-name handoff first and confirm the host loads the expected skill. Never run two coordinators over `docs/gds/state.json`. A recognized old command directory is archived outside skill discovery by `--upgrade`, only after canonical installation succeeds. Unknown or customized legacy packages are preserved and require manual reconciliation. Project-state conversion remains a separate approved operation.

## Preserved older observer helpers

Preserving an observer does not certify it against a new state format. In particular, the earlier bundled Lite helper accepts schema 1/2 only. After a project migrates to schema 3, inspect the selected observer and its native log. A separately named current companion can be installed with `--observer-name gd-task-observer`; select one capture owner and preserve the prior history. Do not call an incompatible helper, silently duplicate logs, or report automatic initialization from saved settings alone.

## Task/job ownership reconciliation within schema 3

The additive reciprocal fields `task.job_id` and `job.task_id` identify one worker before and after dispatch; [ownership](references/ownership.md) defines the invariant and transition API. Earlier records without links remain standalone claims. A matching run-ID string alone does not silently merge owners. Resolve the actual receipt, root, scope and task/job relationship before recording a link. Do not infer IDs, alter approvals, erase source snapshots or mark work complete. No automatic schema increment or project rewrite accompanies the instruction cleanup.
