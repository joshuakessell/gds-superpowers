# 0.4.0-rc.1: consolidated review candidate

Canonical identity and thin legacy alias; explicit schema-3 migration; preserved historical approvals/evidence; stronger approval provenance; active-job capacity validation; selected-root and race safeguards; optional design lenses; host-neutral dispatch packets; live-host smoke harness with honest not-run status. No automatic release or main-branch update.

## Review fixes after the initial candidate (cf94560, bd0d43b)

- Installer: user-scope installation refuses a custom CLAUDE_CONFIG_DIR or CODEX_HOME in manual mode as well, instead of silently writing to the default home layout the host never reads.
- Installer: validation logs and review notes are no longer copied into the host skills directory; scripts, tests, baselines and references remain.
- Migration: a quick-v2 source without a loop object is refused with a reconciliation message rather than a TypeError.
- Migration: snake-case schema-1 sources import max_active_agents and the roguelite contract the same way camelCase sources do.
- Observer activation: an unmodified managed block in a CRLF instruction file is recognized instead of being reported as customized.
- Validation: active task leases are cross-checked against reserved and active job write paths; previously each ledger was only checked against itself.
- Quick Flow reference: the runtime-loaded compatibility section names canonical schema 3 and the explicit migration path instead of schema 2.
- Seven regression tests cover these fixes; the local suite is 211 passing.

# v0.3.1: explicit Task-Observer activation

- Ask automatic/manual during terminal or assistant-led installation, for project and user/global scope.
- Preserve a manual one-time entry at /gds-superpowers observe (Codex: $gds-superpowers observe).
- Save the selected mode and add small startup instructions only for automatic mode; remove only intact managed blocks when switching back to manual.
- Generate an initialization prompt; optionally submit it to a chosen local CLI. Global immediate submission requires a repository target.
- Preserve existing Task-Observer files, observation history, unrelated instructions, and approval gates.
- Recognize clean v0.3.0 upgrades in addition to v0.1.0 and v0.2.0. Non-interactive installation now requires an explicit mode flag.

# GDSuperpowers changelog

## 0.3.0: Task-Observer Lite

Added separate attributed observer companion, checkpoint integration, single-writer observation handling, bounded deduplication, safe candidate staging and read-only reconciliation, existing-install preservation, optional observer alias, v0.2.0 upgrade baselines, local tests, and prepared behavior evaluations. No live-host execution or installation in the user's account is claimed.

# Changelog

## 0.2.0: Quick Flow Lite

Adds a manual `/start` Claude alias and `$start` Codex alias; adaptive interview with provenance and conditional genre branches; BMAD Quick Flow adaptation and optional read-only native discovery; one-primary-plus-supporting genre scoping; three-file default project records; revision-scoped approvals and bounded slice guidance; existing-state preservation; and hash-checked v0.1.0 upgrade with backups.

Retains the original 13 role briefs and native specialist definitions, Superpowers composition map, research quality checks, roguelite profile, progression examples, engineering/review discipline, visual consistency requirements, and full lifecycle references as optional depth.

Replaces v0.1.0's default new-project scaffold with schema 2. `project.mjs init --legacy` still creates schema 1 for explicit compatibility use. Existing schema-1 projects are not auto-converted. Prior copied files are not automatically deleted during upgrade.

This is an independently authored adaptation based on upstream public documentation. Neither native BMAD execution nor live-host agent behavior is represented as tested.

## 0.1.0

Original portable Game Architect, specialist roles, Superpowers composition, bounded research, roguelite design, installer, structural validators, and prepared behavioral evaluation package. Preserved as the upgrade baseline.
