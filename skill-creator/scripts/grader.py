"""
LLM-as-judge grader for skill runs.

Reads a single eval case (prompt + assertions) and the actual skill output,
then asks an LLM to verdict each assertion as pass or fail, producing an
overall numeric score for the run.

Usage:
    python -m scripts.grader \\
        --case path/to/case.json \\
        --output path/to/skill_output.txt \\
        [--result grading.json] \\
        [--model claude-3-5-haiku-20241022]

Input (case.json) — a single entry from evals/evals.json:
    {
        "id": 0,
        "name": "...",
        "prompt": "...",
        "assertions": ["...", "..."]
    }

Output (grading.json):
    {
        "case_id": 0,
        "case_name": "...",
        "score": 0.75,
        "expectations": [
            {"text": "...", "passed": true, "evidence": "..."},
            ...
        ]
    }

The grader uses temperature=0 to stay as deterministic as possible.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


JUDGE_SYSTEM = (
    "You are a strict, impartial evaluator. "
    "Your job is to decide whether a skill's output satisfies a given expectation. "
    "Return only valid JSON — no prose, no markdown fences."
)

JUDGE_PROMPT = """\
## Skill input (what the user asked)
{prompt}

## Skill output (what the skill actually produced)
{output}

## Expectation to evaluate
{assertion}

Does the skill output satisfy this expectation?

Respond with exactly this JSON object and nothing else:
{{
    "passed": <true or false>,
    "evidence": "<one or two sentences quoting or paraphrasing the specific part of the output that supports your verdict>"
}}

Rules:
- "passed" must be true only if the output clearly and fully satisfies the expectation.
- If the output partially satisfies it, or is ambiguous, set "passed" to false.
- "evidence" must point to concrete content in the output, not restate the expectation."""


def _parse_json_from_response(text: str) -> dict:
    """Extract a JSON object from a model response, tolerating minor formatting noise."""
    text = text.strip()
    # Strip optional markdown code fence
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fall back to extracting the first {...} block
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"No JSON object found in model response: {text[:200]!r}")


def grade_assertion(
    prompt: str,
    output: str,
    assertion: str,
    *,
    client,
    model: str,
) -> dict:
    """Ask the LLM judge to evaluate one assertion. Returns {text, passed, evidence}."""
    user_message = JUDGE_PROMPT.format(
        prompt=prompt,
        output=output,
        assertion=assertion,
    )
    response = client.messages.create(
        model=model,
        max_tokens=256,
        temperature=0,
        system=JUDGE_SYSTEM,
        messages=[{"role": "user", "content": user_message}],
    )
    raw = response.content[0].text
    verdict = _parse_json_from_response(raw)
    return {
        "text": assertion,
        "passed": bool(verdict.get("passed", False)),
        "evidence": str(verdict.get("evidence", "")),
    }


def grade_case(case: dict, output_text: str, *, model: str) -> dict:
    """Grade all assertions in a single eval case.

    Args:
        case: One entry from evals.json (must contain "assertions" and "prompt").
        output_text: The full text produced by the skill for this case.
        model: The Anthropic model to use as judge.

    Returns:
        grading.json-compatible dict with keys: case_id, case_name, score, expectations.
    """
    try:
        import anthropic
    except ImportError as exc:
        raise SystemExit(
            "The 'anthropic' package is required. Install it with: pip install anthropic"
        ) from exc

    client = anthropic.Anthropic()

    prompt = case.get("prompt", "")
    assertions = case.get("assertions", [])

    if not assertions:
        raise ValueError("Case has no assertions to grade.")

    results = []
    for assertion in assertions:
        result = grade_assertion(
            prompt,
            output_text,
            assertion,
            client=client,
            model=model,
        )
        results.append(result)

    passed_count = sum(1 for r in results if r["passed"])
    score = round(passed_count / len(results), 4)

    return {
        "case_id": case.get("id"),
        "case_name": case.get("name", ""),
        "score": score,
        "expectations": results,
    }


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        description="LLM-as-judge grader for skill runs.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--case",
        required=True,
        metavar="FILE",
        help="JSON file for a single eval case (id, name, prompt, assertions).",
    )
    parser.add_argument(
        "--output",
        required=True,
        metavar="FILE",
        help="Text file containing the skill's actual output for this case.",
    )
    parser.add_argument(
        "--result",
        default="grading.json",
        metavar="FILE",
        help="Where to write the grading result (default: grading.json).",
    )
    parser.add_argument(
        "--model",
        default="claude-3-5-haiku-20241022",
        metavar="MODEL",
        help="Anthropic model to use as judge (default: claude-3-5-haiku-20241022).",
    )
    args = parser.parse_args(argv)

    case_path = Path(args.case)
    if not case_path.exists():
        print(f"Error: case file not found: {case_path}", file=sys.stderr)
        sys.exit(1)

    output_path = Path(args.output)
    if not output_path.exists():
        print(f"Error: output file not found: {output_path}", file=sys.stderr)
        sys.exit(1)

    case = json.loads(case_path.read_text(encoding="utf-8"))
    output_text = output_path.read_text(encoding="utf-8")

    grading = grade_case(case, output_text, model=args.model)

    result_path = Path(args.result)
    result_path.write_text(json.dumps(grading, indent=2), encoding="utf-8")

    passed = sum(1 for e in grading["expectations"] if e["passed"])
    total = len(grading["expectations"])
    print(
        f"Score: {grading['score']:.2%}  ({passed}/{total} expectations passed)"
        f"  →  {result_path}"
    )


if __name__ == "__main__":
    main()
