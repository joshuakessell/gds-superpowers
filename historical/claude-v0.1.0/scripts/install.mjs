#!/usr/bin/env node
// Usage: node scripts/install.mjs --target claude|codex|both --scope project|user [--project /abs/path] [--agents] [--dry-run]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { planInstall, applyInstall } from './lib/install.mjs';

const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i === -1 ? fallback : args[i + 1]; };
const opts = {
  packageRoot: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  target: flag('--target', 'both'),
  scope: flag('--scope', 'project'),
  project: flag('--project', undefined),
  agents: args.includes('--agents'),
};
const dryRun = args.includes('--dry-run');

try {
  const plan = planInstall(opts);
  const result = applyInstall(plan, { dryRun });
  const verb = dryRun ? 'would create' : 'created';
  console.log(`${verb} ${result.created.length} file(s), skipped ${result.skipped.length} identical file(s)`);
  for (const d of result.created) console.log(`  ${dryRun ? 'plan' : 'create'}  ${d}`);
} catch (e) {
  console.error(`install refused: ${e.message}`);
  process.exit(1);
}
