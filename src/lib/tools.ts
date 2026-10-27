export interface Tool {
  href: string;
  name: string;
  /** Short label for the navigation bar. */
  shortName: string;
  summary: string;
}

/** Every calculator on the site. The header, footer, homepage and sitemap all read this list. */
export const TOOLS: Tool[] = [
  {
    href: "/percentage-calculator",
    name: "Percentage Calculator",
    shortName: "Percentage",
    summary:
      "Turn marks into a percentage, find the marks behind a percentage, or see how much a score changed.",
  },
  {
    href: "/weighted-grade-calculator",
    name: "Weighted Grade Calculator",
    shortName: "Weighted grade",
    summary: "Combine assessments that count for different amounts into one final grade.",
  },
  {
    href: "/attendance-calculator",
    name: "Attendance Calculator",
    shortName: "Attendance",
    summary: "Work out an attendance percentage and what it takes to reach a target.",
  },
  {
    href: "/class-average-calculator",
    name: "Class Average Calculator",
    shortName: "Class average",
    summary: "Find the class average, the highest and lowest marks, and who scored them.",
  },
  {
    href: "/marks-required-calculator",
    name: "Marks Required Calculator",
    shortName: "Marks required",
    summary: "Find the result you need on your last assessment to reach a target grade.",
  },
];