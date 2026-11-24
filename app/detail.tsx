"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Entry } from "@/lib/briefing";
import { useRead, useSaved } from "@/lib/store";
import { Major } from "./card";
import { button, label, primary, when } from "./ui";

// Opens a development in the side panel. The panel gets its own history entry, so Back closes it.
export function useDetail() {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [read, setRead] = useRead();

  useEffect(() => {
    const onPop = () => setEntry(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function open(e: Entry) {
    history.pushState(history.state, "", `#${e.id}`);
    setEntry(e);
    if (!read.includes(e.id)) setRead([...read.slice(-999), e.id]);
  }

  function close() {
    if (location.hash) history.back();
    else setEntry(null);
  }

  return { entry, open, close, read };
}

function Part({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-7">
      <h3 className={`mb-2 ${label}`}>{title}</h3>
      <div className="text-sm leading-relaxed text-ink/90">{children}</div>
    </section>
  );
}

export default function Detail({ entry, name, onClose }: { entry: Entry; name: string; onClose: () => void }) {
  const [saved, setSaved] = useSaved();
  const isSaved = saved.some((s) => s.id === entry.id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const toggle = () => setSaved(isSaved ? saved.filter((s) => s.id !== entry.id) : [{ ...entry, label: name }, ...saved]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={entry.headline}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <article className="relative flex h-full w-full flex-col border-l border-line bg-panel sm:max-w-[560px]">
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-3.5">
          <span className={`truncate ${label}`}>{name}</span>
          <button onClick={onClose} className="text-sm text-muted hover:text-ink">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6">
          <div className="flex items-center gap-2 text-xs text-faint">
            <span>{when(entry.date, "full")}</span>
            {entry.importance >= 3 && <Major />}
          </div>
          <h2 className="mt-2 text-[22px] font-semibold leading-snug tracking-tight">{entry.headline}</h2>

          <Part title="What happened">
            <p>{entry.summary}</p>
          </Part>
          {entry.points.length > 0 && (
            <Part title="What's new">
              <ul className="space-y-1.5">
                {entry.points.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <span className="mt-[0.6rem] size-1 shrink-0 bg-faint" />
                    {p}
                  </li>
                ))}
              </ul>
            </Part>
          )}
          {entry.why && (
            <Part title="Why it matters">
              <p>{entry.why}</p>
            </Part>
          )}
          <Part title="Where to read more">
            <ul className="divide-y divide-line border-y border-line">
              {entry.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-4 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-[13px] text-ink">
                        {l.site}
                        {l.kind === "official" && <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">Official</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-faint group-hover:text-muted">{l.title}</span>
                    </span>
                    <span aria-hidden className="pt-0.5 text-faint group-hover:text-ink">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Part>
        </div>

        <div className="flex gap-2 border-t border-line px-6 py-4">
          {entry.links[0] && (
            <a href={entry.links[0].url} target="_blank" rel="noreferrer" className={primary}>
              Read the original
            </a>
          )}
          <button onClick={toggle} className={button}>
            {isSaved ? "Remove from saved" : "Save"}
          </button>
        </div>
      </article>
    </div>
  );
}
