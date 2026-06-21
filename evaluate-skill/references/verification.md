# Verifying skill edits with before/after tests

The point of verification is to stop you shipping changes that feel right but don't
actually help — or worse, regress. You're testing a claim: "the revised skill does
better than the original on the kind of task where it underperformed." Treat a
result that disconfirms the claim as a win, not a failure: it just saved a future
user from a worse skill.

## 1. Build test prompts from the failure points

Don't invent abstract tests. Pull the situations from the conversation where the
skill underperformed and turn each into a realistic, self-contained prompt — the
kind of thing a real user would actually type, with concrete details (file names,
column names, context). One to three is plenty. Each test should exercise the
specific weakness the edit is meant to fix; otherwise the test can't tell you
whether the edit worked.

If the original task needed an input file, recreate or stub a representative one so
both versions get the same starting point.

## 2. Run original vs revised, with everything else held equal

If subagents are available (e.g. in Cowork / Claude Code), run the comparison with
the `Agent` tool — one subagent per (version × test). Launch them in the same turn
so they finish around the same time, and give each the **same** prompt and inputs.
The only thing that differs between the two arms is which skill version is on the
path:

- **Original arm:** point the subagent at the read-only installed skill (or your unedited snapshot of it).
- **Revised arm:** point the subagent at your edited copy in `/tmp/<skill-name>/`.

Tell each subagent exactly where to save its outputs so you can compare them
afterward (e.g. `.../eval-<id>/original/` and `.../eval-<id>/revised/`).

If subagents aren't available, run the two versions yourself, one at a time, being
careful not to let your knowledge of which is which color the execution.

## 3. Judge fairly

For clear-cut, checkable differences (did it label the axes? did it output a
`.docx` instead of markdown? did it skip the wasteful helper script?), just check
the outputs directly — ideally with a tiny script so it's objective and repeatable.

For subtle quality differences where your expectation could bias you, use a **blind
comparison**: hand both outputs (unlabeled, order randomized) to a fresh subagent
and ask which better satisfies the original request and why. Then reveal which was
which. This guards against talking yourself into seeing improvement that isn't
there.

Record, per test, what each version did and which won. Fold that into the
"Verification" line of each issue in the report.

## 4. Act on the result

- **Revised clearly wins:** keep the edit; note the result in the report.
- **No real difference:** the edit isn't pulling its weight. Either cut it or rethink the approach — a change that doesn't move the needle is just noise in the skill.
- **Revised loses:** drop or rework it, and say so. Better to report "I tried X, it regressed, here's why" than to ship it.

## Scaling up later

A handful of tests is enough to iterate quickly with the user. If they want more
confidence before adopting a change broadly, widen the test set with more varied
prompts and re-run — the same machinery applies, just with more cases.
