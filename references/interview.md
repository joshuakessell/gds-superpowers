# Adaptive discovery interview

This question bank adapts documented BMAD game-design concepts, not its full GDD runtime. Source and attribution boundaries are in [BMAD integration](bmad-integration.md).

## Conversation

Ask one useful unanswered question and wait. Start with the game, not engine setup or administrative choices. Import known answers, negative preferences and facts from the actual conversation and authoritative files. One reply can answer several topics; skip those questions afterward. An adequate existing brief needs no interview.

Use `config/interview.json` as coverage guidance, not a rigid form. The optional `scripts/project.mjs next --project PATH` suggests the next structured topic; it does not understand natural language or supersede the coordinator's contextual judgment. Extract answers for the user rather than making them author JSON.

For each answer record `value`, `origin` (`user`, `imported`, `delegated`, `assumed`) and an actual `source_ref`. A dated message description is acceptable when the host supplies no message ID. Present recommendations as assumptions, never fabricated user decisions. Resolve contradictions with a targeted question, not a restarted interview.

Aim for a first-slice proposal after roughly six to ten useful exchanges, a soft budget rather than a quota. Extend only for a consequential unanswered detail or requested deeper discovery. Defer late-game design. Offer two to four choices only when helpful; open questions and free-form replies remain valid.

## Coverage, only when relevant

| Topic | Decision to establish |
|---|---|
| Types and combinations | Primary moment-to-moment action and the contribution of supporting genres |
| Player fantasy | Who the player is and the intended experience |
| Repeated action | The interaction the prototype must make satisfying |
| References and anti-goals | Specific desired mechanics and unwanted friction |
| Session | Goal, challenge, ending and restart/continuation |
| Progression | What resets, is carried, is secured, persists and unlocks |
| Camera and space | 2D/3D, perspective, visibility, scale and movement |
| Visual direction | Mood, shapes, palette, animation and interface readability |
| Delivery | Initial device, controls and session context |
| Feasibility | Existing skills, tools, assets, restrictions and spending constraints |
| First playable | One testable outcome for judging the concept |

An empty-project opener is: “What kind of game would you like to make, including any genres you want to combine?” Do not ask every topic at once. An unanswered budget never authorizes spending. Engine recommendations require current primary documentation when tool choices matter; recommending is not permission to install.

## Genre branches

Read only applicable parts of [genre routing](genre-routing.md). Choose one primary type and define how each supporting type affects the same core loop. Recommend at most two supporting components unless broader scope is approved; stage extra requests instead of silently dropping them. Theme and visual style are not genre selection.

A roguelite deckbuilder needs deck and persistence questions, not aiming sensitivity. A platformer needs movement/camera questions, not multiple currencies. Horror need not imply hunger; upgrade stations need not become a city simulator. Preserve the active project's approved genre and progression contract. Do not force run upgrades onto unrelated genres or ask again about an established roguelite's already-recorded temporary/banked rules.

## User controls and checkpoint

`recommend` or `surprise me` delegates a proposed answer with a reason. `skip` defers a nonblocking topic; a blocking choice becomes a clearly shown assumption for approval. `back` or `change X` revises only affected answers and dependent scope, preserving prior decisions. Seek reapproval only for a material delta.

`ready to build` ends optional questions and presents the smallest feasible design/plan; it does not itself authorize publishing or spending. `pause` saves the next question and stops; restarting resumes.

Show a compact pitch, primary/supporting types, player actions, session and longer progression, failure rules, visual direction, exclusions, preserved/recommended stack and first playable hypothesis. Distinguish choices from assumptions and use the approval rule in SKILL.md. Reuse these answers if an installed upstream workflow requires an additional builder check; do not duplicate elicitation or project documents.
