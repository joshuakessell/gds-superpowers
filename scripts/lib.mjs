/** Local file safety and structural checks. No networking or model invocation. */
import fs from 'node:fs';
import path from 'node:path';

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasEvidence = value => Array.isArray(value) && value.length > 0 && value.every(x =>
  (typeof x === 'string' && x.trim()) || (isObject(x) && typeof x.ref === 'string' && x.ref.trim()));

export function safeRoot(input) {
  if (typeof input !== 'string' || !input.trim()) throw Error('Root must be a nonempty path');
  const selected = path.resolve(input);
  if (fs.lstatSync(selected).isSymbolicLink()) throw Error(`Symlink root refused: ${selected}`);
  const root = fs.realpathSync(selected);
  if (!fs.statSync(root).isDirectory()) throw Error('Root must be an existing directory');
  return root;
}

export function safeDestination(root, destination) {
  const base = path.resolve(root), dest = path.resolve(destination);
  if (fs.lstatSync(base).isSymbolicLink()) throw Error(`Symlink root refused: ${base}`);
  const rel = path.relative(base, dest);
  if (!rel || rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) {
    throw new Error(`Destination is outside the selected root or equals it: ${dest}`);
  }
  let current = base;
  if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) {
    throw new Error(`Symlink root refused: ${current}`);
  }
  for (const part of rel.split(path.sep)) {
    current = path.join(current, part);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Symlink destination refused: ${current}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return dest;
}

export function planWrites(root, files) {
  const seen = new Set();
  return files.map(({destination, content}) => {
    const dest = safeDestination(root, destination);
    if (seen.has(dest)) throw new Error(`Duplicate destination: ${dest}`);
    seen.add(dest);
    if (typeof content !== 'string' && !Buffer.isBuffer(content)) throw new Error(`Invalid content for ${dest}`);
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    if (fs.existsSync(dest)) {
      if (!fs.statSync(dest).isFile() || !fs.readFileSync(dest).equals(data)) {
        throw new Error(`Content conflict; existing file was not modified: ${dest}`);
      }
      return {destination: dest, content: data, action: 'unchanged'};
    }
    return {destination: dest, content: data, action: 'create'};
  });
}

export function applyWrites(root, plan, {dryRun = false} = {}) {
  if (dryRun) return;
  for (const item of plan) {
    const dest = safeDestination(root, item.destination);
    if (item.action !== 'create') continue;
    fs.mkdirSync(path.dirname(dest), {recursive: true});
    safeDestination(root, dest);
    // Exclusive creation protects an existing file even if it appears after preflight.
    fs.writeFileSync(dest, item.content, {flag: 'wx'});
  }
}

export function treeFiles(root) {
  const result = [];
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (['.git','node_modules','historical','.gdsuperpowers-backups','.gds-superpowers-backups'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (path.relative(root, full).split(path.sep).join('/') === 'evals/results') continue;
      if (entry.isSymbolicLink()) throw new Error(`Source symlink refused: ${full}`);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile()) result.push(full);
    }
  }
  visit(root);
  return result;
}

function graphErrors(items, dependencyKey, kind) {
  const errors = [], byId = new Map();
  for (const item of items) {
    if (!isObject(item) || typeof item.id !== 'string' || !item.id.trim()) {
      errors.push(`${kind} requires a nonempty id`); continue;
    }
    if (byId.has(item.id)) errors.push(`${kind} duplicate id: ${item.id}`);
    byId.set(item.id, item);
  }
  for (const item of byId.values()) {
    const deps = item[dependencyKey];
    if (!Array.isArray(deps)) { errors.push(`${kind} ${item.id} requires ${dependencyKey} array`); continue; }
    for (const dep of deps) if (typeof dep !== 'string' || !byId.has(dep)) {
      errors.push(`${kind} ${item.id}: unknown dependency ${String(dep)}`);
    }
  }
  const visiting = new Set(), done = new Set();
  function walk(id) {
    if (visiting.has(id)) { errors.push(`${kind} dependency cycle at ${id}`); return; }
    if (done.has(id) || !byId.has(id)) return;
    visiting.add(id);
    const deps = byId.get(id)[dependencyKey];
    if (Array.isArray(deps)) for (const dep of deps) walk(dep);
    visiting.delete(id); done.add(id);
  }
  for (const id of byId.keys()) walk(id);
  return [...new Set(errors)];
}

function leasePath(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const s = value.replaceAll('\\','/').replace(/\/+$/,'');
  if (!s || s.startsWith('/') || /^[A-Za-z]:/.test(s) || /[*?\[\]]/.test(s) || s.split('/').some(p=>p==='..'||p==='.')) return null;
  return s;
}
const overlaps = (a,b) => a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);

export function validateState(s, {checkLeases = true} = {}) {
  const errors = [], warnings = [];
  if (!isObject(s)) return {errors:['State must be a JSON object'], warnings};
  if (s.schema_version !== 1) errors.push('schema_version must be 1');
  const phases = ['charter','evidence','concept','systems','prototype','slice','production','validation','release'];
  if (!phases.includes(s.phase)) errors.push('Unknown phase');
  if (!['unverified','actual-subagents','sequential-independent','persona-simulation'].includes(s.execution_mode)) errors.push('Unknown execution_mode');
  if (s.execution_mode === 'unverified') warnings.push('Execution capabilities are unverified.');
  if (!isObject(s.upstream) || !['unverified','composed','standalone-degraded'].includes(s.upstream.mode)) errors.push('Unknown upstream mode');
  else if (s.upstream.mode !== 'composed') warnings.push('Full upstream Superpowers execution has not been established.');
  const limits = s.limits ?? {};
  for (const k of ['max_active_agents','max_debate_rounds','max_repair_attempts']) {
    if (!Number.isInteger(limits[k]) || limits[k] < 1) errors.push(`${k} must be a positive integer`);
  }
  const contract = s.contract ?? {};
  if (contract.offered_choices !== 3) errors.push('Default contract requires offered_choices = 3');
  if (contract.selections !== 1) errors.push('Default contract requires selections = 1');
  if (contract.run_upgrades_reset !== true) errors.push('Default contract requires run upgrades to reset');
  if (contract.persistent_progress !== true) errors.push('Default contract requires persistent_progress');
  const tasks = Array.isArray(s.tasks) ? s.tasks : [];
  if (!Array.isArray(s.tasks)) errors.push('tasks must be an array');
  errors.push(...graphErrors(tasks,'depends_on','Task'));
  const active = tasks.filter(t=>isObject(t)&&t.status==='active');
  if (active.length > limits.max_active_agents) errors.push('Active tasks exceed max_active_agents');
  const validTasks=tasks.filter(isObject), byId=new Map(validTasks.map(t=>[t.id,t]));
  for (const t of validTasks) {
    if (!['pending','active','blocked','done','cancelled'].includes(t.status)) errors.push(`Task ${t.id}: invalid status`);
    if (typeof t.role !== 'string' || !t.role.trim()) errors.push(`Task ${t.id}: role is required`);
    if (!Array.isArray(t.acceptance) || !t.acceptance.length) errors.push(`Task ${t.id}: acceptance criteria required`);
    if (!Array.isArray(t.allowed_files)) errors.push(`Task ${t.id}: allowed_files array required`);
    else for (const f of t.allowed_files) if (!leasePath(f)) errors.push(`Task ${t.id}: invalid write lease ${String(f)}`);
    if (t.execution_kind === 'actual-subagent' && ['active','done'].includes(t.status) && !t.agent_run_id) errors.push(`Task ${t.id}: actual execution needs agent_run_id`);
    if (t.status === 'done' && !hasEvidence(t.evidence)) errors.push(`Task ${t.id}: done requires evidence references`);
    if (['active','done'].includes(t.status) && Array.isArray(t.depends_on)) {
      for (const dep of t.depends_on) if (byId.has(dep) && byId.get(dep).status !== 'done') errors.push(`Task ${t.id}: dependency ${dep} is not done`);
    }
  }
  // Conservative overlap check. Parallel worktree exceptions need separate ledgers/explicit integration.
  if (checkLeases) for (let i=0;i<active.length;i++) for (let j=i+1;j<active.length;j++) {
    const a=(Array.isArray(active[i].allowed_files)?active[i].allowed_files:[]).map(leasePath).filter(Boolean);
    const b=(Array.isArray(active[j].allowed_files)?active[j].allowed_files:[]).map(leasePath).filter(Boolean);
    if (a.some(x=>b.some(y=>overlaps(x,y)))) errors.push(`Write overlap: ${active[i].id} and ${active[j].id}`);
  }
  const approvals=Array.isArray(s.approvals)?s.approvals:[];
  if (!Array.isArray(s.approvals)) errors.push('approvals must be an array');
  const approvalIds = new Set();
  for (const a of approvals) {
    if (!isObject(a) || typeof a.id!=='string' || typeof a.source_ref!=='string' || !a.source_ref.trim() || typeof a.scope!=='string' || !a.scope.trim()) {
      errors.push('Every approval needs id, source_ref, and scope'); continue;
    }
    if (approvalIds.has(a.id)) errors.push(`Duplicate approval id ${a.id}`);
    approvalIds.add(a.id);
  }
  const gates=Array.isArray(s.gates)?s.gates:[];
  if (!Array.isArray(s.gates)) errors.push('gates must be an array');
  const gateIds=new Set();
  for (const g of gates) {
    if (!isObject(g) || typeof g.id !== 'string') { errors.push('Gate requires an id'); continue; }
    if (gateIds.has(g.id)) errors.push(`Duplicate gate id ${g.id}`);
    gateIds.add(g.id);
    if (!['pending','passed','blocked'].includes(g.status)) errors.push(`Gate ${g.id}: invalid status`);
    if (g.status === 'passed') {
      if (!hasEvidence(g.evidence)) errors.push(`Gate ${g.id}: passed requires evidence`);
      if ((g.requires_human_approval || ['G0','G1','G4','G6'].includes(g.id)) && !approvalIds.has(g.approval_id)) errors.push(`Gate ${g.id}: missing valid approval reference`);
    }
  }
  const prerequisiteGates={prototype:['G0','G1'],slice:['G0','G1','G2'],production:['G0','G1','G2','G3','G4'],validation:['G0','G1','G2','G3','G4'],release:['G0','G1','G2','G3','G4','G5']};
  for (const id of prerequisiteGates[s.phase]??[]) if (!gates.some(g=>isObject(g)&&g.id===id&&g.status==='passed')) errors.push(`Phase ${s.phase} requires passed gate ${id}`);
  if (tasks.length || gates.length) warnings.push('References are structural only: verify actual evidence, approvals, execution, and current artifacts separately.');
  return {errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
}

export function validateProgression(p) {
  const errors=[],warnings=[];
  if (!isObject(p)) return {errors:['Progression must be an object'],warnings};
  const resources=Array.isArray(p.resources)?p.resources:[], nodes=Array.isArray(p.nodes)?p.nodes:[];
  if (!Array.isArray(p.resources)) errors.push('resources must be an array');
  if (!Array.isArray(p.nodes)) errors.push('nodes must be an array');
  const ids=new Set();
  for (const r of resources) {
    if (!isObject(r)||typeof r.id!=='string'||!r.id.trim()) {errors.push('Resource requires id');continue;}
    if (ids.has(r.id)) errors.push(`Duplicate resource ${r.id}`); ids.add(r.id);
    if (!['run-only','bank-required','always-retained'].includes(r.retention)) errors.push(`Resource ${r.id}: invalid retention`);
  }
  errors.push(...graphErrors(nodes,'requires','Progression'));
  for (const n of nodes.filter(isObject)) {
    if (!isObject(n.cost)) {errors.push(`Node ${n.id}: cost object required`);continue;}
    for (const [id,amount] of Object.entries(n.cost)) {
      if (!ids.has(id)) errors.push(`Node ${n.id}: unknown resource ${id}`);
      if (!Number.isFinite(amount)||amount<0) errors.push(`Node ${n.id}: cost must be finite and nonnegative`);
    }
    if (!Array.isArray(n.unlocks)||!n.unlocks.length||n.unlocks.some(x=>typeof x!=='string'||!x.trim())) errors.push(`Node ${n.id}: nonempty unlocks required`);
  }
  if (!nodes.length) warnings.push('No progression is designed yet.');
  else warnings.push('Graph consistency does not establish balanced costs, content reachability in actual gameplay, or enjoyment.');
  return {errors:[...new Set(errors)],warnings};
}
