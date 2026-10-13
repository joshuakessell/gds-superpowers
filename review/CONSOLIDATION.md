# Combined-outline implementation and review map

Baseline: `f75f940535e79565515027c06dbc123aff9e600a`, PR #1 in `joshuakessell/gds-superpowers`. The source comparison remains in `GDSuperpowers-Comparison.md`; the later functional assessment and writing audit were combined into C01-C12. This follow-up preserves the five sound Claude/Gemini revisions instead of reverting them.

| Item | Implementation | Evidence/status |
|---|---|---|
| C01 single write owner | Reciprocal task/job links, canonical roots, scoped lease owner | Implemented; same-owner, forged-link, roots and capacity tests pass |
| C02 mutation boundaries | Shared candidate checks on reserve/start/task activation; safe cancellation | Implemented; refusal leaves serialized state unchanged; recovery tests pass |
| C03 installed consistency | Retain small review dependencies; exclude validation logs | Implemented; installed self-check passes on both layouts/scopes |
| C04 integrity | Source manifest verification, deliberate generation, scoped runtime receipt | Implemented; mismatch/missing/unsafe/duplicate/unexpected tests pass |
| C05 thin aliases | Canonical routing, forward arguments, missing-target stop | Implemented; static routing checks pass |
| C06 compact coordinator | Essential invariants and conditional routes | Implemented; 721 measured words, no live behavioral equivalence claim |
| C07 single procedure owner | Interview, Quick Flow and per-mode ownership; conditional engineering fallback | Implemented; generic composed workflow remains upstream |
| C08 observer separation | Runtime status/capture; independent observation; on-demand maintenance | Implemented; mode/config helper regression tests retained |
| C09 personal context | Historical facts moved to USER-PROVENANCE.md; active project profile preserved | Implemented; no game state edited |
| C10 child-context deduplication | Remove duplicate sentence in 26 core adapters; no generator added | Implemented; independent constraints remain inline |
| C11 separate evaluation baselines | Functional baseline pinned locally; 13-case A/B protocol and existing smoke harness | Helpers verified; real Claude/Codex A/B blocked by absent CLIs |
| C12 synchronized review record | Current counts, integrity scope, limitations and owner authorization | Implemented; VALIDATION.md distinguishes source tests from host behavior |

The latest owner instruction explicitly authorizes updating PR #1 and merging after available validation. Earlier review-only directions did not authorize a merge; they are historical. Merge is not release approval, skill installation, game migration, observer activation or permission for paid model runs. Never report a GitHub mutation until its returned state is verified.

## Reviewer focus

Inspect `scripts/ownership.mjs` and `scripts/jobs.mjs` together. Explicit links are required before one task/job pair can share an owner; matching strings alone cannot waive a conflict. Scope edits and transitions must run complete state validation, even though only the documented helpers provide candidate-before-mutation guarantees. Shared state is cooperative, not cross-process locked.

Inspect source/runtime manifests with the installer. Generated observer configuration is intentionally identified separately; arbitrary source edits are not approved by reconfiguration. Unknown previous versions and edited installed files still refuse safe upgrades. Preserve historical evidence, licenses and existing observers.

For the instruction evaluation, compare compact text against the corrected code baseline, not the old faulty helpers. Review actual loaded files and outcomes rather than only checking word counts. The live evaluation limitation remains after merging source.
