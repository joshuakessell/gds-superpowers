#!/usr/bin/env node
/** Explicit conversion to canonical schema 3. No inferred approvals, no game edits. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {safeRoot, safeDestination} from './lib.mjs';
import {newQuickState, validateQuickState} from './quickflow.mjs';
import {planManaged, applyManaged, sha256} from './managed-install.mjs';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim();
const PHASES = {charter:'discover', research:'discover', evidence:'discover', concept:'discover', design:'discover', systems:'discover', prototype:'prototype', slice:'slice', production:'expand', validation:'expand', polish:'expand', release:'release', ship:'release'};
export function migrateState(source, {sourceRef, sourceHash, now = new Date().toISOString()} = {}) {
  if (!object(source) || !nonempty(sourceRef)) throw Error('State object and sourceRef required');
  if (Object.hasOwn(source, 'schemaVersion') && Object.hasOwn(source, 'schema_version')) throw Error('Ambiguous state schema; reconcile manually');
  if (source.schema_version === 3) {
    const result = validateQuickState(source);
    if (result.errors.length) throw Error(`Invalid canonical state: ${result.errors.join('; ')}`);
    return {state: structuredClone(source), changed:false, warnings:[]};
  }
  const kind = source.schemaVersion === 1 ? 'claude-camel-v1' : source.schema_version === 1 ? 'gds-snake-v1' : source.schema_version === 2 && source.track === 'quick' ? 'gds-quick-v2' : null;
  if (!kind) throw Error('Unknown source schema; no migration performed');
  for (const key of ['approvals','decisions','tasks','evidence']) if (source[key] !== undefined && !Array.isArray(source[key])) throw Error(`Malformed ${key}: expected array`);
  if (kind !== 'gds-quick-v2' && !Object.hasOwn(PHASES, source.phase)) throw Error(`Unknown source phase ${String(source.phase)}; reconcile manually`);
  let out;
  if (kind === 'gds-quick-v2') {
    out = structuredClone(source);
    out.schema_version = 3;
    // In-flight task/agent status is evidence to reconcile, not something migration can certify.
    out.tasks = []; out.jobs = [];
  } else {
    out = newQuickState(); out.milestone = PHASES[source.phase];
    out.decisions = structuredClone(source.decisions ?? []);
    const answer = (key, val) => { if (val !== undefined && val !== null) out.answers[key] = {value:structuredClone(val), origin:'imported', source_ref:sourceRef}; };
    if (kind === 'claude-camel-v1') {
      answer('theme', source.project?.theme); answer('engine', source.project?.engine);
      if (source.contract?.profile === 'roguelite-default') {
        answer('genres', {primary:'roguelite', secondary:[]});
        answer('roguelite_rules', {profile:source.contract.upgradeChoices === 3 && source.contract.temporaryResets === true ? 'one-of-three-persistent' : 'custom-imported', offered_choices:source.contract.upgradeChoices, selections:1, run_upgrades_reset:source.contract.temporaryResets, persistent_progress:true, retained_resources:source.contract.retainedResources ?? []});
      }
      if (source.agentBudget?.maxConcurrent !== undefined) {
        const cap = source.agentBudget.maxConcurrent;
        if (!Number.isInteger(cap) || cap < 1 || cap > 64) throw Error('Invalid legacy concurrency limit');
        out.limits.max_active_agents = cap;
      }
      out.documents = {brief:'docs/gds/README.md', plan:source.approvals?.find(a => a?.subject === 'plan' && typeof a.ref === 'string')?.ref ?? null};
    } else {
      out.documents = structuredClone(source.documents ?? {brief:'docs/gds/index.md', plan:null});
    }
  }
  if (source.observer !== undefined) out.observer = structuredClone(source.observer);
  const priorStatus = out.loop.status;
  out.loop.status = 'paused';
  out.migration = {format:1, source_schema:kind, source_ref:sourceRef, source_hash:sourceHash ?? sha256(JSON.stringify(source)), hash_encoding:sourceHash ? 'original-bytes' : 'JSON.stringify', at:now, review_required:true, prior_loop_status:priorStatus, original_state:structuredClone(source), note:'Original source data remains historical evidence. Reconcile current task, job status, document pointers and user-message approval provenance before continuing. Migration does not assert the validity of a source claim.'};
  out.next_action = 'Reconcile preserved source state and document pointers. Keep existing work; restore execution only after actual scoped approval evidence is identified.';
  const check = validateQuickState(out);
  if (check.errors.length) throw Error(`Migration needs manual reconciliation: ${check.errors.join('; ')}`);
  return {state:out, changed:true, warnings:['All source data and unknown fields are preserved in migration.original_state plus an exact on-disk backup.','Legacy approvals, jobs and observations have not been independently authenticated. Execution is paused until reconciliation.']};
}
export function planStateMigration(project) {
  const root = safeRoot(project), destination = safeDestination(root, path.join(root, 'docs/gds/state.json'));
  const stat = fs.statSync(destination);
  if (!stat.isFile() || stat.size > 8 * 1024 * 1024) throw Error('State must be a regular JSON file under 8 MiB');
  const previous = fs.readFileSync(destination);
  const result = migrateState(JSON.parse(previous.toString('utf8')), {sourceRef:'docs/gds/state.json', sourceHash:sha256(previous)});
  if (!result.changed) return {root, changed:false, plan:[], warnings:[]};
  const content = JSON.stringify(result.state, null, 2) + '\n';
  const plan = planManaged(root, [{key:'state-migration', destination, content}], {upgrade:true, baseline:{'state-migration':sha256(previous)}});
  return {root, changed:true, plan, warnings:result.warnings};
}
export function applyStateMigration(project, proposal, {approve = false, dryRun = false} = {}) {
  const root = safeRoot(project);
  if (root !== proposal.root) throw Error('Migration root changed');
  if (!proposal.changed) return {backup:null, created:0, updated:0};
  if (!dryRun && !approve) throw Error('Migration requires --approve after reviewing the preview');
  return applyManaged(root, proposal.plan, {dryRun});
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2); let project, approve = false, preview = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--project') { project = args[++i]; if (!project || project.startsWith('--')) throw Error('--project needs a value'); }
      else if (args[i] === '--approve') approve = true;
      else if (args[i] === '--dry-run') preview = true;
      else throw Error('Use --project /repo [--dry-run | --approve]');
    }
    if (!project) throw Error('--project required');
    if (approve && preview) throw Error('Choose preview or approval, not both');
    const proposal = planStateMigration(project);
    const result = applyStateMigration(project, proposal, {approve, dryRun:!approve});
    console.log(JSON.stringify({changed:proposal.changed, applied:approve && proposal.changed, warnings:proposal.warnings, ...result}, null, 2));
  } catch (error) { console.error(`State migration refused: ${error.message}`); process.exitCode = 1; }
}
