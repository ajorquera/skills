import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface TokensBreakdown {
  input: number;
  cache_write: number;
  cache_read: number;
  output: number;
}

/** A session's totals at some earlier point; what a run subtracts to report only its own usage. */
export interface UsageBaseline {
  tokens: number;
  calls: number;
  tokens_breakdown: TokensBreakdown;
}

export interface SessionUsage {
  tokens: number;
  /** Subagents spawned in the session (since the baseline, if one was given). */
  calls: number;
  /** The same tokens as `tokens`, split by kind. Its parts add up to `tokens`. */
  tokens_breakdown: TokensBreakdown;
  /** The `message.model` that produced the most tokens, subagents included, or null if none names one. Not scoped to the baseline. */
  model: string | null;
}

/**
 * Finds a session's transcript under the Claude Code config dir. The project
 * folder name is derived from the working directory, so search for the
 * session ID instead of recomputing it.
 */
export function findTranscript(sessionId: string, configDir = defaultConfigDir()): string | null {
  const projects = join(configDir, "projects");
  if (!existsSync(projects)) return null;
  for (const project of readdirSync(projects)) {
    const path = join(projects, project, `${sessionId}.jsonl`);
    if (existsSync(path)) return path;
  }
  return null;
}

/**
 * A session's usage for its trace comment. Never throws: if the transcript is
 * missing or unreadable, it warns and returns `tokens: null`, as the spec allows.
 * With a baseline, it reports only the usage since then.
 */
export function readSessionUsage(
  sessionId: string,
  configDir = defaultConfigDir(),
  baseline?: UsageBaseline | null,
): { tokens: number | null; calls: number; tokens_breakdown: TokensBreakdown | null; model: string | null } {
  try {
    const transcript = findTranscript(sessionId, configDir);
    if (!transcript) throw new Error(`No transcript found for session ${sessionId}.`);
    return sessionUsage(transcript, baseline);
  } catch (error) {
    console.error(`Warning: ${(error as Error).message} Posting with tokens: null.`);
    return { tokens: null, calls: 0, tokens_breakdown: null, model: null };
  }
}

function defaultConfigDir(): string {
  return process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude");
}

/**
 * Sums a session's tokens, including its subagents, using the spec's rule:
 * all input (uncached, cache writes, cache reads) plus output. The transcript
 * format is internal to Claude Code, so this throws if it no longer matches.
 * The transcript only ever grows, so a baseline taken earlier is subtracted
 * per kind, clamped at 0. The model stays the session's, not the delta's.
 */
export function sessionUsage(transcriptPath: string, baseline?: UsageBaseline | null): SessionUsage {
  const subagentDir = join(transcriptPath.replace(/\.jsonl$/, ""), "subagents");
  const subagents = existsSync(subagentDir)
    ? readdirSync(subagentDir).filter((file) => file.endsWith(".jsonl"))
    : [];

  const main = transcriptUsage(transcriptPath);
  const breakdown = { ...main.breakdown };
  const byModel = new Map(main.byModel);
  for (const file of subagents) {
    const sub = transcriptUsage(join(subagentDir, file));
    for (const kind of Object.keys(breakdown) as (keyof TokensBreakdown)[]) breakdown[kind] += sub.breakdown[kind];
    for (const [model, tokens] of sub.byModel) byModel.set(model, (byModel.get(model) ?? 0) + tokens);
  }
  let calls = subagents.length;
  if (baseline) {
    for (const kind of Object.keys(breakdown) as (keyof TokensBreakdown)[]) {
      breakdown[kind] = Math.max(0, breakdown[kind] - baseline.tokens_breakdown[kind]);
    }
    calls = Math.max(0, calls - baseline.calls);
  }
  const tokens = breakdown.input + breakdown.cache_write + breakdown.cache_read + breakdown.output;
  return { tokens, calls, tokens_breakdown: breakdown, model: topModel(byModel) };
}

/** The model with the most tokens; on a tie, the one listed last (the map keeps first-seen order, main transcript first). */
function topModel(byModel: Map<string, number>): string | null {
  let top: string | null = null;
  let most = -1;
  for (const [model, tokens] of byModel) {
    if (tokens >= most) {
      top = model;
      most = tokens;
    }
  }
  return top;
}

interface Usage {
  input_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  output_tokens?: number;
}

/** One API response is written as several lines that repeat its usage, so count each message ID once. */
function transcriptUsage(path: string): { breakdown: TokensBreakdown; byModel: Map<string, number> } {
  const seen = new Set<string>();
  const breakdown = { input: 0, cache_write: 0, cache_read: 0, output: 0 };
  // Tokens per model; Claude Code's own "<synthetic>" entries name no model.
  const byModel = new Map<string, number>();
  let assistantLines = 0;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (line.trim() === "") continue;
    const entry = JSON.parse(line);
    if (entry.type !== "assistant") continue;
    assistantLines++;
    const model: unknown = entry.message?.model;
    const named = typeof model === "string" && model !== "<synthetic>" ? model : null;
    if (named !== null && !byModel.has(named)) byModel.set(named, 0);
    const id: string | undefined = entry.message?.id;
    const usage: Usage | undefined = entry.message?.usage;
    if (!id || !usage || seen.has(id)) continue;
    seen.add(id);
    const input = usage.input_tokens ?? 0;
    const cacheWrite = usage.cache_creation_input_tokens ?? 0;
    const cacheRead = usage.cache_read_input_tokens ?? 0;
    const output = usage.output_tokens ?? 0;
    breakdown.input += input;
    breakdown.cache_write += cacheWrite;
    breakdown.cache_read += cacheRead;
    breakdown.output += output;
    if (named !== null) byModel.set(named, byModel.get(named)! + input + cacheWrite + cacheRead + output);
  }
  if (assistantLines > 0 && seen.size === 0) {
    throw new Error(`No usage found in ${path}; the transcript format may have changed.`);
  }
  return { breakdown, byModel };
}
