/** One canonical skill, with a reviewed legacy-command handoff. No deletions. */
import fs from 'node:fs';
import path from 'node:path';
import {safeDestination, treeFiles} from './lib.mjs';
import {sha256} from './managed-install.mjs';
export const LEGACY_ALIAS = `---
name: gdsuperpowers
description: Use only when the user explicitly invokes the compatibility GDSuperpowers command.
disable-model-invocation: true
---
<!-- GDS-COMPAT-ALIAS -->
Read ../gds-superpowers/SKILL.md relative to this skill. Forward the user's mode and arguments unchanged; default to start. Do not start a second coordinator or state file. /gdsuperpowers observe remains a one-pass observation command. If the canonical sibling is missing, report the blocker instead of loading old implementation files.
`;
export function planCompatibility(root, hostFolder, records) {
  const directory = safeDestination(root, path.join(root, hostFolder, 'skills/gdsuperpowers'));
  const destination = safeDestination(root, path.join(directory, 'SKILL.md'));
  let settings;
  if (fs.existsSync(directory)) {
    if (!fs.statSync(directory).isDirectory()) throw Error('Legacy skill path is not a directory');
    if (!fs.existsSync(destination)) throw Error('Incomplete legacy skill: preserve and reconcile it before installing the alias');
    const previous = fs.readFileSync(destination, 'utf8');
    if (previous !== LEGACY_ALIAS) {
      // A known entry point is insufficient: refuse customized supporting files too.
      const match = records.find(record => record.sha256['SKILL.md'] === sha256(Buffer.from(previous)));
      if (!match) throw Error('Customized or unknown /gdsuperpowers skill; no alias was installed');
      for (const file of treeFiles(directory)) {
        const relative = path.relative(directory, file).split(path.sep).join('/');
        if (relative === 'config/observer.json') {
          settings = JSON.parse(fs.readFileSync(file, 'utf8'));
          if (!settings || Array.isArray(settings) || ![1,2].includes(settings.schema_version)) throw Error('Unknown legacy observer settings; preserve and reconcile');
          continue;
        }
        if (match.sha256[relative] !== sha256(fs.readFileSync(file))) throw Error(`Customized legacy supporting file: ${relative}; reconcile before alias migration`);
      }
    }
  }
  return {file:{key:'compat:gdsuperpowers', destination, content:LEGACY_ALIAS}, importedSettings:settings};
}
