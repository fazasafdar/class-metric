"use client";

import { useEffect, useRef } from "react";

interface ErrorSummaryProps {
  messages: string[];
}

/**
 * Lists every problem in one place. Render it with a changing `key` so it
 * remounts after each failed attempt: it then moves keyboard and screen-reader
 * focus to itself so the user hears what went wrong.
 */
export function ErrorSummary({ messages }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  if (messages.length === 0) return null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="rounded-md border border-danger bg-danger-tint p-4"
    >
      <p className="font-semibold text-danger">Please fix the following:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}