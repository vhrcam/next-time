import { addLinks, addStory, claim, markSeen, release, storiesFor, unseen, type TopicRow } from "./db";
import { readAll, type Item } from "./sources";
import { sortByRules, sortWithAI, toLinks, type Found } from "./sort";

const newest = (a: Item, b: Item) => (b.date ?? 0) - (a.date ?? 0);

// Official posts first, then news in the order the search ranked it and the most-upvoted community posts,
// capped so one AI call can read them all.
function shortlist(items: Item[]) {
  const official = items.filter((i) => i.kind === "official").sort(newest).slice(0, 50);
  const news = items.filter((i) => i.kind === "news").slice(0, 60);
  const community = items.filter((i) => i.kind === "community").sort((a, b) => (b.points ?? 0) - (a.points ?? 0)).slice(0, 20);
  return [...official, ...news, ...community];
}

export async function refresh(topic: TopicRow) {
  if (!(await claim(topic.id))) return { skipped: true, added: 0, failed: [] as string[] };
  try {
    const back = topic.checked ? Math.min(14, Math.ceil((Date.now() - topic.checked) / 86400000) + 2) : 14;
    const { items, failed } = await readAll(topic.sources, back);
    const fresh = await unseen(topic.id, items.map((i) => i.url));
    const list = shortlist(items.filter((i) => fresh.has(i.url)));
    let found: Found[] = [];
    let used = [...fresh];
    if (list.length) {
      const recent = await storiesFor([topic.id], Date.now() - 21 * 86400000);
      try {
        if (!process.env.GEMINI_API_KEY) throw new Error("no key");
        found = await sortWithAI(topic, list, recent);
      } catch (e) {
        if (process.env.GEMINI_API_KEY) failed.push(`ai: ${e instanceof Error ? e.message.slice(0, 120) : e}`);
        found = sortByRules(list);
        used = list.filter((i) => i.kind === "official").map((i) => i.url);
      }
    }
    for (const f of found) {
      if (f.existing) await addLinks(f.existing, toLinks(f.posts), f.big);
      else await addStory(topic.id, { headline: f.headline, summary: f.summary, big: f.big, date: f.date, links: toLinks(f.posts) });
    }
    await markSeen(topic.id, used);
    await release(topic.id, true);
    return { skipped: false, added: found.filter((f) => !f.existing).length, failed };
  } catch (e) {
    await release(topic.id, false);
    throw e;
  }
}
