# Genre and hybrid routing

This is a curated question set, not a claim to implement every BMAD template. Custom types are welcome. Choose a primary type, explain any supporting type's contribution, and prototype the shared interaction. Use source-backed research for factual comparisons with named released games.

| Type or component | Ask only as relevant | First small test |
|---|---|---|
| Roguelite / roguelike | Run end, reset/persistence, reward cadence, pool eligibility, risk, retry | One attempt, a choice, an ending, and the next attempt |
| Survivors / arena action | Manual or automatic aim, crowd pressure, movement skill, target selection | One crowd encounter and one build-changing reward |
| Action / shooter | Movement, aim, attack commitment, enemy tells, input device | One weapon and two readable threats |
| Deckbuilder / card combat | Hand/draw/discard, costs, permanent card access versus run deck | One encounter and one card reward |
| Turn-based tactics | Turn/action economy, positioning, threat preview, squad control | One small tactical encounter |
| Base-building / management | Spatial placement versus facility menu, resources, bottlenecks, offline state | One investment changing the next action |
| Platformer / metroidvania | Jump/dash feel, collision, camera, checkpoints, ability gating | One traversal challenge and one unlocked route |
| Survival / crafting | Actual survival pressure, gathering cost, recipe discovery, loss | One resource decision under pressure |
| Horror | Vulnerability, resource scarcity, information, sound/light, comfort limits | One threat with controllable tension |
| Narrative / RPG / visual novel | Player agency, story delivery, stats, consequence scope | One choice with visible consequence |
| Puzzle | Rule discovery, failure/retry, hinting, solvability, uniqueness | One teachable rule and a variation |
| Strategy / tower-defense | Planning time, resource flow, placement, routes, wave feedback | One wave with two viable approaches |
| Rhythm | Timing windows, input calibration, audio rights, feedback | One short calibrated beat sequence |
| Racing / sports | Movement model, scoring, opposition, camera, control feel | One short course or scoring interaction |
| Sandbox / simulation | Player goals, simulation boundaries, saving, failure model | One understandable system reacting to player action |
| Custom | Dominant player verb, source of challenge, session shape | One repeated interaction with observable results |

Multiplayer is a delivery/architecture decision, not automatically required by any genre. Only ask network-authority, lobbies, persistence, moderation, or matchmaking questions when multiplayer is requested. Explain the solo-production cost before approving that scope.

## Combining genres without combining entire games

Assign each component a role: moment-to-moment action, run structure, progression, interaction model, or presentation. A cozy tone or pixel-art style belongs to presentation, not to a second simulation system.

Example, not an approved design: roguelite run structure + survivors combat + a facility-based home hub. The combat earns run choices and loot; the hub spends secured loot to unlock new build options. There is one shared economy and one world. Do not add worker schedules, housing satisfaction, farming, or multiplayer solely because "base-building" was mentioned.

For each component record: included mechanic, excluded mechanics, interaction with the primary loop, content cost, and first-slice proof. New components either replace something in the scope budget or require approval for expansion.

## Visual branch

Decide spatial representation and camera independently from art treatment. A 3D game can have a pixelated rendering style. Learn mood, palette constraints, silhouettes, UI density, animation expectations, target screen/input, and asset-production method just in time. Show labeled alternatives only when visuals would help and tools are available. Approve one direction, then reuse its parameters rather than regenerating the art style for each scene.
