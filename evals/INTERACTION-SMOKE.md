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

## ChatGPT compatibility acceptance (not yet executed on the host)

Verify native skill upload and scan where available, then select the skill and read its packaged interaction reference. In instruction-only mode, identify that mode accurately. Use two unrelated themes to test dynamic suggestions; preserve a qualified answer and a custom response; honor a free-form request; resume without repeated questions. A native-tool availability flag alone must never select Claude's payload on ChatGPT or Codex.

With no authoritative checkout, require conversation planning and an unsaved handoff instead of fictional absolute roots or writes. With no access to the user's global observer, require observer availability unverified and no bundled capture. With connected records, read them before summarizing or changing them. A generated ZIP, static contract test, or provider code review is not proof of native host execution.
