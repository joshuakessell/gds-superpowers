# GDSuperpowers (`gds-superpowers`)
## GameDevSuperpowers · v0.1.0 · Claude Code global-skill build

A portable game-development skill that composes the Superpowers engineering workflow with a Game Architect, contrasting player perspectives, evidence-based research, roguelite progression design, cohesive visual production, and human playtest gates.

**Status:** authored starter release. Local installer, state-validator, and packaging checks are documented in `VALIDATION.md`. Live Claude/Codex behavioral evaluations and real game playtests are not represented as completed. This package does not install anything into your account until you run the installer or use your host's installation controls.

## What it is

One entry skill, modular reference guides, 13 specialist role briefs, Claude Code and Codex agent adapters, project templates, a safe local installer, structural validators, and an evaluation suite. The main conversation remains the Game Architect.

The upstream Superpowers implementation stays a separate dependency and is preferred when its plugin is installed. This build also carries a verbatim, MIT-licensed copy of the upstream skills (version 6.4.1) under `superpowers/` so the engineering loop keeps working where the plugin is absent; GDSuperpowers routes to one or the other instead of rewriting them, copying their hooks, or claiming an abbreviated summary is identical. All 15 upstream skill names are mapped in `references/superpowers-integration.md`. The inspected upstream README reported 7.0.0; the vendored copy is 6.4.1. This is a compatibility observation, not a tested version guarantee or immutable commit pin.

Without either the plugin or a readable vendored copy, the game-design workflow remains usable in explicitly labeled `standalone-degraded` mode. Install the upstream package through its current official instructions to use its complete, current workflow.

## Install into your game repository

Requirements for the bundled scripts: Node.js 18 or newer, no npm dependencies. Review scripts before execution. Run from the directory containing the `gds-superpowers` folder:

```bash
# Preview destinations without changing files.
node ./gds-superpowers/scripts/install.mjs --target both --scope project --project /absolute/path/to/game --agents --dry-run

# Install this skill and its optional native specialist definitions.
node ./gds-superpowers/scripts/install.mjs --target both --scope project --project /absolute/path/to/game --agents
```

Use `--target claude` or `--target codex` to install only one adapter. Use `--scope user` without `--project` for personal installation. Project scope is recommended when different games need different versions.

The installer creates files only, treats identical files as no-ops, and refuses differing existing content or symlinked destination components. It does not download Superpowers, edit existing `AGENTS.md` or `CLAUDE.md`, change permissions, commit, push, or publish. Conflicts require a deliberate manual comparison; there is no force-overwrite flag.

Claude Code uses `.claude/skills/gds-superpowers/`. Codex uses `.agents/skills/gds-superpowers/`. Optional specialist definitions go to the host's respective agents directory. Detailed paths and capability limitations are in `references/platforms.md`.

## Invoke

Claude Code:

```text
/gds-superpowers start
Use the selected theme from this repository. Inspect existing work first.
Stop after the charter, evidence plan, and prototype recommendation.
```

Codex:

```text
$gds-superpowers start
Use the selected theme from this repository. Inspect existing work first.
Stop after the charter, evidence plan, and prototype recommendation.
```

These are one skill plus a mode argument, not dozens of independently registered slash commands. In a ChatGPT environment where the skill is installed, select it with the host's skill picker. Attaching a ZIP to an ordinary chat alone is not proof of installation or subagent availability.

## Work on an existing game

```text
/gds-superpowers pivot
Preserve the current implementation. Compare it with the approved roguelite
contract. Return KEEP / CHANGE / ADD / REMOVE / DEFER, then a delta plan.
Do not restart the project or modify code before the delta plan is approved.
```

## Core contract

The player prepares at a base, begins a run, repeatedly chooses one of three temporary upgrades, gathers loot, secures eligible resources, and eventually dies or finishes. Temporary powers reset. Explicitly retained resources fund persistent facilities, specialists, new equipment families, routes, and combinations. One cohesive art direction spans every system.

This is a default genre profile, not a claim that every roguelike uses this loop. A different profile requires a recorded user-approved contract change.

## Two development loops

**Engineering:** approved behavior → failing test → minimal implementation → passing tests → specification review → quality review → fresh integration verification.

**Gameplay:** player-experience hypothesis → minimal experiment → human observation → evidence → retain, revise, or cut.

Neither loop substitutes for the other. Concept artwork is not a screenshot. A simulation is not a human playtest. Positive reception is not verified profit. Several model personas are not a representative player sample.

## Main modes

`start`, `resume`, `status`, `pivot`, `handoff`, `research`, `tools`, `concept`, `council`, `design`, `progression`, `plan`, `prototype`, `slice`, `expand`, `build`, `review`, `debug`, `art`, `pitch`, `playtest`, `balance`, `ship`, `self-test`.

## Files to inspect first

- `SKILL.md`: compact router and invariants.
- `references/modes.md`: procedure, inputs, outputs, and gate for each of the 24 modes.
- `references/lifecycle.md`: phased production and gates.
- `references/superpowers-integration.md`: complete upstream skill mapping.
- `references/game-systems.md`: layered progression and technical rules.
- `roles/`: individual specialist briefs, used only when relevant.
- `templates/`: project state, proposals, task packets, decisions, playtests, and asset records.
- `examples/`: illustrative theme and progression examples, not approved game designs.
- `evals/`: pressure scenarios and honest evaluation procedure.
- `superpowers/`: verbatim copy of the upstream skills (6.4.1, MIT) used only when the plugin is absent.
- `VALIDATION.md`: checks actually performed and remaining validation work.

## Optional project scaffolding

```bash
node ./gds-superpowers/scripts/project.mjs init --project /absolute/path/to/game --dry-run
node ./gds-superpowers/scripts/project.mjs init --project /absolute/path/to/game
node ./gds-superpowers/scripts/project.mjs check --project /absolute/path/to/game
```

`init` creates only a starter state and document index under `docs/gds/`; it does not preapprove a charter, select an engine, or fabricate finished documentation. Existing authoritative documents should be referenced, not duplicated.

## Sources and attribution

See `SOURCES.md` for the upstream and official platform documentation inspected on October 11, 2026. GDSuperpowers is an independent companion, not an official Superpowers, Anthropic, or OpenAI product. No upstream source files or provider assets are redistributed.
