---
name: ship
description: "Turns a GitHub issue into a review-approved PR via subagent workflow: explore → design → implement → review."
disable-model-invocation: true
---

# ship [issue] [--max-iterations N] [--re-explore] [--re-design]

End-to-end pipeline for turning a GitHub issue into a review-approved PR. It runs the subagents `ship-explore`, `ship-design`, `ship-implement`, and `ship-review` in sequence. It has an implement-review loop with a maximum number of iterations.

## 1. Preflight

- `.claude/ship/` must exist at the repo root — otherwise stop and tell the user to run `/ship-setup`.
- Read `max_review_iterations` from `.claude/ship/config.md`; `--max-iterations` overrides it.

## 2. Resolve the issue

**Argument given** — use it.

**No argument** — pick from the backlog:

1. Eligible = open issues, not labeled `ship:needs-info`, with no open `ship/issue-<n>-*` PR (`gh pr list --search "head:ship/"` to check).
2. Pick the **oldest** eligible issue.
3. **Ask the user to confirm** ("picking #42: <title> — proceed?") before doing anything else. This is the pipeline's only interactive checkpoint; do not skip it.

If nothing is eligible, say so and stop.

## 3. Run the pipeline

Run each phase as a **subagent** (Agent tool, synchronous) so each phase's context stays separate. Relay each phase's one-line outcome to the user as it completes.

**Explore** — skip if the issue already has a `<!-- ship:research -->` comment (unless `--re-explore`). Otherwise run `ship-explore <n>` in a subagent. If it reports `BLOCKED`, stop the pipeline and tell the user why — the issue now carries `ship:needs-info`.

**Design** — always runs; skip only if a `<!-- ship:design -->` comment already exists and is newer than the latest research comment (unless `--re-design`, or the research was just redone by `--re-explore`, which makes any existing design stale too). Run `ship-design <n>` in a subagent, same lane as the other phases — it decides the approach autonomously (prototyping where a decision is genuinely uncertain, per its own SKILL.md) and posts the `<!-- ship:design -->` comment. If it reports `BLOCKED`, stop the pipeline and tell the user why — the issue now carries `ship:needs-info`, handled exactly like an Explore block.

**Implement** — run `ship-implement <n>` in a subagent. Resume-aware: an existing `ship/issue-<n>-*` branch or open PR is continued, never duplicated. Follows the latest `<!-- ship:design -->` comment's approach; a later `<!-- ship:discussion -->` comment overrides it where they conflict. Outcome: a draft PR.

**Review loop** — for `k = 1 .. max_review_iterations`:

1. Run `ship-review <pr>` in a subagent, telling it the iteration number `k`.
2. `APPROVED` → done: PR is ready-for-review. Report the PR URL and stop.
3. `CHANGES_REQUESTED` → if `k == max_review_iterations`, go to exhaustion. Otherwise run `ship-implement <n>` in fix-mode, passing the blocking findings verbatim, then loop.

**Exhaustion** — max iterations reached with blocking findings still open:

1. Comment on the PR: `ship: stopped after <N> review iterations — needs a human. Unresolved blocking findings:` followed by the list.
2. Report the same to the user and stop cleanly.

## 4. What ship never does

- PR **stays draft during the implement/review loop**. Do not close it, do not flip it ready before an `APPROVED` verdict.
- Merge. The ready-for-review flip is the pipeline's terminal state; merging is a human act.
- Restart from scratch on re-run: `/ship <n>` on a partially-shipped issue resumes (existing research, branch, PR, and prior review threads are all reused).
- Push a code change and stop without a following review pass — see "Every push gets a review" above.
