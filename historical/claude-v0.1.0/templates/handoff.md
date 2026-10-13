<!-- How to use: save as docs/gds/handoffs/<YYYY-MM-DD>-<slug>.md when ending a session or passing work on. A cold reader should be able to continue from this file plus state.json without the chat history. Keep it factual; list only ids that exist in state. -->
# Handoff: <title>

Mode label: <superpowers-installed | standalone-degraded>
Date: <YYYY-MM-DD>
Written by: <role or session>

## Current phase
<charter | research | concept | design | prototype | slice | production | polish | ship>
Agent budget used: <N of M>

## Approved items
- <APR-NNN>: <what was approved>
- <DEC-NNN>: <decision title>

## Blocked items
- <T-NNN or topic>: blocked on <reason / who>

## Open decisions
- <question>, needed by <phase/date>, options: <list>

## Next bounded action
<One action, small enough to finish in one session, with its approval reference.>

## Where things live
- State: docs/gds/state.json
- Charter: docs/gds/charter.md
- Tests: <path and run command>
- Playtests: docs/gds/playtests/
- Build / branch: <branch and commit>

## Do not
- Do not restart the project or discard existing repository work.
- Do not write code before an approved plan exists.
- Do not treat a simulation as a human playtest, or concept artwork as a screenshot.
- Do not claim an agent ran if the runtime could not run it.
- Do not change the core contract without a recorded, user-approved contract change.
