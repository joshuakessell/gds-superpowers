# Task/job ownership and admission

Canonical schema remains 3. Optional reciprocal `task.job_id` and `job.task_id` identify one recorded execution. A role name or matching run-ID strings alone do not establish a link. Existing ambiguous pairs remain intact until explicitly reconciled against real receipts; do not delete a ledger or invent execution to make validation pass.

A linked task declares `execution_kind: actual-subagent`, its role, an absolute `project_root`, and allowed files. Its job has the same canonical root/role and write paths contained by that scope. The live job is the lease owner; the task scope is authorization, not a second lease. A standalone active task remains an owner. Reserved plus active jobs and unlinked active tasks share the cap, including read-only research. Read-only paths acquire no write lease.

Only the coordinator invokes the helpers in `scripts/jobs.mjs` and persists their validated result:

- `reserveJob(state, packet)`: optionally supply `task_id` for an existing pending/blocked actual-subagent task. It records the reciprocal link atomically without a fake run ID. Reconcile any prior execution first.
- `startJob(state, id, actualRunId)`: recheck the candidate, activate the linked task and job together, and record the host receipt.
- `activateTask(state, id)`: activate an unlinked task after ownership/dependency checks. Linked tasks use `startJob`.
- `finishJob(state, id, status, evidenceRef)`: completed/failed outcomes require valid state and actual evidence. Cancellation only releases that job and its reciprocal task, which becomes blocked; it can reduce an invalid or migrating ledger without admitting new work or claiming completion.

Refused admissions leave state unchanged. Full-state validation uses the same ownership rules. Run `project.mjs check` before persistence/dispatch and independently inspect scoped user approval. These local helpers are not an authorization service or cross-process lock.

Selected symlink roots are refused. Existing ancestor aliases canonicalize under the filesystem policy; nested roots compare absolute paths. Offline non-existent roots retain a lexical tail after canonicalizing their existing ancestor. Legacy unscoped tasks conflict conservatively; a linked pair requires explicit root identity. Actual file operations still require the selected repository boundary and host permissions.

A child receives the absolute authoritative project root, exact inputs, approved slice/revision, scope, write lease, budget and stop condition. A relative working directory is not project identity. Only the coordinator records jobs or observer findings; children do not spawn descendants.
