import './support/isolated-home.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {newQuickState, validateQuickState} from '../scripts/quickflow.mjs';
import {reserveJob, startJob} from '../scripts/jobs.mjs';
const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const task = (overrides={}) => ({id:'T1',status:'active',role:'gd-implementer',project_root:'/fixture/game',acceptance:['tested'],allowed_files:['src'],depends_on:[],...overrides});
const packet = (overrides={}) => ({id:'J1',role:'gd-implementer',project_root:'/fixture/game',input_refs:['docs/gds/next.md'],write_paths:['src/game.ts'],...overrides});
const fixture=t=>{const p=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'gds-review-')));t.after(()=>fs.rmSync(p,{recursive:true,force:true}));return p;};
test('C02: reservation refuses an independent active task lease without mutation',()=>{
 const s=newQuickState();s.tasks=[task()];const before=JSON.stringify(s);
 assert.throws(()=>reserveJob(s,packet()),/overlap/);assert.equal(JSON.stringify(s),before);
});
test('C02: start rechecks a task activated after reservation',()=>{
 const s=newQuickState();reserveJob(s,packet());s.tasks=[task()];const before=JSON.stringify(s);
 assert.throws(()=>startJob(s,'J1','fixture-host-run'),/overlap/);assert.equal(JSON.stringify(s),before);
});
test('C01: explicitly linked task and job represent one writer',()=>{
 const s=newQuickState();s.tasks=[task({job_id:'J1',execution_kind:'actual-subagent',agent_run_id:'fixture-host-run'})];
 s.jobs=[{...packet({task_id:'T1'}),status:'active',run_id:'fixture-host-run'}];
 assert.deepEqual(validateQuickState(s).errors,[]);
});
for(const host of ['claude','codex'])test(`C03: ${host} installed package checks itself`,t=>{
 const root=fixture(t),home=path.join(root,'home'),project=path.join(root,'game');fs.mkdirSync(home);fs.mkdirSync(project);
 const env={...process.env,HOME:home};delete env.CLAUDE_CONFIG_DIR;delete env.CODEX_HOME;
 const install=spawnSync(process.execPath,[path.join(pkg,'scripts/install.mjs'),'--target',host,'--scope','project','--project',project,'--observer-mode','manual'],{env,encoding:'utf8'});
 assert.equal(install.status,0,install.stderr);
 const installed=path.join(project,host==='claude'?'.claude':'.agents','skills/gds-superpowers');
 const check=spawnSync(process.execPath,['scripts/check-package.mjs'],{cwd:installed,env,encoding:'utf8'});
 assert.equal(check.status,0,check.stderr);
});
test('C04: source checker rejects a changed tracked byte',t=>{
 const root=fixture(t);fs.cpSync(pkg,root,{recursive:true,filter:f=>!f.split(path.sep).includes('.git')});
 fs.appendFileSync(path.join(root,'QUICKSTART.md'),'\nfixture edit without manifest update\n');
 const check=spawnSync(process.execPath,['scripts/check-package.mjs'],{cwd:root,encoding:'utf8'});
 assert.notEqual(check.status,0);assert.match(check.stderr,/checksum|[Ii]ntegrity|[Mm]anifest/);
});
