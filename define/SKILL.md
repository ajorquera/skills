---
name: define
description: Turn an idea into a template-compliant GitHub issue that starts an agent-runner pipeline run, or repair an issue the template check marked needs-definition.
argument-hint: "<idea> | <issue#>"
allowed-tools: Bash(gh repo view *), Bash(gh issue view *), Bash(openssl rand -hex 16), Bash(node ${CLAUDE_SKILL_DIR}/scripts/check-issue.ts *), Bash(node ${CLAUDE_SKILL_DIR}/scripts/define-trace.ts *)
---

# Define

Read [DEFINER.md](DEFINER.md) now and follow it. It holds the full instructions; this file only carries the values Claude Code substitutes.

- **Arguments:** `$ARGUMENTS`
- **Session ID:** `${CLAUDE_SESSION_ID}`
- **Issue template:** `${CLAUDE_SKILL_DIR}/issue.yml`
- **Explorer brief:** `${CLAUDE_SKILL_DIR}/EXPLORER.md`
- **Prototyper brief:** `${CLAUDE_SKILL_DIR}/PROTOTYPER.md`
- **Structure check:** `node ${CLAUDE_SKILL_DIR}/scripts/check-issue.ts ${CLAUDE_SKILL_DIR}/issue.yml <body-file> <type-label>`. Exit 0 means it passes; exit 1 lists one problem per line.
- **Baseline:** `node ${CLAUDE_SKILL_DIR}/scripts/define-trace.ts --baseline ${CLAUDE_SESSION_ID}`. Prints the session's usage so far on one line (`none` if unreadable).
- **Trace comment:** `node ${CLAUDE_SKILL_DIR}/scripts/define-trace.ts --since <baseline> <issue#> <trace-id> ${CLAUDE_SESSION_ID} [<previous-trace-id>]`

If the arguments are a bare issue number (for example `42` or `#42`), follow **Rework**. Otherwise follow **New issue**, with the arguments as the idea.
