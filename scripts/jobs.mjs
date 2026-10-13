/** Pure recorded lifecycle checks, not an agent scheduler or proof of execution. */
import path from 'node:path';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const LIVE = new Set(['reserved', 'active']);
const STATES = new Set(['reserved', 'active', 'completed', 'cancelled', 'failed']);
export function lease(value) {
  if (!text(value)) return null;
  const normalized = value.replaceAll('\\', '/').replace(/\/+$/, '');
  if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized) || /[*?\[\]]/.test(normalized) || normalized.split('/').some(p => p === '..' || p === '.')) return null;
  return normalized;
}
export const overlaps = (a, b) => a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
export function validateJobs(state) {
  const errors = [], cap = state?.limits?.max_active_agents;
  if (!Number.isInteger(cap) || cap < 1 || cap > 64) errors.push('max_active_agents must be an integer between 1 and 64');
  if (state?.jobs === undefined) return errors;
  if (!Array.isArray(state.jobs)) return [...errors, 'jobs must be an array'];
  const ids = new Set();
  for (const job of state.jobs) {
    if (!object(job)) { errors.push('job must be an object'); continue; }
    if (!text(job.id) || ids.has(job.id)) errors.push('job requires a unique id');
    ids.add(job.id);
    if (!text(job.role)) errors.push(`job ${job.id}: role is required`);
    if (!text(job.project_root) || !path.isAbsolute(job.project_root)) errors.push(`job ${job.id}: absolute project_root required`);
    if (!Array.isArray(job.input_refs) || !job.input_refs.length || job.input_refs.some(x => !text(x))) errors.push(`job ${job.id}: input_refs required`);
    if (!Array.isArray(job.write_paths) || job.write_paths.some(x => !lease(x))) errors.push(`job ${job.id}: valid relative write_paths required`);
    if (!STATES.has(job.status)) errors.push(`job ${job.id}: invalid status`);
    if (['active', 'completed'].includes(job.status) && !text(job.run_id)) errors.push(`job ${job.id}: actual run_id required`);
    if (['completed', 'cancelled', 'failed'].includes(job.status) && !text(job.evidence_ref)) errors.push(`job ${job.id}: terminal evidence required`);
  }
  const live = state.jobs.filter(j => object(j) && LIVE.has(j.status));
  if (live.length > cap) errors.push('job capacity exceeded: reserved + active jobs exceed max_active_agents');
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
    if (live[i].project_root !== live[j].project_root) continue;
    const a = (Array.isArray(live[i].write_paths) ? live[i].write_paths : []).map(lease).filter(Boolean);
    const b = (Array.isArray(live[j].write_paths) ? live[j].write_paths : []).map(lease).filter(Boolean);
    if (a.some(x => b.some(y => overlaps(x, y)))) errors.push(`job write overlap: ${live[i].id} and ${live[j].id}`);
  }
  return errors;
}
function checked(state, jobs) {
  if (state.migration?.review_required) throw Error('Reconcile migration before reserving or transitioning jobs');
  const errors = validateJobs({...state, jobs});
  if (errors.length) throw Error(errors.join('; '));
}
export function reserveJob(state, packet) {
  checked(state, state.jobs ?? []);
  const jobs = state.jobs ?? [];
  if (jobs.filter(j => LIVE.has(j.status)).length >= state.limits.max_active_agents) throw Error('job capacity exhausted');
  const candidate = {...packet, status: 'reserved'};
  delete candidate.run_id; delete candidate.evidence_ref;
  checked(state, [...jobs, candidate]); state.jobs = [...jobs, candidate]; return candidate;
}
export function startJob(state, id, runId) {
  const job = state.jobs?.find(j => j.id === id);
  if (!job || job.status !== 'reserved') throw Error('invalid job transition to active');
  if (!text(runId)) throw Error('actual run ID required');
  const next = {...job, status: 'active', run_id: runId};
  checked(state, state.jobs.map(j => j === job ? next : j)); Object.assign(job, next); return job;
}
export function finishJob(state, id, status, evidenceRef) {
  const job = state.jobs?.find(j => j.id === id);
  if (!job || !LIVE.has(job.status) || !['completed', 'cancelled', 'failed'].includes(status) || (status === 'completed' && job.status !== 'active')) throw Error('invalid terminal job transition');
  if (!text(evidenceRef)) throw Error('terminal evidence required');
  const next = {...job, status, evidence_ref: evidenceRef};
  checked(state, state.jobs.map(j => j === job ? next : j)); Object.assign(job, next); return job;
}
