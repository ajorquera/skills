---
name: ship-design
description: "Turn a GitHub issue's research into a concrete implementation approach via a grilling interview with the user — decisions made, alternatives rejected, and why. Interactive; ends in a design brief that ship-implement follows. No argument: pick the oldest eligible open issue and confirm before starting."
disable-model-invocation: true
---

# ship-design <issue>

Turn research into a plan. This is where implementation decisions get made — not guessed by ship-implement, not skipped. Changes no code.

## 1. Resolve the issue

**Argument given** — use it, no confirmation needed.

**No argument** — same rule as `/ship`:

1. Eligible = open issues, not labeled `ship:needs-info`, with no open `ship/issue-<n>-*` PR (`gh pr list --search "head:ship/"` to check).
2. Pick the **oldest** eligible issue.
3. **Ask the user to confirm** ("designing #42: <title> — proceed?") before doing anything else.

If nothing is eligible, say so and stop.

## 2. Gather context

- `gh issue view <n> --comments` — the issue and the most recent `<!-- ship:research -->` comment. No research → stop and say `/ship-explore` must run first.
- Any `<!-- ship:discussion -->` comments — settled decisions from a prior `/ship-discuss`; honor them, don't re-open them.
- Read code as needed for facts the research didn't already establish.

## 3. Design

Run the **grilling skill** on the implementation approach: one question at a time, a recommended answer for each, until reaching shared understanding with the user. Cover the approach itself plus any decision the research left open — where new code lives, how edge cases are handled, trade-offs between valid options.

Facts come from the repo; decisions are the user's. Scale the interview to the decision: a trivial issue with one obvious approach may need just a single confirming question ("planning to do X — right?"), not a padded interview.

## 4. Post the design brief

```
<!-- ship:design -->
## Design (ship-design)

**Approach:** ...
**Key decisions:** ...          (decision → choice → why, one line each)
**Alternatives considered:** ... (what was rejected and why — omit if there was only one reasonable approach)
**Out of scope:** ...           (explicitly not doing, so implement doesn't scope-creep)

🤖 ship-design
```

The latest `<!-- ship:design -->` comment supersedes earlier ones.

## 5. Hand-off

- **Invoked standalone** (directly by the user) — tell them the next command is `/ship-implement <n>`; **never run it yourself**.
- **Invoked as the `/ship` pipeline's Design phase** — skip the above; just report the conclusion back and let the pipeline proceed to Implement on its own.
