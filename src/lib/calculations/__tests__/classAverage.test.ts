import { describe, expect, it } from "vitest";
import {
  calculateClassAverage,
  MAX_MARK_LENGTH,
  MAX_NAME_LENGTH,
  MAX_STUDENTS,
  type StudentInput,
} from "../classAverage";

/** Builds students from [name, mark] pairs. */
const students = (...pairs: [string, string][]): StudentInput[] =>
  pairs.map(([name, mark]) => ({ name, mark }));
/** Builds unnamed students from marks. */
const marks = (...list: string[]): StudentInput[] => list.map((mark) => ({ name: "", mark }));
const run = (list: StudentInput[], maxMark = "") => calculateClassAverage({ students: list, maxMark });

describe("calculateClassAverage: figures", () => {
  it("calculates average, count, highest and lowest: 70, 80, 90", () => {
    const r = run(marks("70", "80", "90"));
    expect(r.ok && r.value).toMatchObject({ count: 3, average: 80, highest: 90, lowest: 70 });
  });
  it("handles decimals: 85.5 and 90.5 average 88", () => {
    const r = run(marks("85.5", "90.5"));
    expect(r.ok && r.value.average).toBe(88);
  });
  it("counts zeros as real marks: 0, 0, 10 -> 3.33", () => {
    const r = run(marks("0", "0", "10"));
    expect(r.ok && r.value).toMatchObject({ count: 3, average: 3.33, lowest: 0 });
  });
  it("rounds the average to two decimals: 1, 1, 2 -> 1.33", () => {
    const r = run(marks("1", "1", "2"));
    expect(r.ok && r.value.average).toBe(1.33);
  });
  it("works for a single student", () => {
    const r = run(marks("64"));
    expect(r.ok && r.value).toMatchObject({ count: 1, average: 64, highest: 64, lowest: 64 });
  });
  it("handles a full class of the maximum size", () => {
    const r = run(marks(...Array(MAX_STUDENTS).fill("75")));
    expect(r.ok && r.value).toMatchObject({ count: MAX_STUDENTS, average: 75 });
  });
  it("gives the average as a percentage when a maximum mark is set", () => {
    const r = run(marks("30", "40", "50"), "50");
    expect(r.ok && r.value).toMatchObject({ average: 40, averagePercentage: 80, maxMark: 50 });
  });
  it("accepts a mark equal to the maximum, and omits the percentage without a maximum", () => {
    expect(run(marks("50", "50"), "50").ok).toBe(true);
    const r = run(marks("30", "40"));
    expect(r.ok && r.value.averagePercentage).toBeUndefined();
  });
});

describe("calculateClassAverage: who scored what", () => {
  it("names the students with the highest and lowest marks", () => {
    const r = run(students(["Sara Khan", "94"], ["Hamza Raza", "91"], ["Ayesha Malik", "86"]));
    expect(r.ok && r.value).toMatchObject({
      count: 3,
      average: 90.33,
      highest: 94,
      highestBy: ["Sara Khan"],
      lowest: 86,
      lowestBy: ["Ayesha Malik"],
    });
  });
  it("uses 'No. 2' for students without a name", () => {
    const r = run(marks("70", "90", "80"));
    expect(r.ok && r.value).toMatchObject({ highestBy: ["No. 2"], lowestBy: ["No. 1"] });
  });
  it("mixes names and numbers when only some students have a name", () => {
    const r = run(students(["Sara", "90"], ["", "60"]));
    expect(r.ok && r.value).toMatchObject({ highestBy: ["Sara"], lowestBy: ["No. 2"] });
  });
  it("lists everyone who ties for highest or lowest, in order", () => {
    const r = run(students(["A", "90"], ["B", "90"], ["C", "70"], ["D", "70"], ["E", "80"]));
    expect(r.ok && r.value).toMatchObject({ highestBy: ["A", "B"], lowestBy: ["C", "D"] });
  });
  it("trims names and keeps duplicate names as separate students", () => {
    const r = run(students(["  Sara  ", "90"], ["Sara", "90"]));
    expect(r.ok && r.value).toMatchObject({ count: 2, highestBy: ["Sara", "Sara"] });
  });
});

describe("calculateClassAverage: blank rows and missing marks", () => {
  it("ignores rows with neither a name nor a mark", () => {
    const r = run(students(["", "70"], ["", ""], ["", "80"], ["  ", "  "]));
    expect(r.ok && r.value).toMatchObject({ count: 2, average: 75, withoutMark: 0 });
  });
  it("leaves out a named student with no mark, and counts them", () => {
    const r = run(students(["Sara", "90"], ["Bilal", ""], ["Hira", "70"]));
    expect(r.ok && r.value).toMatchObject({ count: 2, average: 80, withoutMark: 1 });
    expect(r.ok && r.value.highestBy).toEqual(["Sara"]);
  });
});

describe("calculateClassAverage: rejected input", () => {
  it("rejects when there is no mark at all, even if names were entered", () => {
    for (const list of [[], marks(""), students(["Sara", ""], ["Hira", ""])]) {
      const r = run(list);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.marks).toMatch(/at least one mark/i);
    }
  });
  it("rejects a non-number and names the student and the number", () => {
    const r = run(students(["Sara", "70"], ["Bilal Ahmed", "absent"], ["Hira", "80"]));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors)).toEqual(["mark.1"]);
      expect(r.errors["mark.1"]).toMatch(/Bilal Ahmed \(No\. 2\) must be a number/);
    }
  });
  it("says 'No. 2' in errors when there is no name", () => {
    const r = run(marks("70", "x"));
    expect(!r.ok && r.errors["mark.1"]).toMatch(/Marks for No\. 2 must be a number/);
  });
  it("rejects negative marks, and number tricks like 1e3, 0x10 and 1,5", () => {
    for (const bad of ["-5", "1e3", "0x10", "1,5", "Infinity", "12 5"]) {
      const r = run(marks("70", bad));
      expect(r.ok, `"${bad}" should be rejected`).toBe(false);
      if (!r.ok) expect(r.errors["mark.1"]).toBeDefined();
    }
  });
  it("rejects marks above the maximum mark, naming the student", () => {
    const r = run(students(["Sara", "30"], ["Hira", "60"]), "50");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors["mark.1"]).toMatch(/Hira \(No\. 2\) cannot be more than the maximum mark of 50/);
  });
  it("rejects a mark that is too long to be real", () => {
    const r = run(marks("70", "9834981397568713565461546154615691586158915861591598158915"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors["mark.1"]).toMatch(/too long/i);
    expect(run(marks("1".repeat(MAX_MARK_LENGTH))).ok).toBe(true);
    expect(run(marks("1".repeat(MAX_MARK_LENGTH + 1))).ok).toBe(false);
  });
  it("rejects a name that is too long, and does not echo it back in full", () => {
    const longName = "A".repeat(MAX_NAME_LENGTH + 1);
    const r = run(students([longName, "70"], ["Hira", "80"]));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors["name.0"]).toMatch(/too long/i);
      expect(r.errors["name.0"].length).toBeLessThan(120);
    }
    expect(run(students(["A".repeat(MAX_NAME_LENGTH), "70"])).ok).toBe(true);
  });
  it("keeps error messages short even if a long name has a bad mark", () => {
    const r = run(students(["B".repeat(500), "abc"]));
    expect(!r.ok && r.errors["mark.0"].length).toBeLessThan(200);
  });
  it("reports every bad row together", () => {
    const r = run(marks("a", "70", "-1", "b"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["mark.0", "mark.2", "mark.3"]);
  });
  it("rejects an invalid maximum mark, and still checks the rows", () => {
    for (const bad of ["0", "-5", "abc"]) {
      const r = run(marks("70"), bad);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.maxMark).toBeDefined();
    }
    const both = run(marks("x"), "abc");
    expect(both.ok).toBe(false);
    if (!both.ok) expect(Object.keys(both.errors).sort()).toEqual(["mark.0", "maxMark"]);
  });
  it("rejects more students than the limit", () => {
    const r = run(marks(...Array(MAX_STUDENTS + 1).fill("1")));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.marks).toMatch(/up to 200/);
  });
});