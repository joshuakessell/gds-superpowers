/** Shared task/job ownership. Structural validation, not a scheduler or authorization. */
import fs from 'node:fs';
import path from 'node:path';
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const text = x => typeof x === 'string' && x.trim().length > 0;
export const liveJob = j => object(j) && ['reserved', 'active'].includes(j.status);
export function lease(value) {
  if (!text(value)) return null;
  const normalized = value.replaceAll('\\', '/').replace(/\/+$/, '');
  if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized) || /[*?\[\]]/.test(normalized) || normalized.split('/').some(p => p === '..' || p === '.')) return null;
  return normalized.replace(/\/{2,}/g, '/');
}
export const overlaps = (a, b) => a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
const within = (child, parent) => child === parent || child.startsWith(`${parent}/`);
export function rootIdentity(value) {
  if (!text(value) || !path.isAbsolute(value)) throw Error('absolute project_root required');
  const selected = path.resolve(value);
  try {
    const stat = fs.lstatSync(selected);
    if (stat.isSymbolicLink()) throw Error('Symlink root refused; use the authoritative real root');
    if (!stat.isDirectory()) throw Error('project_root must be a directory');
  } catch (e) { if (e.code !== 'ENOENT') throw e; }
  // Resolve existing ancestors, including macOS /tmp aliases. Offline recorded
  // roots may not exist; preserve their lexical tail without creating anything.
  let parent = selected;
  while (!fs.existsSync(parent)) parent = path.dirname(parent);
  return path.join(fs.realpathSync(parent), path.relative(parent, selected));
}
function rootOf(record, state, errors, label) {
  const value = record.project_root ?? state.project_root;
  if (value === undefined) return null; // Legacy unscoped task: conservative conflicts.
  try { return rootIdentity(value); }
  catch (e) { errors.push(`${label}: ${e.message}`); return null; }
}
function pathsOf(record, key, errors, label) {
  if (!Array.isArray(record[key])) { errors.push(`${label}: ${key} must be an array`); return []; }
  const paths = record[key].map(lease);
  if (paths.some(p => !p)) errors.push(`${label}: invalid ${key}`);
  return paths.filter(Boolean);
}
export function validateOwnership(state) {
  const errors = [], rawTasks = state.tasks ?? [], rawJobs = state.jobs ?? [];
  if (!Array.isArray(rawTasks) || !Array.isArray(rawJobs)) return ['tasks and jobs must be arrays'];
  const tasks = rawTasks.filter(object), jobs = rawJobs.filter(object);
  if (tasks.length !== rawTasks.length || jobs.length !== rawJobs.length) errors.push('task/job records must be objects');
  const byTask = new Map(), byJob = new Map();
  for (const [records, map, label] of [[tasks, byTask, 'task'], [jobs, byJob, 'job']]) {
    for (const r of records) {
      if (!text(r.id) || map.has(r.id)) errors.push(`${label} requires a unique id`);
      map.set(r.id, r);
    }
  }
  const linked = new Set(), claimed = new Set(), owners = [];
  for (const job of jobs.filter(liveJob)) {
    const label = `job ${job.id}`, root = rootOf(job, state, errors, label);
    const paths = pathsOf(job, 'write_paths', errors, label);
    if (job.task_id !== undefined) {
      const task = byTask.get(job.task_id);
      if (!text(job.task_id) || !task || task.job_id !== job.id || claimed.has(task.id)) {
        errors.push(`${label}: invalid reciprocal task_id/job_id link`);
      } else {
        claimed.add(task.id);
        const taskRoot = rootOf(task, state, errors, `task ${task.id}`);
        const allowed = pathsOf(task, 'allowed_files', errors, `task ${task.id}`);
        if (!root || !taskRoot || root !== taskRoot) errors.push(`${label}: linked task requires the same canonical project_root`);
        if (task.execution_kind !== 'actual-subagent' || task.role !== job.role) errors.push(`${label}: linked task must identify its actual-subagent role`);
        if (paths.some(p => !allowed.some(a => within(p, a)))) errors.push(`${label}: write_paths exceed linked task scope`);
        if (job.status === 'reserved') {
          if (!['pending', 'blocked'].includes(task.status) || text(task.agent_run_id)) errors.push(`${label}: reserved task must not claim an active execution`);
        } else if (task.status !== 'active' || !text(job.run_id) || task.agent_run_id !== job.run_id) {
          errors.push(`${label}: task status or execution identity mismatch`);
        }
        linked.add(task.id); // Invalid links still fail; matching strings alone never waive checks.
      }
    }
    owners.push({label, root, paths});
  }
  for (const task of tasks) {
    if (task.job_id !== undefined && ['pending', 'active'].includes(task.status)) {
      const job = byJob.get(task.job_id);
      if (!text(task.job_id) || !job || !liveJob(job) || job.task_id !== task.id) errors.push(`task ${task.id}: dangling or inconsistent job_id; reconcile ownership`);
    }
    if (task.status === 'active' && !linked.has(task.id)) {
      const label = `task ${task.id}`;
      owners.push({label, root:rootOf(task, state, errors, label), paths:pathsOf(task, 'allowed_files', errors, label)});
    }
  }
  if (Number.isInteger(state.limits?.max_active_agents) && owners.length > state.limits.max_active_agents) errors.push('job capacity exceeded: live jobs plus unlinked active tasks exceed max_active_agents');
  for (let i = 0; i < owners.length; i++) for (let j = i + 1; j < owners.length; j++) {
    const a = owners[i], b = owners[j];
    const left = a.root && b.root ? a.paths.map(p => path.resolve(a.root, p)) : a.paths;
    const right = a.root && b.root ? b.paths.map(p => path.resolve(b.root, p)) : b.paths;
    if (left.some(p => right.some(q => overlaps(p, q)))) errors.push(`Write overlap: ${[a.label,b.label].sort((x,y)=>Number(y.startsWith('task '))-Number(x.startsWith('task '))).join(' and ')}`);
  }
  return [...new Set(errors)];
}
