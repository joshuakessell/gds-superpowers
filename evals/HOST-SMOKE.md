# Live-host smoke protocol

**Current candidate status: not run on either Claude Code or Codex.** Prior Claude records are retained separately, including their single-repetition and unavailable-transcript limitations. They are not evidence for this candidate.

The helper covers discovery, resume, automatic observer initialization, manual mode, explicit one-pass observe, real dispatch, an approved tiny edit, and an unapproved scope expansion. Each case records exact prompts, fixture version, CLI version when available, per-repetition outcome, sanitized tool/output traces, and criteria. It never labels a zero exit code as a behavioral pass.

Prepare one disposable fixture without calling a model:

```bash
node scripts/host-smoke.mjs --host claude --case discovery --output /absolute/new/output --repetitions 2
```

After separately authorizing account usage, execute that case in new fixtures:

```bash
node scripts/host-smoke.mjs --host claude --case discovery --output /absolute/new/live-output --repetitions 2 --execute --allow-model-usage
```

Repeat with `--host codex`. `--arm baseline` prepares the same basic game/source prompt without installing the candidate. A personal/global skill may contaminate either arm: inspect loaded paths and use an independently reviewed host profile. The fixture uses `/gd-smoke-start` or `$gd-smoke-start` to avoid replacing an existing global `/start`; bare `/start` discovery still needs a separately observed host check when applicable.

The `approved-edit` prompt contains synthetic user consent only for a disposable marker-file fixture. It is not authorization for a real game. No host sandbox, permission or model overrides are added. Missing permission is a blocked test; do not bypass it. No descendants or paid model runs occur during ordinary installation or local unit tests.

Review the actual trace for skill discovery, real job IDs, source references, ordering of approval before editing, and stopped unapproved changes. Record pass/partial/fail only with specific evidence and limitations. Repeat where results matter. No statistical reliability is claimed from one run.

Traces omit known reasoning blocks and redact common credential patterns, fixture roots and the home path. This is not comprehensive data-loss prevention: review redacted traces manually before sharing. Raw model output is not retained by this helper. Do not upload secrets, private reasoning, credentials, unrelated files or personal conversations.

## Release gates

A candidate remains unvalidated for each host until all relevant smoke criteria are reviewed. Record global/project precedence, actual observer initialization, model inheritance, one real specialist, approved editing, and denial of unapproved scope separately. A game still needs its own technical verification and human playtests.
