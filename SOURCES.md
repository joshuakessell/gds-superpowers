# Sources and integration basis

Inspected public primary documentation on October 11, 2026. URLs are provided for maintainers to recheck as upstream interfaces change. This is a selective integration design, not a complete copy of any upstream system.

## BMAD Game Dev Studio

- https://game-dev-studio-docs.bmad-method.org/explanation/quick-flow-vs-full/
  Quick Flow is explicitly for solo and tiny teams: Quick Prototype, Quick Dev, optional Quick Spec, play and iterate. Full Production is a separate heavier path.
- https://game-dev-studio-docs.bmad-method.org/tutorials/first-game-project/
  Starting questions about game type and the core action, goal, and challenge; prototype feedback. Public tutorial commands must be checked against the local installation before use.
- https://game-dev-studio-docs.bmad-method.org/explanation/game-types/
  Genre-specific sections, primary and secondary components, hybrid selection, and avoiding excessive combinations.
- https://game-dev-studio-docs.bmad-method.org/reference/workflows/
  Workflow roles and expected inputs/outputs. Used for the crosswalk, not as a mandate to generate all outputs.
- https://github.com/bmad-code-org/bmad-module-game-dev-studio
  Official repository and README. Source checkout was not obtained in this authoring run, and no native BMAD command was executed. Counts and entry commands vary between retrieved pages; this package does not assert a fixed total of templates or a universal native command.

## OpenGSD

- https://opengsd.net/core
  Discuss, plan, execute, verify, and ship boundaries; retained context and fresh execution contexts. Marketing claims about guaranteed output or hallucination elimination were not adopted. No dependency or runtime is bundled.

## Superpowers

- https://github.com/obra/superpowers
- https://raw.githubusercontent.com/obra/superpowers/main/skills/brainstorming/SKILL.md
  Adaptive conversational discovery, choosing the appropriate task path, and keeping user requirements authoritative.
- https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-skills/SKILL.md
  Skill behavior needs actual scenario testing. Static linting is not a substitute.
- https://raw.githubusercontent.com/obra/superpowers/main/skills/test-driven-development/SKILL.md
- https://raw.githubusercontent.com/obra/superpowers/main/skills/verification-before-completion/SKILL.md
  Retained v0.1.0 engineering references. Consult the locally installed versions before use.

`upstream-map.json` preserves the original 15-name inventory and its historical 7.0.0 observation. Version 0.2.0 does not claim a new immutable pin or tested compatibility with every current upstream release.

## Host capabilities and skill formats

- https://code.claude.com/docs/en/skills
  Project and personal skill directories, explicit slash invocation, manual skill frontmatter, and legacy command compatibility.
- https://code.claude.com/docs/en/sub-agents
  Native Claude Code agent definitions. Original adapter basis; live execution remains untested.
- https://developers.openai.com/codex/skills
  Redirected to https://learn.chatgpt.com/docs/build-skills during inspection. Skill folders and progressively loaded instructions; Codex skill menu or dollar-sign invocation. ChatGPT skill distribution is a separate host capability.
- https://learn.chatgpt.com/docs/agent-configuration/subagents
  Original Codex agent adapter reference. Standalone project definitions require actual host support; no supported capability is fabricated when absent.

## What these sources do not establish

They do not prove successful installation in the user's environment, simultaneous agent availability, game enjoyment, commercial success, engine suitability for an unspecified game, or fidelity to every native BMAD workflow. Those questions require separate inspection or testing.

## Task-Observer sources inspected October 11, 2026

- Eoghan Henn / Rebelytics and contributors: https://github.com/rebelytics/one-skill-to-rule-them-all
- Primary skill instructions, inspected version field 3.6.0: https://raw.githubusercontent.com/rebelytics/one-skill-to-rule-them-all/main/SKILL.md
- Author project page: https://www.rebelytics.com/task-observer/
- License: https://raw.githubusercontent.com/rebelytics/one-skill-to-rule-them-all/main/LICENSE.txt and https://creativecommons.org/licenses/by/4.0/
- Claude named skill invocation: https://code.claude.com/docs/en/skills
- Codex skill locations and discovery: https://learn.chatgpt.com/docs/build-skills
- Superpowers skill evaluation: https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-skills/SKILL.md

These are dated source observations, not immutable source snapshots or a claim about the user's reported 2026-08-24 installation. No direct access to that installation was available.


## v0.3.1 startup activation references (checked October 11, 2026)

- Claude Code memory and rules: https://code.claude.com/docs/en/memory . Unscoped project/user rules load at launch; instructions are context rather than an enforcement layer. This release uses a dedicated rule to avoid shadowing a repository AGENTS.md by creating CLAUDE.md.
- Claude CLI initial prompts: https://code.claude.com/docs/en/cli-reference . Optional activation uses an initial interactive prompt, with no permission-bypass flags.
- OpenAI custom instructions: https://developers.openai.com/codex/guides/agents-md/ (redirects to https://learn.chatgpt.com/docs/agent-configuration/agents-md). Codex chooses the non-empty AGENTS.override.md before AGENTS.md, including its user directory.
- Codex CLI initial prompt: https://developers.openai.com/codex/cli/reference/ (redirects to ChatGPT Learn developer commands). Optional submission invokes the selected CLI in the designated working directory.

No model CLI was used to verify actual initialization. Local launcher tests use explicitly labeled stubs. Startup configuration is not proof of execution. Existing observers and their CC BY 4.0 attribution remain preserved.

## Consolidation documentation checked

- OpenAI subagents, parent model/effort inheritance: https://developers.openai.com/codex/subagents (redirects to ChatGPT Learn).
- OpenAI CLI commands: https://developers.openai.com/codex/cli/reference.
- Claude skills and CLI output: https://code.claude.com/docs/en/skills and https://code.claude.com/docs/en/cli-reference.

Checked during October 12, 2026 consolidation. These sources describe capabilities, not proof that the hosts ran this candidate.
