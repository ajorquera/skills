#!/usr/bin/env bash
# Usage: make-fixture-repo.sh <dir>   Builds a local git repo (with a bare origin) for the scripted /define test.
set -eu
dir=${1:?usage: make-fixture-repo.sh <dir>}
rm -rf "$dir"; mkdir -p "$dir/work/src"; cd "$dir/work"
git init -q -b main; git config user.email t@t; git config user.name t
cat > src/format.js <<'J'
export function formatRows(rows) {
  return rows.map((r) => `${r.name}\t${r.count}`).join("\n");
}
J
cat > src/cli.js <<'J'
import { formatRows } from "./format.js";
const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const rows = [{ name: "a", count: 1 }, { name: "b", count: 2 }];
if (verbose) console.error(`rows: ${rows.length}`);
console.log(formatRows(rows));
J
git add -A; git commit -qm "report CLI"
git init -q --bare "$dir/origin.git"; git remote add origin "$dir/origin.git"; git push -q origin main
echo "$dir/work"
