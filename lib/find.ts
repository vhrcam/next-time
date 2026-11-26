import { getSearch, saveSearch, searchesSince } from "./db";
import { gemini, models } from "./sort";
import { groups, presetById, presets } from "./topics";

export type Match = { name: string; group: string; about: string; words: string; link: string };
export type Results = { related: string[]; matches: Match[]; offline?: boolean };

// The app's own categories plus a few more, so the same kind of interest always lands in the same place.
const categories = [...groups, "Art & design", "Home", "Pets", "Politics"];

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

function prompt(q: string, browse: boolean) {
  const list = presets.map((t) => `${t.id} · ${t.name} · ${t.group} · ${t.about}`).join("\n");
  const opening = browse ? `Someone is browsing the ${q} category for things to follow.` : `Someone searched for: "${q}"`;
  const pick = browse
    ? `- related: leave it empty.
- matches: the 8 best-known things to follow in ${q} that the list doesn't already cover, most popular first. Mix kinds, like teams, leagues, people, products, shows, companies or events.`
    : `Work out what they want to follow.
- related: ids from the list above that are what they searched for or closely pertain to it, best first, at most 6. Leave it empty if none fit.
- matches: up to 4 things they most likely mean that the list doesn't already cover. If the search could mean different things (like Mercury), give the main meanings. If it's a whole field, also suggest the best-known specific subjects in it that aren't listed (companies, products, teams, people, shows). Leave it empty only when the list already covers the search completely.`;
  return `next time gives people short briefings of real announcements (launches, releases, dates, official news) about what they follow, so they can stay off social media. Anyone can use it for any interest: sports, music, shows, games, companies, products, hobbies, places and more.

${opening}

Interests the app already has (id · name · category · description):
${list}

${pick}
- name: its usual name, properly capitalized, under 40 characters.
- group: one of these categories: ${categories.join(", ")}. Only if none fit, a broad one in one or two words.
- about: what a briefing on it covers, in one lowercase line like the descriptions above.
- words: a Google News search made only of the names it goes by, like "Formula 1" OR F1. Put quotes around names with spaces and OR between names. No other words like news, official or announcements, and no version numbers.
- link: the official website or YouTube channel where it posts its own announcements, like formula1.com. Leave it empty if you're not sure.
- Never include plot or story details of games, shows or films.`;
}

async function ask(q: string, browse: boolean): Promise<Results | null> {
  for (const model of models.slice(0, 2)) {
    try {
      const res = await gemini().models.generateContent({
        model,
        contents: prompt(q, browse),
        config: { responseMimeType: "application/json", responseJsonSchema: schema, abortSignal: AbortSignal.timeout(25000) },
      });
      const data = JSON.parse((res.text ?? "").trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, ""));
      return {
        related: browse ? [] : [...new Set<string>(data.related)].slice(0, 6),
        matches: (data.matches as Match[])
          .map((m) => ({
            name: m.name.trim().slice(0, 60),
            group: browse ? q : m.group.trim().slice(0, 30) || "Other",
            about: m.about.trim(),
            words: m.words.trim(),
            link: m.link.trim(),
          }))
          .filter((m) => m.name)
          .slice(0, browse ? 8 : 4),
      };
    } catch (e) {
      console.warn("search failed", model, String(e instanceof Error ? e.message : e).slice(0, 100));
    }
  }
  return null;
}

// Saved results can be older than the catalog, so anything that's now a listed interest is dropped on the way out.
function current(results: Results): Results {
  const names = new Set(presets.map((t) => t.name.toLowerCase()));
  return {
    ...results,
    related: results.related.filter((id) => presetById.has(id)),
    matches: results.matches.filter((m) => !names.has(m.name.toLowerCase())),
  };
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Searches are shared by everyone and kept a week. New ones are capped per minute so search can't use up the free AI limit briefings need.
export async function find(query: string, browse = false): Promise<Results> {
  const q = query.trim().replace(/\s+/g, " ").slice(0, 80);
  const key = `${browse ? "browse:" : ""}${q.toLowerCase()}`;
  const kept = await getSearch(key, Date.now() - 7 * 86400000);
  if (kept) return current(JSON.parse(kept));
  const results = process.env.GEMINI_API_KEY && (await searchesSince(Date.now() - 60000)) < 8 ? await ask(q, browse) : null;
  if (!results) return { related: [], matches: browse ? [] : [{ name: capital(q), group: "Other", about: q, words: "", link: "" }], offline: true };
  await saveSearch(key, results);
  return current(results);
}
