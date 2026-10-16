/** Read-only discovery. An existing global observer suppresses GDS-owned capture. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const namePattern = /^[a-z][a-z0-9-]{0,40}$/;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const exists = file => { try { fs.lstatSync(file); return true; } catch (e) { if (e.code === 'ENOENT') return false; throw e; } };
export function discoverGlobalObserver({home, host, skillName = 'task-observer', env = process.env}) {
  if (typeof home !== 'string' || !path.isAbsolute(home)) throw Error('Absolute observer home required');
  if (!['claude', 'codex'].includes(host) || !namePattern.test(skillName)) throw Error('Invalid observer host or name');
  const folders = host === 'claude' ? [path.resolve(env.CLAUDE_CONFIG_DIR || path.join(home, '.claude'))]
    : [...new Set([path.join(home, '.agents'), path.resolve(env.CODEX_HOME || path.join(home, '.codex'))])];
  // Renaming the bundled copy must not bypass the standard global owner.
  for (const name of [...new Set(['task-observer', skillName])]) for (const folder of folders) {
    const directory = path.join(folder, 'skills', name), legacy = path.join(folder, 'commands', name + '.md');
    const kind = exists(directory) ? 'skill' : host === 'claude' && exists(legacy) ? 'command' : null;
    if (!kind) continue;
    const entry = kind === 'skill' ? path.join(directory, 'SKILL.md') : legacy;
    const detected = {provider:'global', host, skill_name:name, entry_path:entry, kind, available:false};
    try {
      // Linked user skills are inspected read-only. No external target is ever rewritten.
      const stat = fs.statSync(entry);
      if (!stat.isFile() || stat.size > 128 * 1024) return {...detected, issue:'not-a-small-skill-file'};
      const bytes = fs.readFileSync(entry), text = bytes.toString('utf8');
      const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      const declared = fm?.[1].match(/^name:\s*["']?([a-z][a-z0-9-]*)["']?\s*$/m)?.[1];
      if (!Buffer.from(text).equals(bytes) || !text.trim() || (kind === 'skill' && declared !== name)) return {...detected, issue:'invalid-skill-entry'};
      return {...detected, available:true, resolved_path:fs.realpathSync(entry), sha256:hash(bytes)};
    } catch (error) {
      if (['ENOENT','ENOTDIR','EACCES','EPERM','ELOOP'].includes(error.code)) return {...detected, issue:'unreadable-skill-entry'};
      throw error;
    }
  }
  return null;
}
/** An edited owned entry is a reconciliation blocker, never a new external owner. */
export function ownedCompanionIssue(detected, binding) {
  const owned=binding?.provider==='bundled' ? binding.owned_companion : null;
  if (!owned) return null;
  if (!detected) return fs.existsSync(owned.entry_path) ? 'bundled-companion-not-selected' : 'bundled-companion-missing';
  let samePath=detected.entry_path===owned.entry_path;
  try { samePath ||= fs.realpathSync(owned.entry_path)===detected.resolved_path; } catch { /* Missing entries are diagnosed below when the lexical identity matches. */ }
  if (!samePath) return null; // A separately installed global owner is resolved normally.
  if (!fs.existsSync(owned.entry_path)) return 'bundled-companion-missing';
  if (!detected.available) return 'bundled-companion-unavailable';
  return detected.sha256===owned.sha256 ? null : 'bundled-companion-modified';
}
/** Only exact known package bytes can recover ownership for pre-receipt user installs. */
export function isOwnedGlobal(detected, binding) {
  if (!detected?.available || binding?.provider === 'global' || binding?.provider === 'none' || binding?.skill_name !== detected.skill_name) return false;
  const owned = binding?.owned_companion;
  if (owned) {
    try {
      return binding.provider === 'bundled' &&
        fs.realpathSync(owned.entry_path) === detected.resolved_path && owned.sha256 === detected.sha256;
    } catch { return false; }
  }
  if (binding?.scope !== 'user') return false;
  const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const known = new Set([hash(fs.readFileSync(path.join(pkg, 'companions/task-observer/SKILL.template.md')))]);
  for (const filename of ['v0.3.0.json','v0.3.1.json','main-35d5351.json','main-9fffe38.json','pr2-a3b6307.json']) {
    const baseline = JSON.parse(fs.readFileSync(path.join(pkg, 'baselines', filename), 'utf8'));
    known.add(baseline.sha256?.['companions/task-observer/SKILL.template.md']);
  }
  const bytes = fs.readFileSync(detected.entry_path);
  if (hash(bytes) !== detected.sha256) return false;
  const canonical = bytes.toString('utf8').replace(/^name: [a-z][a-z0-9-]*$/m, 'name: task-observer')
    .replaceAll(`/${detected.skill_name} `, '/task-observer ').replaceAll(`$${detected.skill_name} `, '$task-observer ');
  return known.has(hash(Buffer.from(canonical)));
}
export function providerFields(detected, {enabled = true} = {}) {
  if (!enabled) return {provider:'none', bundled_enabled:false, global_observer:null, owned_companion:null};
  return detected ? {provider:'global', bundled_enabled:false, global_observer:{...detected}, owned_companion:null}
    : {provider:'bundled', bundled_enabled:true, global_observer:null, owned_companion:null};
}
/** Missing/changed global owners block handoff; they never switch on a fallback. */
export function resolveProviderBinding({home, host, binding, ownerBinding, env = process.env}) {
  if (binding?.provider === 'none') return binding;
  const current = discoverGlobalObserver({home, host, skillName:binding?.skill_name ?? 'task-observer', env});
  const ownedIssue=ownedCompanionIssue(current,binding) ?? (current ? ownedCompanionIssue(current,ownerBinding) : null);
  if (ownedIssue) return {...binding,provider:'bundled',bundled_available:false,bundled_issue:ownedIssue};
  if (isOwnedGlobal(current,binding)) return {...binding,provider:'bundled',bundled_enabled:true};
  const saved = binding?.global_observer ?? (binding?.owned_companion ? {resolved_path:binding.owned_companion.entry_path,sha256:binding.owned_companion.sha256} : null);
  if (!current && binding?.provider !== 'global' && !binding?.owned_companion) return binding;
  const changed = current && saved && (current.resolved_path !== saved.resolved_path || current.sha256 !== saved.sha256);
  return {...(binding ?? {}), provider:'global', enabled:false, bundled_enabled:false,
    global_observer:current ?? saved ?? null,
    global_available:!!current?.available && !changed,
    global_issue:!current ? 'global-observer-missing' : !current.available ? (current.issue ?? 'global-observer-unavailable') : changed ? 'global-observer-changed-review-required' : null};
}
