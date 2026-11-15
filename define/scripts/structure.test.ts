import assert from "node:assert/strict";
import { test } from "node:test";
import { checkStructure } from "./structure.ts";
import { findTypeLabels, loadTemplate } from "./template.ts";

const template = loadTemplate(new URL("../issue.yml", import.meta.url).pathname);
const TRACE = "0123456789abcdef0123456789abcdef";
const SESSION = "4aab8db9-6e79-4f87-9d03-77c6f9de2359";

function body(overrides: Record<string, string | null> = {}): string {
  const sections: Record<string, string | null> = {
    "Problem": "Users can't export reports.",
    "Solution": "Add a CSV export button.",
    "Decisions": "- CSV, not XLSX: no dependency needed.",
    "Acceptance criteria": "- [ ] Clicking Export downloads a CSV.",
    "Out of scope": "PDF export.",
    Links: `Trace ID: \`${TRACE}\`\nDefine session: \`${SESSION}\``,
    ...overrides,
  };
  return Object.entries(sections)
    .filter(([, content]) => content !== null)
    .map(([heading, content]) => `## ${heading}\n\n${content}\n`)
    .join("\n");
}

test("a complete issue passes", () => {
  assert.deepEqual(checkStructure(body(), ["feature"], template), []);
});

test("prototype lines may repeat and previous trace ID is optional", () => {
  const links = `Trace ID: \`${TRACE}\`\nDefine session: \`${SESSION}\`\nPrevious trace ID: \`${TRACE}\`\nPrototype: \`proto/export-1\`\nPrototype: \`proto/export-2\``;
  assert.deepEqual(checkStructure(body({ Links: links }), ["feature"], template), []);
});

test("type label: none, two, and unrelated labels", () => {
  assert.match(checkStructure(body(), [], template)[0], /found none/);
  assert.match(checkStructure(body(), ["bug", "feature"], template)[0], /found bug, feature/);
  assert.deepEqual(checkStructure(body(), ["bug", "good first issue"], template), []);
});

test("missing and empty sections", () => {
  assert.deepEqual(checkStructure(body({ "Out of scope": null }), ["bug"], template), [
    'Missing required section "## Out of scope".',
  ]);
  assert.deepEqual(checkStructure(body({ "Decisions": "  " }), ["bug"], template), [
    'Section "## Decisions" is empty.',
  ]);
});

test("unknown, duplicated and out-of-order sections", () => {
  assert.deepEqual(checkStructure(body() + "\n## Notes\n\nhi\n", ["bug"], template), ['Unknown section "## Notes".']);
  assert.match(checkStructure(body() + "\n## Out of scope\n\nmore\n", ["bug"], template)[0], /appears 2 times/);
  const swapped = body().replace("## Problem", "## TMP").replace("## Solution", "## Problem").replace("## TMP", "## Solution");
  assert.match(checkStructure(swapped, ["bug"], template)[0], /out of order/);
});

test("links: missing, malformed and duplicated fields", () => {
  assert.match(checkStructure(body({ Links: `Define session: \`${SESSION}\`` }), ["bug"], template)[0], /missing trace_id/);
  assert.match(checkStructure(body({ Links: `Trace ID: \`not-hex\`\nDefine session: \`${SESSION}\`` }), ["bug"], template)[0], /missing trace_id/);
  assert.match(
    checkStructure(body({ Links: `Trace ID: \`${TRACE}\`\nTrace ID: \`${TRACE}\`\nDefine session: \`${SESSION}\`` }), ["bug"], template)[0],
    /2 trace_id lines/,
  );
});

test("a trace ID outside Links doesn't count", () => {
  const errors = checkStructure(body({ "Solution": `Trace ID: \`${TRACE}\``, Links: `Define session: \`${SESSION}\`` }), ["bug"], template);
  assert.match(errors[0], /missing trace_id/);
});

test("findTypeLabels keeps only the template's type labels", () => {
  assert.deepEqual(findTypeLabels(["good first issue", "bug"], template), ["bug"]);
  assert.deepEqual(findTypeLabels(["bug", "feature"], template), ["bug", "feature"]);
  assert.deepEqual(findTypeLabels([], template), []);
});

test("the template sets the size caps", () => {
  assert.equal(template.max_body_chars, 4000);
  assert.equal(template.max_acceptance_criteria, 8);
  assert.equal(template.version, 1);
});

test("a visible body over max_body_chars fails, naming the limit and the length", () => {
  const big = body({ "Solution": "x".repeat(4000) });
  const errors = checkStructure(big, ["feature"], template);
  assert.equal(errors.length, 1);
  assert.match(errors[0], new RegExp(`${big.length} characters.*4000`));
});

test("text inside <details> blocks doesn't count toward max_body_chars", () => {
  const hidden = (text: string) => `<details>\n<summary>Details</summary>\n\n${text}\n\n</details>`;
  const collapsed = body({ "Solution": hidden("x".repeat(20000)), "Decisions": `- CSV.\n\n${hidden("y".repeat(5000))}` });
  assert.ok(collapsed.length > 25000);
  assert.deepEqual(checkStructure(collapsed, ["feature"], template), []);

  const visibleBig = body({ "Solution": hidden("x".repeat(20000)), "Problem": "z".repeat(4001) });
  assert.match(checkStructure(visibleBig, ["feature"], template)[0], /4\d{3} characters.*4000/);
});

test("a mermaid diagram doesn't count toward max_body_chars", () => {
  const diagram = "```mermaid\nflowchart LR\n" + "    A --> B\n".repeat(1000) + "```";
  const withDiagram = body({ "Solution": `- CSV.\n\n${diagram}` });
  assert.ok(withDiagram.length > 4000);
  assert.deepEqual(checkStructure(withDiagram, ["feature"], template), []);

  const visibleBig = body({ "Solution": `${diagram}\n\n${"z".repeat(4001)}` });
  assert.match(checkStructure(visibleBig, ["feature"], template)[0], /characters.*4000/);
});

test("only sections with a detail description may fold", () => {
  const hidden = `<details>\n<summary>Agent notes</summary>\n\nMore.\n\n</details>`;
  assert.deepEqual(checkStructure(body({ Solution: `Add a button.\n\n${hidden}` }), ["feature"], template), []);
  for (const heading of ["Problem", "Acceptance criteria", "Out of scope"]) {
    assert.deepEqual(checkStructure(body({ [heading]: `Visible.\n\n${hidden}` }), ["feature"], template), [
      `Section "## ${heading}" can't fold: keep it all visible, outside <details>.`,
    ]);
  }
});

test("more than max_acceptance_criteria checklist items fails, naming the limit and the count", () => {
  const items = Array.from({ length: 9 }, (_, i) => `- [${i % 2 ? "x" : " "}] Criterion ${i}.`).join("\n");
  const errors = checkStructure(body({ "Acceptance criteria": items }), ["feature"], template);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /9 checklist items.*8/);
});

test("a template without the caps skips both checks; bodies exactly at each cap pass", () => {
  const { max_body_chars, max_acceptance_criteria, ...uncapped } = template;
  const items = (n: number) => Array.from({ length: n }, (_, i) => `- [ ] Criterion ${i}.`).join("\n");
  const huge = body({ "Solution": "x".repeat(20000), "Acceptance criteria": items(20) });
  assert.deepEqual(checkStructure(huge, ["feature"], uncapped), []);

  assert.deepEqual(checkStructure(body({ "Acceptance criteria": items(8) }), ["feature"], template), []);

  const base = body({ "Solution": "" }).length;
  const exact = body({ "Solution": "x".repeat(4000 - base) });
  assert.equal(exact.length, 4000);
  assert.deepEqual(checkStructure(exact, ["feature"], template), []);
});

test("mermaid diagrams are excluded however they are written, but only whole mermaid blocks", () => {
  const rows = "    A --> B\n".repeat(1000);
  const big = (s: string) => checkStructure(body({ Solution: `- CSV.\n\n${s}` }), ["feature"], template);

  // GitHub bodies often use CRLF; trailing spaces after the fence are legal
  const crlf = `\`\`\`mermaid\nflowchart LR\n${rows}\`\`\``.replace(/\n/g, "\r\n");
  assert.deepEqual(big(crlf), []);
  assert.deepEqual(big(`\`\`\`mermaid  \nflowchart LR\n${rows}\`\`\`  `), []);

  // two diagrams
  const one = `\`\`\`mermaid\nflowchart LR\n${rows}\`\`\``;
  assert.deepEqual(big(`${one}\n\ntext\n\n${one}`), []);

  // other code blocks and unclosed diagrams still count
  assert.match(big(`\`\`\`js\n${rows}\`\`\``)[0], /characters.*4000/);
  assert.match(big(`\`\`\`mermaid\nflowchart LR\n${rows}`)[0], /characters.*4000/);
});
