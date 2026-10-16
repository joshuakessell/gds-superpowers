# PR #2 compatibility verification

Verified on October 16, 2026. Original PR head: `a3b630792f024a830f11f2dd772f45ee8377d590`; base: `9fffe38ddbf8fc962f2e4149298c8a2eee4625a0`.

## Implemented behavior

- Claude, Codex and ChatGPT have explicit invocation and capability guidance. Native choice payloads use the actual host schema; unknown hosts, restricted modes, unsupported option counts and multi-selection fall back to the complete numbered menu with custom input. Async defaults, empty returns and timeouts do not constitute answers or approval.
- Global Task-Observer discovery covers Claude skills/legacy commands and Codex's `.agents` and configured/legacy `.codex` personal skill roots. A global capture owner suppresses additional bundled capture and project startup. A global GDS Lite entry receives one handoff without delegating to itself.
- Exact known historical bytes recover pre-receipt user ownership. Current receipts remain strict, preserve actual installed companion bytes, tolerate canonical linked paths for read-only resolution, and report missing or modified owned companions as bundled blockers. External files and hooks are preserved.
- Fresh discovery and classification are checked immediately before installation writes. The regression test simulates an external edit during planning and verifies refusal without project writes.
- The original PR head is a recognized immutable upgrade baseline. CI now runs package integrity checks and the full test suite on Node 18 and 24.

## Independent review evidence

Reviews ran using installed Claude Code 2.1.301 and Gemini CLI 0.33.1, through their configured accounts. Returned model identities were `claude-fable-5-1` and `gemini-3.1-pro-preview-customtools`. Claude had no tools and no MCP servers; Gemini used read-only plan mode and no extensions, and reported zero tool calls. Neither reviewer edited the checkout. These are executed CLI source reviews, not GitHub human approvals or native UI tests.

Claude's initial review requested ownership, preserved-byte and missing-companion fixes. Those were implemented and regression tested. Gemini's initial project-ownership finding assumed project bindings contained a user-only receipt; the executable counterexample passed, and Gemini explicitly accepted the rebuttal. Corrupt existing configuration still refuses before writes, now with a clearer diagnostic.

The full revised review input SHA-256 is `67ba40e6037899998b9e78fb8ec9cbe9aea77e25fd10fe4cc5cfcd311213497c`. The fresh-discovery correction and path-portability cleanup were reviewed by both engines, then included in the final re-review. Receipt-owned modifications now block reinstallation without changing preferences or rules. The guide explicitly limits upgrades to coordinator/helper files and documents the separately reviewed migration needed for an older preserved companion. Installer output discloses project-level suppression of GDS auto capture when a global owner is used. Both full revised reviews returned PASS. The final receipt-inheritance delta (SHA-256 `53b5a76bd5812ce06e918a7b2d72050b6b4dd135c3f1eee7e6c9f52294a87f04`) was also sent to both engines; its outcomes are recorded in the PR description. Project status and installation now honor the home ownership receipt, and changing the selected observer name reports an existing owner as not selected rather than missing.

## Verification

- `node --test tests/*.test.mjs`: 279 passed, zero failed on Node 24.19.0/macOS.
- `node scripts/check-package.mjs`: source integrity, local links, JavaScript syntax, templates, role adapters and scenario catalog passed.
- Skill Creator `quick_validate.py`: skill valid.
- Four actual clean-source upgrade cases: main `9fffe38` and PR head `a3b6307`, each in project and user scope, each for both Claude and Codex. All eight installed layouts passed their package checker and retained automatic eligibility. No live user skills were installed or activated.
- A real Claude instruction-only brainstorming smoke returned four underwater-workshop suggestions plus custom input, preserved the stated resource rules, and did not claim repository work or build approval. This was one text-only case with supplied instructions, not native skill discovery or a UI test.
- The original local checkout contained unrelated build archives and a nested worktree that failed strict source-manifest checks. Validation used a separate clean worktree; those unrelated files were preserved.

## Limits

The Codex CLI smoke failed before model execution: CLI 0.151.0 rejected the configured `gpt-6-astra` model as requiring a newer CLI. The CLI and account configuration were not changed. No successful Codex runtime smoke is claimed.

Native Claude/Codex question controls, ChatGPT skill installation, asynchronous UI submission, actual observer capture and human gameplay remain untested. Tests validate helpers and installation policy; they do not certify model compliance or native rendering. Older preserved global instructions that cannot accept a single-owner handoff block rather than being rewritten. GitHub Actions results for the exact pushed commit must be successful before merge.

Invocation documentation was checked against [OpenAI skill guidance](https://learn.chatgpt.com/docs/build-skills), [OpenAI plugin skills](https://developers.openai.com/plugins/build/skills), and [Claude Code skills](https://code.claude.com/docs/en/skills). Current tool schemas and mode restrictions remain authoritative.
