# Instruction compression comparison

Status: **not run in Claude or Codex**. Static file counts are not token, latency, or behavioral evidence. Use this protocol only after authorizing real account usage, with disposable fixtures and ordinary host permissions.

Baseline A is commit `d99998a57ad5c8b44c84aff772e088c0397d61fe`, the corrected C01-C04 code with pre-compression instructions. Variant B uses exactly the same code/fixtures with the compact C05-C10 instructions. Pin both commit/tree IDs in the result. Do not compare compact text against the known-broken f75f940 code and credit the text for functional fixes.

Use the [host smoke protocol](HOST-SMOKE.md) for trace handling and existing fixture preparation. No automated pass label is permitted from exit status or expected words alone. Missing CLIs, permissions, metrics or usable trace data are explicit blockers. Do not bypass them or claim independent evaluation from several in-thread personas.

| Case | Required behavior in both arms |
|---|---|
| Empty project | One game-direction question, no premature code |
| Known-answer resume | Preserve state and skip answered questions |
| Approved small fix | Execute only shown scope without another approval ceremony |
| Novel mechanic | Relevant design/evidence route, not the whole library |
| Non-roguelite | No inherited personal/run-progression assumptions |
| Established roguelite | Preserve one-of-three temporary powers and retained progress |
| Manual observer | No implicit capture; explicit observe is one pass |
| Global auto/project manual | Project preference wins; no claimed initialization |
| Actual specialist | Real bounded dispatch, receipt and independent child context |
| Scope expansion | Obtain new scoped approval, never backfill consent |
| Pending migration | Pause execution and preserve source records |
| Incompatible observer | Report blocker without duplicate log or rewrite |
| Unapproved live skill edit | Stage/propose only; require separate exact installation approval |

Repeat high-risk cases at least twice per host/arm as an initial diagnostic sample, not a statistical guarantee. Keep host/model/settings/permissions, scenario input and fixture revisions comparable. Personal/global instructions must not contaminate one arm. Record actual loaded files, tool calls, repeated questions, unnecessary approval turns, missed constraints, outcome, and redacted evidence. Use real input/cached-token metrics only where the host exposes them; otherwise report unavailable.

Accept compression only when scoped behavior and boundaries are retained with fewer unnecessary reads or interruptions in the sampled routes. Retain negative results and limitations. Current automated ownership/package tests establish code properties, not these model outcomes.
