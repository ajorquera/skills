---
name: implement
description: Build a defined GitHub issue test-first with the tdd skill, then open a PR through /pr. If the issue already has an open PR, address the reviewer's requested changes on that PR instead.
argument-hint: "<issue#> [notes]"
allowed-tools: Bash(gh repo view *), Bash(gh issue view *), Bash(gh issue comment *), Bash(gh pr list *), Bash(gh pr view *), Bash(gh pr comment *), Bash(gh pr checkout *), Bash(gh api *), Bash(git status *), Bash(git fetch *), Bash(git branch *), Bash(git checkout *), Bash(git switch *), Bash(git pull *), Bash(git add *), Bash(git commit *), Bash(git log *), Bash(git diff *), Bash(git rev-parse *), Bash(git push *)
---

# Implement

Read [IMPLEMENTER.md](IMPLEMENTER.md) now and follow it. It holds the full instructions; this file only carries the values Claude Code substitutes.

- **Arguments:** `$ARGUMENTS`
- **Session ID:** `${CLAUDE_SESSION_ID}`

The arguments start with an issue number (for example `42` or `#42`). Everything after it is extra notes from the human.
