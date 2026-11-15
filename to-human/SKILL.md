---
name: to-human
description: The house rules for writing a document a human will approve or review (an issue, a PR, a plan): a short visible part, folded notes that explain but never decide, and a short confirm. Used by the define and pr skills; also run it on any draft to rewrite it to fit.
argument-hint: "[file or text to rewrite]"
---

# To human

Rules for writing something a person must read, judge and approve, where a second reader (an agent, a future maintainer) needs more detail than the person does. The calling skill gives you a template: its sections, which of them may fold, and a cap on the visible part. These rules say how to fill it.

If invoked directly with a file or text, rewrite it to follow the rules, keep its meaning, and show the result. Add nothing it didn't say.

## Two readers

- **The human** reads the visible part, decides, and approves. It must be short and complete on its own.
- **The second reader** also gets the folded notes: everything needed to act without asking anyone.

## Rules

1. **Summary first.** Start with two to four sentences, above the first `##` heading: what we're doing and why. A reader who stops there should know what the document is.
2. **Short visible part.** Write each section's visible part from its `summary` in the template. Short bullets, no padding. Stay under the template's cap. The cap counts only visible text, not folded blocks or the diagram.
3. **Details can explain; they can't decide.** Every decision, scope boundary and done-condition is in the visible part. The fold adds only how: specifics, edge cases, rejected options, rationale. If you're about to fold something the human would want to approve, it belongs in the visible part.
4. **Fold only where the template allows.** Only sections with a `detail` may fold. Put it in one block after the visible part, with a blank line after `<summary>` and before `</details>` so the Markdown renders:

   ```
   ## Solution

   - Add an Export button to the report page that downloads a CSV.

   <details>
   <summary>Agent notes</summary>

   ...full design...

   </details>
   ```
5. **Headings stay out of folds.** Never put a `## <heading>` line, or any machine-read line the template names (such as Links fields), inside a `<details>` block.
6. **One diagram, by default.** Add one Mermaid diagram (a ```` ```mermaid ```` block) to the visible part of the section the template names whenever there is a flow, sequence, state or structure to show; a human understands a picture faster than bullets. At most one. Leave it out only when there is nothing to draw (a one-line fix, a rename, a docs-only change), and say so in one line to the human. It doesn't count toward the cap.
7. **Never invent.** Every decision, reason and result comes from the conversation, the code, or a source the human can check. If you can't fill something from those, it's a gap: ask, don't guess.
8. **Too big means split, not squeeze.** If it can't fit under the cap even after folding, tell the human it's too big and name the pieces. Never compress the text to fit.
9. **Write plainly.** Short sentences, no padding. Warm and direct, never corporate.

## Asking about gaps

List only the gaps, as a numbered list with your recommended answer for each. If there are none, say so and go on.

## Confirm

Show the few items the human must approve (the calling skill names them: usually title, summary and decisions), then the path of the full draft so they can read or edit it, then one question. Don't show everything; the rest was settled earlier and the draft is one path away.

Only a plain "yes" counts as approval. For anything else, apply the edit everywhere it applies (visible parts, folded notes, title), re-check the cap, and show the same short confirm again. If the human asks to see the full draft, show it.
