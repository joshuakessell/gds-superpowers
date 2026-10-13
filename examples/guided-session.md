# Illustrative guided interactions

These are examples of presentation, not fixed answers to reuse. Generate choices afresh from the live session. In Claude Code, use its real question picker with native custom input when supported; the numbered examples show the text fallback.

## After the user chooses underwater salvage, short runs and a persistent workshop

### GDS | Run rewards

**How should a risky salvage trip pay off back at the workshop?**

1. **Bank at dive bells**: Deposit parts mid-run, then decide whether to push deeper with the remaining cargo.
2. **Keep research, risk cargo**: Blueprints survive death, while loose metal must reach an extraction point.
3. **Rescue your previous haul**: A failed run leaves a recoverable cache on a later dive, creating an optional recovery objective.
4. **Write my own answer**: Describe a different rule or modify one of these.

Choose a number or label, combine compatible ideas, or write your own answer.

## After the user replies "2, but base-building materials should always survive"

Research and building supplies will survive; optional equipment remains at risk.

**What should the first workshop improvement change about your next dive?**

1. **New equipment family**: Unlock electrical tools in later upgrade offers without granting a permanent run build.
2. **A safer return route**: Add a one-use retrieval buoy that protects one selected item.
3. **A recruited specialist**: Rescue an engineer who opens a new starting loadout and related objectives.
4. **Write my own answer**: Add a different workshop benefit or adjust a suggestion.

The second question builds on the custom qualification instead of repeating the banking question.

## Different context produces different suggestions

For a cozy, turn-based woodland puzzle game, the same presentation contract might ask:

**What should helping a woodland resident unlock?**

1. **A new puzzle rule**: Learn to redirect roots in later clearings.
2. **A companion ability**: Invite a firefly that reveals concealed paths.
3. **A changed home clearing**: Restore a landmark that opens an optional puzzle chain.
4. **Write my own answer**: Describe another kind of reward.

Do not inject banking, death or run upgrades merely because an earlier example used them.

## Visual direction after top-down gameplay is selected

### GDS | Visual style

**What should make objects and threats readable in the underwater setting?**

1. **Graphic silhouettes**: Strong shapes and restrained lighting make hazards clear at a glance.
2. **Detailed pixel art**: Rich salvage textures support exploration, with extra work to preserve contrast.
3. **Painted cutouts**: Layered illustrated shapes favor atmosphere, with a consistent outline for interactable objects.
4. **Write my own answer**: Reference another style or combine specific elements.

These suggestions are not generated artwork or an engine recommendation. Offer actual visuals only through available tools when requested or authorized.

## Shown-scope checkpoint

### GDS | First playable

**Chosen:** Top-down movement, blueprints and building supplies retained after a run.

**Proposed:** One arena, two enemy patterns and six temporary upgrades. No full base construction yet.

**First playable:** Two runs, one workshop purchase and a visible new equipment possibility in the second run.

**Scope:** `docs/gds/next.md`, revision 2. Excludes new dependencies, spending and publication.

1. **Approve this slice**: Approve the shown revision for implementation within its exclusions.
2. **Revise scope**: Change the proposed mechanics or boundaries first.
3. **Keep exploring**: Continue designing without approving implementation.
4. **Write my own answer**: Specify a revision, question or pause.

Only a real response approving the shown scope is authorization. The helper never turns a design preference into approval.

## Existing global observer

### GDS | Observer

**Provider:** Existing global Task-Observer detected.

**GDS capture:** Disabled. No bundled companion or extra GDS startup rule is enabled.

**Next:** Continue using the existing observer under its own configuration. An explicit `/gds-superpowers observe` hands off to that same owner once, after inspecting its actual instructions.

Detection does not prove that the global observer ran, that independent hooks are enabled, or that its log is compatible. If its entry is unreadable or changes, report the blocker rather than enabling a fallback copy.
