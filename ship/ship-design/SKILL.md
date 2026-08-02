---
name: ship-design
description: "Design a solution to an issue or feature autonomously."
disable-model-invocation: true
---

# ship-design <issue>

Turn research into a plan, autonomously. This is where implementation decisions get made — not deferred to a human unless the decision is genuinely theirs to make. Changes no code directly.

## 1. Gather context

Always invoked with an explicit `<issue>` — use it, no confirmation needed.

- `gh issue view <issue> --comments` — the issue and the most recent `<!-- ship:research -->` comment. No research → stop and say `/ship-explore` must run first.
- Any `<!-- ship:discussion -->` comments — settled decisions from a prior `/ship-discuss`; honor them, don't re-open them.
- Read code as deep as the approach requires — research established what exists; design needs enough to judge the best approach, which often means reading further than research's entry points.

## 2. Design

`.claude/ship/design-instructions.md` — read and follow it; it governs the design methodology (self-critique, prototype validation, alternatives, depth) and any repo-specific cautions. Missing → stop and say `/ship-setup` must run first.

## 3. Post the design brief

```
<!-- ship:design -->
## Design (ship-design)

**Approach:** ...
**Key decisions:** ...          (decision → choice → why, one line each)
**Alternatives considered:** ... (what was rejected and why, incl. prototype evidence where one was run — omit if there was only one reasonable approach)
**Out of scope:** ...           (explicitly not doing, so implement doesn't scope-creep)
**Risks:** ...                   (what could go wrong, and how to mitigate)

🤖 ship-design
```

The latest `<!-- ship:design -->` comment supersedes earlier ones.

Report `READY` plus a one-line summary as your outcome — the orchestrator branches on it.

## 4. Block (judgment calls only)

If, after investigating and prototyping where warranted, a decision is still open because it's a **product or business call the repo cannot answer** — not a technical detail reasonably decidable from context — then:

1. Post a comment explaining exactly what's undecided and why it isn't a call to make alone.
2. `gh issue edit <issue> --add-label "ship:needs-info"`
3. Report `BLOCKED` as your outcome and stop. The pipeline must not proceed to implement.

Asking a human is the last resort, not the first: a costly technical call still gets decided and documented, not deferred.

## 5. Hand-off

- **Invoked standalone** (directly by the user) — tell them the next command is `/ship-implement <issue>`; **never run it yourself**.
- Just report the `READY`/`BLOCKED` outcome; the orchestrator branches on it.
