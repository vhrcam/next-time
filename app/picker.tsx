"use client";

import { useState } from "react";
import { groups, presets } from "@/lib/topics";

export type Picked = { id: string; name: string };

const chip = (on: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm transition-colors ${
    on ? "border-ink bg-ink text-bg" : "border-line bg-card text-ink hover:border-faint"
  }`;

const field = "w-full rounded-lg border border-line bg-card px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-faint";

export default function Picker({ picked, first, onChange, onDone }: { picked: Picked[]; first: boolean; onChange: (p: Picked[]) => void; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", words: "", link: "" });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const has = (id: string) => picked.some((p) => p.id === id);
  const toggle = (p: Picked) => onChange(has(p.id) ? picked.filter((x) => x.id !== p.id) : [...picked, p]);
  const own = picked.filter((p) => !presets.some((t) => t.id === p.id));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/topics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!has(data.id)) onChange([...picked, { id: data.id, name: data.name }]);
      setForm({ name: "", words: "", link: "" });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't add that topic");
    }
    setAdding(false);
  }

  return (
    <section>
      <h2 className="font-serif text-3xl leading-tight">{first ? "What do you want to keep up with?" : "Your topics"}</h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        Pick the things you follow for work or for fun. next time reads their official channels and the news once a day, keeps only real
        announcements (launches, updates, release dates, official statements), and leaves out opinions, rumors and reactions.
      </p>

      <div className="mt-8 space-y-6">
        {groups.map((g) => (
          <div key={g}>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-faint">{g}</h3>
            <div className="flex flex-wrap gap-2">
              {presets
                .filter((t) => t.group === g)
                .map((t) => (
                  <button key={t.id} onClick={() => toggle({ id: t.id, name: t.name })} className={chip(has(t.id))} aria-pressed={has(t.id)}>
                    {t.name}
                  </button>
                ))}
            </div>
          </div>
        ))}

        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-faint">Your own</h3>
          {own.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {own.map((p) => (
                <button key={p.id} onClick={() => toggle(p)} className={chip(true)} aria-label={`Remove ${p.name}`}>
                  {p.name || "Shared topic"} <span className="ml-1 opacity-60">×</span>
                </button>
              ))}
            </div>
          )}
          <form onSubmit={add} className="grid gap-2 rounded-xl border border-line bg-card/60 p-3 sm:grid-cols-2">
            <input className={field} placeholder="Name, like Formula 1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} />
            <input
              className={field}
              placeholder='Search words (optional), like "F1" OR "Formula 1"'
              value={form.words}
              onChange={(e) => setForm({ ...form, words: e.target.value })}
              maxLength={200}
            />
            <input
              className={`${field} sm:col-span-2`}
              placeholder="Official site or YouTube channel (optional), like formula1.com"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
            <div className="flex items-center gap-3 sm:col-span-2">
              <button disabled={adding || !form.name.trim()} className="rounded-lg bg-ink px-3 py-2 text-sm text-bg disabled:opacity-40">
                {adding ? "Adding…" : "Add topic"}
              </button>
              {error && <span className="text-sm text-accent">{error}</span>}
            </div>
          </form>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-5 mt-8 border-t border-line bg-bg/90 px-5 py-4 backdrop-blur">
        <button onClick={onDone} disabled={!picked.length} className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white disabled:opacity-40 sm:w-auto">
          {picked.length ? `Show my report (${picked.length} topic${picked.length > 1 ? "s" : ""})` : "Pick at least one topic"}
        </button>
      </div>
    </section>
  );
}
