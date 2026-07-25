---
name: ship-review
description: Review a ship draft PR against the repo's review instructions — inline comments tiered blocking/suggestion; approval is a summary comment plus the draft→ready flip.
disable-model-invocation: true
---

# ship-review <pr>

Review a PR per `.claude/ship/review-instructions.md` and render a verdict on the PR itself.

## 1. Inputs

- `.claude/ship/review-instructions.md` and `.claude/ship/coding-standards.md` — both mandatory; stop if missing.
- `gh pr view <pr>` + `gh pr diff <pr>` — the diff is the review surface.
- The linked issue and its `<!-- ship:research -->` comment — the spec axis reviews against these.
- Existing review threads on the PR — don't re-raise a finding already addressed or already answered with a justified pushback.

## 2. Review

Follow the review instructions exactly: two axes (spec, standards), severity tiers ([blocking]/[suggestion]), comment format, and the "when in doubt, suggestion" rule. Verify each blocking finding has a concrete failure scenario before posting it — drop anything you can't substantiate.

## 3. Post the verdict

**Blocking findings exist** — post one PR review (event `COMMENT`, via `gh api repos/{owner}/{repo}/pulls/<pr>/reviews`) containing all inline comments, plus a body summarizing the blocking findings. PR stays draft.

**Zero blocking findings** — post suggestions (if any) the same way, then:

1. Summary comment: `<!-- ship:verdict --> ship-review: approved after <N> iteration(s), reviewed against .claude/ship/review-instructions.md 🤖`
2. `gh pr ready <pr>` — the draft→ready flip is the approval signal. Never `gh pr review --approve` (GitHub rejects self-approval).

## 4. Outcome

Report `APPROVED` or `CHANGES_REQUESTED` plus the list of blocking findings (file:line + one-liner each) — the orchestrator feeds these to ship-implement's fix-mode.
