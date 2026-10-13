#!/usr/bin/env node
/** Bounded read-only BMAD candidate discovery, not native invocation. */
import fs from 'node:fs';
import path from 'node:path';
const usage='Usage: node scripts/bridge.mjs --project /existing/game';
try{
 const args=process.argv.slice(2);if(args.includes('--help')){console.log(usage);process.exit(0);}
 if(args.length!==2||args[0]!=='--project')throw Error(usage);
 const root=fs.realpathSync(path.resolve(args[1]));if(!fs.statSync(root).isDirectory())throw Error('Project must be a directory');
 const roots=['_bmad/bmgd','_bmad/gds','_bmad/game-dev-studio','.claude/skills','.claude/commands','.agents/skills'];
 const candidates=[],warnings=[];let visited=0;
 function scan(dir,depth,native){
  if(depth>10||visited>=2000){warnings.push('Scan budget reached; discovery may be incomplete.');return;}
  let st;try{st=fs.lstatSync(dir);}catch(e){if(e.code==='ENOENT')return;throw e;}
  if(st.isSymbolicLink()){warnings.push(`Skipped symlink: ${path.relative(root,dir)}`);return;}
  if(st.isDirectory()){
   const name=path.basename(dir);if(['gds-superpowers','start','.git','node_modules'].includes(name))return;
   for(const entry of fs.readdirSync(dir).sort())scan(path.join(dir,entry),depth+1,native);
   return;
  }
  if(!st.isFile()||!(/\.(md|yaml|yml|csv|json)$/i.test(dir)))return;
  visited++;const rel=path.relative(root,dir),lower=rel.toLowerCase();
  if(!native&&!/bmad|bmgd/.test(lower))return;
  const kind=['quick-prototype','quick-dev','quick-spec','game-brief','game-types','gdd','brainstorm-game'].find(x=>lower.includes(x));
  if(!kind)return;
  if(st.size>65536){warnings.push(`Candidate too large for preview: ${rel}`);candidates.push({kind,path:rel,preview:null});return;}
  const text=fs.readFileSync(dir,'utf8');const name=text.match(/^name:\s*["']?([^\n"']+)/m)?.[1]?.trim()??null;
  candidates.push({kind,path:rel,declared_name:name,preview:text.slice(0,320),status:'candidate-only'});
 }
 for(const rel of roots){
  let cur=root,linked=false;
  for(const part of rel.split('/')){cur=path.join(cur,part);try{if(fs.lstatSync(cur).isSymbolicLink()){linked=true;break;}}catch(e){if(e.code!=='ENOENT')throw e;}}
  if(linked){warnings.push(`Skipped symlinked discovery root: ${rel}`);continue;}
  scan(path.join(root,rel),0,rel.startsWith('_bmad/'));
 }
 console.log(JSON.stringify({mode:'adapted',native_execution:false,visited_files:visited,candidates,warnings:[...new Set(warnings)],note:'Candidates are not proof of registered commands, compatibility, or actual native execution. Inspect before invoking.'},null,2));
}catch(e){console.error(`BMAD discovery: ${e.message}`);process.exitCode=1;}
