---
name: ship-setup
description: One-time repo bootstrap for the ship workflow — verify GitHub + gh auth, generate coding standards (global template amended with repo-inferred conventions), review instructions, and config under .claude/ship/. Run once per repo before /ship.
disable-model-invocation: true
---

# ship-setup

Bootstrap the current repo for the `ship` skill family. Run once per repo.

## 1. Preflight — fail fast

All three must pass; stop with a clear message on the first failure:

1. `git rev-parse --show-toplevel` — must be inside a git repo.
2. `git remote -v` — at least one remote must point at github.com. The ship family is GitHub-only.
3. `gh auth status` — must be authenticated.

## 2. Idempotency check

If `.claude/ship/` exists at the repo root, report "already set up" with a one-line summary of what's there and **exit**. Only regenerate if the user passed `--force` (back up the old folder to `.claude/ship.bak/` first).

## 3. Generate artifacts

Templates live in this skill's `templates/` directory.

**`.claude/ship/coding-standards.md`** — start from `templates/coding-standards.md`, then explore the repo and amend it with inferred conventions:

- Language(s), package manager, build/test/typecheck commands (check `package.json`, `Makefile`, `pyproject.toml`, CI workflows, etc.)
- Test framework and where tests live; naming pattern for test files
- Lint/format tooling already enforcing style (don't duplicate its rules — reference it)
- Observed idioms: error handling, naming, module layout, comment density
- If the repo already has a standards doc (CONTRIBUTING.md, docs/), incorporate by reference rather than duplicating

Show the user a short summary of the amendments you inferred before writing — they may correct you.

**`.claude/ship/review-instructions.md`** — copy `templates/review-instructions.md` verbatim; it's stack-independent. Fill in only the repo name and the concrete test/typecheck commands discovered above.

**`.claude/ship/explore-instructions.md`** — copy `templates/explore-instructions.md` verbatim; it governs ship-explore's research contents, depth, and blocking criteria. Add repo-specific cautions to its marked section only if the exploration above surfaced any (e.g. a module that always needs a domain expert).

**`.claude/ship/config.md`** — copy `templates/config.md` (default `max_review_iterations: 3`).

## 4. Create labels

Ensure these labels exist (`gh label create ... || true`):

- `ship:needs-info` — issue not implementable as written; a human must clarify

## 5. Commit

Commit `.claude/ship/` directly to the default branch and push. Commit message: `chore: bootstrap ship workflow config`. This is a one-time bootstrap — no PR (the review instructions don't exist until this commit lands).

Finish by telling the user the workflow entry points: `/ship [#issue]`, or the phases individually (`/ship-explore`, `/ship-design`, `/ship-implement`, `/ship-review`). `/ship-discuss` is separate from the pipeline — use it anytime to grill through one specific subject on an issue or PR.
