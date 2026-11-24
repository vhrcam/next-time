import { GoogleGenAI } from "@google/genai";
import type { Item } from "./sources";
import type { Link, Story } from "./db";
import type { Topic } from "./topics";

export type Found = {
  posts: Item[];
  existing: Story | null;
  headline: string;
  summary: string;
  big: boolean;
  date: string;
};

const light = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
// The free tier allows only a few calls a minute, so after both models refuse, wait a moment and ask the light one again.
const models = [light, "gemini-3.5-flash", light];
let client: GoogleGenAI | undefined;

const day = (t: number | null) => new Date(t ?? Date.now()).toISOString().slice(0, 10);

const schema = {
  type: "object",
  properties: {
    stories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          posts: { type: "array", items: { type: "integer" } },
          existing: { type: "string" },
          headline: { type: "string" },
          summary: { type: "string" },
          big: { type: "boolean" },
          date: { type: "string" },
        },
        required: ["posts", "existing", "headline", "summary", "big", "date"],
      },
    },
  },
  required: ["stories"],
};

function prompt(topic: Topic, items: Item[], recent: Story[]) {
  const label = (i: Item) => (i.kind === "community" ? `community (${i.points ?? 0} points)` : i.kind);
  const posts = items
    .map((i, n) => `${n + 1} · ${label(i)} · ${i.site} · ${day(i.date)} · ${i.title}${i.text ? ` — ${i.text.slice(0, 180)}` : ""}`)
    .join("\n");
  const known = recent.length ? recent.map((s) => `S${s.id} · ${s.date} · ${s.headline}`).join("\n") : "(none yet)";
  return `You write a short news report for people who stay off social media but don't want to miss real news about a topic they follow.

Topic: ${topic.name}: ${topic.about}.
Today is ${day(Date.now())}.

Stories already in the report:
${known}

New posts found since the last check:
${posts}

Pick out the real announcements and news among the new posts.
- Keep: launches, releases, new features and updates, price or plan changes, release dates and delays, reveals and trailers, official statements, policy changes, outages and shutdowns, big deals, funding, acquisitions and leadership changes.
- Leave out: opinion, analysis, reviews, guides, lists, reactions, jokes, rumors, leaks, speculation ("could", "might", "reportedly", "expected to"), stock and market chatter, shopping deals and sales, and anything that isn't really about ${topic.name}.
- One story per real-world development. Put every post about the same development in it (list their numbers in posts).
- Several small version releases of one product become one story.
- If a post covers a story already in the report, set existing to that story's id (like "S12") and don't repeat the story. Otherwise leave existing empty.
- headline: plain and factual, under 12 words, no hype, no clickbait, no emoji.
- summary: one sentence with the key facts: what changed, who it's for, when it's out. Never include plot or story details of games, shows or films.
- big: true only for news most people following ${topic.name} would want to hear about, like a major new product or model, a release date, or a big price change. Point releases, small features, partnerships, TV and content lineups, awards and outages are not big. Be strict: in a typical two weeks only one to three stories are big.
- date: the day it happened, YYYY-MM-DD.
- Returning no stories is fine when nothing qualifies.`;
}

export async function sortWithAI(topic: Topic, items: Item[], recent: Story[]): Promise<Found[]> {
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { retryOptions: { attempts: 1 } } });
  let lastError: unknown;
  for (const [n, model] of models.entries()) {
    if (n === 2) await new Promise((r) => setTimeout(r, 8000));
    try {
      const res = await client.models.generateContent({
        model,
        contents: prompt(topic, items, recent),
        config: { responseMimeType: "application/json", responseJsonSchema: schema, abortSignal: AbortSignal.timeout(45000) },
      });
      const data = JSON.parse((res.text ?? "").trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, ""));
      const byId = new Map(recent.map((s) => [`S${s.id}`, s]));
      return (data.stories as { posts: number[]; existing: string; headline: string; summary: string; big: boolean; date: string }[])
        .map((s) => {
          const posts = [...new Set(s.posts)].map((n) => items[n - 1]).filter(Boolean);
          const earliest = Math.min(...posts.map((p) => p.date ?? Date.now()));
          return {
            posts,
            existing: byId.get(s.existing.trim()) ?? null,
            headline: s.headline.trim(),
            summary: s.summary.trim(),
            big: Boolean(s.big),
            date: /^\d{4}-\d{2}-\d{2}$/.test(s.date) ? s.date : day(earliest),
          };
        })
        .filter((s) => s.posts.length && (s.existing || s.headline));
    } catch (e) {
      lastError = e;
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

// Without the AI, only posts from official channels are trusted, one story each, with near-duplicate titles merged.
export function sortByRules(items: Item[]): Found[] {
  const found: Found[] = [];
  for (const item of items.filter((i) => i.kind === "official")) {
    const same = found.find((f) => similar(f.headline, item.title));
    if (same) same.posts.push(item);
    else found.push({ posts: [item], existing: null, headline: item.title, summary: item.text.split(/(?<=\.)\s/)[0] ?? "", big: false, date: day(item.date) });
  }
  return found;
}

export const toLinks = (posts: Item[]): Link[] =>
  [...posts]
    .sort((a, b) => Number(b.kind === "official") - Number(a.kind === "official"))
    .map((p) => ({ title: p.title, url: p.url, site: p.site }));
