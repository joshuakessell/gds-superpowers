/** Hash-checked upgrades. Local files only; does not change project documents. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {safeDestination} from './lib.mjs';
const gitBlobHash=b=>'git:'+crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');
export const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
export function planManaged(root,files,{upgrade=false,baseline={}}={}){
 const seen=new Set();
 return files.map(f=>{
  const dest=safeDestination(root,f.destination);
  if(seen.has(dest))throw Error(`Duplicate destination: ${dest}`);seen.add(dest);
  const data=Buffer.isBuffer(f.content)?f.content:Buffer.from(f.content,'utf8');
  if(!fs.existsSync(dest))return {destination:dest,content:data,action:'create',key:f.key};
  if(!fs.statSync(dest).isFile())throw Error(`Content conflict: destination is not a regular file: ${dest}`);
  const previous=fs.readFileSync(dest);
  if(previous.equals(data))return {destination:dest,content:data,action:'unchanged',key:f.key};
  if(upgrade&&(Array.isArray(baseline[f.key])?baseline[f.key]:[baseline[f.key]]).some(hash=>hash===sha256(previous)||hash===gitBlobHash(previous)))return {destination:dest,content:data,previous,action:'update',key:f.key};
  throw Error(`Content conflict; existing file was not modified: ${dest}. ${upgrade?'Local changes or an unknown version require a manual merge.':'Use --upgrade only for an unmodified recognized version.'}`);
 });
}
export function applyManaged(root,plan,{dryRun=false}={}){
 if(dryRun)return {backup:null,created:0,updated:0};
 let backup=null,created=0,updated=0;
 const changes=plan.filter(x=>x.action!=='unchanged');
 // Recheck the entire batch before creating backup files.
 for(const item of changes){
  safeDestination(root,item.destination);
  if(item.action==='create'&&fs.existsSync(item.destination))throw Error(`Concurrent change: ${item.destination}`);
  if(item.action==='update'&&(!fs.existsSync(item.destination)||!fs.readFileSync(item.destination).equals(item.previous)))throw Error(`Concurrent change: ${item.destination}`);
 }
 if(changes.some(x=>x.action==='update')){
  backup=safeDestination(root,path.join(root,'.gdsuperpowers-backups',`${new Date().toISOString().replaceAll(':','-')}-${crypto.randomBytes(4).toString('hex')}`));
  fs.mkdirSync(backup,{recursive:true});
  for(const item of changes.filter(x=>x.action==='update')){
   const dest=safeDestination(root,path.join(backup,path.relative(root,item.destination)));
   fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,item.previous,{flag:'wx'});
  }
  fs.writeFileSync(path.join(backup,'receipt.json'),JSON.stringify({format:1,root,created_at:new Date().toISOString(),note:'Backup is not an automatic rollback. Inspect files before restoring. Installation is not a cross-file transaction.',changes:changes.map(x=>({path:path.relative(root,x.destination),action:x.action,before:x.previous?sha256(x.previous):null,after:sha256(x.content)}))},null,2)+'\n',{flag:'wx'});
 }
 try{
  for(const item of changes){
   const dest=safeDestination(root,item.destination);fs.mkdirSync(path.dirname(dest),{recursive:true});
   if(item.action==='create'){safeDestination(root,dest);fs.writeFileSync(dest,item.content,{flag:'wx'});created++;}
   else{
    if(!fs.readFileSync(dest).equals(item.previous))throw Error(`Concurrent change: ${dest}`);
    const temp=safeDestination(root,`${dest}.gds-new-${crypto.randomBytes(6).toString('hex')}`);
    try{
     fs.writeFileSync(temp,item.content,{flag:'wx',mode:fs.statSync(dest).mode&0o777});safeDestination(root,dest);
     if(!fs.readFileSync(dest).equals(item.previous))throw Error(`Concurrent change: ${dest}`);
     fs.renameSync(temp,dest);updated++;
    }finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
   }
  }
 }catch(e){throw Error(`${e.message}. Applied ${created} creates and ${updated} updates; backup: ${backup??'none'}. Inspect before retrying.`);}
 return {backup,created,updated};
}
