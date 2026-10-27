import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/lib/tools";

const title = "Teacher Tools: free calculators for teachers and students";
const description =
  "Free education calculators for teachers, students and parents: percentage, weighted grade, attendance, class average and marks required. Nothing you enter leaves your device.";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", siteName: "Teacher Tools", type: "website" },
};

const audiences = [
  {
    title: "Teachers",
    text: "Check a class average, turn marks into percentages, combine weighted assessments and keep an eye on attendance, without building a spreadsheet.",
  },
  {
    title: "Students",
    text: "See how your final grade is made up, check your attendance, and find out what you need on the last assessment to reach your goal.",
  },
  {
    title: "Parents",
    text: "Make sense of a mark, a percentage or an attendance figure on a report, and see what a result really means.",
  },
];

const reasons = [
  {
    title: "Free, with nothing to sign up for",
    text: "Open a calculator and use it. There are no accounts and no logins.",
  },
  {
    title: "Private by design",
    text: "Calculations happen in your browser. The marks and names you type are never sent anywhere or stored.",
  },
  {
    title: "Honest answers",
    text: "Impossible values, such as marks above the total or weights that do not add up, are explained in plain words instead of producing a misleading result.",
  },
];

const primaryLink =
  "inline-flex min-h-12 items-center rounded-md border border-brand bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark";
const secondaryLink =
  "inline-flex min-h-12 items-center rounded-md border border-brand bg-white px-5 py-3 font-semibold text-brand hover:bg-tint";

export default function Home() {
  return (
    <main>
      <section className="graph-paper border-b border-line">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.2fr_1fr] lg:py-20">
          <div>
            <p className="text-sm font-semibold tracking-wide text-brand uppercase">
              Free for teachers, students and parents
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">
              Simple calculators for marks, grades and attendance
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted">
              Teacher Tools is a small set of free calculators for working out percentages, final
              grades, attendance and class averages in seconds, with a clear explanation of what
              each result means.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#calculators" className={primaryLink}>
                Browse the calculators
              </a>
              <Link href="/privacy" className={secondaryLink}>
                See how privacy works
              </Link>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="rounded-xl border border-line bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-muted">Example result</p>
            <p className="mt-3 text-lg text-ink">42 marks out of 50</p>
            <p className="mt-4 text-sm font-semibold text-muted">Percentage</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink">
              <span className="bg-mark px-2">84%</span>
            </p>
            <p className="mt-5 border-t border-line pt-3 text-sm text-muted">Marks lost: 8</p>
          </div>
        </div>
      </section>

      <section id="calculators" className="mx-auto w-full max-w-5xl px-4 py-14">
        <h2 className="font-display text-3xl font-bold text-ink">The calculators</h2>
        <p className="mt-2 max-w-xl text-muted">
          Pick the one that matches your question. Each page explains how it works and what the
          result means.
        </p>
        <ol className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {TOOLS.map((tool, index) => (
            <li key={tool.href}>
              <Link href={tool.href} className="group flex items-start gap-4 p-5 hover:bg-tint">
                <span aria-hidden="true" className="font-display text-2xl font-bold text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-semibold text-ink group-hover:underline">
                    {tool.name}
                  </span>
                  <span className="mt-1 block text-muted">{tool.summary}</span>
                </span>
                <span aria-hidden="true" className="pt-1 text-xl text-brand">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-tint">
        <div className="mx-auto w-full max-w-5xl px-4 py-14">
          <h2 className="font-display text-3xl font-bold text-ink">Who it helps</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {audiences.map((item) => (
              <div key={item.title}>
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-14">
        <h2 className="font-display text-3xl font-bold text-ink">Why use Teacher Tools</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {reasons.map((item) => (
            <div key={item.title}>
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}