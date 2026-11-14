---
name: lineage-operator
description: >-
  Operate Lineage (lineagehq/lineage) channels, profiles, services, and
  creative iteration workflows through its CLI. Use when the user wants to
  run, start, upgrade, or inspect a Lineage runtime or profile, read a Lineage
  selection or brief, claim a workspace, branch or re-roll a node, or generate
  and import new image variations into a Lineage canvas.
---

# Operate Lineage

Lineage is a local canvas that records every creative attempt as a node in a
tree. The human branches, re-rolls, selects, and annotates on the canvas; you
read that state through the Lineage CLI, make the variations, and import them
back as child nodes.

Use this skill for Lineage runtime operations. File-only inspection or edits do
not need a profile or runtime gate. Use the guidance matching the code being
operated; an installed package skill does not establish checkout compatibility.

## Shared safeguards

Before operating a profile, database, or service, read
[runtime and profile identity](references/runtime-profiles.md) and complete its
matching channel/profile/database gate. That reference also covers first-profile
bootstrap and dev repinning. Never infer identity from a window title, PID,
port, PATH, or an old command. Stop on identity mismatch.

Persistent writes require a named profile pinned to verified code, the profile
writer lease, and any operation-specific `--confirm-write`. Pass `--profile` on
every operational command; never replace it with a direct `--db` write.
Legacy-unbound access is diagnostic/read-only and never authorizes writes.
Before a persistent write, confirm the profile doctor, code fingerprint,
database identity, environment, and service origin agree.

Keep stable, preview, and dev identities separate. Never point preview/dev code
at the stable database or copy a live SQLite file directly. Claims and target
locks retain their operation-specific requirements in the references below.

## Load only the relevant workflow

| Task | Reference |
| --- | --- |
| Channel selection, identity gate, first profile, dev repin | [Runtime and profiles](references/runtime-profiles.md) |
| Start, status, logs, stop, stable package upgrade | [Services and upgrades](references/services-upgrades.md) |
| Inspect state, claim, heartbeat, link a child, release | [Claims](references/claims.md) |
| Resolve targets, replace locks, plan/scaffold/import/cancel generation | [Image generation](references/image-generation.md) |
| SQLite-safe clone, legacy binding, stage referenced media | [Cloning and migration](references/cloning-migration.md) |

## Producing the images

Lineage is provider-neutral: it plans the job and scaffolds exact output paths
and sizes, but never makes the images itself. Step 7 of the
[image generation](references/image-generation.md) sequence is yours. Use
whatever the session offers — an image-generation tool or MCP server, a script
the user names, or screenshots of rendered UI variants — at exactly the
scaffolded width and height. If nothing in the session can produce an image,
stop and ask the user which generator to use; never resize, crop, or substitute
a placeholder.

## Finish

Continue the authorized workflow through verification and fixes within scope.
Existing explicit approval remains valid; ask when intent is missing or an
operation crosses an unauthorized data, production, or destructive boundary.

At operational handoff, rerun runtime doctor, profile doctor, and database info;
include managed status when a service is involved. Report channel, profile,
code fingerprint, database path/fingerprint, and any failed check. A managed
service is ready only when its receipt and `/api/runtime` identity agree.

## Upstream reference

This skill is ported from Lineage's Codex plugin skill
`lineage-package-operator` at commit `eac8e9d`. The CLI evolves faster than this
copy. Consult upstream when a command or flag here is rejected, a reference
doesn't cover the task, or runtime doctor reports a version newer than this
port:

- Original skill:
  https://github.com/lineagehq/lineage/tree/eac8e9d0c9c454762fb1545881f8dc15ef335f81/plugins/lineage-codex-plugin/skills/lineage-package-operator
- Latest skill: https://github.com/lineagehq/lineage/tree/main/plugins/lineage-codex-plugin/skills/lineage-package-operator
- Install, channels, profiles, and local development: https://github.com/lineagehq/lineage#readme
- The installed CLI itself: `lineage-stable --help` and `<command> --help`

When upstream and this copy disagree, follow upstream and the CLI's own output.

Lineage is © 2026 Mean Weasel, MIT-licensed; see [LICENSE-lineage](LICENSE-lineage).
