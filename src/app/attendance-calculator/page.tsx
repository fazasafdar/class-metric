import type { Metadata } from "next";
import { AttendanceCalculator } from "@/components/calculators/AttendanceCalculator";
import { ToolPageLayout } from "@/components/ToolPageLayout";

const title = "Attendance Percentage Calculator";
const description =
  "Free attendance calculator. Work out an attendance percentage, how many classes were missed, and how many classes it takes to reach a target.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/attendance-calculator" },
  openGraph: {
    title,
    description,
    url: "/attendance-calculator",
    siteName: "ClassMetric",
    type: "website",
  },
};

export default function AttendanceCalculatorPage() {
  return (
    <ToolPageLayout
      title="Attendance Calculator"
      intro="Find an attendance percentage, see how many classes were missed, and check what it would take to reach a target."
      calculator={<AttendanceCalculator />}
      sections={[
        {
          heading: "What this calculator does",
          body: (
            <>
              <p>
                Enter the number of classes attended and the total number of classes held. The
                calculator gives the attendance percentage and the number of classes missed.
              </p>
              <p>
                You can also enter a target, such as 90%. It then tells you whether you have
                reached it, how many classes you would need to attend in a row to get there, or how
                many more you could miss and still stay at or above it.
              </p>
            </>
          ),
        },
        {
          heading: "How to use it",
          body: (
            <ol className="list-decimal space-y-1 pl-5">
              <li>Enter the classes attended. This can be 0.</li>
              <li>Enter the total classes held so far. This must be at least 1.</li>
              <li>Optionally, enter a target percentage between 0 and 100.</li>
              <li>Press Calculate. Press Reset to clear everything and start again.</li>
            </ol>
          ),
        },
        {
          heading: "Worked examples",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Attending 18 of 20 classes gives 90% attendance, with 2 classes missed.</li>
              <li>
                To reach 95% from there, you would need to attend the next 20 classes in a row,
                because 38 out of 40 is 95%.
              </li>
              <li>
                Against an 80% target, you could miss up to 2 more classes: 18 out of 22 is still
                above 80%, but 18 out of 23 is not.
              </li>
            </ul>
          ),
        },
        {
          heading: "What the result means",
          body: (
            <>
              <p>
                Attendance is the share of classes held that were attended, rounded to two decimal
                places. The target figures are always whole classes, since you cannot attend part of
                a class.
              </p>
              <p>
                The &ldquo;classes needed&rdquo; result assumes every future class is attended. If
                you miss some, you will need more. A target of 100% cannot be reached again once a
                single class has been missed, and the calculator tells you so instead of showing a
                misleading number.
              </p>
              <p>
                The calculator uses only the numbers you enter. Your school or college may count
                late arrivals or authorised absences differently, so check its attendance policy for
                the official figure.
              </p>
            </>
          ),
        },
        {
          heading: "Who can use it",
          body: (
            <p>
              Teachers and school staff can use it to check a student&rsquo;s attendance, students
              can use it to see how many classes they can afford to miss, and parents can use it to
              understand an attendance figure on a report. Nothing you type is sent anywhere. The
              calculation happens on your own device.
            </p>
          ),
        },
      ]}
    />
  );
}