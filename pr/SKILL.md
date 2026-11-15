---
name: pr
description: Write a pull request for the current branch that a human can review fast, with a short visible part and folded notes for detail, then open it after one "yes".
argument-hint: "[issue#] [notes]"
allowed-tools: Bash(gh repo view *), Bash(gh pr list *), Bash(gh pr view *), Bash(gh issue view *), Bash(git status *), Bash(git branch *), Bash(git log *), Bash(git diff *), Bash(git rev-parse *), Bash(git push *)
---

# PR

Read [WRITER.md](WRITER.md) now and follow it. It holds the full instructions; this file only carries the values Claude Code substitutes.

- **Arguments:** `$ARGUMENTS`
- **Session ID:** `${CLAUDE_SESSION_ID}`
- **Template:** `${CLAUDE_SKILL_DIR}/pr.yml`

If the arguments start with an issue number (for example `42` or `#42`), that is the issue this PR closes. Everything after it is extra notes from the human.
