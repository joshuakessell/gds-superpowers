# Quick start: 0.4.0-rc.1

This candidate is for review. Do not install it into a live game merely to review the PR.

After review, run from the extracted `gds-superpowers` directory:

```bash
node scripts/install.mjs --target both --scope project --project "/absolute/path/to/game" --agents --upgrade
```

The terminal asks whether Task-Observer should activate automatically. An assistant must ask that question before a non-interactive call and pass the actual answer as `--observer-mode auto` or `--observer-mode manual`. No answer is not consent. The manual command remains `/gdsuperpowers observe` in Claude and `$gdsuperpowers observe` in Codex.

For personal/global installation use `--scope user` without `--project`. For immediate automatic initialization from a terminal, append `--activate-now claude` or `--activate-now codex`; global submission additionally requires `--activation-project /absolute/game/path`. A submitted prompt is not proof that initialization succeeded.

`--optional-agents` adds the six optional design lenses. `--agents` adds the thirteen core definitions. No model is pinned in Codex adapters. Neither option means all agents run on every task.

For a prior project, preview the explicit state migration without writing:

```bash
node scripts/migrate-state.mjs --project "/absolute/path/to/game" --dry-run
```

After approval of that migration, use `--approve` instead of `--dry-run`. Review the preserved original state, approvals and job status before resuming. [MIGRATION.md](MIGRATION.md) describes the reconciliation.

Start with `/start` in Claude or `$start` in Codex. The main commands `/gds-superpowers` and compatibility `/gdsuperpowers` point to the same coordinator. Use `--start-name gd-start` if `/start` already belongs to another skill.
