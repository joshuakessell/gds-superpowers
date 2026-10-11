# Specialist Roles

The main conversation is always the Game Architect. These 13 roles are consulted or dispatched only when relevant, and every dispatch is recorded against the agent budget. Never use all of them at once. Roles return text to the Architect and never edit files; the Architect files results under `docs/gds/`.

Subagent definitions: `agents/claude/gds-<slug>.md` (Claude Code) and `agents/codex/gds-<slug>.toml` (Codex).

| Slug | Title | Group | Purpose |
|---|---|---|---|
| [`risk-taker`](risk-taker.md) | Risk Taker | player | Argues for high-variance upgrades, deeper runs, and against safe dominant loops. |
| [`home-base-builder`](home-base-builder.md) | Home-Base Builder | player | Argues for legible retention, purposeful facilities, and long-term base plans. |
| [`time-conscious-player`](time-conscious-player.md) | Time-Conscious Player | player | Argues for 20-minute sessions, clean stopping points, fast re-entry, no grind. |
| [`completionist`](completionist.md) | Completionist | player | Argues for clear tracking, fair collection, and no missables. |
| [`newcomer`](newcomer.md) | Newcomer | player | Argues for readability, onboarding, and failure that teaches on a first run. |
| [`producer`](producer.md) | Producer | specialist | Challenges cost, schedule, and scope; asks what gets cut. |
| [`research-analyst`](research-analyst.md) | Research Analyst | specialist | Researches comparable games, market, and mechanics with cited sources; separates fact from inference. |
| [`progression-designer`](progression-designer.md) | Progression Designer | specialist | Designs layered unlocks as full chains from run achievement to verifying test. |
| [`encounter-designer`](encounter-designer.md) | Encounter Designer | specialist | Designs run structure, enemies, pacing, and the one-of-three reward moments. |
| [`economy-balance-designer`](economy-balance-designer.md) | Economy & Balance Designer | specialist | Defines resource flows, costs, loss and retention rules, tuning knobs, and telemetry. |
| [`art-director`](art-director.md) | Art Director | specialist | Holds one visual bible across all systems; labels mockups versus captures. |
| [`technical-lead`](technical-lead.md) | Technical Lead | specialist | Checks engine and architecture fit, test strategy, performance budgets, and engineering-loop entry. |
| [`playtest-coordinator`](playtest-coordinator.md) | Playtest Coordinator | specialist | Designs human playtests and observation protocols, records evidence, blocks unobserved claims. |

**Groups.** `player` roles argue from how a player experiences the game. `specialist` roles argue from production and craft. Player opinions are persona views, not playtest evidence.
