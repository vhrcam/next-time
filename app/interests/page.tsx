"use client";

import Link from "next/link";
import { useState } from "react";
import { useClient, useInterests, type Interest } from "@/lib/store";
import { groups, presetById, presets } from "@/lib/topics";
import { Block, PageHead, field, label, primary } from "../ui";

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Tile({ on, name, note, broad, onClick }: { on: boolean; name: string; note: string; broad?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`flex h-full w-full items-start gap-3 rounded-md border p-3.5 text-left transition-colors ${
        on ? "border-ink/50 bg-raised" : "border-line bg-surface hover:border-strong"
      }`}
    >
      <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] border ${on ? "border-ink bg-ink text-bg" : "border-strong"}`}>
        {on && (
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
            <path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        )}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-ink">
          {name}
          {broad && <span className={label}>Whole field</span>}
        </span>
        <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">{note}</span>
      </span>
    </button>
  );
}

export default function InterestsPage() {
  const client = useClient();
  const [interests, setInterests] = useInterests();
  const [form, setForm] = useState({ name: "", words: "", link: "" });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const has = (id: string) => interests.some((i) => i.id === id);
  const toggle = (i: Interest) => setInterests(has(i.id) ? interests.filter((x) => x.id !== i.id) : [...interests, i]);
  const own = interests.filter((i) => !presetById.has(i.id));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/topics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!has(data.id)) setInterests([...interests, { id: data.id, name: data.name }]);
      setForm({ name: "", words: "", link: "" });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't add that interest");
    }
    setAdding(false);
  }

  if (!client) return null;

  return (
    <>
      <PageHead title="My interests">
        <p>Follow a whole field or specific subjects. Your briefing only includes what you pick here.</p>
      </PageHead>

      {groups.map((g) => (
        <Block key={g} title={g}>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {presets
              .filter((t) => t.group === g)
              .map((t) => (
                <Tile key={t.id} on={has(t.id)} name={t.name} note={sentence(t.about)} broad={t.broad} onClick={() => toggle({ id: t.id, name: t.name })} />
              ))}
          </div>
        </Block>
      ))}

      <Block title="Your own" note="For anything not listed: a hobby, a team, a product, a company.">
        {own.length > 0 && (
          <div className="mb-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {own.map((i) => (
              <Tile key={i.id} on name={i.name || "Shared interest"} note="Added by you. Click to stop following." onClick={() => toggle(i)} />
            ))}
          </div>
        )}
        <form onSubmit={add} className="grid max-w-3xl gap-2 rounded-md border border-line bg-surface p-3 sm:grid-cols-2">
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
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button disabled={adding || !form.name.trim()} className={primary}>
              {adding ? "Adding…" : "Add interest"}
            </button>
            {error && <span className="text-sm text-accent">{error}</span>}
          </div>
        </form>
      </Block>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-4 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur md:-mx-10 md:px-10">
        <span className="text-sm text-muted">{interests.length ? `Following ${interests.length}` : "Pick at least one interest"}</span>
        {interests.length > 0 && (
          <Link href="/" className={primary}>
            View briefing
          </Link>
        )}
      </div>
    </>
  );
}
