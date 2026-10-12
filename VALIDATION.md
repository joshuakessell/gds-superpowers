# Validation record

Package: GDSuperpowers 0.1.0 (`gds-superpowers`)
Runtime used for the checks: Node.js 24; Python 3 only to parse the Codex TOML adapters.

## Checks performed

**26 automated JavaScript tests pass** (`node --test tests/*.test.mjs`). They cover: malformed state, the one-of-three contract and approved deviations, agent-budget records and limits, overlapping write leases, dependency cycles and unknown dependencies, execution receipts, evidence fields and the human-participant rule, production-phase approval gates, progression references and invalid costs; for the installer: dry runs, create-only writes, idempotent reinstall, conflict refusal with nothing written, path boundaries, symlink refusal, and temporary-directory CLI installation for both the Claude and Codex layouts; for the scaffolder: `init` (no preapproved charter, refuses overwrite) and `check` naming its problems.

The tests were written before the implementation and failed at import on the first run. The validators and installer were then implemented until the suite passed; two scaffolder tests were added last.

**Static package checks pass** (`node scripts/check-package.mjs`): required files, local Markdown links, JSON syntax, JavaScript syntax, the 15-skill upstream map, 13 role briefs with both native adapters, the starter state and progression example validating cleanly, 18 scenarios with legal statuses, and `SKILL.md` frontmatter.

**Native configuration syntax parsed.** Python's `tomllib` read all 13 Codex agent definitions, and the 13 Claude agent files begin with YAML frontmatter containing `name: gds-<slug>`. This validates syntax, not a host's runtime loading or permission behavior.

**Installer exercised on a real host.** The package was installed at user scope with its own installer on Claude Code (macOS), the skill appeared in the host's skill list, and a reinstall was a no-op. The 13 Claude agents installed with `--agents`.

## Not performed

No Codex runtime loaded the skill. No game engine build, human playtest, asset-generation job, or published release was produced. The Codex `model` id and agent schema were not verified against a live host.

All 18 behavior scenarios in `evals/scenarios.json` are `not-run` in this distribution. One single-rep smoke run of S-07 (simulation presented as playtest) was performed during authoring on Claude Code: with the skill, the agent kept the phase at `prototype`, refused to write non-human evidence as a playtest, and scheduled a human session; the no-skill control was contaminated by the scaffolded project docs and is not a valid baseline. That run is not retained here, so the status stays `not-run`. Change a status only with a retained results file referenced from the scenario's `evidence` field, per `evals/README.md`.

## Meaning of this result

The utility code and package structure pass the checks above. The skill's behavior on a live host is evaluated separately, per scenario, with retained evidence. Structural references cannot authenticate approvals, confirm that an agent ran, establish balanced gameplay, or demonstrate that humans find a game enjoyable.

## Reproduce

From the `gds-superpowers` directory:

```bash
node --test tests/*.test.mjs
node scripts/check-package.mjs
```
