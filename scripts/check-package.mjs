#!/usr/bin/env node
/** Static package checks. Does not load a skill into a host or call any model. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {treeFiles,validateState,validateProgression} from './lib.mjs';
import {validateQuickState} from './quickflow.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const errors=[], files=treeFiles(root);
const exists=rel=>fs.existsSync(path.join(root,rel));
for(const rel of ['MIGRATION.md','scripts/jobs.mjs','scripts/migrate-state.mjs','scripts/compatibility.mjs','scripts/host-smoke.mjs','references/modes.md','roles/optional-index.json','review/INPUTS.json','INSTALL.md','scripts/observer-activation.mjs','scripts/observer-status.mjs','baselines/v0.3.0.json','SKILL.md','README.md','LICENSE','NOTICE.md','SOURCES.md','upstream-map.json','roles/index.json','evals/scenarios.json','scripts/install.mjs','scripts/project.mjs','scripts/bridge.mjs','references/interview.md','references/quick-flow.md','references/bmad-integration.md','config/interview.json','adapters/start-claude/SKILL.md','adapters/start-codex/SKILL.md','baselines/v0.1.0.json','baselines/v0.2.0.json','config/observer.json','references/task-observer.md','TASK-OBSERVER.md','companions/task-observer/SKILL.template.md','companions/task-observer/ATTRIBUTION.md','companions/task-observer/LICENSE.txt','companions/task-observer/scripts/observe.mjs','companions/task-observer/scripts/observer-core.mjs']) {
  if(!exists(rel)) errors.push(`Missing ${rel}`);
}
for(const file of files) {
  if(file.endsWith('.json')) {
    try{JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){errors.push(`Invalid JSON ${path.relative(root,file)}: ${e.message}`);}
  }
  if(file.endsWith('.mjs')) {
    const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    if(r.status!==0)errors.push(`JavaScript syntax: ${path.relative(root,file)} ${r.stderr}`);
  }
  if(file.endsWith('.md')) {
    const text=fs.readFileSync(file,'utf8');
    if(text.includes('\u2014'))errors.push(`Unexpected em dash: ${path.relative(root,file)}`);
    for(const match of text.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)) {
      const target=match[1].split('#')[0];
      if(!target||/^[a-z]+:/i.test(target))continue;
      const resolved=path.resolve(path.dirname(file),target);
      const rel=path.relative(root,resolved);
      if(rel.startsWith('..')||!fs.existsSync(resolved))errors.push(`Broken/outside local link in ${path.relative(root,file)}: ${target}`);
    }
  }
}
const skill=fs.readFileSync(path.join(root,'SKILL.md'),'utf8');
if(!skill.startsWith('---\nname: gds-superpowers\ndescription: Use when '))errors.push('Unexpected skill frontmatter');
if(skill.split('\n').length>500)errors.push('SKILL.md exceeds 500-line authoring recommendation');
const roles=JSON.parse(fs.readFileSync(path.join(root,'roles/index.json'),'utf8'));
if(roles.length!==13||new Set(roles.map(r=>r.id)).size!==13)errors.push('Expected 13 unique specialist roles');
for(const role of roles) {
  if(!exists(role.brief))errors.push(`Missing brief: ${role.id}`);
  const cp=`adapters/claude-agents/${role.id}.md`, tp=`adapters/codex-agents/${role.id}.toml`;
  if(!exists(cp)||!exists(tp)){errors.push(`Missing native adapter: ${role.id}`);continue;}
  const claude=fs.readFileSync(path.join(root,cp),'utf8'),codex=fs.readFileSync(path.join(root,tp),'utf8');
  if(!claude.startsWith(`---\nname: ${role.id}\n`))errors.push(`Claude agent name mismatch: ${role.id}`);
  for(const key of ['name','description','developer_instructions'])if(!new RegExp(`^${key} = `,'m').test(codex))errors.push(`Codex missing ${key}: ${role.id}`);
  for(const text of [claude,codex,fs.readFileSync(path.join(root,role.brief),'utf8')])if(!text.includes('only when that profile is selected'))errors.push(`Unconditional roguelite instruction in role: ${role.id}`);
  if(/bypassPermissions|danger-full-access/.test(claude+codex))errors.push(`Unsafe native permission configuration: ${role.id}`);
}
const optionalRoles=JSON.parse(fs.readFileSync(path.join(root,'roles/optional-index.json'),'utf8'));
if(optionalRoles.length!==6)errors.push('Expected six optional lenses');
for(const role of optionalRoles){
  for(const rel of [role.brief,`adapters/optional-claude-agents/${role.id}.md`,`adapters/optional-codex-agents/${role.id}.toml`])if(!exists(rel))errors.push(`Missing optional adapter/brief: ${rel}`);
}
for(const file of files.filter(f=>f.endsWith('.toml')&&f.includes('adapters'))){
  if(/^model(?:_reasoning_effort)?\s*=/m.test(fs.readFileSync(file,'utf8')))errors.push(`Unverified Codex model override: ${file}`);
}
const upstream=JSON.parse(fs.readFileSync(path.join(root,'upstream-map.json'),'utf8'));
if(upstream.skills.length!==15||new Set(upstream.skills).size!==15)errors.push('Expected inspected 15-skill upstream inventory');
const integration=fs.readFileSync(path.join(root,'references/superpowers-integration.md'),'utf8');
for(const name of upstream.skills)if(!integration.includes(`| ${name} |`))errors.push(`Missing upstream mapping: ${name}`);
for(const [file,check] of [['templates/state.json',validateState],['templates/quick-state.json',validateQuickState],['templates/progression.json',validateProgression],['examples/undertow-progression.json',validateProgression]]) {
  const r=check(JSON.parse(fs.readFileSync(path.join(root,file),'utf8')));errors.push(...r.errors.map(e=>`${file}: ${e}`));
}
const scenarios=JSON.parse(fs.readFileSync(path.join(root,'evals/scenarios.json'),'utf8'));
if(scenarios.length!==48||new Set(scenarios.map(s=>s.id)).size!==48)errors.push('Expected 48 unique evaluation scenarios');
for(const s of scenarios)if(!s.prompt||!Array.isArray(s.required)||!s.required.length)errors.push(`Incomplete evaluation scenario: ${s.id}`);
const observer=fs.readFileSync(path.join(root,'companions/task-observer/SKILL.template.md'),'utf8');
if(!observer.startsWith('---\nname: task-observer\ndescription: Use when '))errors.push('Observer frontmatter mismatch');
if(observer.split('\n').length>150)errors.push('Observer core should stay under 150 lines');
if(!observer.includes('CC-BY-4.0')||!observer.includes('Eoghan Henn'))errors.push('Observer attribution absent');
if(!fs.readFileSync(path.join(root,'references/task-observer.md'),'utf8').includes('native-reuse'))errors.push('Existing-observer reuse contract absent');
if(errors.length){for(const error of errors)console.error(`ERROR ${error}`);process.exitCode=1;}
else console.log(`Static package checks passed: ${files.length} files; ${roles.length} roles; 15 upstream mappings; ${scenarios.length} prepared behavior scenarios. Live host execution and player testing were not checked.`);
