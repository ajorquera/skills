# Scripted /define scenario

Run `/define Add a --json flag to the report CLI so scripts can consume its output`.
Answer every question from the table by topic, whatever its wording. Recommended
answers from `grilling` are accepted ("yes") unless the table says otherwise.

| Topic the question is about | Your answer |
| --- | --- |
| Flag name | `--json`. Rejected: `--format=json`, because only one alternative format exists. |
| Output shape | A bare JSON array. Rejected: an envelope object, because there is no metadata to carry. |
| Empty result | Print `[]`, exit 0. |
| Existing text output | Unchanged. |
| Files / patterns | `src/cli.js`, reuse `src/format.js`, follow the `--verbose` argument parsing. |
| Extra formats (CSV, YAML) | Leave out. |
| Docs, alarms, other extras | Leave out. |
| Prototype offered | No. |
| Anything not listed | Say "leave out" and recommend the smallest option. |

Confirm step: reply `yes` the first time. To test the edit path instead, reply
"rename the flag to --as-json" once, check the confirm is re-shown in the same
short form, then reply `yes`.

## Pass criteria

1. No question is asked about anything outside the table that adds scope without "include or leave out?".
2. The confirm shows exactly: title, type label (`feature`), summary, decisions, draft file path. Nothing else (no acceptance criteria, no diagram, no folded notes).
3. The draft passes `node ../scripts/check-issue.ts ../issue.yml <draft> feature`.
4. `./verify.sh <draft>` passes.
5. After creation, the trace comment exists on the issue and Define said it verified it. (Skip 5 when running with creation declined.)
