"use client";

import { useState } from "react";

export type Story = {
  id: number;
  topic: string;
  headline: string;
  summary: string;
  big: boolean;
  date: string;
  found: number;
  links: { title: string; url: string; site: string }[];
};

export default function StoryRow({ story, fresh }: { story: Story; fresh: boolean }) {
  const [open, setOpen] = useState(false);
  const day = new Date(`${story.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const sites = [...new Set(story.links.map((l) => l.site))];

  return (
    <li className="grid grid-cols-[3.25rem_1fr] gap-x-3 border-t border-line py-4 first:border-t-0">
      <div className="pt-[0.3rem] text-xs tabular-nums text-faint">
        {fresh && <span className="mr-1 inline-block size-1.5 rounded-full bg-accent align-middle" aria-label="New" />}
        {day}
      </div>
      <div className="min-w-0">
        <h3 className="font-serif text-[1.15rem] leading-snug">
          <a href={story.links[0]?.url} target="_blank" rel="noreferrer" className="decoration-line underline-offset-4 hover:underline">
            {story.headline}
          </a>
          {story.big && (
            <span className="ml-2 inline-block -translate-y-px rounded bg-accent-soft px-1.5 py-0.5 align-middle font-sans text-[10px] font-semibold uppercase tracking-wider text-accent">
              Big
            </span>
          )}
        </h3>
        {story.summary && <p className="mt-1 text-sm leading-relaxed text-muted">{story.summary}</p>}
        <button onClick={() => setOpen(!open)} className="mt-1.5 text-xs text-faint hover:text-ink">
          {open ? "Hide sources" : `${sites.slice(0, 2).join(" · ")}${story.links.length > 2 ? ` · +${story.links.length - 2} more` : ""}`}
        </button>
        {open && (
          <ul className="mt-2 space-y-1.5 border-l border-line pl-3">
            {story.links.map((l) => (
              <li key={l.url} className="text-xs leading-snug">
                <a href={l.url} target="_blank" rel="noreferrer" className="text-ink hover:underline">
                  {l.title}
                </a>
                <span className="text-faint"> · {l.site}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
