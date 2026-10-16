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

Prefer a usable native question tool with custom input. Claude's candidate payload belongs only to its inspected `AskUserQuestion` interface. Codex and ChatGPT use their actual exposed schema or the numbered Markdown fallback. The optional helper defaults to text unless host, nativeTool, nativeAvailable, nativeCustomInput and nativeAllowed identify a usable supported interface. It supports Claude AskUserQuestion, Codex request_user_input and request_user_input_async, and ChatGPT request_user_input_async where exposed. Respect plan-only and approval restrictions, built-in custom input and pending asynchronous replies; see [interaction](interaction.md).

The main conversation coordinates. Independently dispatched children receive bounded packets and actual run IDs. Custom native agent files are optional host adapters, not portable proof that a child exists. Codex inherits the selected model/effort; no model or permissive sandbox override is required. If dispatch is unavailable, label the alternative as sequential viewpoints, not independent peer review.

## Observation and evidence

A local global observer is discovered read-only for the selected host and suppresses bundled capture. ChatGPT cannot infer the user's global installation from its sandbox. Preserve the observed owner; unavailable, changed or inaccessible external state is a blocker, not permission to enable a fallback.

The local installer may add or remove only its intact managed startup blocks after an explicit choice. Its optional launcher submits a prompt only when specifically requested. Configuration, submission, initialization, source merge and public release remain distinct. Existing supported files and approval gates are not replaced by this host guide.

References: [OpenAI skills](https://developers.openai.com/plugins/build/skills), [ChatGPT skills availability](https://help.openai.com/en/articles/20001066-skills-in-chatgpt), [Claude Code skills](https://code.claude.com/docs/en/skills), and [source notes](../SOURCES.md). Verify the actual installed version when discovery differs.

In instruction-only ChatGPT, say "Use GDSuperpowers in start mode" with the skill and needed references supplied. Return unsaved records when write tools are unavailable; never invent repository inspection, tests, persisted approvals or observer initialization. An inaccessible global owner blocks capture rather than enabling a fallback.

## Local Codex configuration and project helpers

The optional `agents/openai.yaml` supplies display metadata. Codex TOML agent definitions use `name`, `description`, and `developer_instructions`; models and effort are inherited. The installer does not edit `.codex/config.toml`. Three-child concurrency is the Quick Flow default; inspect the actual host's supported settings before configuring a limit. Role prose and sandbox defaults do not grant permission to bypass host controls.

`project.mjs init` creates the three Quick Flow records or preserves existing state; only an explicit `--legacy` request creates the old state/index. `project.mjs check` validates recorded state and an optional progression graph. Neither helper executes proposed game work or proves real user approval. Installation does not automatically migrate game state.
