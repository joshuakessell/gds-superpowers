# BMAD and Open GSD integration boundaries

## Default: adapted Quick Flow

The default uses independently authored prompts informed by BMAD Game Dev Studio's official documentation. BMAD installation is NOT required for the local interview and loop. This is not a vendored copy of BMAD's full workflow engine, and it is not an official BMAD module.

| Source concept | Local integration | Deliberately omitted by default |
|---|---|---|
| Quick Prototype | Core action, goal, obstacle, smallest playable hypothesis | Full-game specification before testing |
| Quick Dev | Bounded implementation, review, actual play feedback | A parallel mandatory sprint system |
| Optional Quick Spec | Compact risk-driven specification inside current plan | A separate specification for each small tweak |
| Game-type templates and hybrid selection | Conditional question branches and primary/supporting roles | Generating every template section |
| Game brief and visual/UX direction | One canonical game brief with compact visual and input rules | Multiple competing design bibles |
| Open GSD milestone loop | Discuss/plan/build/verify, durable state, bounded continuation | Installing an extra runtime, graph, queue, or scheduler |
| Superpowers | Installed engineering skills, tests, review, debugging, verification | Forking hooks or pretending a checklist is the full upstream |

BMAD's official Quick Flow documentation explicitly describes solo and small-team use with minimal documentation. The heavier epic/sprint path is Full Production. This package builds on the former; it does not assume BMAD only supports large teams.

## Optional: discover installed native workflows

Run the read-only helper:

```bash
node scripts/bridge.mjs --project /absolute/path/to/game
```

It looks only in known project-local BMAD and host-skill roots, skips symlinks, bounds reads, and reports candidate paths for quick-prototype, quick-dev, quick-spec, and relevant genre or design material. A filename match means only "candidate found". It does not prove availability, compatibility, installation version, or successful execution.

Inspect the candidate's actual instructions, dependencies, template/output requirements, and authorization before using it. Confirm the host's registered command instead of inventing a slash name. The official tutorial and current repository README use somewhat different entry examples, so the local installation is authoritative.

For an explicitly requested native BMAD workflow, use its real registered skill or verified local workflow entry. Pass the approved compact brief and current slice as context. Do not restart the interview. If the native workflow mandates significantly heavier outputs, explain that difference and request scope approval, or stay in adapted mode. Do not claim native execution when only its documentation was consulted.

Never invoke BMAD and Superpowers as two competing end-to-end coordinators. GDSuperpowers owns the current game milestone and record pointers. A selected native BMAD task supplies bounded game guidance; Superpowers owns the engineering procedure. One integration owner reconciles their outputs.

## Source observations

Sources were inspected on October 11, 2026. Upstream docs and main branches can change. The official docs list differing game-type counts from the repository README, so this package makes no fixed total-count claim. No BMAD source tree was vendored or native BMAD host session run in the authoring environment. `SOURCES.md` records the exact primary documentation used.

No Open GSD runtime is installed by this package. Its ideas inform small milestones and durable handoffs, without adopting marketing claims about eliminating all context errors. No third-party agent or app is claimed to run unless the active host reports it.
