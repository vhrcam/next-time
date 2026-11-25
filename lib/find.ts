import { getSearch, saveSearch, searchesSince } from "./db";
import { gemini, models } from "./sort";
import { groups, presetById, presets } from "./topics";

export type Match = { name: string; group: string; about: string; words: string; link: string };
export type Results = { related: string[]; matches: Match[]; offline?: boolean };

// Fixed categories so the same kind of interest always lands in the same place.
const categories = [...groups, "Sports", "Music", "Movies & TV", "Books", "Business", "Cars", "Health", "Food", "Fashion", "Travel", "Art & design", "Politics"];

const schema = {
  type: "object",
  properties: {
    related: { type: "array", items: { type: "string" } },
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          group: { type: "string" },
          about: { type: "string" },
          words: { type: "string" },
          link: { type: "string" },
        },
        required: ["name", "group", "about", "words", "link"],
      },
    },
  },
  required: ["related", "matches"],
};

function prompt(q: string) {
  const list = presets.map((t) => `${t.id} · ${t.name} · ${t.group} · ${t.about}`).join("\n");
  return `next time gives people short briefings of real announcements (launches, releases, dates, official news) about what they follow, so they can stay off social media. Anyone can use it for any interest: sports, music, shows, games, companies, products, hobbies, places and more.

Someone searched for: "${q}"

Interests the app already has (id · name · category · description):
${list}

Work out what they want to follow.
- related: ids from the list above that are what they searched for or closely pertain to it, best first, at most 6. Leave it empty if none fit.
- matches: up to 4 things they most likely mean that the list doesn't already cover. If the search could mean different things (like Mercury), give the main meanings. If it's a whole field, also suggest the best-known specific subjects in it that aren't listed (companies, products, teams, people, shows). Leave it empty only when the list already covers the search completely.
- name: its usual name, properly capitalized, under 40 characters.
- group: one of these categories: ${categories.join(", ")}. Only if none fit, a broad one in one or two words.
- about: what a briefing on it covers, in one lowercase line like the descriptions above.
- words: a Google News search made only of the names it goes by, like "Formula 1" OR F1. Put quotes around names with spaces and OR between names. No other words like news, official or announcements, and no version numbers.
- link: the official website or YouTube channel where it posts its own announcements, like formula1.com. Leave it empty if you're not sure.
- Never include plot or story details of games, shows or films.`;
}

async function ask(q: string): Promise<Results | null> {
  for (const model of models.slice(0, 2)) {
    try {
      const res = await gemini().models.generateContent({
        model,
        contents: prompt(q),
        config: { responseMimeType: "application/json", responseJsonSchema: schema, abortSignal: AbortSignal.timeout(20000) },
      });
      const data = JSON.parse((res.text ?? "").trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, ""));
      const listed = new Set(presets.map((t) => t.name.toLowerCase()));
      return {
        related: [...new Set<string>(data.related)].filter((id) => presetById.has(id)).slice(0, 6),
        matches: (data.matches as Match[])
          .map((m) => ({
            name: m.name.trim().slice(0, 60),
            group: m.group.trim().slice(0, 30) || "Other",
            about: m.about.trim(),
            words: m.words.trim(),
            link: m.link.trim(),
          }))
          .filter((m) => m.name && !listed.has(m.name.toLowerCase()))
          .slice(0, 4),
      };
    } catch (e) {
      console.warn("search failed", model, String(e instanceof Error ? e.message : e).slice(0, 100));
    }
  }
  return null;
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Searches are shared by everyone and kept a week. New ones are capped per minute so search can't use up the free AI limit briefings need.
export async function find(query: string): Promise<Results> {
  const q = query.trim().replace(/\s+/g, " ").slice(0, 80);
  const key = q.toLowerCase();
  const kept = await getSearch(key, Date.now() - 7 * 86400000);
  if (kept) return JSON.parse(kept);
  const results = process.env.GEMINI_API_KEY && (await searchesSince(Date.now() - 60000)) < 8 ? await ask(q) : null;
  if (!results) return { related: [], matches: [{ name: capital(q), group: "Other", about: q, words: "", link: "" }], offline: true };
  await saveSearch(key, results);
  return results;
}
