#!/usr/bin/env node
/** Install the skill with optional aliases/agents; upgrade only recognized clean files. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {chooseMode,planBinding,planInstructions,instructionDestination,startupBody,activationPrompt} from './observer-activation.mjs';
import {planCompatibility} from './compatibility.mjs';
import {treeFiles,safeRoot} from './lib.mjs';
import {planManaged,applyManaged,sha256} from './managed-install.mjs';
const pkg=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const usage=`Usage: node scripts/install.mjs --target claude|codex|both --scope project|user
 [--project /existing/game] [--agents] [--optional-agents] [--upgrade] [--dry-run]
 [--start-name start|gd-start|CUSTOM] [--no-start]
 [--observer-name task-observer|gd-task-observer|CUSTOM] [--no-observer]
 [--observer-mode auto|manual] [--activate-now claude|codex]
 [--activation-project /existing/game]

Default aliases: Claude /start; Codex $start (not a guaranteed /start).
--upgrade replaces recognized clean v0.1.0 through v0.3.1 GDS files, with backups.
Existing Task-Observer installations are preserved, not upgraded or merged.
Without --observer-mode a real terminal asks yes/no; non-interactive callers must ask the user and pass their choice.
Manual mode keeps /gds-superpowers observe available (Codex: $gds-superpowers observe).
Auto mode writes a small startup rule and a saved activation prompt, with backups for changed files.
--activate-now submits that prompt to ONE installed local CLI with normal permissions.
User/global activation needs --activation-project; no repository is guessed.
No downloads, permission bypasses, live skill self-edits, project migration, or forced overwrite.`;
try{
 const a=process.argv.slice(2),o={agents:false,dryRun:false,upgrade:false,startName:'start',noStart:false,observerName:'task-observer',noObserver:false};
 for(let i=0;i<a.length;i++){
  const arg=a[i];
  if(['--help','-h'].includes(arg)){console.log(usage);process.exit(0);}
  if(arg==='--optional-agents')o.optionalAgents=true;else if(arg==='--agents')o.agents=true;else if(arg==='--upgrade')o.upgrade=true;
  else if(arg==='--no-observer')o.noObserver=true;
  else if(arg==='--dry-run')o.dryRun=true;else if(arg==='--no-start')o.noStart=true;
  else if(['--target','--scope','--project','--start-name','--observer-name','--observer-mode','--activate-now','--activation-project'].includes(arg)){
   const val=a[++i];if(!val||val.startsWith('--'))throw Error(`Missing value for ${arg}`);
   o[{'--start-name':'startName','--observer-name':'observerName','--observer-mode':'observerMode','--activate-now':'activateNow','--activation-project':'activationProject'}[arg]??arg.slice(2)]=val;
  }else throw Error(`Unknown argument ${arg}`);
 }
 if(!['claude','codex','both'].includes(o.target))throw Error('--target must be claude, codex, or both');
 if(!['project','user'].includes(o.scope))throw Error('--scope must be project or user');
 if(o.scope==='project'&&!o.project)throw Error('Project scope requires --project');
 if(o.scope==='user'&&o.project)throw Error('User scope does not accept --project');
 if(!/^[a-z][a-z0-9-]{0,40}$/.test(o.startName)||['gds-superpowers','gdsuperpowers','synced','anthropic-skills'].includes(o.startName))throw Error('Invalid or reserved --start-name');
 if(!/^[a-z][a-z0-9-]{0,40}$/.test(o.observerName)||['gds-superpowers','gdsuperpowers','start',o.startName,'synced','anthropic-skills'].includes(o.observerName))throw Error('Invalid or reserved --observer-name');
 const home=safeRoot(os.homedir());
 const root=safeRoot(o.scope==='project'?path.resolve(o.project):home);
 if(!fs.statSync(root).isDirectory())throw Error('Installation root must be an existing directory');
 const targets=o.target==='both'?['claude','codex']:[o.target];
 const choice=await chooseMode({mode:o.observerMode,noObserver:o.noObserver});
 o.observerMode=choice.mode;
 if(o.activateNow&&!targets.includes(o.activateNow))throw Error('--activate-now must name one selected target: claude or codex');
 if(o.activateNow&&o.observerMode!=='auto')throw Error('--activate-now requires --observer-mode auto');
 if(o.activationProject&&!o.activateNow)throw Error('--activation-project requires --activate-now');
 if(o.scope==='project'&&o.activationProject)throw Error('Project activation already uses --project; omit --activation-project');
 if(o.scope==='user'&&o.activateNow&&!o.activationProject)throw Error('Global activation needs --activation-project /existing/game; no repository is inferred');
 let activationRoot=o.scope==='project'?root:null;
 if(o.activationProject){activationRoot=safeRoot(o.activationProject);if(!fs.statSync(activationRoot).isDirectory())throw Error('Activation project must be a directory');}
 // User scope writes to ~/.codex and ~/.claude; auto mode also writes startup rules there.
 if(o.observerMode==='auto'||o.scope==='user'){
  if(targets.includes('codex')&&process.env.CODEX_HOME&&path.resolve(process.env.CODEX_HOME)!==path.join(home,'.codex'))throw Error('Custom CODEX_HOME needs a reviewed custom installation layout; nothing was installed or configured');
  if(targets.includes('claude')&&process.env.CLAUDE_CONFIG_DIR&&path.resolve(process.env.CLAUDE_CONFIG_DIR)!==path.join(home,'.claude'))throw Error('Custom CLAUDE_CONFIG_DIR needs a reviewed custom installation layout; nothing was installed or configured');
 }
 console.log(`Task-Observer choice: ${o.observerMode}${o.noObserver?' (companion omitted)':''}; scope: ${o.scope}.`);
 const sourceFiles=treeFiles(pkg),files=[],activationPlans=[],prompts={};
 const records=['0.1.0','0.2.0','0.3.0','0.3.1'].map(version=>JSON.parse(fs.readFileSync(path.join(pkg,`baselines/v${version}.json`),'utf8')));
 for(const target of targets){
  const host=target==='claude'?'.claude':'.agents',dest=path.join(root,host,'skills/gds-superpowers');
  const rel=path.relative(pkg,dest);if(!rel.startsWith('..')&&!path.isAbsolute(rel))throw Error('Do not install inside the unpacked package itself; choose the game repository.');
  const compatibility=planCompatibility(root,host,records);
  if(target==='claude'&&fs.existsSync(path.join(root,'.claude/commands/gdsuperpowers.md')))throw Error('Legacy /gdsuperpowers command collision: reconcile before installation');
  files.push(compatibility.file);
  for(const source of sourceFiles){
   const key=path.relative(pkg,source).split(path.sep).join('/');let content=fs.readFileSync(source);
   if(key==='config/observer.json'){
    activationPlans.push(planBinding(root,path.join(dest,key),compatibility.importedSettings??JSON.parse(content),{mode:o.observerMode,scope:o.scope,skillName:o.observerName,enabled:!o.noObserver,source:choice.source}));
    continue;
   }
   files.push({key,destination:path.join(dest,key),content});
  }
  const configPath=path.join(dest,'config/observer.json');
  const instructionPath=instructionDestination(root,target,o.scope);
  const startup=planInstructions(root,instructionPath,o.observerMode==='auto'?startupBody({host:target,scope:o.scope,configPath}):null);
  if(startup)activationPlans.push(startup);
  prompts[target]=activationPrompt({host:target,scope:o.scope,root,configPath});
  const promptPath=path.join(root,target==='claude'?'.claude':'.codex','gdsuperpowers-observer-startup.md');
  const promptPlan=planInstructions(root,promptPath,o.observerMode==='auto'?prompts[target]:null);
  if(promptPlan)activationPlans.push(promptPlan);
  if(!o.noObserver){
   const candidateRoots=[];let current=root;
   while(true){candidateRoots.push(current);const parent=path.dirname(current);if(parent===current)break;current=parent;}
   if(!candidateRoots.includes(home))candidateRoots.push(home);
   const candidates=candidateRoots.flatMap(base=>[path.join(base,host,'skills',o.observerName),...(target==='claude'?[path.join(base,host,'commands',o.observerName+'.md')]:[])]);
   const present=candidates.filter(f=>{try{fs.lstatSync(f);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}});
   if(present.length){
    console.log(`PRESERVE existing ${o.observerName}: ${present.join(', ')}. No companion files merged; inspect actual host resolution and completeness.`);
   }else{
    const src=path.join(pkg,'companions/task-observer');
    for(const file of treeFiles(src)){
     const relative=path.relative(src,file).split(path.sep).join('/');
     const installed=relative==='SKILL.template.md'?'SKILL.md':relative;
     let content=fs.readFileSync(file);
     if(relative==='SKILL.template.md')content=Buffer.from(content.toString('utf8').replace(/^name: task-observer$/m,`name: ${o.observerName}`).replaceAll('/task-observer ',`/${o.observerName} `).replaceAll('$task-observer ',`$${o.observerName} `));
     if(relative==='agents/openai.yaml')content=Buffer.from(content.toString('utf8').replaceAll('$task-observer',`$${o.observerName}`));
     files.push({key:`observer:${target}:${o.observerName}:${relative}`,destination:path.join(root,host,'skills',o.observerName,installed),content});
    }
   }
  }
  if(o.agents){
   const src=path.join(pkg,'adapters',`${target}-agents`),dir=path.join(root,target==='claude'?'.claude':'.codex','agents');
   for(const f of treeFiles(src))files.push({key:path.relative(pkg,f).split(path.sep).join('/'),destination:path.join(dir,path.relative(src,f)),content:fs.readFileSync(f)});
  }
  if(o.optionalAgents){
   const src=path.join(pkg,'adapters',`optional-${target}-agents`),dir=path.join(root,target==='claude'?'.claude':'.codex','agents');
   for(const f of treeFiles(src))files.push({key:path.relative(pkg,f).split(path.sep).join('/'),destination:path.join(dir,path.relative(src,f)),content:fs.readFileSync(f)});
  }
  if(!o.noStart){
   if(target==='claude'){
    const collision=path.join(root,'.claude/commands',`${o.startName}.md`);
    if(fs.existsSync(collision))throw Error(`Existing /${o.startName} command at ${collision}. Use --start-name gd-start or --no-start.`);
    if(root!==home)for(const personal of [path.join(home,'.claude/commands',`${o.startName}.md`),path.join(home,'.claude/skills',o.startName,'SKILL.md')])if(fs.existsSync(personal))throw Error(`Personal /${o.startName} can shadow this project: ${personal}. Choose --start-name or --no-start.`);
   }
   const src=path.join(pkg,`adapters/start-${target}`);
   for(const f of treeFiles(src)){
    const content=fs.readFileSync(f,'utf8').replace(/^name: start$/m,`name: ${o.startName}`).replaceAll('$start',`$${o.startName}`);
    files.push({key:`alias:${target}:${o.startName}:${path.relative(src,f)}`,destination:path.join(root,host,'skills',o.startName,path.relative(src,f)),content});
   }
  }
 }
 const baseline={};
 for(const version of ['0.1.0','0.2.0','0.3.0','0.3.1']){
  const record=JSON.parse(fs.readFileSync(path.join(pkg,`baselines/v${version}.json`),'utf8'));
  for(const [key,hash]of Object.entries(record.sha256))(baseline[key]??=[]).push(hash);
  for(const [host,templates]of Object.entries(record.alias_templates??{}))for(const [relative,template]of Object.entries(templates)){
   const text=template.replace(/^name: start$/m,`name: ${o.startName}`).replaceAll('$start',`$${o.startName}`);
   (baseline[`alias:${host}:${o.startName}:${relative}`]??=[]).push(sha256(text));
  }
 }
 baseline['compat:gdsuperpowers']=records.map(record=>record.sha256['SKILL.md']);
 const gitBaseline=JSON.parse(fs.readFileSync(path.join(pkg,'baselines/claude-cdbebc2.json'),'utf8'));
 for(const [key,hash]of Object.entries(gitBaseline.blobs))(baseline[key]??=[]).push('git:'+hash);
 const plan=[...planManaged(root,files,{upgrade:o.upgrade,baseline}),...activationPlans];
 if(new Set(plan.map(f=>f.destination)).size!==plan.length)throw Error('Duplicate installation destination');
 for(const f of plan)console.log(`${o.dryRun?'PREVIEW ':''}${f.action}: ${f.destination}`);
 const result=applyManaged(root,plan,{dryRun:o.dryRun});
 if(o.dryRun)console.log('Dry run only. No files changed.');
 else console.log(`${result.created} files created; ${result.updated} files updated; ${plan.filter(x=>x.action==='unchanged').length} unchanged. Backup: ${result.backup??'not needed'}`);
 if(o.observerMode==='manual')console.log('Automatic Task-Observer is off. Activate it when needed with /gds-superpowers observe (Codex: $gds-superpowers observe). Existing independently configured hooks are not disabled.');
 else if(o.dryRun)console.log('PREVIEW automatic startup configuration only. No prompt submitted and no agent launched.');
 else if(o.activateNow){
  console.log(`Submitting observer initialization prompt to ${o.activateNow} in ${activationRoot}. Existing host permissions and account usage apply.`);
  const launched=spawnSync(o.activateNow,[prompts[o.activateNow]],{cwd:activationRoot,stdio:'inherit',shell:false});
  if(launched.error)throw Error(`Files installed, but activation prompt was not submitted: ${launched.error.message}. Use the saved startup prompt in the repository session.`);
  console.log(`Activation prompt submitted; host exit code ${launched.status??'signal '+launched.signal}. Inspect the host response to confirm actual initialization.`);
  if(launched.status!==0)process.exitCode=1;
 }else{
  console.log('Automatic startup is configured. Activation prompt saved but not submitted to a running conversation. New host sessions load the startup instructions; live initialization remains unverified.');
  console.log('For immediate submission rerun with --activate-now claude or codex (global: also --activation-project). In an assistant-led installation, execute the saved initialization prompt in the active repository session now.');
 }
 console.log('Confirm skill discovery in the host. Superpowers remains separate; adapted BMAD Quick Flow needs no BMAD installation.');
}catch(e){console.error(`GDSuperpowers install refused: ${e.message}`);process.exitCode=1;}
