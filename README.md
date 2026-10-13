# GDSuperpowers: consolidated review candidate
## GameDevSuperpowers 0.4.0-rc.1

A lightweight game-development coordinator combining the adaptive Quick Flow and Task-Observer from the supplied v0.3.1 export with the Claude-built repository's approval-provenance improvements, bounded mode contracts, specialist lenses, and preserved behavioral evidence.

**Source candidate; no release or live installation is implied by merging.** Local verification is reported in [VALIDATION.md](VALIDATION.md). Earlier Claude results concern the pinned v0.1.0 implementation, not this candidate. Neither live-host behavior nor gameplay quality is certified by unit tests.

## Entry points

Claude: `/start` and `/gds-superpowers start`.
Codex: `$start` and `$gds-superpowers start`. A custom bare `/start` is not promised on Codex.

The unhyphenated command has been removed. Recognized older installations are archived outside skill discovery by `--upgrade`; see [INSTALL.md](INSTALL.md). One coordinator owns one project state. Ask one relevant unanswered question, reuse known answers, define a primary genre and supporting genres, establish a cohesive visual direction, and build one small approved increment at a time.

## Default workflow

Inspect or ask -> compact outline and slice plan -> actual approval of the shown scope -> implement -> verify -> human playtest -> keep, tune, pivot, or cut.

Three default working records: `docs/gds/game.md`, `docs/gds/next.md`, `docs/gds/state.json`. Existing authoritative documents are referenced rather than duplicated. No full GDD, epic hierarchy, sprint board or large future backlog is mandatory.

The main conversation is the Architect. Thirteen core roles remain on demand. Six optional lenses add Newcomer, Completionist, Progression, Encounter, Economy and Technical Lead perspectives. A default cap of three reserved/active specialist jobs applies across research and implementation. Only real host dispatches have run IDs. There is no recursive fan-out or background scheduler.

Roguelite rules apply only when that profile is chosen. Preserve an existing approved one-of-three temporary-upgrade contract, separate run state from carried/banked/persistent state, and treat access to an upgrade family separately from receiving that upgrade in a run.

## Installation and migration

Read [INSTALL.md](INSTALL.md). Node.js 18+ is required; there are no npm dependencies. The complete Superpowers runtime is a separate dependency. Adapted BMAD Quick Flow needs no BMAD installation; optional native discovery is read-only until separately authorized.

The installer asks automatic or manual Task-Observer activation for both repository and personal/global scope. Manual observation remains `/gds-superpowers observe` or `$gds-superpowers observe`. Automatic observation does not grant permission to rewrite live skills.

The canonical state schema is `schema_version: 3`. [MIGRATION.md](MIGRATION.md) documents explicit, backed-up conversion from Claude camelCase v1, original GDS snake_case v1 and Quick Flow v2. Migration preserves complete source data and pauses execution for reconciliation; it does not infer consent or discard the game's existing work.

## Verification and review

```bash
node --test tests/*.test.mjs
node scripts/check-package.mjs
```

See [review/CONSOLIDATION.md](review/CONSOLIDATION.md) for recommendation coverage, [review/INPUTS.json](review/INPUTS.json) for pinned inputs, and [evals/HOST-SMOKE.md](evals/HOST-SMOKE.md) for repeatable live-host cases. New evidence must identify fixture versions, exact prompts, observed tools and limitations.

PR #1 consolidates the source and its follow-up fixes. The owner has explicitly requested implementation and merge; that does not authorize a release, live installation, state migration, observer activation or paid model execution. The original input remains under `historical/claude-v0.1.0/`, with original `evals/results/` retained. Historical evidence is excluded from active installation and current test counts.

The installer verifies source integrity before writing. It retains small review dependencies and omits bulky validation logs. Installed copies carry a distinct runtime receipt for the declared payload and generated observer configuration. See [INSTALL.md](INSTALL.md) for deliberate source-manifest maintenance and [evals/COMPRESSION-AB.md](evals/COMPRESSION-AB.md) for the still-unexecuted instruction comparison.

## Licensing

The package and helper code are MIT with the retained notices. The Task-Observer adapted skill text is CC BY 4.0 with Eoghan Henn / Rebelytics credit, source/license links and modifications in its attribution file. See [ATTRIBUTION.md](ATTRIBUTION.md), [NOTICE.md](NOTICE.md), and [LICENSE](LICENSE).
