import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { findTranscript, readSessionUsage, sessionUsage } from "./usage.ts";

const SESSION = "4aab8db9-6e79-4f87-9d03-77c6f9de2359";

function assistant(id: string, usage: object) {
  return JSON.stringify({ type: "assistant", message: { id, usage, model: "claude-test-1" } });
}

const usage = { input_tokens: 2, cache_creation_input_tokens: 100, cache_read_input_tokens: 1000, output_tokens: 50 };

function fixture(): { configDir: string; transcript: string } {
  const configDir = mkdtempSync(join(tmpdir(), "usage-"));
  const project = join(configDir, "projects", "-Users-me-repo");
  mkdirSync(join(project, SESSION, "subagents"), { recursive: true });
  const transcript = join(project, `${SESSION}.jsonl`);
  writeFileSync(
    transcript,
    [
      JSON.stringify({ type: "user", message: { content: "hi" } }),
      assistant("msg_1", usage),
      assistant("msg_1", usage), // same response split over two lines
      assistant("msg_2", usage),
    ].join("\n") + "\n",
  );
  writeFileSync(join(project, SESSION, "subagents", "agent-a.jsonl"), assistant("msg_3", usage) + "\n");
  writeFileSync(join(project, SESSION, "subagents", "agent-a.meta.json"), "{}");
  return { configDir, transcript };
}

test("finds the transcript by session ID in any project folder", () => {
  const { configDir, transcript } = fixture();
  assert.equal(findTranscript(SESSION, configDir), transcript);
  assert.equal(findTranscript("00000000-0000-0000-0000-000000000000", configDir), null);
});

test("counts each response once and includes subagents", () => {
  const { transcript } = fixture();
  assert.deepEqual(sessionUsage(transcript), {
    tokens: 3 * 1152,
    calls: 1,
    tokens_breakdown: { input: 6, cache_write: 300, cache_read: 3000, output: 150 },
    model: "claude-test-1",
  });
});

test("throws when assistant lines carry no usage", () => {
  const { configDir } = fixture();
  const path = join(configDir, "changed.jsonl");
  writeFileSync(path, JSON.stringify({ type: "assistant", message: { id: "x" } }) + "\n");
  assert.throws(() => sessionUsage(path), /format may have changed/);
});

test("readSessionUsage reads a session's usage, or falls back to null tokens", () => {
  const { configDir } = fixture();
  const found = readSessionUsage(SESSION, configDir);
  assert.equal(found.tokens, 3 * 1152);
  const { input, cache_write, cache_read, output } = found.tokens_breakdown!;
  assert.equal(input + cache_write + cache_read + output, found.tokens);
  assert.deepEqual(readSessionUsage("00000000-0000-0000-0000-000000000000", configDir), {
    tokens: null,
    calls: 0,
    tokens_breakdown: null,
    model: null,
  });
});

test("the model is the one that produced the most tokens, and null when no entry names one", () => {
  const { configDir } = fixture();
  const path = join(configDir, "models.jsonl");
  const line = (id: string, model?: string, output = 50) =>
    JSON.stringify({ type: "assistant", message: { id, usage: { ...usage, output_tokens: output }, model } });
  writeFileSync(path, [line("a", "first", 500), line("b", "second")].join("\n") + "\n");
  assert.equal(sessionUsage(path).model, "first");
  writeFileSync(path, [line("a", "first"), line("b", "second")].join("\n") + "\n");
  assert.equal(sessionUsage(path).model, "second", "a tie goes to the later entry");
  writeFileSync(path, line("a") + "\n");
  assert.equal(sessionUsage(path).model, null);
});

test("synthetic entries never name the model", () => {
  const { configDir } = fixture();
  const path = join(configDir, "synthetic.jsonl");
  const line = (id: string, model: string) => JSON.stringify({ type: "assistant", message: { id, usage, model } });
  writeFileSync(path, [line("a", "real"), line("b", "<synthetic>")].join("\n") + "\n");
  assert.equal(sessionUsage(path).model, "real");
  writeFileSync(path, line("a", "<synthetic>") + "\n");
  assert.equal(sessionUsage(path).model, null);
});

test("subagents on another model count toward the session's model", () => {
  const { transcript } = fixture();
  const big = { ...usage, output_tokens: 100000 };
  writeFileSync(
    join(transcript.replace(/\.jsonl$/, ""), "subagents", "agent-a.jsonl"),
    JSON.stringify({ type: "assistant", message: { id: "msg_9", usage: big, model: "sub-model" } }) + "\n",
  );
  assert.equal(sessionUsage(transcript).model, "sub-model");
});

test("a baseline leaves only what the session used since", () => {
  const { transcript } = fixture();
  const baseline = sessionUsage(transcript);
  appendFileSync(transcript, assistant("msg_4", usage) + "\n");
  writeFileSync(join(transcript.replace(/\.jsonl$/, ""), "subagents", "agent-b.jsonl"), assistant("msg_5", usage) + "\n");
  const delta = sessionUsage(transcript, baseline);
  assert.equal(delta.tokens, 2 * 1152);
  assert.equal(delta.calls, 1);
  assert.deepEqual(delta.tokens_breakdown, { input: 4, cache_write: 200, cache_read: 2000, output: 100 });
});

test("a baseline larger than the session clamps each kind at 0", () => {
  const { transcript } = fixture();
  const total = sessionUsage(transcript);
  const baseline = {
    tokens: total.tokens + 1,
    calls: total.calls + 5,
    tokens_breakdown: { input: 10, cache_write: 100, cache_read: 3000, output: 0 },
  };
  const delta = sessionUsage(transcript, baseline);
  assert.equal(delta.calls, 0);
  assert.deepEqual(delta.tokens_breakdown, { input: 0, cache_write: 200, cache_read: 0, output: 150 });
  assert.equal(delta.tokens, 350, "tokens stays the sum of the kinds");
});

test("no baseline, or a null one, reports the whole session", () => {
  const { transcript } = fixture();
  const whole = sessionUsage(transcript);
  assert.deepEqual(sessionUsage(transcript, null), whole);
  assert.deepEqual(sessionUsage(transcript, undefined), whole);
});

test("readSessionUsage takes the baseline too", () => {
  const { configDir, transcript } = fixture();
  const baseline = sessionUsage(transcript);
  appendFileSync(transcript, assistant("msg_4", usage) + "\n");
  assert.equal(readSessionUsage(SESSION, configDir, baseline).tokens, 1152);
});
