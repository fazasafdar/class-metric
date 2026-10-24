import { isBlank, ok, parseFields, parseNumber, type Result } from "../validation/numbers";
import { round } from "../format";

export interface AttendanceResult {
  percentage: number;
  attended: number;
  total: number;
  missed: number;
  target?: {
    percentage: number;
    status: "met" | "reachable" | "impossible";
    /** If status is "reachable": extra classes to attend in a row. */
    classesNeeded?: number;
    /** If status is "met": extra classes that could still be missed. */
    classesCanMiss?: number;
  };
}

/**
 * Attendance % = attended / total x 100.
 *
 * Target maths (all future classes counted):
 * - To reach target t by attending x more classes in a row:
 *     (attended + x) / (total + x) >= t/100  =>  x >= (t x total - 100 x attended) / (100 - t)
 * - To stay at or above t while missing m more classes:
 *     attended / (total + m) >= t/100  =>  m <= 100 x attended / t - total
 */
export function calculateAttendance(input: {
  attended: string;
  total: string;
  target: string;
}): Result<AttendanceResult> {
  const parsed = parseFields(
    {
      attended: { label: "Classes attended", min: 0, integer: true },
      total: { label: "Total classes held", positive: true, integer: true },
    },
    input,
  );
  const errors: Record<string, string> = parsed.ok ? {} : { ...parsed.errors };

  let target: number | undefined;
  if (!isBlank(input.target)) {
    const t = parseNumber(input.target, { label: "Target attendance", min: 0, max: 100 });
    if ("error" in t) errors.target = t.error;
    else target = t.value;
  }

  if (parsed.ok && parsed.value.attended > parsed.value.total) {
    errors.attended = "Classes attended cannot be more than the total classes held.";
  }
  if (Object.keys(errors).length > 0 || !parsed.ok) return { ok: false, errors };

  const { attended, total } = parsed.value;
  const percentage = round((attended / total) * 100);
  const result: AttendanceResult = {
    percentage,
    attended,
    total,
    missed: total - attended,
  };

  if (target !== undefined) {
    const exact = (attended / total) * 100; // unrounded, so the decision is never wrong by rounding
    if (exact >= target) {
      result.target = {
        percentage: target,
        status: "met",
        classesCanMiss:
          target === 0 ? undefined : Math.max(0, Math.floor((100 * attended) / target - total + 1e-9)),
      };
    } else if (target >= 100) {
      // Already missed a class, so 100% can never be reached again.
      result.target = { percentage: target, status: "impossible" };
    } else {
      const needed = Math.ceil((target * total - 100 * attended) / (100 - target) - 1e-9);
      result.target = { percentage: target, status: "reachable", classesNeeded: needed };
    }
  }
  return ok(result);
}