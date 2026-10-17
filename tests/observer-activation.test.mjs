import './support/isolated-home.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseChoice,chooseMode,managedBlock,replaceManagedBlock,resolveActivation} from '../scripts/observer-activation.mjs';
const pkg=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tmp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'gds-activation-'));
const put=(r,p,s)=>{const f=path.join(r,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);return f;};
const read=(r,p)=>fs.readFileSync(path.join(r,p),'utf8');
const get=(r,p)=>JSON.parse(read(r,p));
const run=(r,extra=[],env={})=>spawnSync(process.execPath,[path.join(pkg,'scripts/install.mjs'),'--target','both','--scope','project','--project',r,...extra],{encoding:'utf8',env:{...process.env,...env},timeout:30000});
test('explicit yes/no input handles safe defaults and invalid answers',()=>{
 for(const s of ['y','YES','automatic','auto'])assert.equal(parseChoice(s),'auto');
 for(const s of ['n','No','manual',''])assert.equal(parseChoice(s),'manual');
 assert.equal(parseChoice('maybe'),null);
});
test('non-interactive installation cannot silently choose automatic mode',async()=>{
 await assert.rejects(chooseMode({input:{isTTY:false},output:{isTTY:false}}),/choice is required/);
 assert.deepEqual(await chooseMode({mode:'auto'}),{mode:'auto',source:'explicit-flag'});
 await assert.rejects(chooseMode({mode:'auto',noObserver:true}),/cannot be combined/);
});
test('installation without explicit mode refuses without writes when no terminal exists',()=>{
 const p=tmp(),r=run(p);assert.notEqual(r.status,0);assert.match(r.stderr,/observer-mode/);assert.deepEqual(fs.readdirSync(p),[]);
});
test('manual installation retains invocable companion without bootstrapping',()=>{
 const p=tmp();put(p,'AGENTS.md','Original repo instructions');
 const r=run(p,['--observer-mode','manual']);assert.equal(r.status,0,r.stderr);
 assert.equal(get(p,'.claude/skills/gds-superpowers/config/observer.json').activation_mode,'manual');
 assert.equal(get(p,'.agents/skills/gds-superpowers/config/observer.json').enabled,true);
 assert.ok(fs.existsSync(path.join(p,'.claude/skills/task-observer/SKILL.md')));
 assert.equal(read(p,'AGENTS.md'),'Original repo instructions');
 assert.ok(!fs.existsSync(path.join(p,'.claude/rules/gds-task-observer.md')));
 assert.match(r.stdout,/\/gds-superpowers observe/);
});
test('automatic installation saves startup instructions and a repo activation prompt',()=>{
 const p=tmp();put(p,'AGENTS.md','Custom rules\n');put(p,'CLAUDE.md','Claude rules\n');
 const r=run(p,['--observer-mode','auto']);assert.equal(r.status,0,r.stderr);
 assert.equal(get(p,'.claude/skills/gds-superpowers/config/observer.json').activation_mode,'auto');
 assert.match(read(p,'.claude/rules/gds-task-observer.md'),/ONLY to GDSuperpowers/);
 assert.match(read(p,'AGENTS.md'),/^Custom rules\n/);
 assert.equal(read(p,'CLAUDE.md'),'Claude rules\n');
 assert.match(read(p,'.claude/gdsuperpowers-observer-startup.md'),/Initialize Task-Observer/);
 assert.match(r.stdout,/not submitted/i);
});
test('auto dry-run changes neither instructions nor settings',()=>{
 const p=tmp();put(p,'AGENTS.md','preserve');const r=run(p,['--observer-mode','auto','--dry-run']);
 assert.equal(r.status,0,r.stderr);assert.deepEqual(fs.readdirSync(p),['AGENTS.md']);assert.equal(read(p,'AGENTS.md'),'preserve');
});
test('switching auto to manual changes only GDS owned blocks and keeps backups',()=>{
 const p=tmp();put(p,'AGENTS.md','Custom rules\n');let r=run(p,['--observer-mode','auto']);assert.equal(r.status,0,r.stderr);
 put(p,'AGENTS.md',read(p,'AGENTS.md')+'\nExtra user rule\n');
 r=run(p,['--observer-mode','manual']);assert.equal(r.status,0,r.stderr);
 assert.equal(get(p,'.agents/skills/gds-superpowers/config/observer.json').activation_mode,'manual');
 assert.match(read(p,'AGENTS.md'),/Custom rules/);assert.match(read(p,'AGENTS.md'),/Extra user rule/);
 assert.doesNotMatch(read(p,'AGENTS.md'),/GDS-TASK-OBSERVER-BEGIN/);
 assert.ok(fs.existsSync(path.join(p,'.gdsuperpowers-backups')));
});
test('auto reinstallation is idempotent and keeps original choice timestamp',()=>{
 const p=tmp();let r=run(p,['--observer-mode','auto']);assert.equal(r.status,0,r.stderr);
 const before=read(p,'.claude/skills/gds-superpowers/config/observer.json');
 r=run(p,['--observer-mode','auto']);assert.equal(r.status,0,r.stderr);
 assert.match(r.stdout,/0 files created; 0 files updated/);assert.equal(read(p,'.claude/skills/gds-superpowers/config/observer.json'),before);
});
test('Codex uses existing non-empty override file without modifying ignored AGENTS',()=>{
 const p=tmp();put(p,'AGENTS.override.md','Active instructions');put(p,'AGENTS.md','Ignored base');
 const r=run(p,['--observer-mode','auto']);assert.equal(r.status,0,r.stderr);
 assert.match(read(p,'AGENTS.override.md'),/GDS-TASK-OBSERVER-BEGIN/);assert.equal(read(p,'AGENTS.md'),'Ignored base');
});
test('malformed startup block stops entire installation before skill writes',()=>{
 const p=tmp();put(p,'AGENTS.md','<!-- GDS-TASK-OBSERVER-BEGIN bogus -->');
 const r=run(p,['--observer-mode','auto']);assert.notEqual(r.status,0);assert.ok(!fs.existsSync(path.join(p,'.agents')));
 assert.ok(!fs.existsSync(path.join(p,'.claude')));
});
test('customized startup block is preserved without rewriting it',()=>{
 const p=tmp();run(p,['--observer-mode','auto']);const f='.claude/rules/gds-task-observer.md';
 const changed=read(p,f).replace('Apply this ONLY','My local edit ONLY');put(p,f,changed);
 const r=run(p,['--observer-mode','manual']);assert.notEqual(r.status,0);assert.match(r.stderr,/Customized/);assert.equal(read(p,f),changed);
});
test('managed block replacement preserves surrounding text and detects duplicate markers',()=>{
 const old='before\n'+managedBlock('old instructions')+'\nafter\n';
 const newText=replaceManagedBlock(old,'new instructions');assert.ok(newText.startsWith('before\n'));assert.ok(newText.endsWith('\nafter\n'));
 assert.throws(()=>replaceManagedBlock(old+'\n'+managedBlock('another'),'x'),/Duplicate/);
});
test('symlinked instruction destinations are refused before writes',()=>{
 const p=tmp(),other=tmp();put(other,'rules','external');fs.symlinkSync(path.join(other,'rules'),path.join(p,'AGENTS.md'));
 const r=run(p,['--observer-mode','auto']);assert.notEqual(r.status,0);assert.equal(read(other,'rules'),'external');assert.ok(!fs.existsSync(path.join(p,'.claude')));
});
test('global auto installs user instructions without touching arbitrary projects',()=>{
 const home=tmp(),p=tmp();put(home,'.codex/AGENTS.md','Personal rules');
 const r=spawnSync(process.execPath,[path.join(pkg,'scripts/install.mjs'),'--target','both','--scope','user','--observer-mode','auto'],{encoding:'utf8',env:{...process.env,HOME:home}});
 assert.equal(r.status,0,r.stderr);assert.match(read(home,'.claude/rules/gds-task-observer.md'),/user scope/);
 assert.match(read(home,'.codex/AGENTS.md'),/^Personal rules/);assert.deepEqual(fs.readdirSync(p),[]);
});
test('global manual remains manual and keeps unrelated global instructions exact',()=>{
 const home=tmp();put(home,'.codex/AGENTS.md','Personal rules');
 const r=spawnSync(process.execPath,[path.join(pkg,'scripts/install.mjs'),'--target','both','--scope','user','--observer-mode','manual'],{encoding:'utf8',env:{...process.env,HOME:home}});
 assert.equal(r.status,0,r.stderr);assert.equal(read(home,'.codex/AGENTS.md'),'Personal rules');assert.ok(!fs.existsSync(path.join(home,'.claude/rules')));
});
test('effective project manual overrides global automatic without blocking explicit passes',()=>{
 const b={activation_mode:'auto',enabled:true},p={activation_mode:'manual',enabled:true};
 assert.equal(resolveActivation({binding:b,projectBinding:p}).automatic,false);
 assert.equal(resolveActivation({binding:b,projectBinding:p,explicit:true}).runNow,true);
 assert.equal(resolveActivation({binding:b}).automatic,true);
 assert.equal(resolveActivation({}).automatic,false);
});
test('latest explicit state preference wins but an older legacy on does not force auto',()=>{
 const binding={activation_mode:'manual',configured_at:'2026-10-11T10:00:00Z',enabled:true};
 assert.equal(resolveActivation({binding,stateObserver:{enabled:true}}).automatic,false);
 assert.equal(resolveActivation({binding,stateObserver:{enabled:true,automatic:true,mode_set_at:'2026-10-11T11:00:00Z'}}).automatic,true);
 assert.equal(resolveActivation({binding:{...binding,activation_mode:'auto'},stateObserver:{enabled:false}}).automatic,false);
});
test('requested CLI activation rejects manual mode and incomplete global target',()=>{
 const p=tmp();let r=run(p,['--observer-mode','manual','--activate-now','claude']);assert.notEqual(r.status,0);assert.deepEqual(fs.readdirSync(p),[]);
 const home=tmp();r=spawnSync(process.execPath,[path.join(pkg,'scripts/install.mjs'),'--target','claude','--scope','user','--observer-mode','auto','--activate-now','claude'],{encoding:'utf8',env:{...process.env,HOME:home}});
 assert.notEqual(r.status,0);assert.match(r.stderr,/activation-project/);assert.deepEqual(fs.readdirSync(home),[]);
});
test('explicit launcher delivers prompt in chosen project without bypass flags',()=>{
 const p=tmp(),bin=tmp(),log=path.join(bin,'call.json');
 const script=`#!${process.execPath}\nrequire('fs').writeFileSync(process.env.GDS_TEST_LOG,JSON.stringify({cwd:process.cwd(),args:process.argv.slice(2)}));\n`;
 fs.writeFileSync(path.join(bin,'claude'),script,{mode:0o755});
 const r=run(p,['--observer-mode','auto','--activate-now','claude'],{PATH:bin+path.delimiter+process.env.PATH,GDS_TEST_LOG:log});
 assert.equal(r.status,0,r.stderr);const call=JSON.parse(fs.readFileSync(log));assert.equal(call.cwd,fs.realpathSync(p));assert.equal(call.args.length,1);
 assert.match(call.args[0],/\/gds-superpowers observe/);assert.doesNotMatch(call.args[0],/bypassPermissions|danger-full-access/);assert.match(r.stdout,/prompt submitted/i);
});
test('read-only status sees repo manual before personal auto',()=>{
 const home=tmp(),p=tmp();put(home,'.claude/skills/gds-superpowers/config/observer.json',JSON.stringify({schema_version:2,enabled:true,activation_mode:'auto'}));
 put(p,'.claude/skills/gds-superpowers/config/observer.json',JSON.stringify({schema_version:2,enabled:true,activation_mode:'manual'}));
 const r=spawnSync(process.execPath,[path.join(pkg,'scripts/observer-status.mjs'),'--project',p,'--host','claude'],{encoding:'utf8',env:{...process.env,HOME:home}});
 assert.equal(r.status,0,r.stderr);const result=JSON.parse(r.stdout);assert.equal(result.automatic,false);assert.equal(result.initialized,false);assert.ok(!fs.existsSync(path.join(p,'docs')));
});
test('read-only status rejects traversal instead of inspecting another state file',()=>{
 const p=tmp();const r=spawnSync(process.execPath,[path.join(pkg,'scripts/observer-status.mjs'),'--project',p,'--host','claude','--state','../private.json'],{encoding:'utf8'});
 assert.notEqual(r.status,0);assert.match(r.stderr,/outside/);
});
test('global launcher submits inside named repository rather than home',()=>{
 const home=tmp(),p=tmp(),bin=tmp(),log=path.join(bin,'call.json');
 fs.writeFileSync(path.join(bin,'codex'),`#!${process.execPath}\nrequire('fs').writeFileSync(process.env.GDS_TEST_LOG,JSON.stringify({cwd:process.cwd(),args:process.argv.slice(2)}));\n`,{mode:0o755});
 const r=spawnSync(process.execPath,[path.join(pkg,'scripts/install.mjs'),'--target','codex','--scope','user','--observer-mode','auto','--activate-now','codex','--activation-project',p],{encoding:'utf8',env:{...process.env,HOME:home,PATH:bin+path.delimiter+process.env.PATH,GDS_TEST_LOG:log}});
 assert.equal(r.status,0,r.stderr);const call=JSON.parse(fs.readFileSync(log));assert.equal(call.cwd,fs.realpathSync(p));assert.match(call.args[0],/\$gds-superpowers observe/);assert.deepEqual(fs.readdirSync(p),[]);
});
test('dry-run with immediate activation never launches a CLI',()=>{
 const p=tmp(),bin=tmp(),log=path.join(bin,'called');fs.writeFileSync(path.join(bin,'claude'),`#!${process.execPath}\nrequire('fs').writeFileSync(process.env.GDS_TEST_LOG,'called');\n`,{mode:0o755});
 const r=run(p,['--observer-mode','auto','--activate-now','claude','--dry-run'],{PATH:bin+path.delimiter+process.env.PATH,GDS_TEST_LOG:log});
 assert.equal(r.status,0,r.stderr);assert.ok(!fs.existsSync(log));assert.deepEqual(fs.readdirSync(p),[]);
});
test('missing local CLI reports saved configuration without claiming live activation',()=>{
 const p=tmp(),bin=tmp();const r=run(p,['--observer-mode','auto','--activate-now','claude'],{PATH:bin});
 assert.notEqual(r.status,0);assert.match(r.stderr,/Files installed, but activation prompt was not submitted/);assert.ok(fs.existsSync(path.join(p,'.claude/rules/gds-task-observer.md')));
});
test('manual selection preserves custom companion and every historical observation',()=>{
 const p=tmp();put(p,'.claude/skills/task-observer/SKILL.md','existing custom observer');put(p,'docs/gds/state.json','{"schema_version":2,"observer":{"enabled":true,"observations":["historical"]}}');
 const before=read(p,'docs/gds/state.json');const r=run(p,['--observer-mode','manual']);assert.equal(r.status,0,r.stderr);
 assert.equal(read(p,'.claude/skills/task-observer/SKILL.md'),'existing custom observer');assert.equal(read(p,'docs/gds/state.json'),before);
});

test('startup instruction merge preserves an existing private permission mode',()=>{
 const p=tmp();const file=put(p,'AGENTS.md','Private repository rules');fs.chmodSync(file,0o600);
 const r=run(p,['--observer-mode','auto']);assert.equal(r.status,0,r.stderr);
 assert.equal(fs.statSync(file).mode&0o777,0o600);
});
test('an unmodified managed block in a CRLF instruction file is replaced, not treated as customized',()=>{
 const crlf=('before\n\n'+managedBlock('old instructions')+'\nafter\n').replaceAll('\n','\r\n');
 const next=replaceManagedBlock(crlf,'new instructions');
 assert.ok(next.includes('new instructions'));
 assert.ok(!next.includes('old instructions'));
});
test('legacy omission without a provider field blocks an explicit pass like provider none',()=>{
 const r=resolveActivation({binding:{schema_version:2,enabled:false,activation_mode:'manual'},explicit:true});
 assert.equal(r.runNow,false);assert.equal(r.automatic,false);assert.equal(r.reason,'integration-omitted');
});
