# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of Claude Code skills. Each skill is a directory containing a `SKILL.md` and optional bundled resources (scripts, references, assets). Skills are invoked by Claude Code based on their `description` frontmatter field.

## Key commands

**Package a skill into a `.skill` file for installation:**
```bash
cd skill-creator && python -m scripts.package_skill <path/to/skill-folder>
```

**Run the eval loop for a skill (tests triggering accuracy of the description):**
```bash
cd skill-creator && python -m scripts.run_loop \
  --eval-set <path-to-trigger-eval.json> \
  --skill-path <path-to-skill> \
  --model <model-id> \
  --max-iterations 5 \
  --verbose
```

**Aggregate benchmark results after running eval subagents:**
```bash
cd skill-creator && python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
```

**Launch the eval review viewer (shows side-by-side with-skill vs baseline outputs):**
```bash
python skill-creator/eval-viewer/generate_review.py <workspace>/iteration-N \
  --skill-name "my-skill" \
  --benchmark <workspace>/iteration-N/benchmark.json
```
Use `--static <output_path>` in headless/no-display environments.

## Skill anatomy

```
skill-name/
├── SKILL.md           # required: YAML frontmatter + markdown instructions
└── (optional)
    ├── scripts/       # executable helpers bundled with the skill
    ├── references/    # docs loaded into context on demand
    └── assets/        # templates, icons, etc. used in output
```

**Three-level loading system:**
1. `name` + `description` frontmatter — always in Claude's context (~100 words)
2. `SKILL.md` body — loaded when the skill triggers (keep under 500 lines)
3. Bundled resources — loaded on demand by the skill's instructions (no size limit)

The `description` field is the primary trigger mechanism. It must state both *what the skill does* and *when to use it*. Err toward being explicit about trigger conditions; Claude tends to undertrigger skills.

## The skill-creator eval workflow

The `skill-creator` skill manages a loop: draft → run test cases → human review → improve → repeat.

- Test cases live in `evals/evals.json` inside the skill directory (see `skill-creator/references/schemas.md` for schema)
- Each iteration runs subagents in parallel: a `with_skill` run and a `without_skill` (or `old_skill`) baseline
- Results are organized into `<skill-name>-workspace/iteration-<N>/eval-<ID>/with_skill/` and `without_skill/` directories
- Grading output goes to `grading.json`; timing from subagent task notifications goes to `timing.json` (only capturable at notification time)
- The viewer (`generate_review.py`) expects `grading.json` with `expectations[].text`, `.passed`, `.evidence` — not other field names
- `benchmark.json` must use `configuration: "with_skill"` or `"without_skill"` exactly (viewer keys on this string)

## evaluate-it skill

Used to diagnose and improve a skill after observing it behave poorly in a real conversation. It reads the transcript, identifies which skill ran and where it fell short, drafts before/after edits, verifies them with test runs, and produces a report following `evaluate-it/references/report-template.md`. Installed skills live in a read-only cache — copy them to `/tmp/<skill-name>/` before editing.
