# Guided interaction: inspected sources and intentional differences

Inspected October 13, 2026. Independently authored presentation guidance, not vendored upstream workflows. Source measurements and this review do not certify model behavior.

| Source | Inspected file / blob | Pattern adapted |
|---|---|---|
| Superpowers | `obra/superpowers/skills/brainstorming/SKILL.md`, blob `22b98fc5bac68d46bc8f066df90155aa3815262d` | Concrete questions, matching user vocabulary, reflecting understood intent, separating assumptions from decisions |
| OpenGSD | `open-gsd/gsd-core/gsd-core/references/questioning.md`, branch `next`, blob `14a03db3873a70ea48655154eba8974dde13fce4` | Contextual options with labels/descriptions, modified suggestions, genuine free-text escape |
| OpenGSD | `gsd-core/references/ui-brand.md`, blob `8a70a0e56c5413fd2d6a5e79b660851f8270427e` | Responsive Markdown headings, consistent checkpoint labels, actionable recovery |
| BMAD Game Dev Studio | `bmad-code-org/bmad-module-game-dev-studio/src/workflows/1-preproduction/gds-brainstorm-game/SKILL.md`, blob `05666519b91b8d173fc0e94fd623115c7e501b49` | Game-specific facilitation and waiting for user input at decisions |
| BMAD step | `steps/step-01-init.md`, blob `c7856e935cbb09ef42219e7e96686c253a6e2467` | Explicit next action and understandable menu choices |

The current Superpowers brainstorming text prefers open questions and short menus when the user is stuck. GDS deliberately differs: its owner explicitly requests dynamic suggested answers plus a custom option during brainstorming. The suggestions derive from the current session, not a fixed list. Preserve free-form mode when the user asks for it. A GDS discovery exchange should not be duplicated by an upstream interview.

Do not copy upstream mandatory greetings, 100-idea quotas, fixed stage banners, decorative symbols, duration estimates, large production paperwork or different approval-waiver policies. Those are not required to deliver this requested presentation.

Claude input reference: https://code.claude.com/docs/en/agent-sdk/user-input . The documented AskUserQuestion shape includes question/header/options/multiSelect; actual host tools and their limits are authoritative. Use native Other where supplied, or an explicit text custom-answer option. Keep prompting in the coordinator rather than assuming children can ask the user. The helper is only a candidate payload builder, not a host integration or SDK installation.

Codex skills reference: https://developers.openai.com/codex/skills . Discover actual input-tool availability and schema at execution; no custom native picker or bare /start is promised. Do not change host settings or permissions merely to obtain a picker.

No model behavior, token-cost reduction, richer terminal styling or live observer initialization is certified by source review or JavaScript tests. Follow `evals/INTERACTION-SMOKE.md` for host checks before making those claims.
