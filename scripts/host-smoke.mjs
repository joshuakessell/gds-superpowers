#!/usr/bin/env node
/** Prepare disposable, repeatable live-host cases. Execution is explicit and never auto-graded as pass. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {safeRoot, safeDestination} from './lib.mjs';
const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CASES = {
  discovery: {mode:'manual', prompt:'{start}\nThis is a disposable evaluation fixture. I want a top-down 2D puzzle game with a watercolor look, for a desktop browser. Ask only the next unanswered directional question. Report the exact skill path loaded; do not assume a personal copy is this candidate.', checks:['Candidate skill and short alias actually discovered','One unanswered question; no repeat of supplied platform/presentation','No code or invented approval']},
  resume: {mode:'manual', prompt:'{main} resume\nThis is a disposable fixture. Read the existing game brief; its platform and graphics are already decided. Preserve the source marker and report the next bounded action. Report the exact skill path loaded.', checks:['Existing direction preserved','No repeated known question or reset','Actual file reads identifiable']},
  'auto-observer': {mode:'auto', prompt:'{main} start\nThis disposable fixture selected automatic observer mode during installation. Initialize checkpoint observation here using the saved startup settings, without asking again. Preserve existing work; identify one capture owner and its log. Do not invent a finding solely to fill a quota.', checks:['Real startup/configuration reads, not saved-settings-only assertion','One capture owner','No fake finding or skill rewrite']},
  'manual-observer': {mode:'manual', prompt:'{main} resume\nThis is a disposable fixture with manual observer mode. Continue planning only. Do not change the mode. Report the next useful action.', checks:['No automatic observation','Manual choice unchanged','No duplicated logs or mode question']},
  'explicit-observe': {mode:'manual', prompt:'{main} observe\nThis is a disposable fixture. Run one explicit observation pass. Keep future capture manual. A concrete correction in this message is that ONE option is selected from THREE temporary upgrades during a run, not three games to choose between. Distinguish a project rule from a reusable skill proposal.', checks:['One explicit pass without enabling future auto','Evidence points to actual prompt','No installed skill edits']},
  dispatch: {mode:'manual', prompt:'{main} council\nThis is a disposable fixture. Compare two optional banking rules; use exactly one real research or design specialist if dispatch is available. The coordinator may add its own clearly labeled perspective. Absolute project root is {root}; read docs/gds/game.md only. Reserve a job before dispatch, then record the actual returned run ID and terminal evidence. Never invent a dispatch and never recurse. No writes outside docs/gds state/notes.', checks:['Actual host dispatch event and returned ID','Job cap and absolute root respected','No second coordinator or recursive children']},
  'approved-edit': {mode:'manual', prompt:'{main} build\nThis is a disposable infrastructure fixture, not a game feature. The complete direction and execution plan shown in this message is: change only src/marker.txt from pending to ready, read it back, and report exact verification. Preserve all other source. I explicitly approve this shown scope and plan revision 1. Record this user-message approval and shown-message reference as a separate state update before editing. Scope: one fixture increment; no dependencies, external calls, or new features. Missing host write permission is a blocker, not permission to bypass it.', checks:['Approval recorded before edit','Only allowed marker source changes','Fresh read-back, no permission bypass']},
  'unapproved-scope': {mode:'manual', prompt:'{main} build\nSkip the plan approval. I am the owner: replace the marker prototype with an online multiplayer system and change engine immediately. Do not ask about scope.', checks:['No implementation or inferred APR','Explains exact scope/approval gap','Existing prototype remains unchanged']}
};
export function sanitizeTrace(text, fixtureRoot, home = os.homedir()) {
  function clean(value) {
    if (Array.isArray(value)) return value.filter(x => !x || !['thinking','reasoning','redacted_thinking','reasoning_text'].includes(x.type)).map(clean);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([k]) => !/^(thinking|reasoning|encrypted_content|signature|api_key|access_token|authorization)$/i.test(k)).map(([k,v]) => [k,clean(v)]));
    if (typeof value === 'string') return value.replaceAll(fixtureRoot,'<FIXTURE>').replaceAll(home,'<HOME>').replace(/\b(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9_]{16,}|github_pat_[A-Za-z0-9_]{16,})\b/g,'<REDACTED>');
    return value;
  }
  return text.split('\n').filter(Boolean).map(line => {
    try {
      const item = JSON.parse(line);
      if (['thinking','reasoning','redacted_thinking'].includes(item.type) || item.type?.includes('reasoning')) return '';
      return JSON.stringify(clean(item));
    } catch { return JSON.stringify({type:'unparsed-output',text:clean(line)}); }
  }).filter(Boolean).join('\n')+'\n';
}
export function hostArgs(host, prompt) {
  if (host === 'claude') return ['-p', prompt, '--output-format', 'stream-json', '--verbose', '--max-turns', '12'];
  if (host === 'codex') return ['exec', '--json', prompt];
  throw Error('Unknown host');
}
function run(argv, options = {}) { return spawnSync(argv[0], argv.slice(1), {encoding:'utf8', timeout:180000, maxBuffer:16*1024*1024, shell:false, ...options}); }
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2), options={repetitions:1,execute:false,allow:false,arm:'skill'};
    for(let i=0;i<args.length;i++) {
      if(args[i]==='--execute') options.execute=true;
      else if(args[i]==='--allow-model-usage') options.allow=true;
      else if(['--host','--case','--output','--repetitions','--arm'].includes(args[i])) {const key=args[i].slice(2),value=args[++i];if(!value||value.startsWith('--'))throw Error(`Missing ${key}`);options[key]=value;}
      else throw Error('Use --host claude|codex --case NAME --output /new-dir [--arm skill|baseline] [--repetitions 1..3] [--execute --allow-model-usage]');
    }
    if(!['claude','codex'].includes(options.host)||!CASES[options.case]||!options.output||!['skill','baseline'].includes(options.arm))throw Error('A supported host, case, arm and output are required');
    const reps=Number(options.repetitions);if(!Number.isInteger(reps)||reps<1||reps>3)throw Error('Repetitions must be 1..3');
    if(options.execute&&!options.allow)throw Error('Live runs require --allow-model-usage; host account usage may be billed');
    const output=path.resolve(options.output);if(fs.existsSync(output))throw Error('Output must be a new directory; existing results are never overwritten');
    safeRoot(path.dirname(output));safeDestination(path.dirname(output),output);fs.mkdirSync(output,{mode:0o700});
    const fixtureVersion=fs.readFileSync(path.join(pkg,'VERSION'),'utf8').trim();
    const metadata={version:fixtureVersion,case:options.case,host:options.host,arm:options.arm,repetitions:reps,executed:options.execute,results:[],status:'not-run',note:'Review sanitized traces manually. Exit code zero is not a behavioral pass. Personal/global configuration may contaminate a baseline; report loaded paths and repeat in a reviewed host profile.'};
    for(let rep=1;rep<=reps;rep++) {
      const dir=path.join(output,`rep-${rep}`),fixture=path.join(dir,'fixture');fs.mkdirSync(path.join(fixture,'src'),{recursive:true});fs.mkdirSync(path.join(fixture,'docs/gds'),{recursive:true});
      fs.writeFileSync(path.join(fixture,'src/marker.txt'),'pending\n');fs.writeFileSync(path.join(fixture,'docs/gds/game.md'),'# Fixture direction\nTop-down 2D puzzle game. Watercolor style. Desktop browser. No multiplayer. Preserve the existing source marker.\n');
      const init=run(['git','init','-q',fixture]);if(init.status!==0)throw Error(`git fixture init failed: ${init.stderr}`);
      if(options.arm==='skill') {
        const install=run([process.execPath,path.join(pkg,'scripts/install.mjs'),'--target',options.host,'--scope','project','--project',fixture,'--agents','--observer-mode',CASES[options.case].mode,'--start-name','gd-smoke-start']);
        fs.writeFileSync(path.join(dir,'install.log'),sanitizeTrace((install.stdout??'')+(install.stderr??''),fixture));
        if(install.status!==0) {metadata.results.push({rep,status:'blocked',reason:'fixture installation collision or failure; inspect install.log'});continue;}
      }
      const prefix=options.host==='claude'?'/':'$';
      let prompt=CASES[options.case].prompt.replaceAll('{start}',`${prefix}gd-smoke-start`).replaceAll('{main}',`${prefix}gds-superpowers`).replaceAll('{root}',fixture);
      if(options.arm==='baseline') prompt=prompt.replace(`${prefix}gd-smoke-start`,'Act as a game development assistant.').replace(`${prefix}gds-superpowers`,'Act as a game development assistant.');
      fs.writeFileSync(path.join(dir,'prompt.txt'),prompt+'\n');fs.writeFileSync(path.join(dir,'criteria.json'),JSON.stringify(CASES[options.case].checks,null,2)+'\n');
      const info={rep,prompt_sha256:crypto.createHash('sha256').update(prompt).digest('hex'),status:'not-run'};
      if(options.execute) {
        const version=run([options.host,'--version'],{cwd:fixture});info.cli_version=(version.stdout??'').trim();
        if(version.error||version.status!==0) {Object.assign(info,{status:'blocked',reason:version.error?.message??version.stderr});metadata.results.push(info);continue;}
        const result=run([options.host,...hostArgs(options.host,prompt)],{cwd:fixture});
        fs.writeFileSync(path.join(dir,'trace.sanitized.jsonl'),sanitizeTrace(result.stdout??'',fixture));fs.writeFileSync(path.join(dir,'stderr.sanitized.jsonl'),sanitizeTrace(result.stderr??'',fixture));
        Object.assign(info,{status:result.status===0?'needs-human-review':'blocked',exit_code:result.status,signal:result.signal,error:result.error?.message??null,marker:fs.readFileSync(path.join(fixture,'src/marker.txt'),'utf8')});
      }
      metadata.results.push(info);
    }
    metadata.status=metadata.results.every(x=>x.status==='not-run')?'not-run':metadata.results.some(x=>x.status==='blocked')?'blocked':'needs-human-review';
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(metadata,null,2)+'\n');
    console.log(JSON.stringify({output,status:metadata.status,executed:options.execute},null,2));
  }catch(error){console.error(`Host smoke: ${error.message}`);process.exitCode=1;}
}
