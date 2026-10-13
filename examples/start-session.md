# Illustrative interview and loop

This is a proposed interaction, not a recorded live-host test.

**User:** `/start`

**Architect:** What kind of game would you like to make, including any genres you want to combine?

**User:** A roguelite auto-shooter where I salvage a flooded city and restore a floating home base. Three temporary powers to pick from at each level-up, and I choose one. Pixel art, top-down, PC first.

**Architect:** Should the base mainly unlock new equipment and recruits, or should placing buildings also change what you can do during a run?

**User:** Both, but not a complicated city builder. Placing connected workshop modules should unlock synergies.

**Architect:** What should happen to resources still being carried when a run ends in death?

**User:** Banked material stays. Carried material is lost. Blueprints remain once scanned.

**Architect:** What should an ordinary successful run feel like in length and intensity?

The conversation continues only for missing consequential choices, such as direct aiming, visual detail, input, development constraints, and the first playable test. Previously answered top-down, pixel-art, PC, and one-of-three questions are not repeated. Recommendations are identified as such.

## Compact approval checkpoint

The Architect proposes one arena, one weapon, three initial upgrade options, and a small enemy set to test movement and upgrade impact. It summarizes the accepted game direction and this proposed slice, identifies excluded systems, and asks for approval before implementation. Base construction and multiple biomes remain future outline items, not an exhaustive backlog.

## Post-build checkpoint

The Architect reports actual files changed, tests run, remaining issues, launch instructions, and one focused playtest question: "Did any of the three upgrades change how you moved or chose targets?"

It then waits for human feedback. It cannot label a simulated session as your playtest or use a test pass as proof of enjoyment. After feedback, it proposes a specific next slice and preserves the existing work.

When the combat prototype is worth continuing, a complete two-run slice adds banking, death rules, a permanent unlock, and a second run showing the new option. A future home-base interaction can grow from that foundation rather than being built before the combat is tested.
