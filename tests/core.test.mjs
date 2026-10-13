import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { planWrites, applyWrites, validateState, validateProgression } from '../scripts/lib.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'gds-test-'));
const state = () => ({
  schema_version: 1, phase: 'charter', execution_mode: 'unverified',
  upstream: {mode: 'unverified', version: null},
  limits: {max_active_agents: 4, max_debate_rounds: 2, max_repair_attempts: 2},
  contract: {offered_choices: 3, selections: 1, run_upgrades_reset: true, persistent_progress: true},
  tasks: [], gates: [], approvals: []
});
const task = (id, files, deps=[]) => ({id, status:'active', role:'gd-implementer',
  allowed_files:files, depends_on:deps, acceptance:['A reproducible test'], evidence:[],
  execution_kind:'actual-subagent', agent_run_id:`run-${id}`});

test('installer plans new files without writing until applied', () => {
  const root=tmp(); const dest=path.join(root,'child','a.txt');
  const plan=planWrites(root,[{destination:dest,content:'hello'}]);
  assert.equal(plan[0].action,'create'); assert.equal(fs.existsSync(dest),false);
  applyWrites(root,plan); assert.equal(fs.readFileSync(dest,'utf8'),'hello');
});
test('an existing identical file is an idempotent no-op', () => {
  const root=tmp(), dest=path.join(root,'a.txt'); fs.writeFileSync(dest,'hello');
  assert.equal(planWrites(root,[{destination:dest,content:'hello'}])[0].action,'unchanged');
});
test('conflicting content aborts the entire preflight without partial writes', () => {
  const root=tmp(), a=path.join(root,'a'), b=path.join(root,'b'); fs.writeFileSync(b,'mine');
  assert.throws(()=>planWrites(root,[{destination:a,content:'new'},{destination:b,content:'other'}]),/conflict/i);
  assert.equal(fs.existsSync(a),false); assert.equal(fs.readFileSync(b,'utf8'),'mine');
});
test('paths outside the selected destination are refused', () => {
  const root=tmp(); assert.throws(()=>planWrites(root,[{destination:path.join(root,'..','escape'),content:'x'}]),/outside/i);
});
test('symlinked destination components are refused', () => {
  const root=tmp(), other=tmp(); fs.symlinkSync(other,path.join(root,'link'));
  assert.throws(()=>planWrites(root,[{destination:path.join(root,'link','x'),content:'x'}]),/symlink/i);
});
test('dry run never creates output files', () => {
  const root=tmp(), dest=path.join(root,'new'); const plan=planWrites(root,[{destination:dest,content:'x'}]);
  applyWrites(root,plan,{dryRun:true}); assert.equal(fs.existsSync(dest),false);
});
test('empty unverified project state is structurally valid but warns', () => {
  const result=validateState(state()); assert.deepEqual(result.errors,[]); assert.ok(result.warnings.length);
});
test('the game contract enforces one of three and run-only reset', () => {
  const s=state(); s.contract.selections=3; s.contract.run_upgrades_reset=false;
  const errors=validateState(s).errors.join(' '); assert.match(errors,/selections/); assert.match(errors,/reset/);
});
test('agent budget is checked against active work', () => {
  const s=state(); s.tasks=Array.from({length:5},(_,i)=>task(`T${i}`,[`src/${i}.ts`]));
  assert.match(validateState(s).errors.join(' '),/max_active_agents/);
});
test('concurrent writers cannot lease intersecting paths', () => {
  const s=state(); s.tasks=[task('A',['src/player.ts']),task('B',['src/'])];
  assert.match(validateState(s).errors.join(' '),/overlap/);
});
test('task dependencies must exist and form an acyclic graph', () => {
  const s=state(); s.tasks=[task('A',['a'],['B']),task('B',['b'],['A'])];
  assert.match(validateState(s).errors.join(' '),/cycle/);
  s.tasks[1].depends_on=['MISSING']; assert.match(validateState(s).errors.join(' '),/unknown dependency/);
});
test('actual delegation requires an execution receipt', () => {
  const s=state(); const t=task('A',['a']); t.agent_run_id=null; s.tasks=[t];
  assert.match(validateState(s).errors.join(' '),/agent_run_id/);
});
test('completed tasks require evidence rather than empty success declarations', () => {
  const s=state(); const t=task('A',['a']); t.status='done'; s.tasks=[t];
  assert.match(validateState(s).errors.join(' '),/evidence/);
});
test('a passed gate requires evidence and approval only when designated', () => {
  const s=state(); s.gates=[{id:'G0',status:'passed',requires_human_approval:true,evidence:[],approval_id:null}];
  const e=validateState(s).errors.join(' '); assert.match(e,/evidence/); assert.match(e,/approval/);
});
test('progression references, amounts, and requirements are validated', () => {
  const p={resources:[{id:'scrap',retention:'bank-required'}],nodes:[{id:'workshop',requires:[],cost:{scrap:10},unlocks:['new-option']} ]};
  assert.deepEqual(validateProgression(p).errors,[]);
  p.nodes[0].cost={unknown:-3}; const e=validateProgression(p).errors.join(' '); assert.match(e,/resource/); assert.match(e,/nonnegative/);
});
test('progression catches circular unlock dependencies', () => {
  const p={resources:[],nodes:[{id:'a',requires:['b'],cost:{},unlocks:['x']},{id:'b',requires:['a'],cost:{},unlocks:['y']}]};
  assert.match(validateProgression(p).errors.join(' '),/cycle/);
});
test('malformed active write leases produce errors without crashing', () => {
  const s=state(); const a=task('A',['a']); a.allowed_files={bad:true}; s.tasks=[a,task('B',['b'])];
  assert.match(validateState(s).errors.join(' '),/allowed_files/);
});
test('production phases cannot bypass milestone gates', () => {
  const s=state(); s.phase='production'; assert.match(validateState(s).errors.join(' '),/G4/);
});
test('a publication gate cannot disable its human approval requirement', () => {
  const s=state(); s.gates=[{id:'G6',status:'passed',requires_human_approval:false,evidence:['build-receipt'],approval_id:null}];
  assert.match(validateState(s).errors.join(' '),/approval/);
});
