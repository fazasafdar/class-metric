import type { ReactNode } from "react";

interface ArticlePageProps {
  title: string;
  intro: string;
  /** Shown under the intro, e.g. "Last updated 27 October 2026". */
  note?: string;
  sections: { heading: string; body: ReactNode }[];
}

/** Layout for plain text pages such as About and Privacy. */
export function ArticlePage({ title, intro, note, sections }: ArticlePageProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-prose text-lg text-muted">{intro}</p>
      {note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
      <div className="mt-10 space-y-10">
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