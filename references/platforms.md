# Platforms: paths and capability limits

| Host | Skill path (user scope) | Skill path (project scope) | Specialist agents | Invoke |
|---|---|---|---|---|
| Claude Code | `~/.claude/skills/gds-superpowers/` | `<repo>/.claude/skills/gds-superpowers/` | `~/.claude/agents/gds-*.md` or `<repo>/.claude/agents/` (from `agents/claude/`) | `/gds-superpowers <mode>` |
| Codex | `~/.agents/skills/gds-superpowers/` | `<repo>/.agents/skills/gds-superpowers/` | `~/.codex/agents/gds-*.toml` or `<repo>/.codex/agents/` (from `agents/codex/`) | `$gds-superpowers <mode>` |
| ChatGPT (skills picker) | host-managed | n/a | none | select the skill, then type the mode |

`scripts/install.mjs` writes only these paths, create-only. The Codex agent TOML fields were validated for syntax only; the host's runtime schema was not verified.

## Capability limits to check at startup (`tools` mode does this explicitly)

- **No `Agent` tool** → council and reviews run in-thread, labeled; never described as independent agents.
- **No `Bash`** → scripts cannot run; `self-test` reports "not run" and state validation is done by reading.
- **No file write** → state changes are proposed as a diff for the user to apply.
- **Attached ZIP in chat** is not an installation. Say so.
- **Nested subagent depth** on Claude Code defaults to three; council never nests deeper than one.
