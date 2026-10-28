import type { Metadata } from "next";
import { MarksRequiredCalculator } from "@/components/calculators/MarksRequiredCalculator";
import { ToolPageLayout } from "@/components/ToolPageLayout";

const title = "Marks Required Calculator for a Target Grade";
const description =
  "Free calculator that shows the result you need on your last assessment to reach a target final grade, or tells you if it is out of reach.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/marks-required-calculator" },
  openGraph: {
    title,
    description,
    url: "/marks-required-calculator",
    siteName: "ClassMetric",
    type: "website",
  },
};

export default function MarksRequiredCalculatorPage() {
  return (
    <ToolPageLayout
      title="Marks Required Calculator"
      intro="Find out what you need on your remaining assessment to reach the final result you want, and see straight away if the target is out of reach."
      calculator={<MarksRequiredCalculator />}
      sections={[
        {
          heading: "What this calculator does",
          body: (
            <p>
              Part of your course is already marked and one assessment is still to come. Tell the
              calculator your result so far, how much each part counts for, and the final result you
              are aiming for. It works out the result you need on the remaining assessment. It also
              tells you when your target has already been secured, and when it cannot be reached at
              all.
            </p>
          ),
        },
        {
          heading: "How to use it",
          body: (
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Enter your current result: your average so far on the work already marked, as a
                percentage.
              </li>
              <li>
                Enter the weight of that marked work, and the weight of the remaining assessment.
                Together they must total 100%.
              </li>
              <li>Enter the final result you want.</li>
              <li>
                Optionally, enter how many marks the remaining assessment is out of, to see the
                answer in marks as well as a percentage.
              </li>
              <li>Press Calculate. Press Reset to clear everything and start again.</li>
            </ol>
          ),
        },
        {
          heading: "Worked example",
          body: (
            <>
              <p>
                You have 70% on work that counts for 60% of the final result, the last assessment
                counts for 40%, and you want 75% overall.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Your marked work already gives you 70% of 60, which is 42 points.</li>
                <li>You need 33 more points to reach 75.</li>
                <li>
                  33 points out of the 40 available on the last assessment is 82.5%. If it is out of
                  50 marks, that is 41.25 marks.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "What the result means",
          body: (
            <>
              <p>
                The percentage shown is the lowest score on the remaining assessment that still
                reaches your target. It is rounded up, never down, so scoring exactly that is
                enough.
              </p>
              <p>
                If the target needs more than 100%, the calculator says it cannot be reached and
                shows the highest final result that is possible, instead of showing a number you
                could never score. If you would reach the target even with a score of 0, it tells
                you the target is already secured.
              </p>
              <p>
                The calculator assumes your final result is simply the weighted total of the two
                parts. Rules such as a minimum mark in an exam, or dropping a lowest score, are not
                included, so check your own school or course rules for the official outcome.
              </p>
            </>
          ),
        },
        {
          heading: "Who can use it",
          body: (
            <p>
              Students can use it to plan their last assessment, teachers can use it to advise
              students, and parents can use it to understand what a child needs to reach a goal.
              Nothing you type is sent anywhere. The calculation happens on your own device.
            </p>
          ),
        },
      ]}
    />
  );
}