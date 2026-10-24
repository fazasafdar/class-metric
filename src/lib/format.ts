/** Round to a fixed number of decimal places, avoiding float artefacts like 1.005 -> 1. */
export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  const rounded = Math.round((value + Math.sign(value) * Number.EPSILON) * factor) / factor;
  return rounded === 0 ? 0 : rounded;
}

const formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  useGrouping: false,
});

/** Display a number with up to 2 decimals and no trailing zeros. */
export function fmt(value: number): string {
  return formatter.format(round(value, 2));
}

/** Round UP to a fixed number of decimals, so a "required" value is always enough to reach the target. */
export function roundUp(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.ceil(value * factor - 1e-9) / factor;
}