---
name: ship-explore
description: Investigates an issue or a feature. It gathers enough information for another agent to understand, reproduce, implement and post the findings as an issue comment. 
disable-model-invocation: true
---

# ship-explore <issue> --re-explore

Investigate a GitHub issue and post the findings as a comment on that issue, for other agents to consume. Investigation only — this phase proposes no approach, no plan, and changes no code.

## 0. Inputs

`.claude/ship/explore-instructions.md` — mandatory; it governs research depth and blocking criteria, and its repo-specific additions override the defaults below. If missing, report outcome `SETUP_REQUIRED` with summary "`.claude/ship/explore-instructions.md` missing, run `/ship-setup`" and exit.

## 1. Fetch and check for existing research

Find any comment whose body contains the marker `<!-- ship:research -->` (e.g. `gh issue view <n> --json comments -q '.comments[] | select(.body | contains("ship:research")) | {id, body}'`). At most one such comment ever exists on an issue.

- If found and `--re-explore` was **not** passed: report `READY` with summary "research already exists" and exit.
- If found and `--re-explore` **was** passed: note its comment ID, proceed to step 2, and in step 3 edit that comment in place.
- If not found: proceed to step 2, and in step 3 create a new comment.

## 2. Research

Classify the issue as `Bug` or `Feature` first, before doing any deep research. If it's neither, report `BLOCKED` with a one-line reason (e.g. "issue is neither a bug nor a feature request") and exit — do not proceed to research. No fixed rule for the classification; use judgment.

Otherwise, read and follow the instructions in `.claude/ship/explore-instructions.md` — these govern research depth and any repo-specific blocking criteria beyond the type check above. If you encounter a blocking issue, report `BLOCKED` with a one-line reason and exit.

## 3. Post the findings

Comment structured as:

```
<!-- ship:research -->
## Issue research (ship-explore)

**Title:** ...
**Type:** Bug | Feature
**Summary:** ...
**Reproduction:** ...                    (Bug — steps to reproduce, expected vs. actual)
**Current vs. desired behavior:** ...    (Feature — use instead of Reproduction)
**Risks:** ...                           (what could break — migration/compat, security surface; "None identified" if none found)
**Sources:** a collapsible list of sources used to support the research, including links to relevant code, documentation, and other issues

🤖 ship-explore
```

Include exactly one of **Reproduction** or **Current vs. desired behavior**, matching the Type. Never include a proposed approach, effort estimate, or implementation sequencing.

If step 1 found an existing research comment (re-explore case), edit it in place: `gh api repos/{owner}/{repo}/issues/comments/{id} -X PATCH -f body=...`. Never use `gh issue comment --edit-last` — later `ship-*` phases post their own marked comments on the same issue, so the research comment won't reliably be "last." Otherwise, create a new comment: `gh issue comment <n> --body ...`.

Report `READY`, `BLOCKED`, or `SETUP_REQUIRED` plus a one-line summary as your outcome — the orchestrator branches on it.
