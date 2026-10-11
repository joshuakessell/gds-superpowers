// Create-only installer planning. Never overwrites, never follows symlinks, never deletes.
import { readdirSync, readFileSync, existsSync, lstatSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const EXCLUDE_DIRS = new Set(['tests', 'validation', 'node_modules', '.git']);
const EXCLUDE_FILES = new Set(['.DS_Store']);

const LAYOUT = {
  claude: { skill: ['.claude', 'skills', 'gds-superpowers'], agents: ['.claude', 'agents'], agentSrc: path.join('agents', 'claude') },
  codex: { skill: ['.agents', 'skills', 'gds-superpowers'], agents: ['.codex', 'agents'], agentSrc: path.join('agents', 'codex') },
};

export function planInstall(opts) {
  const { packageRoot, target = 'both', scope = 'project', project, agents = false, home = process.env.HOME } = opts;
  const root = scope === 'user' ? home : project;
  if (!root || !path.isAbsolute(root)) throw new Error('project (or home for --scope user) must be an absolute path');
  const targets = target === 'both' ? ['claude', 'codex'] : [target];
  if (!targets.every(t => LAYOUT[t])) throw new Error(`unknown target ${target}`);
  const plan = [];
  for (const t of targets) {
    const skillDest = path.join(root, ...LAYOUT[t].skill);
    for (const rel of listFiles(packageRoot)) plan.push(entry(path.join(packageRoot, rel), path.join(skillDest, rel), rel, root));
    if (agents) {
      const srcDir = path.join(packageRoot, LAYOUT[t].agentSrc);
      for (const f of readdirSync(srcDir)) plan.push(entry(path.join(srcDir, f), path.join(root, ...LAYOUT[t].agents, f), path.join(LAYOUT[t].agentSrc, f), root));
    }
  }
  return plan;
}

function listFiles(dir, prefix = '') {
  const out = [];
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory()) { if (!EXCLUDE_DIRS.has(d.name) || prefix) out.push(...listFiles(path.join(dir, d.name), path.join(prefix, d.name))); }
    else if (!EXCLUDE_FILES.has(d.name)) out.push(path.join(prefix, d.name));
  }
  return out;
}

function entry(src, dest, rel, root) {
  if (!dest.startsWith(root + path.sep)) throw new Error(`destination escapes target root: ${dest}`);
  const action = hasSymlinkComponent(dest, root) ? 'refuse-symlink'
    : !existsSync(dest) ? 'create'
    : readFileSync(dest).equals(readFileSync(src)) ? 'skip-identical' : 'conflict';
  return { src, dest, rel, action };
}

function hasSymlinkComponent(dest, root) {
  let cur = path.dirname(dest);
  while (cur.startsWith(root) && cur !== root) {
    if (existsSync(cur) && lstatSync(cur).isSymbolicLink()) return true;
    cur = path.dirname(cur);
  }
  return existsSync(dest) && lstatSync(dest).isSymbolicLink();
}

export function applyInstall(plan, { dryRun = false } = {}) {
  const refused = plan.filter(e => e.action === 'refuse-symlink');
  if (refused.length) throw new Error(`refusing to write through symlinked destination: ${refused[0].dest}`);
  const conflicts = plan.filter(e => e.action === 'conflict');
  if (conflicts.length) throw new Error(`conflict: ${conflicts.length} existing file(s) differ, nothing written. First: ${conflicts[0].dest}`);
  const created = plan.filter(e => e.action === 'create');
  if (!dryRun) for (const e of created) { mkdirSync(path.dirname(e.dest), { recursive: true }); writeFileSync(e.dest, readFileSync(e.src)); }
  return { created: created.map(e => e.dest), skipped: plan.filter(e => e.action === 'skip-identical').map(e => e.dest), dryRun };
}
