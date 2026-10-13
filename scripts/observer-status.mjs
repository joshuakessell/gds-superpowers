#!/usr/bin/env node
/** Read only the selected project's observer preferences and the relevant personal default. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {resolveActivation} from './observer-activation.mjs';
import {safeDestination,safeRoot} from './lib.mjs';
try {
 const args=process.argv.slice(2),o={explicit:false,state:'docs/gds/state.json'};
 for(let i=0;i<args.length;i++) {
  const key=args[i];
  if(key==='--explicit'){o.explicit=true;continue;}
  if(!['--project','--host','--state'].includes(key))throw Error('Use --project /repo --host claude|codex [--state relative/path.json] [--explicit]');
  const value=args[++i];if(!value||value.startsWith('--'))throw Error(`Missing ${key}`);o[key.slice(2)]=value;
 }
 if(!o.project||!['claude','codex'].includes(o.host))throw Error('--project and --host claude|codex are required');
 const root=safeRoot(o.project),home=safeRoot(os.homedir()),host=o.host==='claude'?'.claude':'.agents';
 const config=base=>path.join(base,host,'skills/gds-superpowers/config/observer.json');
 const read=f=>{
  if(!fs.existsSync(f))return undefined;
  if(!fs.statSync(f).isFile()||fs.statSync(f).size>2*1024*1024)throw Error(`Not a small regular file: ${f}`);
  return JSON.parse(fs.readFileSync(f,'utf8'));
 };
 let projectBinding,source;let at=root;
 while(at!==home){const f=config(at),b=read(f);if(b){projectBinding=b;source=f;break;}const parent=path.dirname(at);if(parent===at)break;at=parent;}
 const binding=read(config(home));
 const statePath=safeDestination(root,path.resolve(root,o.state)),state=read(statePath);
 const result=state?.migration?.review_required?{automatic:false,runNow:false,reason:'migration-reconciliation-required'}:resolveActivation({binding,projectBinding,stateObserver:state?.observer,explicit:o.explicit});
 console.log(JSON.stringify({...result,configuration:source??(binding?config(home):null),project:root,state_present:!!state,initialized:false,note:'Read-only resolution, not proof of live observation.'},null,2));
}catch(e){console.error(`Observer status refused: ${e.message}`);process.exitCode=1;}
