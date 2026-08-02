---
name: distill-for-humans
description: >-
  Distill a large or technical dump into what a human reader actually needs.
  Use before relaying results from a subagent, tool call, log dump, search
  results, or dataset — anywhere the raw output is longer, more technical, or
  more repetitive than the reader wants, and pasting it through raw would
  bury the answer.
---

# Distill for Humans

Every distillation leads with a **headline** — the one sentence the reader
needs, stated before any support. Everything below serves getting that
sentence right and keeping the rest out of its way.

## Process

### 1. Find the headline

Before touching the raw output, state in one sentence what the reader needs
to know or decide. If the raw output vanished right now, this sentence is
the one thing that would still need saying. Completion criterion: one plain
sentence, no hedging, that lets the reader stop reading here and still act
correctly.

### 2. Cut everything that doesn't serve the headline

Walk the raw dump and keep only what would change the headline or the
reader's next action — failures, anomalies, decisions, numbers outside the
expected range. Drop confirmations of the expected, restated inputs, and
routine success detail: the reader already assumed those or doesn't act on
them. Completion criterion: for every line kept, you can name what it would
change if removed; anything you can't justify that way gets cut.

### 3. Order by importance, not by source order

Tools and agents emit output in *their* order — chronological, alphabetical,
whatever their internals prefer. Re-order for the reader: headline first,
then the few items that actually mattered, caveats or risks last.
Completion criterion: the answer lands in the first sentence, not after
scrolling past setup or process.

### 4. Hold the receipts instead of pasting them

Full logs, raw tool output, and complete tables are **receipts** — proof the
work happened, not the thing the reader needs. Offer them ("want the full
output?") instead of including them. Completion criterion: no raw dump
appears in the reply unless the reader asked for it or the headline itself
is a specific number/quote that must be shown verbatim.

### 5. Calibrate length to stakes, not to input size

A routine status update earns one line regardless of how much the tool
returned. A decision with real consequences earns enough support to justify
itself — but still no more than that. Completion criterion: reply length
tracks how much the *decision* matters, not how much output the source
produced.

## Failure modes

- **Wall of receipts** — pasting the full dump because trimming feels risky.
  Re-run the step 2 test: does removing this line change the reader's next
  action? If not, cut it.
- **Buried headline** — leading with process, setup, or caveats before the
  answer. The first sentence is always the headline, full stop.
- **False completeness** — keeping a field "just in case it matters." If it
  doesn't serve the current headline, it doesn't belong in this distillation
  — the reader can ask.
