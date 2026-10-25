import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectAllFieldsLimited, expectLimit } from "@/tests/helpers";
import { MarksRequiredCalculator } from "../MarksRequiredCalculator";

type User = ReturnType<typeof userEvent.setup>;

const setup = () => ({ user: userEvent.setup(), ...render(<MarksRequiredCalculator />) });
const box = {
  current: () => screen.getByLabelText(/^current result/i),
  currentWeight: () => screen.getByLabelText(/weight already completed/i),
  remainingWeight: () => screen.getByLabelText(/weight of the remaining assessment/i),
  desired: () => screen.getByLabelText(/desired final result/i),
  outOf: () => screen.getByLabelText(/remaining assessment is out of/i),
};
const calculate = (user: User) => user.click(screen.getByRole("button", { name: "Calculate" }));

async function fill(user: User, current: string, cw: string, rw: string, desired: string, outOf = "") {
  await user.type(box.current(), current);
  await user.type(box.currentWeight(), cw);
  await user.type(box.remainingWeight(), rw);
  await user.type(box.desired(), desired);
  if (outOf) await user.type(box.outOf(), outOf);
}

describe("MarksRequiredCalculator", () => {
  it("limits how much can be typed into every box", async () => {
    const { user, container } = setup();
    expectAllFieldsLimited(container);
    expectLimit(box.current(), 7);
    expectLimit(box.currentWeight(), 6);
    expectLimit(box.remainingWeight(), 6);
    expectLimit(box.desired(), 7);
    expectLimit(box.outOf(), 12);
    await user.type(box.current(), "1".repeat(30));
    expect(box.current()).toHaveValue("1".repeat(7));
  });

  it("works out what is needed: 70% on 60%, want 75 overall -> 82.5%", async () => {
    const { user } = setup();
    await fill(user, "70", "60", "40", "75");
    await calculate(user);
    expect(screen.getByText("82.5%", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText(/to finish with 75% overall\./i)).toBeInTheDocument();
    expect(screen.getByText("Lowest possible final result").nextSibling).toHaveTextContent("42%");
    expect(screen.getByText("Highest possible final result").nextSibling).toHaveTextContent("82%");
  });

  it("also gives the answer in marks when the assessment total is entered", async () => {
    const { user } = setup();
    await fill(user, "70", "60", "40", "75", "50");
    await calculate(user);
    expect(screen.getByText(/at least 41\.25 marks out of 50/i)).toBeInTheDocument();
  });

  it("rounds the requirement up: 83.333... is shown as 83.34%", async () => {
    const { user } = setup();
    await fill(user, "50", "70", "30", "60");
    await calculate(user);
    expect(screen.getByText("83.34%", { selector: "span" })).toBeInTheDocument();
  });

  it("says plainly when the target is impossible, and shows no required number", async () => {
    const { user } = setup();
    await fill(user, "70", "60", "40", "90");
    await calculate(user);
    expect(screen.getByText(/a final result of 90% cannot be reached/i)).toBeInTheDocument();
    expect(screen.getByText(/even full marks .* would give a final result of 82%/i)).toBeInTheDocument();
    expect(screen.queryByText(/you need at least this/i)).not.toBeInTheDocument();
  });

  it("says when the target is already secured", async () => {
    const { user } = setup();
    await fill(user, "70", "60", "40", "40");
    await calculate(user);
    expect(screen.getByText(/you have already reached your target of 40%/i)).toBeInTheDocument();
    expect(screen.getByText("0%", { selector: "span" })).toBeInTheDocument();
  });

  it("shows a live total of the two weights", async () => {
    const { user } = setup();
    expect(screen.getByText("The two weights must total 100%.")).toBeInTheDocument();
    await user.type(box.currentWeight(), "60");
    expect(screen.getByText("The weights total 60%. They must total 100%.")).toBeInTheDocument();
    await user.type(box.remainingWeight(), "40");
    expect(screen.getByText("The weights total 100%.")).toBeInTheDocument();
  });

  it("refuses weights that do not total 100 and says what they add up to", async () => {
    const { user } = setup();
    await fill(user, "70", "50", "40", "75");
    await calculate(user);
    expect(screen.getByRole("alert")).toHaveTextContent(/add up to 90%/i);
    expect(box.remainingWeight()).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText("82.5%")).not.toBeInTheDocument();
  });

  it("flags every empty box and moves focus to the error summary", async () => {
    const { user } = setup();
    await calculate(user);
    expect(screen.getByRole("alert")).toHaveFocus();
    for (const get of [box.current, box.currentWeight, box.remainingWeight, box.desired]) {
      expect(get()).toHaveAttribute("aria-invalid", "true");
    }
    expect(box.outOf()).not.toHaveAttribute("aria-invalid");
  });

  it("rejects values outside 0 to 100, a zero remaining weight and a zero assessment total", async () => {
    const { user } = setup();
    await fill(user, "101", "100", "0", "75", "0");
    await calculate(user);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/current result cannot be more than 100/i);
    expect(alert).toHaveTextContent(/weight of the remaining assessment must be greater than 0/i);
    expect(alert).toHaveTextContent(/remaining assessment total must be greater than 0/i);
  });

  it("accepts decimals", async () => {
    const { user } = setup();
    await fill(user, "72.5", "50", "50", "80.25");
    await calculate(user);
    // base = 36.25; (80.25 - 36.25) / 0.5 = 88
    expect(screen.getByText("88%", { selector: "span" })).toBeInTheDocument();
  });

  it("clears an old result when an input changes, and Reset clears everything", async () => {
    const { user } = setup();
    await fill(user, "70", "60", "40", "75");
    await calculate(user);
    expect(screen.getByText("82.5%", { selector: "span" })).toBeInTheDocument();
    await user.type(box.desired(), "1");
    expect(screen.queryByText("82.5%")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(box.current()).toHaveValue("");
    expect(screen.getByText("The two weights must total 100%.")).toBeInTheDocument();
  });
});