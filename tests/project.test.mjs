import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const pkg = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(pkg, 'scripts', 'project.mjs');
const run = (...a) => execFileSync('node', [script, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

test('init scaffolds state and index, refuses to overwrite, and check passes', () => {
  const project = mkdtempSync(path.join(tmpdir(), 'gds-proj-'));
  const dry = run('init', '--project', project, '--dry-run');
  assert.match(dry, /plan/);
  assert.equal(existsSync(path.join(project, 'docs')), false);
  run('init', '--project', project);
  const state = JSON.parse(readFileSync(path.join(project, 'docs', 'gds', 'state.json'), 'utf8'));
  assert.equal(state.phase, 'charter');
  assert.deepEqual(state.approvals, [], 'init does not preapprove a charter');
  assert.ok(existsSync(path.join(project, 'docs', 'gds', 'README.md')));
  assert.throws(() => run('init', '--project', project), /refusing to overwrite/);
  assert.match(run('check', '--project', project), /state ok/);
});

test('check fails with named problems on a violating state', () => {
  const project = mkdtempSync(path.join(tmpdir(), 'gds-proj-'));
  run('init', '--project', project);
  const file = path.join(project, 'docs', 'gds', 'state.json');
  const s = JSON.parse(readFileSync(file, 'utf8'));
  s.phase = 'production'; s.contract.upgradeChoices = 5;
  writeFileSync(file, JSON.stringify(s));
  assert.throws(() => run('check', '--project', project), (e) => /approvedChangeRef/.test(e.stderr) && /requires a recorded plan approval/.test(e.stderr));
});
