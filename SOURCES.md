# Sources and attribution

Inspected on October 11, 2026 while authoring this build.

| Source | What was used | Where it shows up |
|---|---|---|
| Superpowers plugin, `claude-plugins-official` marketplace cache, version 6.4.1 (`~/.claude/plugins/cache/claude-plugins-official/superpowers/6.4.1`), MIT, Jesse Vincent | The 15 skill directories copied verbatim; the README skill list; `using-superpowers/references/claude-code-tools.md` for nesting limits | `superpowers/` (with `LICENSE`), `references/superpowers-integration.md`, `references/platforms.md` |
| `GDSuperpowers-README.md`, `GDSuperpowers-QUICKSTART.md`, `GDSuperpowers-VALIDATION.md` (provided by the user, dated October 11, 2026) | Package scope, mode list, core contract, two loops, honesty rules, installer behavior, validation expectations | `README.md`, `QUICKSTART.md`, `SKILL.md`, `references/`, `scripts/`, `tests/` |
| Agent Skills specification (agentskills.io) as summarized in upstream `writing-skills` | Frontmatter rules: `name`, `description` starting with "Use when", no workflow summary | `SKILL.md`, `agents/claude/*.md` |

GDSuperpowers is an independent companion, not an official Superpowers, Anthropic, or OpenAI product. No provider assets are redistributed. The vendored Superpowers skills are redistributed under their MIT license, unmodified.

Not inspected: the upstream GitHub repository at version 7.0.0 (the provided README mentions it; this machine has 6.4.1), the Codex custom-agent runtime schema, and any ChatGPT skill-picker documentation.
