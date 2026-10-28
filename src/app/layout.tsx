import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "ClassMetric: free calculators for teachers and students",
    template: "%s | ClassMetric",
  },
  description:
    "Free education calculators for teachers, students and parents: percentage, weighted grade, attendance, class average and marks required. Nothing you enter leaves your device.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <div id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}