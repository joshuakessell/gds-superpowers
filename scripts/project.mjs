#!/usr/bin/env node
// Usage: node scripts/project.mjs init|check --project /abs/path [--dry-run]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseState, validateState } from './lib/core.mjs';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const cmd = args[0];
const i = args.indexOf('--project');
const project = i === -1 ? undefined : args[i + 1];
const dryRun = args.includes('--dry-run');

export function initFiles(projectDir) {
  const tpl = JSON.parse(readFileSync(path.join(pkg, 'templates', 'project-state.json'), 'utf8'));
  tpl.project.name = path.basename(projectDir);
  tpl.approvals = [];
  return [
    { dest: path.join(projectDir, 'docs', 'gds', 'state.json'), content: JSON.stringify(tpl, null, 2) + '\n' },
    { dest: path.join(projectDir, 'docs', 'gds', 'README.md'), content: readFileSync(path.join(pkg, 'templates', 'docs-index.md'), 'utf8') },
  ];
}

function init() {
  const files = initFiles(project);
  const existing = files.filter(f => existsSync(f.dest));
  if (existing.length) throw new Error(`refusing to overwrite: ${existing.map(f => f.dest).join(', ')}`);
  for (const f of files) {
    console.log(`${dryRun ? 'plan  ' : 'create'} ${f.dest}`);
    if (!dryRun) { mkdirSync(path.dirname(f.dest), { recursive: true }); writeFileSync(f.dest, f.content); }
  }
}

function check() {
  const file = path.join(project, 'docs', 'gds', 'state.json');
  const result = validateState(parseState(readFileSync(file, 'utf8')));
  if (result.ok) { console.log(`state ok: ${file}`); return; }
  for (const e of result.errors) console.error(`  - ${e}`);
  throw new Error(`${result.errors.length} state problem(s) in ${file}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!project || !path.isAbsolute(project)) throw new Error('--project must be an absolute path');
    if (cmd === 'init') init(); else if (cmd === 'check') check(); else throw new Error('command must be init or check');
  } catch (e) { console.error(`project.mjs: ${e.message}`); process.exit(1); }
}
