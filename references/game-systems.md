# Profile applicability

Apply the roguelite rules below only when the selected or existing approved game uses that profile. For other types, follow `genre-routing.md`; do not add death, a base, currencies, or temporary run powers by default.

# Roguelite systems and layered progression

## Approved default contract

One protagonist or controlled party enters a run within one cohesive theme. Experience, encounter victories, or milestones trigger a paused reward state presenting three eligible upgrades. The player chooses one, sees a concrete effect, and continues. Temporary powers reset at death or run completion. Other resources survive only under explicit retention rules.

This profile describes the requested game, not a universal definition of the genre. Record any approved changes to offer count, banking, run ending, or persistence in the contract and corresponding tests.

## State ownership

`RunState`: seed, elapsed simulation time, health, experience, offered choices, chosen upgrades, temporary modifiers, cooldowns, companions active this run, carried items, and completed encounters.

`BankedInventory`: secured materials, retained equipment, blueprints, rescue records, and committed transaction IDs. A carried item is not also counted in the bank.

`ProfileProgress`: facilities, research, recruits, discovered routes, unlock flags, selected starting loadout, accessibility settings, and save schema version.

A technical gameplay manual must define the transition between these states for death, victory, extraction, banking, quitting, suspension, crash recovery, and starting a new run. Single-player local saves need not become a server-backed economy.

## One-of-three upgrade rules

Define offer triggers, legal upgrade pool, unlock prerequisites, exclusions, unique choices within an offer, maximum ranks, rarity weights, rerolls, and a deliberate fallback when fewer than three valid options exist. Never hang on an impossible offer or silently duplicate a capped power. Document whether a fallback is a heal, resource, upgrade conversion, or another legal choice.

Show the immediate effect, duration, stacking behavior, tradeoff, and applicable synergy tags. Record the selected offer ID so double input or save/reload cannot apply two rewards. Pause gameplay or specify safe time behavior consistently. Support keyboard, controller, and readable focus states for the approved platform.

Mix modest numerical tuning with behavior-changing powers. Each upgrade needs: stable ID, display copy, eligibility, effect trigger, magnitude, limit, timing, tags, exclusions, visual/audio response, and tests.

## Build grammar

Start with a small vocabulary: triggers (`on hit`, `after dodge`, `on bank`), payloads (damage, barrier, pull, spawn), selectors (nearest, cone, connected, low-health), and modifiers (duration, count, radius). Data-drive combinations that genuinely share semantics; do not build a universal scripting language before a real need appears.

Define effect ordering and limits. For example, an on-hit chain can carry an origin ID, maximum propagation depth, and trigger flags so a chain does not recursively trigger itself forever. Quantify status stacking, cooldown floors, invulnerability behavior, healing caps, and damage rounding. Seed content generation for reproducible scenarios; do not promise full engine determinism without testing it.

## Persistent progression layers

**Layer 1, foundation:** first useful facility, obvious currency purpose, a modest permanent improvement, and a new choice.

**Layer 2, specialization:** alternative starters, equipment families, specialists, and branching facility investments.

**Layer 3, combination:** unlocks that connect existing systems, such as banking enabling a crafting choice that changes which run upgrades become eligible.

**Layer 4, mastery:** optional challenge routes, build-specific objectives, advanced variants, and cosmetic or strategic rewards.

Distinguish vertical power from horizontal opportunity. Cap mandatory numerical growth and protect early-run viability. Do not auto-scale away every benefit or make defeats compulsory to fund basic playability.

## Interaction ladder

A proposed pattern:

Optional elite defeated → blueprint secured → workshop constructed → new run-upgrade family enters the pool → a synergy satisfies a mastery condition → specialist recruited → alternate starting loadout becomes available → an optional route offers a different risk/reward profile.

Specify each link as a testable unlock rule. A long list of unlocks with no meaningful interaction is not layered progression.

## Resource and banking rules

For each resource record source, quantity rules, purpose/sink, capacity, scarcity, retention (`run-only`, `bank-required`, `always-retained`), and UI explanation. Start with few currencies. Add a currency only when it creates a distinct decision the existing ones cannot express.

Banking must transfer rather than copy inventory. Define the cost or risk of reaching a deposit point, interrupted transactions, capacity, and idempotent handling. On death, compute exactly what is lost and retained, then show a truthful results summary. Avoid punishing players for information the interface never communicated.

## Required engineering scenarios

Test one selection per offer; eligible distinct options; exhausted upgrade pools; capped stacks; interrupted banking; repeated bank acknowledgments; death immediately after banking; save/reload around selection; new-run resets; retained blueprint unlocks; dependency cycles; negative currency; and unsupported save versions. Define an atomic save strategy and recovery behavior suitable for the chosen platform.

## Early example scope

A core prototype can contain one arena, one character, three enemy behaviors, six upgrades, one synergy, and one choice screen. A vertical slice can expand to one biome, one boss, 12–18 upgrades, two facilities, one recruit, and a complete two-run loop. These are adjustable planning budgets, not estimates proven for every engine or mechanic.

Use `templates/progression.json` and `examples/undertow-progression.json` for graph structure. The validator checks reference consistency and cycles, not economic balance or whether a reward feels valuable.
