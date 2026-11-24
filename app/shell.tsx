"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { nextDue } from "@/lib/briefing";
import { load, useBriefings, useClient, useSettings, write, type Interest } from "@/lib/store";
import { presetById } from "@/lib/topics";
import { when } from "./ui";

const nav = [
  { href: "/", label: "Briefing" },
  { href: "/interests", label: "My interests", short: "Interests" },
  { href: "/saved", label: "Saved" },
  { href: "/archive", label: "Archive" },
  { href: "/settings", label: "Settings" },
];

export default function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const client = useClient();
  const [settings] = useSettings();
  const [briefings] = useBriefings();

  // A link from another device (?t=claude,apple) adds its interests to this browser.
  useEffect(() => {
    const shared = new URLSearchParams(location.search).get("t");
    if (!shared) return;
    const have = load<Interest[]>("interests", []);
    const add = shared
      .split(",")
      .filter((id) => id && !have.some((i) => i.id === id))
      .map((id) => ({ id, name: presetById.get(id)?.name ?? "" }));
    write("interests", [...have, ...add]);
    history.replaceState(history.state, "", location.pathname);
  }, []);

  const due = nextDue(briefings[0], settings);
  const note = !client
    ? ""
    : settings.schedule === "major"
      ? "Major developments only"
      : settings.schedule === "manual"
        ? "Briefings when you ask"
        : due
          ? `Next briefing ${when(due, "weekday")}`
          : "";
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[236px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-side md:flex">
        <Link href="/" className="px-6 pb-8 pt-7 font-logo text-[23px] leading-none tracking-tight text-ink">
          next time
        </Link>
        <nav className="flex flex-col gap-px px-3">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className={`rounded-[5px] px-3 py-2 text-sm transition-colors ${
                active(n.href) ? "bg-raised text-ink" : "text-muted hover:bg-raised/60 hover:text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto px-6 pb-6 text-xs leading-relaxed text-faint">{note}</p>
      </aside>

      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur md:hidden">
        <div className="flex items-baseline justify-between gap-3 px-4 pt-3">
          <Link href="/" className="font-logo text-lg leading-none text-ink">
            next time
          </Link>
          <span className="truncate text-[11px] text-faint">{note}</span>
        </div>
        <nav className="grid grid-cols-5 gap-0.5 px-1.5 pb-2 pt-2.5">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className={`truncate rounded-[5px] px-1 py-1.5 text-center text-[13px] ${active(n.href) ? "bg-raised text-ink" : "text-muted"}`}
            >
              {n.short ?? n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="min-w-0 px-4 pb-20 pt-6 md:px-10 md:pt-10">
        <div className="mx-auto w-full max-w-[1120px]">{children}</div>
      </main>
    </div>
  );
}
