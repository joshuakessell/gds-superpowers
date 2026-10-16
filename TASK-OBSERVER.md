# GDSuperpowers v0.3.1: Task-Observer Lite

**Global-owner policy:** A detected global Task-Observer disables the GDS-bundled capture path. Existing global configuration and logs remain authoritative. The installer does not add a companion or GDS startup loop for that host; explicit observation hands off once, never to a second ledger. See [installation](INSTALL.md).

The suite now includes an independently invocable Task-Observer companion. The Architect remains responsible for the game; the observer examines the workflow and suggests reusable improvements. `/start` retains its adaptive interview and the BMAD-inspired Quick Flow.

## What it catches

Corrections that should not be forgotten, repeated repair failures, unnecessary documentation, redundant agent work, successful reusable techniques, unclear temporary/persistent progression rules, inconsistent art or interface constraints, and tasks that might justify a new skill. These are examples of signals, not claims that defects have been observed in your game.

The original idea comes from Eoghan Henn / Rebelytics' One Skill to Rule Them All, licensed CC BY 4.0. Source: https://github.com/rebelytics/one-skill-to-rule-them-all. The compact game-specific adaptation carries attribution, license links, and a description of modifications. It does not bundle the full upstream implementation or claim to reproduce your August 24, 2026 installation.

## Automatic or manual, chosen during installation

The installer and [installation guide](INSTALL.md) ask whether Task-Observer should be automatic for the selected repository or user/global scope. Yes saves automatic startup settings and prepares the repository initialization prompt. An installing assistant executes that prompt immediately in its current repository session; a terminal can use `--activate-now claude|codex` for actual submission. Without submission, startup is configured for the next eligible session, not already executed.

No keeps the companion installed but inactive until `/gds-superpowers observe` (Codex: `$gds-superpowers observe`). That command performs one explicit pass without enabling future automatic capture. Automatic observation never authorizes automatic live-skill changes. Project manual overrides global auto; do not duplicate observation owners or logs.

## How it stays lightweight

The existing three working records stay the default. New Lite observations live inside `docs/gds/state.json`. An existing upstream observer keeps its own chosen log, with only a pointer in GDS. One owner, no duplicated logs, no constant observer reports, no extra background process, and at most three findings per checkpoint. A staging directory appears only when preparing a specific approved improvement.

## How skills improve

Observe a concrete event; record evidence; deduplicate; distinguish a project fact from a reusable rule; propose a small change with a counterexample and test; review; stage the accepted candidate; request approval for the exact installation; verify after installation. The observer can propose improving itself, but cannot approve its own change or weaken safeguards.

The helper can record, list, review decisions, stage a candidate, compare it with live files, and toggle the project preference. It never executes a model, applies a live patch, authenticates a user's approval, or verifies enjoyment. Those claims require the appropriate host evidence or human feedback.

## Existing Task-Observer installation

The installer preserves any existing target directory, including customized, symlinked, or incomplete directories, without merging files into it. It also checks the selected host's ancestor and personal skill locations to avoid silently shadowing an observer. It reports what it found; the host must inspect and resolve actual activation. Plugin/admin registrations cannot all be detected by this local installer.

For your existing `.claude/skills/task-observer/`, no replacement is attempted. GDSuperpowers receives the integration instructions; your observer keeps its own files. To install this game-specific companion alongside it, choose `--observer-name gd-task-observer`. That makes its direct invocation `/gd-task-observer` in Claude or `$gd-task-observer` in Codex. Do not run both as writers for one task.

`--no-observer` omits this integration at installation without deleting an existing skill. It is not the ordinary No choice: use `--observer-mode manual` to retain manual activation. The host still owns any previously configured global hooks; the installer does not change them. Lite off mode stops GDS checkpoint capture, not an independently configured upstream hook.

## Commands after installation

```text
/start
/task-observer review
/gds-superpowers observe
```

Codex uses `$start`, `$task-observer review`, and `$gds-superpowers observe`. An existing non-Lite observer may handle review differently; follow its actual installed instructions. These are local skill invocations, not guarantees that a new command is registered in every ChatGPT surface.

## Example finding

Observation: the same question was asked after its answer was already recorded.
Evidence: actual answer and repeated-question message references.
Proposal: add a read-existing-answers check before the next interview question.
Counterexample: stale or contradictory answers require a targeted clarification.
Test: resume an interview with some answered and some unanswered fields.
Status: proposed. Nothing is installed until reviewed and approved.

## Installation

```bash
cd "$HOME/Downloads/GDSuperpowers-v0.3.1/gds-superpowers"
GAME_PROJECT="/absolute/path/to/your/game-project"
node scripts/install.mjs --target both --scope project --project "$GAME_PROJECT" --agents --upgrade --dry-run
node scripts/install.mjs --target both --scope project --project "$GAME_PROJECT" --agents --upgrade
```

Recognized clean v0.1.0, v0.2.0, and v0.3.0 GDS files are eligible for backed-up upgrade. Customized GDS files are still refused for manual reconciliation. Existing Task-Observer files are preserved regardless of `--upgrade`. The package is not installed in your account by downloading it.

See VALIDATION.md for the checks actually performed and the unexecuted live-host scenarios.
