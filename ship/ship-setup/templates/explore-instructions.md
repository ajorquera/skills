# Explore instructions

<!-- ship-setup: stack-independent template. Tweak per repo to change ship-explore's behaviour. -->

## Research contents

Every research comment must establish:

- Title and Type (Bug or Feature), taken from or inferred from the issue
- Summary, one paragraph, clear and concise
- Reproduction steps (bugs) or current-vs-desired behavior (features) — precise enough that another agent can reproduce or locate it without guessing
- Relevant code: files, modules, entry points touched, and what they currently do
- Risks: what could break, migration/compat concerns, security surface touched

## Depth

Proportional to risk exposure: a one-file, low-risk issue gets a short writeup; anything touching shared modules, public APIs, or data gets the full treatment. Read the actual code and history — never write from file names or the issue title alone.

## Blocking criteria

Investigate first; block (comment + `ship:needs-info` + stop) only when investigation still leaves a costly ambiguity:

- Bug vs. Feature can't be determined even after reading the code and history
- Contradictory or missing requirements that materially change what "fixed" means
- Data migrations, breaking public API changes, or auth/security-sensitive areas the issue doesn't settle

Otherwise, state what was found and proceed — asking a human is the last resort, not the first.

<!-- Repo-specific additions below: areas needing extra caution, modules that
     always need a domain expert, docs the explorer must read first, etc. -->
