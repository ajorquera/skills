# Skill Refinement Report — template

Use this structure for the report deliverable. Adapt the depth to the situation —
a one-issue fix doesn't need ceremony — but keep the spine: every proposed change
is tied to evidence from the conversation and to an expected effect.

```markdown
# Skill Refinement Report

## Summary
- Conversation reviewed: <one line on what the conversation was trying to do>
- Skills used: <list>
- Headline finding: <the single most important thing you'd change, in one sentence>

## <Skill name>

### Issue 1: <short title of the problem>
**What happened:** <what the skill did, and why it fell short of what the user needed>
**Evidence:** <the specific moment(s) in the conversation — quote or paraphrase the user's correction, the reworked output, the wasted detour, etc.>
**Root cause:** <what in the skill (or missing from it) led to this>
**Proposed edit:**

> Before:
> <the relevant current skill text, or "(nothing — this guidance is missing)">

> After:
> <the revised text>

**Why this generalizes:** <how this helps across future conversations, not just this one>
**Expected effect:** <what should change next time the skill runs>
**Verification:** <result of the before/after test, once run — e.g. "Revised skill labeled axes in 3/3 test runs; original did so in 0/3.">

### Issue 2: ...
(repeat)

## Changes considered but not made
<issues you diagnosed but decided NOT to fix, and why — e.g. "the model's, not the skill's"; "would overfit to this one case". This section builds trust and prevents scope creep.>

## Next step
<e.g. "Approve these edits and I'll repackage <skill>.skill for you to install.">
```

## Keep the report honest

The "Changes considered but not made" section is not filler — it's where you show
the user you resisted the temptation to overfit, and where you separate skill faults
from model/user/environment faults. A short report that fixes two real problems and
explains three non-issues is worth more than a long one full of cosmetic tweaks.
