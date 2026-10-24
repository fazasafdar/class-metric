import { describe, expect, it } from "vitest";
import { fmt, round, roundUp } from "../../format";
import { parseNumber } from "../../validation/numbers";

describe("round / fmt", () => {
  it("rounds half values correctly despite float error", () => {
    expect(round(1.005)).toBe(1.01);
    expect(round(-1.005)).toBe(-1.01);
    expect(round(33.3333)).toBe(33.33);
    expect(round(66.6666)).toBe(66.67);
  });
  it("never returns negative zero", () => {
    expect(Object.is(round(-0.001), 0)).toBe(true);
  });
  it("roundUp never rounds down", () => {
    expect(roundUp(83.3333)).toBe(83.34);
    expect(roundUp(82.5)).toBe(82.5);
  });
  it("fmt drops trailing zeros", () => {
    expect(fmt(84)).toBe("84");
    expect(fmt(82.5)).toBe("82.5");
    expect(fmt(33.333)).toBe("33.33");
  });
});

describe("parseNumber", () => {
  const spec = { label: "Marks" };
  it("accepts plain, decimal and padded numbers", () => {
    expect(parseNumber("12", spec)).toEqual({ value: 12 });
    expect(parseNumber(" 12.5 ", spec)).toEqual({ value: 12.5 });
    expect(parseNumber(".5", spec)).toEqual({ value: 0.5 });
    expect(parseNumber("7.", spec)).toEqual({ value: 7 });
  });
  it("rejects blanks and non-numbers", () => {
    for (const bad of ["", "   ", "abc", "1e3", "0x10", "1,5", "12 5", "--3", "Infinity", "NaN", "1/2"]) {
      expect(parseNumber(bad, spec)).toHaveProperty("error");
    }
  });
  it("enforces min, max, integer and positive", () => {
    expect(parseNumber("-1", { label: "X", min: 0 })).toHaveProperty("error");
    expect(parseNumber("101", { label: "X", max: 100 })).toHaveProperty("error");
    expect(parseNumber("1.5", { label: "X", integer: true })).toHaveProperty("error");
    expect(parseNumber("0", { label: "X", positive: true })).toHaveProperty("error");
    expect(parseNumber("0", { label: "X", min: 0 })).toEqual({ value: 0 });
  });
  it("rejects absurdly long number text", () => {
    expect(parseNumber("1".repeat(31), spec)).toHaveProperty("error");
    expect(parseNumber("1".repeat(30), spec)).toHaveProperty("value");
  });
  it("rejects numbers too large to represent", () => {
    expect(parseNumber("9".repeat(400), spec)).toHaveProperty("error");
  });
});