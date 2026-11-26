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
      if (!process.env.GEMINI_API_KEY) {
        found = sortByRules(list);
        used = list.filter((i) => i.kind === "official").map((i) => i.url);
      } else {
        try {
          found = await sortWithAI(topic, list, recent, failed);
        } catch {
          // When the AI is busy, nothing is added: official sites also post opinion and fantasy pieces, so the posts
          // stay unseen and the topic stays unchecked until the next visit or the daily check tries again.
          await release(topic.id, false);
          return { skipped: false, added: 0, failed };
        }
      }
    }
    for (const f of found) {
      if (f.existing) await addLinks(f.existing, toLinks(f.posts), f.importance);
      else
        await addStory(topic.id, {
          headline: f.headline,
          summary: f.summary,
          points: f.points,
          why: f.why,
          importance: f.importance,
          date: f.date,
          links: toLinks(f.posts),
        });
    }
    await markSeen(topic.id, used);
    await release(topic.id, true);
    return { skipped: false, added: found.filter((f) => !f.existing).length, failed };
  } catch (e) {
    await release(topic.id, false);
    throw e;
  }
}
