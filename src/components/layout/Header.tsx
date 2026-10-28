"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TOOLS } from "@/lib/tools";

function NavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className: string;
}) {
  return (
    <ul className={className}>
      {TOOLS.map((tool) => {
        const current = pathname === tool.href;
        return (
          <li key={tool.href}>
            <Link
              href={tool.href}
              onClick={onNavigate}
              aria-current={current ? "page" : undefined}
              className={`block rounded-md px-3 py-2 font-semibold hover:bg-tint ${
                current ? "bg-tint text-brand" : "text-ink"
              }`}
            >
              {tool.shortName}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="border-b border-line bg-white"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-display text-xl font-bold text-ink"
        >
          Class<span className="text-brand">Metric</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks pathname={pathname} className="flex gap-1" />
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
          className="min-h-11 rounded-md border border-brand px-4 font-semibold text-brand lg:hidden"
        >
          {open ? "Close menu" : "Menu"}
        </button>
      </div>

      <nav
        id="site-menu"
        aria-label="Main menu"
        hidden={!open}
        className="border-t border-line px-4 py-2 lg:hidden"
      >
        <NavLinks
          pathname={pathname}
          onNavigate={() => setOpen(false)}
          className="mx-auto w-full max-w-5xl"
        />
      </nav>
    </header>
  );
}