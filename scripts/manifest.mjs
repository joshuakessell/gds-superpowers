#!/usr/bin/env node
/** Deterministic source hashes; explicit installed receipts for transformed payloads. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {treeFiles, safeRoot, safeDestination} from './lib.mjs';
import {sha256} from './managed-install.mjs';
export const RUNTIME = 'RUNTIME-MANIFEST.json';
const HASH = /^[a-f0-9]{64}$/;
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
function relative(name) {
  if (typeof name !== 'string' || !name || /[\\:\r\n]/.test(name) || name.split('/').some(p => !p || p === '.' || p === '..') || path.isAbsolute(name)) throw Error(`Unsafe manifest path: ${String(name)}`);
  return name;
}
function listing(root) {
  return new Map(treeFiles(root).filter(f => path.relative(root,f) !== RUNTIME).map(f => [path.relative(root,f).split(path.sep).join('/'), f]));
}
export function parseManifest(text) {
  const entries = new Map();
  for (const line of text.trimEnd().split('\n')) {
    const m = line.match(/^([a-f0-9]{64})  (.+)$/);
    if (!m) throw Error('Malformed source manifest');
    const name = relative(m[2]);
    if (name === 'MANIFEST.sha256' || name === RUNTIME || entries.has(name)) throw Error(`Duplicate or self-referential manifest path: ${name}`);
    entries.set(name, m[1]);
  }
  return entries;
}
function verifyEntries(actual, entries) {
  const errors = [];
  for (const [name, hash] of entries) {
    if (!actual.has(name)) errors.push(`Missing manifested file: ${name}`);
    else if (sha256(fs.readFileSync(actual.get(name))) !== hash) errors.push(`Checksum mismatch: ${name}`);
  }
  for (const name of actual.keys()) if (!entries.has(name)) errors.push(`Unexpected in-scope file: ${name}`);
  if (errors.length) throw Error(errors.join('; '));
}
export function verifyIntegrity(input) {
  const root = safeRoot(input), actual = listing(root), source = actual.get('MANIFEST.sha256');
  if (!source) throw Error('Missing source manifest');
  const sourceBytes = fs.readFileSync(source), sourceEntries = parseManifest(sourceBytes.toString('utf8'));
  const receiptFile = safeDestination(root, path.join(root,RUNTIME));
  if (!fs.existsSync(receiptFile)) {
    actual.delete('MANIFEST.sha256'); verifyEntries(actual,sourceEntries);
    return {profile:'source', files:actual.size, source_manifest_sha256:sha256(sourceBytes)};
  }
  const receipt = JSON.parse(fs.readFileSync(receiptFile,'utf8'));
  if (!object(receipt) || receipt.format !== 1 || receipt.profile !== 'installed-runtime' || receipt.source_manifest_sha256 !== sha256(sourceBytes) || !Array.isArray(receipt.files)) throw Error('Invalid runtime manifest provenance');
  const entries = new Map();
  for (const item of receipt.files) {
    if (!object(item) || !HASH.test(item.sha256 ?? '')) throw Error('Malformed runtime manifest entry');
    const name = relative(item.path);
    if (name === RUNTIME || entries.has(name)) throw Error(`Duplicate or self-referential runtime path: ${name}`);
    const generated = name === 'config/observer.json';
    if (item.kind !== (generated ? 'generated-config' : 'source')) throw Error(`Invalid runtime entry kind: ${name}`);
    const expected = name === 'MANIFEST.sha256' ? receipt.source_manifest_sha256 : sourceEntries.get(name);
    if (!expected || (!generated && item.sha256 !== expected)) throw Error(`Runtime source provenance mismatch: ${name}`);
    entries.set(name,item.sha256);
  }
  verifyEntries(actual,entries);
  return {profile:'installed-runtime', files:actual.size, source_manifest_sha256:receipt.source_manifest_sha256};
}
export function sourceManifest(input) {
  const root = safeRoot(input);
  if (fs.existsSync(path.join(root,RUNTIME))) throw Error('Do not regenerate source hashes from an installed runtime');
  return [...listing(root)].filter(([n])=>n!=='MANIFEST.sha256').sort(([a],[b])=>a.localeCompare(b,'en')).map(([n,f])=>`${sha256(fs.readFileSync(f))}  ${relative(n)}\n`).join('');
}
export function runtimeManifest(destination, planned, sourceBytes) {
  const files = planned.filter(f => {
    const rel=path.relative(destination,f.destination);
    return rel && rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel) && rel !== RUNTIME;
  }).map(f => ({path:relative(path.relative(destination,f.destination).split(path.sep).join('/')),sha256:sha256(f.content),kind:path.relative(destination,f.destination)==='config/observer.json'?'generated-config':'source'}));
  files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
  if (new Set(files.map(f=>f.path)).size !== files.length) throw Error('Duplicate runtime planned path');
  return JSON.stringify({format:1,profile:'installed-runtime',source_manifest_sha256:sha256(sourceBytes),files},null,2)+'\n';
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2), root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
    if (args.length===1 && args[0]==='--write') {
      const content=sourceManifest(root), target=safeDestination(root,path.join(root,'MANIFEST.sha256'));
      fs.writeFileSync(target,content); console.log('Source manifest deliberately regenerated. Run the checker next.');
    } else if (!args.length) console.log(JSON.stringify(verifyIntegrity(root)));
    else throw Error('Usage: node scripts/manifest.mjs [--write]');
  } catch(e) { console.error(`Manifest refused: ${e.message}`); process.exitCode=1; }
}
