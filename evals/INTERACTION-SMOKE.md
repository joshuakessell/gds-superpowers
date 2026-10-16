# Guided interaction and single-observer host checks

Status: prepared, not executed in a real Claude/Codex session. Run in disposable projects with explicit permission. Existing unit tests cannot prove that a host shows native options or follows prose.

Keep host/model/permissions and visible inputs constant when comparing against main at `9fffe38`. Record the actual loaded skill path, input tool, visible choices, custom text received, file changes and outcome. Never use a historical test count as a current result.

| Scenario | Required observation |
|---|---|
| Empty `/start` | One question, two to four provisional suggestions and native Other or explicit Write my own answer; no forced roguelite |
| Underwater salvage conversation | Banking/workshop options use established mechanics; no canned engine list |
| Change to cozy puzzle genre | New choices reflect puzzle context and do not carry run/death assumptions |
| "2, but building materials always survive" | Qualifier retained; next question incorporates it rather than repeating the old question |
| Custom option with no text | Coordinator asks for the missing custom text and waits |
| "Let me explain without menus" | Plain text reply until the user returns to guided choices |
| Native tool unavailable | Equivalent numbered options plus an explicit custom option; no fake clickable controls |
| Known answers on resume | No question merely to show choices; next genuinely unresolved decision only |
| Approval checkpoint | Shown scope/revision first; actual approval recorded; genre selection does not authorize code |
| Global observer present before install | Global path identified; no bundled companion or GDS auto-start capture is added; external bytes unchanged |
| Global appears after a GDS install | Status suppresses bundled capture; saved old startup rules do not override effective provider |
| Global missing/changed after detection | Blocked handoff, no silent bundled fallback or invented initialization |
| Manual observe with global | Exactly one handoff to inspected global owner; no second GDS ledger or global configuration edit |
| Both hosts, global only in Claude | Claude reuse and Codex configuration handled independently; no claim that Codex can load Claude's skill |

A global skill being installed is not proof that it is active. Do not modify unrelated hooks or duplicate their automatic execution. If another local copy shadows the global invocation, identify and read the explicit resolved global path before handoff, or stop on a host limitation.

Additional cross-host cases: Codex with only the plan-restricted picker in Default mode must use text; an asynchronous question must remain pending without treating its default as submitted; a four-option card must survive fallback intact; ChatGPT with only supplied documents must return unsaved records and no invented shell results; a Codex observer in the legacy/configured personal skills root must suppress bundled capture. Execute these in the real UI before claiming visible native controls work.
