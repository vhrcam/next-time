"use client";

import { useEffect, useRef, useState } from "react";
import { presetById } from "@/lib/topics";
import Picker, { type Picked } from "./picker";
import StoryRow, { type Story } from "./story";

type Info = { id: string; name: string; custom: boolean; checked: number | null; checking: boolean; stale: boolean };
type Data = { topics: Info[]; stories: Story[] };
type View = "new" | "week" | "month";

const DAY = 86400000;

function load<T>(key: string, fallback: T, session = false): T {
  try {
    const v = (session ? sessionStorage : localStorage).getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown, session = false) {
  try {
    (session ? sessionStorage : localStorage).setItem(key, JSON.stringify(value));
  } catch {}
}

const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 2) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

const longDay = (t: number) => new Date(t).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

// Reads the saved topics (plus any shared in the link) and when this person last looked, once per browser session.
function start() {
  let picked = load<Picked[]>("nexttime:topics", []);
  const shared = new URLSearchParams(location.search).get("t");
  if (shared) {
    const extra = shared
      .split(",")
      .filter((id) => id && !picked.some((p) => p.id === id))
      .map((id) => ({ id, name: presetById.get(id)?.name ?? "" }));
    picked = [...picked, ...extra];
    save("nexttime:topics", picked);
    history.replaceState(null, "", location.pathname);
  }
  let since = load<number | null>("nexttime:since", null, true);
  if (since == null) {
    since = load<number>("nexttime:visit", 0);
    save("nexttime:since", since, true);
  }
  const now = Date.now();
  save("nexttime:visit", now);
  return { picked, since, now };
}

export default function Report() {
  const [picked, setPicked] = useState<Picked[] | null>(null);
  const [since, setSince] = useState(0);
  const [now, setNow] = useState(0);
  const [data, setData] = useState<Data | null>(null);
  const [view, setView] = useState<View>("new");
  const [bigOnly, setBigOnly] = useState(false);
  const [editing, setEditing] = useState(false);
  const [checking, setChecking] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const tried = useRef(new Set<string>());

  useEffect(() => {
    const s = start();
    queueMicrotask(() => {
      setSince(s.since);
      setNow(s.now);
      setPicked(s.picked);
      setEditing(!s.picked.length);
    });
  }, []);

  useEffect(() => {
    if (!picked?.length || editing) return;
    let live = true;
    const fetchReport = async () => {
      const res = await fetch(`/api/report?topics=${picked.map((p) => p.id).join(",")}`);
      const d: Data = await res.json();
      if (live) setData(d);
      return d;
    };
    (async () => {
      const d = await fetchReport();
      if (!live) return;
      if (d.topics.some((t) => !picked.find((p) => p.id === t.id)?.name)) {
        const named = picked.map((p) => ({ ...p, name: d.topics.find((t) => t.id === p.id)?.name ?? p.name }));
        save("nexttime:topics", named);
      }
      const queue = d.topics.filter((t) => t.stale && !t.checking && !tried.current.has(t.id)).map((t) => t.id);
      queue.forEach((id) => tried.current.add(id));
      const busy = d.topics.filter((t) => t.checking).map((t) => t.id);
      setChecking([...queue, ...busy]);
      if (busy.length) setTimeout(() => live && fetchReport().then(() => setChecking((c) => c.filter((id) => !busy.includes(id)))), 20000);
      const worker = async () => {
        while (queue.length && live) {
          const id = queue.shift()!;
          await fetch(`/api/check?topic=${id}`, { method: "POST" }).catch(() => {});
          if (!live) return;
          await fetchReport();
          setChecking((c) => c.filter((x) => x !== id));
        }
      };
      await Promise.all([worker(), worker()]);
    })().catch(() => {});
    return () => {
      live = false;
    };
  }, [picked, editing]);

  function change(next: Picked[]) {
    setPicked(next);
    save("nexttime:topics", next);
  }

  async function copyLink() {
    if (!picked) return;
    await navigator.clipboard.writeText(`${location.origin}/?t=${picked.map((p) => p.id).join(",")}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!picked) return <main className="min-h-screen" />;

  const firstVisit = since === 0;
  const isNew = (s: Story) => (firstVisit ? Date.parse(s.date) >= now - 7 * DAY : s.found > since);
  const inView = (s: Story) => (view === "new" ? isNew(s) : Date.parse(s.date) >= now - (view === "week" ? 7 : 31) * DAY);
  const stories = (data?.stories ?? []).filter((s) => inView(s) && (!bigOnly || s.big));
  const topics = data?.topics ?? [];
  const withNews = topics.filter((t) => stories.some((s) => s.topic === t.id) || (checking.includes(t.id) && !t.checked));
  const quiet = topics.filter((t) => !withNews.includes(t));
  const count = stories.length;
  const noun = `${bigOnly ? "big " : ""}${count === 1 ? "story" : "stories"}`;

  const headline =
    view === "new"
      ? count
        ? firstVisit
          ? `${count} ${noun} from the past week`
          : `${count} new ${noun} since ${longDay(since)}`
        : firstVisit
          ? "Nothing in the past week yet"
          : `Nothing new since ${longDay(since)}`
      : `${count} ${noun} in the past ${view}`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 pb-16 pt-6">
      <header className="flex items-center justify-between">
        <span className="font-serif text-xl italic tracking-tight">next time</span>
        {!editing && (
          <button onClick={() => setEditing(true)} className="rounded-full border border-line px-3 py-1 text-sm text-muted hover:text-ink">
            Topics
          </button>
        )}
      </header>

      <div className="mt-10">
        {editing ? (
          <Picker picked={picked} first={!data} onChange={change} onDone={() => setEditing(false)} />
        ) : (
          <>
            <p className="text-sm text-faint">{longDay(now)}</p>
            <h1 className="mt-1 font-serif text-[2rem] leading-tight">{data ? headline : "Getting your report…"}</h1>
            {data && view === "new" && !count && !checking.length && (
              <p className="mt-2 text-sm text-muted">You&apos;re caught up. Nothing was announced in your topics since you last looked.</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex rounded-full border border-line bg-card p-0.5 text-sm">
                {(["new", "week", "month"] as View[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`rounded-full px-3 py-1 ${view === v ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}
                  >
                    {v === "new" ? "New" : v === "week" ? "Past week" : "Past month"}
                  </button>
                ))}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted select-none">
                <input type="checkbox" checked={bigOnly} onChange={(e) => setBigOnly(e.target.checked)} className="size-4 accent-[var(--accent)]" />
                Big news only
              </label>
            </div>

            <div className="mt-8 space-y-10">
              {withNews.map((t) => {
                const list = stories.filter((s) => s.topic === t.id);
                return (
                  <section key={t.id}>
                    <div className="flex items-baseline justify-between gap-3 border-b border-ink/80 pb-2">
                      <h2 className="text-sm font-semibold uppercase tracking-wider">{t.name}</h2>
                      <span className="shrink-0 text-xs text-faint">
                        {checking.includes(t.id) ? "Checking sources…" : t.checked ? `Checked ${ago(t.checked)}` : ""}
                      </span>
                    </div>
                    {list.length ? (
                      <ul>
                        {list.map((s) => (
                          <StoryRow key={s.id} story={s} fresh={view !== "new" && isNew(s)} />
                        ))}
                      </ul>
                    ) : (
                      <p className="py-4 text-sm text-faint">Reading official channels and the news. This takes a few seconds the first time.</p>
                    )}
                  </section>
                );
              })}

              {quiet.length > 0 && (
                <section className="rounded-xl border border-line bg-card px-4 py-3 text-sm">
                  <span className="text-muted">{view === "new" ? "Nothing new in " : `Nothing in the past ${view} in `}</span>
                  {quiet.map((t, i) => (
                    <span key={t.id}>
                      <span className="font-medium">{t.name}</span>
                      <span className="text-faint">
                        {checking.includes(t.id) ? " (checking…)" : t.checked ? ` (checked ${ago(t.checked)})` : ""}
                        {i < quiet.length - 1 ? ", " : ""}
                      </span>
                    </span>
                  ))}
                </section>
              )}
            </div>

            <footer className="mt-16 border-t border-line pt-4 text-xs leading-relaxed text-faint">
              <p>
                next time reads official sites and channels, Google News and Hacker News once a day. It keeps announcements and leaves out
                opinions, rumors, leaks and reactions. Headlines link to the original source.
              </p>
              <button onClick={copyLink} className="mt-2 underline underline-offset-2 hover:text-ink">
                {copied ? "Link copied" : "Copy a link with your topics to open on another device"}
              </button>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
