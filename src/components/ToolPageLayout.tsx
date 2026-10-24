import type { ReactNode } from "react";

interface ToolPageLayoutProps {
  title: string;
  intro: string;
  calculator: ReactNode;
  /** Explanatory sections shown under the calculator. */
  sections: { heading: string; body: ReactNode }[];
}

/** Shared page layout for every calculator: heading, calculator, then helpful explanation. */
export function ToolPageLayout({ title, intro, calculator, sections }: ToolPageLayoutProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-prose text-lg text-muted">{intro}</p>
      <div className="mt-8">{calculator}</div>
      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-2xl font-bold">{section.heading}</h2>
            <div className="mt-3 max-w-prose space-y-3 leading-relaxed">{section.body}</div>
          </section>
        ))}
      </div>
    </main>
  );
}