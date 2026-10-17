import './support/isolated-home.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const pkg=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'gds-observe-install-'));
const run=(p,more=[],env={})=>spawnSync(process.execPath,[path.join(pkg,'scripts/install.mjs'),'--observer-mode','manual','--target','both','--scope','project','--project',p,...more],{encoding:'utf8',env:{...process.env,...env}});
const put=(p,r,t)=>{const f=path.join(p,r);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,t);};
test('observer fresh install is a separately discoverable companion on both hosts',()=>{
 const p=temp(),r=run(p);assert.equal(r.status,0,r.stderr);
 for(const host of ['.claude','.agents']){
  const s=path.join(p,host,'skills/task-observer/SKILL.md');assert.ok(fs.existsSync(s));
  assert.match(fs.readFileSync(s,'utf8'),/^name: task-observer$/m);
  assert.ok(fs.existsSync(path.join(p,host,'skills/task-observer/scripts/observe.mjs')));
 }
});
test('existing user task observer and its history are preserved byte for byte',()=>{
 const p=temp();put(p,'.claude/skills/task-observer/SKILL.md','Henn installation 2026-08-24 with my changes');
 put(p,'.claude/skills/task-observer/history/custom.md','private history');
 const r=run(p,['--upgrade']);assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/PRESERVE.*task-observer/);
 assert.equal(fs.readFileSync(path.join(p,'.claude/skills/task-observer/SKILL.md'),'utf8'),'Henn installation 2026-08-24 with my changes');
 assert.equal(fs.existsSync(path.join(p,'.claude/skills/task-observer/scripts')),false);
 assert.equal(fs.readFileSync(path.join(p,'.claude/skills/task-observer/history/custom.md'),'utf8'),'private history');
});
test('observer can be omitted without removing existing files',()=>{
 const p=temp(),r=run(p,['--no-observer']);assert.equal(r.status,0,r.stderr);
 assert.equal(fs.existsSync(path.join(p,'.claude/skills/task-observer')),false);
 const b=JSON.parse(fs.readFileSync(path.join(p,'.claude/skills/gds-superpowers/config/observer.json')));assert.equal(b.enabled,false);
});
test('observer alias supports a conflict-free gd-task-observer name',()=>{
 const p=temp(),r=run(p,['--observer-name','gd-task-observer']);assert.equal(r.status,0,r.stderr);
 assert.match(fs.readFileSync(path.join(p,'.claude/skills/gd-task-observer/SKILL.md'),'utf8'),/^name: gd-task-observer$/m);
 assert.equal(JSON.parse(fs.readFileSync(path.join(p,'.agents/skills/gds-superpowers/config/observer.json'))).skill_name,'gd-task-observer');
});
test('observer refuses reserved or path-traversing aliases before writing',()=>{
 for(const name of ['../bad','gds-superpowers','start']){const p=temp(),r=run(p,['--observer-name',name]);assert.notEqual(r.status,0);assert.deepEqual(fs.readdirSync(p),[]);}
});
test('observer default dry run writes nothing',()=>{const p=temp(),r=run(p,['--dry-run']);assert.equal(r.status,0,r.stderr);assert.deepEqual(fs.readdirSync(p),[]);});
test('observer respects an existing personal installation instead of shadowing it',()=>{
 const home=temp(),p=temp();put(home,'.claude/skills/task-observer/SKILL.md','personal observer');
 const r=run(p,[],{HOME:home});assert.equal(r.status,0,r.stderr);assert.equal(fs.existsSync(path.join(p,'.claude/skills/task-observer')),false);
 assert.equal(fs.readFileSync(path.join(home,'.claude/skills/task-observer/SKILL.md'),'utf8'),'personal observer');
});
test('observer preserves symlinked and incomplete existing directories',()=>{
 const p=temp(),other=temp();put(other,'SKILL.md','external observer');
 fs.mkdirSync(path.join(p,'.claude/skills'),{recursive:true});fs.symlinkSync(other,path.join(p,'.claude/skills/task-observer'));
 fs.mkdirSync(path.join(p,'.agents/skills/task-observer'),{recursive:true});
 const r=run(p);assert.equal(r.status,0,r.stderr);assert.equal(fs.readdirSync(path.join(p,'.agents/skills/task-observer')).length,0);
 assert.equal(fs.readFileSync(path.join(other,'SKILL.md'),'utf8'),'external observer');
});
test('observer repeat installation remains idempotent',()=>{const p=temp();let r=run(p);assert.equal(r.status,0,r.stderr);r=run(p);assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/0 files created/);});
