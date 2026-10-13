# Adaptive discovery interview

## Source and purpose

This is an independently authored, compact adaptation of BMAD's documented game-type, core-mechanic, prototype, and playtest questioning, extended with hybrid design, visual direction, and GDSuperpowers' progression requirements. Read [BMAD integration](bmad-integration.md) for source boundaries. It does not copy or execute BMAD's full GDD workflow.

## Interaction rules

Ask one question per turn and actually wait for the reply. Lead with what the user is trying to make, not engine setup or a list of administrative choices. Reuse answers from the current conversation and relevant existing documents, including negative preferences. A user can answer several topics at once; record those and skip the corresponding questions.

The optional local helper `scripts/project.mjs next --project PATH` proposes the next unresolved topic from structured state. It is a deterministic suggestion, not semantic understanding or a conversational agent. The assistant can ask a more relevant clarifier instead and should extract structured fields from natural language for the user.

Use the question bank as coverage guidance, not a rigid form. Aim to reach a first-slice proposal after roughly 6 to 10 useful exchanges; this is a soft budget, not a mandatory count. Already-complete briefs need no interview. Ask beyond the budget only for an unresolved detail that materially affects this slice, or when the user wants deeper discovery. Defer late-game details.

For each answer store `value`, `origin`, and `source_ref` in state when file tools exist. Origins are `user`, `imported`, `delegated`, or `assumed`. Source references must refer to actual messages or files. Assumptions are explicitly presented for approval. Do not manufacture a precise message ID when the host gives none; a dated description of the message is acceptable.

## Coverage, asked only as needed

| Topic | What to learn | Example question |
|---|---|---|
| Types and combinations | Primary action plus supporting systems | What kind of game would you like to make, including any genres you want to combine? |
| Player fantasy | Who the player is and what feels compelling | What should playing this game feel like? |
| Repeated action | The activity the prototype must make satisfying | What will the player be doing most of the time? |
| References and anti-goals | Specific liked mechanisms and disliked friction | Which parts of other games would you most like to keep or avoid? |
| Session shape | Goal, danger, ending, restart or continuation | Walk me through how one play session should begin and end. |
| Hybrid boundary | Which type owns which part of the loop | How should the secondary genre change the main activity? |
| Progression | What resets, persists, and unlocks | After a failed attempt, what should the player keep? |
| Camera and space | 2D/3D, perspective, scale, visibility | How do you picture the camera showing the action? |
| Art and feel | Mood, shapes, palette, animation, readability | What visual style and atmosphere should the game have? |
| Delivery and controls | First target device, inputs, session context | Where do you want to play the first prototype? |
| Feasibility | Existing skills, tools, assets, restrictions, budget | What tools or constraints should I preserve as we build this? |
| First slice | One outcome the user can try | What would the first playable version need to demonstrate for you to judge the idea? |

Do not ask all columns at once. Unanswered budget questions never authorize purchases. "Choose the engine for me" permits a recommendation, not silent installation of paid tools. Check present-day primary documentation when comparing software.

## Adaptive branches

Read [genre routing](genre-routing.md). A roguelite deckbuilder needs deck, encounter, and persistence questions, not aiming sensitivity. A platformer needs movement feel and camera behavior, not six currencies. A horror theme need not imply a hunger system. A base with a few upgrade stations is not automatically a full building simulation.

Choose one primary type by its role in moment-to-moment play. The type labels are not a platform list and not a visual-theme menu. Supporting genres contribute bounded mechanics. Define an interaction sentence and a first-slice test for each one. When more than two supporting types are requested, show the workload tradeoff and recommend staging them; do not silently discard any request.

## Controls

- `recommend` or `surprise me`: propose a concrete answer with a reason, mark it delegated or assumed as appropriate, and keep moving. Never assert the user originally chose it.
- `skip`: defer a nonblocking topic. For a blocking choice, propose a clearly labeled assumption to be included in the approval checkpoint.
- `back` or `change X`: update only the affected answer and dependent plan. Record the revision; do not erase the previous approved design. Reapproval is required only for the material delta.
- `ready to build`: stop optional questioning, show the smallest feasible slice and its assumptions, and seek the necessary bounded approval. Do not treat this as authorization to ship or spend.
- `pause`: record the next unanswered topic and stop. Starting again resumes, not restarts.

## Final discovery checkpoint

Show a compact game outline: one-sentence pitch, primary and supporting genres, player actions, short/session/long progression loops, failure rules, visual direction, excluded features, engine recommendation or preserved stack, and a first playable test. Separate the user's choices from assistant assumptions.

For this user's existing roguelite brief, carry forward one-of-three run choices and retained/banked progression without re-asking them. Only ask which combat, theme, camera, or other unanswered direction they now want.

The live BMAD workflow or installed Superpowers skill can require additional approval or a builder check. Reuse this interview's answers and the same brief. Do not restart elicitation just to satisfy a different template.
