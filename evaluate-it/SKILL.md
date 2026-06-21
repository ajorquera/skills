---
name: evaluate-it
description: >-
  Review the current conversation, identify which skills were actually used in
  it, diagnose where they fell short, and propose concrete, test-backed
  improvements to those skills. Use this skill whenever the user wants to
  evaluate how a skill performed in a conversation, tune or fix a skill based on
  how it just behaved, run a "post-mortem" on a skill, or says things like "that
  skill didn't work well, improve it", "make this skill better based on what just
  happened", "why did the skill do X", "the deck skill keeps ignoring my
  formatting", or "refine the skills we used here". Trigger even when the user
  doesn't name a specific skill, as long as they're pointing at a recent
  conversation and want the skills involved to work better next time. Do NOT use
  this to create a brand-new skill from scratch (use skill-creator) or for
  general skill questions unrelated to improving one based on a conversation.
---

# Evaluate It

This skill turns a conversation into fuel for improving the skills that ran during
it. The premise: the conversation you're in is the richest possible test case for
a skill — it shows exactly where the skill helped, where it got in the way, and
where the user had to step in and correct things. Your job is to mine that signal,
diagnose what the *skill* (not the model, not the user) could have done better, and
hand back concrete edits that are verified to actually help.

You produce a written report with before/after edits for the user to approve, and
— once approved — a repackaged `.skill` file they can install. You verify the edits
with before/after tests so you're not shipping changes on a hunch.

## Why this is worth doing carefully

A skill is used across many future conversations you'll never see. So the goal is
never "make the skill behave perfectly on *this* transcript" — that way lies
overfitting, where you bolt on a special case that fixes today's complaint and
quietly makes the skill worse everywhere else. The goal is to read this one
conversation as evidence of a *general* weakness, then fix the general weakness.
Hold that tension the whole way through.

## The workflow

### 1. Reconstruct what actually happened

You are running inside the conversation under review, so most of it is already in
your context — lean on that first. For a long conversation, or when you need to be
precise about exactly which skills loaded and what tools they called, pull the
transcript: call `mcp__session_info__list_sessions` and read the most recently
active non-child session with `mcp__session_info__read_transcript`. (That's
usually the conversation you're in. If it's ambiguous which session the user means,
ask.)

If the user has pointed at a *different* past session, read that one instead.

### 2. Identify which skills were used — and how

Don't guess. A skill shows up in a transcript in concrete ways:

- A `<command-name>` or `<command-message>` tag, or a line like `The "<name>" skill is loading`.
- A `Skill` tool call naming the skill.
- A stretch of behavior that visibly follows a skill's instructions (e.g. the model reads a `SKILL.md`, then builds a `.docx` a particular way).

List every skill that ran. For each, note **what it was asked to do** and **what
it produced**. If no skill ran at all, say so plainly — and offer to either
diagnose why no skill triggered (a description/triggering problem, which is itself
fixable) or suggest a skill that would have helped. Don't invent a skill to refine.

### 3. Diagnose — separate skill faults from everything else

This is the heart of it. For each skill, walk the conversation and find the moments
where things went wrong or got harder than they should have:

- The user had to correct, repeat, or rephrase something the skill should have handled.
- The output was in the wrong format, missed a requirement, or needed rework.
- The skill sent the model down a wasteful path (wrote a throwaway helper script every time, read files it didn't need, asked questions it could have inferred).
- The skill was silent where it should have guided, or rigid where it should have adapted.

For each issue, ask the decisive question: **could a change to the skill have
prevented this?** Some failures are the model's, some are the user's, some are
environmental — those are out of scope. Only keep issues a skill edit can plausibly
fix. Cite the specific moment in the conversation as evidence for each one; a
diagnosis without evidence is a guess.

### 4. Locate the skill files (and copy them somewhere writeable)

Installed skills usually live in a **read-only** cache, and editing that cache does
not change the user's saved skill. So for each skill you're improving, find its
directory (the `SKILL.md` path is in the transcript or the available-skills list),
then copy the whole directory to a writeable spot before touching anything:

```
cp -r "<read-only-skill-path>" /tmp/<skill-name>/
```

Edit the copy. Keep the original name and directory name unchanged — you're
producing a better version of the *same* skill, not a fork.

### 5. Draft the improvements

For each kept issue, write the smallest edit that fixes the *general* problem.
Principles that matter here:

- **Generalize, don't overfit.** If the user wanted the chart's axes labeled, the fix isn't "label this chart's axes" — it's guidance that makes the skill label axes whenever it builds a chart, and an explanation of why unlabeled axes fail readers.
- **Explain the why.** Today's models reason well when they understand intent. A line that explains *why* something matters generalizes far better than a bare `ALWAYS`/`NEVER`. If you catch yourself writing rigid all-caps mandates, stop and reframe as reasoning.
- **Bundle repeated work.** If the transcript shows the skill making the model reinvent the same helper script or multi-step dance every time, that's a signal to add a script or a clearer pattern to the skill so future runs don't pay that cost.
- **Cut dead weight.** If part of the skill caused the wasteful behavior, removing it is a valid (often the best) fix. Read what the skill made the model *do*, not just what it produced.

Express each change as a clear **before → after** so the user can see exactly what's
changing and why.

### 6. Write the report

This is the primary deliverable. Use the structure in
`references/report-template.md`. In short: a summary, then one section per skill
listing each diagnosed issue (with its evidence from the conversation), the
proposed before/after edit, and the expected effect. Save it as a markdown file and
present it to the user. Keep claims tied to evidence — the report should let the
user verify your reasoning, not just trust it.

### 7. Verify the edits actually help (test-backed)

Before telling the user an edit is good, prove it. Build one to three test prompts
that recreate the failure points from the conversation — the situations where the
skill underperformed — then run the **original** skill and the **revised** skill on
them and compare. Follow `references/verification.md` for how to set this up using
subagents and how to judge the results fairly (including blind comparison when the
difference is subtle).

Only stand behind edits that demonstrably do better. If a change doesn't help — or
makes things worse — say so in the report and revise or drop it. A verification that
*disconfirms* your idea is a success: it stopped you shipping a regression.

### 8. Apply and package (after approval)

The report is for approval — don't repackage until the user signs off (they may
want to tweak the edits first). Once approved:

1. Apply the approved edits to the writeable copy from step 4.
2. Repackage: `python -m scripts.package_skill /tmp/<skill-name>` (run from the skill-creator directory, which holds the packaging script). This writes a `<skill-name>.skill` file.
3. Present the `.skill` file to the user and tell them they can install it from there. Note that you can't modify their saved skill from inside this session — installing the `.skill` is how the improvement takes effect.

If you improved several skills, produce one `.skill` per skill.

## A note on scope and honesty

Sometimes the right answer is "this skill is fine; the friction came from something
else." Say that. It's far more valuable to the user than a cosmetic edit that
manufactures the appearance of improvement. Likewise, if a conversation reveals a
deep structural problem with a skill, name it directly rather than papering over it
with a small patch.
