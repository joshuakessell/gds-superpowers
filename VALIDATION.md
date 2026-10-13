# Validation: GDSuperpowers 0.4.0-rc.1

Review snapshot: October 12, 2026. This is a locally tested consolidation candidate, not an installed or released version. The implementation has not been committed to the remote review branch and no PR was opened in this session. Current GitHub actions expose reads only. The branch itself remains at the pinned comparison commit.

## Checks actually executed

| Check | Result | Meaning |
|---|---|---|
| Original supplied v0.3.1 Node suite | 143 passed, zero failed | Baseline utility regression suite ran before consolidation |
| Consolidated Node suite | 175 passed, zero failed | Original assertions plus migration, provenance, aliases, job lifecycle, smoke-harness and observer compatibility regressions |
| Actual supplied v0.3.1 upgrade fixtures | 34 checks passed | Project and global installations, preview safety, observer-byte preservation, untouched state, backups, manual switching, repeat installs and customized-supporting-file refusal |
| Smoke fixture preparation | 32 preparations passed | Eight scenarios, Claude/Codex, skill/baseline arms; prepare-only, no model calls |
| Submission helper offline tests | 8 passed | Archive safety, exact historical/evaluation preservation in local Git fixture, dirty-checkout refusal, checksums, base movement, draft-PR validation and no forbidden force/merge/release commands |
| Native configuration syntax | Passed | 19 TOML adapters, 3 YAML metadata files, 23 Markdown frontmatters parsed |
| Package structure and final archive | Checked during packaging | Required files, local links, JS/JSON syntax, active role files, external skill mappings, manifest and extracted-source checks |

Runtime: Node.js 22.16.0. Python is used for packaging, configuration parsing and offline submission-helper checks; ordinary skill helper operations continue to use Node.js without npm dependencies.

## Regression evidence

The observer compatibility test first produced 34 passes and 3 failures: the helper rejected canonical schema 3, did not explicitly block pending migration, and did not check a selected symlink root. Those cases passed after the correction. The original unknown-schema assertion now uses schema 99 because schema 3 is supported; the rejection guarantee was retained. This is code-level test evidence, not model behavioral evaluation.

New approval checks require an actual user-message source, the shown scope reference, `origin: user`, and matching scope/revision. These fields make unsupported records detectable but cannot authenticate their content. Migration preserves old approvals as source evidence and never supplies missing provenance on their behalf.

The actual-upgrade fixtures use the unchanged supplied v0.3.1 installer, not a simplified imitation. Observer source files and project-state bytes were compared before and after. The fixtures did not execute Claude, Codex, external observer hooks, or a game engine.

Current logs are under `validation/v0.4.0-rc.1-*`. Authoring workspace paths and terminal control characters have been normalized in shared logs; result counts and assertions are unchanged. Earlier validation logs remain historical records only.

## Not executed and release blockers

Neither `claude` nor `codex` is installed in the authoring container. No live-host smoke case, real subagent dispatch, native observer initialization, game build, or human playtest was executed. The 48 preexisting prepared behavior cases and the new eight-case smoke matrix are not marked as passing from fixture preparation. Process exit success, syntax parsing, saved configuration, and model compliance are separate claims.

The prior GitHub implementation reports 18 single-repetition Claude behavior scenarios. Those original summaries are to be preserved byte-for-byte when the submission helper assembles the pinned repository. They are not current results. Complete original transcripts were not supplied; the summaries do not independently prove current cross-model reliability.

The GitHub submission path has not run. Its local archive/overlay logic is tested, but actual clone authentication, push, and draft-PR creation must succeed on an authorized machine. The helper refuses a moved main branch, unrelated review-branch changes, dirty checkout, or invalid source manifest. It never merges or releases.

Preserved external Task-Observer files are not automatically rewritten or certified compatible. An older bundled observer helper accepts only schema 1/2; after migration to schema 3, inspect its real behavior and use a separately named current companion when necessary. Do not claim automatic initialization if the selected observer cannot use the resolved state/log. Keep one capture owner.

Filesystem rechecks and backups are not a cross-file transaction or complete protection against every concurrent directory replacement. Close competing writers and inspect receipts after interruption. Human feedback is still required for gameplay enjoyment claims.

## Reproduce

```bash
node --test tests/*.test.mjs
node scripts/check-package.mjs
```

From the enclosing review package, run `python3 -m unittest test_submit_pr -v` for offline submission checks. Follow `evals/HOST-SMOKE.md` for explicitly authorized live-host tests. Keep the candidate unmerged until required review and live checks are satisfied.
