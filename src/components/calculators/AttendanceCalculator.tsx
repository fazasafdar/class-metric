"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { Field } from "@/components/ui/Field";
import { BigResult, ResultArea, ResultCard, StatList } from "@/components/ui/Result";
import { calculateAttendance, type AttendanceResult } from "@/lib/calculations/attendance";
import { fmt } from "@/lib/format";

const EMPTY = { attended: "", total: "", target: "" };
type Values = typeof EMPTY;

const moreClasses = (n: number) => `${n} more ${n === 1 ? "class" : "classes"}`;

function targetMessage(target: NonNullable<AttendanceResult["target"]>): string {
  const t = `${fmt(target.percentage)}%`;
  if (target.status === "impossible") {
    return `A target of ${t} can no longer be reached, because at least one class has already been missed.`;
  }
  if (target.status === "reachable") {
    const n = target.classesNeeded ?? 0;
    return n === 1
      ? `To reach ${t}, you would need to attend the next class.`
      : `To reach ${t}, you would need to attend the next ${n} classes in a row, without missing any.`;
  }
  const spare = target.classesCanMiss;
  if (spare === undefined) return `You have reached your ${t} target.`;
  return spare === 0
    ? `You have reached your ${t} target. Missing any more classes would take you below it.`
    : `You have reached your ${t} target. You could miss up to ${moreClasses(spare)} and stay at or above it.`;
}

export function AttendanceCalculator() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  /** Editing an input clears its error and any old result, so a result never disagrees with the inputs. */
  function update(key: keyof Values) {
    return (value: string) => {
      setValues((v) => ({ ...v, [key]: value }));
      setResult(null);
      setErrors((e) => {
        if (!(key in e)) return e;
        const next = { ...e };
        delete next[key];
        return next;
      });
    };
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setResult(null);
    setAttempt(0);
  }

  function calculate(event: React.FormEvent) {
    event.preventDefault();
    const r = calculateAttendance(values);
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
        {Object.keys(errors).length > 0 ? (
          <ErrorSummary key={attempt} messages={Object.values(errors)} />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Classes attended"
            hint="A whole number. It can be 0."
            inputMode="numeric"
            value={values.attended}
            maxLength={6}
            onChange={update("attended")}
            error={errors.attended}
            placeholder="e.g. 18"
          />
          <Field
            label="Total classes held"
            hint="All classes held so far."
            inputMode="numeric"
            value={values.total}
            maxLength={6}
            onChange={update("total")}
            error={errors.total}
            placeholder="e.g. 20"
          />
        </div>
        <Field
          label="Target attendance (optional)"
          hint="A percentage from 0 to 100, such as 90. Leave blank to skip."
          suffix="%"
          value={values.target}
          maxLength={6}
          onChange={update("target")}
          error={errors.target}
          placeholder="e.g. 90"
        />

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
            <BigResult label="Attendance" value={`${fmt(result.percentage)}%`} />
            <StatList
              items={[
                { label: "Classes attended", value: String(result.attended) },
                { label: "Classes missed", value: String(result.missed) },
                { label: "Total classes", value: String(result.total) },
              ]}
            />
            {result.target ? (
              <p className="mt-4 border-t border-line pt-4 leading-relaxed">
                {targetMessage(result.target)}
              </p>
            ) : null}
          </ResultCard>
        ) : null}
      </ResultArea>
    </div>
  );
}