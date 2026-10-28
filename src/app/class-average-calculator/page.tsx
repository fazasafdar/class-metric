import type { Metadata } from "next";
import { ClassAverageCalculator } from "@/components/calculators/ClassAverageCalculator";
import { ToolPageLayout } from "@/components/ToolPageLayout";

const title = "Class Average Calculator for Test Marks";
const description =
  "Free class average calculator. Enter students' marks to find the class average, the highest and lowest marks, and who scored them.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/class-average-calculator" },
  openGraph: {
    title,
    description,
    url: "/class-average-calculator",
    siteName: "ClassMetric",
    type: "website",
  },
};

export default function ClassAverageCalculatorPage() {
  return (
    <ToolPageLayout
      title="Class Average Calculator"
      intro="Enter your students' marks to find the class average, the highest and lowest marks, and which students scored them."
      calculator={<ClassAverageCalculator />}
      sections={[
        {
          heading: "What this calculator does",
          body: (
            <p>
              It takes a mark for each student and works out the class average, the number of
              students, the highest mark and the lowest mark. If you enter student names, it also
              tells you who scored the highest and lowest marks. If you enter the maximum mark, such
              as 100, it also shows the average as a percentage.
            </p>
          ),
        },
        {
          heading: "How to use it",
          body: (
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Type each student&rsquo;s marks in the Marks obtained box. A name is optional, and
                without one the student is shown as No. 1, No. 2 and so on.
              </li>
              <li>
                Press Enter to move along: from the name to the marks, then to the next student.
                Press Add a row for more students, or Delete row to remove one.
              </li>
              <li>
                Prefer a spreadsheet? Copy the names and marks columns together, click the first
                name box and paste. A column of marks alone can be pasted into the first marks box.
              </li>
              <li>
                Optionally, enter the maximum mark. Marks above it are rejected, which helps catch
                typing mistakes.
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
                Three students scored 94, 91 and 86. Added together that is 271, and 271 divided by
                3 students is 90.33, so the class average is 90.33.
              </p>
              <p>
                The highest mark is 94 and the lowest is 86. With a maximum mark of 100, the average
                is 90.33% of the total.
              </p>
            </>
          ),
        },
        {
          heading: "What the result means",
          body: (
            <>
              <p>
                The class average is the total of all the marks divided by the number of students
                who have a mark, rounded to two decimal places. A very high or very low mark can pull
                it up or down, so look at the highest and lowest marks too.
              </p>
              <p>
                Rows left empty are skipped. A student with a name but no mark, such as someone who
                was absent, is not counted as zero. They are left out of every figure, and the
                result tells you how many were left out. If you want an absence to count as zero,
                enter 0 as their mark.
              </p>
              <p>You can enter up to 200 students in one calculation.</p>
            </>
          ),
        },
        {
          heading: "Who can use it, and your privacy",
          body: (
            <>
              <p>
                Teachers can use it to review a test or assignment, students can use it to compare
                their score with the class, and parents can use it to understand a class result.
              </p>
              <p>
                Names are optional. Nothing you type, including names, is sent anywhere or stored.
                The calculation happens on your own device, and everything disappears when you close
                or refresh the page.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}