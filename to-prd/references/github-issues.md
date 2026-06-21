# Filing a PRD as GitHub issues

This describes how to turn a finished PRD into GitHub issues using the `gh` CLI: one **epic** issue
that holds the overview and links to everything, plus one **sub-issue per requirement**. Read this
only when the user actually wants issues created — most PRD requests stop at the document.

## Before you create anything

1. **Confirm `gh` is available and authenticated.** Run `gh auth status`. If `gh` isn't installed or
   the user isn't logged in, say so and stop — don't try to work around it with raw API calls unless
   the user asks. Installing/authenticating `gh` is a one-time thing they do themselves.

2. **Determine the target repository.** Check, in order:
   - A repo the user named explicitly (`owner/name`).
   - The current directory's repo: `gh repo view --json nameWithOwner -q .nameWithOwner`.

   State which repo you're about to file into and let the user correct it. Pass it explicitly to every
   command with `--repo owner/name` so there's no ambiguity about where issues land.

3. **Preview, then get a go-ahead.** Show the user exactly what you'll create before creating it:
   the epic title, and the ordered list of sub-issue titles (one per requirement). Creating issues is
   outward-facing and tedious to reverse, so this confirmation is not optional. If they want changes
   (fewer issues, different grouping, different titles), adjust and re-preview.

## Optional: a label to group the set

Grouping every issue from this PRD under one label makes the set easy to find later. Derive a short
slug from the product name (e.g. `prd:welcome-email`) and create it once, ignoring "already exists":

```bash
gh label create "prd:welcome-email" --repo owner/name \
  --description "Welcome-email PRD" --color 5319e7 2>/dev/null || true
```

Apply it to the epic and every sub-issue via `--label "prd:welcome-email"`. A GitHub **milestone**
is a reasonable alternative when the PRD maps to a single release — create with
`gh api repos/owner/name/milestones -f title="..."` and pass `--milestone "..."` on each issue.

## Step 1 — Create the epic

The epic carries the PRD's Overview, Goals, and Success metrics. You don't need to hand-maintain a
list of children in the body — once the sub-issues are attached in Step 3, GitHub renders that panel
automatically. Write the body to a temp file rather than passing it inline — PRD prose contains
characters that break shell quoting.

```bash
gh issue create --repo owner/name \
  --title "[Epic] Welcome email — PRD" \
  --label "epic" --label "prd:welcome-email" \
  --body-file /tmp/to-prd/epic-body.md
```

`gh issue create` prints the new issue's URL; the trailing number is the epic number (call it
`$EPIC`). Capture it — every sub-issue references it.

## Step 2 — Create one sub-issue per requirement

For each requirement R1, R2, … create an issue whose title is the requirement title and whose body
is the requirement statement, rationale, and acceptance criteria (as a checkbox list, so progress is
visible on the issue itself). A `Part of #$EPIC` breadcrumb line is optional — the native sub-issue
link in Step 3 is what establishes the relationship — but it's a harmless, human-readable pointer for
anyone reading the raw issue.

```bash
gh issue create --repo owner/name \
  --title "R1 — Send welcome email on signup" \
  --label "prd:welcome-email" \
  --body-file /tmp/to-prd/r1-body.md
```

Suggested sub-issue body:

```markdown
Part of #$EPIC

**Requirement:** The system must send a welcome email to every new user within five minutes of signup.

**Rationale:** Supports goal "activate new users quickly."

**Acceptance criteria:**
- [ ] Email fires within 5 minutes of account creation
- [ ] Template renders correctly on mobile and desktop
- [ ] Bounces are logged and retried once
```

Capture each sub-issue's number as you go — you need them all for Step 3.

## Step 3 — Attach each sub-issue to the epic (native sub-issues)

Use GitHub's first-class **sub-issue** relationship so the epic shows a real nested hierarchy with an
automatic completed/total progress bar in its UI — not just a checklist someone has to keep in sync by
hand. This is the default.

The relationship is set per child through the REST API. The catch: the endpoint wants the child's
**internal database id** (an integer), which is *not* the issue number you see in the URL. Fetch that
id with `gh api`, then attach it. For each sub-issue number (call it `$CHILD`):

```bash
CHILD_ID=$(gh api "repos/owner/name/issues/$CHILD" --jq '.id')
gh api --method POST "repos/owner/name/issues/$EPIC/sub_issues" -F sub_issue_id="$CHILD_ID"
```

(`-F` sends `sub_issue_id` as a JSON number, which the endpoint requires; `-f` would send a string and
fail.) Repeat for every R1…Rn issue, in order. Afterward the epic page shows a **Sub-issues** panel
listing all the children with a live progress bar — nothing to maintain in the body. Parent and
children must live in the same repository.

### Fallback — task-list checklist

Native sub-issues need a GitHub that supports the feature (github.com, or a recent GitHub Enterprise
Server). If the `sub_issues` API returns 404/410 — an older GHE — fall back to a task list in the epic
body. GitHub renders `- [ ] #123` as a checkable item showing the child's title and status:

```markdown
## Sub-issues
- [ ] #124 — R1 Send welcome email on signup
- [ ] #125 — R2 Let users unsubscribe
- [ ] #126 — R3 Log and retry bounces
```

```bash
gh issue edit $EPIC --repo owner/name --body-file /tmp/to-prd/epic-body.md
```

This works everywhere but produces only a flat checklist, not the nested hierarchy or progress bar —
so reach for it only when the native API isn't available.

## Finishing up

Report back concisely: the epic's URL and a count of sub-issues created, e.g. "Filed the epic
(#123) with 5 linked sub-issues in owner/name." If anything failed partway (say, three of five
issues created before an auth error), say exactly what got created so the user isn't left guessing —
half-created issue sets are the main failure mode worth surfacing clearly.
