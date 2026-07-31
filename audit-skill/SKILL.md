---
name: audit-skill
description: >-
  Audit a skill's SKILL.md and disclosed files against the
  writing-great-skills framework. Use when the user wants a skill audited for
  quality or structure.
---

# Audit a Skill

An audit is a checklist run against the files as written, not against a transcript.
It turns the writing-great-skills framework into findings: quoted lines, named
failure modes, why they matter, concrete fixes. 

## Process

### 1. Read everything first

Resolve which skill is under audit (ask if the name is ambiguous or no path was
given). Read its `SKILL.md` fully, then walk every context pointer inside it
— every linked file in `references/`, every sibling `.md` it points to — and read
each one fully. Then locate `writing-great-skills`
(same skills root, installed alongside this skill) and read its `GLOSSARY.md`
fully — it is the checklist every finding below cites against. Completion
criterion: every file either skill can reach from context has been read.

### 2. Check all four axes

Go through the skill against each axis in the glossary, term by term. For each
hit: quote the offending line(s), name the specific failure mode, note why it
matters.

If an axis has nothing to report, say so explicitly — that shows it was checked,
not skipped. Completion criterion: every term listed in the glossary has been
checked against the skill, not just the ones that turned up something.

### 3. Apply the fix for each finding

Smallest edit that resolves the named failure mode, expressed as before → after.
Preserve the skill's own intent and voice — an audit fixes what's broken, it
doesn't rewrite the skill into a different one. 

If there a finding that is ambiguous or requires a judgment call, note it in the report.

### 4. Report

One summary line — skill name, path, headline verdict — then a section per axis
with its findings (or "no findings"), each as: quote → failure mode → why it
matters → before/after fix. Completion criterion: every axis has a section, even
if "no findings," and every finding carries a quote, failure mode, why it matters, and
fix. This is for approval, not a fait accompli.

### 5. Publish the report as an artifact

Every audit ends with an artifact, not just a chat reply — load `artifact-design`
first and follow it, then render the step 4 report as an HTML page and publish it
with the Artifact tool. Completion criterion: an artifact URL has been returned
to the user.

