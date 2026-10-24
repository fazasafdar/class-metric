import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeightedGradeCalculator } from "../WeightedGradeCalculator";
import { expectAllFieldsLimited } from "@/tests/helpers";

type User = ReturnType<typeof userEvent.setup>;

const setup = () => ({ user: userEvent.setup(), ...render(<WeightedGradeCalculator />) });
const group = (n: number) => within(screen.getByRole("group", { name: `Assessment ${n}` }));

async function fillRow(
  user: User,
  n: number,
  v: { score?: string; outOf?: string; weight?: string; name?: string },
) {
  const g = group(n);
  if (v.name) await user.type(g.getByLabelText(/name/i), v.name);
  if (v.score) await user.type(g.getByLabelText("Score"), v.score);
  if (v.outOf) {
    await user.clear(g.getByLabelText("Out of"));
    await user.type(g.getByLabelText("Out of"), v.outOf);
  }
  if (v.weight) await user.type(g.getByLabelText("Weight"), v.weight);
}

const calculate = (user: User) => user.click(screen.getByRole("button", { name: "Calculate" }));

describe("WeightedGradeCalculator", () => {
  it("starts with three assessments, 'out of' defaulting to 100", () => {
    setup();
    expect(screen.getAllByRole("group")).toHaveLength(3);
    expect(group(1).getByLabelText("Out of")).toHaveValue("100");
  });
  it("limits how much can be typed into each box", async () => {
    const { user, container } = setup();
    expectAllFieldsLimited(container);
    const name = group(1).getByLabelText(/name/i);
    expect(name).toHaveAttribute("maxLength", "30");
    await user.type(name, "a".repeat(80));
    expect(name).toHaveValue("a".repeat(30));
    const score = group(1).getByLabelText("Score");
    expect(score).toHaveAttribute("maxLength", "20");
    await user.type(score, "1".repeat(40));
    expect(score).toHaveValue("1".repeat(20));
  });
  it("calculates the standard example: 80@20 + 70@30 + 90@50 = 82%", async () => {
    const { user } = setup();
    await fillRow(user, 1, { name: "Quiz", score: "80", weight: "20" });
    await fillRow(user, 2, { name: "Midterm", score: "70", weight: "30" });
    await fillRow(user, 3, { name: "Final", score: "90", weight: "50" });
    await calculate(user);
    expect(screen.getByText("82%")).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getByText("Midterm")).toBeInTheDocument();
    expect(within(table).getByText("21")).toBeInTheDocument();
  });

  it("supports different 'out of' values", async () => {
    const { user } = setup();
    await fillRow(user, 1, { score: "18", outOf: "20", weight: "50" });
    await fillRow(user, 2, { score: "45", outOf: "60", weight: "50" });
    await user.click(screen.getByRole("button", { name: "Remove assessment 3" }));
    await calculate(user);
    expect(screen.getByText("82.5%")).toBeInTheDocument();
  });

  it("shows a live weight total", async () => {
    const { user } = setup();
    expect(screen.getByText(/weights total 0%\. they must total 100%/i)).toBeInTheDocument();
    await fillRow(user, 1, { weight: "60" });
    await fillRow(user, 2, { weight: "40" });
    expect(screen.getByText("Weights total 100%.")).toBeInTheDocument();
  });

  it("refuses weights that do not total 100 and says how far off", async () => {
    const { user } = setup();
    await fillRow(user, 1, { score: "80", weight: "40" });
    await fillRow(user, 2, { score: "70", weight: "50" });
    await user.click(screen.getByRole("button", { name: "Remove assessment 3" }));
    await calculate(user);
    expect(screen.getByRole("alert")).toHaveTextContent(/90%.*Add 10% more weight/);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows row-level errors next to the right field", async () => {
    const { user } = setup();
    await fillRow(user, 1, { score: "120", weight: "100" });
    await user.click(screen.getByRole("button", { name: "Remove assessment 3" }));
    await user.click(screen.getByRole("button", { name: "Remove assessment 2" }));
    await calculate(user);
    expect(group(1).getByLabelText("Score")).toHaveAttribute("aria-invalid", "true");
    expect(group(1).getAllByText(/cannot be more than 100/i).length).toBeGreaterThan(0);
    expect(group(1).getByLabelText("Weight")).not.toHaveAttribute("aria-invalid");
  });

  it("flags every empty field when calculating a blank form", async () => {
    const { user } = setup();
    await calculate(user);
    expect(screen.getByRole("alert")).toHaveFocus();
    expect(group(2).getByLabelText("Score")).toHaveAttribute("aria-invalid", "true");
    expect(group(3).getByLabelText("Weight")).toHaveAttribute("aria-invalid", "true");
  });

  it("adds and removes assessments, and keeps at least one", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Add assessment" }));
    expect(screen.getAllByRole("group")).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "Remove assessment 4" }));
    await user.click(screen.getByRole("button", { name: "Remove assessment 3" }));
    await user.click(screen.getByRole("button", { name: "Remove assessment 2" }));
    expect(screen.getAllByRole("group")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Remove assessment 1" })).toBeDisabled();
  });

  it("stops adding at 20 assessments", async () => {
    const { user } = setup();
    for (let i = 0; i < 17; i++) await user.click(screen.getByRole("button", { name: "Add assessment" }));
    expect(screen.getAllByRole("group")).toHaveLength(20);
    expect(screen.getByRole("button", { name: "Add assessment" })).toBeDisabled();
  });

  it("clears the old result when an input changes", async () => {
    const { user } = setup();
    await fillRow(user, 1, { score: "50", weight: "100" });
    await user.click(screen.getByRole("button", { name: "Remove assessment 3" }));
    await user.click(screen.getByRole("button", { name: "Remove assessment 2" }));
    await calculate(user);
    expect(screen.getByText("50%", { selector: "span" })).toBeInTheDocument();
    await user.type(group(1).getByLabelText("Score"), "5");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("Reset restores three blank assessments and clears results", async () => {
    const { user } = setup();
    await fillRow(user, 1, { score: "50", weight: "100", name: "Exam" });
    await user.click(screen.getByRole("button", { name: "Add assessment" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getAllByRole("group")).toHaveLength(3);
    expect(group(1).getByLabelText("Score")).toHaveValue("");
    expect(group(1).getByLabelText(/name/i)).toHaveValue("");
    expect(group(1).getByLabelText("Out of")).toHaveValue("100");
  });
});