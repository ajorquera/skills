---
name: ship-discuss
description: "Discuss a specific problem on a GitHub issue interactively (grilling-style), then post the conclusions back — to the open ship PR (converted to draft) if one exists, otherwise to the issue. No argument: pick the oldest eligible open issue and confirm before starting."
disable-model-invocation: true
---

# ship-discuss [issue] [topic]

Interactive discussion of a problem on an issue, ending in a `<!-- ship:discussion -->` conclusions comment the rest of the ship pipeline consumes. Changes no code.

## 1. Resolve the issue

**Argument given** — use it, no confirmation needed.

**No argument** — same rule as `/ship`:

1. Eligible = open issues, not labeled `ship:needs-info`, with no open `ship/issue-<n>-*` PR (`gh pr list --search "head:ship/"` to check).
2. Pick the **oldest** eligible issue.
3. **Ask the user to confirm** ("discussing #42: <title> — proceed?") before doing anything else.

If nothing is eligible, say so and stop.

## 2. Gather context

- `gh issue view <n> --comments` — the issue, every comment, the most recent `<!-- ship:research -->`, `<!-- ship:design -->`, and any prior `<!-- ship:discussion -->` comments.
- If an open `ship/issue-<n>-*` PR exists: the PR, its description, its comments and review threads.
- Read code as needed — whenever a question turns on a fact in the repo, look it up instead of speculating.

## 3. Discuss

Run the **grilling skill** on the problem: one question at a time, a recommended answer for each, until the user says it's settled.

- Topic given as argument → that's the subject.
- No topic → open by listing the open questions you see in the issue/brief/PR and ask which to dig into.

Facts come from the repo; decisions are the user's.

## 4. Post the conclusions

When the discussion converges, post immediately — no draft sign-off:

```
<!-- ship:discussion -->
## Discussion conclusions (ship-discuss)

**Problem:** ...
**Decisions:** ...
**Rationale:** ...
**Follow-ups:** ...

🤖 ship-discuss
```

Where it goes:

- **Open ship PR exists** → convert it to draft (`gh pr ready <pr> --undo`) and comment on the **PR only**; the issue stays untouched.
- **No PR** → comment on the issue.

The latest `<!-- ship:discussion -->` comment supersedes earlier ones.

## 5. Hand-off

- If the issue carried `ship:needs-info` and the discussion answered the open questions: `gh issue edit <n> --remove-label "ship:needs-info"`.
- Tell the user the natural next command (`/ship <n>`, or `/ship-implement <n>` on a drafted PR) — **never run it yourself**.
