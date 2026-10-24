import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectAllFieldsLimited, expectLimit } from "@/tests/helpers";
import { ClassAverageCalculator } from "../ClassAverageCalculator";

type User = ReturnType<typeof userEvent.setup>;

const setup = () => ({ user: userEvent.setup(), ...render(<ClassAverageCalculator />) });
const nameBox = (n: number) => screen.getByLabelText(`Student name (optional) for No. ${n}`);
const markBox = (n: number) => screen.getByLabelText(`Marks obtained for No. ${n}`);
const rowCount = () => screen.getAllByRole("group").length;
const calculate = (user: User) => user.click(screen.getByRole("button", { name: "Calculate" }));
/** The block (label, value and detail) for one result figure. */
const stat = (label: string) => screen.getByText(label).parentElement as HTMLElement;

/** Types [name, mark] pairs into rows 1, 2, 3... Use "" to skip a box. */
async function fill(user: User, students: [string, string][]) {
  for (let i = 0; i < students.length; i++) {
    const [name, mark] = students[i];
    if (name) await user.type(nameBox(i + 1), name);
    if (mark) await user.type(markBox(i + 1), mark);
  }
}

describe("ClassAverageCalculator", () => {
  it("limits how much can be typed into every box", async () => {
    const { user, container } = setup();
    expectAllFieldsLimited(container);
    expectLimit(nameBox(1), 50);
    expectLimit(markBox(1), 12);
    expectLimit(screen.getByLabelText(/maximum mark/i), 12);
    await user.type(nameBox(1), "a".repeat(80));
    expect(nameBox(1)).toHaveValue("a".repeat(50));
    await user.type(markBox(1), "1".repeat(30));
    expect(markBox(1)).toHaveValue("1".repeat(12));
  });

  it("starts with five empty rows, numbered No. 1 to No. 5, and says no marks are entered", () => {
    setup();
    expect(rowCount()).toBe(5);
    expect(screen.getByRole("group", { name: "No. 5" })).toBeInTheDocument();
    expect(screen.getByText("No marks entered yet.")).toBeInTheDocument();
  });

  it("says that names stay on the device", () => {
    setup();
    expect(screen.getByText(/names stay on your device and are never sent anywhere/i)).toBeInTheDocument();
  });

  it("shows the average and who scored the highest and lowest marks", async () => {
    const { user } = setup();
    await fill(user, [["Sara Khan", "94"], ["Hamza Raza", "91"], ["Ayesha Malik", "86"]]);
    await calculate(user);
    expect(screen.getByText("90.33", { selector: "span" })).toBeInTheDocument();
    expect(stat("Students")).toHaveTextContent("3");
    expect(stat("Highest mark")).toHaveTextContent("94");
    expect(stat("Highest mark")).toHaveTextContent("Sara Khan");
    expect(stat("Lowest mark")).toHaveTextContent("86");
    expect(stat("Lowest mark")).toHaveTextContent("Ayesha Malik");
  });

  it("uses the student's number when no name was entered", async () => {
    const { user } = setup();
    await fill(user, [["", "70"], ["", "90"], ["", "80"]]);
    await calculate(user);
    expect(stat("Highest mark")).toHaveTextContent("No. 2");
    expect(stat("Lowest mark")).toHaveTextContent("No. 1");
  });

  it("lists every student who ties for the highest mark", async () => {
    const { user } = setup();
    await fill(user, [["Sara", "90"], ["Hamza", "90"], ["Hira", "70"]]);
    await calculate(user);
    expect(stat("Highest mark")).toHaveTextContent("Sara and Hamza");
  });

  it("leaves out a named student with no mark, and says so", async () => {
    const { user } = setup();
    await fill(user, [["Sara", "90"], ["Bilal", ""], ["Hira", "70"]]);
    await calculate(user);
    expect(stat("Students")).toHaveTextContent("2");
    expect(stat("Students")).toHaveTextContent("1 student without a mark, left out");
    expect(screen.getByText("80", { selector: "span" })).toBeInTheDocument();
  });

  it("skips completely empty rows", async () => {
    const { user } = setup();
    await fill(user, [["", "70"], ["", ""], ["", "80"]]);
    expect(screen.getByText("2 marks entered.")).toBeInTheDocument();
    await calculate(user);
    expect(stat("Students")).toHaveTextContent("2");
  });

  it("moves with Enter: name, then marks, then the next student's name, adding a row at the end", async () => {
    const { user } = setup();
    await user.type(nameBox(1), "Sara{Enter}");
    expect(markBox(1)).toHaveFocus();
    await user.type(markBox(1), "90{Enter}");
    expect(nameBox(2)).toHaveFocus();
    await user.click(markBox(5));
    await user.keyboard("{Enter}");
    expect(rowCount()).toBe(6);
    expect(nameBox(6)).toHaveFocus();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("fills a column of marks pasted from a spreadsheet, adding rows when needed", async () => {
    const { user } = setup();
    await user.click(markBox(1));
    await user.paste("70\n80\n90\n60\n50\n40\n");
    expect(rowCount()).toBe(6);
    expect(markBox(6)).toHaveValue("40");
    expect(screen.getByText("6 marks entered.")).toBeInTheDocument();
  });

  it("fills a column of names pasted into the first name box", async () => {
    const { user } = setup();
    await user.click(nameBox(1));
    await user.paste("Sara Khan\nHamza Raza\nAyesha Malik");
    expect(nameBox(1)).toHaveValue("Sara Khan");
    expect(nameBox(3)).toHaveValue("Ayesha Malik");
  });

  it("fills names and marks together when two spreadsheet columns are pasted into a name box", async () => {
    const { user } = setup();
    await user.click(nameBox(1));
    await user.paste("Sara Khan\t94\nHamza Raza\t91\nAyesha Malik\t86\n");
    expect(nameBox(2)).toHaveValue("Hamza Raza");
    expect(markBox(2)).toHaveValue("91");
    await calculate(user);
    expect(stat("Highest mark")).toHaveTextContent("Sara Khan");
    expect(screen.getByText("90.33", { selector: "span" })).toBeInTheDocument();
  });

  it("stops a huge paste at 200 rows and says so", async () => {
    const { user } = setup();
    await user.click(markBox(1));
    await user.paste(Array(250).fill("1").join("\n"));
    expect(rowCount()).toBe(200);
    expect(screen.getByRole("status")).toHaveTextContent(/only the first 200 pasted lines/i);
    expect(screen.getByRole("button", { name: /add a row/i })).toBeDisabled();
  });

  it("never cuts an over-long pasted mark or name silently: it is kept and reported", async () => {
    const { user } = setup();
    const longMark = "9834981397568713565461546154615691586158915861591598158915";
    await user.click(markBox(1));
    await user.paste(longMark);
    expect(markBox(1)).toHaveValue(longMark);
    await user.click(nameBox(2));
    await user.paste("N".repeat(80));
    expect(nameBox(2)).toHaveValue("N".repeat(80));
    await user.type(markBox(2), "50");
    await calculate(user);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/marks for No\. 1 are too long/i);
    expect(alert).toHaveTextContent(/name for No\. 2 is too long/i);
  });

  it("shows the average as a percentage when a maximum mark is given", async () => {
    const { user } = setup();
    await fill(user, [["", "30"], ["", "40"], ["", "50"]]);
    await user.type(screen.getByLabelText(/maximum mark/i), "50");
    await calculate(user);
    expect(stat("Average as a percentage")).toHaveTextContent("80%");
  });

  it("names the student with a bad mark, flags the box and moves focus to the error", async () => {
    const { user } = setup();
    await fill(user, [["Sara", "70"], ["Bilal Ahmed", "absent"], ["Hira", "80"]]);
    await calculate(user);
    expect(screen.getByRole("alert")).toHaveTextContent(/Bilal Ahmed \(No\. 2\) must be a number/);
    expect(screen.getByRole("alert")).toHaveFocus();
    expect(markBox(2)).toHaveAttribute("aria-invalid", "true");
    expect(markBox(1)).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText("Class average")).not.toBeInTheDocument();
  });

  it("asks for at least one mark when every mark is empty, even with names entered", async () => {
    const { user } = setup();
    await calculate(user);
    expect(screen.getByRole("alert")).toHaveTextContent(/at least one mark/i);
    await user.type(nameBox(1), "Sara");
    await calculate(user);
    expect(screen.getByRole("alert")).toHaveTextContent(/at least one mark/i);
  });

  it("rejects a mark above the maximum mark", async () => {
    const { user } = setup();
    await fill(user, [["Sara", "30"], ["Hira", "60"]]);
    await user.type(screen.getByLabelText(/maximum mark/i), "50");
    await calculate(user);
    expect(screen.getAllByText(/Hira \(No\. 2\) cannot be more than the maximum mark of 50/).length).toBeGreaterThan(0);
  });

  it("adds one row at a time with Add a row", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /add a row/i }));
    expect(rowCount()).toBe(6);
    await user.click(screen.getByRole("button", { name: /add a row/i }));
    expect(rowCount()).toBe(7);
  });

  it("deletes the chosen row with its name, renumbers the rest and keeps the cursor in place", async () => {
    const { user } = setup();
    await fill(user, [["Sara", "70"], ["Hamza", "80"], ["Hira", "90"]]);
    await user.click(screen.getByRole("button", { name: "Delete row 2" }));
    expect(rowCount()).toBe(4);
    expect(nameBox(2)).toHaveValue("Hira");
    expect(markBox(2)).toHaveValue("90");
    expect(nameBox(2)).toHaveFocus();
    await calculate(user);
    expect(stat("Students")).toHaveTextContent("2");
    expect(screen.getByText("80", { selector: "span" })).toBeInTheDocument();
  });

  it("clears the old result and errors when a row is deleted, and always keeps one row", async () => {
    const { user } = setup();
    await fill(user, [["Sara", "70"], ["Hamza", "absent"]]);
    await calculate(user);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete row 2" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole("button", { name: "Delete row 1" }));
    }
    expect(rowCount()).toBe(1);
    expect(screen.getByRole("button", { name: "Delete row 1" })).toBeDisabled();
  });

  it("clears an old result when an input changes, and Reset clears everything", async () => {
    const { user } = setup();
    await fill(user, [["Sara", "70"], ["Hamza", "80"]]);
    await calculate(user);
    expect(screen.getByText("Class average")).toBeInTheDocument();
    await user.type(nameBox(3), "Hira");
    expect(screen.queryByText("Class average")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add a row/i }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(rowCount()).toBe(5);
    expect(nameBox(1)).toHaveValue("");
    expect(markBox(1)).toHaveValue("");
    expect(screen.getByText("No marks entered yet.")).toBeInTheDocument();
  });
});