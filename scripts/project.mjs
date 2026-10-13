#!/usr/bin/env node
/** Minimal records and read-only checks. Never invokes a model or edits game code. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {planWrites,applyWrites,validateState,validateProgression,safeRoot} from './lib.mjs';
import {validateQuickState,recommendNext} from './quickflow.mjs';
import {validateObserver} from '../companions/task-observer/scripts/observer-core.mjs';
const pkg=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const usage='Usage: node scripts/project.mjs init|check|next --project /existing/game [--dry-run] [--legacy]';
try{
 const args=process.argv.slice(2);
 if(args.includes('--help')||args.includes('-h')){console.log(usage);process.exit(0);}
 const action=args.shift();if(!['init','check','next'].includes(action))throw Error(usage);
 let project,dryRun=false,legacy=false;
 for(let i=0;i<args.length;i++){
  if(args[i]==='--project'){project=args[++i];if(!project||project.startsWith('--'))throw Error('Missing project');}
  else if(args[i]==='--dry-run')dryRun=true;
  else if(args[i]==='--legacy')legacy=true;
  else throw Error(`Unknown argument ${args[i]}`);
 }
 if(!project)throw Error('--project required');
 if(action!=='init'&&(dryRun||legacy))throw Error('--dry-run and --legacy apply only to init');
 const root=safeRoot(project);if(!fs.statSync(root).isDirectory())throw Error('Project must be an existing directory');
 const docs=path.join(root,'docs/gds'),statePath=path.join(docs,'state.json');
 // The safety helper checks paths before existing state is read.
 for(const part of ['docs','docs/gds','docs/gds/state.json']){
  try{if(fs.lstatSync(path.join(root,part)).isSymbolicLink())throw Error(`Symlink state path refused: ${part}`);}catch(e){if(e.code!=='ENOENT')throw e;}
 }
 if(action==='init'){
  if(fs.existsSync(statePath)){
   const existing=JSON.parse(fs.readFileSync(statePath,'utf8'));
   if(![1,2,3].includes(existing.schema_version)&&existing.schemaVersion!==1)throw Error('Unknown existing state version; inspect before initializing');
   console.log(`Existing schema ${existing.schema_version??existing.schemaVersion} state preserved. ${existing.schema_version===3?'Resume it.':'Review scripts/migrate-state.mjs --project /repo --dry-run.'} No records overwritten or migrated.`);process.exit(0);
  }
  const pairs=legacy?[['state.json','state.json'],['index.md','index.md']]:[['state.json','quick-state.json'],['game.md','game.md'],['next.md','next.md']];
  const plan=planWrites(root,pairs.filter(([dest])=>{if(fs.existsSync(path.join(docs,dest))){console.log(`PRESERVE ${path.join(docs,dest)}`);return false;}return true;}).map(([dest,source])=>({destination:path.join(docs,dest),content:fs.readFileSync(path.join(pkg,'templates',source))})));
  for(const p of plan)console.log(`${dryRun?'PREVIEW ':''}${p.action}: ${p.destination}`);
  applyWrites(root,plan,{dryRun});console.log(dryRun?'No files changed.':'Starter records created. No game direction or approval has been assumed.');
 }else{
  const state=JSON.parse(fs.readFileSync(statePath,'utf8'));
  if(state.schemaVersion===1||state.schema_version===2){console.log('Legacy state preserved. Preview explicit migration with node scripts/migrate-state.mjs --project /repo --dry-run; no automatic state conversion.');process.exit(0);}
  const result=state.schema_version===1?validateState(state):validateQuickState(state);
  if(state.observer!==undefined)result.errors.push(...validateObserver(state.observer));
  if(action==='check'){
   const progression=path.join(docs,'progression.json');
   if(fs.existsSync(progression)){
    if(fs.lstatSync(progression).isSymbolicLink())throw Error('Symlink progression path refused');
    const p=validateProgression(JSON.parse(fs.readFileSync(progression,'utf8')));result.errors.push(...p.errors);result.warnings.push(...p.warnings);
   }
  }
  for(const e of result.errors)console.error(`ERROR ${e}`);
  for(const e of result.warnings)console.log(`WARNING ${e}`);
  if(result.errors.length){process.exitCode=1;}
  else if(action==='next'){
   if(state.schema_version===1)console.log('Legacy project: use GDSuperpowers resume with its existing phases and document pointers. No automatic state migration.');
   else console.log(JSON.stringify(recommendNext(state),null,2));
  }else console.log('0 structural errors. Actual execution and evidence still require inspection.');
 }
}catch(e){console.error(`GDSuperpowers project: ${e.message}`);process.exitCode=1;}
