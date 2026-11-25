import { GoogleGenAI } from "@google/genai";
import type { Item, Kind } from "./sources";
import type { Link, Story } from "./db";
import type { Topic } from "./topics";

export type Found = {
  posts: Item[];
  existing: Story | null;
  headline: string;
  summary: string;
  points: string[];
  why: string;
  importance: number;
  date: string;
};

type Raw = Omit<Found, "posts" | "existing"> & { posts: number[]; existing: string };

const light = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
// The free tier allows only a few calls a minute, so after both models refuse, wait a moment and ask the light one again.
export const models = [light, "gemini-3.5-flash", light];
let shared: GoogleGenAI | undefined;
export const gemini = () =>
  (shared ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { retryOptions: { attempts: 1 } } }));

const day = (t: number | null) => new Date(t ?? Date.now()).toISOString().slice(0, 10);

const schema = {
  type: "object",
  properties: {
    developments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          posts: { type: "array", items: { type: "integer" } },
          existing: { type: "string" },
          headline: { type: "string" },
          summary: { type: "string" },
          points: { type: "array", items: { type: "string" } },
          why: { type: "string" },
          importance: { type: "integer", minimum: 1, maximum: 3 },
          date: { type: "string" },
        },
        required: ["posts", "existing", "headline", "summary", "points", "why", "importance", "date"],
      },
    },
  },
  required: ["developments"],
};

function prompt(topic: Topic, items: Item[], recent: Story[]) {
  const label = (i: Item) => (i.kind === "community" ? `community (${i.points ?? 0} points)` : i.kind);
  const posts = items
    .map((i, n) => `${n + 1} · ${label(i)} · ${i.site} · ${day(i.date)} · ${i.title}${i.text ? ` — ${i.text.slice(0, 280)}` : ""}`)
    .join("\n");
  const known = recent.length ? recent.map((s) => `S${s.id} · ${s.date} · ${s.headline}`).join("\n") : "(none yet)";
  return `You write briefings for people who stay off social media but don't want to miss real developments in what they follow.

Interest: ${topic.name}: ${topic.about}.
Today is ${day(Date.now())}.

Developments already reported:
${known}

New posts found since the last check (number · source type · outlet · date · title — excerpt):
${posts}

Find the real developments in the new posts. The test is whether something happened, not whether someone talked about something.
- Developments: launches and releases, new features and updates, price or plan changes, release dates and delays, reveals and official trailers, official statements, policy and rule changes, outages and shutdowns, big deals, funding, acquisitions and leadership changes. Credible reporting by an established outlet about a significant development also counts; say who reported it ("Bloomberg reports...").
- Not developments: opinion, commentary, analysis, reviews, guides, lists, reactions, memes, jokes, rumors, leaks, speculation and predictions ("could", "might", "expected to"), repeat coverage with nothing new, stock and market chatter, shopping deals, and anything that isn't really about ${topic.name}.
- Trust official sources and established outlets first. Ignore claims that only appear on unknown blogs, content farms or aggregators.
- One development per real-world event. List every post about it in posts. Several small version releases of one product become one development.
- If a post is about a development already reported, set existing to its id (like "S12") and keep the other fields short. Otherwise leave existing empty.
- headline: plain and factual, under 12 words, no hype, no clickbait, no emoji.
- summary: what happened, in one or two plain sentences.
- points: up to four short facts that are new, like names, numbers, dates, prices, availability and who it's for. Don't repeat the summary. Leave it empty if the posts don't say more.
- why: one or two sentences on why it matters to someone who follows ${topic.name}: what it changes for them or what they can now do. Plain and specific. Don't use words like historic, massive, unprecedented, milestone, game-changing, reshaping or landscape.
- importance: 3 = major, something most people following ${topic.name} would want to know right away (a major new product or model, a release date, a big price change, an acquisition). 2 = notable. 1 = minor (point releases, small features, partnerships, events, content lineups, awards). Be strict with 3: in a typical two weeks only one to three developments are major.
- date: the day it happened, YYYY-MM-DD.
- Use only facts that are in the posts. Never include plot or story details of games, shows or films.
- Returning no developments is fine when nothing qualifies.`;
}

// Failed attempts are added to notes so slow or refused calls show up in the check log.
export async function sortWithAI(topic: Topic, items: Item[], recent: Story[], notes: string[] = []): Promise<Found[]> {
  const client = gemini();
  const deadline = Date.now() + 100000;
  let lastError: unknown = new Error("AI timed out");
  for (const [n, model] of models.entries()) {
    if (n === 2) await new Promise((r) => setTimeout(r, 8000));
    const left = deadline - Date.now();
    if (left < 10000) break;
    const started = Date.now();
    try {
      const res = await client.models.generateContent({
        model,
        contents: prompt(topic, items, recent),
        config: { responseMimeType: "application/json", responseJsonSchema: schema, abortSignal: AbortSignal.timeout(Math.min(55000, left)) },
      });
      const data = JSON.parse((res.text ?? "").trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, ""));
      const byId = new Map(recent.map((s) => [`S${s.id}`, s]));
      return (data.developments as Raw[])
        .map((s) => {
          const posts = [...new Set(s.posts)].map((n) => items[n - 1]).filter(Boolean);
          const earliest = Math.min(...posts.map((p) => p.date ?? Date.now()));
          return {
            posts,
            existing: byId.get(s.existing.trim()) ?? null,
            headline: s.headline.trim(),
            summary: s.summary.trim(),
            points: (s.points ?? []).map((p) => p.trim()).filter(Boolean).slice(0, 4),
            why: (s.why ?? "").trim(),
            importance: Math.min(3, Math.max(1, Math.round(Number(s.importance) || 1))),
            date: /^\d{4}-\d{2}-\d{2}$/.test(s.date) ? s.date : day(earliest),
          };
        })
        .filter((s) => s.posts.length && (s.existing || s.headline));
    } catch (e) {
      lastError = e;
      notes.push(`ai ${model} failed after ${Math.round((Date.now() - started) / 1000)}s: ${String(e instanceof Error ? e.message : e).slice(0, 100)}`);
    }
  }
  throw lastError;
}

const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2));

function similar(a: string, b: string) {
  const x = words(a);
  const y = words(b);
  const shared = [...x].filter((w) => y.has(w)).length;
  return shared / Math.max(1, Math.min(x.size, y.size)) >= 0.6;
}

// Without the AI, only posts from official channels are trusted, one development each, with near-duplicate titles merged.
export function sortByRules(items: Item[]): Found[] {
  const found: Found[] = [];
  for (const item of items.filter((i) => i.kind === "official")) {
    const same = found.find((f) => similar(f.headline, item.title));
    if (same) same.posts.push(item);
    else
      found.push({
        posts: [item],
        existing: null,
        headline: item.title,
        summary: item.text.split(/(?<=\.)\s/)[0] ?? "",
        points: [],
        why: "",
        importance: 1,
        date: day(item.date),
      });
  }
  return found;
}

const order: Record<Kind, number> = { official: 0, news: 1, community: 2 };

export const toLinks = (posts: Item[]): Link[] =>
  [...posts].sort((a, b) => order[a.kind] - order[b.kind]).map((p) => ({ title: p.title, url: p.url, site: p.site, kind: p.kind }));
