import { useId } from "react";

interface SegmentedControlProps<T extends string> {
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** A group of radio buttons styled as large side-by-side choices. */
export function SegmentedControl<T extends string>({
  legend,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const name = useId();
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={`flex min-h-12 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-center text-sm font-semibold has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand ${
                selected
                  ? "border-brand bg-brand text-white"
                  : "border-[#6b7c93] bg-white text-ink hover:bg-tint"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}