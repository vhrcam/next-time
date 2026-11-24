import type { ReactNode } from "react";
import type { Interest } from "@/lib/store";
import { presetById } from "@/lib/topics";

export const button =
  "inline-flex items-center justify-center rounded-[5px] border border-line bg-surface px-3.5 py-2 text-sm text-ink transition-colors hover:border-strong hover:bg-raised disabled:pointer-events-none disabled:opacity-40";
export const primary =
  "inline-flex items-center justify-center rounded-[5px] bg-ink px-3.5 py-2 text-sm font-medium text-bg transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-40";
export const label = "text-[11px] font-medium uppercase tracking-[0.08em] text-faint";
export const field =
  "w-full rounded-[5px] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-strong";

export function when(t: number | string, style: "day" | "weekday" | "full" = "day") {
  const d = typeof t === "string" ? new Date(`${t}T12:00:00`) : new Date(t);
  const options: Intl.DateTimeFormatOptions =
    style === "day"
      ? { month: "short", day: "numeric" }
      : style === "weekday"
        ? { weekday: "short", month: "short", day: "numeric" }
        : { weekday: "long", month: "long", day: "numeric" };
  return d.toLocaleDateString("en-US", options);
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export const nameOf = (id: string, interests: Interest[]) =>
  interests.find((i) => i.id === id)?.name || presetById.get(id)?.name || "Your interest";

export function PageHead({ title, aside, children }: { title: string; aside?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="min-w-0 max-w-2xl">
        <h1 className="text-[26px] font-semibold tracking-tight text-ink">{title}</h1>
        {children && <div className="mt-2 space-y-1 text-sm leading-relaxed text-muted">{children}</div>}
      </div>
      {aside}
    </header>
  );
}

export function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className={label}>{title}</h2>
        {note && <span className="text-xs text-faint">{note}</span>}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-dashed border-line px-5 py-10 text-center text-sm leading-relaxed text-muted">{children}</div>;
}
