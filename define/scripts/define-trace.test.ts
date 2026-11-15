import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const SCRIPT = join(import.meta.dirname, "define-trace.ts");
const SESSION = "4aab8db9-6e79-4f87-9d03-77c6f9de2359";
const TRACE = "0123456789abcdef0123456789abcdef";

const assistant = (id: string) =>
  JSON.stringify({
    type: "assistant",
    message: {
      id,
      model: "claude-test-1",
      usage: { input_tokens: 2, cache_creation_input_tokens: 100, cache_read_input_tokens: 1000, output_tokens: 50 },
    },
  }) + "\n";

function fixture(): { configDir: string; transcript: string } {
  const configDir = mkdtempSync(join(tmpdir(), "define-trace-"));
  const project = join(configDir, "projects", "-Users-me-repo");
  mkdirSync(join(project, SESSION, "subagents"), { recursive: true });
  const transcript = join(project, `${SESSION}.jsonl`);
  writeFileSync(transcript, assistant("msg_1") + assistant("msg_2"));
  writeFileSync(join(project, SESSION, "subagents", "agent-a.jsonl"), assistant("msg_3"));
  return { configDir, transcript };
}

function run(configDir: string, ...args: string[]) {
  const result = spawnSync("node", [SCRIPT, ...args], {
    encoding: "utf8",
    env: { ...process.env, CLAUDE_CONFIG_DIR: configDir },
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

test("--baseline prints the session's totals so far in one token", () => {
  const { configDir } = fixture();
  const out = run(configDir, "--baseline", SESSION);
  assert.equal(out.status, 0);
  assert.equal(out.stdout, "6:300:3000:150:1\n");
});

test("--baseline prints none when the transcript can't be read", () => {
  const { configDir } = fixture();
  const out = run(configDir, "--baseline", "00000000-0000-0000-0000-000000000000");
  assert.equal(out.status, 0);
  assert.equal(out.stdout, "none\n");
});

test("--since makes the trace report only the usage after the baseline", () => {
  const { configDir, transcript } = fixture();
  appendFileSync(transcript, assistant("msg_4"));
  const out = run(configDir, "--dry-run", "--since", "6:300:3000:150:1", "1", TRACE, SESSION);
  assert.equal(out.status, 0);
  assert.match(out.stdout, /"tokens":1152,/);
  assert.match(out.stdout, /"calls":0,/);
});

test("--since none, or no --since, reports the whole session", () => {
  const { configDir } = fixture();
  for (const args of [["--since", "none", "1", TRACE, SESSION], ["1", TRACE, SESSION]]) {
    const out = run(configDir, "--dry-run", ...args);
    assert.equal(out.status, 0);
    assert.match(out.stdout, /"tokens":3456,/);
    assert.match(out.stdout, /"calls":1,/);
  }
});

test("a previous trace ID still goes after the session ID", () => {
  const { configDir } = fixture();
  const prev = "b".repeat(32);
  const out = run(configDir, "--dry-run", "--since", "0:0:0:0:0", "1", TRACE, SESSION, prev);
  assert.match(out.stdout, new RegExp(`"previous_trace_id":"${prev}"`));
});

test("a malformed --since is a usage error", () => {
  const { configDir } = fixture();
  const out = run(configDir, "--dry-run", "--since", "garbage", "1", TRACE, SESSION);
  assert.equal(out.status, 2);
  assert.match(out.stderr, /Usage/);
});
