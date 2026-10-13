# Attribution

GDSuperpowers builds on other people's published work. This file names it.

## Superpowers (required dependency)

- Project: https://github.com/obra/superpowers
- Author: Jesse Vincent
- License: MIT
- What GDSuperpowers uses: the skill names, invocation conventions, and workflow shape of all 15 Superpowers skills (`using-superpowers`, `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`, `finishing-a-development-branch`, `writing-skills`, `diagnosing-superpowers`). The "engineering loop" described in `SKILL.md` is their workflow, not ours.
- What GDSuperpowers does not do: redistribute Superpowers files, copy its hooks, or rewrite its skills. `references/superpowers-integration.md` maps each GDS mode to the upstream skill it routes to. Install Superpowers from its own repository under its own license.
- The skill-authoring discipline used while writing this package (test a skill against a baseline before trusting it, descriptions that state only when to use a skill) comes from the Superpowers `writing-skills` skill and Anthropic's published skill-authoring guidance.

## Agent Skills specification

- https://agentskills.io/specification
- Used for the `SKILL.md` frontmatter format (`name`, `description`).

## GDSuperpowers concept

The package scope, mode list, core roguelite contract, two-loop model, and honesty rules follow a GDSuperpowers 0.1.0 design brief (README, quick start, and validation notes dated October 11, 2026). The brief described the package; this repository is an implementation of it.

## Not affiliated

GDSuperpowers is an independent companion. It is not an official Superpowers, Anthropic, or OpenAI product, and nothing here implies endorsement by them.
