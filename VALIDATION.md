# ChatGPT compatibility follow-up

GitHub Actions run 38938614265: 270 active Node tests and 8 Python export tests passed. Source/installed checks and exact-byte export checks passed. See `validation/chatgpt-compat-results.json` for commands and scope.

Actual provider review status is in `validation/pr2-peer-review-status.json`; missing credentials are not peer review. Returned reports require finding reconciliation before merge. ChatGPT upload/scan, native menus, live Claude/Codex behavior and observer execution remain unverified. No user installation or merge was performed by this job.

## Prior validation snapshot

# Guided interaction and global observer follow-up

Current follow-up: 262 active tests passed, zero failures, using `node --test tests/*.test.mjs` on v22.23.3/Linux. Source manifests and package checks passed, including disposable installations. GitHub Actions run 38480335463.

Dynamic suggestion payloads and global-provider suppression are tested as code and static contracts. Real Claude/Codex choice rendering, conversational adherence and observer execution were not run. `evals/INTERACTION-SMOKE.md` lists remaining host checks. No user installation, live observer, game migration or release was performed.

## Prior validation snapshot

# Validation: GDSuperpowers 0.4.0-rc.1 follow-up

Snapshot: October 13, 2026. Source baseline: PR #1 head `f75f940535e79565515027c06dbc123aff9e600a`. This record separates executable helper checks from unexecuted model behavior. The owner explicitly requested implementation and merge; no release or installation follows from that request.

## Current local evidence

Runtime: Node.js 22.16.0, Linux. Only disposable local project/home fixtures were used.

| Command or check | Result | Scope |
|---|---|---|
| `node --test tests/*.test.mjs` on f75f940 | 184 passed | Original active package, not historical copies |
| `node --test tests/review-acceptance.test.mjs` before fixes | Six failed | Reproduced admission, linked-owner, installed-self-check and manifest failures through assertions |
| Current functional baseline, before prose compression | 217 passed | C01-C04 plus existing regression tests |
| Final `node --test tests/*.test.mjs` | 222 passed, zero failed | Includes 19 ownership cases, eight manifest cases, six acceptance cases and five static instruction checks |
| `node scripts/check-package.mjs` | Passed | Active source integrity, syntax, local links, role/schema inventories and prepared scenario structure |
| Installed checker integration | Passed | Claude and Codex; project/user scopes; manual/auto reconfiguration; changed runtime bytes refused |
| Native configuration parsing | Passed | All active TOML/YAML/frontmatter files parse; no host loading inferred |
| Existing eight-case smoke matrix | 32 fixtures prepared | Two hosts and skill/baseline arms; no model executed |

Final machine-readable scope and counts are in `validation/combined-outline-results.json`. Source hashes bind these files to the recorded payload. Logs retained with the authoring review evidence identify commands and outputs. The six-case before-fix failures are software regressions, not a model evaluation.

## What changed

Tasks and jobs use validated reciprocal links for one write owner. Full-state checks and candidate-before-mutation helpers share ownership rules. Reserved jobs never invent run IDs; conflicting admissions do not mutate caller state. A narrow cancellation path releases risk without authorizing work or claiming completion.

Source verification no longer ignores the checksum manifest. Installed receipts distinguish immutable source from generated observer configuration. Review dependencies remain available to the installed checker. Verification never silently regenerates hashes or blesses edited runtime source.

Entry, interview, workflow and observer prose were compressed without changing state schema, commands, approval defaults, helper permissions, or genre profiles. Independent children retain their own execution constraints. Static contract checks verify text presence/routing, not model compliance.

## Not executed

Neither Claude Code nor Codex is installed in this environment. Actual skill discovery, real specialist dispatch, observer initialization, cross-model A/B behavior and token/latency savings remain **not run**. The 48 prepared behavior scenarios and 13-case compression protocol are not marked passing by fixture preparation. Follow `evals/HOST-SMOKE.md` and `evals/COMPRESSION-AB.md` in disposable authorized environments before treating deployment behavior as verified.

No game-engine build, human playtest, real observer, paid model call, release or live installation ran. Unit tests do not demonstrate enjoyable gameplay. Source approvals and execution references are structural evidence, not authenticated user messages.

## Historical evidence

Earlier 143, 175, 177 and broader 211 counts refer to other snapshots or selections. Their logs and prior validation prose are retained, not overwritten or counted as current. Original Claude single-repetition summaries remain byte-for-byte under their historical paths; full original transcripts were not provided. The prior terminal submission did succeed on the owner's Mac, but that is not a current live-model test.

Filesystem checks and backup receipts are not a multi-file transaction or protection against every concurrent directory replacement. One coordinator must serialize shared-state writes. Preserved external observers still require compatibility inspection against schema 3 and their actual selected log.
