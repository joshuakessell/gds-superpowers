/** Removal regressions: fixture files only, never real models or user installations. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {planCompatibility,verifyRetirements,retireCompatibility} from '../scripts/compatibility.mjs';
import {sha256} from '../scripts/managed-install.mjs';
const pkg=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const alias=fs.readFileSync(path.join(pkg,'tests/fixtures/retired-alias.txt'),'utf8');
function fixture(t){const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'gds-retire-')));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));return root;}
function put(root,relative,content){const file=path.join(root,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);return file;}
function legacy(root,host='.claude'){return put(root,`${host}/skills/gdsuperpowers/SKILL.md`,alias);}
function canonical(root,host='.claude'){put(root,`${host}/skills/gds-superpowers/SKILL.md`,'---\nname: gds-superpowers\n---\n');}
function plan(root,host='.claude'){return planCompatibility(root,host,[],{upgrade:true}).retirement;}
function run(root,home,scope,extra=[]){const env={...process.env,HOME:home};delete env.CLAUDE_CONFIG_DIR;delete env.CODEX_HOME;return spawnSync(process.execPath,[path.join(pkg,'scripts/install.mjs'),'--target','both','--scope',scope,...(scope==='project'?['--project',root]:[]),'--observer-mode','manual',...extra],{encoding:'utf8',env,timeout:60000});}

test('retirement: a fresh root plans no obsolete entry or directory',t=>{const root=fixture(t);for(const host of ['.claude','.agents']){assert.deepEqual(planCompatibility(root,host,[]),{retirement:null,importedSettings:undefined});}assert.deepEqual(fs.readdirSync(root),[]);});
test('retirement: explicit upgrade required before retiring an existing entry',t=>{const root=fixture(t),file=legacy(root);assert.throws(()=>planCompatibility(root,'.claude',[]),/--upgrade/);assert.equal(fs.readFileSync(file,'utf8'),alias);});
test('retirement: canonical entry must exist before archiving',t=>{const root=fixture(t),file=legacy(root),p=plan(root);assert.throws(()=>retireCompatibility(root,[p]),/Canonical skill missing/);assert.equal(fs.readFileSync(file,'utf8'),alias);});
test('retirement: dry-run preserves entry and does not create backups',t=>{const root=fixture(t),file=legacy(root),p=plan(root);canonical(root);assert.deepEqual(retireCompatibility(root,[p],{dryRun:true}),[]);assert.equal(fs.readFileSync(file,'utf8'),alias);assert.equal(fs.existsSync(path.join(root,'.gds-superpowers-backups')),false);});
test('retirement: archive preserves all old bytes, config, game state and separate observer',t=>{
 const root=fixture(t),plans=[];
 const config=JSON.stringify({schema_version:2,activation_mode:'manual',custom:'keep'});
 const game=put(root,'docs/gds/state.json','{"keep":true}\n');
 for(const host of ['.claude','.agents']){legacy(root,host);canonical(root,host);put(root,`${host}/skills/gdsuperpowers/config/observer.json`,config);put(root,`${host}/skills/gdsuperpowers/private-notes.txt`,'keep old notes');put(root,`${host}/skills/task-observer/SKILL.md`,'existing observer');const info=planCompatibility(root,host,[],{upgrade:true});assert.equal(info.importedSettings.custom,'keep');plans.push(info.retirement);}
 const result=retireCompatibility(root,plans);assert.equal(result.length,2);
 for(const item of result){assert.equal(fs.existsSync(item.source),false);assert.equal(fs.readFileSync(path.join(item.destination,'SKILL.md'),'utf8'),alias);assert.equal(fs.readFileSync(path.join(item.destination,'private-notes.txt'),'utf8'),'keep old notes');assert.equal(fs.readFileSync(path.join(item.destination,'config/observer.json'),'utf8'),config);assert.ok(fs.existsSync(path.join(path.dirname(item.destination),'receipt.json')));}
 for(const host of ['.claude','.agents'])assert.equal(fs.readFileSync(path.join(root,host,'skills/task-observer/SKILL.md'),'utf8'),'existing observer');
 assert.equal(fs.readFileSync(game,'utf8'),'{"keep":true}\n');
});
test('retirement: customized entry is refused, not deleted',t=>{const root=fixture(t),file=legacy(root);fs.appendFileSync(file,'customized');assert.throws(()=>plan(root),/Customized or unknown/);assert.ok(fs.existsSync(file));});
test('retirement: recognized full legacy package imports settings but refuses edited supporting files',t=>{const root=fixture(t),entry='---\nname: gdsuperpowers\n---\nold implementation\n';put(root,'.claude/skills/gdsuperpowers/SKILL.md',entry);put(root,'.claude/skills/gdsuperpowers/helper.txt','original');put(root,'.claude/skills/gdsuperpowers/config/observer.json','{"schema_version":1,"enabled":false}');const records=[{sha256:{'SKILL.md':sha256(Buffer.from(entry)),'helper.txt':sha256(Buffer.from('original'))}}];const info=planCompatibility(root,'.claude',records,{upgrade:true});assert.equal(info.importedSettings.enabled,false);put(root,'.claude/skills/gdsuperpowers/helper.txt','edited');assert.throws(()=>planCompatibility(root,'.claude',records,{upgrade:true}),/Customized legacy supporting file/);});
test('retirement: a changed source after planning is preserved',t=>{const root=fixture(t),file=legacy(root),p=plan(root);canonical(root);fs.appendFileSync(file,'\nchanged after preview');assert.throws(()=>verifyRetirements(root,[p]),/Concurrent change/);assert.throws(()=>retireCompatibility(root,[p]),/Concurrent change/);assert.ok(fs.readFileSync(file,'utf8').endsWith('changed after preview'));});
test('retirement: symlinked legacy directory is refused',t=>{const root=fixture(t),other=path.join(root,'other');fs.mkdirSync(other);fs.mkdirSync(path.join(root,'.claude/skills'),{recursive:true});fs.symlinkSync(other,path.join(root,'.claude/skills/gdsuperpowers'),'dir');assert.throws(()=>plan(root),/Symlink/);});
test('retirement: symlinked supporting file is refused',t=>{const root=fixture(t);legacy(root);put(root,'outside.txt','untouched');fs.symlinkSync(path.join(root,'outside.txt'),path.join(root,'.claude/skills/gdsuperpowers/link'));assert.throws(()=>plan(root),/Symlink/);assert.equal(fs.readFileSync(path.join(root,'outside.txt'),'utf8'),'untouched');});
test('retirement: forged destinations cannot archive another skill',t=>{const root=fixture(t);legacy(root);canonical(root);const p=plan(root);p.directory=path.join(root,'.claude/skills/gds-superpowers');assert.throws(()=>retireCompatibility(root,[p]),/boundary/);assert.ok(fs.existsSync(p.directory));});
for(const scope of ['project','user'])test(`installer: ${scope} installs only canonical and start; repeat does not restore removed command`,t=>{
 const root=fixture(t),home=path.join(root,'home'),project=path.join(root,'project');fs.mkdirSync(home);fs.mkdirSync(project);const selected=scope==='user'?home:project;
 const result=run(project,home,scope);assert.equal(result.status,0,result.stderr);
 for(const host of ['.claude','.agents']){assert.ok(fs.existsSync(path.join(selected,host,'skills/gds-superpowers/SKILL.md')));assert.ok(fs.existsSync(path.join(selected,host,'skills/start/SKILL.md')));assert.equal(fs.existsSync(path.join(selected,host,'skills/gdsuperpowers')),false);}
 for(const host of ['.claude','.agents'])legacy(selected,host);
 const preview=run(project,home,scope,['--upgrade','--dry-run']);assert.equal(preview.status,0,preview.stderr);assert.match(preview.stdout,/PREVIEW archive obsolete command/);assert.ok(fs.existsSync(path.join(selected,'.claude/skills/gdsuperpowers/SKILL.md')));
 const upgrade=run(project,home,scope,['--upgrade']);assert.equal(upgrade.status,0,upgrade.stderr);assert.match(upgrade.stdout,/Archived obsolete command/);
 for(const host of ['.claude','.agents']){assert.equal(fs.existsSync(path.join(selected,host,'skills/gdsuperpowers')),false);const check=spawnSync(process.execPath,[path.join(selected,host,'skills/gds-superpowers/scripts/check-package.mjs')],{encoding:'utf8'});assert.equal(check.status,0,check.stderr);}
 const repeat=run(project,home,scope,['--upgrade']);assert.equal(repeat.status,0,repeat.stderr);assert.doesNotMatch(repeat.stdout,/Archived obsolete command/);
});
