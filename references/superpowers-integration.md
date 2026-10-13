# Superpowers composition

GDS discovery uses [guided interaction](interaction.md): session-derived suggested replies plus custom input, as explicitly requested by its owner. The upstream preference for open questions does not override this GDS presentation contract. Reuse the collected context rather than running another interview; approval and verification boundaries remain unchanged.

Discover relevant installed skills and their actual version through the host's skill interface or inspected local files. The installed implementation is authoritative. The 15-skill map below is the historical compatibility inventory in `upstream-map.json`, not a guarantee about an unseen version; report missing or changed entries.

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

`composed`: invoke the relevant installed procedure and its required resources. `standalone-degraded`: disclose unavailable upstream support and load [the bounded fallback](engineering-fallback.md) only when engineering work requires it. `unverified` is the initial status, not successful discovery.

GDS owns game requirements and human-experience gates; Superpowers owns its engineering process. Reuse one authoritative brief/plan and add game acceptance criteria through references. Preserve distinct specification and quality checks even when one response reports both. Verify results, not confidence. Prototype TDD exceptions require an explicitly approved disposable scope; never silently promote a spike to production.

Respect host controls, repository rules and approved scope. Do not copy upstream hooks, auto-installers, services or telemetry, run competing schedulers, or install dependencies automatically. Reuse valid existing approvals and upstream document locations where required. Consolidating documents does not remove a substantive approval or verification gate.
