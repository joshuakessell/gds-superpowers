# Skill behavior evaluation

These are runnable-by-a-host evaluation instructions and prepared scenarios, not executed model results. The authoring environment did not expose a live Claude Code/Codex subagent runtime. Local JavaScript tests exercise the installer and structural validators only.

For each scenario in `scenarios.json`, create a fresh session with realistic repository permissions and context. Run a control without GDSuperpowers and a treatment with the relevant skill/modules. Where a scenario is meant to test failure prevention, observe and record the control rather than assuming it failed. Run several independent samples per variant when practical; use the same model settings and source artifacts.

Record actual host/model/version, task prompt, skill revision, delegated job IDs, tool traces, final output, and observed violations. Human-review each case against its required behaviors. Do not substitute keyword matching or a judge model's confidence for inspection. Preserve ambiguous cases and regressions.

An evaluation passes only within the tested context. It does not prove every provider, model, host, or game is supported. Update a failing instruction, rerun the affected cases, and check unrelated cases before promoting a new version.

## Output record

Scenario ID:
Control/treatment:
Host/model/settings:
Actual session or trace ID:
Skill version and inputs:
Observed action and output:
Required behaviors satisfied / violated:
Human assessment and evidence:
Uncertainty:

## Local executable tests

From the package root:

```bash
node --test tests/*.test.mjs
node scripts/check-package.mjs
```

These checks do not launch an LLM, charge a provider, install the skill, or play the game. `VALIDATION.md` records the checks actually performed for this package.

## v0.3.0 Task-Observer additions

Twelve new prepared pressure scenarios bring the set to 42. They cover existing installations, self-modification pressure, fake recurrence, document overhead, denied writes, untrusted logs, stale candidates, unsupported fun claims, preference scope, successful patterns, and disabled observation. These remain unexecuted in a live host. Local Node tests exercise filesystem helpers, not model compliance.
