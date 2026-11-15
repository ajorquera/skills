// Usage: define-trace.ts --baseline <session-id>
//        define-trace.ts [--dry-run] [--since <baseline>] <issue#> <trace-id> <session-id> [<previous-trace-id>]
// --baseline prints the session's usage so far as "input:cache_write:cache_read:output:calls", or "none"
// if the transcript can't be read. Run it at the start of a run and pass the output back as --since, so
// the trace counts only that run (a session can hold several). Without --since it counts the whole session.
// Posts Define's trace comment on the issue. Never fails because of the transcript:
// if usage can't be read, it posts the comment with "tokens": null.
import { execFileSync } from "node:child_process";
import { span, traceComment } from "./trace-comment.ts";
import { readSessionUsage, type UsageBaseline } from "./usage.ts";

const USAGE =
  "Usage: define-trace.ts --baseline <session-id>\n" +
  "       define-trace.ts [--dry-run] [--since <baseline>] <issue#> <trace-id> <session-id> [<previous-trace-id>]";

const args = process.argv.slice(2);

if (args[0] === "--baseline") {
  if (!args[1] || args.length > 2) usageError();
  const usage = readSessionUsage(args[1]);
  const b = usage.tokens_breakdown;
  console.log(b ? `${b.input}:${b.cache_write}:${b.cache_read}:${b.output}:${usage.calls}` : "none");
  process.exit(0);
}

let dryRun = false;
let baseline: UsageBaseline | null = null;
while (args[0]?.startsWith("--")) {
  const flag = args.shift();
  if (flag === "--dry-run") dryRun = true;
  else if (flag === "--since") baseline = parseBaseline(args.shift());
  else usageError();
}
const [issue, traceId, sessionId, previousTraceId] = args;
if (!issue || !traceId || !sessionId) usageError();

function usageError(): never {
  console.error(USAGE);
  process.exit(2);
}

function parseBaseline(text: string | undefined): UsageBaseline | null {
  if (text === "none") return null;
  const parts = text?.split(":") ?? [];
  const [input, cache_write, cache_read, output, calls] = parts.map(Number);
  if (parts.length !== 5 || parts.some((part) => !/^\d+$/.test(part))) return usageError();
  return { tokens: input + cache_write + cache_read + output, calls, tokens_breakdown: { input, cache_write, cache_read, output } };
}

const { tokens, calls } = readSessionUsage(sessionId, undefined, baseline);

const body = traceComment(
  span({
    trace_id: traceId,
    previous_trace_id: previousTraceId ?? null,
    stage: "define",
    agent: "definer",
    tokens,
    calls,
    status: "ok",
    transcript: null,
    session_id: sessionId,
  }),
);

if (dryRun) {
  process.stdout.write(body);
} else {
  execFileSync("gh", ["issue", "comment", issue.replace(/^#/, ""), "--body-file", "-"], {
    input: body,
    stdio: ["pipe", "inherit", "inherit"],
  });
}
