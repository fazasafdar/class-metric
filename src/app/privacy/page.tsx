import type { Metadata } from "next";
import { ArticlePage } from "@/components/ArticlePage";

const title = "Privacy";
const description =
  "ClassMetric does not collect, send or store the marks, names or other numbers you type into its calculators. Read how the site handles your data.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
  openGraph: { title, description, url: "/privacy", siteName: "ClassMetric", type: "website" },
};

export default function PrivacyPage() {
  return (
    <ArticlePage
      title="Privacy"
      intro="ClassMetric is designed so that the numbers and names you enter stay on your own device."
      note="Last updated 28 October 2026"
      sections={[
        {
          heading: "The short version",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>You do not need an account, and there is no sign-in.</li>
              <li>What you type into a calculator is not sent to us or to anyone else.</li>
              <li>What you type is not stored. It disappears when you refresh or close the page.</li>
            </ul>
          ),
        },
        {
          heading: "What you type into the calculators",
          body: (
            <p>
              Each calculator works out its answer inside your web browser, on your own device. The
              marks, percentages, attendance figures and other numbers you enter are not transmitted
              to a server and are not saved. When you refresh the page or close it, they are gone.
            </p>
          ),
        },
        {
          heading: "Student names",
          body: (
            <>
              <p>
                The Class Average Calculator lets you add student names so that the result can say
                who scored the highest and lowest marks. Names are optional and are handled exactly
                like the numbers: they stay in your browser and are never sent or stored.
              </p>
              <p>
                Student information can be sensitive. Follow your school&rsquo;s own rules about it,
                and if you would rather not enter real names, leave the name boxes empty. The
                calculator will refer to students by number instead.
              </p>
            </>
          ),
        },
        {
          heading: "Technical logs kept by the host",
          body: (
            <p>
              Like almost every website, ClassMetric is delivered by a hosting company. Hosting
              companies normally keep basic technical logs, for example which pages were requested
              and the network address of the visitor, as part of keeping their servers running and
              secure. We do not add anything to this ourselves, and we do not use it to identify
              you.
            </p>
          ),
        },
        {
          heading: "Changes to this page",
          body: (
            <p>
              If the way the site handles data ever changes, for example by adding a feature that
              needs an account, this page will be updated first and the date above will change.
            </p>
          ),
        },
      ]}
    />
  );
}