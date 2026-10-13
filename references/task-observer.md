# Task-Observer integration: GDS Lite

This integration adapts ideas from Eoghan Henn / Rebelytics' One Skill to Rule Them All, CC BY 4.0: https://github.com/rebelytics/one-skill-to-rule-them-all and https://creativecommons.org/licenses/by/4.0/. Changes: project-scoped checkpoints, single ownership, minimal state, and separately approved staging. This guide is CC BY 4.0. It is not the complete upstream observer runtime.

## Resolve, do not overwrite

Read `config/observer.json` in this installed GDSuperpowers skill. Resolve the nearest project installation before a global default. The installer saves `activation_mode: auto|manual`, scope, and `configured_at`; missing mode means manual. `enabled` controls integration availability, not consent to automatic capture. Manual means do not load the observer or capture checkpoint findings unless explicitly invoked. A newer explicit project `observer.automatic` with `mode_set_at` can supersede an older installation choice. Untimestamped legacy `observer.enabled: false` is a stop boundary to reconcile, not silent permission to reactivate. Respect `enabled: false`. Resolve its skill_name through the host's visible skills or the selected project's sibling skills directory. An installation already reported at `.claude/skills/task-observer/` is a user-provided fact, not evidence that this session read it. Check the actual readable file before declaring it loaded.

The user reports an Eoghan Henn Task-Observer installation dated 2026-08-24. No files from that installation were available while authoring v0.3.0. Preserve any actual local version, references, log location, hooks, and customizations. The installer does not infer that a same-named skill has a known version or matching behavior.

For an existing upstream or customized observer, inspect its real SKILL.md and needed references. Reuse its capture mechanism only when its configured scope, storage, activation, and approvals are compatible with the current request. Do not invoke an uninspected external workflow. If incompatible, do not quietly reinterpret or rewrite it: report the specific conflict and perform only this documented GDS checkpoint pass, or install the bundled adaptation under a separate chosen name after authorization. Label the mode `native-reuse`, `gds-lite`, `instruction-fallback`, `off`, or `unavailable` truthfully.

Do not run the native observer and the Lite observer as independent writers. When native logging is active, send it one bounded packet and keep a verified pointer in GDS state instead of a duplicate log. When Lite is active, use only the optional observer object in the existing state. No fourth mandatory planning file.

## Checkpoints

In effective automatic mode, load the chosen observer once during `/start` or resume, or at the installer initialization prompt in the current repository. In manual mode, do not load it automatically. Trigger a short pass only in automatic mode or by explicit request after a user correction, a meaningful task result or failure, a council resolution, fresh verification, human playtest feedback, or handoff. A pause or failed task also qualifies; do not log only successes. No arbitrary timer, repetitive full audit, or mandatory full-council run.

The observer reviews already available task evidence. It does not gain permission to inspect unrelated work. In a simple task it runs as the coordinator's checklist. An actual independent reviewer is optional for material skill changes, counts within the existing three-agent budget, and gets a bounded packet. Child agents return at most one or two candidate observations and never write shared state or dispatch another observer.

Keep responses about the game first. No more than three new/changed observations per checkpoint and one short optional observer line in the result. No low-value observations to fill a quota. Consolidate repeated findings and route project decisions to game.md, task defects to next.md, and reusable methods to skill proposals. Never auto-generalize one game's design or unverified fun-factor assumptions to other games.

## Improvement loop

Observe -> evidence -> deduplicate -> proposed change -> bounded review -> accepted candidate -> stage -> separate exact installation approval -> verify in the live host. Use installed Superpowers writing-skills when available. A static check is not a live behavioral test; a successful game test is not a human fun test. Record rejected proposals and counterexamples. Prefer tests, simpler defaults, smaller instructions, and removal of redundant process to continual prompt growth.

Acceptance authorizes staging only. Do not change live skill instructions, hooks, budgets, permissions, source, or asset pipelines just because a candidate was accepted. Preserve base hashes and before bytes, show the diff, get installation approval, inspect current contents, then use permitted host tools. No self-issued approval, recursive self-modification, forced upstream updates, automatic commits, external publication, or scheduled work.

## Invocation

`/gds-superpowers observe` and `/gds-superpowers observer review` route here. A plain `observe` is one explicit pass, available in manual mode; it does not flip the saved automatic choice. If a legacy off state prevents storage, return the unsaved pass and explain the off setting rather than changing it without authorization. `observer on` and `observer off` are explicit persistent project changes: record both `observer.automatic` and `mode_set_at` through the updated companion helper when supported. An older preserved helper may not set these fields: inspect it and use permitted file tools to record this explicitly authorized preference rather than claiming the old helper did it. Installation initialization reads the saved settings, resolves the owner and log, and reports actual initialization or its blocker without demanding another answer or fabricating observations. The direct Claude companion invocation is `/task-observer review`; Codex uses `$task-observer review`, or the configured alternate skill name. Existing upstream variants may have different mode handling: use their inspected instructions, not an invented command contract. `/start` stays the game entry point.

When no observer is available, this reference supports a clearly labeled instruction-fallback pass with user-visible proposed lessons. Do not claim the separate skill or a subagent executed. If there is no writable state, return an unsaved handoff rather than creating a log elsewhere.

## Installation-time consent and startup

Use [INSTALL.md](../INSTALL.md) when assisting with installation. Ask the yes/no choice once for the selected scope before writes, unless the user already supplied the answer. Explain the manual command. Pass the user's choice using `--observer-mode auto` or `--observer-mode manual`; never silently select auto.

Automatic setup adds a small Claude rule and a protected Codex instruction block. These are startup prompts, not a daemon. After an assistant-led installation, read the generated startup prompt and carry out initialization immediately in that same repository session. A terminal installer cannot inject text into an existing chat: `--activate-now claude|codex` explicitly launches one local CLI with the prompt in the chosen repository using normal permissions. A user/global launch requires `--activation-project`; otherwise no repository session is inferred. Report configured, submitted, and actually initialized separately. A stub CLI test is not live model validation.

The read-only helper `scripts/observer-status.mjs --project /repo --host claude|codex` reports the effective local/global settings; `--explicit` reports one-time invocation eligibility. A root-scope manual setting takes precedence over a global auto setting. Never inspect other repositories to find observation material. Independent native hooks remain outside this switch and must be inspected separately, not assumed disabled.
