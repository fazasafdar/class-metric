import { useId } from "react";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Short help text shown under the label. */
  hint?: string;
  /** Error message. When set, the field is marked invalid. */
  error?: string;
  /** Small unit shown inside the field, e.g. "%". */
  suffix?: string;
  placeholder?: string;
  name?: string;
  inputMode?: "decimal" | "numeric" | "text";
  /** Longest text allowed. Defaults to 20 for numbers and 100 for text. */
  maxLength?: number;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
  /** Identifies this box inside a table of rows, such as "3:mark", so a parent can move focus. */
  dataCell?: string;
  /** Extra classes for the label, e.g. "sm:sr-only" to hide it on wide screens. */
  labelClassName?: string;
  /** Text read out by screen readers after the label, but not shown, e.g. "for No. 3". */
  hiddenLabelSuffix?: string;
}

export function Field({
  label,
  value,
  onChange,
  hint,
  error,
  suffix,
  placeholder,
  name,
  inputMode = "decimal",
  maxLength,
  onKeyDown,
  onPaste,
  dataCell,
  labelClassName = "",
  hiddenLabelSuffix,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className={`block text-sm font-semibold text-ink ${labelClassName}`}>
        {label}
        {hiddenLabelSuffix ? <span className="sr-only"> {hiddenLabelSuffix}</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="mt-0.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <div className="relative mt-1.5">
        <input
          id={id}
          name={name}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          autoCapitalize={inputMode === "text" ? "words" : undefined}
          maxLength={maxLength ?? (inputMode === "text" ? 100 : 20)}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          data-cell={dataCell}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`block w-full rounded-md border bg-white px-3 py-3 text-base text-ink placeholder:text-[#7d8da6] ${
            suffix ? "pr-10" : ""
          } ${error ? "border-danger ring-1 ring-danger" : "border-[#6b7c93]"}`}
        />
        {suffix ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted"
          >
            {suffix}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-danger">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}