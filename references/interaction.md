# Guided interaction

Apply to GDS-owned discovery, brainstorming, design choices and checkpoints. Read once when the first guided interaction is needed. This contract changes presentation, not permissions or verification.

## One decision, useful suggestions, an open door

For **every unanswered brainstorming question**, generate two to four concrete suggested answers from the current conversation, approved direction, recent answers, constraints and relevant research. Three is the normal target. Always provide a custom-answer route. Do not pose a bare question by default, read a fixed answer bank, or recycle generic choices after the topic changes. The coverage prompts in `config/interview.json` identify topics, not prewritten answers.

Write one clear question, short option labels, and one sentence per option explaining its effect on play or production. Discard options that contradict settled preferences. At an empty-project start, offer provisional starting directions, not assumptions about the user's favorite genre. When context arrives, make subsequent suggestions specific to it. Do not reopen answered questions to show a menu.

Users may select a number or label, combine compatible suggestions, qualify one ("2, but without a timer"), or write something entirely different. Preserve qualifications and custom text verbatim as source evidence. Selecting the custom route without supplying text means ask for their description and wait, not guess an answer. If they request free-form discussion or questions without menus, honor that preference until they ask to return to suggestions. Do not trap "Let me explain" inside another choice menu.

## Native choices and text fallback

Prefer the actual host's structured question tool when available and usable. In Claude Code inspect the live `AskUserQuestion` schema. Submit one question, a short header, label/description options, and single selection unless the ingredients can coexist. Use the native Other/custom input when the tool supplies it. Do not add a duplicate Other item or print tool arguments to the user. Avoid preview layouts unless custom input remains available. If the returned answer is empty, cancelled or missing its custom text, wait or ask for that text; do not record consent.

When native input is unavailable, restricted or declined, render the same dynamic choices as a numbered Markdown list and append **Write my own answer** as an explicit last option. A sentence saying "other answers welcome" alone is insufficient. Other hosts must use their actual schema, not a renamed Claude call. Never claim text choices are clickable or alter permissions to unlock a picker. `scripts/choices.mjs` is an optional presentation-only helper; it validates agent-authored cards but does not invent their content, call models, write answers or grant approvals.

Recommend at most one option, with a contextual reason. Subjective taste is not objectively best. Keep the order stable for the same decision. Choose one primary loop before complementary genre ingredients; do not label incompatible alternatives multi-select. These are design-time suggestions, not the game's run-upgrade screen.

## Presentation and decisions

Use `### GDS | Direction`, `### GDS | Build`, or another short stage heading only at meaningful transitions. Ordinary follow-ups need no banner. Prefer bold labels and short paragraphs, with no ANSI color codes, fixed-width boxes, emoji, decorative rules, invented progress percentages or waiting estimates. Use code blocks only for actual code or commands.

For a concept comparison use **Hook**, **Player decision**, **Solo cost**, **Risk**, **Smallest test**. Summarize the strongest tradeoff, not a staged transcript of agents debating. Label actual delegation versus simulated viewpoints accurately.

Close discovery with **Chosen**, **Proposed**, **First playable**. Show scope, exclusions and revision before offering **Approve this slice**, **Revise scope**, **Keep exploring**, plus custom input. Only the actual response approving the shown scope satisfies the existing approval contract. A genre choice, "continue", silence or a recommendation does not.

At completed checkpoints report **Changed**, **Verified**, **Not tested**, and one **Next** action, omitting empty sections. For blockers give the cause, what remains preserved, and the smallest recovery step. Existing global-observer detection is one setup status, not a second launch.

[Examples](../examples/guided-session.md) are illustrations, not a question or answer bank. [Source notes](../review/INTERACTION-SOURCES.md) explain inspiration and deliberate differences. Do not run a second GDS interview inside an upstream skill: use GDS's chosen interaction contract for its own discovery, then hand the approved context to Superpowers.

For the optional `presentQuestion` helper, supply `host: 'claude'` only after verifying Claude's native question interface and custom input. An unspecified host, ChatGPT or Codex returns the text fallback even if generic native-capability flags are true. A different native schema must be used directly through that host's actual tool, never through the Claude payload. ChatGPT without an authoritative local workspace follows [its execution boundary](chatgpt.md).
