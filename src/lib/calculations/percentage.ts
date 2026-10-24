import { fail, ok, parseFields, type Result } from "../validation/numbers";
import { round } from "../format";

/** Percentage = obtained / total x 100 */
export function percentageFromMarks(input: {
  obtained: string;
  total: string;
}): Result<{ percentage: number }> {
  const parsed = parseFields(
    {
      obtained: { label: "Marks obtained", min: 0 },
      total: { label: "Total marks", positive: true },
    },
    input,
  );
  if (!parsed.ok) return parsed;
  const { obtained, total } = parsed.value;
  if (obtained > total) {
    return fail("obtained", "Marks obtained cannot be more than the total marks.");
  }
  return ok({ percentage: round((obtained / total) * 100) });
}

/** Marks = percentage / 100 x total */
export function marksFromPercentage(input: {
  percentage: string;
  total: string;
}): Result<{ marks: number }> {
  const parsed = parseFields(
    {
      percentage: { label: "Percentage", min: 0, max: 100 },
      total: { label: "Total marks", positive: true },
    },
    input,
  );
  if (!parsed.ok) return parsed;
  const { percentage, total } = parsed.value;
  return ok({ marks: round((percentage / 100) * total) });
}

export type ChangeDirection = "increase" | "decrease" | "none";

/** Percentage change = (new - old) / old x 100 */
export function percentageChange(input: {
  before: string;
  after: string;
}): Result<{ change: number; direction: ChangeDirection }> {
  const parsed = parseFields(
    {
      before: { label: "Earlier score", positive: true },
      after: { label: "Later score", min: 0 },
    },
    input,
  );
  if (!parsed.ok) {
    // A zero starting value gets a clearer explanation than "must be greater than 0".
    if (parsed.errors.before && input.before.trim() !== "" && Number(input.before) === 0) {
      parsed.errors.before =
        "The earlier score cannot be 0, because a percentage change from 0 is not defined.";
    }
    return parsed;
  }
  const { before, after } = parsed.value;
  const change = round(((after - before) / before) * 100);
  const direction: ChangeDirection = change > 0 ? "increase" : change < 0 ? "decrease" : "none";
  return ok({ change, direction });
}