# Design instructions

<!-- ship-setup: stack-independent template. Repo-specific cautions go in the marked section below. -->

## Design approach

Decide the approach. Cover the approach itself plus any decision research left open — where new code lives, how edge cases are handled, trade-offs between valid options. Facts come from the repo; ground every choice in precedent and coding standards rather than a fresh guess.

Use the skill "/codebase-design" to design or improve a module's interface

## Self-critique before committing

For each key decision, stress-test it against the alternatives — why not X, what would break it. When a decision hinges on a state model, algorithm behavior, or UI/UX feel that's genuinely uncertain from reading code alone, spawn a subagent running the **/prototype skill** to validate it empirically instead of guessing:

- Prototype confirms the approach → cite it as evidence in "Alternatives considered."
- Prototype disproves it → try the next-best alternative and prototype that instead (one retry, not an open-ended search).
- Second attempt also fails → this is no longer a technical call to make alone; go to `ship-design`'s Block step.

Skip the prototype step for purely structural/placement decisions (e.g. which module a function lives in) — reasoning is enough there.

Scale the depth of this to the decision: a trivial issue with one obvious approach needs a line confirming it, not a manufactured self-critique.

## Alternatives considered

Record what was rejected and why, including prototype evidence where one was run. Omit only if there was genuinely one reasonable approach.

## Risks

What could go wrong with the chosen approach — migration/compat concerns, security surface, rollout risk — and how to mitigate it.

<!-- Repo-specific additions below: decisions that always need a domain expert,
     modules where prototyping is mandatory even for small changes, etc. -->
