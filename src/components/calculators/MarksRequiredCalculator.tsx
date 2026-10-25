"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { Field } from "@/components/ui/Field";
import { BigResult, ResultArea, ResultCard, StatList } from "@/components/ui/Result";
import { calculateMarksRequired, type MarksRequiredResult } from "@/lib/calculations/marksRequired";
import { fmt, round } from "@/lib/format";
import { isBlank, parseNumber } from "@/lib/validation/numbers";

const EMPTY = {
  currentScore: "",
  currentWeight: "",
  remainingWeight: "",
  desiredFinal: "",
  remainingOutOf: "",
};
type Values = typeof EMPTY;

/** Adds up the two weights typed so far, ignoring anything that is not a valid number yet. */
function weightsTotal(values: Values): number {
  const total = [values.currentWeight, values.remainingWeight].reduce((sum, raw) => {
    const parsed = parseNumber(raw, { label: "Weight" });
    return "value" in parsed ? sum + parsed.value : sum;
  }, 0);
  return round(total, 6);
}

function weightsNote(values: Values): string {
  if (isBlank(values.currentWeight) && isBlank(values.remainingWeight)) {
    return "The two weights must total 100%.";
  }
  const total = weightsTotal(values);
  return Math.abs(total - 100) <= 0.05
    ? `The weights total ${fmt(total)}%.`
    : `The weights total ${fmt(total)}%. They must total 100%.`;
}

export function MarksRequiredCalculator() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MarksRequiredResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  /** Editing an input clears its error and any old result, so a result never disagrees with the inputs. */
  function update(key: keyof Values) {
    return (value: string) => {
      setValues((v) => ({ ...v, [key]: value }));
      setResult(null);
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        // The two weights are checked together, so editing either one clears that shared message.
        if (key === "currentWeight") delete next.remainingWeight;
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
    const r = calculateMarksRequired(values);
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
          Enter your result so far and how much each part of the course counts for. The calculator
          works out what you need on the remaining assessment to reach the final result you want.
        </p>

        {Object.keys(errors).length > 0 ? (
          <ErrorSummary key={attempt} messages={Object.values(errors)} />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Current result"
            hint="Your average so far on the work already marked, from 0 to 100."
            suffix="%"
            maxLength={7}
            value={values.currentScore}
            onChange={update("currentScore")}
            error={errors.currentScore}
            placeholder="e.g. 70"
          />
          <Field
            label="Weight already completed"
            hint="How much of the final result the marked work counts for."
            suffix="%"
            maxLength={6}
            value={values.currentWeight}
            onChange={update("currentWeight")}
            error={errors.currentWeight}
            placeholder="e.g. 60"
          />
          <Field
            label="Weight of the remaining assessment"
            hint="How much the last assessment counts for."
            suffix="%"
            maxLength={6}
            value={values.remainingWeight}
            onChange={update("remainingWeight")}
            error={errors.remainingWeight}
            placeholder="e.g. 40"
          />
          <Field
            label="Desired final result"
            hint="The overall result you are aiming for."
            suffix="%"
            maxLength={7}
            value={values.desiredFinal}
            onChange={update("desiredFinal")}
            error={errors.desiredFinal}
            placeholder="e.g. 75"
          />
        </div>
        <p className="text-sm font-semibold text-ink">{weightsNote(values)}</p>

        <div className="sm:max-w-xs">
          <Field
            label="Remaining assessment is out of (optional)"
            hint="The marks available, so the answer is also shown in marks."
            maxLength={12}
            value={values.remainingOutOf}
            onChange={update("remainingOutOf")}
            error={errors.remainingOutOf}
            placeholder="e.g. 50"
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

      <ResultArea>{result ? <Outcome result={result} /> : null}</ResultArea>
    </div>
  );
}

function Outcome({ result }: { result: MarksRequiredResult }) {
  const target = `${fmt(result.desiredFinal)}%`;
  const range = [
    { label: "Lowest possible final result", value: `${fmt(result.lowestPossibleFinal)}%` },
    { label: "Highest possible final result", value: `${fmt(result.highestPossibleFinal)}%` },
  ];

  if (result.status === "impossible") {
    return (
      <ResultCard>
        <p className="text-lg font-semibold text-ink">
          A final result of {target} cannot be reached.
        </p>
        <p className="mt-2 leading-relaxed">
          Even full marks on the remaining assessment would give a final result of{" "}
          {fmt(result.highestPossibleFinal)}%.
        </p>
        <StatList items={range} />
      </ResultCard>
    );
  }

  if (result.status === "secured") {
    return (
      <ResultCard>
        <BigResult label="Needed on the remaining assessment" value="0%" />
        <p className="mt-3 leading-relaxed">
          You have already reached your target of {target}. You would finish with at least that
          result even if you scored 0 on the remaining assessment.
        </p>
        <StatList items={range} />
      </ResultCard>
    );
  }

  return (
    <ResultCard>
      <BigResult
        label="You need at least this on the remaining assessment"
        value={`${fmt(result.requiredPercentage ?? 0)}%`}
      />
      <p className="mt-3 leading-relaxed">
        To finish with {target} overall
        {result.requiredMarks !== undefined && result.outOf !== undefined
          ? `, you need at least ${fmt(result.requiredMarks)} marks out of ${fmt(result.outOf)}`
          : ""}
        .
      </p>
      <StatList items={range} />
    </ResultCard>
  );
}