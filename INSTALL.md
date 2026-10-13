# GDSuperpowers v0.4.0-rc.1 installation guide

## Ask the activation question

Before installing to a repository OR globally, ask:

> Enable Task-Observer automatically during GDSuperpowers work?
>
> **Yes:** initialize it for the chosen scope and observe meaningful task checkpoints automatically.
>
> **No:** install it for manual use only. You can activate it with `/gds-superpowers observe` in Claude Code, or `$gds-superpowers observe` in Codex.

For a project install, say "in this repository." For a user/global install, say "for GDSuperpowers work across repositories, with project overrides respected." If the user already answered, use that answer rather than asking again. An unanswered question is not consent. Automatic observation does not approve automatic changes to skills.

The terminal installer asks this question when `--observer-mode` is omitted and a real interactive terminal is present. Entering no or pressing Enter selects manual. Without a terminal it refuses before writes and tells the installing assistant to ask and pass the selected flag. This prevents an automated shell tool or CI run from silently choosing auto.

## Install from the extracted download

Requirements: Node.js 18 or newer. Superpowers remains a separate dependency. Extract beside the old package, not over it:

```bash
cd "$HOME/Downloads/GDSuperpowers-Consolidation/gds-superpowers"
```

### Repository installation

Run this command in a terminal to be asked the question:

```bash
node scripts/install.mjs --target both --scope project \
  --project "/absolute/path/to/your/game-project" --agents --upgrade
```

For a preview and installation with the SAME already-selected answer:

```bash
GAME_PROJECT="/absolute/path/to/your/game-project"
OBSERVER_MODE="auto"  # Use "manual" if the user selected No.

node scripts/install.mjs --target both --scope project \
  --project "$GAME_PROJECT" --agents --upgrade \
  --observer-mode "$OBSERVER_MODE" --dry-run

node scripts/install.mjs --target both --scope project \
  --project "$GAME_PROJECT" --agents --upgrade \
  --observer-mode "$OBSERVER_MODE"
```

The example value is not a recommendation to skip the choice. An installing assistant must set it to the user's actual answer. Use `--target claude` or `--target codex` to install only one host.

### Global installation

"Global" means personal/user scope on this machine, not every account or every machine. The same question is asked:

```bash
node scripts/install.mjs --target both --scope user --agents --upgrade
```

For unattended execution after the user's answer:

```bash
node scripts/install.mjs --target both --scope user --agents --upgrade \
  --observer-mode auto --dry-run
node scripts/install.mjs --target both --scope user --agents --upgrade \
  --observer-mode auto
```

Substitute `manual` in both commands for No. Global auto applies only when doing GDSuperpowers work, not unrelated projects or chats. A repository's explicit manual setting overrides a global auto default. Custom `CODEX_HOME` or `CLAUDE_CONFIG_DIR` layouts need a deliberate path reconciliation; automatic startup and all user-scope installations refuse unsupported layouts rather than claiming installation into the active profile.

## After Yes: initialize in the repository session

Installation persists `activation_mode: auto`, scope, and the choice timestamp in each installed GDS skill's `config/observer.json`. It adds small startup instructions and generates an initialization prompt. Existing game code, design records, observation history, and live Task-Observer files are preserved.

**Assistant-led installation:** after a successful install, read the selected host's generated `gdsuperpowers-observer-startup.md` and execute its initialization instructions in the current repository conversation immediately. The user's Yes already authorized observation; do not ask the same choice again or tell them they must remember a manual command. Inspect the real observer and existing log, select one capture owner, and report initialized or the exact blocker. Do not recursively start another model from inside an agent session unless separately requested.

**Terminal-led installation:** a shell script cannot inject a message into an already open chat. To actually submit the initialization prompt now, append `--activate-now claude` or `--activate-now codex`. This opens ONE selected local CLI in the repository with the generated prompt and uses the host's existing permissions and account. It can incur the host's normal usage. It does not add permission bypasses or start a hidden background process.

```bash
# Install and submit to Claude Code in this repository immediately.
node scripts/install.mjs --target both --scope project \
  --project "$GAME_PROJECT" --agents --upgrade \
  --observer-mode auto --activate-now claude
```

For a global install, explicitly identify the repository for immediate activation:

```bash
node scripts/install.mjs --target both --scope user --agents --upgrade \
  --observer-mode auto --activate-now claude \
  --activation-project "/absolute/path/to/your/game-project"
```

Without `--activate-now`, automatic startup is CONFIGURED and the prompt is SAVED, but no prompt has been submitted to a running conversation. The next eligible host session loads the startup instructions. Do not report actual initialization until the host confirms it. A missing CLI or denied operation is a blocker to immediate activation, not a reason to erase the successful installation.

### Initialization prompt submitted by the guide or optional launcher

The actual generated prompt names the selected host, scope, and configuration path. Its instructions are:

```text
/gds-superpowers observe

Initialize Task-Observer for this repository session using the automatic
choice already made during installation. This is initialization, not an
instruction to invent a finding.
Read the installed settings and observer integration guide. Resolve project
overrides and later explicit on/off preferences. Inspect the actual observer,
preserve its history, and select one capture owner. Do not ask the choice again.
If the effective setting permits auto, initialize checkpoint observation now.
Otherwise report the manual/off override or compatibility blocker.
Preserve the game, its approvals, and /start progress. Do not change live skills.
Confirm what was actually read and initialized.
```

Codex uses `$gds-superpowers observe` on the first line. Initializing is not a requirement to produce an observation when there is no useful evidence.

## After No: keep explicit activation available

The companion remains installed, but automatic checkpoints do not run:

```text
/gds-superpowers observe
```

Codex: `$gds-superpowers observe`. This performs one requested pass without silently enabling future automatic capture. A later explicit `observer on` or `observer off` is a separate persistent project preference, recorded with a timestamp. Rerunning the installer with a new mode is also an explicit change to that installation's default.

An existing legacy off state can block observation storage until reconciled. Independent external Task-Observer hooks are not disabled by a GDS manual choice; inspect those separately. Do not claim that manual mode shuts down unrelated installations.

## Files, scope, and preservation

| Purpose | Repository scope | User/global scope |
|---|---|---|
| Claude startup rule | `.claude/rules/gds-task-observer.md` | `~/.claude/rules/gds-task-observer.md` |
| Codex startup block | `AGENTS.override.md` if non-empty, otherwise `AGENTS.md` | `~/.codex/AGENTS.override.md` if non-empty, otherwise `~/.codex/AGENTS.md` |
| Claude saved prompt | `.claude/gdsuperpowers-observer-startup.md` | `~/.claude/gdsuperpowers-observer-startup.md` |
| Codex saved prompt | `.codex/gdsuperpowers-observer-startup.md` | `~/.codex/gdsuperpowers-observer-startup.md` |

Claude gets a separate rule instead of a new CLAUDE.md, avoiding accidental replacement or shadowing of existing instructions. Codex receives one marked, hash-checked block appended to the active instruction file. Unrelated bytes are preserved. Reconfiguration removes or replaces only an intact GDS-owned block. Customized, duplicate, malformed, or symlinked instruction targets are refused. Existing files changed by this installer are backed up first; installation is not a cross-file transaction.

Project/user configuration can coexist. The actual effective setting must be resolved at startup and checkpoints. Instruction files guide behavior rather than enforce a process at runtime; a live-host check is still necessary. Sources: [SOURCES.md](SOURCES.md).

Clean GDS versions 0.1.0, 0.2.0, 0.3.0, and 0.3.1 can be upgraded with `--upgrade`. Unrecognized source customization requires a manual merge. Existing observers are preserved; use `--observer-name gd-task-observer` to install the bundled companion under another name. `--no-observer` is an advanced omit option, not the normal No choice. It does not remove any existing observer. The guide's No selects `--observer-mode manual` so the companion remains available.

## Verify and continue

```bash
node scripts/observer-status.mjs --project "$GAME_PROJECT" --host claude
node --test tests/*.test.mjs
node scripts/check-package.mjs
```

The status command is read-only and explicitly reports `initialized: false` because it has not run a model. In the actual host, confirm the loaded instructions, effective mode, and observer owner. Continue the game with `/start` in Claude or `$start` in Codex. Do not restart its interview or replay answered questions.

## Canonical name and review-only delivery

This candidate uses `gds-superpowers`. The installer also supplies a thin `gdsuperpowers` alias, so `/gdsuperpowers observe` and `$gdsuperpowers observe` remain valid. One coordinator owns one state file. Known clean legacy supporting files are inspected before replacing the old entry point; customized or unknown legacy content is refused. Files are backed up, not deleted. Existing Task-Observer files remain preserved.

Explicitly recognize the pinned Claude cdbebc2 source for overlapping canonical files and the exact supplied v0.3.1 export. Do not treat any arbitrary package marked v0.1.0 as a recognized upgrade. Retain existing configured observer options when bridging the old name; the newly chosen mode controls future defaults.

The canonical project schema is 3. Installation never migrates project state. Use the separately approved preview/apply process in MIGRATION.md. The selected root itself may not be a symlink. Ancestor OS links are deliberately canonicalized with realpath, while destination components below the root are checked. Installation rechecks creates and updates, uses exclusive creation, records backups and reports partial writes. It is not a multi-file transaction or a guarantee against every possible concurrent filesystem replacement.

For review, use the source package, local tests and draft PR. Do not install personal/global skills or invoke a model simply to inspect source.

## Source and installed integrity

Run `node scripts/check-package.mjs` before installation. It verifies the source manifest as well as links and syntax. Following a deliberate source edit, run `node scripts/manifest.mjs --write`, inspect that generated diff, then run the checker and tests. Verification itself never regenerates hashes. Do not regenerate hashes to suppress an unexplained mismatch.

The source manifest covers active package files, including review material and validation records, except itself. The tree walker excludes Git metadata, node_modules, historical snapshots, historical evals/results and backup directories. Preserve excluded records under their original provenance; they are not current runtime content.

Installed copies omit bulky validation logs but retain small review dependencies. `RUNTIME-MANIFEST.json` identifies the exact installed payload and the originating source manifest; only observer configuration is identified as generated configuration. Run the checker from the installed skill directory to verify that payload. Existing runtime source is verified before an installer reconfiguration, so switching observation modes cannot silently approve edited code. A runtime receipt is an integrity record, not a cryptographic signature or proof that a host executed the skill.

Recognized clean files from PR #1's f75f940 snapshot may be upgraded with backups, including existing start aliases. Customized or unrecognized files require deliberate reconciliation. Migration and live observer changes remain separate operations.
