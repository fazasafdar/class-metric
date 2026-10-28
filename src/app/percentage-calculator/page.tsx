import type { Metadata } from "next";
import { PercentageCalculator } from "@/components/calculators/PercentageCalculator";
import { ToolPageLayout } from "@/components/ToolPageLayout";

const title = "Percentage Calculator for Marks and Grades";
const description =
  "Free percentage calculator for marks and grades. Find a percentage from marks, marks from a percentage, or the percentage change between two scores.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/percentage-calculator" },
  openGraph: {
    title,
    description,
    url: "/percentage-calculator",
    siteName: "ClassMetric",
    type: "website",
  },
};

export default function PercentageCalculatorPage() {
  return (
    <ToolPageLayout
      title="Percentage Calculator"
      intro="Turn marks into a percentage, find the marks behind a percentage, or see how much a score has changed."
      calculator={<PercentageCalculator />}
      sections={[
        {
          heading: "What this calculator does",
          body: (
            <>
              <p>It has three modes. Choose the one that matches the question you are asking:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Find the percentage:</strong> you know the marks a student scored and the
                  total available.
                </li>
                <li>
                  <strong>Find the marks:</strong> you know the percentage and the total, and want
                  the marks.
                </li>
                <li>
                  <strong>Find the change:</strong> you have an earlier and a later score and want
                  to know how much it went up or down.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "How to use it",
          body: (
            <ol className="list-decimal space-y-1 pl-5">
              <li>Choose what you want to find.</li>
              <li>Fill in the fields. Use a dot for decimals, such as 17.5.</li>
              <li>Press Calculate to see the result.</li>
              <li>Press Reset to clear everything and start again.</li>
            </ol>
          ),
        },
        {
          heading: "Worked examples",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>42 marks out of 50 is 84%.</li>
              <li>85% of a 60-mark paper is 51 marks.</li>
              <li>A score that moves from 40 to 50 is a 25% increase.</li>
            </ul>
          ),
        },
        {
          heading: "What the result means",
          body: (
            <>
              <p>
                A percentage shows what share of the available marks was scored. 84% means 84 out of
                every 100 possible marks, however many marks the paper was actually out of.
              </p>
              <p>
                Percentage change is always measured against the earlier score. A fall from 50 to 40
                is a 20% decrease, but a rise from 40 back to 50 is a 25% increase, because the
                starting point is different. Results are rounded to two decimal places.
              </p>
            </>
          ),
        },
        {
          heading: "Who can use it",
          body: (
            <p>
              Teachers can use it when marking and reporting, students can use it to check their own
              results, and parents can use it to make sense of a score on a report. Nothing you type
              is sent anywhere. The calculation happens on your own device.
            </p>
          ),
        },
      ]}
    />
  );
}