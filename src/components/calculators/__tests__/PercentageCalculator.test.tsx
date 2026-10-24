import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PercentageCalculator } from "../PercentageCalculator";
import { expectAllFieldsLimited, expectLimit } from "@/tests/helpers";

const setup = () => ({ user: userEvent.setup(), ...render(<PercentageCalculator />) });

describe("PercentageCalculator", () => {
  it("limits how much can be typed into every box, in every mode", async () => {
    const { user, container } = setup();

    expectAllFieldsLimited(container);
    expectLimit(screen.getByLabelText(/marks obtained/i), 12);
    expectLimit(screen.getByLabelText(/total marks/i), 12);
    await user.type(screen.getByLabelText(/marks obtained/i), "1".repeat(30));
    expect(screen.getByLabelText(/marks obtained/i)).toHaveValue("1".repeat(12));

    await user.click(screen.getByLabelText("Find the marks"));
    expectAllFieldsLimited(container);
    expectLimit(screen.getByLabelText(/^percentage/i), 7);
    expectLimit(screen.getByLabelText(/total marks/i), 12);

    await user.click(screen.getByLabelText("Find the change"));
    expectAllFieldsLimited(container);
    expectLimit(screen.getByLabelText(/earlier score/i), 12);
    expectLimit(screen.getByLabelText(/later score/i), 12);
  });
  it("calculates a percentage from marks", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/marks obtained/i), "42");
    await user.type(screen.getByLabelText(/total marks/i), "50");
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    expect(screen.getByText("84%")).toBeInTheDocument();
    expect(screen.getByText("Marks lost")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("shows errors for empty fields and moves focus to the error summary", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Enter a number for marks obtained.");
    expect(alert).toHaveTextContent("Enter a number for total marks.");
    expect(alert).toHaveFocus();
    expect(screen.getByLabelText(/marks obtained/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("rejects marks above the total and shows no result", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/marks obtained/i), "60");
    await user.type(screen.getByLabelText(/total marks/i), "50");
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    expect(screen.getAllByText(/cannot be more than the total marks/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("120%")).not.toBeInTheDocument();
  });

  it("clears an old result as soon as an input changes", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/marks obtained/i), "42");
    await user.type(screen.getByLabelText(/total marks/i), "50");
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    expect(screen.getByText("84%")).toBeInTheDocument();
    await user.type(screen.getByLabelText(/marks obtained/i), "1");
    expect(screen.queryByText("84%")).not.toBeInTheDocument();
  });

  it("switches modes and finds marks from a percentage", async () => {
    const { user } = setup();
    await user.click(screen.getByLabelText("Find the marks"));
    await user.type(screen.getByLabelText(/^percentage/i), "85");
    await user.type(screen.getByLabelText(/total marks/i), "60");
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    expect(screen.getByText("51 out of 60")).toBeInTheDocument();
  });

  it("calculates percentage change and explains a zero start", async () => {
    const { user } = setup();
    await user.click(screen.getByLabelText("Find the change"));
    await user.type(screen.getByLabelText(/earlier score/i), "40");
    await user.type(screen.getByLabelText(/later score/i), "50");
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    expect(screen.getByText("Percentage increase")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/earlier score/i));
    await user.type(screen.getByLabelText(/earlier score/i), "0");
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    expect(screen.getAllByText(/not defined/i).length).toBeGreaterThan(0);
  });

  it("Reset clears fields, errors and results", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/marks obtained/i), "42");
    await user.type(screen.getByLabelText(/total marks/i), "50");
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByLabelText(/marks obtained/i)).toHaveValue("");
    expect(screen.queryByText("84%")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});