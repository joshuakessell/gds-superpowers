/** Recorded lifecycle. Each admission validates its candidate before any mutation. */
import path from 'node:path';
import {validateState} from './lib.mjs';
import {validateOwnership, liveJob, lease} from './ownership.mjs';
export {lease, overlaps} from './ownership.mjs';
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const text = x => typeof x === 'string' && x.trim().length > 0;
const STATES = new Set(['reserved', 'active', 'completed', 'cancelled', 'failed']);
export function validateJobs(state) {
  const errors = [], cap = state?.limits?.max_active_agents;
  if (!Number.isInteger(cap) || cap < 1 || cap > 64) errors.push('max_active_agents must be an integer between 1 and 64');
  if (state?.jobs !== undefined && !Array.isArray(state.jobs)) return [...errors, 'jobs must be an array'];
  const ids = new Set();
  for (const job of state.jobs ?? []) {
    if (!object(job)) { errors.push('job must be an object'); continue; }
    if (!text(job.id) || ids.has(job.id)) errors.push('job requires a unique id');
    ids.add(job.id);
    if (!text(job.role)) errors.push(`job ${job.id}: role is required`);
    if (!text(job.project_root) || !path.isAbsolute(job.project_root)) errors.push(`job ${job.id}: absolute project_root required`);
    if (!Array.isArray(job.input_refs) || !job.input_refs.length || job.input_refs.some(x => !text(x))) errors.push(`job ${job.id}: input_refs required`);
    if (!Array.isArray(job.write_paths) || job.write_paths.some(x => !lease(x))) errors.push(`job ${job.id}: valid relative write_paths required`);
    if (!STATES.has(job.status)) errors.push(`job ${job.id}: invalid status`);
    if (job.status === 'reserved' && text(job.run_id)) errors.push(`job ${job.id}: reserved job cannot claim a run_id`);
    if (['active', 'completed'].includes(job.status) && !text(job.run_id)) errors.push(`job ${job.id}: actual run_id required`);
    if (['completed', 'cancelled', 'failed'].includes(job.status) && !text(job.evidence_ref)) errors.push(`job ${job.id}: terminal evidence required`);
  }
  return [...new Set([...errors, ...validateOwnership(state)])];
}
function checked(state) {
  if (state.migration?.review_required) throw Error('Reconcile migration before reserving or transitioning jobs');
  const tasks = validateState({schema_version:1, phase:'charter', execution_mode:'unverified', upstream:{mode:'unverified'},
    limits:{...state.limits, max_debate_rounds:1}, contract:{offered_choices:3,selections:1,run_upgrades_reset:true,persistent_progress:true},
    tasks:state.tasks ?? [], approvals:[], gates:[]}, {checkLeases:false});
  const errors = [...validateJobs(state), ...tasks.errors];
  if (errors.length) throw Error([...new Set(errors)].join('; '));
}
function publish(state, candidate) { state.jobs = candidate.jobs; state.tasks = candidate.tasks; }
function proposed(state) { return {...state, jobs:structuredClone(state.jobs ?? []), tasks:structuredClone(state.tasks ?? [])}; }
function unique(records, id, kind) {
  const matches = (Array.isArray(records) ? records : []).filter(r => object(r) && r.id === id);
  if (matches.length !== 1) throw Error(`Expected one ${kind} ${id}`);
  return matches[0];
}
export function reserveJob(state, packet) {
  checked(state);
  const next = proposed(state), candidate = {...structuredClone(packet), status:'reserved'};
  delete candidate.run_id; delete candidate.evidence_ref;
  if (candidate.task_id !== undefined) {
    const task = unique(next.tasks, candidate.task_id, 'task');
    if (!['pending','blocked'].includes(task.status) || text(task.agent_run_id) || next.jobs.some(j => j.id === task.job_id && liveJob(j))) throw Error('Reconcile existing task execution before reservation');
    task.job_id = candidate.id;
  }
  next.jobs.push(candidate); checked(next); publish(state, next); return candidate;
}
export function startJob(state, id, runId) {
  if (!text(runId)) throw Error('actual run ID required');
  const next = proposed(state), job = unique(next.jobs, id, 'job');
  if (job.status !== 'reserved') throw Error('invalid job transition to active');
  // Catch changes made since reservation before changing the candidate task.
  checked(state);
  Object.assign(job, {status:'active', run_id:runId});
  if (job.task_id !== undefined) {
    const task = unique(next.tasks, job.task_id, 'task');
    Object.assign(task, {status:'active', agent_run_id:runId});
  }
  checked(next); publish(state, next); return job;
}
export function activateTask(state, id) {
  const next = proposed(state), task = unique(next.tasks, id, 'task');
  if (!['pending','blocked'].includes(task.status) || task.job_id !== undefined) throw Error('Linked tasks activate through startJob; otherwise reconcile task status');
  task.status = 'active'; checked(next); publish(state, next); return task;
}
export function finishJob(state, id, status, evidenceRef) {
  const next = proposed(state), job = unique(next.jobs, id, 'job');
  if (!liveJob(job) || !['completed','cancelled','failed'].includes(status) || (status === 'completed' && job.status !== 'active')) throw Error('invalid terminal job transition');
  if (!text(evidenceRef)) throw Error('terminal evidence required');
  const task = next.tasks.find(t => object(t) && t.id === job.task_id && t.job_id === job.id);
  if (status !== 'cancelled') checked(state);
  Object.assign(job, {status, evidence_ref:evidenceRef});
  if (task) {
    task.status = status === 'completed' ? 'done' : 'blocked';
    task.evidence = [...(Array.isArray(task.evidence) ? task.evidence : []), evidenceRef];
  }
  if (status !== 'cancelled') checked(next);
  // Cancellation only releases this job and its reciprocal task. It may operate
  // on an invalid/migrating ledger; it never authorizes work or marks it complete.
  publish(state, next); return job;
}
