<!-- How to use: the scaffolder copies this to docs/gds/README.md. Edit the "Existing authoritative documents" list to point at documents that already live elsewhere in the repository. -->
# docs/gds: project workflow records

Mode label: <superpowers-installed | superpowers-vendored | standalone-degraded>

This folder is the working record for the gds-superpowers workflow. State lives in JSON; reasoning lives in Markdown.

| Path | What it is | Authoritative? |
|------|------------|----------------|
| state.json | Phase, approvals (APR), decisions (DEC), evidence (EV), tasks (T), agent budget, mode label | Yes, for workflow state |
| charter.md | Theme, audience, core contract, pillars, non-goals | Yes, once approved |
| decisions/ | DEC-NNN-<slug>.md, append-only | Yes, once accepted |
| proposals/ | Council and design proposals | No; a proposal is not a decision |
| playtests/ | PT-NNN.md human playtest records | Yes, as evidence of what was observed |
| assets/ | One record per asset, with type and approval | Yes, for asset status and labeling |
| research/ | Research plans and findings | Findings are sourced facts plus labeled inferences |
| handoffs/ | Session handoffs | No; a snapshot, superseded by state |

## Existing authoritative documents
If the repository already has design docs, specs, or plans elsewhere, reference them here by path. Do not copy or duplicate them into this folder.
- <path>: <what it is>

## Rules of the road
- Evidence counts as human-playtest only with real human participants.
- Concept artwork is not a screenshot; only in-engine captures are.
- No code before an approved plan. Never restart the project.
- Changes to the core contract need a recorded, user-approved decision.
