import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
  title: {
    default: "Teacher Tools: free calculators for teachers and students",
    template: "%s | Teacher Tools",
  },
  description:
    "Free education calculators for teachers, students and parents: percentage, weighted grade, attendance, class average and marks required. Nothing you enter leaves your device.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}