"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { Field } from "@/components/ui/Field";
import { BigResult, ResultArea, ResultCard, StatList } from "@/components/ui/Result";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  marksFromPercentage,
  percentageChange,
  percentageFromMarks,
  type ChangeDirection,
} from "@/lib/calculations/percentage";
import { fmt, round } from "@/lib/format";

type Mode = "percentage" | "marks" | "change";

const MODES: { value: Mode; label: string }[] = [
  { value: "percentage", label: "Find the percentage" },
  { value: "marks", label: "Find the marks" },
  { value: "change", label: "Find the change" },
];

const EMPTY = { obtained: "", total: "", percentage: "", before: "", after: "" };
type Values = typeof EMPTY;
type Errors = Record<string, string>;

type Outcome =
  | { kind: "percentage"; percentage: number; obtained: number; total: number }
  | { kind: "marks"; marks: number; percentage: number; total: number }
  | { kind: "change"; change: number; direction: ChangeDirection; before: number; after: number };

const CHANGE_LABEL: Record<ChangeDirection, string> = {
  increase: "Percentage increase",
  decrease: "Percentage decrease",
  none: "No change",
};

export function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("percentage");
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [attempt, setAttempt] = useState(0);

  /** Editing an input clears its error and any old result, so a result never disagrees with the inputs. */
  function update(key: keyof Values) {
    return (value: string) => {
      setValues((v) => ({ ...v, [key]: value }));
      setOutcome(null);
      setErrors((e) => {
        if (!(key in e)) return e;
        const next = { ...e };
        delete next[key];
        return next;
      });
    };
  }

  function changeMode(next: Mode) {
    setMode(next);
    setErrors({});
    setOutcome(null);
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setOutcome(null);
    setAttempt(0);
  }

  function calculate(event: React.FormEvent) {
    event.preventDefault();
    const num = (s: string) => Number(s.trim());

    if (mode === "percentage") {
      const r = percentageFromMarks(values);
      if (r.ok) {
        setErrors({});
        setOutcome({
          kind: "percentage",
          percentage: r.value.percentage,
          obtained: num(values.obtained),
          total: num(values.total),
        });
        return;
      }
      return showErrors(r.errors);
    }

    if (mode === "marks") {
      const r = marksFromPercentage(values);
      if (r.ok) {
        setErrors({});
        setOutcome({
          kind: "marks",
          marks: r.value.marks,
          percentage: num(values.percentage),
          total: num(values.total),
        });
        return;
      }
      return showErrors(r.errors);
    }

    const r = percentageChange(values);
    if (r.ok) {
      setErrors({});
      setOutcome({
        kind: "change",
        change: r.value.change,
        direction: r.value.direction,
        before: num(values.before),
        after: num(values.after),
      });
      return;
    }
    showErrors(r.errors);
  }

  function showErrors(next: Errors) {
    setErrors(next);
    setOutcome(null);
    setAttempt((n) => n + 1);
  }

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <form onSubmit={calculate} noValidate className="space-y-5">
        <SegmentedControl
          legend="What do you want to find?"
          options={MODES}
          value={mode}
          onChange={changeMode}
        />

        {Object.keys(errors).length > 0 ? (
          <ErrorSummary key={attempt} messages={Object.values(errors)} />
        ) : null}

        {mode === "percentage" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Marks obtained"
              hint="The marks the student scored."
              value={values.obtained}
              maxLength={12}
              onChange={update("obtained")}
              error={errors.obtained}
              placeholder="e.g. 42"
            />
            <Field
              label="Total marks"
              hint="The most marks that were available."
              value={values.total}
              maxLength={12}
              onChange={update("total")}
              error={errors.total}
              placeholder="e.g. 50"
            />
          </div>
        ) : null}

        {mode === "marks" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Percentage"
              hint="A number from 0 to 100."
              suffix="%"
              value={values.percentage}
              maxLength={7}
              onChange={update("percentage")}
              error={errors.percentage}
              placeholder="e.g. 85"
            />
            <Field
              label="Total marks"
              hint="The most marks that were available."
              value={values.total}
              maxLength={12}
              onChange={update("total")}
              error={errors.total}
              placeholder="e.g. 60"
            />
          </div>
        ) : null}

        {mode === "change" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Earlier score"
              hint="The first score, such as last term's result."
              value={values.before}
              maxLength={12}
              onChange={update("before")}
              error={errors.before}
              placeholder="e.g. 40"
            />
            <Field
              label="Later score"
              hint="The newer score to compare with it."
              value={values.after}
              maxLength={12}
              onChange={update("after")}
              error={errors.after}
              placeholder="e.g. 50"
            />
          </div>
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
        {outcome ? <Result outcome={outcome} /> : null}
      </ResultArea>
    </div>
  );
}

function Result({ outcome }: { outcome: Outcome }) {
  if (outcome.kind === "percentage") {
    return (
      <ResultCard>
        <BigResult label="Percentage" value={`${fmt(outcome.percentage)}%`} />
        <StatList
          items={[
            { label: "Marks obtained", value: fmt(outcome.obtained) },
            { label: "Total marks", value: fmt(outcome.total) },
            { label: "Marks lost", value: fmt(round(outcome.total - outcome.obtained)) },
          ]}
        />
      </ResultCard>
    );
  }
  if (outcome.kind === "marks") {
    return (
      <ResultCard>
        <BigResult
          label="Marks obtained"
          value={`${fmt(outcome.marks)} out of ${fmt(outcome.total)}`}
        />
        <StatList
          items={[
            { label: "Percentage", value: `${fmt(outcome.percentage)}%` },
            { label: "Total marks", value: fmt(outcome.total) },
          ]}
        />
      </ResultCard>
    );
  }
  return (
    <ResultCard>
      <BigResult
        label={CHANGE_LABEL[outcome.direction]}
        value={`${fmt(Math.abs(outcome.change))}%`}
      />
      <StatList
        items={[
          { label: "Earlier score", value: fmt(outcome.before) },
          { label: "Later score", value: fmt(outcome.after) },
          { label: "Difference", value: fmt(round(outcome.after - outcome.before)) },
        ]}
      />
    </ResultCard>
  );
}