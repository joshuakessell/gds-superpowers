/** Pure, local workflow guidance. Does not run agents or certify evidence. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateJobs} from './jobs.mjs';
import {validateState} from './lib.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bank=JSON.parse(fs.readFileSync(path.join(root,'config/interview.json'),'utf8')).questions;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const value=(s,k)=>s.answers?.[k]?.value;
const answered=(s,k)=>{const v=value(s,k);return v!==undefined&&v!==null&&v!==''&&(!Array.isArray(v)||v.length>0);};
export const newQuickState=()=>JSON.parse(fs.readFileSync(path.join(root,'templates/quick-state.json'),'utf8'));
export function activeBranches(s){
 const b=new Set(['base']),g=value(s,'genres');
 const names=typeof g==='string'?[g]:[g?.primary,...(Array.isArray(g?.secondary)?g.secondary:[])].filter(nonempty);
 if(names.length>1)b.add('hybrid');
 const text=names.join(' ').toLowerCase();
 const patterns={roguelite:/rogue/,deck:/deck|card/,basebuilding:/base[ -]?build|management|tycoon/,combat:/survivors|shooter|\baction\b|arena|fighting/,tactics:/tactic/,platformer:/platform|metroidvania/,survival:/survival|crafting/,puzzle:/puzzle/,narrative:/narrative|\brpg\b|visual[ -]?novel|adventure/,horror:/horror/,strategy:/strategy|tower[ -]?defense/,rhythm:/rhythm/};
 for(const [name,regex]of Object.entries(patterns))if(regex.test(text))b.add(name);
 return b;
}
export function nextQuestion(s,{includeOptional=false}={}){
 const active=activeBranches(s);
 return bank.find(q=>active.has(q.branch)&&!answered(s,q.id)&&(q.required||(includeOptional&&!s.deferred?.includes(q.id))))??null;
}
export const approved=(s,kind)=>(Array.isArray(s.approvals)?s.approvals:[]).some(a=>object(a)&&a.kind===kind&&nonempty(a.source_ref)&&nonempty(a.shown_ref)&&a.origin==='user'&&a.revision===(kind==='direction'?s.brief_revision:s.loop?.revision)&&a.scope===(kind==='direction'?'game':s.loop?.id));
const humanEvidence=s=>(Array.isArray(s.loop?.evidence?.human)?s.loop.evidence.human:[]).some(e=>object(e)&&e.kind==='human'&&nonempty(e.source_ref)&&nonempty(e.observation));
export function recommendNext(s){
 if(s.migration?.review_required)return {action:'reconcile-migration',reason:'Inspect preserved source approvals, jobs, and documents before resuming. Migration does not grant execution permission.'};
 if(s.loop?.status==='paused')return {action:'paused',reason:'Resume only when the user asks; preserve the saved next action.'};
 const q=nextQuestion(s);
 if(q)return {action:'ask',question:q.id,prompt:q.prompt};
 if(!approved(s,'direction'))return {action:'approve-direction',reason:'Show the compact outline, assumptions, and direction revision for approval.'};
 if(['interview','outline','plan'].includes(s.loop?.status))return {action:'plan-slice',reason:'Prepare the smallest current plan, not a full production backlog.'};
 if(!approved(s,'slice'))return {action:'approve-slice',reason:'The current slice and revision need a scoped user approval.'};
 if(s.loop.repair_attempts>=s.limits.max_repair_attempts&&['build','check'].includes(s.loop.status))return {action:'diagnose-or-stop',reason:'Repair budget exhausted. Pause for diagnosis or a revised approved plan.'};
 if(['awaiting-approval','build'].includes(s.loop.status))return {action:'build',reason:'Execute only the approved current slice and preserve independent review.'};
 if(s.loop.status==='check')return {action:'verify',reason:'Run fresh technical checks and review the actual changes.'};
 if(['play','decide','done'].includes(s.loop.status)){
  if(!s.loop.evidence?.technical?.length||!s.loop.evidence?.review?.length)return {action:'verify',reason:'Technical and review evidence must precede the completed checkpoint.'};
  if(s.loop.kind!=='infrastructure'&&!humanEvidence(s))return {action:'await-human-playtest',reason:'Provide launch instructions and one focused question; do not fabricate player feedback.'};
  if(s.loop.status==='done')return {action:'stop',reason:'Slice complete. Save its outcome; a new scope needs a new plan.'};
  return {action:'decide',reason:'Use the evidence to keep, tune, pivot, or cut. Do not automatically expand.'};
 }
 return {action:'inspect',reason:'Inspect the current status before advancing.'};
}
export function validateQuickState(s){
 const errors=[],warnings=[];
 if(!object(s))return {errors:['State must be an object'],warnings};
 if(s.schema_version!==3)errors.push('schema_version must be 3');
 if(s.track!=='quick')errors.push('track must be quick');
 if(!['discover','prototype','slice','expand','release'].includes(s.milestone))errors.push('Unknown milestone');
 if(!Number.isInteger(s.brief_revision)||s.brief_revision<1)errors.push('brief_revision must be positive');
 if(!object(s.answers))errors.push('answers must be an object');
 for(const [k,a] of Object.entries(object(s.answers)?s.answers:{})){
  if(!object(a)||!['user','imported','delegated','assumed'].includes(a.origin)||!nonempty(a.source_ref))errors.push(`Answer ${k} requires origin and source_ref`);
 }
 const g=value(s,'genres');
 if(g!==undefined&&(!object(g)||!nonempty(g.primary)||!Array.isArray(g.secondary)||g.secondary.some(x=>!nonempty(x))))errors.push('genres needs primary and secondary[]');
 if(g?.secondary?.length>2)warnings.push('More than two supporting types: review scope instead of silently adding systems.');
 if(object(g)&&[g.primary,...(Array.isArray(g.secondary)?g.secondary:[])].filter(nonempty).length!==new Set([g.primary,...(Array.isArray(g.secondary)?g.secondary:[])].filter(nonempty).map(x=>x.toLowerCase())).size)errors.push('Duplicate genre components');
 if(!Array.isArray(s.deferred))errors.push('deferred must be an array');
 const rules=value(s,'roguelite_rules');
 if(rules?.profile==='one-of-three-persistent'&&(rules.offered_choices!==3||rules.selections!==1||rules.run_upgrades_reset!==true||rules.persistent_progress!==true))errors.push('Profile requires one of three temporary powers with reset and persistent progress');
 if(!object(s.limits))errors.push('limits must be an object');
 for(const key of ['max_active_agents','max_repair_attempts','max_slices_per_batch'])if(!Number.isInteger(s.limits?.[key])||s.limits[key]<1)errors.push(`${key} must be a positive integer`);
 errors.push(...validateJobs(s));
 const loop=s.loop??{};
 if(!nonempty(loop.id)||!Number.isInteger(loop.revision)||loop.revision<1)errors.push('loop needs id and positive revision');
 if(!['interview','outline','plan','awaiting-approval','build','check','play','decide','done','paused'].includes(loop.status))errors.push('Unknown loop status');
 if(!['gameplay','infrastructure'].includes(loop.kind))errors.push('Unknown loop kind');
 if(!Number.isInteger(loop.repair_attempts)||loop.repair_attempts<0)errors.push('repair_attempts must be nonnegative');
 if(!Array.isArray(s.approvals))errors.push('approvals must be an array');
 for(const a of Array.isArray(s.approvals)?s.approvals:[]){
  if(!object(a)||!nonempty(a.id)||!['direction','slice','release'].includes(a.kind)||!Number.isInteger(a.revision)||a.revision<1||!nonempty(a.scope)||!nonempty(a.source_ref))errors.push('Approval requires id, kind, revision, scope, source_ref');
 }
 for(const key of ['technical','review','human'])if(!Array.isArray(loop.evidence?.[key]))errors.push(`loop evidence requires ${key} array`);
 for(const e of Array.isArray(loop.evidence?.human)?loop.evidence.human:[]){if(!object(e)||e.kind!=='human'||!nonempty(e.source_ref)||!nonempty(e.observation))errors.push('human evidence must identify real human feedback and observation');}
 for(const k of ['technical','review'])for(const e of Array.isArray(loop.evidence?.[k])?loop.evidence[k]:[]){if(!nonempty(e)&&!(object(e)&&nonempty(e.ref)))errors.push(`${k} evidence needs a nonempty reference`);}
 if(s.migration?.review_required&&loop.status!=='paused')errors.push('Unreconciled migration must stay paused');
 if(['build','check','play','decide','done'].includes(loop.status)){
  if(!approved(s,'direction'))errors.push('Active implementation requires current direction approval');
  if(!approved(s,'slice'))errors.push('Active implementation requires current slice approval');
  if(!nonempty(loop.hypothesis))errors.push('Active slice needs a hypothesis');
 }
 if(loop.status==='done'){
  if(!loop.evidence?.technical?.length||!loop.evidence?.review?.length)errors.push('Completed slice requires technical and review evidence');
  if(loop.kind==='gameplay'&&!humanEvidence(s))errors.push('Completed gameplay slice requires human evidence');
  if(s.milestone==='release'&&!approved(s,'release'))errors.push('Release completion requires current release approval');
 }
 if(!['adapted','unverified','native-requested','native-verified'].includes(s.bmad?.mode))errors.push('Unknown BMAD mode');
 if(s.bmad?.mode==='native-verified'&&!nonempty(s.bmad.execution_ref))errors.push('Native BMAD execution needs an actual execution_ref');
 // Reuse existing tested graph, lease, capability, and execution-receipt checks.
 const common=validateState({schema_version:1,phase:'charter',execution_mode:s.execution_mode,upstream:s.upstream,
  limits:{...s.limits,max_debate_rounds:1},contract:{offered_choices:3,selections:1,run_upgrades_reset:true,persistent_progress:true},tasks:s.tasks,approvals:[],gates:[]});
 errors.push(...common.errors);warnings.push(...common.warnings);
 warnings.push('Structural checks cannot authenticate approvals, execution, test evidence, or fun.');
 return {errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
}
