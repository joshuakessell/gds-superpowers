import './support/isolated-home.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const pkg=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tmp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'gds-bridge-'));
const run=(script,args)=>spawnSync(process.execPath,[path.join(pkg,'scripts',script),...(script==='install.mjs'?['--observer-mode','manual']:[]),...args],{encoding:'utf8'});
const put=(p,rel,text)=>{const f=path.join(p,rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,text);};
const args=p=>['--target','both','--scope','project','--project',p];
test('read-only bridge returns candidates without claiming native execution',()=>{
 const p=tmp();put(p,'_bmad/bmgd/workflows/quick-dev/workflow.yaml','name: quick-dev\n');
 const r=run('bridge.mjs',['--project',p]);assert.equal(r.status,0,r.stderr);const out=JSON.parse(r.stdout);
 assert.equal(out.mode,'adapted');assert.equal(out.native_execution,false);assert.equal(out.candidates.length,1);
 assert.equal(out.candidates[0].kind,'quick-dev');assert.equal(out.candidates[0].status,'candidate-only');assert.equal(fs.existsSync(path.join(p,'docs')),false);
});
test('bridge reports no native workflow for an empty project',()=>{const p=tmp(),r=run('bridge.mjs',['--project',p]);assert.equal(r.status,0,r.stderr);assert.deepEqual(JSON.parse(r.stdout).candidates,[]);});
test('bridge refuses to follow symlinked discovery roots',()=>{
 const p=tmp(),other=tmp();put(other,'bmgd/quick-dev.md','name: external');fs.symlinkSync(other,path.join(p,'_bmad'));
 const r=run('bridge.mjs',['--project',p]);assert.equal(r.status,0,r.stderr);const out=JSON.parse(r.stdout);assert.equal(out.candidates.length,0);assert.match(out.warnings.join(' '),/symlink/);
});
test('bridge does not mistake this skill documentation for BMAD installation',()=>{
 const p=tmp();put(p,'.claude/skills/gds-superpowers/references/bmad-quick-dev.md','name: not-native');
 const r=run('bridge.mjs',['--project',p]);assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).candidates.length,0);
});
test('custom alias avoids an existing /start without replacing it',()=>{
 const p=tmp();put(p,'.claude/commands/start.md','original');const r=run('install.mjs',[...args(p),'--start-name','gd-start']);assert.equal(r.status,0,r.stderr);
 assert.equal(fs.readFileSync(path.join(p,'.claude/commands/start.md'),'utf8'),'original');
 assert.match(fs.readFileSync(path.join(p,'.claude/skills/gd-start/SKILL.md'),'utf8'),/name: gd-start/);
 assert.match(fs.readFileSync(path.join(p,'.agents/skills/gd-start/agents/openai.yaml'),'utf8'),/\$gd-start/);
});
test('no-start installs the main skill without any short alias',()=>{
 const p=tmp();put(p,'.claude/commands/start.md','original');const r=run('install.mjs',[...args(p),'--no-start']);assert.equal(r.status,0,r.stderr);
 assert.equal(fs.existsSync(path.join(p,'.claude/skills/start')),false);assert.equal(fs.existsSync(path.join(p,'.agents/skills/start')),false);
 assert.ok(fs.existsSync(path.join(p,'.claude/skills/gds-superpowers/SKILL.md')));
});
test('invalid alias name cannot escape the skill directory',()=>{const p=tmp(),r=run('install.mjs',[...args(p),'--start-name','../escape']);assert.notEqual(r.status,0);assert.match(r.stderr,/Invalid/);assert.deepEqual(fs.readdirSync(p),[]);});
test('existing legacy project remains unchanged when new init is invoked',()=>{
 const p=tmp();let r=run('project.mjs',['init','--project',p,'--legacy']);assert.equal(r.status,0,r.stderr);
 const f=path.join(p,'docs/gds/state.json'),before=fs.readFileSync(f);r=run('project.mjs',['init','--project',p]);assert.equal(r.status,0,r.stderr);
 assert.ok(fs.readFileSync(f).equals(before));assert.equal(fs.existsSync(path.join(p,'docs/gds/game.md')),false);
});
test('project next provides exactly the first adaptive topic for an empty state',()=>{
 const p=tmp();const i=run('project.mjs',['init','--project',p]);assert.equal(i.status,0,i.stderr);
 const r=run('project.mjs',['next','--project',p]);assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/"question": "genres"/);
 const before=fs.readFileSync(path.join(p,'docs/gds/state.json'));run('project.mjs',['next','--project',p]);assert.ok(fs.readFileSync(path.join(p,'docs/gds/state.json')).equals(before));
});
