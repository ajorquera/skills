---
name: ship-implement
description: Implement a GitHub issue per the exploration brief and repo coding standards, on a ship/ branch, ending in a draft PR. On loop iterations, fixes the blocking review findings instead.
disable-model-invocation: true
---

# ship-implement <issue>

Implement a GitHub issue on its own branch and open (or update) a draft PR. Two modes, decided by whether blocking review findings were passed in.

## 0. Inputs

- `.claude/ship/coding-standards.md` — read it first; it governs everything you write. If missing, stop and say `/ship-setup` must run first.
- `gh issue view <n> --comments` — the issue plus the most recent `<!-- ship:research -->` comment. No research → stop and say `/ship-explore` must run first.
- The most recent `<!-- ship:design -->` comment (from ship-design) — its approach and decisions are what you build. No design → stop and say `/ship-design` must run first.
- The most recent `<!-- ship:discussion -->` comment (from ship-discuss), on the issue **and** on the PR if one exists — its decisions are settled and **override the research and design where they conflict**.
- Optional: a list of blocking review findings (fix-mode, see step 4).

## 1. Branch

Branch name: `ship/issue-<n>-<slug>` (slug from the issue title, kebab-case, ≤5 words). If the branch already exists locally or on the remote, check it out and continue on it — never create a duplicate.

## 2. Implement

Follow the design's approach and the coding standards. Honor the design's decisions rather than re-deciding them. Run the typecheck frequently and single test files as you go; run the full suite once before pushing. Every behavior change gets a test.

If mid-implementation you discover the design's approach is wrong, don't silently diverge: note the divergence and the reason in the PR summary.

## 3. Draft PR

Push the branch. If no open PR exists for it, create one:

- `gh pr create --draft --title "<issue title> (#<n>)"`
- Body: `Closes #<n>`, a link to the brief comment, and a **summary of the changes** — what changed, why, how it was tested, any divergence from the brief.

If a PR already exists, push and add a comment summarizing what this iteration changed.

## 4. Fix-mode (loop iterations ≥ 2)

When invoked with blocking findings from ship-review:

1. Address **every blocking finding** — fix it, or if you believe it's wrong, reply to the inline comment explaining why (with evidence); never silently skip one.
2. Reply to each addressed inline comment with a one-liner: what you changed.
3. Suggestions are optional — apply the cheap ones, skip the rest without comment-spam.
4. Full test suite again, push, comment on the PR: `ship-implement iteration <k>: addressed findings <list>`.

## 5. Outcome

Report the PR number/URL, the iteration's summary, and test results (honestly — if something fails, say so; the orchestrator decides what to do).
