/** MIT. Local observation records and staged text candidates. No network or model calls. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const text = (x, max=1200) => typeof x === 'string' && x.trim().length > 0 && x.length <= max;
const kinds = ['user-correction','repeated-failure','successful-pattern','missing-skill','workflow-friction','scope-drift','observer-improvement'];
const evidenceKinds = ['user','test','artifact','agent-report','human-playtest','source'];
const evidenceValid = x => Array.isArray(x) && x.length>0 && x.length<=12 && x.every(e=>object(e)&&text(e.ref,500)&&evidenceKinds.includes(e.kind));
const forbiddenSecret = /-----BEGIN [A-Z ]*PRIVATE KEY-----|\bBearer\s+[A-Za-z0-9._-]{16,}|\b(?:sk|ghp|github_pat)[_-][A-Za-z0-9_-]{20,}/;
export function emptyObserver(){ return {schema_version:1,enabled:true,observations:[]}; }
export function validateObserver(o){
 const errors=[];
 if(!object(o))return ['Observer must be an object'];
 if(o.schema_version!==1)errors.push('Unknown observer schema; preserve it for manual reconciliation');
 if(typeof o.enabled!=='boolean')errors.push('Observer enabled must be boolean');
 if(o.automatic!==undefined&&typeof o.automatic!=='boolean')errors.push('Observer automatic must be boolean');
 if(o.mode_set_at!==undefined&&(typeof o.mode_set_at!=='string'||!Number.isFinite(Date.parse(o.mode_set_at))))errors.push('Invalid observer mode timestamp');
 if(!Array.isArray(o.observations))return [...errors,'Observer observations must be an array'];
 if(o.observations.length>100)errors.push('Compact observer limit is 100; archive only with reviewed backup');
 const ids=new Set(),patterns=new Set();
 for(const e of o.observations){
  if(!object(e)){errors.push('Observation must be an object');continue;}
  if(!/^OBS-[a-f0-9]{16}$/.test(e.id??'')||ids.has(e.id))errors.push('Invalid or duplicate observation id');ids.add(e.id);
  if(!text(e.fingerprint)||patterns.has(e.fingerprint))errors.push('Missing or duplicate pattern fingerprint');patterns.add(e.fingerprint);
  if(!kinds.includes(e.kind)||!['project','skill','cross-skill'].includes(e.scope))errors.push('Invalid kind or scope');
  for(const k of ['target','pattern_key','summary','proposal','counterexample','test'])if(!text(e[k]))errors.push(`Missing ${k}`);
  if(!['hypothesis','observed-signal'].includes(e.confidence)||!['normal','important'].includes(e.severity))errors.push('Invalid confidence or severity');
  if(!['proposed','accepted','rejected','deferred'].includes(e.status))errors.push('Invalid observation status');
  if(!Array.isArray(e.occurrences)||!e.occurrences.length)errors.push('Observation needs an occurrence');
  else for(const x of e.occurrences)if(!object(x)||!['session_id','task_id','checkpoint_id','at'].every(k=>text(x[k],200))||!evidenceValid(x.evidence))errors.push('Invalid occurrence');
  if(!Array.isArray(e.decisions))errors.push('Decisions must be an array');
  else for(const d of e.decisions)if(!object(d)||!['accepted','rejected','deferred'].includes(d.decision)||!text(d.source_ref,500)||!text(d.at,200))errors.push('Invalid decision');
  if(e.status!=='proposed' && (!e.decisions?.length||e.decisions.at(-1)?.decision!==e.status))errors.push('Status requires matching review decision');
 }
 return [...new Set(errors)];
}
function stateObserver(s){
 if(!object(s)||![1,2,3].includes(s.schema_version))throw Error('Requires an existing GDS schema-1, schema-2, or schema-3 state');
 const o=s.observer===undefined?emptyObserver():s.observer;
 const errors=validateObserver(o);if(errors.length)throw Error(errors.join('; '));return o;
}
function requireReconciled(state){
 if(state?.migration?.review_required)throw Error('Resolve migration before changing observer records or staging improvements');
}
function validInput(i){
 if(!object(i))throw Error('Observation input must be an object');
 const allowed=['kind','scope','target','pattern_key','summary','proposal','counterexample','test','confidence','severity','session_id','task_id','checkpoint_id','evidence'];
 for(const k of Object.keys(i))if(!allowed.includes(k))throw Error(`Unsupported input field: ${k}`);
 for(const k of ['target','summary','proposal','counterexample','test'])if(!text(i[k]))throw Error(`Missing or oversized ${k}`);
 for(const k of ['session_id','task_id','checkpoint_id'])if(!text(i[k],120))throw Error(`Missing ${k}`);
 if(!/^[a-z0-9][a-z0-9-]{2,99}$/.test(i.pattern_key??''))throw Error('pattern_key must be a short lowercase slug');
 if(!kinds.includes(i.kind)||!['project','skill','cross-skill'].includes(i.scope))throw Error('Invalid kind or scope');
 if(!['hypothesis','observed-signal'].includes(i.confidence)||!['normal','important'].includes(i.severity))throw Error('Invalid confidence or severity');
 if(!evidenceValid(i.evidence))throw Error('Actual evidence references required');
 if(forbiddenSecret.test(JSON.stringify(i)))throw Error('Possible credential detected; redact before recording');
}
export function recordObservation(state,input,now=new Date().toISOString()){
 requireReconciled(state); validInput(input); const s=structuredClone(state),o=stateObserver(s);if(!o.enabled)throw Error('Observer is off for this project');
 const fingerprint=[input.scope,input.target.trim().toLowerCase(),input.pattern_key].join('|');
 let entry=o.observations.find(e=>e.fingerprint===fingerprint);
 const occurrence={session_id:input.session_id,task_id:input.task_id,checkpoint_id:input.checkpoint_id,evidence:structuredClone(input.evidence),at:now};
 if(entry){
  const same=entry.occurrences.find(x=>x.session_id===input.session_id&&x.task_id===input.task_id);
  const novel=input.evidence.filter(e=>!same?.evidence.some(x=>x.ref===e.ref&&x.kind===e.kind));
  if(same&&!novel.length)return {state:s,changed:false,id:entry.id,episodes:entry.occurrences.length};
  if(same){
   if(same.evidence.length+novel.length>12)throw Error('Evidence limit reached; consolidate references explicitly');
   same.evidence.push(...novel);entry.last_seen=now;s.observer=o;
   return {state:s,changed:true,id:entry.id,episodes:entry.occurrences.length};
  }
 }
 const count=o.observations.filter(e=>e.occurrences.some(x=>x.session_id===input.session_id&&x.checkpoint_id===input.checkpoint_id)).length;
 if(count>=3)throw Error('Three-findings-per-checkpoint budget reached; do not fabricate another checkpoint to evade it');
 if(entry){
  if(entry.occurrences.length>=30)throw Error('Episode limit reached; consolidate with reviewed backup');
  entry.occurrences.push(occurrence);entry.last_seen=now;
 }else{
  if(o.observations.length>=100)throw Error('Compact observer limit reached; no history was deleted');
  const {session_id,task_id,checkpoint_id,evidence,...fields}=input;
  entry={...structuredClone(fields),id:`OBS-${sha256(fingerprint).slice(0,16)}`,fingerprint,status:'proposed',first_seen:now,last_seen:now,occurrences:[occurrence],decisions:[]};
  o.observations.push(entry);
 }
 // New evidence does not rewrite or silently reapprove the existing proposed text.
 s.observer=o;return {state:s,changed:true,id:entry.id,episodes:entry.occurrences.length};
}
export function decideObservation(state,id,decision,sourceRef,now=new Date().toISOString()){
 requireReconciled(state);
 const s=structuredClone(state),o=stateObserver(s);
 if(!['accepted','rejected','deferred'].includes(decision)||!text(sourceRef,500))throw Error('Decision and actual approval/review source reference required');
 if(!o.enabled)throw Error('Observer is off for this project');
 const e=o.observations.find(e=>e.id===id);if(!e)throw Error('Unknown observation');
 e.status=decision;e.decisions.push({decision,source_ref:sourceRef,at:now});s.observer=o;
 return s;
}
export function setObserverMode(state,enabled,now=new Date().toISOString()){
 requireReconciled(state);
 if(typeof enabled!=='boolean')throw Error('Mode must be boolean');const s=structuredClone(state),o=stateObserver(s);o.enabled=enabled;o.automatic=enabled;o.mode_set_at=now;s.observer=o;return s;
}
export function listObservations(state){return structuredClone(stateObserver(state).observations);}
export function safePath(root,relative){
 if(typeof relative!=='string'||!relative||relative.includes('\\')||path.isAbsolute(relative)||/^[A-Za-z]:/.test(relative)||relative.split('/').some(x=>x==='..'||x==='.'||!x))throw Error('Unsafe relative path');
 const selected=path.resolve(root);if(fs.lstatSync(selected).isSymbolicLink())throw Error(`Symlink root refused: ${selected}`);
 const base=fs.realpathSync(selected),dest=path.resolve(base,relative);if(!dest.startsWith(base+path.sep))throw Error('Path outside project');
 let current=base;
 for(const part of relative.split('/')){
  current=path.join(current,part);
  try{if(fs.lstatSync(current).isSymbolicLink())throw Error(`Symlink path refused: ${current}`);}catch(e){if(e.code!=='ENOENT')throw e;}
 }
 return dest;
}
export function safeSkillTarget(root,target){
 if(!/^(?:\.claude|\.agents)\/skills\/[a-z][a-z0-9-]*\/.+/.test(target??''))throw Error('Staging target must be inside a project-scoped skills directory');
 return safePath(root,target);
}
export function readState(root,relative='docs/gds/state.json'){
 const file=safePath(root,relative);if(!fs.existsSync(file)||!fs.statSync(file).isFile())throw Error('Authoritative state file missing; do not initialize a second project');
 if(fs.statSync(file).size>2*1024*1024)throw Error('State too large for this compact helper');
 const bytes=fs.readFileSync(file),state=JSON.parse(bytes);stateObserver(state);return {file,bytes,state};
}
export function updateState(root,relative,update){
 const initial=readState(root,relative),lock=safePath(root,relative+'.observer.lock');let fd;
 try{fd=fs.openSync(lock,'wx',0o600);}catch(e){throw Error(`Observer state lock unavailable: ${e.message}. Inspect other writers; do not auto-delete a lock.`);}
 let temp;
 try{
  if(!fs.readFileSync(initial.file).equals(initial.bytes))throw Error('State changed concurrently; retry after rereading');
  const result=update(initial.state),state=result?.state??result;
  stateObserver(state);const bytes=Buffer.from(JSON.stringify(state,null,2)+'\n');
  if(bytes.equals(initial.bytes))return result;
  temp=safePath(root,relative+`.observer-${crypto.randomBytes(6).toString('hex')}.tmp`);
  fs.writeFileSync(temp,bytes,{flag:'wx',mode:fs.statSync(initial.file).mode&0o777});
  safePath(root,relative);
  if(!fs.readFileSync(initial.file).equals(initial.bytes))throw Error('State changed concurrently; no update applied');
  fs.renameSync(temp,initial.file);temp=null;return result;
 }finally{
  if(temp&&fs.existsSync(temp))fs.unlinkSync(temp);
  fs.closeSync(fd);fs.unlinkSync(lock);
 }
}
function readText(file){
 const st=fs.lstatSync(file);if(!st.isFile()||st.isSymbolicLink()||st.size>1024*1024)throw Error('Expected a regular text file under 1 MiB');
 const b=fs.readFileSync(file);if(b.includes(0)||!Buffer.from(b.toString('utf8')).equals(b))throw Error('Expected UTF-8 text');return b;
}
export function stageCandidate(root,state,{id,target,replacement}){
 requireReconciled(state);
 const o=stateObserver(state);if(!o.enabled)throw Error('Observer is off for this project');
 const entry=o.observations.find(e=>e.id===id);if(!entry||entry.status!=='accepted')throw Error('Candidate requires accepted observation; this is not install approval');
 const live=safeSkillTarget(root,target),before=fs.existsSync(live)?readText(live):null,after=readText(path.resolve(replacement));
 if(forbiddenSecret.test(after.toString('utf8')))throw Error('Possible credential detected in candidate');
 if(before?.equals(after))throw Error('Candidate makes no change');
 const rel=`.gds-superpowers-observer/staged/${id}-${crypto.randomBytes(6).toString('hex')}`;
 const dir=safePath(root,rel);fs.mkdirSync(dir,{recursive:true});
 const manifest={schema_version:1,observation_id:id,proposal_fingerprint:entry.fingerprint,status:'staged-not-installed',target,before_sha256:before?sha256(before):null,after_sha256:sha256(after),review_ref:entry.decisions.at(-1).source_ref,created_at:new Date().toISOString(),note:'Acceptance permits staging only. Exact installation requires a separate approval and fresh target check.'};
 fs.writeFileSync(path.join(dir,'before.txt'),before??Buffer.alloc(0),{flag:'wx',mode:0o600});
 fs.writeFileSync(path.join(dir,'after.txt'),after,{flag:'wx',mode:0o600});
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});
 return {manifest:`${rel}/manifest.json`,...manifest};
}
export function reconcileStage(root,manifestRelative){
 if(!/^\.gds-superpowers-observer\/staged\/OBS-[a-f0-9]{16}-[a-f0-9]{12}\/manifest\.json$/.test(manifestRelative??''))throw Error('Expected a stage manifest inside the selected project');
 const file=safePath(root,manifestRelative),m=JSON.parse(readText(file));
 if(!object(m)||m.schema_version!==1||m.status!=='staged-not-installed'||!/^OBS-[a-f0-9]{16}$/.test(m.observation_id??'')||!text(m.review_ref,500)||!/^([a-f0-9]{64})$/.test(m.after_sha256??'')||(m.before_sha256!==null&&!/^[a-f0-9]{64}$/.test(m.before_sha256??'')))throw Error('Invalid stage manifest');
 const dir=path.dirname(manifestRelative),before=readText(safePath(root,`${dir}/before.txt`)),after=readText(safePath(root,`${dir}/after.txt`));
 if(sha256(after)!==m.after_sha256||(m.before_sha256===null?before.length!==0:sha256(before)!==m.before_sha256))throw Error('Staged bytes changed; review the candidate again');
 const target=safeSkillTarget(root,m.target),actual=fs.existsSync(target)?sha256(readText(target)):null;
 const status=actual===m.after_sha256?'matches-staged-needs-live-verification':actual===m.before_sha256?'unchanged-awaiting-install':'changed-requires-rebase';
 return {target:m.target,status,live_sha256:actual,before_sha256:m.before_sha256,after_sha256:m.after_sha256,behavioral_verification:'not-established',writes:0};
}
