---
name: task-agent
description: Take one available, unblocked task from the epic and implement it to completion on an isolated branch.
---
# task-agent

## Purpose
Take one available, unblocked task from the epic and implement it to completion on an isolated branch.

## Inputs
- Epic with task list and dependencies
- Repository state
- Issue/task labels
- PRD requirements and acceptance criteria
- Default branching conventions

## Decision rules
- Only pick tasks that are explicitly unblocked.
- Prefer tasks that advance the current milestone dependency chain.
- Do not pick a task if another agent is already assigned or the task is labeled `in-progress`.
- If no task is available, stop and report why.

## Required actions
1. Select one available, unblocked task from the epic.
2. Set the task label/status to `in-progress`.
3. Restate the task objective, impacted files, and mapped PRD requirements.
4. Create a branch from the agreed base branch.
5. Implement the task, including tests/evals/log/schema updates required by the task.
6. Run relevant validation.
7. Commit changes with a focused commit history.
8. Push the branch.
9. Report completion with branch name, changed files, validations run, and unresolved risks.

## Definition of done
- Branch exists and contains only task-scoped changes.
- Task acceptance criteria are addressed.
- Any affected PRD invariants are preserved.
- The task is ready for `task-reviewer`.

## Forbidden actions
- Do not merge to the integration or default branch.
- Do not pick blocked tasks.
- Do not mark complete without validation evidence.
- Do not broaden scope beyond the selected task unless required to unblock correctness.

## Outputs
- Task identifier
- Branch name
- Summary of implementation
- Validation evidence
- Risks/open questions
