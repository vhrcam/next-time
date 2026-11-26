"use client";

import Link from "next/link";
import { useState } from "react";
import type { Match, Results } from "@/lib/find";
import { load, useClient, useInterests, type Interest } from "@/lib/store";
import { groups, presetById, presets, type Topic } from "@/lib/topics";
import { Block, PageHead, field, label, primary } from "../ui";

type Item = { key: string; group: string; name: string; note: string; tag?: string; on: boolean; busy?: boolean; onClick: () => void };

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const clean = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

// A whole category shows when a word in its name starts with the search. Otherwise a listed interest shows when a word
// in its name starts with the search or its description uses the search as a whole word.
function listed(q: string) {
  const start = new RegExp(`\\b${escape(q)}`, "i");
  const word = new RegExp(`\\b${escape(q)}\\b`, "i");
  return presets.filter((t) => start.test(t.group) || t.id.startsWith(q) || start.test(t.name) || word.test(t.about));
}

// The app's own categories first, in their usual order, then the rest alphabetically.
function order(a: string, b: string) {
  const x = groups.indexOf(a);
  const y = groups.indexOf(b);
  if (x >= 0 && y >= 0) return x - y;
  if (x >= 0 || y >= 0) return x >= 0 ? -1 : 1;
  return a.localeCompare(b);
}

function Tile({ item }: { item: Item }) {
  return (
    <button
      onClick={item.onClick}
      disabled={item.busy}
      aria-pressed={item.on}
      className={`flex h-full w-full items-start gap-3 rounded-md border p-3.5 text-left transition-colors disabled:opacity-60 ${
        item.on ? "border-ink/50 bg-raised" : "border-line bg-surface hover:border-strong"
      }`}
    >
      <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] border ${item.on ? "border-ink bg-ink text-bg" : "border-strong"}`}>
        {item.on && (
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
            <path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        )}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-ink">
          {item.name}
          {item.tag && <span className={label}>{item.tag}</span>}
        </span>
        <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">{item.busy ? "Adding…" : item.note}</span>
      </span>
    </button>
  );
}

function Categories({ items, limit, more }: { items: Item[]; limit?: number; more?: (group: string) => void }) {
  return (
    <div className="space-y-6">
      {[...new Set(items.map((i) => i.group))].sort(order).map((g) => {
        const all = items.filter((i) => i.group === g);
        return (
          <div key={g}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h3 className="text-[13px] font-medium text-muted">{g}</h3>
              {more && limit != null && all.length > limit && (
                <button onClick={() => more(g)} className="text-xs text-faint transition-colors hover:text-ink">
                  See all
                </button>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {all.slice(0, limit).map((i) => (
                <Tile key={i.key} item={i} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function InterestsPage() {
  const client = useClient();
  const [interests, setInterests] = useInterests();
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState<(Results & { q: string }) | null>(null);
  const [searching, setSearching] = useState(false);
  const [category, setCategory] = useState("");
  const [browsed, setBrowsed] = useState<Record<string, Results>>({});
  const [loading, setLoading] = useState<string[]>([]);
  const [failed, setFailed] = useState("");
  const [adding, setAdding] = useState("");
  const [error, setError] = useState("");

  const q = clean(text);
  const found = answer?.q === q ? answer : null;
  const has = (id: string) => interests.some((i) => i.id === id);
  const toggle = (i: Interest) => setInterests(has(i.id) ? interests.filter((x) => x.id !== i.id) : [...interests, i]);
  const followed = (m: Match) => interests.find((i) => !presetById.has(i.id) && i.name.toLowerCase() === m.name.toLowerCase());

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (q.length < 2) return;
    setSearching(true);
    setError("");
    try {
      setAnswer({ ...(await post("/api/find", { q: text.trim() })), q });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't search right now");
    }
    setSearching(false);
  }

  // Each category asks once for more interests beyond its starters; an empty category means All.
  async function browse(c: string) {
    setText("");
    setCategory(c);
    setFailed("");
    if (!c || browsed[c] || loading.includes(c)) return;
    setLoading((all) => [...all, c]);
    try {
      const data: Results = await post("/api/find", { q: c, browse: true });
      if (data.offline) throw new Error("offline");
      setBrowsed((all) => ({ ...all, [c]: data }));
    } catch {
      setFailed(c);
    }
    setLoading((all) => all.filter((x) => x !== c));
  }

  async function follow(m: Match) {
    const on = followed(m);
    if (on) return setInterests(interests.filter((i) => i.id !== on.id));
    setAdding(m.name);
    setError("");
    try {
      const data = await post("/api/topics", m);
      const now = load<Interest[]>("interests", []);
      if (!now.some((i) => i.id === data.id)) setInterests([...now, { id: data.id, name: data.name, group: m.group, about: m.about }]);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't follow that");
    }
    setAdding("");
  }

  if (!client) return null;

  const fromPreset = (t: Topic): Item => ({
    key: t.id,
    group: t.group,
    name: t.name,
    note: sentence(t.about),
    tag: t.broad ? "Whole field" : undefined,
    on: has(t.id),
    onClick: () => toggle({ id: t.id, name: t.name }),
  });
  const fromMatch = (m: Match): Item => ({
    key: `match-${m.name}`,
    group: m.group,
    name: m.name,
    note: sentence(m.about),
    on: Boolean(followed(m)),
    busy: adding === m.name,
    onClick: () => follow(m),
  });
  const mine = interests.map((i): Item => {
    const t = presetById.get(i.id);
    if (t) return fromPreset(t);
    return { key: i.id, group: i.group ?? "Other", name: i.name || "Shared interest", note: i.about ? sentence(i.about) : "Added by you", on: true, onClick: () => toggle(i) };
  });

  const looking = q.length >= 2;
  const shown = looking ? [...new Set([...listed(q), ...(found?.related ?? []).flatMap((id) => presetById.get(id) ?? [])])] : [];
  const results = [...shown.map(fromPreset), ...(found?.matches ?? []).map(fromMatch)];
  const said = `“${text.trim()}”`;
  const status = !looking
    ? ""
    : searching
      ? `Searching for ${said}…`
      : !found
        ? `Press Search to find more for ${said}, including anything not listed here.`
        : found.offline
          ? `Search is busy right now, so this follows ${said} just as you typed it.`
          : results.length
            ? ""
            : `Nothing found for ${said}. Try another name for it.`;

  const browsing = [...presets.filter((t) => t.group === category).map(fromPreset), ...(browsed[category]?.matches ?? []).map(fromMatch)];
  const browseNote = loading.includes(category)
    ? `Finding more ${category} interests…`
    : failed === category
      ? "Couldn't find more right now. Try again in a minute."
      : "";

  return (
    <>
      <PageHead title="My interests">
        <p>Search for anything you want to keep up with, like a sport, a team, an artist, a show, a game or a company, or browse a category. Your briefing only includes what you follow.</p>
      </PageHead>

      <form onSubmit={search} className="mb-4 max-w-2xl">
        <div className="flex gap-2">
          <input
            className={field}
            type="search"
            aria-label="Search for an interest"
            placeholder="Search, like AI, Formula 1 or Taylor Swift"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setCategory("");
            }}
            maxLength={80}
          />
          <button disabled={searching || !looking} className={`${primary} shrink-0`}>
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
        {(error || status) && <p className={`mt-2 text-sm ${error ? "text-accent" : "text-muted"}`}>{error || status}</p>}
      </form>

      <div className="-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {["All", ...groups].map((c) => {
          const value = c === "All" ? "" : c;
          const on = !looking && category === value;
          return (
            <button
              key={c}
              onClick={() => browse(value)}
              aria-pressed={on}
              className={`shrink-0 rounded-[5px] border px-3 py-1.5 text-[13px] transition-colors ${
                on ? "border-ink bg-ink font-medium text-bg" : "border-line bg-surface text-muted hover:border-strong hover:text-ink"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {looking ? (
        results.length > 0 && (
          <Block title="Results">
            <Categories items={results} />
          </Block>
        )
      ) : category ? (
        <Block title="Suggestions" note={browseNote}>
          <Categories items={browsing} />
        </Block>
      ) : (
        <>
          {mine.length > 0 && (
            <Block title="Following" note="Click one to stop following.">
              <Categories items={mine} />
            </Block>
          )}
          <Block title="Suggestions" note="A few from each category. Search for anything else.">
            <Categories
              items={presets.map(fromPreset)}
              limit={3}
              more={(g) => {
                browse(g);
                window.scrollTo({ top: 0 });
              }}
            />
          </Block>
        </>
      )}

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
