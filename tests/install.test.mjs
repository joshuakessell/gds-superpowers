import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, symlinkSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { planInstall, applyInstall } from '../scripts/lib/install.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.join(here, '..');
const tmp = () => mkdtempSync(path.join(tmpdir(), 'gds-'));
const opts = (project, extra = {}) => ({ packageRoot: pkg, target: 'claude', scope: 'project', project, agents: false, ...extra });

test('dry run reports creates and writes nothing', () => {
  const project = tmp();
  const plan = planInstall(opts(project));
  assert.ok(plan.some(e => e.dest.endsWith(path.join('.claude', 'skills', 'gds-superpowers', 'SKILL.md'))));
  const result = applyInstall(plan, { dryRun: true });
  assert.ok(result.created.length > 0);
  assert.equal(existsSync(path.join(project, '.claude')), false);
});

test('install creates files only and excludes tests/ and validation/', () => {
  const project = tmp();
  const plan = planInstall(opts(project));
  assert.ok(plan.every(e => !/[\\/](tests|validation)[\\/]/.test(e.rel)));
  applyInstall(plan, { dryRun: false });
  const skill = path.join(project, '.claude', 'skills', 'gds-superpowers');
  assert.ok(existsSync(path.join(skill, 'SKILL.md')));
  assert.ok(existsSync(path.join(skill, 'scripts', 'project.mjs')));
  assert.equal(existsSync(path.join(project, '.claude', 'agents')), false);
});

test('reinstalling identical content is an idempotent no-op', () => {
  const project = tmp();
  applyInstall(planInstall(opts(project)), { dryRun: false });
  const plan2 = planInstall(opts(project));
  assert.ok(plan2.length > 0 && plan2.every(e => e.action === 'skip-identical'));
  const r = applyInstall(plan2, { dryRun: false });
  assert.equal(r.created.length, 0);
});

test('a differing existing file is a conflict and nothing is written', () => {
  const project = tmp();
  const skill = path.join(project, '.claude', 'skills', 'gds-superpowers');
  mkdirSync(skill, { recursive: true });
  writeFileSync(path.join(skill, 'SKILL.md'), 'something else');
  const plan = planInstall(opts(project));
  assert.ok(plan.some(e => e.action === 'conflict'));
  assert.throws(() => applyInstall(plan, { dryRun: false }), /conflict/i);
  assert.equal(readdirSync(skill).length, 1, 'no sibling files were created');
});

test('destinations must stay inside the target root', () => {
  assert.throws(() => planInstall(opts('relative/path')), /absolute/);
  const project = tmp();
  const plan = planInstall(opts(project));
  for (const e of plan) assert.ok(e.dest.startsWith(project + path.sep), e.dest);
});

test('a symlinked destination component is refused', () => {
  const project = tmp(); const elsewhere = tmp();
  mkdirSync(path.join(project, '.claude'));
  symlinkSync(elsewhere, path.join(project, '.claude', 'skills'));
  const plan = planInstall(opts(project));
  assert.ok(plan.some(e => e.action === 'refuse-symlink'));
  assert.throws(() => applyInstall(plan, { dryRun: false }), /symlink/i);
  assert.equal(readdirSync(elsewhere).length, 0);
});

test('CLI installs the claude layout with agents into a temp project', () => {
  const project = tmp();
  const out = execFileSync('node', [path.join(pkg, 'scripts', 'install.mjs'), '--target', 'claude', '--scope', 'project', '--project', project, '--agents'], { encoding: 'utf8' });
  assert.match(out, /created/i);
  assert.ok(existsSync(path.join(project, '.claude', 'skills', 'gds-superpowers', 'SKILL.md')));
  assert.ok(existsSync(path.join(project, '.claude', 'agents', 'gds-risk-taker.md')));
  assert.equal(existsSync(path.join(project, '.agents')), false);
});

test('CLI installs the codex layout into a temp project', () => {
  const project = tmp();
  execFileSync('node', [path.join(pkg, 'scripts', 'install.mjs'), '--target', 'codex', '--scope', 'project', '--project', project, '--agents'], { encoding: 'utf8' });
  assert.ok(existsSync(path.join(project, '.agents', 'skills', 'gds-superpowers', 'SKILL.md')));
  assert.ok(existsSync(path.join(project, '.codex', 'agents', 'gds-producer.toml')));
  assert.equal(existsSync(path.join(project, '.claude')), false);
  const md = readFileSync(path.join(project, '.agents', 'skills', 'gds-superpowers', 'SKILL.md'), 'utf8');
  assert.match(md, /^---\nname: gds-superpowers/);
});
