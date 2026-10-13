#!/usr/bin/env node
/** MIT. Explicit local operations only. No install/apply/rollback command. */
import fs from 'node:fs';
import path from 'node:path';
import {readState,updateState,recordObservation,listObservations,decideObservation,setObserverMode,stageCandidate,reconcileStage,validateObserver} from './observer-core.mjs';
const usage=`Task-Observer Lite helper (Node 18+)
 list|record|decide|mode|stage|reconcile|check --project /existing/game
 [--state docs/gds/state.json]
 record --input /explicit/observation.json
 decide --id OBS-ID --decision accepted|rejected|deferred --approval-ref MESSAGE
 mode --value on|off
 stage --id OBS-ID --target .claude/skills/NAME/FILE --replacement /candidate/file
 reconcile --stage .gds-superpowers-observer/staged/STAGE/manifest.json
No model calls, automatic observation, live patching, or approval authentication.`;
try{
 const [command,...args]=process.argv.slice(2);
 if(!command||['--help','-h','help'].includes(command)){console.log(usage);process.exit(0);}
 const allowed={list:[],check:[],record:['input'],decide:['id','decision','approval-ref'],mode:['value'],stage:['id','target','replacement'],reconcile:['stage']};
 if(!Object.hasOwn(allowed,command))throw Error('Unknown command; no live apply command is provided');
 const o={state:'docs/gds/state.json'};
 for(let n=0;n<args.length;n++){
  const k=args[n].replace(/^--/,'');if(!args[n].startsWith('--')||!['project','state',...allowed[command]].includes(k))throw Error(`Unexpected argument ${args[n]}`);
  const v=args[++n];if(!v||v.startsWith('--'))throw Error(`Missing ${k}`);o[k]=v;
 }
 if(!o.project)throw Error('--project is required');const selected=path.resolve(o.project);if(fs.lstatSync(selected).isSymbolicLink())throw Error('Symlink root refused');const root=fs.realpathSync(selected);if(!fs.statSync(root).isDirectory())throw Error('Project must be a directory');
 let result;
 if(command==='reconcile')result=reconcileStage(root,o.stage);
 else if(command==='record'){
  if(!o.input)throw Error('--input is required');const st=fs.statSync(o.input);if(!st.isFile()||st.size>32768)throw Error('Input must be a small JSON file');
  const input=JSON.parse(fs.readFileSync(o.input,'utf8'));
  const r=updateState(root,o.state,s=>recordObservation(s,input));result={id:r.id,changed:r.changed,distinct_task_episodes:r.episodes,installed:false};
 }else if(command==='decide'){
  updateState(root,o.state,s=>decideObservation(s,o.id,o.decision,o['approval-ref']));result={id:o.id,decision:o.decision,installed:false};
 }else if(command==='mode'){
  if(!['on','off'].includes(o.value))throw Error('--value must be on or off');updateState(root,o.state,s=>setObserverMode(s,o.value==='on'));result={enabled:o.value==='on'};
 }else{
  const {state}=readState(root,o.state);
  if(command==='list')result={enabled:state.observer?.enabled??true,observations:listObservations(state)};
  if(command==='check')result={errors:state.observer===undefined?[]:validateObserver(state.observer),evidence_authenticated:false};
  if(command==='stage'){if(!o.replacement)throw Error('--replacement is required');result=stageCandidate(root,state,{id:o.id,target:o.target,replacement:o.replacement});}
 }
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error(`Task-Observer refused: ${e.message}`);process.exitCode=1;}
