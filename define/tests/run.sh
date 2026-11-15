#!/usr/bin/env bash
# Offline test for the define skill: no repo, no network. Run from anywhere.
set -u
dir="$(cd "$(dirname "$0")/.." && pwd)"
t="$dir/tests"
fail=0
check() { # name expected-exit command...
  name=$1; want=$2; shift 2
  out=$("$@" 2>&1); got=$?
  if [ "$got" -eq "$want" ]; then echo "PASS $name"; else echo "FAIL $name (exit $got, want $want)"; echo "$out" | sed 's/^/     /'; fail=1; fi
}
check "good issue passes structure check" 0 node "$dir/scripts/check-issue.ts" "$dir/issue.yml" "$t/good-issue.md" feature
check "bad issue fails structure check"   1 node "$dir/scripts/check-issue.ts" "$dir/issue.yml" "$t/bad-issue.md" feature
check "bad type label fails"              1 node "$dir/scripts/check-issue.ts" "$dir/issue.yml" "$t/good-issue.md" chore
check "trace comment (dry run) renders"   0 node "$dir/scripts/define-trace.ts" --dry-run 1 0123456789abcdef0123456789abcdef 01234567-89ab-cdef-0123-456789abcdef
out=$(node "$dir/scripts/define-trace.ts" --dry-run 1 aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa 01234567-89ab-cdef-0123-456789abcdef bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb 2>/dev/null)
echo "$out" | grep -q '"previous_trace_id":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"' && echo "PASS rework trace carries previous trace id" || { echo "FAIL rework trace carries previous trace id"; fail=1; }
echo "$out" | grep -q '<summary>Trace: define' && echo "PASS trace comment has collapsed summary" || { echo "FAIL trace comment has collapsed summary"; fail=1; }
# A fixture transcript: two responses of 1152 tokens each, one before the baseline and one after.
cfg=$(mktemp -d); sid=01234567-89ab-cdef-0123-456789abcdef
mkdir -p "$cfg/projects/p"
line() { echo '{"type":"assistant","message":{"id":"'"$1"'","model":"m","usage":{"input_tokens":2,"cache_creation_input_tokens":100,"cache_read_input_tokens":1000,"output_tokens":50}}}'; }
line msg_1 > "$cfg/projects/p/$sid.jsonl"
base=$(CLAUDE_CONFIG_DIR="$cfg" node "$dir/scripts/define-trace.ts" --baseline "$sid" 2>/dev/null)
[ "$base" = "2:100:1000:50:0" ] && echo "PASS --baseline prints the session's usage so far" || { echo "FAIL --baseline prints the session's usage so far (got: $base)"; fail=1; }
line msg_2 >> "$cfg/projects/p/$sid.jsonl"
out=$(CLAUDE_CONFIG_DIR="$cfg" node "$dir/scripts/define-trace.ts" --dry-run --since "$base" 1 cccccccccccccccccccccccccccccccc "$sid" 2>/dev/null)
echo "$out" | grep -q '"tokens":1152,' && echo "PASS --since counts only the usage after the baseline" || { echo "FAIL --since counts only the usage after the baseline"; fail=1; }
rm -rf "$cfg"
exit $fail
