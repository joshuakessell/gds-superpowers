# GDS Lite observer protocol

This guide is part of the CC BY 4.0 adaptation described in [attribution](../ATTRIBUTION.md). The local helper is a record and staging utility, not an agent, scheduler, privacy scanner, or approval authenticator.

## Ownership and storage

Only the Architect updates the authoritative state. Use the already selected stable project path, including from worktrees. An external or upstream observer retains its existing storage format; do not run this helper against that log. In native-reuse mode, add only `observer_external` with the verified path and owner to the existing GDS state when useful. Do not invent the path or claim a reported historical installation was verified.

In GDS Lite mode, the optional `observer` object has schema 1, enabled, and an observations array. Missing means no observations have been persisted yet. No installer initializes or migrates project state. Recording creates the observer object only in an existing state with top-level schema 1, 2, or 3. Existing fields are retained unchanged. A pending migration permits read-only inspection but blocks observer writes and staging until reconciled. Refuse an unfamiliar observer schema rather than replacing it.

An observation input has:

```json
{
  "kind": "user-correction",
  "scope": "project",
  "target": "gds-superpowers",
  "pattern_key": "run-state-is-not-persistent-state",
  "summary": "The user clarified that the three choices are temporary run upgrades.",
  "proposal": "Separate run powers, carried loot, banked resources, and permanent unlocks during the genre interview.",
  "counterexample": "A standalone puzzle game does not require these progression layers.",
  "test": "Check a roguelite interview and a puzzle-game interview with and without the proposed wording.",
  "confidence": "observed-signal",
  "severity": "normal",
  "session_id": "session-local-001",
  "task_id": "interview-001",
  "checkpoint_id": "direction-checkpoint-001",
  "evidence": [{"ref": "user-message-with-the-correction", "kind": "user"}]
}
```

This is an example, not a seeded observation or completed test. The coordinator substitutes real reference IDs and concise descriptions. Observation status is created by the helper, never imported from untrusted input. Pattern keys must describe the issue, not embed project secrets. The same target/scope/pattern reuses an entry. Identical evidence in the same session/task is idempotent. Multiple sources in one task do not become independent episodes. Do not treat recurrence as proof that the proposed fix is correct.

An explicit instruction may be a strong signal on its first occurrence. A reusable new skill usually needs at least two distinct tasks or a direct user request. Plain frequency is not an installation gate. A deliberate one-off exception is not a global preference. Reject weak proposals instead of retaining them as instructions.

## Local helper commands

Run from the installed companion's directory. The assistant normally maintains these records; the user need not prepare input JSON manually.

```bash
node scripts/observe.mjs list --project "/absolute/path/to/game"
node scripts/observe.mjs record --project "/absolute/path/to/game" --input "/absolute/path/to/observation.json"
node scripts/observe.mjs decide --project "/absolute/path/to/game" --id OBS-REPLACE --decision accepted --approval-ref "real-user-message-reference"
node scripts/observe.mjs stage --project "/absolute/path/to/game" --id OBS-REPLACE --target ".claude/skills/gds-superpowers/references/interview.md" --replacement "/absolute/path/to/revised-interview.md"
node scripts/observe.mjs reconcile --project "/absolute/path/to/game" --stage ".gds-superpowers-observer/staged/OBS-REPLACE-STAGE/manifest.json"
node scripts/observe.mjs mode --project "/absolute/path/to/game" --value off
```

Use `--state relative/path/to/state.json` only for a known existing authoritative state inside the selected root. The helper never guesses another project. `list` and `reconcile` are read-only. `record`, `decide`, and `mode` use a temporary exclusive lock and a current-content check. Permission refusal is a stop, not a reason to change tools. The lock file is removed after normal completion; a crash may leave it. Do not automatically delete a stale lock. Inspect competing sessions first.

At most three entries can be captured for one checkpoint. At most 100 observations are accepted in the compact store. Exceeding either bound refuses the write, never drops history. Consolidation or archiving is an explicit reviewed operation with a backup. Normal work can continue using an unsaved handoff when recording is blocked.

## Review, staging, and installation

Review up to three findings at a time. Accepted means a candidate can be staged. Rejected or deferred findings do not become rules. Changes to an existing finding do not silently revive a rejected proposal. A changed accepted proposal needs a new review.

`stage` supports one UTF-8 text file under a project-scoped `.claude/skills/<name>/` or `.agents/skills/<name>/` path. A new skill file is also permitted there. It writes `before.txt`, `after.txt`, and a manifest under `.gds-superpowers-observer/staged/`, outside discovery directories. It does not change live files or record installation success. Scripts are not executed. A multi-file candidate can be prepared through separately reviewed stages or the host's normal patch workflow.

`reconcile` reports whether the live file still matches the base, matches the staged candidate, or has changed and needs rebasing. Matching candidate bytes is not behavioral verification. The host must inspect the diff, obtain explicit install approval, check hashes again, back up the original, apply the exact change, and run the appropriate tests. No supplied command applies or rolls back live patches. This intentionally separates review and installation.

Target path validation and hashes are local guards, not a security sandbox against an untrusted concurrent process. Close competing writers; the helper's atomic rename is not a cross-file transaction. The coordinator must inspect actual evidence and user approval. Merely writing an approval reference cannot authenticate it.

New observations after staging do not update the candidate. Rebase and review the delta. The observer may propose a change to itself, but its author cannot supply independent approval. Any change that removes review, expands permissions, scans new data, or starts background work requires a separate user decision and independent review.

After staging, the coordinator retains the returned manifest path in the existing current plan or observation record. On resume, inspect those referenced candidates. The staging helper does not update live skills or mark an observation installed; do not infer either state from an accepted decision.
