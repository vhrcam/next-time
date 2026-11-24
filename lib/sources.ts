import { XMLParser } from "fast-xml-parser";

export type Source =
  | { type: "news"; q: string }
  | { type: "site"; domain: string; q?: string }
  | { type: "feed"; url: string; site: string; kind?: Kind; match?: string }
  | { type: "youtube"; user?: string; channel?: string; site: string }
  | { type: "hn"; q: string; min?: number };

export type Kind = "official" | "news" | "community";

export type Item = {
  title: string;
  url: string;
  site: string;
  date: number | null;
  text: string;
  kind: Kind;
  points?: number;
};

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", htmlEntities: true });

const list = <T>(v: T | T[] | undefined): T[] => (v == null ? [] : Array.isArray(v) ? v : [v]);

const str = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object" && "#text" in v) return String((v as { "#text": unknown })["#text"]);
  return "";
};

export const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const time = (v: unknown) => {
  const t = Date.parse(str(v));
  return Number.isNaN(t) ? null : t;
};

async function get(url: string) {
  const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(10000), cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).hostname}`);
  return res.text();
}

function parseFeed(body: string, site: string, kind: Kind): Item[] {
  const doc = xml.parse(body);
  if (doc.rss) {
    return list(doc.rss.channel?.item).map((it: Record<string, unknown>) => ({
      title: plain(str(it.title)),
      url: str(it.link).trim(),
      site,
      date: time(it.pubDate ?? it["dc:date"]),
      text: plain(str(it.description) || str(it["content:encoded"])).slice(0, 300),
      kind,
    }));
  }
  if (doc.feed) {
    return list(doc.feed.entry).map((it: Record<string, unknown>) => {
      const links = list(it.link as Record<string, string> | Record<string, string>[]);
      const link = links.find((l) => !l["@_rel"] || l["@_rel"] === "alternate") ?? links[0];
      const group = it["media:group"] as Record<string, unknown> | undefined;
      return {
        title: plain(str(it.title)),
        url: link?.["@_href"] ?? "",
        site,
        date: time(it.published ?? it.updated),
        text: plain(str(it.summary) || str(it.content) || str(group?.["media:description"])).slice(0, 300),
        kind,
      };
    });
  }
  return [];
}

const days = (n: number) => Date.now() - n * 86400000;

function googleNews(q: string, kind: Kind, back: number): Promise<Item[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${q} when:${back}d`)}&hl=en-US&gl=US&ceid=US:en`;
  return get(url).then((body) => {
    const doc = xml.parse(body);
    return list(doc.rss?.channel?.item).map((it: Record<string, unknown>) => {
      const site = str(it.source) || "News";
      const title = plain(str(it.title)).replace(new RegExp(`\\s+-\\s+${site.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "");
      return { title, url: str(it.link), site, date: time(it.pubDate), text: "", kind };
    });
  });
}

async function hackerNews(q: string, min: number, back: number): Promise<Item[]> {
  const since = Math.floor(days(back) / 1000);
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&numericFilters=${encodeURIComponent(`created_at_i>${since},points>=${min}`)}&hitsPerPage=40`;
  const data = JSON.parse(await get(url));
  return (data.hits ?? []).map((h: Record<string, unknown>) => ({
    title: plain(str(h.title)),
    url: str(h.url) || `https://news.ycombinator.com/item?id=${h.objectID}`,
    site: "Hacker News",
    date: (h.created_at_i as number) * 1000,
    text: "",
    kind: "community" as Kind,
    points: h.points as number,
  }));
}

export async function read(source: Source, back = 14): Promise<Item[]> {
  switch (source.type) {
    case "news":
      return googleNews(source.q, "news", back);
    case "site": {
      const items = await googleNews(`site:${source.domain}${source.q ? ` ${source.q}` : ""}`, "official", back);
      return items.map((i) => ({ ...i, site: i.site === "News" ? source.domain : i.site }));
    }
    case "feed": {
      const items = parseFeed(await get(source.url), source.site, source.kind ?? "official");
      const match = source.match ? new RegExp(source.match, "i") : null;
      return items.filter((i) => !match || match.test(`${i.title} ${i.text}`));
    }
    case "youtube": {
      const q = source.channel ? `channel_id=${source.channel}` : `user=${source.user}`;
      const items = parseFeed(await get(`https://www.youtube.com/feeds/videos.xml?${q}`), source.site, "official");
      return items.filter((i) => !/#shorts/i.test(i.title) && !i.url.includes("/shorts/"));
    }
    case "hn":
      return hackerNews(source.q, source.min ?? 30, back);
  }
}

export async function readAll(sources: Source[], back = 14) {
  const results = await Promise.allSettled(sources.map((s) => read(s, back)));
  const cutoff = days(back);
  const seen = new Set<string>();
  const items: Item[] = [];
  const failed: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      failed.push(`${sources[i].type}: ${r.reason instanceof Error ? r.reason.message : r.reason}`);
      return;
    }
    for (const item of r.value) {
      if (!item.title || !item.url || seen.has(item.url)) continue;
      if (item.date && item.date < cutoff) continue;
      seen.add(item.url);
      items.push(item);
    }
  });
  return { items, failed };
}
