import { isBlank, ok, parseFields, parseNumber, type Result } from "../validation/numbers";
import { round, roundUp } from "../format";

export interface MarksRequiredResult {
  status: "needed" | "secured" | "impossible";
  /** Percentage needed on the remaining assessment (0 when secured). Undefined when impossible. */
  requiredPercentage?: number;
  /** Marks needed, if the remaining assessment total was given. */
  requiredMarks?: number;
  outOf?: number;
  /** Final result if everything remaining is scored 0 / scored 100. */
  lowestPossibleFinal: number;
  highestPossibleFinal: number;
  desiredFinal: number;
}

/**
 * Final = currentScore x currentWeight/100 + x x remainingWeight/100
 * Solve for x:  x = (desired x 100 - currentScore x currentWeight) / remainingWeight
 * Weights must total 100.
 */
export function calculateMarksRequired(input: {
  currentScore: string;
  currentWeight: string;
  remainingWeight: string;
  desiredFinal: string;
  remainingOutOf: string;
}): Result<MarksRequiredResult> {
  const parsed = parseFields(
    {
      currentScore: { label: "Current result", min: 0, max: 100 },
      currentWeight: { label: "Weight already completed", min: 0, max: 100 },
      remainingWeight: { label: "Weight of the remaining assessment", positive: true, max: 100 },
      desiredFinal: { label: "Desired final result", min: 0, max: 100 },
    },
    input,
  );
  const errors: Record<string, string> = parsed.ok ? {} : { ...parsed.errors };

  let outOf: number | undefined;
  if (!isBlank(input.remainingOutOf)) {
    const o = parseNumber(input.remainingOutOf, { label: "Remaining assessment total", positive: true });
    if ("error" in o) errors.remainingOutOf = o.error;
    else outOf = o.value;
  }

  if (parsed.ok) {
    const total = parsed.value.currentWeight + parsed.value.remainingWeight;
    if (Math.abs(total - 100) > 0.05) {
      errors.remainingWeight = `The two weights add up to ${round(total)}%, but they must total 100%. Check both weight fields.`;
    }
  }
  if (Object.keys(errors).length > 0 || !parsed.ok) return { ok: false, errors };

  const { currentScore, currentWeight, remainingWeight, desiredFinal } = parsed.value;
  const base = (currentScore * currentWeight) / 100;
  const lowestPossibleFinal = round(base);
  const highestPossibleFinal = round(base + remainingWeight);
  const required = ((desiredFinal - base) * 100) / remainingWeight;
  const common = { lowestPossibleFinal, highestPossibleFinal, desiredFinal };

  if (required > 100 + 1e-9) return ok({ status: "impossible", ...common });

  if (required <= 1e-9) {
    return ok({
      status: "secured",
      requiredPercentage: 0,
      ...(outOf !== undefined ? { requiredMarks: 0, outOf } : {}),
      ...common,
    });
  }

  const requiredPercentage = roundUp(Math.min(required, 100));
  return ok({
    status: "needed",
    requiredPercentage,
    ...(outOf !== undefined
      ? { requiredMarks: roundUp((Math.min(required, 100) / 100) * outOf), outOf }
      : {}),
    ...common,
  });
}