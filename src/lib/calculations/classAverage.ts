import { isBlank, ok, parseNumber, type Result } from "../validation/numbers";
import { fmt, round } from "../format";

/** Most students (rows) one calculation accepts. */
export const MAX_STUDENTS = 200;
/** Longest single mark accepted. Matches the 12-character limit on the screen's marks boxes. */
export const MAX_MARK_LENGTH = 12;
/** Longest student name accepted. Matches the limit on the screen's name boxes. */
export const MAX_NAME_LENGTH = 50;

export interface StudentInput {
  name: string;
  mark: string;
}

export interface ClassAverageResult {
  /** Number of students that have a mark. */
  count: number;
  average: number;
  highest: number;
  /** Who scored the highest mark: names, or "No. 3" when no name was entered. */
  highestBy: string[];
  lowest: number;
  lowestBy: string[];
  /** Students with a name but no mark. They are left out of every figure. */
  withoutMark: number;
  /** Set when a maximum mark was given. */
  maxMark?: number;
  /** Average as a percentage of the maximum mark. */
  averagePercentage?: number;
}

const clip = (text: string) => (text.length > 30 ? `${text.slice(0, 30)}...` : text);

/** How a student appears in an error message: "Sara Khan (No. 3)", or just "No. 3". */
function who(position: number, name: string): string {
  const trimmed = name.trim();
  return trimmed === "" ? `No. ${position}` : `${clip(trimmed)} (No. ${position})`;
}

/**
 * One entry per row on the screen.
 * - A row with neither a name nor a mark is ignored.
 * - A row with a name but no mark is counted as "without a mark" and left out of the figures.
 * Errors are keyed "mark.<rowIndex>" and "name.<rowIndex>" so the screen can show them
 * beside the right box.
 */
export function calculateClassAverage(input: {
  students: StudentInput[];
  maxMark: string;
}): Result<ClassAverageResult> {
  const errors: Record<string, string> = {};

  let maxMark: number | undefined;
  if (!isBlank(input.maxMark)) {
    const m = parseNumber(input.maxMark, { label: "Maximum mark", positive: true });
    if ("error" in m) errors.maxMark = m.error;
    else maxMark = m.value;
  }

  if (input.students.length > MAX_STUDENTS) {
    errors.marks = `You can enter up to ${MAX_STUDENTS} students in one calculation.`;
    return { ok: false, errors };
  }

  const entries: { position: number; name: string; value: number }[] = [];
  let withoutMark = 0;

  input.students.forEach((student, i) => {
    const position = i + 1;
    const hasName = !isBlank(student.name);

    if (hasName && student.name.trim().length > MAX_NAME_LENGTH) {
      errors[`name.${i}`] = `The name for No. ${position} is too long. A name can have up to ${MAX_NAME_LENGTH} characters.`;
    }

    if (isBlank(student.mark)) {
      if (hasName) withoutMark += 1;
      return;
    }

    const label = `Marks for ${who(position, student.name)}`;
    if (student.mark.trim().length > MAX_MARK_LENGTH) {
      errors[`mark.${i}`] = `The marks for ${who(position, student.name)} are too long. A mark can have up to ${MAX_MARK_LENGTH} characters.`;
      return;
    }
    const parsed = parseNumber(student.mark, { label, min: 0 });
    if ("error" in parsed) {
      errors[`mark.${i}`] = parsed.error;
    } else if (maxMark !== undefined && parsed.value > maxMark) {
      errors[`mark.${i}`] = `${label} cannot be more than the maximum mark of ${fmt(maxMark)}.`;
    } else {
      entries.push({ position, name: student.name.trim(), value: parsed.value });
    }
  });

  if (Object.keys(errors).length === 0 && entries.length === 0) {
    errors.marks = "Enter at least one mark.";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const values = entries.map((e) => e.value);
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const holders = (target: number) =>
    entries.filter((e) => e.value === target).map((e) => e.name || `No. ${e.position}`);

  return ok({
    count: entries.length,
    average: round(average),
    highest,
    highestBy: holders(highest),
    lowest,
    lowestBy: holders(lowest),
    withoutMark,
    ...(maxMark !== undefined
      ? { maxMark, averagePercentage: round((average / maxMark) * 100) }
      : {}),
  });
}