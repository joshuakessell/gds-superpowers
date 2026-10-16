# Use GDSuperpowers with ChatGPT

GDS uses one canonical `SKILL.md` across hosts. ChatGPT can perform guided design and planning with its available tools. Repository implementation, native menus, persistence and specialist execution require corresponding capabilities; a skill does not provide those tools by itself.

## Native ChatGPT skill

From a verified source checkout, create a new archive outside the repository:

```bash
python3 scripts/export-chatgpt.py --format skill --output ../gds-superpowers-skill.zip
```

The exporter requires Python 3.9+ and Node.js 18+ on the packaging machine. It checks the existing manifest, packages exact source bytes under `gds-superpowers/`, refuses overwriting an archive and performs no installation or model call. Supporting adapters are source resources, not additional automatically installed commands.

Where Skills upload is available, use that surface's documented skill-upload workflow, upload the archive, complete the scan and explicitly install/select the skill. Availability depends on the account, workspace and surface. Attaching the ZIP to an ordinary chat is not installation. Confirm the host can read `references/chatgpt.md` and `references/interaction.md`, then start with `@gds-superpowers start` or the installed skill picker. No bare custom `/start` is promised in ChatGPT.

For the separate plugin-upload workflow, export the documented portable layout instead:

```bash
python3 scripts/export-chatgpt.py --format plugin --output ../gds-superpowers-plugin.zip
```

That archive has root `plugin.json` and `skills/gds-superpowers/SKILL.md`. It declares no MCP servers, hooks, credentials or extra tool permissions. It is a package for review/upload, not a published or OpenAI-verified plugin. Personal skill upload and plugin distribution are distinct routes.

## Instruction-only fallback

If native upload is unavailable, supply `SKILL.md` and the required references in a ChatGPT Project or conversation. Start with:

> Follow the supplied GDSuperpowers skill and its ChatGPT execution boundary. Reuse my existing game decisions. Ask one relevant question with three context-specific suggestions and a custom-answer option. Use conversation planning until an authoritative repository is actually accessible. Do not install anything or enable an observer.

Load only the needed references. Do not claim this fallback registered a native skill or synchronized local files. If file tools cannot inspect the ZIP, extract it and provide the specific referenced documents. An inaccessible global observer remains unverified, not absent.

## Claude Code and Codex

The existing installer remains the local route: `--target claude`, `--target codex`, or `--target both`. `both` means those two local layouts, not account installation in ChatGPT. Claude uses `/gds-superpowers start`; Codex uses `$gds-superpowers start`. Their optional `start` aliases, actual native tools, consent rules and global Task-Observer handling remain unchanged. See [INSTALL.md](INSTALL.md).

## Validate on the actual host

Confirm discovery and reference access; two different themes must yield different suggestions. Test a qualified answer, custom answer, free-form preference and resume. With no shell, require an unsaved handoff rather than a fake write. With no access to the user's global observer, require no bundled capture. Code-format and archive tests cannot certify these live interactions.

Sources checked October 16, 2026: [ChatGPT skills](https://help.openai.com/en/articles/20001066-skills-in-chatgpt), [building skills](https://developers.openai.com/plugins/build/skills), [plugin format](https://developers.openai.com/plugins/build/plugins), [Codex skills](https://developers.openai.com/codex/skills), and [Claude Code skills](https://code.claude.com/docs/en/skills).
