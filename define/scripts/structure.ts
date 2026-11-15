import { findField, findTypeLabels, splitSections, type Template } from "./template.ts";

const LINKS = "Links";
const ACCEPTANCE = "Acceptance criteria";

/**
 * The deterministic part of the template check: headings, non-empty sections,
 * folds only where the template allows them, exactly one type label, well-formed
 * fields in Links, and the size caps. Returns one message
 * per problem; an empty list means the issue passes.
 */
export function checkStructure(body: string, labels: string[], template: Template): string[] {
  const errors: string[] = [];

  const typeLabels = findTypeLabels(labels, template);
  if (typeLabels.length !== 1) {
    errors.push(
      `Expected exactly one type label (${template.type_labels.join(", ")}), found ${typeLabels.length === 0 ? "none" : typeLabels.join(", ")}.`,
    );
  }

  const found = splitSections(body);
  const known = new Set(template.sections.map((section) => section.heading));

  for (const { heading } of found) {
    if (!known.has(heading)) errors.push(`Unknown section "## ${heading}".`);
  }

  for (const section of template.sections) {
    const matches = found.filter((f) => f.heading === section.heading);
    if (matches.length > 1) errors.push(`Section "## ${section.heading}" appears ${matches.length} times.`);
    if (matches.length === 0) {
      if (section.required) errors.push(`Missing required section "## ${section.heading}".`);
    } else if (section.required && matches[0].content.trim() === "") {
      errors.push(`Section "## ${section.heading}" is empty.`);
    }
    if (!section.detail && matches.some((m) => /<details>/.test(m.content))) {
      errors.push(`Section "## ${section.heading}" can't fold: keep it all visible, outside <details>.`);
    }
  }

  const order = found.map((f) => f.heading).filter((heading) => known.has(heading));
  const expected = template.sections.map((s) => s.heading).filter((heading) => order.includes(heading));
  if (order.length === expected.length && order.some((heading, i) => heading !== expected[i])) {
    errors.push(`Sections are out of order. Expected: ${expected.join(", ")}.`);
  }

  const links = found.find((f) => f.heading === LINKS)?.content ?? "";
  for (const [name, field] of Object.entries(template.fields)) {
    const values = findField(links, field);
    if (values.length === 0 && !field.optional) {
      errors.push(`Links is missing ${name}, as a line like: ${field.line}`);
    }
    if (values.length > 1 && !field.repeated) {
      errors.push(`Links has ${values.length} ${name} lines; expected one.`);
    }
  }

  if (template.max_body_chars !== undefined) {
    const visible = body.replace(/<details>[\s\S]*?<\/details>/g, "").replace(/^```mermaid[ \t]*\r?\n[\s\S]*?^```[ \t]*\r?$/gm, "").length;
    if (visible > template.max_body_chars) {
      errors.push(`Visible body (outside <details> blocks and diagrams) is ${visible} characters; the limit is ${template.max_body_chars}.`);
    }
  }

  if (template.max_acceptance_criteria !== undefined) {
    const criteria = found.find((f) => f.heading === ACCEPTANCE)?.content ?? "";
    const count = criteria.split(/\r?\n/).filter((line) => /^\s*- \[[ xX]\]/.test(line)).length;
    if (count > template.max_acceptance_criteria) {
      errors.push(`Acceptance criteria has ${count} checklist items; the limit is ${template.max_acceptance_criteria}.`);
    }
  }

  return errors;
}
