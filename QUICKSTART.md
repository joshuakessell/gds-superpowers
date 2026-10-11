# GDSuperpowers quick start

Inspect `README.md`. The package is one top-level `gds-superpowers` directory; on this machine it is installed at `~/.claude/skills/gds-superpowers/`.

## Install in an existing game repository

From the directory containing the unpacked folder, substitute the actual game repository path:

```bash
node ./gds-superpowers/scripts/install.mjs --target both --scope project --project /absolute/path/to/game --agents --dry-run
node ./gds-superpowers/scripts/install.mjs --target both --scope project --project /absolute/path/to/game --agents
```

Use `--target claude` or `--target codex` instead of `both` to install one host layout. The script refuses existing differing files. It does not install the separate Superpowers dependency or change your existing instructions.

## Begin with the decided theme

Claude Code:

```text
/gds-superpowers start
Our selected theme is [theme]. Use the existing concept material and code.
First verify available tools, actual subagents, and the installed Superpowers
skills. Preserve the one-of-three temporary-upgrade loop and persistent base
progression. Produce the charter, research plan, and smallest prototype plan.
Do not begin full production.
```

Codex uses the same request with `$gds-superpowers start` at the beginning. These names are skill invocations; `start` is an argument interpreted by this skill.

## Run a focused council

```text
/gds-superpowers council
Decide how players bank loot in this theme. Gather independent proposals
from the Risk Taker, Home-Base Builder, and Time-Conscious Player. Have the
Producer challenge their cost. Use one cross-review and one revision, then
recommend a prototype with explicit loss/retention rules. Do not invent
independent agents when the runtime cannot execute them.
```

## Design progression

```text
/gds-superpowers progression
Design four layers of unlocks. For each, show the run achievement, retained
resource, facility/research requirement, new option it enables, interaction
with earlier systems, and the test that verifies it. Permanent access to an
upgrade family must not automatically grant that upgrade in every run.
```

## Produce the concept package

```text
/gds-superpowers pitch
Use the approved visual bible. Create a concept flyer, a gameplay-style
mockup, a three-choice reward screen, a home-base screen, selling points,
and the technical gameplay manual. Label non-captured images as concept
mockups. Do not claim platform availability or a release that does not exist.
```

## Continue without restarting

```text
/gds-superpowers resume
Read the real project state, decisions, and tests. Report the current phase,
what is approved, what is blocked, and the next bounded action. Reuse existing
Superpowers specifications and plans rather than creating competing copies.
```

For a direction change, use `pivot` and require KEEP / CHANGE / ADD / REMOVE / DEFER before approving a delta implementation plan.
