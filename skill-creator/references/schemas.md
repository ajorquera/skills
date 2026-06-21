# Schemas

This document defines the JSON schemas used by the eval and grading toolchain.

---

## `evals/evals.json` — eval set for a skill

Lives at `<skill-name>/evals/evals.json`.

```json
{
  "skill_name": "<skill-name>",
  "evals": [
    {
      "id": 0,
      "name": "short-slug-for-this-case",
      "prompt": "The exact user message that will be sent to the skill.",
      "expected_output": "Prose description of what a good run looks like (used for human review, not machine grading).",
      "files": ["relative/path/to/fixture.md"],
      "assertions": [
        "The output contains X.",
        "The output does NOT contain Y.",
        "The skill asks Z before proceeding."
      ]
    }
  ]
}
```

### Field notes

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `skill_name` | string | yes | Must match the skill directory name. |
| `evals` | array | yes | At least one entry. |
| `evals[].id` | integer | yes | Unique within the file; used to correlate grading results. |
| `evals[].name` | string | yes | URL-safe slug; used as the directory name when running evals. |
| `evals[].prompt` | string | yes | The user-facing input sent to the skill verbatim. |
| `evals[].expected_output` | string | no | Human-readable description of a good run. Not used by the grader. |
| `evals[].files` | string[] | no | Paths to fixture files, relative to `evals/`. Copied into the run environment. |
| `evals[].assertions` | string[] | yes | Machine-checkable statements the grader evaluates one at a time. Write them as falsifiable claims about the output. |

### Writing good assertions

- **Be specific and falsifiable.** "The output is well-written" cannot be checked. "The output contains a Requirements section with at least one acceptance criterion" can.
- **One claim per assertion.** Don't bundle two checks into one sentence — split them.
- **Include negative assertions** when the skill must _not_ do something (e.g. "The output does not invent metrics the plan never stated").
- **Enough to distinguish good from bad.** Aim for 4–8 assertions per case. Fewer risks missing failure modes; more risks grader noise.

---

## `grading.json` — output of the grader

Written to the eval run directory by `scripts/grader.py`.

```json
{
  "case_id": 0,
  "case_name": "short-slug-for-this-case",
  "score": 0.75,
  "expectations": [
    {
      "text": "The output contains X.",
      "passed": true,
      "evidence": "The skill wrote '…X…' in the second paragraph."
    },
    {
      "text": "The output does NOT contain Y.",
      "passed": false,
      "evidence": "The skill included 'Y' in the metrics section despite the plan never mentioning it."
    }
  ]
}
```

### Field notes

| Field | Type | Notes |
|-------|------|-------|
| `case_id` | integer | Matches `evals[].id` from `evals.json`. |
| `case_name` | string | Matches `evals[].name` from `evals.json`. |
| `score` | float [0, 1] | `passed_count / total_assertions`, rounded to 4 decimal places. |
| `expectations` | array | One entry per assertion, in the same order as `evals[].assertions`. |
| `expectations[].text` | string | The assertion text, copied verbatim from `evals.json`. |
| `expectations[].passed` | boolean | `true` only if the assertion is clearly and fully satisfied. |
| `expectations[].evidence` | string | One or two sentences from the judge explaining the verdict. |

> **Note:** The eval viewer (`eval-viewer/generate_review.py`) and the score logger
> (`scripts/score_logger.py`) key on `expectations[].text`, `.passed`, and `.evidence`
> by name — do not rename those fields.

---

## `scores.json` — per-skill score history

Lives at `<skill-name>/scores.json`. Maintained by the score logger (R3).

```json
[
  {
    "version": "abc1234",
    "date": "2026-06-21T17:00:00Z",
    "score": 0.75,
    "eval_set_hash": "sha256:deadbeef..."
  }
]
```

| Field | Type | Notes |
|-------|------|-------|
| `version` | string | Git commit SHA or semantic tag identifying the skill version. |
| `date` | string | ISO 8601 UTC timestamp of the scored run. |
| `score` | float [0, 1] | Aggregate score across all eval cases for this run. |
| `eval_set_hash` | string | SHA-256 of the canonical JSON of `evals.json` at scoring time, prefixed with `sha256:`. Used by the ratchet to verify the goalpost hasn't moved. |
