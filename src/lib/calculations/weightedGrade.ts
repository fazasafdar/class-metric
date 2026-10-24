import { ok, parseNumber, type Result } from "../validation/numbers";
import { fmt, round } from "../format";

export interface WeightedRowInput {
  name: string;
  score: string;
  outOf: string;
  weight: string;
}

export interface WeightedRowResult {
  name: string;
  percentage: number;
  weight: number;
  /** Points this component adds to the final percentage. */
  contribution: number;
}

export interface WeightedGradeResult {
  finalPercentage: number;
  totalWeight: number;
  rows: WeightedRowResult[];
}

/** Weights may differ from 100 by this much (so 33.33 + 33.33 + 33.34 and 33.33 x 3 both work). */
export const WEIGHT_TOLERANCE = 0.05;

/**
 * Final % = sum(score / outOf x 100 x weight) / sum(weights)
 * Weights must total 100 (within a tiny tolerance).
 * Errors are keyed "<rowIndex>.<field>" so the UI can show them next to the right input.
 */
export function calculateWeightedGrade(
  rows: WeightedRowInput[],
): Result<WeightedGradeResult> {
  if (rows.length === 0) {
    return { ok: false, errors: { form: "Add at least one assessment." } };
  }

  const errors: Record<string, string> = {};
  const parsedRows: { name: string; pct: number; weight: number }[] = [];

  rows.forEach((row, i) => {
    const n = `assessment ${i + 1}`;
    const outOf = parseNumber(row.outOf, { label: `Out of (${n})`, positive: true });
    const weight = parseNumber(row.weight, { label: `Weight (${n})`, min: 0, max: 100 });
    const score = parseNumber(row.score, { label: `Score (${n})`, min: 0 });

    if ("error" in outOf) errors[`${i}.outOf`] = outOf.error;
    if ("error" in weight) errors[`${i}.weight`] = weight.error;
    if ("error" in score) errors[`${i}.score`] = score.error;
    else if (!("error" in outOf) && score.value > outOf.value) {
      errors[`${i}.score`] = `Score (${n}) cannot be more than ${fmt(outOf.value)}, the total it is marked out of.`;
    }

    if (!("error" in outOf) && !("error" in weight) && !("error" in score)) {
      parsedRows.push({
        name: row.name.trim() || `Assessment ${i + 1}`,
        pct: (score.value / outOf.value) * 100,
        weight: weight.value,
      });
    }
  });

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const totalWeight = parsedRows.reduce((sum, r) => sum + r.weight, 0);
  const difference = round(totalWeight - 100, 6);
  if (Math.abs(difference) > WEIGHT_TOLERANCE) {
    const advice =
      difference < 0
        ? `Add ${fmt(-difference)}% more weight.`
        : `Remove ${fmt(difference)}% of weight.`;
    return {
      ok: false,
      errors: {
        weights: `Weights add up to ${fmt(totalWeight)}%, but they must total 100%. ${advice}`,
      },
    };
  }

  const finalPercentage = parsedRows.reduce((sum, r) => sum + r.pct * r.weight, 0) / totalWeight;
  return ok({
    finalPercentage: round(finalPercentage),
    totalWeight: round(totalWeight),
    rows: parsedRows.map((r) => ({
      name: r.name,
      percentage: round(r.pct),
      weight: r.weight,
      contribution: round((r.pct * r.weight) / totalWeight),
    })),
  });
}