# Sources

Material inspected while authoring GDSuperpowers 0.1.0 (October 2026). Credits and license terms are in `ATTRIBUTION.md`.

| Source | What was used | Where it shows up |
|---|---|---|
| Superpowers 6.4.1 skill set and README (https://github.com/obra/superpowers, MIT) | The 15 skill names and their triggering descriptions; the subagent-nesting notes for Claude Code | `references/superpowers-integration.md`, `references/platforms.md`, `SKILL.md` delegation table |
| GDSuperpowers 0.1.0 design brief (README, quick start, validation notes) | Package scope, mode list, core contract, two loops, honesty rules, installer behavior, validation expectations | `README.md`, `QUICKSTART.md`, `SKILL.md`, `references/`, `scripts/`, `tests/` |
| Agent Skills specification (https://agentskills.io/specification) | Frontmatter rules: `name`, and a `description` that states only when to use the skill | `SKILL.md`, `agents/claude/*.md` |

Not inspected: Superpowers 7.0.0 beyond its README skill list, the Codex custom-agent runtime schema, and ChatGPT skill-picker documentation. No provider assets or upstream files are redistributed.
