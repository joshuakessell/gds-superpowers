import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {planManaged,applyManaged,sha256} from '../scripts/managed-install.mjs';
const tmp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'gds-upgrade-'));
const file=(root,name,content,key=name)=>({destination:path.join(root,name),content,key});
test('recognized old bytes are backed up before upgrade',()=>{
 const p=tmp();fs.writeFileSync(path.join(p,'skill.md'),'old');
 const plan=planManaged(p,[file(p,'skill.md','new')],{upgrade:true,baseline:{'skill.md':sha256('old')}});
 const r=applyManaged(p,plan);assert.equal(r.updated,1);assert.ok(r.backup);
 assert.equal(fs.readFileSync(path.join(r.backup,'skill.md'),'utf8'),'old');
 assert.equal(fs.readFileSync(path.join(p,'skill.md'),'utf8'),'new');
 const receipt=JSON.parse(fs.readFileSync(path.join(r.backup,'receipt.json'),'utf8'));
 assert.equal(receipt.changes[0].before,sha256('old'));
});
test('modified installation refuses upgrade without changing any destination',()=>{
 const p=tmp();fs.writeFileSync(path.join(p,'skill.md'),'custom');
 assert.throws(()=>planManaged(p,[file(p,'another.md','fresh'),file(p,'skill.md','new')],{upgrade:true,baseline:{'skill.md':sha256('old')}}),/manual merge/);
 assert.equal(fs.existsSync(path.join(p,'another.md')),false);assert.equal(fs.readFileSync(path.join(p,'skill.md'),'utf8'),'custom');
});
test('upgrade dry run creates neither replacements nor backups',()=>{
 const p=tmp();fs.writeFileSync(path.join(p,'skill.md'),'old');
 const plan=planManaged(p,[file(p,'skill.md','new')],{upgrade:true,baseline:{'skill.md':sha256('old')}});
 const r=applyManaged(p,plan,{dryRun:true});assert.equal(r.backup,null);assert.deepEqual(fs.readdirSync(p),['skill.md']);
 assert.equal(fs.readFileSync(path.join(p,'skill.md'),'utf8'),'old');
});
test('changed files still require explicit upgrade flag',()=>{
 const p=tmp();fs.writeFileSync(path.join(p,'a'),'old');
 assert.throws(()=>planManaged(p,[file(p,'a','new')],{baseline:{a:sha256('old')}}),/--upgrade/);
});
test('repeat install of identical bytes is a no-op',()=>{
 const p=tmp();fs.writeFileSync(path.join(p,'a'),'same');const plan=planManaged(p,[file(p,'a','same')]);
 assert.equal(plan[0].action,'unchanged');assert.deepEqual(applyManaged(p,plan),{backup:null,created:0,updated:0});
});
test('concurrent destination changes before apply abort the batch',()=>{
 const p=tmp();fs.writeFileSync(path.join(p,'a'),'old');const plan=planManaged(p,[file(p,'a','new'),file(p,'b','fresh')],{upgrade:true,baseline:{a:sha256('old')}});
 fs.writeFileSync(path.join(p,'a'),'new user work');assert.throws(()=>applyManaged(p,plan),/Concurrent change/);
 assert.equal(fs.existsSync(path.join(p,'b')),false);assert.equal(fs.existsSync(path.join(p,'.gdsuperpowers-backups')),false);
});
test('upgrade refuses symlink destination',()=>{
 const p=tmp(),other=tmp();fs.writeFileSync(path.join(other,'a'),'old');fs.symlinkSync(path.join(other,'a'),path.join(p,'a'));
 assert.throws(()=>planManaged(p,[file(p,'a','new')],{upgrade:true,baseline:{a:sha256('old')}}),/Symlink/);
});
test('upgrade refuses destination outside root and duplicate destinations',()=>{
 const p=tmp();assert.throws(()=>planManaged(p,[file(p,'../bad','x')]),/outside/);
 assert.throws(()=>planManaged(p,[file(p,'a','x'),file(p,'a','y')]),/Duplicate/);
});
