# Superpowers integration

GDSuperpowers does not rewrite the Superpowers engineering workflow. It routes to it. Resolution order, checked at startup and recorded in `state.mode`:

| `state.mode` | How resolved | How to invoke a skill |
|---|---|---|
| `superpowers-installed` | The `Skill` tool lists `superpowers:<name>` entries | `Skill("superpowers:<name>")`, always preferred: the plugin's hooks and version are the user's |
| `standalone-degraded` | Neither | Follow the "Degraded fallback" column below and label every artifact `standalone-degraded` |

The map below was written against the Superpowers 6.4.1 skill set and checked against the upstream README's skill list at 7.0.0. It is a compatibility observation, not a tested guarantee or a version pin. Install Superpowers from its official source: https://github.com/obra/superpowers (MIT, Jesse Vincent). See `ATTRIBUTION.md`.

## Complete 15-skill map

| Upstream skill | GDS modes that route to it | Degraded fallback |
|---|---|---|
| `using-superpowers` | startup of every mode | Read the Invariants in SKILL.md; announce "Using gds-superpowers (`<mode>`) to <purpose>" |
| `brainstorming` | `concept`, `design`, `council` (before proposals) | Ask one question at a time; write the design to `docs/gds/decisions/` before any plan |
| `writing-plans` | `plan`, `pivot` (delta plan), `expand` | Produce a task-packet per task from `templates/task-packet.md`, each with a failing test named first |
| `executing-plans` | `build` when no `Agent` tool | Execute packets in order, one review at the end, record receipts |
| `subagent-driven-development` | `build`, `slice` when an `Agent` tool exists | Not available; fall back to `executing-plans` row |
| `dispatching-parallel-agents` | `council`, `research` with independent questions | Sequential in-thread passes, labeled per Delegation honesty |
| `test-driven-development` | every packet in `build`, `prototype`, `slice`, `balance` tuning | RED → GREEN → REFACTOR, test file path recorded in the receipt |
| `systematic-debugging` | `debug` | Reproduce → isolate → root cause → fix → verify; no fix before a reproduction |
| `verification-before-completion` | `review`, `ship`, end of every `build` | Run the verify command, paste output, only then claim |
| `requesting-code-review` | `review` (quality review stage) | Self-review against the packet's behavior list; say it was a self-review |
| `receiving-code-review` | `review` after feedback | Verify each comment technically before acting |
| `using-git-worktrees` | `build` with parallel writers | Serialize writers instead |
| `finishing-a-development-branch` | `ship` | Present merge / PR / keep options; never merge unasked |
| `writing-skills` | `self-test`, extending GDS | Test the change with a baseline scenario before editing, document the result |
| `diagnosing-superpowers` | `self-test` when a session went wrong | Timeline the session from state receipts and decisions |

## What GDS never does with Superpowers

- Copy its hooks or session-start injection.
- Claim an abbreviated summary is the skill. If the plugin is absent, the mode is degraded, and the degraded column is a stand-in, not the skill.
- Create a competing spec or plan when one already exists under `docs/superpowers/` or `docs/plans/`; reference it.
