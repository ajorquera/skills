---
name: audit-skill
description: >-
  Audit a skill's SKILL.md and disclosed files against the
  writing-great-skills framework. Use when the user wants a skill audited.
---

# Audit a Skill

An audit is a checklist run against the files as written, turning the
writing-great-skills framework into findings the user can act on.

## Process

### 1. Read everything first

Resolve which skill is under audit (ask if the name is ambiguous or no path was
given). Read its `SKILL.md` fully, then walk every context pointer inside it
— every linked file in `references/`, every sibling `.md` it points to — and read
each one fully. Then locate `writing-great-skills`
(installed alongside this skill) and read its `GLOSSARY.md`
fully — it is the checklist every finding below cites against. Completion
criterion: every file either skill can reach from context has been read.

### 2. Check all four axes

Go through the skill against each axis in the glossary, term by term. For each
hit: quote the offending line(s) — or, when the defect is an absence (no
completion criterion, no description, no exit condition), point to where it
should be — name the specific failure mode, note why it matters.

If an axis has nothing to report, say so explicitly — that shows it was checked,
not skipped. Completion criterion: every term listed in the glossary has been
checked against the skill, not just the ones that turned up something.

### 3. Draft the fix for each finding

Smallest edit that resolves the named failure mode, expressed as before → after.
Preserve the skill's own intent and voice — an audit fixes what's broken while
keeping it the same skill. Completion criterion: every finding carries a
drafted before/after fix, or — when the finding is ambiguous or requires a
judgment call — an explicit note instead of a forced fix.

### 4. Report

One summary line — skill name, path, headline verdict — then a section per axis
with its findings, each in the quote → failure mode → why it
matters → fix shape from above. Completion criterion: every axis with findings has a section,
and every finding matches that shape. Findings and fixes
are proposals for the user to approve.

### 5. Publish the report as an artifact

Every audit ends with an artifact, not just a chat reply — load `artifact-design`
first and follow it, then render the step 4 report as an HTML page and publish it
with the Artifact tool. Completion criterion: an artifact URL has been returned
to the user.

