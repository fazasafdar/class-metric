import type { Metadata } from "next";
import { WeightedGradeCalculator } from "@/components/calculators/WeightedGradeCalculator";
import { ToolPageLayout } from "@/components/ToolPageLayout";

const title = "Weighted Grade Calculator for Final Grades";
const description =
  "Free weighted grade calculator. Enter each assessment's score and weight to work out a final grade, and see how much each one adds.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/weighted-grade-calculator" },
  openGraph: {
    title,
    description,
    url: "/weighted-grade-calculator",
    siteName: "Teacher Tools",
    type: "website",
  },
};

export default function WeightedGradeCalculatorPage() {
  return (
    <ToolPageLayout
      title="Weighted Grade Calculator"
      intro="Work out a final grade when some assessments count for more than others, such as quizzes, coursework and exams."
      calculator={<WeightedGradeCalculator />}
      sections={[
        {
          heading: "What this calculator does",
          body: (
            <p>
              In many courses, each assessment counts for a set share of the final grade. A final
              exam might be worth 50% while a quiz is worth 20%. This calculator combines all of
              your assessments, taking each one&rsquo;s weight into account, and gives the final
              grade as a percentage. It also shows how many percentage points each assessment
              contributed.
            </p>
          ),
        },
        {
          heading: "How to use it",
          body: (
            <ol className="list-decimal space-y-1 pl-5">
              <li>Enter the score for each assessment and what it was marked out of.</li>
              <li>
                Enter the weight: the percentage of the final grade that the assessment counts for.
              </li>
              <li>
                Use Add assessment for more rows, or Remove to delete one. A name is optional but
                makes the result table easier to read.
              </li>
              <li>
                Check that the line under the rows says the weights total 100%, then press
                Calculate.
              </li>
            </ol>
          ),
        },
        {
          heading: "Worked example",
          body: (
            <>
              <p>
                A student scores 80 on a quiz (weight 20%), 70 on a midterm (weight 30%) and 90 on
                a final exam (weight 50%), each marked out of 100.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Quiz: 80% of 20 points is 16.</li>
                <li>Midterm: 70% of 30 points is 21.</li>
                <li>Final exam: 90% of 50 points is 45.</li>
              </ul>
              <p>Added together, the final grade is 16 + 21 + 45 = 82%.</p>
              <p>
                Assessments can be marked out of different totals. A score of 18 out of 20 is
                treated as 90%, and 45 out of 60 as 75%.
              </p>
            </>
          ),
        },
        {
          heading: "What the result means",
          body: (
            <>
              <p>
                The final grade is a percentage. The last column of the result table shows how many
                of those percentage points came from each assessment, so you can see which ones
                had the biggest effect.
              </p>
              <p>
                The weights must add up to 100% so that the result is a true share of the whole
                course. If they don&rsquo;t, the calculator tells you how far off they are instead
                of guessing. Tiny rounding differences, such as three weights of 33.33%, are
                accepted.
              </p>
              <p>
                This calculator gives a percentage only. Letter grades and pass marks differ
                between schools and countries, so check your own grading scale to convert it.
              </p>
            </>
          ),
        },
        {
          heading: "Who can use it",
          body: (
            <p>
              Teachers can use it to check a student&rsquo;s overall result, students can use it
              to see where they stand mid-course, and parents can use it to understand how a
              report grade was reached. Nothing you type is sent anywhere. The calculation happens
              on your own device.
            </p>
          ),
        },
      ]}
    />
  );
}