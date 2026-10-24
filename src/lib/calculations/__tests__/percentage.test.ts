import { describe, expect, it } from "vitest";
import { marksFromPercentage, percentageChange, percentageFromMarks } from "../percentage";

const val = <T,>(r: { ok: boolean; value?: T }) => {
  if (!r.ok) throw new Error("expected ok");
  return r.value as T;
};

describe("percentageFromMarks", () => {
  it.each([
    ["42", "50", 84],
    ["33", "40", 82.5],
    ["0", "50", 0],
    ["50", "50", 100],
    ["1", "3", 33.33],
    ["2", "3", 66.67],
    ["17.5", "20", 87.5],
    ["1.005", "100", 1.01],
  ])("%s / %s = %s%%", (obtained, total, expected) => {
    expect(val(percentageFromMarks({ obtained, total })).percentage).toBe(expected);
  });

  it("rejects zero and negative totals", () => {
    const r = percentageFromMarks({ obtained: "5", total: "0" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.total).toBeDefined();
    expect(percentageFromMarks({ obtained: "5", total: "-10" }).ok).toBe(false);
  });
  it("rejects marks above the total", () => {
    const r = percentageFromMarks({ obtained: "51", total: "50" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.obtained).toMatch(/more than/);
  });
  it("rejects negative, blank and non-numeric input, reporting every field", () => {
    expect(percentageFromMarks({ obtained: "-1", total: "50" }).ok).toBe(false);
    const r = percentageFromMarks({ obtained: "", total: "abc" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["obtained", "total"]);
  });
});

describe("marksFromPercentage", () => {
  it.each([
    ["85", "60", 51],
    ["12.5", "80", 10],
    ["33.33", "100", 33.33],
    ["0", "40", 0],
    ["100", "40", 40],
  ])("%s%% of %s = %s", (percentage, total, expected) => {
    expect(val(marksFromPercentage({ percentage, total })).marks).toBe(expected);
  });
  it("rejects percentages outside 0-100 and bad totals", () => {
    expect(marksFromPercentage({ percentage: "101", total: "50" }).ok).toBe(false);
    expect(marksFromPercentage({ percentage: "-5", total: "50" }).ok).toBe(false);
    expect(marksFromPercentage({ percentage: "50", total: "0" }).ok).toBe(false);
  });
});

describe("percentageChange", () => {
  it("calculates increases and decreases", () => {
    expect(val(percentageChange({ before: "40", after: "50" }))).toEqual({ change: 25, direction: "increase" });
    expect(val(percentageChange({ before: "50", after: "40" }))).toEqual({ change: -20, direction: "decrease" });
    expect(val(percentageChange({ before: "60", after: "60" }))).toEqual({ change: 0, direction: "none" });
    expect(val(percentageChange({ before: "50", after: "0" })).change).toBe(-100);
  });
  it("explains why a zero starting score is not allowed", () => {
    const r = percentageChange({ before: "0", after: "10" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.before).toMatch(/not defined/);
  });
});