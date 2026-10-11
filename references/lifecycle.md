# Lifecycle: phases, gates, and what each phase produces

Phases advance only through recorded approvals (`state.approvals[]`, `APR-` ids, each with a `ref` to the approved document). `node scripts/project.mjs check` fails when a phase lacks its gate.

| Phase | Entry gate (approval subjects) | Produces | Exit evidence |
|---|---|---|---|
| `charter` | none | `docs/gds/charter.md` (theme, audience, contract, pillars, non-goals, success evidence) | user approval `charter` |
| `research` | `charter` | `docs/gds/research/` plans and findings with fact / inference separated | sources cited; open questions listed |
| `concept` | `charter` | theme coherence pass, visual-bible draft, first council on the base/run loop | decisions recorded |
| `design` | `charter` | approved loop, loss/retention rules, progression layers in state | user approval `design` |
| `prototype` | `charter` | smallest playable experiment of one hypothesis | ≥1 `human-playtest` evidence entry |
| `slice` | `charter`, `design` | one vertical slice: base → run → one-of-three → death → retained resource → facility | playtest evidence + passing tests |
| `production` | `charter`, `design`, `plan` | tracked task packets, receipts, reviews | all packets have receipts with evidence |
| `polish` | `charter`, `design`, `plan` | balance passes, art cohesion audit, onboarding fixes | playtest evidence per change |
| `ship` | `charter`, `design`, `plan`, `ship` | release checklist, verified build, honest availability statement | verification output pasted |

## Rules that hold across phases

- **Never skip a gate by relabeling.** A "prototype" that touches production code paths is production work and needs the production gate.
- **Evidence beats sequence.** A phase may be revisited; a decision recorded as `supersedes: DEC-xxx` keeps the trail.
- **Pivot at any phase** via `pivot` mode: inventory → KEEP / CHANGE / ADD / REMOVE / DEFER → delta plan → approval → build. Existing implementation is preserved by default.
- **Handoff is a document**, `templates/handoff.md`, not a verbal summary.
- **Platform targets are "intended"** until a build is verified on them.
