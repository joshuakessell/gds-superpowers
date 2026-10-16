# Host capabilities and entry points

Use one canonical coordinator. Discover actual tools rather than inferring them from an application name. Source/package checks do not prove live-host execution.

| Surface | Selection | Actual workspace requirements |
|---|---|---|
| Claude Code | `/gds-superpowers start`, optional `/start` | Local skill discovery and authorized repository access |
| Codex | `$gds-superpowers start`, optional `$start` or skill picker | Codex skill discovery and authorized repository access |
| ChatGPT native skill | Installed picker or `@gds-superpowers` where supported | Account/surface skill availability; tools are discovered separately |
| ChatGPT instruction-only | Explicitly follow supplied `SKILL.md` | Readable source/reference documents; no native installation implied |

Mode names are arguments, not separately registered commands. The retired unhyphenated alias must not be restored. On ChatGPT, read [execution boundaries](chatgpt.md) before assuming filesystem access. See [ChatGPT setup](../CHATGPT.md) for archive generation and upload paths.

## Local layouts

Claude skills use `.claude/skills/gds-superpowers/`, with specialists in `.claude/agents/`. Codex skills use `.agents/skills/gds-superpowers/`, with specialists in `.codex/agents/`. Personal installation puts those directories under the selected user's home. These paths do not imply synchronization to ChatGPT or claude.ai accounts.

`install.mjs --target both` selects Claude Code and Codex only. `--start-name gd-start` avoids a known shortcut collision; `--no-start` omits that shortcut. `--upgrade` accepts the explicit recognized baseline hashes, keeps backups and refuses unknown customizations. [INSTALL.md](../INSTALL.md) owns the exact flags and configuration behavior. No automatic game-state migration follows an installation.

## Interaction and agents

Prefer a usable native question tool with custom input. Claude's candidate payload belongs only to its inspected `AskUserQuestion` interface. Other surfaces use their actual schema directly or the numbered Markdown fallback. The optional helper defaults to text unless explicitly given the supported Claude host and verified native capabilities.

The main conversation coordinates. Independently dispatched children receive bounded packets and actual run IDs. Custom native agent files are optional host adapters, not portable proof that a child exists. Codex inherits the selected model/effort; no model or permissive sandbox override is required. If dispatch is unavailable, label the alternative as sequential viewpoints, not independent peer review.

## Observation and evidence

A local global observer is discovered read-only for the selected host and suppresses bundled capture. ChatGPT cannot infer the user's global installation from its sandbox. Preserve the observed owner; unavailable, changed or inaccessible external state is a blocker, not permission to enable a fallback.

The local installer may add or remove only its intact managed startup blocks after an explicit choice. Its optional launcher submits a prompt only when specifically requested. Configuration, submission, initialization, source merge and public release remain distinct. Existing supported files and approval gates are not replaced by this host guide.

References: [OpenAI skills](https://developers.openai.com/plugins/build/skills), [ChatGPT skills availability](https://help.openai.com/en/articles/20001066-skills-in-chatgpt), [Claude Code skills](https://code.claude.com/docs/en/skills), and [source notes](../SOURCES.md). Verify the actual installed version when discovery differs.
