# Game systems: layered progression and technical rules

## The loop, named precisely

| Term | Meaning | Lifetime |
|---|---|---|
| Base | Where the player prepares, spends retained resources, sees facilities | persistent |
| Run | One attempt from base departure to death or finish | one run |
| Temporary upgrade | One of exactly three offered at a reward moment | resets at run end |
| Loot | Items collected during a run; may or may not be eligible for retention | run, unless secured |
| Retained resource | Explicitly listed in `contract.retainedResources`; survives death when secured by the loss/retention rules | persistent |
| Facility / specialist / route / equipment family | Persistent unlocks funded by retained resources | persistent |

**Family access is not per-run possession.** Unlocking an equipment family makes its members *eligible to appear* in one-of-three offers. It never places the upgrade in the run automatically. Tests must cover this.

## Progression layers (`state.progression.layers[]`)

Each layer records the chain the Progression Designer owes:

```json
{
  "id": "L2",
  "runAchievement": "Reach depth 3 and return with ≥ 20 salt",
  "retainedResource": "salt",
  "requirement": "L1 (Drying Rack) built",
  "unlocks": "Saltworks facility: new equipment family 'brine tools' becomes eligible in offers",
  "interactsWith": ["L1"],
  "verifyTest": "tests/progression/saltworks.test.ts",
  "cost": { "resource": "salt", "amount": 20 }
}
```

Validator rules (`scripts/lib/evidence.mjs`): every field present, `interactsWith` names known layers, `cost.resource` non-empty, `cost.amount` a positive integer. Design four layers before `design` approval; each later layer must interact with an earlier one.

## Loss and retention rules

Write them as a table in the design decision: for each resource, what happens on death, on finish, on early exit, and on bank/secure action. The Risk Taker, Home-Base Builder and Time-Conscious Player must each read it and object at least once in council before it is approved.

## Technical rules (Technical Lead)

- Seeded, deterministic RNG for runs; the seed is logged with every playtest build id.
- Save format versioned from the first slice; retained resources and facilities are the only persisted gameplay state.
- Every layer, every loss/retention rule, and the one-of-three offer generator have tests named in state before implementation.
- Telemetry hooks (offer shown, offer chosen, death cause, resource secured) exist in the slice so balance has data; telemetry is not playtest evidence.
- Performance budgets are stated in the charter and checked in `review`.
