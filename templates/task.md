# Task packet

Task ID:
Phase / approved plan reference:
Objective and deliverable:
Assigned role / execution mode:
Authoritative input files and exact relevant sections:
Dependencies:
Allowed read scope:
Allowed write files or directories (no wildcard ambiguity):
Excluded paths:
Budget: steps, tool calls, repair limit, output size, and paid-cost ceiling if relevant.
Acceptance criteria:
Required automated evidence:
Required visual or human evidence:
Stop conditions:
Integration owner:

## Return format

Outcome:
Evidence with file/source/job references:
Assumptions and confidence:
Files changed or patch supplied:
Tests actually run and results:
Spec compliance / quality concerns:
Unresolved issues and requested next task:

Do not invent tool execution, participant responses, citations, or approvals. Do not spawn descendants. A coordinator will integrate your result.

## Execution linkage when using actual subagents

Record the absolute `project_root` and, after approved reservation, reciprocal `task.job_id` / `job.task_id`. Do not prefill a run ID. The coordinator uses [ownership](../references/ownership.md) and the lifecycle helpers before persisting or dispatching. Linked job writes must be contained by the task's allowed scope; one execution is one owner, not two leases. Legacy ambiguity needs receipt-based reconciliation.
