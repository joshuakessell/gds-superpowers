import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const packageRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tmp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'gds-cli-'));
const run=(script,args)=>spawnSync(process.execPath,[path.join(packageRoot,'scripts',script),...(script==='install.mjs'?['--observer-mode','manual']:[]),...args],{encoding:'utf8'});

test('CLI dry-run installs nothing',()=>{
  const project=tmp(); const r=run('install.mjs',['--target','both','--scope','project','--project',project,'--agents','--dry-run']);
  assert.equal(r.status,0,r.stderr); assert.deepEqual(fs.readdirSync(project),[]);
});
test('CLI installs both hosts, preserves instructions, and is idempotent',()=>{
  const project=tmp(); fs.writeFileSync(path.join(project,'AGENTS.md'),'existing instructions');
  const args=['--target','both','--scope','project','--project',project,'--agents'];
  let r=run('install.mjs',args); assert.equal(r.status,0,r.stderr);
  assert.ok(fs.existsSync(path.join(project,'.claude','skills','gds-superpowers','SKILL.md')));
  assert.ok(fs.existsSync(path.join(project,'.agents','skills','gds-superpowers','SKILL.md')));
  assert.ok(fs.existsSync(path.join(project,'.codex','agents','gd-builds.toml')));
  assert.equal(fs.readFileSync(path.join(project,'AGENTS.md'),'utf8'),'existing instructions');
  r=run('install.mjs',args); assert.equal(r.status,0,r.stderr); assert.match(r.stdout,/0 files created/);
});
test('CLI refuses an existing changed skill before writing another host',()=>{
  const project=tmp(), dir=path.join(project,'.claude','skills','gds-superpowers'); fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'SKILL.md'),'mine');
  const r=run('install.mjs',['--target','both','--scope','project','--project',project]);
  assert.notEqual(r.status,0); assert.match(r.stderr,/conflict/i);
  assert.equal(fs.existsSync(path.join(project,'.agents')),false);
});
test('project init creates only starter index and state; check reports pending capabilities',()=>{
  const project=tmp(); let r=run('project.mjs',['init','--project',project,'--legacy']); assert.equal(r.status,0,r.stderr);
  assert.deepEqual(fs.readdirSync(path.join(project,'docs','gds')).sort(),['index.md','state.json']);
  r=run('project.mjs',['check','--project',project]); assert.equal(r.status,0,r.stderr); assert.match(r.stdout,/unverified/);
});
test('invalid command-line arguments fail without writes',()=>{
  const project=tmp(); const r=run('install.mjs',['--target','mystery','--scope','project','--project',project]);
  assert.notEqual(r.status,0); assert.deepEqual(fs.readdirSync(project),[]);
});
