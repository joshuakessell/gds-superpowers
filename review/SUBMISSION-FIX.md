# GDSuperpowers submission repair

## Scope

Repairs the supplied GDSuperpowers 0.4.0-rc.1 review candidate's local test portability and submission diagnostics. It does not install a skill, initialize an observer, execute a real model, change the selected GitHub branch, push, or merge.

## Confirmed defects

1. `submit_pr.py` captured both output streams but only included standard error in a failing command's exception. Test logs were written after success, so a failed check's standard output was neither shown nor saved. A stdout-only failure can therefore produce exactly the blank error suffix reported by the user.
2. Two launcher assertions in `tests/observer-activation.test.mjs` compared a child process's canonical working directory with the unresolved spelling of a fixture path. The installer deliberately canonicalizes permitted ancestor aliases. Different spellings can name the same directory, so these assertions incorrectly fail with an aliased temporary-directory ancestor. The fix compares against `fs.realpathSync(p)`. Directly selecting a symlinked project root is still refused and tested.

The actual failed test on the user's machine was not available. The reproduced path defect is a plausible explanation, not confirmation of that machine's specific failure. A full log from any subsequent failed run remains necessary to identify other failures.

## Changes

- Correct only the two expected working-directory assertions; do not change production launcher or filesystem safety code.
- Add two explicit aliased-parent launcher regressions, for repository and global scope. Only local executable stubs named `claude` or `codex` run.
- Make failed-command reporting show standard output as well as standard error.
- Persist both check streams before inspecting the exit code; retain partial output on timeout. Logs stay outside the checkout and are not automatically uploaded.
- Continue to block staging, commit, push, and PR creation after any failed check.
- Add six offline diagnostic tests. Preserve the existing submission safety tests.
- Update the source checksum manifest for these reviewed source changes; do not bypass checksum verification.

## Executed validation

Environment: Linux, Node.js v22.16.0, Python 3.11. No actual macOS session was available.

| Check | Result |
|---|---|
| Original candidate, ordinary temporary paths | 175 passed, 0 failed |
| Original candidate, aliased temporary ancestor | 173 passed, 2 failed; both working-directory assertions |
| Repaired candidate, ordinary temporary paths | 177 passed, 0 failed |
| Repaired candidate, aliased temporary ancestor | 177 passed, 0 failed |
| Repaired submission helper's offline tests | 14 passed, 0 failed |
| Repaired package structure/syntax checks | Passed |

The repair utility verifies the exact original or already-repaired file hashes, backs up replaced files outside the source directory, and refuses unrecognized customization. It tests only the local candidate using an isolated test home. It leaves the earlier `/tmp/gds-pr-review-...` checkout untouched. Writes are not a cross-file transaction; concurrent edits cause refusal and may require inspection of the backup.

## Next action

After applying the repair and passing the local checks, run `python3 submit_pr.py --submit` from the same review-bundle directory. The submission procedure still uses a fresh clone, checks the pinned main commit, preserves source/evaluation history, and only attempts a draft PR. It never merges.

If submission fails again, use the printed full log paths. A genuine failure must be diagnosed, not skipped.
