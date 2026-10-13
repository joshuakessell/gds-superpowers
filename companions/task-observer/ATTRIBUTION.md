# Attribution and adaptation notice

**Original work:** Task Observer / One Skill to Rule Them All.

**Original author:** Eoghan Henn / Rebelytics, with contributors credited in the upstream repository.

**Original source:** https://github.com/rebelytics/one-skill-to-rule-them-all

**Author's project page:** https://www.rebelytics.com/task-observer/

**License:** Creative Commons Attribution 4.0 International (CC BY 4.0).
License deed: https://creativecommons.org/licenses/by/4.0/
Legal terms: https://creativecommons.org/licenses/by/4.0/legalcode
Upstream license: https://github.com/rebelytics/one-skill-to-rule-them-all/blob/main/LICENSE.txt

**Changes in this adaptation, October 11, 2026:** independently rewritten compact instructions; game-development checkpoints and signals; project-scoped state storage instead of the upstream log architecture; explicit single-writer and deduplication rules; read-only staged comparison; no scheduled review or session hook installation; explicit preservation of an existing installation; Claude/Codex packaging. This is not a verbatim copy or a complete implementation of upstream Task Observer. The upstream SKILL.md inspected via the web reported version 3.6.0. Its exact commit and the user's August 24 installation were not inspected locally or matched.

**Adaptation:** GDSuperpowers contributors, Task-Observer Lite 0.3.1. The companion instructions, reference guides, examples, and metadata are provided under CC BY 4.0. Retain this notice and the source/license links when sharing adapted material, and identify further modifications. The original author has not endorsed this adaptation.

The new JavaScript helpers are independently authored and covered by the root GDSuperpowers MIT license, reproduced in `scripts/LICENSE`. No upstream helper scripts, observation logs, or user configuration are redistributed. The broader GDSuperpowers package retains its existing license except where this notice identifies the CC BY material.

Version 0.3.1 further changes activation to explicit installation-time automatic/manual selection, preserves one-time manual invocation, and timestamps explicit project on/off preferences. Startup configuration and optional prompt submission remain distinct from live execution.
