<!-- How to use: the Game Architect writes one packet per bounded task and hands it to an implementer. Do not dispatch without an approval reference. The implementer may write only inside the owned paths. Record the dispatch against the agent budget in state before sending. -->
# Task packet: <T-NNN> <short title>

Mode label: <superpowers-installed | superpowers-vendored | standalone-degraded>
Task id: <T-NNN>
Depends on: <T-NNN, ... | none>
Approval reference: <APR-NNN> (required; do not proceed without one)
Plan reference: <path to approved plan and step>
Dispatch recorded in state: <yes, budget used N of M>

## Owned paths (write lease)
- <path or glob the implementer may create or edit>

## Forbidden paths
- <path or glob that must not be touched>
- docs/gds/state.json (the Architect updates state)

## Behavior to implement
<Approved behavior in plain terms, with concrete examples and edge cases.>

## Failing test to write first
- Test file: <path>
- Test name(s): <names>
- Expected failure before implementation: <message or reason>

## Verify command
```
<exact command>
```
Expected result: <e.g. all tests pass, exit 0>

## Report format
Reply with: files changed, test output (tail), deviations from the packet, open questions. Do not claim success without the verify command output.

## Receipt (filled by the implementer or Architect on return)
- status: <started | completed | blocked | failed> (completed requires non-empty evidence)
- evidence: <command output summary or path to log>
- at: <YYYY-MM-DDTHH:MM>
