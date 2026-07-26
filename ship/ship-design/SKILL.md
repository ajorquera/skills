---
name: ship-design
description: "Turn a GitHub issue's research into a concrete implementation approach autonomously — decisions made and validated (via precedent, deeper code reading, and throwaway prototypes where genuinely uncertain), alternatives rejected and why. Blocks only on judgment calls the repo can't answer. No argument: pick the oldest eligible open issue and confirm before starting."
disable-model-invocation: true
---

# ship-design <issue>

Turn research into a plan, autonomously. This is where implementation decisions get made — not guessed by ship-implement, not deferred to a human unless the decision is genuinely theirs to make. Changes no code.

## 1. Resolve the issue

**Argument given** — use it, no confirmation needed.

**No argument** — same rule as `/ship`:

1. Eligible = open issues, not labeled `ship:needs-info`, with no open `ship/issue-<n>-*` PR (`gh pr list --search "head:ship/"` to check).
2. Pick the **oldest** eligible issue.
3. **Ask the user to confirm** ("designing #42: <title> — proceed?") before doing anything else. This checks which issue to design, not the design itself — the design decisions (§3) are made autonomously.

If nothing is eligible, say so and stop.

## 2. Gather context

- `gh issue view <n> --comments` — the issue and the most recent `<!-- ship:research -->` comment. No research → stop and say `/ship-explore` must run first.
- Any `<!-- ship:discussion -->` comments — settled decisions from a prior `/ship-discuss`; honor them, don't re-open them.
- `.claude/ship/coding-standards.md` — architectural conventions (module layout, error handling, naming) that decide *where* new code lives, not just how it's written.
- Precedent: past `<!-- ship:design -->` comments on merged PRs for similarly-shaped issues (search via `gh pr list` / `gh issue list`) — reuse a decision this repo already made instead of re-deriving it from scratch.
- Read code as deep as the approach requires — research established what exists; design needs enough to judge the best approach, which often means reading further than research's entry points.

## 3. Design

Decide the approach. Cover the approach itself plus any decision research left open — where new code lives, how edge cases are handled, trade-offs between valid options. Facts come from the repo; ground every choice in precedent and coding standards rather than a fresh guess.

**Self-critique before committing.** For each key decision, stress-test it against the alternatives — why not X, what would break it. When a decision hinges on a state model, algorithm behavior, or UI/UX feel that's genuinely uncertain from reading code alone, spawn a subagent running the **prototype skill** to validate it empirically instead of guessing:

- Prototype confirms the approach → cite it as evidence in "Alternatives considered" (§4).
- Prototype disproves it → try the next-best alternative and prototype that instead (one retry, not an open-ended search).
- Second attempt also fails → this is no longer a technical call to make alone; go to §5 (Block).

Skip the prototype step for purely structural/placement decisions (e.g. which module a function lives in) — reasoning is enough there.

Scale the depth of this to the decision: a trivial issue with one obvious approach needs a line confirming it, not a manufactured self-critique.

## 4. Post the design brief

```
<!-- ship:design -->
## Design (ship-design)

**Approach:** ...
**Key decisions:** ...          (decision → choice → why, one line each)
**Alternatives considered:** ... (what was rejected and why, incl. prototype evidence where one was run — omit if there was only one reasonable approach)
**Out of scope:** ...           (explicitly not doing, so implement doesn't scope-creep)

🤖 ship-design
```

The latest `<!-- ship:design -->` comment supersedes earlier ones.

Report `READY` plus a one-line summary as your outcome — the orchestrator branches on it.

## 5. Block (judgment calls only)

If, after investigating and prototyping where warranted, a decision is still open because it's a **product or business call the repo cannot answer** — not a technical detail reasonably decidable from context — then:

1. Post a comment explaining exactly what's undecided and why it isn't a call to make alone.
2. `gh issue edit <n> --add-label "ship:needs-info"`
3. Report `BLOCKED` as your outcome and stop. The pipeline must not proceed to implement.

This mirrors ship-explore's implementability gate — same failure mode, one phase later. Asking a human is the last resort, not the first: a costly technical call still gets decided and documented, not deferred.

## 6. Hand-off

- **Invoked standalone** (directly by the user) — tell them the next command is `/ship-implement <n>`; **never run it yourself**.
- **Invoked as the `/ship` pipeline's Design phase** (a subagent, same lane as Explore/Implement/Review) — just report the `READY`/`BLOCKED` outcome; the orchestrator branches on it.
