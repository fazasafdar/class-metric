import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttendanceCalculator } from "../AttendanceCalculator";
import { expectAllFieldsLimited, expectLimit } from "@/tests/helpers";

type User = ReturnType<typeof userEvent.setup>;

const setup = () => ({ user: userEvent.setup(), ...render(<AttendanceCalculator />) });

async function enter(user: User, attended: string, total: string, target = "") {
  if (attended) await user.type(screen.getByLabelText(/classes attended/i), attended);
  if (total) await user.type(screen.getByLabelText(/total classes held/i), total);
  if (target) await user.type(screen.getByLabelText(/target attendance/i), target);
}
const calculate = (user: User) => user.click(screen.getByRole("button", { name: "Calculate" }));

describe("AttendanceCalculator", () => {
  it("limits how much can be typed into every box", async () => {
    const { user, container } = setup();
    expectAllFieldsLimited(container);
    expectLimit(screen.getByLabelText(/classes attended/i), 6);
    expectLimit(screen.getByLabelText(/total classes held/i), 6);
    expectLimit(screen.getByLabelText(/target attendance/i), 6);
    await user.type(screen.getByLabelText(/classes attended/i), "1".repeat(30));
    expect(screen.getByLabelText(/classes attended/i)).toHaveValue("1".repeat(6));
  });
  it("calculates attendance: 18 of 20 is 90% with 2 missed", async () => {
    const { user } = setup();
    await enter(user, "18", "20");
    await calculate(user);
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText("Classes missed").nextSibling).toHaveTextContent("2");
    expect(screen.queryByText(/target/i, { selector: "p" })).not.toBeInTheDocument();
  });

  it("accepts 0 classes attended as valid", async () => {
    const { user } = setup();
    await enter(user, "0", "10");
    await calculate(user);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("Classes missed").nextSibling).toHaveTextContent("10");
  });

  it("says how many classes are needed to reach a target", async () => {
    const { user } = setup();
    await enter(user, "18", "20", "95");
    await calculate(user);
    expect(screen.getByText(/attend the next 20 classes in a row/i)).toBeInTheDocument();
  });

  it("uses singular wording when only one class is needed", async () => {
    const { user } = setup();
    await enter(user, "17", "19", "90");
    await calculate(user);
    expect(screen.getByText(/attend the next class\./i)).toBeInTheDocument();
  });

  it("says how many classes can still be missed when the target is met", async () => {
    const { user } = setup();
    await enter(user, "18", "20", "80");
    await calculate(user);
    expect(screen.getByText(/could miss up to 2 more classes/i)).toBeInTheDocument();
  });

  it("warns that no more classes can be missed when exactly on target", async () => {
    const { user } = setup();
    await enter(user, "18", "20", "90");
    await calculate(user);
    expect(screen.getByText(/missing any more classes would take you below it/i)).toBeInTheDocument();
  });

  it("explains that 100% is unreachable once a class was missed", async () => {
    const { user } = setup();
    await enter(user, "18", "20", "100");
    await calculate(user);
    expect(screen.getByText(/can no longer be reached/i)).toBeInTheDocument();
  });

  it("rejects attended above total, decimals and blank fields", async () => {
    const { user } = setup();
    await calculate(user);
    expect(screen.getByRole("alert")).toHaveFocus();
    expect(screen.getByLabelText(/classes attended/i)).toHaveAttribute("aria-invalid", "true");

    await enter(user, "21", "20");
    await calculate(user);
    expect(screen.getAllByText(/cannot be more than the total classes held/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("105%")).not.toBeInTheDocument();
  });

  it("rejects decimal class counts and a zero total", async () => {
    const { user } = setup();
    await enter(user, "5.5", "0");
    await calculate(user);
    expect(screen.getAllByText(/must be a whole number/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/must be greater than 0/i).length).toBeGreaterThan(0);
  });

  it("clears an old result when an input changes, and Reset clears everything", async () => {
    const { user } = setup();
    await enter(user, "18", "20");
    await calculate(user);
    expect(screen.getByText("90%")).toBeInTheDocument();
    await user.type(screen.getByLabelText(/classes attended/i), "1");
    expect(screen.queryByText("90%")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByLabelText(/classes attended/i)).toHaveValue("");
    expect(screen.getByLabelText(/total classes held/i)).toHaveValue("");
  });
});