# Skills

A collection of Claude Code skills — self-contained instruction sets that extend Claude's behavior for specific tasks. Each skill lives in its own directory and is triggered automatically based on what the user asks.

## Skills

| Skill | What it does |
|---|---|
| **audit-skill** | Audits a skill's `SKILL.md` and disclosed files against the writing-great-skills framework, producing actionable findings |
| **distill-for-humans** | Distills a large or technical dump — subagent output, logs, search results, datasets — into the headline a human reader actually needs, before it's relayed |
| **ship** *(manual: `/ship`)* | Orchestrates a GitHub issue from exploration to a review-approved PR — `ship-explore → ship-design → ship-implement → (ship-review ⇄ ship-implement)`. Sub-skills (`ship-setup`, `ship-explore`, `ship-design`, `ship-implement`, `ship-review`, `ship-discuss`) are its pipeline stages, invoked by `ship` itself, not standalone |

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

`audit-skill` and `distill-for-humans` are standalone — each triggers on its own, with nothing upstream or downstream.

`ship` is the one skill with a defined chain, and it's manually triggered (run `.claude/ship/` setup first via `ship-setup`):

```
ship-explore → ship-design → ship-implement ⇄ ship-review → ready-for-review PR
```

`ship-discuss` runs on demand alongside the pipeline (e.g. `/ship-discuss`) to settle a specific question on the issue or PR; its conclusions are then honored by `ship-design` and `ship-implement`.

## License

[LICENSE](LICENSE)
