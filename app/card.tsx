import type { ReactNode } from "react";
import type { Entry } from "@/lib/briefing";
import { label, when } from "./ui";

export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function Major() {
  return (
    <span className="shrink-0 rounded-[3px] border border-accent/40 px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
      Major
    </span>
  );
}

export default function Card({ entry, name, read, onOpen }: { entry: Entry; name: string; read?: boolean; onOpen: () => void }) {
  const first = entry.links[0];
  return (
    <button
      onClick={onOpen}
      className="flex h-full min-h-[176px] w-full flex-col rounded-md border border-line bg-surface p-4 text-left transition-colors hover:border-strong hover:bg-raised focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
    >
      <span className="flex w-full items-center justify-between gap-3">
        <span className={`truncate ${label}`}>{name}</span>
        {entry.importance >= 3 && <Major />}
      </span>
      <span className={`mt-2.5 line-clamp-2 text-[15px] font-medium leading-snug ${read ? "text-muted" : "text-ink"}`}>{entry.headline}</span>
      <span className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted">{entry.summary}</span>
      <span className="mt-auto flex w-full items-center justify-between gap-3 pt-4 text-xs text-faint">
        <span className="truncate">
          {first?.site}
          {entry.links.length > 1 ? ` + ${entry.links.length - 1} more` : ""}
        </span>
        <span className="shrink-0 tabular-nums">{when(entry.date)}</span>
      </span>
    </button>
  );
}
