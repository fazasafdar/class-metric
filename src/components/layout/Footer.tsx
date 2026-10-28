import Link from "next/link";
import { TOOLS } from "@/lib/tools";

const linkClass = "text-sm text-muted hover:text-ink hover:underline";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-tint">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-ink">ClassMetric</p>
          <p className="mt-2 text-sm text-muted">
            Free calculators for teachers, students and parents. No accounts, and nothing you enter
            leaves your device.
          </p>
        </div>

        <nav aria-label="Calculators">
          <h2 className="text-sm font-semibold text-ink">Calculators</h2>
          <ul className="mt-2 space-y-1">
            {TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href} className={linkClass}>
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="About this site">
          <h2 className="text-sm font-semibold text-ink">About</h2>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/about" className={linkClass}>
                About ClassMetric
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={linkClass}>
                Privacy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}