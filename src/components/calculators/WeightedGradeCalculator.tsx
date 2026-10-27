"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { Field } from "@/components/ui/Field";
import { BigResult, ResultArea, ResultCard } from "@/components/ui/Result";
import {
  calculateWeightedGrade,
  WEIGHT_TOLERANCE,
  type WeightedGradeResult,
} from "@/lib/calculations/weightedGrade";
import { fmt, round } from "@/lib/format";
import { parseNumber } from "@/lib/validation/numbers";

const MAX_ROWS = 20;
const STARTING_ROWS = 3;

interface Row {
  id: number;
  name: string;
  score: string;
  outOf: string;
  weight: string;
}
type RowField = "name" | "score" | "outOf" | "weight";

const newRow = (id: number): Row => ({ id, name: "", score: "", outOf: "100", weight: "" });
const startingRows = () => Array.from({ length: STARTING_ROWS }, (_, i) => newRow(i + 1));

/** Adds up the weights typed so far, ignoring anything that is not a valid number yet. */
function sumWeights(rows: Row[]): number {
  const total = rows.reduce((sum, row) => {
    const parsed = parseNumber(row.weight, { label: "Weight" });
    return "value" in parsed ? sum + parsed.value : sum;
  }, 0);
  return round(total, 6);
}

export function WeightedGradeCalculator() {
  const [rows, setRows] = useState<Row[]>(startingRows);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<WeightedGradeResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const nextId = useRef(STARTING_ROWS + 1);

  const total = sumWeights(rows);
  const weightsOk = Math.abs(total - 100) <= WEIGHT_TOLERANCE;

  function updateRow(id: number, index: number, field: RowField, value: string) {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setResult(null);
    setErrors((current) => {
      const next = { ...current };
      delete next[`${index}.${field}`];
      delete next.weights;
      return next;
    });
  }

  function addRow() {
    if (rows.length >= MAX_ROWS) return;
    setRows((current) => [...current, newRow(nextId.current++)]);
    setErrors({});
    setResult(null);
  }

  function removeRow(id: number) {
    setRows((current) => current.filter((r) => r.id !== id));
    setErrors({});
    setResult(null);
  }

  function reset() {
    nextId.current = STARTING_ROWS + 1;
    setRows(startingRows());
    setErrors({});
    setResult(null);
    setAttempt(0);
  }

  function calculate(event: React.FormEvent) {
    event.preventDefault();
    const r = calculateWeightedGrade(rows);
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
          Add each assessment with the score, what it was marked out of, and how much it counts
          towards the final grade. The weights must total 100%.
        </p>

        {Object.keys(errors).length > 0 ? (
          <ErrorSummary key={attempt} messages={Object.values(errors)} />
        ) : null}

        <div className="space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.id}
              role="group"
              aria-labelledby={`assessment-${row.id}-title`}
              className="rounded-lg border border-line p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p id={`assessment-${row.id}-title`} className="font-semibold text-ink">
                  Assessment {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  aria-label={`Remove assessment ${index + 1}`}
                  className="min-h-11 rounded-md px-3 text-sm font-semibold text-danger underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="col-span-full">
                  <Field
                    label="Name (optional)"
                    inputMode="text"
                    maxLength={30}
                    value={row.name}
                    onChange={(v) => updateRow(row.id, index, "name", v)}
                    placeholder="e.g. Midterm"
                  />
                </div>
                <Field
                  label="Score"
                  value={row.score}
                  onChange={(v) => updateRow(row.id, index, "score", v)}
                  error={errors[`${index}.score`]}
                  placeholder="e.g. 80"
                />
                <Field
                  label="Out of"
                  value={row.outOf}
                  onChange={(v) => updateRow(row.id, index, "outOf", v)}
                  error={errors[`${index}.outOf`]}
                />
                <div className="col-span-2 sm:col-span-1">
                  <Field
                    label="Weight"
                    suffix="%"
                    value={row.weight}
                    onChange={(v) => updateRow(row.id, index, "weight", v)}
                    error={errors[`${index}.weight`]}
                    placeholder="e.g. 20"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" onClick={addRow} disabled={rows.length >= MAX_ROWS}>
            Add assessment
          </Button>
          <p className={`text-sm font-semibold ${weightsOk ? "text-ink" : "text-muted"}`}>
            {weightsOk
              ? `Weights total ${fmt(total)}%.`
              : `Weights total ${fmt(total)}%. They must total 100%.`}
          </p>
        </div>
        {rows.length >= MAX_ROWS ? (
          <p className="text-sm text-muted">You can add up to {MAX_ROWS} assessments.</p>
        ) : null}

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
            <BigResult label="Final grade" value={`${fmt(result.finalPercentage)}%`} />
            <div className="mt-4 overflow-x-auto border-t border-line pt-4">
              <table className="w-full min-w[28rem] text-left text-sm">
                <caption className="sr-only">How each assessment contributes to the final grade</caption>
                <thead>
                  <tr className="text-muted">
                    <th scope="col" className="py-1 pr-3 font-semibold">Assessment</th>
                    <th scope="col" className="py-1 pr-3 font-semibold">Result</th>
                    <th scope="col" className="py-1 pr-3 font-semibold">Weight</th>
                    <th scope="col" className="py-1 font-semibold">Adds to final grade</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, index) => (
                    <tr key={index} className="border-t border-line">
                      <th scope="row" className="max-w-48 py-2 pr-3 font-semibold wrap-break-word text-ink">{row.name}</th>
                      <td className="py-2 pr-3">{fmt(row.percentage)}%</td>
                      <td className="py-2 pr-3">{fmt(row.weight)}%</td>
                      <td className="py-2">{fmt(row.contribution)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ResultCard>
        ) : null}
      </ResultArea>
    </div>
  );
}