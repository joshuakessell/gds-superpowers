import './support/isolated-home.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const pkg=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tmp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'gds-q-install-'));
const run=(script,args)=>spawnSync(process.execPath,[path.join(pkg,'scripts',script),...(script==='install.mjs'?['--observer-mode','manual']:[]),...args],{encoding:'utf8'});
const args=p=>['--target','both','--scope','project','--project',p];
test('default installer adds a real Claude /start alias and Codex $start alias',()=>{
 const p=tmp(),r=run('install.mjs',args(p));assert.equal(r.status,0,r.stderr);
 assert.ok(fs.existsSync(path.join(p,'.claude/skills/start/SKILL.md')));
 assert.ok(fs.existsSync(path.join(p,'.agents/skills/start/SKILL.md')));
});
test('legacy command named start is a conflict before any installation writes',()=>{
 const p=tmp();fs.mkdirSync(path.join(p,'.claude/commands'),{recursive:true});
 fs.writeFileSync(path.join(p,'.claude/commands/start.md'),'other workflow');
 const r=run('install.mjs',args(p));assert.notEqual(r.status,0);assert.match(r.stderr,/start/i);
 assert.equal(fs.existsSync(path.join(p,'.agents')),false);
 assert.equal(fs.readFileSync(path.join(p,'.claude/commands/start.md'),'utf8'),'other workflow');
});
test('new projects create only three working files',()=>{
 const p=tmp(),r=run('project.mjs',['init','--project',p]);assert.equal(r.status,0,r.stderr);
 assert.deepEqual(fs.readdirSync(path.join(p,'docs/gds')).sort(),['game.md','next.md','state.json']);
});
