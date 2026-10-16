# Quick Flow Lite entry points

The installer creates an explicit `start` alias by default. In Claude Code, `.claude/skills/start/SKILL.md` registers `/start`. In Codex, `.agents/skills/start/SKILL.md` is invoked as `$start` or selected through `/skills`; it does NOT register a guaranteed bare `/start` command. The main invocations `/gds-superpowers start` and `$gds-superpowers start` remain available.

Use `--start-name gd-start` to avoid an unrelated `start` skill. Use `--no-start` to install only the main skill. The installer refuses known local alias collisions rather than overwriting other workflows. Enterprise, synced, plugin, or externally configured commands cannot all be discovered by the local installer; inspect the host's skill menu and use the main skill when ambiguous.

Install flags include `--upgrade`: only byte-identical recognized baseline files may be replaced, with backups. User-modified files cause a preflight refusal. No project documents are migrated automatically.

# Host adapters and installation

Verified documentation sources are listed in `SOURCES.md`. Paths reflect those sources as inspected on October 11, 2026. Host formats can change; verify the installed version when discovery fails. Live UI behavior needs separate host testing; source checks and CLI reviews do not prove native rendering.

## Claude Code

Project skill: `.claude/skills/gds-superpowers/SKILL.md`.
Personal skill: `~/.claude/skills/gds-superpowers/SKILL.md`.
Project specialists: `.claude/agents/gd-*.md`.
Personal specialists: `~/.claude/agents/gd-*.md`.

Invoke `/gds-superpowers start` or another mode. Mode names are arguments, not separate registered commands. The skill is a normal folder, not a namespaced plugin, so do not assume `/gds-superpowers:start` exists.

Agent adapters include names, descriptions, prompts, and narrow tool lists where appropriate. They do not grant new external tools or invoke a model by themselves. Model choice and permissions are inherited from the host. Research and creative roles have read/research tools; implementation and verification require their appropriately bounded task packets.

Run the coordinator in the main conversation. Only it dispatches children. This deliberately avoids depending on recursive subagent spawning support.

## Codex

Project skill: `.agents/skills/gds-superpowers/SKILL.md`.
Personal skill: `~/.agents/skills/gds-superpowers/SKILL.md`.
Project specialists: `.codex/agents/gd-*.toml`.
Personal specialists: `~/.codex/agents/gd-*.toml`.

Invoke `$gds-superpowers start`, or use the skills selector. The optional `agents/openai.yaml` adds display metadata. Custom TOML agents use `name`, `description`, and `developer_instructions`; models are not hard-coded. Read-only analytical roles request a read-only sandbox, but actual host/runtime permission overrides still govern execution. Do not regard role prose or sandbox defaults as an unbreakable security boundary.

No existing `.codex/config.toml` is edited. Three-child concurrency is the quick-track default; configure a host limit manually only after checking its actual supported setting. Never set unrestricted permissions merely to make agent tasks run.

## ChatGPT

Official documentation describes skills in ChatGPT and Codex, with availability and distribution depending on the surface. Use the installed skill selector when available; a ZIP attachment alone does not prove installation. On a desktop environment exposing local skill discovery, the Codex-compatible folder can be used through that documented workflow. A portable instruction-only fallback is to provide `SKILL.md` and the needed reference documents to a Project, but label it as that fallback.

Invoke in ordinary language: "Use GDSuperpowers in start mode", "Resume GDSuperpowers", or "Use GDSuperpowers observe for one pass". Do not promise `/start`, `$start`, shell execution or filesystem access on a surface that does not expose them. In instruction-only chat, keep interview answers and a compact proposed state in the conversation; label exportable records unsaved. Ask for missing references only when needed by the selected operation. Do not invent persisted approvals, observer initialization, repository inspection or tests. A visible global Task-Observer remains the sole capture owner; when its ownership cannot be inspected, observation is blocked rather than silently starting a bundled capture loop.

Native questions follow [interaction](interaction.md) using the current host schema and mode restrictions. If no usable question tool is exposed, retain session-specific numbered suggestions and **Write my own answer**. No picker is required to brainstorm.

A public or organization-distributed ChatGPT plugin requires the host's plugin packaging and installation workflow. This archive is not a published plugin, and no account-level installation is claimed. The account may expose real subagents or only one conversation. Verify capabilities before choosing the execution mode.

## Safe scripts

`install.mjs` copies the package and, with `--agents`, native specialist definitions. It previews with `--dry-run`, refuses unrecognized conflicts, and preserves unrelated instruction text and host settings. Automatic observer setup may add a protected startup block; the optional authorized `--activate-now` launcher submits a prompt to the selected CLI. No dependency is downloaded. `--upgrade` can replace recognized untouched GDSuperpowers package and specialist files with backups. Customized files require a deliberate manual merge.

`project.mjs init` creates the three quick-track starter records or preserves existing state. Only explicit `--legacy` initialization creates the old state and index. `project.mjs check` validates the recorded state and an optional progression graph. No script executes the proposed game tasks, verifies real user approvals, or acts as a paid-model orchestrator.

Installation is local configuration. It is not evidence of a correctly executed multi-agent workflow; run the live evaluation scenarios separately.

## Consolidated host portability

Discover capabilities by function: scoped read/write, shell/engine checks, web research, skill loading, subagent dispatch and receipt retrieval. `Agent`, `Skill`, `Bash`, and `superpowers:*` are examples from Claude, not mandatory names on Codex. Missing capability means an explicit limitation, not an invented call. Codex adapters deliberately omit model and effort overrides to inherit the selected supported parent configuration. Inspect actual dispatch metadata; inherited model cost still counts toward the budget. Never weaken permission settings to make a smoke test pass.
