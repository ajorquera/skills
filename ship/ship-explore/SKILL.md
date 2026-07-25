---
name: ship-explore
description: Investigate a GitHub issue before implementation — via the research skill, gather everything another agent needs to understand, reproduce, and fix it, and post the findings as an issue comment. Gates the ship pipeline if the issue can't be understood well enough to act on.
disable-model-invocation: true
---

# ship-explore <issue>

Investigate a GitHub issue and post the findings as a comment on that issue, for other agents to consume. Investigation only — this phase proposes no approach, no plan, and changes no code.

## 0. Inputs

`.claude/ship/explore-instructions.md` — mandatory; it governs research depth and blocking criteria, and its repo-specific additions override the defaults below. If missing, stop and say `/ship-setup` must run first.

## 1. Fetch and check for existing research

`gh issue view <n> --comments`. If a comment containing the marker `<!-- ship:research -->` already exists, report that research exists and **exit** — unless `--re-explore` was passed, in which case produce new research (the new comment supersedes; later phases use the most recent marker).

**Exception:** if a `<!-- ship:discussion -->` comment (from ship-discuss) is **newer** than the latest research comment, the research is stale — produce new research even without `--re-explore`.

## 2. Classify

Determine whether the issue is a **Bug** or a **Feature** from the issue itself (title, labels, body). If it's genuinely unclear, investigate first — the classification is often obvious once the current code behavior is understood. Only fall through to the implementability gate (§4) if investigation doesn't settle it.

## 3. Investigate

Run the **research skill** to investigate the issue against primary sources — the codebase, the issue's history, related issues/PRs/discussions. Read `.claude/ship/explore-instructions.md` for depth guidance. Its job: gather everything another agent would need to reproduce (bugs) or locate the current-vs-desired behavior (features), and fix the issue — with no ambiguity.

If `<!-- ship:discussion -->` comments exist (latest supersedes), their decisions are settled input: research must honor them, not re-open them.

## 4. Implementability gate

If, after investigating, the issue meets the blocking criteria in the explore instructions (e.g. classification still unclear, or requirements are contradictory/missing in a way a wrong guess would be costly):

1. Post a comment explaining exactly what's missing or what decision is needed.
2. `gh issue edit <n> --add-label "ship:needs-info"`
3. Report `BLOCKED` as your outcome and stop. The pipeline must not proceed to implement.

## 5. Post the findings

Comment on the issue, structured as:

```
<!-- ship:research -->
## Issue research (ship-explore)

**Title:** ...
**Type:** Bug | Feature
**Summary:** ...
**Reproduction:** ...                    (Bug — steps to reproduce, expected vs. actual)
**Current vs. desired behavior:** ...    (Feature — use instead of Reproduction)
**Relevant code:** ...                   (files/modules/entry points, what they currently do)
**Risks:** ...                           (what could break — blast radius, migration/compat, security surface)
**Sources:** link to the research skill's findings file

🤖 ship-explore
```

Include exactly one of **Reproduction** or **Current vs. desired behavior**, matching the Type. Never include a proposed approach, effort estimate, or implementation sequencing — that's ship-design's job, not this phase's.

Report `READY` (or `BLOCKED`) plus a one-line summary as your outcome — the orchestrator branches on it.
