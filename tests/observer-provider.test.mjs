import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {discoverGlobalObserver,providerFields,resolveProviderBinding} from '../scripts/observer-provider.mjs';
import {resolveActivation} from '../scripts/observer-activation.mjs';
const pkg=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function fixture(t){const base=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'gds-global-')));t.after(()=>fs.rmSync(base,{recursive:true,force:true}));const home=path.join(base,'home'),project=path.join(base,'game');fs.mkdirSync(home);fs.mkdirSync(project);return {base,home,project};}
function global(f,host='claude',name='task-observer'){const entry=path.join(f.home,host==='claude'?'.claude':'.agents','skills',name,'SKILL.md');fs.mkdirSync(path.dirname(entry),{recursive:true});fs.writeFileSync(entry,`---\nname: ${name}\ndescription: Existing global observer\n---\nPreserve the user's native observation log.\n`);return entry;}
function env(f){const e={...process.env,HOME:f.home};delete e.CLAUDE_CONFIG_DIR;delete e.CODEX_HOME;return e;}
function install(f,args=[]){return spawnSync(process.execPath,[path.join(pkg,'scripts/install.mjs'),'--target','claude','--scope','project','--project',f.project,...args],{encoding:'utf8',env:env(f),timeout:30000});}
function binding(f,host='claude',root=f.project){return JSON.parse(fs.readFileSync(path.join(root,host==='claude'?'.claude':'.agents','skills/gds-superpowers/config/observer.json')));}
function status(f,explicit=false){const r=spawnSync(process.execPath,[path.join(pkg,'scripts/observer-status.mjs'),'--project',f.project,'--host','claude',...(explicit?['--explicit']:[])],{encoding:'utf8',env:env(f)});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
test('global provider discovery is host specific and read only',t=>{const f=fixture(t),entry=global(f),bytes=fs.readFileSync(entry);const d=discoverGlobalObserver({...f,host:'claude',env:env(f)});assert.equal(d.available,true);assert.equal(d.resolved_path,fs.realpathSync(entry));assert.equal(discoverGlobalObserver({...f,host:'codex',env:env(f)}),null);assert.deepEqual(fs.readFileSync(entry),bytes);});
test('custom bundled name cannot evade standard global observer detection',t=>{const f=fixture(t);global(f);const d=discoverGlobalObserver({...f,host:'claude',skillName:'gd-task-observer',env:env(f)});assert.equal(d.skill_name,'task-observer');});
test('incomplete global entry blocks duplication rather than fabricating compatibility',t=>{const f=fixture(t);fs.mkdirSync(path.join(f.home,'.claude/skills/task-observer'),{recursive:true});const d=discoverGlobalObserver({...f,host:'claude',env:env(f)});assert.equal(d.available,false);assert.equal(providerFields(d).bundled_enabled,false);});
test('linked global skill is inspected read only',t=>{const f=fixture(t),target=path.join(f.base,'shared-observer');fs.mkdirSync(target);fs.writeFileSync(path.join(target,'SKILL.md'),'---\nname: task-observer\n---\nExisting observer.\n');fs.mkdirSync(path.join(f.home,'.claude/skills'),{recursive:true});fs.symlinkSync(target,path.join(f.home,'.claude/skills/task-observer'),'dir');assert.equal(discoverGlobalObserver({...f,host:'claude',env:env(f)}).available,true);});
test('legacy personal command can own observation without installing a copy',t=>{const f=fixture(t),entry=path.join(f.home,'.claude/commands/task-observer.md');fs.mkdirSync(path.dirname(entry),{recursive:true});fs.writeFileSync(entry,'Inspect native task lessons.');assert.equal(discoverGlobalObserver({...f,host:'claude',env:env(f)}).kind,'command');});
test('global policy blocks both automatic capture and explicit bundled capture',()=>{for(const explicit of [false,true]){const r=resolveActivation({binding:{provider:'global',global_observer:{available:true},bundled_enabled:false,activation_mode:'auto'},explicit});assert.equal(r.runNow,false);assert.equal(r.automatic,false);assert.equal(r.delegateGlobal,explicit);}});
test('existing global install skips bundled initialization choice and preserves bytes',t=>{const f=fixture(t),entry=global(f),bytes=fs.readFileSync(entry);const r=install(f);assert.equal(r.status,0,r.stderr);assert.equal(binding(f).provider,'global');assert.equal(binding(f).enabled,false);assert.equal(binding(f).bundled_enabled,false);assert.equal(fs.existsSync(path.join(f.project,'.claude/skills/task-observer')),false);assert.equal(fs.existsSync(path.join(f.project,'.claude/rules/gds-task-observer.md')),false);assert.deepEqual(fs.readFileSync(entry),bytes);assert.match(r.stdout,/global Task-Observer/);assert.equal(status(f).runNow,false);assert.equal(status(f,true).delegateGlobal,true);});
test('global override suppresses custom companion and auto flag; explicit launcher is refused',t=>{const f=fixture(t);global(f);const r=install(f,['--observer-name','gd-task-observer','--observer-mode','auto']);assert.equal(r.status,0,r.stderr);assert.equal(fs.existsSync(path.join(f.project,'.claude/skills/gd-task-observer')),false);assert.equal(binding(f).activation_mode,'manual');assert.equal(status(f).runNow,false);const blocked=install(f,['--observer-mode','auto','--activate-now','claude']);assert.notEqual(blocked.status,0);assert.match(blocked.stderr,/global/);});
test('reinstallation detects a new global owner and removes only intact GDS startup text',t=>{const f=fixture(t);assert.equal(install(f,['--observer-mode','auto']).status,0);const state=path.join(f.project,'docs/gds/state.json');fs.mkdirSync(path.dirname(state),{recursive:true});fs.writeFileSync(state,JSON.stringify({custom:'keep'}));const entry=global(f),bytes=fs.readFileSync(entry);const r=install(f);assert.equal(r.status,0,r.stderr);const rule=fs.readFileSync(path.join(f.project,'.claude/rules/gds-task-observer.md'),'utf8');assert.doesNotMatch(rule,/GDS-TASK-OBSERVER-BEGIN/);assert.equal(JSON.parse(fs.readFileSync(state)).custom,'keep');assert.deepEqual(fs.readFileSync(entry),bytes);assert.equal(binding(f).bundled_enabled,false);});
test('status detects a newly added global observer even before reinstall',t=>{const f=fixture(t);assert.equal(install(f,['--observer-mode','auto']).status,0);global(f);const r=status(f);assert.equal(r.runNow,false);assert.equal(r.provider,'global');});
test('missing or changed saved global observer never enables the fallback',t=>{const f=fixture(t),entry=global(f);assert.equal(install(f).status,0);fs.appendFileSync(entry,'Changed native rules.');assert.equal(status(f,true).delegateGlobal,false);assert.match(status(f,true).reason,/changed/);fs.unlinkSync(entry);assert.equal(status(f,true).runNow,false);assert.equal(status(f,true).delegateGlobal,false);assert.match(status(f,true).reason,/unreadable|missing/);});
test('both hosts resolve providers independently',t=>{const f=fixture(t);global(f);const r=install(f,['--target','both','--observer-mode','manual']);assert.equal(r.status,0,r.stderr);assert.equal(binding(f).provider,'global');assert.equal(binding(f,'codex').provider,'bundled');assert.ok(fs.existsSync(path.join(f.project,'.agents/skills/task-observer/SKILL.md')));});
test('global-scope install reuses native observer without modifying its entry',t=>{const f=fixture(t),entry=global(f),bytes=fs.readFileSync(entry);const r=spawnSync(process.execPath,[path.join(pkg,'scripts/install.mjs'),'--target','claude','--scope','user'],{encoding:'utf8',env:env(f),timeout:30000});assert.equal(r.status,0,r.stderr);assert.equal(binding(f,'claude',f.home).provider,'global');assert.deepEqual(fs.readFileSync(entry),bytes);assert.equal(fs.existsSync(path.join(f.home,'.claude/rules/gds-task-observer.md')),false);});
test('global detection in dry run changes no project files',t=>{const f=fixture(t);global(f);const r=install(f,['--dry-run']);assert.equal(r.status,0,r.stderr);assert.deepEqual(fs.readdirSync(f.project),[]);});
test('read-only helper preserves omit preference instead of silently choosing a provider',t=>{const f=fixture(t);global(f);const b={provider:'none',enabled:false};assert.equal(resolveProviderBinding({...f,host:'claude',binding:b,env:env(f)}),b);});

test('new user-scope bundled installation remains its own single provider on repeat',t=>{const f=fixture(t);const args=[path.join(pkg,'scripts/install.mjs'),'--target','claude','--scope','user','--observer-mode','auto'];for(let i=0;i<2;i++){const r=spawnSync(process.execPath,args,{encoding:'utf8',env:env(f),timeout:30000});assert.equal(r.status,0,r.stderr);assert.equal(binding(f,'claude',f.home).provider,'bundled');assert.equal(status(f).runNow,true);}});
test('explicit omission cannot be overridden by an explicit bundled capture request',()=>{const r=resolveActivation({binding:{provider:'none',enabled:false},explicit:true});assert.equal(r.runNow,false);assert.equal(r.delegateGlobal,false);});

test('Codex discovers a personal observer in the legacy or configured Codex skills directory',t=>{
 for (const custom of [false,true]) {
  const f=fixture(t),folder=custom?path.join(f.home,'custom-codex'):path.join(f.home,'.codex');
  const entry=path.join(folder,'skills/task-observer/SKILL.md');fs.mkdirSync(path.dirname(entry),{recursive:true});
  fs.writeFileSync(entry,'---\nname: task-observer\n---\nExisting global observer.\n');
  const environment=env(f);if(custom)environment.CODEX_HOME=folder;
  const discovered=discoverGlobalObserver({...f,host:'codex',env:environment});
  assert.equal(discovered.entry_path,entry);assert.equal(discovered.available,true);
  const resolved=resolveProviderBinding({...f,host:'codex',binding:{provider:'bundled',activation_mode:'auto'},env:environment});
  assert.equal(resolveActivation({binding:resolved}).runNow,false);
  assert.equal(resolveActivation({binding:resolved,explicit:true}).delegateGlobal,true);
 }
});
test('Codex project install preserves a legacy global observer and adds no bundled startup',t=>{
 const f=fixture(t),entry=path.join(f.home,'.codex/skills/task-observer/SKILL.md');
 fs.mkdirSync(path.dirname(entry),{recursive:true});fs.writeFileSync(entry,'---\nname: task-observer\n---\nNative observer.\n');const before=fs.readFileSync(entry);
 const result=install(f,['--target','codex','--observer-mode','auto']);assert.equal(result.status,0,result.stderr);
 assert.equal(binding(f,'codex').provider,'global');assert.deepEqual(fs.readFileSync(entry),before);
 assert.equal(fs.existsSync(path.join(f.project,'.agents/skills/task-observer')),false);
 assert.equal(fs.existsSync(path.join(f.project,'AGENTS.md')),false);
});

test('a project bundled install hands off to a newly installed global owner without comparing local ownership',t=>{
 const f=fixture(t);assert.equal(install(f,['--observer-mode','auto']).status,0);
 assert.equal(binding(f).owned_companion,null);global(f);
 const resolved=status(f,true);assert.equal(resolved.delegateGlobal,true);assert.equal(resolved.runNow,false);
 assert.equal(resolved.reason,'explicit-global-handoff');
});

function installUser(f,args=[]){return spawnSync(process.execPath,[path.join(pkg,'scripts/install.mjs'),'--target','claude','--scope','user','--observer-mode','auto',...args],{encoding:'utf8',env:env(f),timeout:30000});}
test('legacy user-owned companion survives upgrade with a receipt for its actual preserved bytes',t=>{
 const f=fixture(t),entry=global(f);const legacy=fs.readFileSync(path.join(pkg,'tests/fixtures/observer-a3b6307.txt'));
 fs.writeFileSync(entry,legacy);
 const config=path.join(f.home,'.claude/skills/gds-superpowers/config/observer.json');fs.mkdirSync(path.dirname(config),{recursive:true});
 fs.writeFileSync(config,JSON.stringify({schema_version:2,scope:'user',skill_name:'task-observer',activation_mode:'auto',enabled:true}));
 assert.equal(status(f).runNow,true);
 const result=installUser(f);assert.equal(result.status,0,result.stderr);
 assert.deepEqual(fs.readFileSync(entry),legacy);assert.equal(binding(f,'claude',f.home).provider,'bundled');
 assert.equal(binding(f,'claude',f.home).owned_companion.sha256,discoverGlobalObserver({...f,host:'claude',env:env(f)}).sha256);
 assert.equal(status(f).runNow,true);assert.equal(installUser(f).status,0);
});
test('user then project install keeps one global entry and permits one explicit handoff',t=>{
 const f=fixture(t);assert.equal(installUser(f).status,0);
 const entry=path.join(f.home,'.claude/skills/task-observer/SKILL.md'),before=fs.readFileSync(entry);
 const installed=install(f,['--observer-mode','auto','--no-start']);assert.equal(installed.status,0,installed.stderr);assert.match(installed.stdout,/explicit global handoff only/);
 assert.equal(binding(f).provider,'global');assert.equal(status(f).runNow,false);assert.equal(status(f,true).delegateGlobal,true);
 assert.deepEqual(fs.readFileSync(entry),before);assert.equal(fs.existsSync(path.join(f.project,'.claude/skills/task-observer')),false);
});
test('owned global status tolerates a symlinked host directory without changing identity',t=>{
 const f=fixture(t);assert.equal(installUser(f).status,0);
 const linked=path.join(f.home,'.claude'),actual=path.join(f.home,'claude-dotfiles');fs.renameSync(linked,actual);fs.symlinkSync(actual,linked,'dir');
 assert.equal(status(f).runNow,true);assert.equal(status(f,true).runNow,true);
});
test('missing owned companion blocks capture with a bundled diagnostic',t=>{
 const f=fixture(t);assert.equal(installUser(f).status,0);fs.unlinkSync(path.join(f.home,'.claude/skills/task-observer/SKILL.md'));
 for(const explicit of [false,true]){const result=status(f,explicit);assert.equal(result.provider,'bundled');assert.equal(result.runNow,false);assert.equal(result.delegateGlobal,false);assert.equal(result.reason,'bundled-companion-missing');}
});
test('a changed owned companion never recovers ownership through legacy recognition',t=>{
 const f=fixture(t);assert.equal(installUser(f).status,0);fs.appendFileSync(path.join(f.home,'.claude/skills/task-observer/SKILL.md'),'Custom changes.');
 const result=status(f,true);assert.equal(result.runNow,false);assert.equal(result.delegateGlobal,false);assert.equal(result.provider,'bundled');assert.equal(result.reason,'bundled-companion-modified');
 const config=path.join(f.home,'.claude/skills/gds-superpowers/config/observer.json'),rules=path.join(f.home,'.claude/rules/gds-task-observer.md');
 const beforeConfig=fs.readFileSync(config),beforeRules=fs.readFileSync(rules);
 const installResult=installUser(f);assert.notEqual(installResult.status,0);assert.match(installResult.stderr,/Owned companion requires reconciliation/);
 assert.deepEqual(fs.readFileSync(config),beforeConfig);assert.deepEqual(fs.readFileSync(rules),beforeRules);
});

test('installer rechecks global bytes after planning and refuses before project writes',t=>{
 const f=fixture(t),entry=global(f),hook=path.join(f.base,'concurrent-change.mjs');
 fs.writeFileSync(hook,`import fs from 'node:fs';
const write=process.stdout.write.bind(process.stdout);let changed=false;
process.stdout.write=(chunk,...args)=>{if(!changed&&String(chunk).startsWith('Task-Observer choice:')){changed=true;fs.appendFileSync(${JSON.stringify(entry)},'Concurrent external edit.');}return write(chunk,...args);};
`);
 const result=spawnSync(process.execPath,['--import',pathToFileURL(hook).href,path.join(pkg,'scripts/install.mjs'),'--target','claude','--scope','project','--project',f.project],{encoding:'utf8',env:env(f),timeout:30000});
 assert.notEqual(result.status,0);assert.match(result.stderr,/Global observer changed during installation planning/);
 assert.deepEqual(fs.readdirSync(f.project),[]);
});

test('canonical host aliases preserve owned identity during read-only status resolution',t=>{
 const f=fixture(t);assert.equal(installUser(f).status,0);const linked=path.join(f.home,'.claude'),actual=path.join(f.home,'claude-dotfiles');
 fs.renameSync(linked,actual);fs.symlinkSync(actual,linked,'dir');
 const resolved=resolveProviderBinding({...f,host:'claude',binding:binding(f,'claude',f.home),env:{...env(f),CLAUDE_CONFIG_DIR:actual}});
 assert.equal(resolved.provider,'bundled');assert.equal(resolveActivation({binding:resolved}).runNow,true);
});

test('projects honor a modified global owner receipt instead of adopting changed bytes',t=>{
 const f=fixture(t);assert.equal(installUser(f).status,0);assert.equal(install(f,['--no-start']).status,0);
 const entry=path.join(f.home,'.claude/skills/task-observer/SKILL.md');fs.appendFileSync(entry,'Edited owner.');
 const result=status(f,true);assert.equal(result.runNow,false);assert.equal(result.delegateGlobal,false);assert.equal(result.reason,'bundled-companion-modified');
 const config=path.join(f.project,'.claude/skills/gds-superpowers/config/observer.json'),before=fs.readFileSync(config);
 const reinstall=install(f,['--no-start']);assert.notEqual(reinstall.status,0);assert.match(reinstall.stderr,/Owned companion requires reconciliation/);assert.deepEqual(fs.readFileSync(config),before);
 const fresh=path.join(f.base,'new-project');fs.mkdirSync(fresh);const attempt=install({...f,project:fresh},['--no-start']);assert.notEqual(attempt.status,0);assert.deepEqual(fs.readdirSync(fresh),[]);
});
test('changing the selected name does not misreport an existing owned companion as missing',t=>{
 const f=fixture(t);assert.equal(installUser(f,['--observer-name','gd-task-observer']).status,0);
 const result=installUser(f,['--observer-name','another-observer']);assert.notEqual(result.status,0);assert.match(result.stderr,/bundled-companion-not-selected/);
 assert.ok(fs.existsSync(path.join(f.home,'.claude/skills/gd-task-observer/SKILL.md')));
});
