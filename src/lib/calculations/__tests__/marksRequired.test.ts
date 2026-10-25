import { describe, expect, it } from "vitest";
import { calculateMarksRequired } from "../marksRequired";

const base = { currentScore: "70", currentWeight: "60", remainingWeight: "40", desiredFinal: "75", remainingOutOf: "" };
const run = (over: Partial<typeof base> = {}) => calculateMarksRequired({ ...base, ...over });
const val = (over: Partial<typeof base> = {}) => {
  const r = run(over);
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.value;
};

describe("calculateMarksRequired", () => {
  it("70% on 60% of the grade, want 75 overall: needs 82.5% on the last 40%", () => {
    // base = 42; (75 - 42) / 0.4 = 82.5
    expect(val()).toMatchObject({ status: "needed", requiredPercentage: 82.5, lowestPossibleFinal: 42, highestPossibleFinal: 82 });
  });
  it("converts to marks when the remaining total is given: 82.5% of 50 = 41.25", () => {
    expect(val({ remainingOutOf: "50" })).toMatchObject({ requiredMarks: 41.25, outOf: 50 });
  });
  it("reports impossible targets instead of a number above 100%", () => {
    const v = val({ desiredFinal: "90" });
    expect(v.status).toBe("impossible");
    expect(v.requiredPercentage).toBeUndefined();
    expect(v.highestPossibleFinal).toBe(82);
  });
  it("treats exactly 100% as possible", () => {
    expect(val({ currentScore: "100", desiredFinal: "100" })).toMatchObject({ status: "needed", requiredPercentage: 100 });
  });
  it("detects a target that is already secured", () => {
    expect(val({ desiredFinal: "40" }).status).toBe("secured");
    expect(val({ desiredFinal: "42" })).toMatchObject({ status: "secured", requiredPercentage: 0 });
    expect(val({ desiredFinal: "40", remainingOutOf: "50" })).toMatchObject({ requiredMarks: 0 });
  });
  it("rounds the requirement UP so the result is always enough (83.333.. -> 83.34)", () => {
    const v = val({ currentScore: "50", currentWeight: "70", remainingWeight: "30", desiredFinal: "60" });
    expect(v.requiredPercentage).toBe(83.34);
  });
  it("handles zero current weight and decimals", () => {
    expect(val({ currentScore: "0", currentWeight: "0", remainingWeight: "100", desiredFinal: "50.5" }).requiredPercentage).toBe(50.5);
  });
  it("a perfect score possible only when target equals the max", () => {
    expect(val({ desiredFinal: "82" })).toMatchObject({ status: "needed", requiredPercentage: 100 });
    expect(val({ desiredFinal: "82.01" }).status).toBe("impossible");
  });

  it("accepts weights that total 100 within rounding, such as 33.33 + 66.66", () => {
    expect(run({ currentWeight: "33.33", remainingWeight: "66.66" }).ok).toBe(true);
    expect(run({ currentWeight: "33.33", remainingWeight: "66.5" }).ok).toBe(false);
  });
  it("rejects absurdly long numbers in every box", () => {
    const long = "1".repeat(31);
    for (const field of ["currentScore", "currentWeight", "remainingWeight", "desiredFinal", "remainingOutOf"] as const) {
      expect(run({ [field]: long }).ok, `${field} should be rejected`).toBe(false);
    }
  });

  it("rejects weights that do not total 100", () => {
    const r = run({ currentWeight: "50", remainingWeight: "40" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.remainingWeight).toMatch(/90%/);
  });
  it("rejects a remaining weight of 0, out-of-range and blank inputs", () => {
    expect(run({ currentWeight: "100", remainingWeight: "0" }).ok).toBe(false);
    expect(run({ currentScore: "101" }).ok).toBe(false);
    expect(run({ desiredFinal: "-1" }).ok).toBe(false);
    expect(run({ desiredFinal: "101" }).ok).toBe(false);
    expect(run({ currentScore: "" }).ok).toBe(false);
    expect(run({ currentScore: "abc" }).ok).toBe(false);
    expect(run({ remainingOutOf: "0" }).ok).toBe(false);
  });
});