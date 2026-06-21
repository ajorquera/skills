---
name: plan-it
description: >
  Use this skill to compact a conversation into a concrete, actionable plan that achieves the
  goal under discussion. Trigger whenever the user wants to turn a discussion into next steps —
  phrases like "make a plan", "what's the plan", "turn this into a plan", "lay out the steps",
  "how do we actually do this", "summarize this into action items", or "let's get concrete".
  This skill pairs naturally with clarify-me: once a goal has been clarified, run plan-it to
  translate that clarity into a written plan. Reach for it proactively after a clarifying
  exchange or any conversation that has settled on a goal but not yet on how to reach it, even
  if the user doesn't say the word "plan". The deliverable is a markdown file.
---

# Plan It

Take everything established in a conversation — the goal, the decisions made, the constraints,
the facts surfaced — and distill it into a concrete plan the user can act on. The conversation
is the raw material; the plan is the compressed, forward-looking result.

## Core idea

A good conversation produces a lot of context: the real goal, what's been ruled in and out,
who's involved, what's blocking things, what's already been tried. That context is valuable but
scattered across many turns. This skill compacts it. Keep the decisions and the direction; drop
the back-and-forth, the false starts, and the thinking-out-loud. What remains should be a plan
someone could hand to a competent person who wasn't in the room, and they'd know what to do.

This pairs with clarify-me. If clarify-me just ran, the goal statement it produced is your
starting point — don't re-clarify, build on it. If it didn't, infer the goal from the
conversation and state it plainly at the top so the plan is anchored to something concrete.

## Before you write

Read back over the conversation and pull out what's actually been decided. You're looking for:

- **The goal** — what success looks like. State it in one or two sentences, in the user's own
  register. This anchors everything below.
- **What's already settled** — decisions, preferences, constraints, deadlines, resources, people.
  These are gifts; the plan should reflect them rather than re-ask them.
- **What's still open** — genuine unknowns that the plan can't resolve on its own. Don't paper
  over these or invent answers. Surface them honestly so the user can decide.

The cardinal rule: **don't invent facts the conversation didn't establish.** If a deadline,
budget, or owner was never mentioned, don't make one up. A plan built on fabricated specifics is
worse than one that names its own gaps. Where a detail is missing but needed, flag it as an open
question rather than guessing.

## Scale the plan to the goal

Match the plan's weight to the size of what's being attempted. Over-structuring a small task
makes it feel like busywork; under-structuring a big one leaves the user without a map.

**For a small or self-contained goal** (a single deliverable, a few hours of work, one person):
keep it lean. A one-line goal recap, a short ordered list of concrete next actions, and a clear
note on how you'll know it's done. Resist adding phases and risk sections it doesn't need.

**For a larger or multi-part goal** (multiple workstreams, several people, a real timeline, or
dependencies between pieces): give it real structure. Group the work into phases or milestones,
break each into concrete steps, and make the sequencing explicit — what has to happen before what.

Use judgment for everything in between. The point is a plan that fits, not a template that's
filled in regardless.

## What a step should look like

Steps should be concrete enough to act on. "Improve onboarding" is a goal, not a step; "draft
the three welcome emails and send them to Priya for review by Friday" is a step. Prefer verbs and
specifics. Where the conversation gave you an owner, a date, or a dependency, attach it to the
step. Where it didn't, leave it clean rather than fabricating one.

Order steps the way they'd actually be done. If two things can happen in parallel, you can say so.
If one blocks another, make that dependency visible — it's often the most useful thing in a plan.

## Structure of the file

Adapt these sections to the plan's size; a lean plan might only use the first three.

- **Goal** — one or two sentences. What we're trying to achieve and why it matters.
- **What we're working with** *(include only if there are settled constraints/facts worth pinning
  down)* — the decisions, deadlines, resources, and people already established. Short and factual.
- **The plan** — the steps, either as a flat ordered list (lean) or grouped into phases/milestones
  (larger). This is the heart of the file.
- **Open questions** *(include only if real unknowns exist)* — things that need a decision or an
  answer before or during execution. Be specific about what's missing and why it matters.
- **Definition of done** — how we'll know the goal is achieved. Concrete and checkable.

## Delivering it

Write the plan to a markdown file and save it to the outputs folder, then present it to the user.
Use a clear, dated filename derived from the goal (for example `onboarding-revamp-plan.md`).
Markdown makes it easy for the user to keep, edit, and check off as they go.

In chat, keep your message short — a sentence on what the plan covers and a pointer to the file.
The plan itself carries the detail; don't restate it all in the conversation.

## Tone and judgment

- Match the user's register — casual if the conversation was casual, precise if it was formal.
- Be decisive in the plan. It's a recommendation, not a menu of options. If there's a real fork,
  name it as an open question rather than hedging every step.
- Keep it tight. A plan that's padded to look thorough is harder to act on than a lean one that
  respects the reader's time. Every step should earn its place.
- Don't reopen the clarification. By the time you're planning, the goal is set; your job is the
  how, not relitigating the what.
