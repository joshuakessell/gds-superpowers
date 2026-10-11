// Evidence entries, approval gates, and progression layers.
const METHODS = new Set(['human-playtest', 'simulation', 'research', 'concept']);
const PHASES = ['charter', 'research', 'concept', 'design', 'prototype', 'slice', 'production', 'polish', 'ship'];
const GATES = { prototype: ['charter'], slice: ['charter', 'design'], production: ['charter', 'design', 'plan'], polish: ['charter', 'design', 'plan'], ship: ['charter', 'design', 'plan', 'ship'] };

export function validateEvidence(state) {
  const errors = [];
  (state.evidence ?? []).forEach((ev, i) => {
    for (const f of ['id', 'hypothesis', 'observation', 'source', 'date']) {
      if (!ev[f]) errors.push(`evidence[${i}] is missing ${f}`);
    }
    if (!METHODS.has(ev.method)) errors.push(`evidence[${i}] has unknown method ${ev.method}`);
    if (ev.method === 'human-playtest' && !(Number.isInteger(ev.participants) && ev.participants > 0)) {
      errors.push(`evidence[${i}] is a human-playtest with no human participants`);
    }
  });
  return errors;
}

export function validateApprovals(state) {
  const errors = [];
  const subjects = new Set();
  (state.approvals ?? []).forEach((a, i) => {
    for (const f of ['id', 'subject', 'by', 'date']) if (!a[f]) errors.push(`approvals[${i}] is missing ${f}`);
    if (!a.ref) errors.push(`approvals[${i}] (${a.subject}) has no ref to the approved document`);
    subjects.add(a.subject);
  });
  if (!PHASES.includes(state.phase)) errors.push(`unknown phase ${state.phase}`);
  for (const need of GATES[state.phase] ?? []) {
    if (!subjects.has(need)) errors.push(`phase ${state.phase} requires a recorded ${need} approval`);
  }
  return errors;
}

export function validateProgression(state) {
  const layers = state.progression?.layers ?? [];
  const ids = new Set(layers.map(l => l.id));
  const errors = [];
  layers.forEach((l, i) => {
    for (const f of ['id', 'runAchievement', 'retainedResource', 'requirement', 'unlocks', 'verifyTest']) {
      if (!l[f]) errors.push(`progression layer[${i}] is missing ${f}`);
    }
    for (const ref of l.interactsWith ?? []) if (!ids.has(ref)) errors.push(`layer ${l.id} interactsWith unknown layer ${ref}`);
    errors.push(...costErrors(l));
  });
  return errors;
}

function costErrors(layer) {
  const c = layer.cost;
  if (!c) return [`layer ${layer.id} has no cost`];
  const errors = [];
  if (!c.resource) errors.push(`layer ${layer.id} cost has no resource`);
  if (!(Number.isInteger(c.amount) && c.amount > 0)) errors.push(`layer ${layer.id} cost amount must be a positive integer`);
  return errors;
}
