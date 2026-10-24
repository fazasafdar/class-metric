import { describe, expect, it } from "vitest";
import { calculateAttendance } from "../attendance";

const run = (attended: string, total: string, target = "") => calculateAttendance({ attended, total, target });
const val = (attended: string, total: string, target = "") => {
  const r = run(attended, total, target);
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.value;
};

describe("calculateAttendance: basics", () => {
  it("18 of 20 = 90%, missed 2", () => {
    const v = val("18", "20");
    expect(v).toMatchObject({ percentage: 90, missed: 2, attended: 18, total: 20 });
    expect(v.target).toBeUndefined();
  });
  it("handles 0%, 100% and rounding", () => {
    expect(val("0", "10").percentage).toBe(0);
    expect(val("10", "10").percentage).toBe(100);
    expect(val("1", "3").percentage).toBe(33.33);
  });
});

describe("calculateAttendance: targets", () => {
  it("needs 20 more classes to go from 18/20 to 95% (check: 38/40)", () => {
    const t = val("18", "20", "95").target;
    expect(t).toMatchObject({ status: "reachable", classesNeeded: 20 });
  });
  it("from 0/10 to 50% needs 10 classes (check: 10/20)", () => {
    expect(val("0", "10", "50").target).toMatchObject({ status: "reachable", classesNeeded: 10 });
  });
  it("rounds up partial classes: 7/10 to 80% needs 5 (12/15), not 4 (11/14 = 78.6%)", () => {
    expect(val("7", "10", "80").target).toMatchObject({ status: "reachable", classesNeeded: 5 });
  });
  it("target exactly met reports 0 spare classes", () => {
    expect(val("18", "20", "90").target).toMatchObject({ status: "met", classesCanMiss: 0 });
  });
  it("counts classes that can still be missed: 18/20 at target 80 -> 2 (18/22 ok, 18/23 not)", () => {
    expect(val("18", "20", "80").target).toMatchObject({ status: "met", classesCanMiss: 2 });
  });
  it("100% target is impossible once a class was missed, but met if perfect", () => {
    expect(val("18", "20", "100").target).toMatchObject({ status: "impossible" });
    expect(val("20", "20", "100").target).toMatchObject({ status: "met", classesCanMiss: 0 });
  });
  it("target 0 is always met with no 'can miss' figure", () => {
    const t = val("0", "10", "0").target;
    expect(t?.status).toBe("met");
    expect(t?.classesCanMiss).toBeUndefined();
  });
  it("decimal targets work (7/10 to 87.5% needs 14 more: 21/24)", () => {
    const t = val("7", "10", "87.5").target;
    // x >= (87.5*10 - 700) / 12.5 = 175/12.5 = 14 -> 21/24 = 87.5%
    expect(t).toMatchObject({ status: "reachable", classesNeeded: 14 });
  });
  it("never decides by the rounded percentage (89.996% is below a 90% target)", () => {
    // attended 22499 of 25000 = 89.996%, which displays as 90% but is still below 90
    expect(val("22499", "25000", "90").target?.status).toBe("reachable");
  });
});

describe("calculateAttendance: invalid input", () => {
  it("rejects attended > total", () => {
    const r = run("21", "20");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.attended).toMatch(/more than/);
  });
  it("rejects zero total, negative, decimal and blank values", () => {
    expect(run("0", "0").ok).toBe(false);
    expect(run("-1", "10").ok).toBe(false);
    expect(run("5.5", "10").ok).toBe(false);
    expect(run("", "").ok).toBe(false);
    expect(run("5", "abc").ok).toBe(false);
  });
  it("rejects targets outside 0-100 and non-numeric targets", () => {
    for (const t of ["101", "-5", "abc"]) {
      const r = run("5", "10", t);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.target).toBeDefined();
    }
  });
});