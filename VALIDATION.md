# Validation record

Package: GDSuperpowers 0.1.0 (`gds-superpowers`, Claude Code global-skill build)
Date: October 11, 2026
Local runtime: Node.js 24.19.0; Python 3 used only to parse the Codex TOML adapters.

## Checks performed

**26 automated JavaScript tests passed, zero failed** (`node --test tests/*.test.mjs`). They cover: malformed state, the one-of-three contract and approved deviations, agent-budget records and limits, overlapping write leases, dependency cycles and unknown dependencies, execution receipts, evidence fields and the human-participant rule, production-phase approval gates, progression references and invalid costs; and for the installer: dry runs, create-only writes with `tests/` and `validation/` excluded, idempotent reinstall, conflict refusal with nothing written, path boundaries, symlink refusal, and temporary-directory CLI installation for both the Claude and Codex layouts; and for the scaffolder: `init` (no preapproved charter, refuses overwrite) and `check` naming its problems.

The tests were written before the implementation. The first run failed at import for both suites (0 passed, 2 failed at file level); that output is retained in `validation/baseline-core.tap`. After implementing the validators and installer, 19 of 24 passed; the remaining 5 waited on `SKILL.md` and the agent adapters, which did not exist yet. Two scaffolder tests were then added. Current output is in `validation/local-tests.tap`.

**Static package checks passed** (`node scripts/check-package.mjs`): required files, local Markdown links, JSON syntax, JavaScript syntax, the 15-skill upstream map against the vendored copy, 13 role briefs with both native adapters, starter state and progression example validating cleanly, 18 scenarios with legal statuses, and SKILL.md frontmatter.

**Native configuration syntax parsed.** Python's `tomllib` read all 13 Codex agent definitions. The 13 Claude agent files begin with YAML frontmatter containing `name: gds-<slug>`. This validates syntax, not a host's runtime loading or permission behavior.

**Installation on this machine.** The package was installed with its own installer at user scope for the Claude target (`~/.claude/skills/gds-superpowers/`), then the installed copy's `check-package` and tests were run; see the session summary for the output.

## Not performed

No Codex runtime loaded the skill. No game engine build, human playtest, asset-generation job, or published release was produced. The upstream Superpowers 7.0.0 release was not inspected; the vendored copy is 6.4.1. The Codex `model` id and agent schema were not verified against a live host.

Seventeen of the 18 behavior scenarios in `evals/scenarios.json` remain `not-run`; S-07 is `partial` after one single-rep smoke run with a contaminated control (`evals/results/2026-10-11-S-07.md`). A status changes only when a results file under `evals/results/` is referenced from the scenario's `evidence` field. Any smoke test performed during authoring is recorded there with its transcript reference and is not a substitute for the full procedure in `evals/README.md`.

## Meaning of this result

The utility code and package structure pass the checks above. The skill's behavior on a live host is evaluated separately, per scenario, with retained evidence. Structural references cannot authenticate approvals, confirm that an agent ran, establish balanced gameplay, or demonstrate that humans find a game enjoyable.

## Reproduce

From the `gds-superpowers` directory:

```bash
node --test tests/*.test.mjs
node scripts/check-package.mjs
```
