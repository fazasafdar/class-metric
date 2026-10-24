import Link from "next/link";

const tools = [
  { href: "/percentage-calculator", name: "Percentage Calculator" },
  { href: "/weighted-grade-calculator", name: "Weighted Grade Calculator" },
  { href: "/attendance-calculator", name: "Attendance Calculator" },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14">
      <h1 className="font-display text-4xl font-bold">Teacher Tools</h1>
      <p className="mt-3 text-lg text-muted">
        Free calculators for teachers, students and parents. The full homepage is coming soon.
      </p>
      <ul className="mt-6 space-y-2">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link href={tool.href} className="font-semibold text-brand underline">
              {tool.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}