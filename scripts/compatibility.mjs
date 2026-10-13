/** Retire the obsolete command safely. Never generates a second skill entry. */
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {safeRoot, safeDestination} from './lib.mjs';
import {sha256} from './managed-install.mjs';
// Fingerprint of the former shipped alias, used only to recognize an upgrade.
const ALIAS_SHA256 = '8ee2aa27caae6c244f7bb9c982a192ca9ab551251e8a8135f549b0d19ca76a29';
const HOSTS = new Set(['.claude', '.agents']);

function snapshot(directory) {
  const files = [];
  function walk(dir) {
    const stat = fs.lstatSync(dir);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw Error(`Unsafe legacy directory: ${dir}`);
    for (const entry of fs.readdirSync(dir).sort()) {
      const file = path.join(dir, entry), info = fs.lstatSync(file);
      if (info.isSymbolicLink()) throw Error(`Symlink legacy file refused: ${file}`);
      if (info.isDirectory()) { files.push({path:path.relative(directory,file),kind:'directory'}); walk(file); }
      else if (info.isFile()) files.push({path:path.relative(directory,file),kind:'file',sha256:sha256(fs.readFileSync(file)),mode:info.mode & 0o777});
      else throw Error(`Unsupported legacy file: ${file}`);
    }
  }
  walk(directory);
  return files;
}

export function planCompatibility(root, hostFolder, records, {upgrade = false} = {}) {
  if (!HOSTS.has(hostFolder)) throw Error('Unknown legacy host directory');
  const base = safeRoot(root);
  const directory = safeDestination(base, path.join(base, hostFolder, 'skills/gdsuperpowers'));
  if (!fs.existsSync(directory)) return {retirement:null, importedSettings:undefined};
  const files = snapshot(directory);
  const entry = files.find(f => f.path === 'SKILL.md' && f.kind === 'file');
  if (!entry) throw Error('Incomplete legacy skill: preserve and reconcile it before upgrading');
  const isAlias = entry.sha256 === ALIAS_SHA256;
  const matched = records.find(record => record.sha256?.['SKILL.md'] === entry.sha256);
  if (!isAlias && !matched) throw Error('Customized or unknown legacy skill; nothing was retired');
  let settings;
  for (const file of files.filter(f => f.kind === 'file')) {
    const relative = file.path.split(path.sep).join('/');
    if (relative === 'config/observer.json') {
      settings = JSON.parse(fs.readFileSync(path.join(directory,file.path),'utf8'));
      if (!settings || Array.isArray(settings) || ![1,2].includes(settings.schema_version)) throw Error('Unknown legacy observer settings; preserve and reconcile');
    } else if (!isAlias && matched.sha256[relative] !== file.sha256) {
      throw Error(`Customized legacy supporting file: ${relative}; reconcile before retirement`);
    }
  }
  if (!upgrade) throw Error('The obsolete command is installed. Use --upgrade to archive its recognized directory after canonical installation.');
  return {retirement:{root:base,hostFolder,directory,files}, importedSettings:settings};
}

export function verifyRetirements(root, retirements) {
  const base = safeRoot(root);
  for (const item of retirements) {
    if (item.root !== base || !HOSTS.has(item.hostFolder) || item.directory !== path.join(base,item.hostFolder,'skills/gdsuperpowers')) throw Error('Invalid retirement boundary');
    safeDestination(base,item.directory);
    if (JSON.stringify(snapshot(item.directory)) !== JSON.stringify(item.files)) throw Error(`Concurrent change in legacy skill: ${item.directory}`);
  }
}

export function retireCompatibility(root, retirements, {dryRun = false} = {}) {
  verifyRetirements(root,retirements);
  if (dryRun || !retirements.length) return [];
  const base = safeRoot(root), archived = [];
  for (const item of retirements) {
    // Only remove discovery after the replacement has actually been installed.
    const canonical = safeDestination(base,path.join(base,item.hostFolder,'skills/gds-superpowers/SKILL.md'));
    if (!fs.existsSync(canonical) || !/^name: gds-superpowers\r?$/m.test(fs.readFileSync(canonical,'utf8'))) throw Error('Canonical skill missing; legacy directory preserved');
    verifyRetirements(base,[item]);
    const parent = safeDestination(base,path.join(base,'.gds-superpowers-backups'));
    fs.mkdirSync(parent,{recursive:true});
    const backup = safeDestination(base,path.join(parent,`retired-command-${randomBytes(12).toString('hex')}`));
    fs.mkdirSync(backup); // Exclusive directory creation; never replace a previous archive.
    const destination = safeDestination(base,path.join(backup,'gdsuperpowers'));
    fs.writeFileSync(path.join(backup,'receipt.json'),JSON.stringify({format:1,operation:'archive-obsolete-command',source:item.directory,destination,files:item.files},null,2)+'\n',{flag:'wx'});
    verifyRetirements(base,[item]);
    // Rename preserves the complete directory, including unused support files and logs.
    fs.renameSync(item.directory,destination);
    archived.push({source:item.directory,destination});
  }
  return archived;
}
