"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { Field } from "@/components/ui/Field";
import { BigResult, ResultArea, ResultCard, StatList } from "@/components/ui/Result";
import {
  calculateClassAverage,
  MAX_MARK_LENGTH,
  MAX_NAME_LENGTH,
  MAX_STUDENTS,
  type ClassAverageResult,
} from "@/lib/calculations/classAverage";
import { fmt } from "@/lib/format";

const START_ROWS = 5;

type Column = "name" | "mark";

interface Row {
  id: number;
  name: string;
  mark: string;
}

const makeRows = (firstId: number, count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({ id: firstId + i, name: "", mark: "" }));

/** "Sara", "Sara and Hamza", "Sara, Hamza and Hira", or "Sara, Hamza, Hira and 2 more". */
function formatNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length <= 3) return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`;
}

const GRID = "sm:grid-cols-[3rem_1fr_9rem_6.5rem]";

export function ClassAverageCalculator() {
  const [rows, setRows] = useState<Row[]>(() => makeRows(1, START_ROWS));
  const [maxMark, setMaxMark] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ClassAverageResult | null>(null);
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);
  const nextId = useRef(START_ROWS + 1);
  const tableRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<{ index: number; column: Column } | null>(null);

  const entered = rows.filter((r) => r.mark.trim() !== "").length;
  const atLimit = rows.length >= MAX_STUDENTS;

  /** After rows are added or removed, move the cursor to the box we asked for. */
  useEffect(() => {
    if (pendingFocus.current === null) return;
    focusCell(pendingFocus.current.index, pendingFocus.current.column);
    pendingFocus.current = null;
  }, [rows]);

  function focusCell(index: number, column: Column) {
    tableRef.current
      ?.querySelector<HTMLInputElement>(`input[data-cell="${index}:${column}"]`)
      ?.focus();
  }

  function clearOutcome(removeKeys: string[] = []) {
    setResult(null);
    setErrors((current) => {
      const next = { ...current };
      for (const key of removeKeys) delete next[key];
      delete next.marks;
      return next;
    });
  }

  function updateRow(index: number, column: Column, value: string) {
    setRows((current) => current.map((r, i) => (i === index ? { ...r, [column]: value } : r)));
    setNotice("");
    clearOutcome([`${column}.${index}`]);
  }

  function addRows(count: number) {
    const toAdd = Math.min(count, MAX_STUDENTS - rows.length);
    if (toAdd <= 0) return;
    setRows([...rows, ...makeRows(nextId.current, toAdd)]);
    nextId.current += toAdd;
  }

  function deleteRow(index: number) {
    if (rows.length <= 1) return;
    pendingFocus.current = { index: Math.min(index, rows.length - 2), column: "name" };
    setRows(rows.filter((_, i) => i !== index));
    setNotice("");
    setErrors({});
    setResult(null);
  }

  /** Enter moves across the row (name, then marks) and then down to the next student's name. */
  function handleKeyDown(index: number, column: Column, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (column === "name") {
      focusCell(index, "mark");
    } else if (index + 1 < rows.length) {
      focusCell(index + 1, "name");
    } else if (!atLimit) {
      pendingFocus.current = { index: index + 1, column: "name" };
      addRows(1);
    }
  }

  /**
   * Pasting several lines fills this column downward, adding rows when needed.
   * Pasting two spreadsheet columns (name and marks, separated by a tab) into a name
   * box fills both. Over-long text is never cut silently: it is kept whole so the
   * "too long" error can show.
   */
  function handlePaste(index: number, column: Column, event: React.ClipboardEvent<HTMLInputElement>) {
    const lines = event.clipboardData.getData("text").replace(/\r/g, "").split("\n");
    while (lines.length > 1 && lines[lines.length - 1].trim() === "") lines.pop();
    const hasTabs = lines.some((line) => line.includes("\t"));

    if (lines.length === 1 && !hasTabs) {
      const only = lines[0].trim();
      const limit = column === "name" ? MAX_NAME_LENGTH : MAX_MARK_LENGTH;
      if (only.length <= limit) return; // short single value: paste normally
      event.preventDefault();
      updateRow(index, column, only);
      return;
    }

    event.preventDefault();
    const used = lines.slice(0, MAX_STUDENTS - index);
    const extra = makeRows(nextId.current, Math.max(0, index + used.length - rows.length));
    nextId.current += extra.length;
    const next = [...rows, ...extra];
    used.forEach((line, k) => {
      const cells = line.split("\t");
      const target = next[index + k];
      next[index + k] =
        column === "name"
          ? { ...target, name: cells[0].trim(), ...(cells.length > 1 ? { mark: cells[1].trim() } : {}) }
          : { ...target, mark: cells[0].trim() };
    });
    setRows(next);
    setNotice(
      used.length < lines.length
        ? `Only the first ${used.length} pasted lines were added, because the limit is ${MAX_STUDENTS} rows.`
        : "",
    );
    clearOutcome();
    setErrors({});
  }

  function reset() {
    nextId.current = START_ROWS + 1;
    setRows(makeRows(1, START_ROWS));
    setMaxMark("");
    setErrors({});
    setResult(null);
    setNotice("");
    setAttempt(0);
  }

  function calculate(event: React.FormEvent) {
    event.preventDefault();
    const r = calculateClassAverage({
      students: rows.map(({ name, mark }) => ({ name, mark })),
      maxMark,
    });
    if (r.ok) {
      setErrors({});
      setResult(r.value);
    } else {
      setErrors(r.errors);
      setResult(null);
      setAttempt((n) => n + 1);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <form onSubmit={calculate} noValidate className="space-y-5">
        <p className="text-sm text-muted">
          Enter each student&rsquo;s name (optional) and marks. Leave a row empty to skip it. Press
          Enter to move along, or copy the name and marks columns from a spreadsheet and paste them
          into the first name box. Use a dot for decimals, like 85.5. Names stay on your device and
          are never sent anywhere.
        </p>

        {Object.keys(errors).length > 0 ? (
          <ErrorSummary key={attempt} messages={Object.values(errors)} />
        ) : null}

        <div>
          <div ref={tableRef} className="space-y-3 sm:space-y-2">
            <div
              aria-hidden="true"
              className={`hidden gap-3 text-sm font-semibold text-muted sm:grid ${GRID}`}
            >
              <span>No.</span>
              <span>Student name (optional)</span>
              <span>Marks obtained</span>
              <span />
            </div>
            {rows.map((row, index) => {
              const number = index + 1;
              return (
                <div
                  key={row.id}
                  role="group"
                  aria-label={`No. ${number}`}
                  className={`grid grid-cols-[1fr_auto] gap-x-3 gap-y-3 rounded-lg border border-line p-3 sm:gap-y-0 sm:rounded-none sm:border-0 sm:p-0 ${GRID}`}
                >
                  <p
                    aria-hidden="true"
                    className="col-start-1 row-start-1 font-semibold text-ink sm:pt-5"
                  >
                    No. {number}
                  </p>
                  <div className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
                    <Field
                      label="Student name (optional)"
                      hiddenLabelSuffix={`for No. ${number}`}
                      labelClassName="sm:sr-only"
                      inputMode="text"
                      maxLength={MAX_NAME_LENGTH}
                      value={row.name}
                      onChange={(v) => updateRow(index, "name", v)}
                      onKeyDown={(e) => handleKeyDown(index, "name", e)}
                      onPaste={(e) => handlePaste(index, "name", e)}
                      dataCell={`${index}:name`}
                      error={errors[`name.${index}`]}
                    />
                  </div>
                  <div className="col-span-2 row-start-3 sm:col-span-1 sm:col-start-3 sm:row-start-1">
                    <Field
                      label="Marks obtained"
                      hiddenLabelSuffix={`for No. ${number}`}
                      labelClassName="sm:sr-only"
                      maxLength={MAX_MARK_LENGTH}
                      value={row.mark}
                      onChange={(v) => updateRow(index, "mark", v)}
                      onKeyDown={(e) => handleKeyDown(index, "mark", e)}
                      onPaste={(e) => handlePaste(index, "mark", e)}
                      dataCell={`${index}:mark`}
                      error={errors[`mark.${index}`]}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteRow(index)}
                    disabled={rows.length === 1}
                    aria-label={`Delete row ${number}`}
                    className="col-start-2 row-start-1 min-h-9 justify-self-end rounded px-2 text-sm font-semibold text-danger underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline sm:col-start-4 sm:min-h-12 sm:self-start sm:justify-self-start sm:mt-1.5"
                  >
                    Delete row
                  </button>
                </div>
              );
            })}
          </div>
          {errors.marks ? (
            <p className="mt-3 text-sm font-medium text-danger">
              <span className="sr-only">Error: </span>
              {errors.marks}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Button variant="secondary" onClick={() => addRows(1)} disabled={atLimit}>
              Add a row
            </Button>
            <p className="text-sm text-muted">
              {entered === 0
                ? "No marks entered yet."
                : `${entered} ${entered === 1 ? "mark" : "marks"} entered.`}
              {atLimit ? ` You have reached the limit of ${MAX_STUDENTS} rows.` : ""}
            </p>
          </div>
          {notice ? (
            <p role="status" className="mt-2 text-sm font-medium text-ink">
              {notice}
            </p>
          ) : null}
        </div>

        <div className="sm:max-w-xs">
          <Field
            label="Maximum mark (optional)"
            hint="The most a student could score, such as 100. Marks above it are rejected."
            maxLength={12}
            value={maxMark}
            onChange={(v) => {
              setMaxMark(v);
              clearOutcome(["maxMark"]);
            }}
            error={errors.maxMark}
            placeholder="e.g. 100"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1 sm:flex-none">
            Calculate
          </Button>
          <Button variant="secondary" onClick={reset} className="flex-1 sm:flex-none">
            Reset
          </Button>
        </div>
      </form>

      <ResultArea>
        {result ? (
          <ResultCard>
            <BigResult label="Class average" value={fmt(result.average)} />
            <StatList
              items={[
                {
                  label: "Students",
                  value: String(result.count),
                  detail:
                    result.withoutMark > 0
                      ? `${result.withoutMark} ${result.withoutMark === 1 ? "student" : "students"} without a mark, left out`
                      : undefined,
                },
                { label: "Highest mark", value: fmt(result.highest), detail: formatNames(result.highestBy) },
                { label: "Lowest mark", value: fmt(result.lowest), detail: formatNames(result.lowestBy) },
                ...(result.averagePercentage !== undefined
                  ? [{ label: "Average as a percentage", value: `${fmt(result.averagePercentage)}%` }]
                  : []),
              ]}
            />
          </ResultCard>
        ) : null}
      </ResultArea>
    </div>
  );
}