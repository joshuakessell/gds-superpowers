// State parsing and the structural validators GDSuperpowers runs on docs/gds/state.json.
// Pure functions: each returns an array of error strings (empty = ok).
export { validateTaskGraph, validateReceipts } from './graph.mjs';
export { validateEvidence, validateApprovals, validateProgression } from './evidence.mjs';
import { validateTaskGraph, validateReceipts } from './graph.mjs';
import { validateEvidence, validateApprovals, validateProgression } from './evidence.mjs';

export function parseState(text) {
  let state;
  try { state = JSON.parse(text); } catch (e) { throw new Error(`malformed state JSON: ${e.message}`); }
  if (!state || typeof state !== 'object' || typeof state.schemaVersion !== 'number') {
    throw new Error('state is missing a numeric schemaVersion');
  }
  return state;
}

const approvalIds = (state) => new Set((state.approvals ?? []).map(a => a.id));

export function validateContract(state) {
  const c = state.contract ?? {};
  const deviates = c.upgradeChoices !== 3 || c.temporaryResets !== true || c.profile !== 'roguelite-default';
  if (!deviates) return [];
  if (!c.approvedChangeRef) {
    return ['contract deviates from the roguelite default (one of three temporary upgrades, temporary resets) but contract.approvedChangeRef is empty; record a user-approved contract change first'];
  }
  if (!approvalIds(state).has(c.approvedChangeRef)) {
    return [`contract.approvedChangeRef ${c.approvedChangeRef} does not match any recorded approval id`];
  }
  return [];
}

export function validateAgentBudget(state) {
  const b = state.agentBudget ?? { spent: [] };
  const errors = [];
  const perMode = new Map();
  (b.spent ?? []).forEach((rec, i) => {
    for (const f of ['mode', 'agent', 'model', 'at']) {
      if (!rec[f]) errors.push(`agentBudget.spent[${i}] is missing ${f}`);
    }
    perMode.set(rec.mode, (perMode.get(rec.mode) ?? 0) + 1);
  });
  for (const [mode, n] of perMode) {
    if (n > b.maxPerMode) errors.push(`agent budget exceeded: mode ${mode} spent ${n} dispatches, maxPerMode is ${b.maxPerMode}`);
  }
  return errors;
}

const norm = (p) => p.replace(/\\/g, '/').replace(/\/+$/, '') + '/';
const overlaps = (a, b) => norm(a).startsWith(norm(b)) || norm(b).startsWith(norm(a));

export function validateLeases(leases = []) {
  const errors = [];
  for (let i = 0; i < leases.length; i++) {
    for (let j = i + 1; j < leases.length; j++) {
      if (leases[i].agent === leases[j].agent) continue;
      for (const p of leases[i].paths ?? []) for (const q of leases[j].paths ?? []) {
        if (overlaps(p, q)) errors.push(`write lease overlap: ${leases[i].agent} holds ${p} and ${leases[j].agent} holds ${q}`);
      }
    }
  }
  return errors;
}

export function validateState(state) {
  const errors = [
    ...validateContract(state), ...validateAgentBudget(state), ...validateLeases(state.leases),
    ...validateTaskGraph(state.tasks), ...validateReceipts(state), ...validateEvidence(state),
    ...validateApprovals(state), ...validateProgression(state),
  ];
  return { ok: errors.length === 0, errors };
}
