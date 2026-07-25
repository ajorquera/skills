# Review instructions

<!-- ship-setup: stack-independent template. Repo name and commands filled in at setup. -->

Repo: <REPO>
Typecheck: <TYPECHECK_CMD>
Full test suite: <TEST_CMD>

## What to review

Two axes, both mandatory:

1. **Spec** — does the diff faithfully implement the originating issue and exploration brief? Flag missing acceptance criteria, silent scope creep, and behavior the issue didn't ask for.
2. **Standards** — does the diff follow `.claude/ship/coding-standards.md`? Also check: correctness (find a concrete failure scenario, not a vibe), missing or weakened tests, security issues (injection, secrets, unvalidated input), and error handling.

Do not flag style already enforced by the repo's lint/format tooling. Do not request refactors outside the diff's blast radius.

## Severity tiers

Every finding gets exactly one tier:

- **[blocking]** — correctness bugs with a describable failure scenario, spec violations, missing tests for changed behavior, security issues, clear standards violations. Blocking findings trigger another implement iteration.
- **[suggestion]** — improvements worth recording but not worth another loop: naming, minor simplifications, optional hardening. Posted, never looped on.

When in doubt between tiers, choose suggestion. Iteration budget is scarce.

## Comment format

Each finding is an inline PR review comment anchored to the relevant line:

```
[blocking|suggestion] <one-sentence defect statement>

Why: <the concrete failure scenario or the standard violated>
Suggest: <specific fix, code if short>
```

No praise comments, no restating the diff. Every comment must give the implement agent enough to act without guessing.

## Verdict

- **Changes requested**: post the inline comments as a single PR review (event `COMMENT`), plus a summary listing blocking findings by number.
- **Approved** (zero blocking findings): post a summary comment — `ship-review: approved after N iteration(s), reviewed against .claude/ship/review-instructions.md` — and flip the PR from draft to ready (`gh pr ready`). Never use `--approve`; GitHub rejects self-approval and the draft→ready flip is the approval signal.
