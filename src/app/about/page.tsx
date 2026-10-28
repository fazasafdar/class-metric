import type { Metadata } from "next";
import Link from "next/link";
import { ArticlePage } from "@/components/ArticlePage";
import { TOOLS } from "@/lib/tools";

const title = "About ClassMetric";
const description =
  "ClassMetric is a small set of free, private calculators for teachers, students and parents. Learn what is on the site and how it works.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { title, description, url: "/about", siteName: "ClassMetric", type: "website" },
};

const linkClass = "font-semibold text-brand underline";

export default function AboutPage() {
  return (
    <ArticlePage
      title="About ClassMetric"
      intro="ClassMetric is a small set of free calculators for the everyday maths of teaching and studying: marks, grades, attendance and class results."
      sections={[
        {
          heading: "What it is for",
          body: (
            <>
              <p>
                Working out a percentage, a weighted final grade or a class average is simple, but
                easy to get wrong when you are in a hurry. ClassMetric gives you a clear, checked
                answer in seconds, and explains what the answer means.
              </p>
              <p>
                It is made for teachers marking and reporting, students tracking their own progress,
                and parents trying to make sense of a report.
              </p>
            </>
          ),
        },
        {
          heading: "The calculators",
          body: (
            <ul className="space-y-3">
              {TOOLS.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className={linkClass}>
                    {tool.name}
                  </Link>
                  <span className="block text-muted">{tool.summary}</span>
                </li>
              ))}
            </ul>
          ),
        },
        {
          heading: "How it works",
          body: (
            <>
              <p>
                Every calculation happens in your own browser. There are no accounts to create, and
                the marks and names you type are not sent anywhere. You can read more on the{" "}
                <Link href="/privacy" className={linkClass}>
                  privacy page
                </Link>
                .
              </p>
              <p>
                Each calculator is checked with automated tests that compare its answers with
                worked examples, including unusual cases such as a total of zero, marks above the
                total, weights that do not add up, and targets that cannot be reached. When an input
                makes no sense, the calculator explains why in plain words instead of showing a
                misleading number.
              </p>
            </>
          ),
        },
        {
          heading: "Please remember",
          body: (
            <p>
              These calculators are aids for working things out. Official grades, pass marks and
              attendance rules are set by your school, college or exam board, and they may use rules
              that a general calculator cannot know. When a result matters, check it against your
              own institution&rsquo;s policy.
            </p>
          ),
        },
      ]}
    />
  );
}