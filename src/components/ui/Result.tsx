import type { ReactNode } from "react";

/** Always-present wrapper so screen readers announce results as they appear. */
export function ResultArea({ children }: { children?: ReactNode }) {
  return (
    <div aria-live="polite" className="mt-6">
      {children}
    </div>
  );
}

export function ResultCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-brand/30 bg-tint p-5">
      {children}
    </div>
  );
}

/** The main answer, shown large on a highlighter-yellow background. */
export function BigResult({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">
        <span className="bg-mark px-2 [box-decoration-break:clone]">{value}</span>
      </p>
    </div>
  );
}

export function StatList({
  items,
}: {
  items: { label: string; value: string; /** Smaller line under the value, such as who scored it. */ detail?: string }[];
}) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-sm text-muted">{item.label}</dt>
          <dd className="text-lg font-semibold text-ink">{item.value}</dd>
          {item.detail ? <dd className="text-sm break-words text-muted">{item.detail}</dd> : null}
        </div>
      ))}
    </dl>
  );
}