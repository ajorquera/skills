# Explore instructions

<!-- ship-setup: stack-independent template. Repo-specific cautions go in the marked section below. -->

## Tools 

## Research approach

Investigate the question against **primary sources** — official docs, source code, specs, first-party APIs — not a secondary write-up of them. Follow every claim back to the source that owns it.

## Depth by type

- **Bug** — reproduce it in the code, don't take the report's word for it. Trace from the reported symptom to the responsible line(s) and state the root cause, not just where it surfaces. Can't pin down a reproducible root cause after a reasonable look? That's a blocking condition, not a guess.
- **Feature** — find how comparable functionality already exists (patterns, modules, tests, entry points) so an implementer has a landing spot. Don't scope or design the solution — that's the next phase.

Both: note migration/compat concerns and any security surface touched — feeds the Risks section directly.

## Blocking criteria

On top of the Bug/Feature check `ship-explore` already performs, report `BLOCKED` when:

- the issue lacks enough information to reproduce (bug) or to state desired behavior (feature), and investigation doesn't close the gap
- reproduction shows current behavior already matches what's requested, or the request is self-contradictory
- the change lands in an area flagged below as needing a human

Otherwise, state what was found and proceed — a human is the last resort, not the first.
