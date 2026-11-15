import { randomBytes } from "node:crypto";

export interface Span {
  trace_id: string;
  span_id: string;
  parent_span_id: string | null;
  previous_trace_id: string | null;
  stage: string;
  agent: string;
  tokens: number | null;
  calls: number;
  max_depth: number;
  status: string;
  transcript: string | null;
  children: Span[];
  [extra: string]: unknown;
}

/** What a stage knows about its run; span() fills in the rest. */
export interface SpanInput {
  trace_id: string;
  previous_trace_id: string | null;
  stage: string;
  agent: string;
  tokens: number | null;
  calls: number;
  status: string;
  transcript: string | null;
  [extra: string]: unknown;
}

/**
 * A top-level span for one agent run: a fresh span ID, no parent, no children, and
 * `max_depth` 1 if the run spawned subagents. Extra keys (`round`, `findings`) pass through.
 */
export function span(input: SpanInput): Span {
  const { trace_id, previous_trace_id, stage, agent, tokens, calls, status, transcript, ...extra } = input;
  return {
    trace_id,
    span_id: randomBytes(8).toString("hex"),
    parent_span_id: null,
    previous_trace_id,
    stage,
    agent,
    tokens,
    calls,
    max_depth: calls > 0 ? 1 : 0,
    status,
    transcript,
    ...extra,
    children: [],
  };
}

/** The per-stage trace comment from the spec: a one-line summary over a machine-readable JSON block. */
export function traceComment(span: Span): string {
  const tokens = span.tokens === null ? "tokens unknown" : `${formatTokens(span.tokens)} tokens`;
  const summary = `Trace: ${span.stage} · ${tokens} · ${span.calls} calls · ${span.status}`;
  return `<details><summary>${summary}</summary>\n\n${JSON.stringify(span)}\n</details>\n`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}k`;
  return String(tokens);
}
