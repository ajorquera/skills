import assert from "node:assert/strict";
import { test } from "node:test";
import { formatTokens, span as makeSpan, traceComment, type Span } from "./trace-comment.ts";

const span: Span = {
  trace_id: "t",
  span_id: "s",
  parent_span_id: null,
  previous_trace_id: null,
  stage: "implement",
  agent: "implementer",
  tokens: 412000,
  calls: 7,
  max_depth: 2,
  status: "ok",
  transcript: null,
  children: [],
};

test("summary line matches the spec's format", () => {
  assert.match(traceComment(span), /^<details><summary>Trace: implement · 412k tokens · 7 calls · ok<\/summary>\n\n\{/);
  assert.match(traceComment({ ...span, tokens: null }), /tokens unknown/);
});

test("the JSON block round-trips", () => {
  const json = traceComment(span).split("\n")[2];
  assert.deepEqual(JSON.parse(json), span);
});

test("token formatting", () => {
  assert.equal(formatTokens(950), "950");
  assert.equal(formatTokens(412_000), "412k");
  assert.equal(formatTokens(1_000_000), "1M");
  assert.equal(formatTokens(2_450_000), "2.5M");
});

test("span() fills in the parts every stage shares and keeps extra keys", () => {
  const input = { trace_id: "t", previous_trace_id: null, stage: "review", agent: "reviewer", tokens: 5, calls: 2, status: "ok", transcript: null, round: 2, findings: 1 };
  const made = makeSpan(input);
  assert.match(made.span_id, /^[0-9a-f]{16}$/);
  assert.notEqual(makeSpan(input).span_id, made.span_id);
  assert.deepEqual({ ...made, span_id: "s" }, { ...input, span_id: "s", parent_span_id: null, max_depth: 1, children: [] });
  assert.equal(makeSpan({ ...input, calls: 0 }).max_depth, 0);
});
