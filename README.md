# Skills

A collection of Claude Code skills — self-contained instruction sets that extend Claude's behavior for specific tasks. Each skill lives in its own directory and is triggered automatically based on what the user asks.

## Skills

| Skill | What it does |
|---|---|
| **clarify-me** | Surfaces the real goal behind what a user asks through deep, thoughtful questioning, then delivers a precise, well-formed statement of what they actually want |
| **plan-it** | Compacts a conversation into a concrete, actionable plan. Pairs naturally with `clarify-me`: once a goal is clear, `plan-it` maps it to ordered steps |
| **to-prd** | Turns a plan into a Product Requirements Document and, when asked, files requirements as GitHub issues (an epic with linked sub-issues) |
| **evaluate-skill** | Reviews a conversation to identify which skills ran, diagnoses where they fell short, drafts before/after edits, verifies them with test runs, and produces an improvement report |

## How skills work

Skills are invoked by Claude Code based on the `description` field in each skill's `SKILL.md` frontmatter. There is no manual invocation — Claude matches the user's intent to the right skill automatically.

**Three-level loading:**
1. `name` + `description` — always in Claude's context (~100 words)
2. `SKILL.md` body — loaded when the skill triggers (kept under 500 lines)
3. Bundled resources — loaded on demand by the skill's own instructions

**Skill directory anatomy:**
```
skill-name/
├── SKILL.md           # required: YAML frontmatter + markdown instructions
└── (optional)
    ├── scripts/       # executable helpers bundled with the skill
    ├── references/    # docs loaded into context on demand
    └── assets/        # templates, icons, etc.
```

## Natural skill chain

These skills are designed to chain:

```
clarify-me → plan-it → to-prd
                          ↓
                    GitHub issues
```

And `evaluate-skill` can be run after any skill to improve it based on the conversation.

## Packaging a skill

To package a skill into a `.skill` file for installation:

```bash
cd skill-creator && python -m scripts.package_skill <path/to/skill-folder>
```

Packaged `.skill` files are output to `dist/`.

## Evaluating a skill

Skills include eval sets (`evals/evals.json`) that define what "good" looks like for each skill. The eval loop runs test cases, compares `with_skill` vs. `without_skill` (baseline) outputs, and grades the difference.

**Run the eval loop:**
```bash
cd skill-creator && python -m scripts.run_loop \
  --eval-set <path-to-trigger-eval.json> \
  --skill-path <path-to-skill> \
  --model <model-id> \
  --max-iterations 5 \
  --verbose
```

**Aggregate benchmark results:**
```bash
cd skill-creator && python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
```

**Review results side-by-side:**
```bash
python skill-creator/eval-viewer/generate_review.py <workspace>/iteration-N \
  --skill-name "my-skill" \
  --benchmark <workspace>/iteration-N/benchmark.json
```

Use `--static <output_path>` in headless environments.

## License

[LICENSE](LICENSE)
