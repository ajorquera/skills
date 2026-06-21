---
name: prd-it
description: >
  Use this skill to turn a plan into a Product Requirements Document (PRD) and, when asked, file
  it as GitHub issues. Trigger whenever the user wants to formalize a plan or set of decisions into
  a spec — phrases like "write a PRD", "turn this plan into requirements", "make a product requirements
  doc", "spec this out", "create requirements from this plan", or "file these as GitHub issues / create
  issues for this". This skill pairs naturally with plan-it: once plan-it has produced a plan, run
  prd-it to convert it into a structured PRD and break it into trackable issues. Reach for it
  proactively after a plan exists or the user starts talking about requirements, tickets, epics, or
  issues — even if they don't say the exact words "PRD". The deliverable is a markdown PRD file, plus
  optional GitHub issues (an epic with linked sub-issues).
---

# PRD It

Take a plan — ideally one produced by `plan-it`, but any settled set of goals and steps will do —
and turn it into a Product Requirements Document: a structured spec that says *what* we're building,
*why*, and *how we'll know it's done*. Then, when the user wants it, break that PRD into GitHub
issues so the work becomes trackable.

## Core idea

A plan describes a sequence of actions. A PRD describes the *product*: the problem it solves, the
goals it serves, the requirements it must satisfy, and the criteria that count as success. The plan
is the raw material; the PRD reframes it from "here's what we'll do" into "here's what must be true
when we're done." That reframing is the value — it turns a to-do list into something an engineer,
a designer, or a stakeholder can build against without having been in the room.

The work has two stages, and the second is optional:

1. **Always:** write the PRD as a markdown file.
2. **When asked:** file the PRD's requirements as GitHub issues — an epic that holds the overview,
   plus one sub-issue per requirement, linked back to the epic.

Many invocations only want the document. Don't create issues unless the user asks for them or it's
clearly implied (they mentioned issues, tickets, epics, or "filing" the work). When you do, the
GitHub mechanics live in `references/github-issues.md` — read that file at that point.

## Step 1 — Find the source plan

The ideal input is a `plan-it` plan: a markdown file with `Goal`, `What we're working with`,
`The plan`, `Open questions`, and `Definition of done` sections. Locate it in this order:

- An explicit path or file the user named.
- The most recent plan-style markdown file in the outputs folder.
- The current conversation, if `plan-it` just ran or the discussion has settled on a goal and steps.

If you genuinely can't find a plan and the conversation hasn't established one, say so and offer to
run `plan-it` first — a PRD built on nothing is just a template with blanks. You don't strictly
*need* a plan-it file; a clear goal plus a set of decided steps is enough. But you do need real
material to work from.

## Step 2 — Map the plan onto the PRD

This is the heart of the skill. A plan-it plan maps onto PRD sections naturally:

| From the plan | Becomes in the PRD |
| --- | --- |
| **Goal** | **Problem & context** (the *why*) and **Goals** (what success looks like) |
| **What we're working with** — constraints, decisions, resources, people | **Context**, **Assumptions & constraints** |
| Anything explicitly ruled out | **Non-goals / Out of scope** |
| **The plan** — each step or phase | **Requirements** — each becomes one or more numbered requirements |
| **Open questions** | **Open questions & risks** (carried over, not resolved) |
| **Definition of done** | **Success metrics & acceptance criteria** |

A requirement is not a step. A step says "draft the welcome emails." A requirement says "the system
must send a welcome email to every new user within five minutes of signup." Reframe each step into a
statement of what must be *true* of the finished product, and give it acceptance criteria — the
checkable conditions that prove it's satisfied. Where a plan phase contains several distinct pieces
of work, it may yield several requirements; where a step is small, it may fold into one.

**The cardinal rule, inherited from plan-it: don't invent facts the source didn't establish.** If the
plan never named a target metric, a deadline, or an owner, don't fabricate one to fill the template.
A PRD that quietly makes up "must load in under 200ms" is worse than one that writes "performance
target — *open question, not yet set*." Where the template asks for something the plan didn't give
you, either omit that line or flag it honestly as an open question. The PRD should be traceable back
to the plan; a reader should never wonder where a number came from.

## Step 3 — Write the PRD

Use this structure. It's a standard PRD; adapt depth to the plan's size, but keep the section order
so PRDs from this skill are recognizable and skimmable.

```markdown
# [Product / feature name] — PRD

**Status:** Draft · **Date:** YYYY-MM-DD · **Source plan:** [filename or "this conversation"]

## Overview
One paragraph: the problem, who has it, and why solving it matters now. This is the elevator pitch —
a reader should grasp the point before reading anything else.

## Goals
The outcomes this product must achieve, as a short list. Each goal is a result, not a task.

## Non-goals
What this explicitly does **not** cover. Drawn from anything the plan ruled out, plus boundaries
worth naming so scope doesn't creep. If the plan named none, infer the obvious adjacent things this
is *not* and say so — but don't pad.

## User stories *(include when there are distinct users/roles)*
"As a [role], I want [capability] so that [benefit]." One per meaningful use case.

## Requirements
The core of the document. Number them so they're citable (R1, R2, …). Group under phase/milestone
headings if the plan was phased.

### R1 — [Short requirement title]
**Requirement:** What must be true of the finished product.
**Rationale:** Why — tie it back to a goal.
**Acceptance criteria:** The checkable conditions that prove it's done.

### R2 — …

## Success metrics
How we'll measure that the goals were met. Pull from the plan's Definition of done. If the plan gave
qualitative criteria, keep them qualitative rather than inventing numbers.

## Open questions & risks
Unresolved decisions and risks, carried over from the plan's open questions plus any the reframing
surfaced. Be specific about what's missing and why it matters. Don't resolve them by guessing.

## Milestones *(include when the plan was phased or sequenced)*
The phasing, with what each milestone delivers and any dependencies between them.
```

A lean plan (one deliverable, a few steps) might use only Overview, Goals, Requirements, and Success
metrics — don't force the full template onto something small. A large, multi-phase plan should use
all of it, including Milestones.

Write the file to the outputs folder with a clear, dated, goal-derived filename (for example
`welcome-email-prd.md`). In chat, keep your message short: a sentence on what the PRD covers and a
pointer to the file. If the user hasn't asked for issues, this is also where you offer: "Want me to
file these requirements as GitHub issues?"

## Step 4 — File as GitHub issues *(only when requested)*

When the user wants the requirements as issues, read `references/github-issues.md` and follow it.
The shape is: one **epic** issue carrying the PRD overview, plus one **sub-issue per requirement**
(R1, R2, …) attached to it as a **native GitHub sub-issue** — so the epic shows a real nested
hierarchy and progress bar, not a hand-maintained checklist.

Two things matter regardless of the mechanics:

- **Confirm before you create.** Creating issues is outward-facing and tedious to undo. First detect
  the target repo, show the user the epic title and the list of sub-issue titles you intend to
  create, and get a go-ahead. Don't silently push a dozen issues.
- **Preserve traceability.** Each issue should map cleanly to a requirement, and the epic should link
  to all of them, so the GitHub board and the PRD stay in sync.

## Tone and judgment

- Match the register of the plan and the conversation. A scrappy internal tool doesn't need a
  formal enterprise PRD; a cross-team launch does.
- Be decisive about requirements, honest about gaps. A confident PRD that names its own open
  questions is more useful than one that hedges every line or papers over what wasn't decided.
- Keep it traceable. Every requirement should be answerable with "because the plan said so." When
  you add something the plan didn't — a sensible non-goal, an implied user story — make sure it's
  genuinely implied, not invented.
- Don't reopen the planning. By the time you're writing the PRD, the goal and approach are set. Your
  job is to formalize them, not relitigate them.
