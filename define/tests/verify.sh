#!/usr/bin/env bash
# Usage: verify.sh <draft-body-file> [flag-name, default --json]   Checks a Define draft against scenario.md.
set -u
f=${1:?usage: verify.sh <draft-body-file> [flag-name]}
flag=${2:---json}
dir="$(cd "$(dirname "$0")/.." && pwd)"
fail=0
has() { # name pattern
  if grep -Eqi -- "$2" "$f"; then echo "PASS $1"; else echo "FAIL $1"; fail=1; fi
}
node "$dir/scripts/check-issue.ts" "$dir/issue.yml" "$f" feature >/dev/null 2>&1 && echo "PASS structure check" || { echo "FAIL structure check"; fail=1; }
head -1 "$f" | grep -q '^## ' && { echo "FAIL body starts with a summary"; fail=1; } || echo "PASS body starts with a summary"
has "decision: flag name ($flag)" "^- .*$flag"
has "decision: bare array"     '^- .*(bare|plain).*array'
has "rejected option recorded (Rejected: ... because ...)" '^(- )?Rejected: .*--format=json.* because '
has "empty result criterion"   '^- \[ \].*\[\]'
has "files named"              'src/cli\.js'
has "CSV out of scope"         '^## Out of scope'
grep -q '^```mermaid' "$f" && echo "INFO diagram present (optional)" || echo "INFO no diagram (optional)"
has "trace id line"            '^Trace ID: `[0-9a-f]{32}`$'
has "session line"             '^Define session: `[0-9a-f-]{36}`$'
exit $fail
