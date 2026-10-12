#!/usr/bin/env node
// Static package checks: required files, local Markdown links, JSON/JS syntax, upstream map, roles, adapters, examples, scenarios.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseState, validateState } from './lib/core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const need = (cond, msg) => { if (!cond) problems.push(msg); };
const rd = (p) => readFileSync(path.join(root, p), 'utf8');

const UPSTREAM = ['using-superpowers', 'brainstorming', 'writing-plans', 'executing-plans', 'subagent-driven-development', 'dispatching-parallel-agents',
  'test-driven-development', 'systematic-debugging', 'verification-before-completion', 'requesting-code-review', 'receiving-code-review',
  'using-git-worktrees', 'finishing-a-development-branch', 'writing-skills', 'diagnosing-superpowers'];
const ROLES = ['risk-taker', 'home-base-builder', 'time-conscious-player', 'completionist', 'newcomer', 'producer', 'research-analyst',
  'progression-designer', 'encounter-designer', 'economy-balance-designer', 'art-director', 'technical-lead', 'playtest-coordinator'];
const REQUIRED = ['SKILL.md', 'README.md', 'QUICKSTART.md', 'VALIDATION.md', 'SOURCES.md', 'references/lifecycle.md', 'references/superpowers-integration.md',
  'references/game-systems.md', 'references/platforms.md', 'references/modes.md', 'templates/project-state.json', 'examples/progression-example.json',
  'evals/README.md', 'evals/scenarios.json', 'scripts/install.mjs', 'scripts/project.mjs', 'ATTRIBUTION.md', 'LICENSE'];

function walk(dir, skip = []) {
  return readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(d => {
    const rel = path.join(dir, d.name);
    if (skip.includes(d.name)) return [];
    return d.isDirectory() ? walk(rel, skip) : [rel];
  });
}

for (const f of REQUIRED) need(existsSync(path.join(root, f)), `missing required file ${f}`);

const mdFiles = walk('.', ['superpowers', 'node_modules', 'validation']).filter(f => f.endsWith('.md'));
for (const f of mdFiles) {
  for (const m of rd(f).matchAll(/\]\(([^)#:]+?\.md)(#[^)]*)?\)/g)) {
    const target = path.resolve(root, path.dirname(f), m[1]);
    need(existsSync(target), `${f}: broken local link ${m[1]}`);
  }
}

for (const f of walk('.', ['superpowers', 'node_modules']).filter(f => f.endsWith('.json'))) {
  try { JSON.parse(rd(f)); } catch (e) { problems.push(`${f}: invalid JSON (${e.message})`); }
}
const testFiles = existsSync(path.join(root, 'tests')) ? walk('tests') : [];
for (const f of walk('scripts').concat(testFiles).filter(f => f.endsWith('.mjs'))) {
  try { execFileSync('node', ['--check', path.join(root, f)], { stdio: 'pipe' }); } catch (e) { problems.push(`${f}: syntax error`); }
}

const integration = rd('references/superpowers-integration.md');
for (const s of UPSTREAM) {
  need(integration.includes('`' + s + '`'), `superpowers-integration.md does not map upstream skill ${s}`);
}
for (const r of ROLES) {
  need(existsSync(path.join(root, 'roles', `${r}.md`)), `missing role brief roles/${r}.md`);
  const claude = path.join(root, 'agents', 'claude', `gds-${r}.md`);
  need(existsSync(claude) && readFileSync(claude, 'utf8').startsWith(`---\nname: gds-${r}\n`), `missing or malformed agents/claude/gds-${r}.md`);
  need(existsSync(path.join(root, 'agents', 'codex', `gds-${r}.toml`)), `missing agents/codex/gds-${r}.toml`);
}

for (const f of ['templates/project-state.json', 'examples/progression-example.json']) {
  try { const r = validateState(parseState(rd(f))); for (const e of r.errors) problems.push(`${f}: ${e}`); }
  catch (e) { problems.push(`${f}: ${e.message}`); }
}

try {
  const ev = JSON.parse(rd('evals/scenarios.json'));
  need(ev.scenarios?.length === 18, `evals/scenarios.json has ${ev.scenarios?.length} scenarios, expected 18`);
  for (const s of ev.scenarios ?? []) need(ev.status_values.includes(s.status), `scenario ${s.id} has invalid status ${s.status}`);
  for (const s of ev.scenarios ?? []) need(s.status === 'not-run' || s.evidence, `scenario ${s.id} has status ${s.status} without evidence`);
} catch (e) { problems.push(`evals/scenarios.json: ${e.message}`); }

const skill = rd('SKILL.md');
need(/^---\nname: gds-superpowers\ndescription: Use when/.test(skill), 'SKILL.md frontmatter must start with name and a "Use when" description');
need(statSync(path.join(root, 'SKILL.md')).size < 12000, 'SKILL.md is over 12 KB; move detail to references/');

if (problems.length) { for (const p of problems) console.error(`  - ${p}`); console.error(`check-package: ${problems.length} problem(s)`); process.exit(1); }
console.log(`check-package: ok (${mdFiles.length} markdown files, ${UPSTREAM.length} upstream skills mapped, ${ROLES.length} roles, 18 scenarios${testFiles.length ? '' : '; tests/ not present in this installed copy'})`);
