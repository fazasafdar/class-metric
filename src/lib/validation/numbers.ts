/**
 * Shared input parsing and validation.
 * Form values arrive as strings. Everything is parsed with a strict pattern
 * (no eval, no Number("") = 0 surprises, no "1e5" or "0x10" tricks).
 */

export type Ok<T> = { ok: true; value: T };
export type Fail = { ok: false; errors: Record<string, string> };
export type Result<T> = Ok<T> | Fail;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const fail = (field: string, message: string): Fail => ({
  ok: false,
  errors: { [field]: message },
});
/** Longest number text accepted. The input boxes stop at 20; this is a second line of defence. */
export const MAX_NUMBER_LENGTH = 30;

const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)$/;

export interface ParseSpec {
  /** Human label, used inside error messages, e.g. "Total marks". */
  label: string;
  min?: number;
  max?: number;
  /** Value must be greater than 0. */
  positive?: boolean;
  /** Value must be a whole number. */
  integer?: boolean;
}

export function isBlank(raw: string | undefined): boolean {
  return raw === undefined || raw.trim() === "";
}

/** Returns the parsed number, or an error message for the user. */
export function parseNumber(
  raw: string,
  spec: ParseSpec,
): { value: number } | { error: string } {
  const text = raw.trim();
  const name = spec.label.toLowerCase();
  if (text === "") return { error: `Enter a number for ${name}.` };
  if (text.length > MAX_NUMBER_LENGTH) {
    return { error: `${spec.label} is too long. Enter a number with fewer digits.` };
  }
  if (!NUMBER_PATTERN.test(text)) {
    return {
      error: `${spec.label} must be a number, like 12 or 12.5. Use a dot for decimals.`,
    };
  }
  const value = Number(text);
  if (!Number.isFinite(value)) return { error: `${spec.label} is too large.` };
  if (spec.integer && !Number.isInteger(value)) {
    return { error: `${spec.label} must be a whole number.` };
  }
  if (spec.positive && value <= 0) {
    return { error: `${spec.label} must be greater than 0.` };
  }
  if (spec.min !== undefined && value < spec.min) {
    return {
      error:
        spec.min === 0
          ? `${spec.label} cannot be negative.`
          : `${spec.label} cannot be less than ${spec.min}.`,
    };
  }
  if (spec.max !== undefined && value > spec.max) {
    return { error: `${spec.label} cannot be more than ${spec.max}.` };
  }
  // Normalise -0 to 0.
  return { value: value === 0 ? 0 : value };
}

/** Parses several named fields at once and reports every problem together. */
export function parseFields<K extends string>(
  specs: Record<K, ParseSpec>,
  raw: Record<NoInfer<K>, string>,
): Result<Record<K, number>> {
  const values = {} as Record<K, number>;
  const errors: Record<string, string> = {};
  for (const key of Object.keys(specs) as K[]) {
    const parsed = parseNumber(raw[key] ?? "", specs[key]);
    if ("error" in parsed) errors[key] = parsed.error;
    else values[key] = parsed.value;
  }
  return Object.keys(errors).length > 0 ? { ok: false, errors } : ok(values);
}