import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  parseState, validateContract, validateAgentBudget, validateLeases,
  validateTaskGraph, validateReceipts, validateEvidence, validateApprovals,
  validateProgression, validateState,
} from '../scripts/lib/core.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const starter = () => JSON.parse(readFileSync(path.join(here, '..', 'templates', 'project-state.json'), 'utf8'));

test('parseState rejects malformed JSON and missing schemaVersion', () => {
  assert.throws(() => parseState('{not json'), /malformed/i);
  assert.throws(() => parseState('{"phase":"charter"}'), /schemaVersion/);
});

test('contract: starter state satisfies one-of-three default', () => {
  assert.deepEqual(validateContract(starter()), []);
});

test('contract: changing upgradeChoices without approved change is an error', () => {
  const s = starter(); s.contract.upgradeChoices = 4;
  const errs = validateContract(s);
  assert.equal(errs.length, 1);
  assert.match(errs[0], /approvedChangeRef/);
});

test('contract: deviation allowed when approvedChangeRef names a recorded approval', () => {
  const s = starter(); s.contract.upgradeChoices = 4; s.contract.temporaryResets = false;
  s.approvals.push({ id: 'APR-002', subject: 'contract-change', by: 'user', date: '2026-10-11', ref: 'docs/gds/decisions/DEC-002-four-choices.md' });
  s.contract.approvedChangeRef = 'APR-002';
  assert.deepEqual(validateContract(s), []);
  s.contract.approvedChangeRef = 'APR-999';
  assert.match(validateContract(s)[0], /APR-999/);
});

test('agent budget: spent entries over maxPerMode are flagged', () => {
  const s = starter(); s.agentBudget.maxPerMode = 2;
  s.agentBudget.spent = [1, 2, 3].map(i => ({ mode: 'council', agent: `gds-r${i}`, model: 'sonnet', at: '2026-10-11T00:00:00Z' }));
  assert.match(validateAgentBudget(s)[0], /council.*3.*2/);
});

test('agent budget: a spent record missing fields is flagged', () => {
  const s = starter();
  s.agentBudget.spent = [{ mode: 'council', agent: 'gds-risk-taker' }];
  const errs = validateAgentBudget(s);
  assert.ok(errs.some(e => /model/.test(e)) && errs.some(e => /at\b/.test(e)));
});

test('leases: overlapping paths held by different agents are rejected', () => {
  const errs = validateLeases([
    { agent: 'a', taskId: 'T-001', paths: ['src/combat/'] },
    { agent: 'b', taskId: 'T-002', paths: ['src/combat/enemies.ts'] },
  ]);
  assert.equal(errs.length, 1);
  assert.match(errs[0], /src\/combat/);
});

test('leases: disjoint paths and same-agent overlap are fine', () => {
  assert.deepEqual(validateLeases([
    { agent: 'a', taskId: 'T-001', paths: ['src/combat/', 'src/combat/enemies.ts'] },
    { agent: 'b', taskId: 'T-002', paths: ['src/base/'] },
  ]), []);
});

test('task graph: dependency cycles are detected', () => {
  const errs = validateTaskGraph([
    { id: 'T-001', dependsOn: ['T-002'] },
    { id: 'T-002', dependsOn: ['T-003'] },
    { id: 'T-003', dependsOn: ['T-001'] },
  ]);
  assert.match(errs[0], /cycle/i);
});

test('task graph: unknown dependency ids are detected', () => {
  const errs = validateTaskGraph([{ id: 'T-001', dependsOn: ['T-404'] }]);
  assert.match(errs[0], /T-404/);
});

test('receipts: a receipt for an unknown task is flagged', () => {
  const s = starter();
  s.receipts = [{ taskId: 'T-404', agent: 'x', status: 'completed', evidence: ['ok'], at: '2026-10-11T00:00:00Z' }];
  assert.match(validateReceipts(s)[0], /T-404/);
});

test('receipts: completed requires non-empty evidence', () => {
  const s = starter();
  s.tasks = [{ id: 'T-001', dependsOn: [] }];
  s.receipts = [{ taskId: 'T-001', agent: 'x', status: 'completed', evidence: [], at: '2026-10-11T00:00:00Z' }];
  assert.match(validateReceipts(s)[0], /evidence/);
  s.receipts[0].status = 'bogus';
  assert.ok(validateReceipts(s).some(e => /status/.test(e)));
});

test('evidence: required fields and method enum are enforced', () => {
  const s = starter();
  s.evidence = [{ id: 'EV-001', hypothesis: 'h', method: 'vibes', observation: '', source: 's', date: '2026-10-11', participants: 0 }];
  const errs = validateEvidence(s);
  assert.ok(errs.some(e => /method/.test(e)));
  assert.ok(errs.some(e => /observation/.test(e)));
  s.evidence = [{ id: 'EV-002', hypothesis: 'h', method: 'human-playtest', observation: 'o', source: 's', date: '2026-10-11', participants: 0 }];
  assert.match(validateEvidence(s)[0], /participants/);
});

test('approvals: production phase requires charter, design and plan approvals', () => {
  const s = starter(); s.phase = 'production';
  const errs = validateApprovals(s);
  assert.ok(errs.some(e => /design/.test(e)) && errs.some(e => /plan/.test(e)));
  s.approvals.push(
    { id: 'APR-002', subject: 'design', by: 'user', date: '2026-10-11', ref: 'docs/gds/decisions/DEC-002.md' },
    { id: 'APR-003', subject: 'plan', by: 'user', date: '2026-10-11', ref: 'docs/gds/decisions/DEC-003.md' },
  );
  assert.deepEqual(validateApprovals(s), []);
  s.approvals[1].ref = '';
  assert.match(validateApprovals(s)[0], /ref/);
});

test('progression: interactsWith must reference known layers', () => {
  const s = starter();
  s.progression.layers = [
    { id: 'L1', runAchievement: 'a', retainedResource: 'salt', requirement: 'none', unlocks: 'u', interactsWith: ['L9'], verifyTest: 't', cost: { resource: 'salt', amount: 5 } },
  ];
  assert.match(validateProgression(s)[0], /L9/);
});

test('progression: cost must have a resource and a positive integer amount', () => {
  const s = starter();
  s.progression.layers = [
    { id: 'L1', runAchievement: 'a', retainedResource: 'salt', requirement: 'none', unlocks: 'u', interactsWith: [], verifyTest: 't', cost: { resource: '', amount: -1 } },
  ];
  const errs = validateProgression(s);
  assert.ok(errs.some(e => /resource/.test(e)) && errs.some(e => /amount/.test(e)));
  assert.equal(validateState(starter()).ok, true);
});
