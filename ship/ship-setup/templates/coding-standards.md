# Coding standards

<!-- ship-setup: universal base. Sections marked [INFERRED] are amended per repo. -->

## Universal rules

- Small, focused changes: touch only what the issue requires. No drive-by refactors, no dead code, no commented-out code.
- Match the surrounding code's style, naming, and idiom — consistency with the file beats personal preference.
- Comments state constraints the code can't show; never narrate what the next line does.
- Every behavior change ships with a test that fails without it. Bug fixes ship with a regression test.
- No new dependencies without stating why an existing one can't do the job.
- Handle errors where you can act on them; don't swallow exceptions silently.
- No secrets, tokens, or credentials in code or config — ever.

## Repo profile [INFERRED]

- Language(s):
- Package manager:
- Build command:
- Typecheck command:
- Test command (single file / full suite):
- Lint/format tooling (its rules are authoritative for style — don't hand-enforce them):

## Repo conventions [INFERRED]

<!-- Observed idioms: error handling, naming, module layout, test placement,
     existing standards docs incorporated by reference. -->
