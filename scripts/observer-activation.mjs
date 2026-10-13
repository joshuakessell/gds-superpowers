/** GDS observer activation policy and narrowly scoped startup instructions. No model calls. */
import fs from 'node:fs';
import path from 'node:path';
import {createInterface} from 'node:readline/promises';
import {safeDestination} from './lib.mjs';
import {sha256} from './managed-install.mjs';

export const QUESTION = `Enable Task-Observer automatically during GDSuperpowers work?
  Yes: configure startup instructions and observe task checkpoints automatically.
  No: keep it manual; activate it with /gds-superpowers observe
      (Codex: $gds-superpowers observe).
Automatic observation does NOT authorize automatic changes to installed skills.
This applies to the selected repository, or to GDS work across repositories for a user/global install.
`;

export function parseChoice(answer) {
  const s = String(answer ?? '').trim().toLowerCase();
  if (['y','yes','a','auto','automatic'].includes(s)) return 'auto';
  if (['','n','no','m','manual'].includes(s)) return 'manual';
  return null;
}
export async function chooseMode({mode, noObserver=false, input=process.stdin, output=process.stdout}={}) {
  if (mode !== undefined && !['auto','manual'].includes(mode)) throw Error('--observer-mode must be auto or manual');
  if (noObserver) {
    if (mode === 'auto') throw Error('--no-observer cannot be combined with automatic observation');
    return {mode:'manual',source:'observer-omitted'};
  }
  if (mode) return {mode,source:'explicit-flag'};
  if (!input.isTTY || !output.isTTY) throw Error('An installation choice is required. Ask whether Task-Observer should run automatically, then pass --observer-mode auto or --observer-mode manual. Manual activation: /gds-superpowers observe (Codex: $gds-superpowers observe). No files changed.');
  const rl = createInterface({input,output});
  try {
    output.write(QUESTION);
    for (;;) {
      const parsed = parseChoice(await rl.question('Enable automatically? [y/N]: '));
      if (parsed) return {mode:parsed,source:'terminal-answer'};
      output.write('Enter yes or no. No keeps /gds-superpowers observe available.\n');
    }
  } finally { rl.close(); }
}

/** Plan an authorized configuration edit. Retain unrelated settings; do not edit game state. */
export function planBinding(root, destination, defaults, {mode,scope,skillName,enabled,source}, now=new Date().toISOString()) {
  const dest = safeDestination(root,destination);
  let previous, data={...defaults};
  if (fs.existsSync(dest)) {
    if (!fs.statSync(dest).isFile()) throw Error(`Observer settings must be a regular file: ${dest}`);
    previous=fs.readFileSync(dest);
    if (previous.length>32768) throw Error('Observer settings exceed the small configuration limit');
    try { data=JSON.parse(previous.toString('utf8')); } catch { throw Error(`Invalid observer settings; preserve and reconcile: ${dest}`); }
    if (!data || Array.isArray(data) || ![1,2].includes(data.schema_version)) throw Error('Unknown observer configuration schema; no settings changed');
  }
  const unchangedChoice=data.activation_mode===mode && data.enabled===enabled && data.skill_name===skillName && data.scope===scope && typeof data.configured_at==='string';
  data={...data,schema_version:2,enabled,skill_name:skillName,activation_mode:mode,scope,
    configured_at:unchangedChoice?data.configured_at:now,
    choice_source:unchangedChoice?data.choice_source:source};
  const content=Buffer.from(JSON.stringify(data,null,2)+'\n');
  return {key:'observer-install-settings',destination:dest,content,previous,
    action:!previous?'create':previous.equals(content)?'unchanged':'update'};
}

/** Project binding overrides user binding. A later explicit on/off can override a saved choice. */
export function resolveActivation({binding,projectBinding,stateObserver,explicit=false}={}) {
  const b=projectBinding ?? binding ?? {};
  if (explicit) return {automatic:false,runNow:true,reason:'explicit-one-pass'};
  if (b.enabled===false) return {automatic:false,runNow:false,reason:'integration-omitted'};
  let automatic=b.activation_mode==='auto';
  const newer=stateObserver?.mode_set_at && Number.isFinite(Date.parse(stateObserver.mode_set_at)) &&
    (!b.configured_at || Date.parse(stateObserver.mode_set_at)>Date.parse(b.configured_at));
  if (newer && typeof stateObserver.automatic==='boolean') automatic=stateObserver.automatic;
  // Older off records without a timestamp are still a stop boundary until reconciled explicitly.
  if (stateObserver?.enabled===false && !stateObserver.mode_set_at) automatic=false;
  return {automatic,runNow:automatic,reason:automatic?'automatic-checkpoint':'manual-or-off'};
}

const BEGIN='<!-- GDS-TASK-OBSERVER-BEGIN';
const END='<!-- GDS-TASK-OBSERVER-END -->';
export function managedBlock(body) {
  const normalized=body.replace(/\r\n/g,'\n').trim()+'\n';
  return `${BEGIN} sha256=${sha256(normalized)} -->\n${normalized}${END}`;
}
export function replaceManagedBlock(original,body) {
  const text=Buffer.isBuffer(original)?original.toString('utf8'):original;
  if (Buffer.isBuffer(original) && !Buffer.from(text).equals(original)) throw Error('Instruction file is not valid UTF-8; reconcile manually');
  if (Buffer.byteLength(text)>512*1024) throw Error('Instruction file exceeds safe merge size');
  const starts=text.split(BEGIN).length-1,ends=text.split(END).length-1;
  if (!starts && !ends) return body ? text+(text && !text.endsWith('\n')?'\n':'')+(text?'\n':'')+managedBlock(body)+'\n' : text;
  if (starts!==1 || ends!==1) throw Error('Duplicate or incomplete GDS observer instruction markers; no instructions changed');
  const m=text.match(/<!-- GDS-TASK-OBSERVER-BEGIN sha256=([a-f0-9]{64}) -->\n([\s\S]*?)<!-- GDS-TASK-OBSERVER-END -->/);
  if (!m || sha256(m[2])!==m[1]) throw Error('Customized observer instruction block; review it before reconfiguration');
  return text.slice(0,m.index)+(body?managedBlock(body):'')+text.slice(m.index+m[0].length);
}

export function startupBody({host,scope,configPath}) {
  const invocation=host==='claude'?'/gds-superpowers observe':'$gds-superpowers observe';
  return `## GDSuperpowers Task-Observer startup policy
The user selected automatic observation during GDSuperpowers installation (${scope} scope).
Apply this ONLY to GDSuperpowers game-development work, not unrelated tasks or repositories.
Before the first GDS task, read ${JSON.stringify(configPath)} and the installed gds-superpowers/references/task-observer.md.
Resolve the nearest project installation's config/observer.json before a user/global default. A project manual setting overrides a global auto default. Re-read effective settings at checkpoints; cached startup text is not authoritative.
If effective activation_mode is auto, initialize the observer in this session before work and observe corrections, meaningful task results, verification, playtest feedback, and handoff. Do not ask the same installation question again.
A newer explicit project on/off preference can override an older installation choice. Preserve existing observer logs, inspect the real observer, and select ONE capture owner. With manual mode, do not capture at checkpoints; ${invocation} activates one explicit pass without enabling future automatic capture.
Use only the active project's evidence. Keep at most three useful findings per checkpoint. Do not initialize another game, replay the interview, fabricate observations, or launch another model or background job.
Automatic observation is NOT permission to change live skills, hooks, permissions, or project design. Candidate skill changes still require review and separate installation approval. Report configured versus actually initialized accurately.`;
}

/** Claude rules do not shadow an existing AGENTS.md. Codex receives one protected appended block. */
export function instructionDestination(root,host,scope) {
  if (host==='claude') return safeDestination(root,path.join(root,'.claude/rules/gds-task-observer.md'));
  const dir=scope==='user'?path.join(root,'.codex'):root;
  const override=safeDestination(root,path.join(dir,'AGENTS.override.md'));
  if (fs.existsSync(override) && fs.statSync(override).isFile() && fs.readFileSync(override,'utf8').trim()) return override;
  return safeDestination(root,path.join(dir,'AGENTS.md'));
}
export function planInstructions(root,destination,body) {
  const dest=safeDestination(root,destination);
  let previous;
  if (fs.existsSync(dest)) {
    if (!fs.statSync(dest).isFile()) throw Error(`Instruction target is not a regular file: ${dest}`);
    previous=fs.readFileSync(dest);
  }
  if (!previous && !body) return null;
  const text=previous?.toString('utf8')??'';
  if (!body && !text.includes(BEGIN) && !text.includes(END)) return null;
  const content=Buffer.from(replaceManagedBlock(previous??'',body));
  return {key:'observer-startup-instructions',destination:dest,content,previous,
    action:!previous?'create':previous.equals(content)?'unchanged':'update'};
}
export function activationPrompt({host,scope,root,configPath}) {
  const call=host==='claude'?'/gds-superpowers observe':'$gds-superpowers observe';
  return `${call}\n\nInitialize Task-Observer for this repository session using the automatic choice already made during installation. This is initialization, not an instruction to invent a finding.\nInstallation scope: ${scope}. Installation root: ${JSON.stringify(root)}. Read settings: ${JSON.stringify(configPath)}.\nRead the installed GDS observer integration guide, resolve any project override and later explicit on/off preference, inspect the actual observer, preserve its history, and choose one capture owner. Do not ask the installation choice again.\nIf the effective setting permits auto, initialize checkpoint observation now and identify its scope and log. Otherwise report the effective manual/off override without changing it. Preserve existing game state, approvals, files, and /start progress. Do not start a new game, write global changes, install dependencies, or modify live skills.\nConfirm what was actually read and initialized, and report any permission or compatibility blocker. Configured settings alone are not proof of execution.\n`;
}
