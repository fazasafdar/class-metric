import { expect } from "vitest";

/**
 * Every calculator must run this check in its tests.
 * It fails if any text box or text area on screen has no length limit,
 * so a new field can never be added without one.
 */
export function expectAllFieldsLimited(container: HTMLElement) {
  const fields = container.querySelectorAll<HTMLElement>(
    'input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), textarea',
  );
  expect(fields.length, "no text fields found to check").toBeGreaterThan(0);
  fields.forEach((field) => {
    const max = Number(field.getAttribute("maxlength"));
    expect(max, `field "${field.id}" has no maxLength`).toBeGreaterThan(0);
  });
}

/** Asserts that the box with this label has exactly this length limit. */
export function expectLimit(box: HTMLElement, limit: number) {
  expect(box).toHaveAttribute("maxLength", String(limit));
}