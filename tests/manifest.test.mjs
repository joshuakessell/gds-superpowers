import './support/isolated-home.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {sourceManifest,parseManifest,verifyIntegrity,RUNTIME} from '../scripts/manifest.mjs';
const pkg=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function fixture(t){const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'gds-manifest-')));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));return root;}
function minimal(t){const root=fixture(t);fs.writeFileSync(path.join(root,'README.md'),'example');fs.writeFileSync(path.join(root,'MANIFEST.sha256'),sourceManifest(root));return root;}
test('source manifest is deterministic and verification is read-only',t=>{const root=minimal(t),before=fs.readFileSync(path.join(root,'MANIFEST.sha256'),'utf8');assert.equal(sourceManifest(root),before);assert.equal(verifyIntegrity(root).profile,'source');assert.equal(fs.readFileSync(path.join(root,'MANIFEST.sha256'),'utf8'),before);});
test('manifest rejects duplicate and unsafe entries',()=>{const h='a'.repeat(64);for(const name of ['../other','/etc/passwd','a/./b','a//b','a\\b','C:/a','MANIFEST.sha256','RUNTIME-MANIFEST.json'])assert.throws(()=>parseManifest(`${h}  ${name}\n`));assert.throws(()=>parseManifest(`${h}  README.md\n${h}  README.md\n`),/Duplicate/);});
test('missing or unexpected in-scope file fails verification',t=>{const root=minimal(t);fs.unlinkSync(path.join(root,'README.md'));assert.throws(()=>verifyIntegrity(root),/Missing/);fs.writeFileSync(path.join(root,'README.md'),'example');fs.writeFileSync(path.join(root,'extra.md'),'untracked');assert.throws(()=>verifyIntegrity(root),/Unexpected/);});
for(const host of ['claude','codex'])for(const scope of ['project','user'])test(`runtime integrity: ${host}/${scope} manual-auto-reinstall`,t=>{
 const root=fixture(t),home=path.join(root,'home'),game=path.join(root,'game');fs.mkdirSync(home);fs.mkdirSync(game);
 const env={...process.env,HOME:home};delete env.CODEX_HOME;delete env.CLAUDE_CONFIG_DIR;
 const args=[path.join(pkg,'scripts/install.mjs'),'--target',host,'--scope',scope,...(scope==='project'?['--project',game]:[])];
 const dest=path.join(scope==='project'?game:home,host==='claude'?'.claude':'.agents','skills/gds-superpowers');
 for(const mode of ['manual','auto','auto','manual']){
  const run=spawnSync(process.execPath,[...args,'--observer-mode',mode],{encoding:'utf8',env});assert.equal(run.status,0,run.stderr);
  assert.equal(verifyIntegrity(dest).profile,'installed-runtime');
  const check=spawnSync(process.execPath,['scripts/check-package.mjs'],{cwd:dest,env,encoding:'utf8'});assert.equal(check.status,0,check.stderr);
 }
 const receipt=fs.readFileSync(path.join(dest,RUNTIME));
 fs.appendFileSync(path.join(dest,'QUICKSTART.md'),'\ntampered\n');
 const failed=spawnSync(process.execPath,[...args,'--observer-mode','auto','--upgrade'],{encoding:'utf8',env});assert.notEqual(failed.status,0);assert.match(failed.stderr,/Checksum/);assert.deepEqual(fs.readFileSync(path.join(dest,RUNTIME)),receipt);
});
test('source regeneration refuses an installed-runtime marker',t=>{const root=minimal(t);fs.writeFileSync(path.join(root,RUNTIME),'{}');assert.throws(()=>sourceManifest(root),/installed runtime/);assert.throws(()=>verifyIntegrity(root),/provenance/);});
