# Superpowers integration

## Composition, not an imitation

Inspect the runtime's installed Superpowers version and available skill names. The source of truth for upstream behavior is that installed skill, including the references and helper scripts it requires. Load it through the host's actual skill mechanism or a readable verified local path. Do not print invented tool calls.

The inspected main-branch manifest reports 7.0.0, and its README lists the following 15 skills. This is a dated compatibility inventory, not a pinned dependency or assurance that an installed older version has every feature. Record `missing`, `changed`, and `available` for the local installation. Future upstream additions require a conscious mapping update.

| Upstream skill | Preserved responsibility | Game-specific entry |
|---|---|---|
| using-superpowers | Discover the applicable upstream workflow before acting. | Every entry or transition. |
| brainstorming | Resolve intent and alternatives before approving design. | Charter, council synthesis, feature change. |
| writing-plans | Translate approved behavior into small verifiable tasks. | Prototype, slice, production, delta plan. |
| executing-plans | Execute an approved plan in the main context when appropriate. | Sequential fallback or tightly coupled work. |
| subagent-driven-development | Use focused implementers with specification and quality review. | Independent implementation tasks. |
| dispatching-parallel-agents | Delegate separable bounded investigations. | Research, independent design proposals, isolated diagnosis. |
| test-driven-development | Establish failing behavioral tests before production changes. | Game rules, progression, saving, UI behavior. |
| systematic-debugging | Investigate causes and reproduce failures before patching. | Logic, rendering, saves, performance. |
| verification-before-completion | Verify the actual artifact before reporting success. | Every completion claim and release gate. |
| requesting-code-review | Supply the specification, diff, risks, and test evidence. | Task and milestone review. |
| receiving-code-review | Verify findings and act on substance. | Review triage and bounded repair. |
| using-git-worktrees | Isolate approved work without damaging existing changes. | Branch setup and explicitly separate work. |
| finishing-a-development-branch | Evaluate integration options and preserve work. | User-approved merge or pull request workflow. |
| writing-skills | Evaluate and revise reusable process instructions. | GDSuperpowers self-test and skill improvements. |
| diagnosing-superpowers | Investigate workflow failures with evidence and redaction. | Missed steps, context drift, agent protocol failure. |

## Precedence and avoiding duplicate work

Respect the host's instructions, security controls, repository rules, and user-approved scope. GDSuperpowers owns game-specific requirements, milestones, and the player-experience evidence gate. Superpowers supplies its engineering procedure. Existing specifications and plans remain authoritative; link the game-specific acceptance criteria into them instead of generating competing plans.

Use one task ledger and one owner. If upstream tooling already owns a ledger, reference it from `docs/gds/state.json`; do not run a second scheduler or claim two sources of task status. Use worktrees only when the installed workflow and project constraints support them. Record their location and ownership.

Do not duplicate upstream session hooks, auto-installers, visual-companion servers, commands, or telemetry behavior. Their presence, permissions, and opt-outs remain properties of the independently installed dependency. Any optional tool with network access or expense needs the user's authorization.

## Modes

`composed`: relevant installed skills are available; invoke and follow them. Record version and local references when verifiable.

`standalone-degraded`: upstream is missing or unreadable. Disclose that fact. Use the game-design modules and the local engineering checklist. Do not claim the entire upstream implementation, support scripts, or hooks are included. Offer the official upstream installation route when needed, without fetching or executing it automatically.

`unverified`: discovery has not completed. This is the initial state, never a success state.

## Review adaptation

Preserve specification compliance and code quality as distinct checks even when one upstream task-review response contains both. For consequential systems, prefer fresh isolated reviewers for the two checks. A game-experience review adds readability and observed-play criteria; it never replaces either engineering check.

Approved prototype exceptions to production TDD must be explicit, bounded, disposable, and recorded. Never invoke TDD rhetoric to delete user work or uncommitted changes. New production behavior still requires its own failing tests.

## Quick Flow Lite document policy

The user explicitly prefers minimal documentation. Reuse one brief and one current plan where the installed skill permits user-chosen locations and risk-proportional scope. Do not copy the same content into a GDD, architecture document, charter, sprint file, and Superpowers specification. If an installed skill requires a distinct approval or verification step, perform it and retain a concise evidence pointer. Lightweight records never authorize skipping tests, review, or a substantive safety boundary.

Read the current installed brainstorming instructions: they can distinguish a quick clear task, a small change, a written-design project, and a user-approved disposable spike. A single universal full-project ceremony is not assumed. No spike is silently promoted to production.
