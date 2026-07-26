---
name: ship-explore
description: Investigates an issue or a feature. It gathers enough information for another agent to understand, reproduce, implement and post the findings as an issue comment. 
disable-model-invocation: true
---

# ship-explore <issue> --re-explore

Investigate a GitHub issue and post the findings as a comment on that issue, for other agents to consume. Investigation only — this phase proposes no approach, no plan, and changes no code.

## 0. Inputs

`.claude/ship/explore-instructions.md` — mandatory; it governs research depth and blocking criteria, and its repo-specific additions override the defaults below. If missing, stop and say `/ship-setup` must run first.

## 1. Fetch and check for existing research

`gh issue view <n> --comments`. If a comment containing the marker `<!-- ship:research -->` already exists, report that research exists and **exit** — unless `--re-explore` was passed, in which case produce new research (the new comment supersedes; later phases use the most recent marker).

## 2. Research
Read and follow the instructions in `.claude/ship/explore-instructions.md`. These instructions are the guidelines for your research. If you encounter a blocking issue, report it and exit. 

## 3. Post the findings

Comment on the issue, structured as:

```
<!-- ship:research -->
## Issue research (ship-explore)

**Title:** ...
**Type:** Bug | Feature
**Summary:** ...
**Reproduction:** ...                    (Bug — steps to reproduce, expected vs. actual)
**Current vs. desired behavior:** ...    (Feature — use instead of Reproduction)
**Risks:** ...                           (what could break — migration/compat, security surface)
**Sources:** a collapsible list of sources that will be used to support the research, including links to relevant code, documentation, and other issues

🤖 ship-explore
```

Include exactly one of **Reproduction** or **Current vs. desired behavior**, matching the Type. Never include a proposed approach, effort estimate, or implementation sequencing.

Report `READY` (or `BLOCKED`) plus a one-line summary as your outcome — the orchestrator branches on it.
