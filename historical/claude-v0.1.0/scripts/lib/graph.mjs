// Task dependency graph and execution receipts.
const RECEIPT_STATUSES = new Set(['started', 'completed', 'blocked', 'failed']);

export function validateTaskGraph(tasks = []) {
  const ids = new Set(tasks.map(t => t.id));
  const errors = [];
  for (const t of tasks) for (const d of t.dependsOn ?? []) {
    if (!ids.has(d)) errors.push(`task ${t.id} depends on unknown task ${d}`);
  }
  const cycle = findCycle(tasks);
  if (cycle) errors.push(`task dependency cycle: ${cycle.join(' -> ')}`);
  return errors;
}

function findCycle(tasks) {
  const deps = new Map(tasks.map(t => [t.id, t.dependsOn ?? []]));
  const state = new Map();
  const walk = (id, trail) => {
    if (state.get(id) === 'done') return null;
    if (state.get(id) === 'active') return [...trail, id];
    state.set(id, 'active');
    for (const d of deps.get(id) ?? []) { const c = walk(d, [...trail, id]); if (c) return c; }
    state.set(id, 'done');
    return null;
  };
  for (const id of deps.keys()) { const c = walk(id, []); if (c) return c; }
  return null;
}

export function validateReceipts(state) {
  const ids = new Set((state.tasks ?? []).map(t => t.id));
  const errors = [];
  (state.receipts ?? []).forEach((r, i) => {
    if (!ids.has(r.taskId)) errors.push(`receipt[${i}] refers to unknown task ${r.taskId}`);
    if (!RECEIPT_STATUSES.has(r.status)) errors.push(`receipt[${i}] has invalid status ${r.status}`);
    if (r.status === 'completed' && !(Array.isArray(r.evidence) && r.evidence.length)) {
      errors.push(`receipt[${i}] for ${r.taskId} is completed without evidence`);
    }
    if (!r.agent || !r.at) errors.push(`receipt[${i}] is missing agent or at`);
  });
  return errors;
}
