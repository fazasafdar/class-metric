import { describe, expect, it } from "vitest";
import { calculateWeightedGrade } from "../weightedGrade";

const row = (score: string, weight: string, outOf = "100", name = "") => ({ name, score, outOf, weight });

describe("calculateWeightedGrade", () => {
  it("calculates the standard example: 80@20 + 70@30 + 90@50 = 82", () => {
    const r = calculateWeightedGrade([row("80", "20"), row("70", "30"), row("90", "50")]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.finalPercentage).toBe(82);
      expect(r.value.rows.map((x) => x.contribution)).toEqual([16, 21, 45]);
    }
  });
  it("handles different 'out of' values: 18/20 and 45/60 at 50% each = 82.5", () => {
    const r = calculateWeightedGrade([row("18", "50", "20"), row("45", "50", "60")]);
    expect(r.ok && r.value.finalPercentage).toBe(82.5);
  });
  it("handles decimals", () => {
    const r = calculateWeightedGrade([row("72.5", "40.5"), row("88.25", "59.5")]);
    // (72.5 x 40.5 + 88.25 x 59.5) / 100 = (2936.25 + 5250.875) / 100 = 81.87125
    expect(r.ok && r.value.finalPercentage).toBe(81.87);
  });
  it("supports a single component with weight 100", () => {
    const r = calculateWeightedGrade([row("55", "100")]);
    expect(r.ok && r.value.finalPercentage).toBe(55);
  });
  it("allows zero scores and zero weights", () => {
    const r = calculateWeightedGrade([row("0", "50"), row("100", "50"), row("77", "0")]);
    expect(r.ok && r.value.finalPercentage).toBe(50);
  });
  it("accepts 33.33 x 3 (rounding tolerance) and keeps the result within 0-100", () => {
    const r = calculateWeightedGrade([row("100", "33.33"), row("100", "33.33"), row("100", "33.33")]);
    expect(r.ok && r.value.finalPercentage).toBe(100);
  });
  it("names unnamed components", () => {
    const r = calculateWeightedGrade([row("50", "100")]);
    expect(r.ok && r.value.rows[0].name).toBe("Assessment 1");
  });

  it("rejects weights that total less than 100 and says how much to add", () => {
    const r = calculateWeightedGrade([row("80", "40"), row("70", "50")]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.weights).toMatch(/90%.*Add 10%/);
  });
  it("rejects weights that total more than 100 and says how much to remove", () => {
    const r = calculateWeightedGrade([row("80", "60"), row("70", "50")]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.weights).toMatch(/110%.*Remove 10%/);
  });
  it("rejects all-zero weights", () => {
    expect(calculateWeightedGrade([row("80", "0")]).ok).toBe(false);
  });
  it("rejects score above 'out of', negative values, bad 'out of' and blanks, per row", () => {
    const r = calculateWeightedGrade([row("120", "50"), row("", "-5", "0")]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors["0.score"]).toMatch(/more than 100/);
      expect(r.errors["1.score"]).toBeDefined();
      expect(r.errors["1.weight"]).toBeDefined();
      expect(r.errors["1.outOf"]).toBeDefined();
    }
  });
  it("rejects weight above 100 and an empty list", () => {
    expect(calculateWeightedGrade([row("50", "101")]).ok).toBe(false);
    expect(calculateWeightedGrade([]).ok).toBe(false);
  });
});