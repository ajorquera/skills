---
name: ship
description: "Orchestrate a GitHub issue from exploration to a review-approved PR: ship-explore → ship-design → ship-implement → (ship-review ⇄ ship-implement) up to max iterations. Explore/implement/review run in subagents; design always runs interactively in the main thread. No argument: pick the oldest eligible open issue and confirm before starting."
disable-model-invocation: true
---

# ship [issue] [--max-iterations N] [--re-explore] [--re-design]

End-to-end pipeline: issue → research → draft PR → review loop → ready-for-review PR. A human always merges.

## 1. Preflight

- `.claude/ship/` must exist at the repo root — otherwise stop and tell the user to run `/ship-setup`.
- Read `max_review_iterations` from `.claude/ship/config.md`; `--max-iterations` overrides it.

## 2. Resolve the issue

**Argument given** — use it.

**No argument** — pick from the backlog:

1. Eligible = open issues, not labeled `ship:needs-info`, with no open `ship/issue-<n>-*` PR (`gh pr list --search "head:ship/"` to check).
2. Pick the **oldest** eligible issue.
3. **Ask the user to confirm** ("picking #42: <title> — proceed?") before doing anything else. This is the first of two interactive steps (Design, §3, is the second); do not skip it.

If nothing is eligible, say so and stop.

## 3. Run the pipeline

Run each phase as a **subagent** (Agent tool, synchronous) so implementation and review contexts stay separate — except Design, which always runs directly in the main thread (see below). Relay each phase's one-line outcome to the user as it completes.

**Explore** — skip if the issue already has a `<!-- ship:research -->` comment (unless `--re-explore`). Otherwise run `ship-explore <n>` in a subagent. If it reports `BLOCKED`, stop the pipeline and tell the user why — the issue now carries `ship:needs-info`.

**Design** — always runs; skip only if a `<!-- ship:design -->` comment already exists and is newer than the latest research comment (unless `--re-design`, or the research was just redone by `--re-explore`, which makes any existing design stale too). Run `ship-design <n>` **in the main thread, interactively** — not a subagent, since a grilling interview is the point and can't be delegated away. It ends when ship-design posts the `<!-- ship:design -->` comment; the pipeline then continues to Implement. If the user abandons the interview without reaching a conclusion, stop the pipeline — do not implement against an unsettled approach.

**Implement** — run `ship-implement <n>` in a subagent. Resume-aware: an existing `ship/issue-<n>-*` branch or open PR is continued, never duplicated. Follows the latest `<!-- ship:design -->` comment's approach; a later `<!-- ship:discussion -->` comment overrides it where they conflict. Outcome: a draft PR.

**PR description contract** — the PR body must lead with a plain-English `## Summary` a non-engineer can read: 2–4 short sentences stating the problem, what the PR does about it, and how it works — no jargon, no resource names, bold the one or two facts that matter (e.g. the schedule). Technical detail goes below in short sections: `## What changed` (files, plain words), `## Checked` (what was verified locally and what couldn't be), `## Before merging` (checklist), optional `## Good to know`. Keep the whole body skimmable — short sentences, no dense paragraphs.

**Review loop** — for `k = 1 .. max_review_iterations`:

1. Run `ship-review <pr>` in a subagent, telling it the iteration number `k`.
2. `APPROVED` → done: PR is ready-for-review. Report the PR URL and stop.
3. `CHANGES_REQUESTED` → if `k == max_review_iterations`, go to exhaustion. Otherwise run `ship-implement <n>` in fix-mode, passing the blocking findings verbatim, then loop.

**Fix-mode contract** — after pushing fixes, ship-implement must close the loop on the PR's review threads: for each finding it addressed, reply on the corresponding inline review thread noting the fixing commit, then resolve the thread (GraphQL: `reviewThreads` → `resolveReviewThread`). Threads for findings it did not address stay open.

Only **blocking** findings drive iterations; suggestions never do.

**Every push gets a review** — this invariant holds even outside the `k` loop above. If `/ship <n>` is invoked on an issue whose PR is already approved/ready-for-review (e.g. a human left a follow-up PR comment after the pipeline finished), any resulting code change is still a fix-mode change: push it, then run `ship-review <pr>` again before reporting done. Never push a code change and stop without a review pass confirming it.

**Exhaustion** — max iterations reached with blocking findings still open:

1. Comment on the PR: `ship: stopped after <N> review iterations — needs a human. Unresolved blocking findings:` followed by the list.
2. PR **stays draft**. Do not close it, do not flip it ready.
3. Report the same to the user and stop cleanly.

## 4. What ship never does

- Merge. The ready-for-review flip is the pipeline's terminal state; merging is a human act.
- Restart from scratch on re-run: `/ship <n>` on a partially-shipped issue resumes (existing research, branch, PR, and prior review threads are all reused).
- Push a code change and stop without a following review pass — see "Every push gets a review" above.
