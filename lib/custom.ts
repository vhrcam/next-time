import { createHash } from "node:crypto";
import type { Source } from "./sources";
import type { Topic } from "./topics";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

async function page(url: string) {
  const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`That link returned ${res.status}`);
  return { body: await res.text(), url: res.url };
}

// Turns a link into the best source for it: a YouTube channel feed, the site's own RSS feed, or the site's posts via news search.
async function fromLink(link: string, name: string): Promise<Source> {
  const url = new URL(/^https?:\/\//.test(link) ? link : `https://${link}`);
  const host = url.hostname.replace(/^www\./, "");
  if (!/^https?:$/.test(url.protocol) || !host.includes(".") || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[)/.test(host))
    throw new Error("That link doesn't look like a public website");
  if (host.endsWith("youtube.com") || host === "youtu.be") {
    const { body } = await page(url.href);
    const id = body.match(/"(?:channelId|externalId)":"(UC[\w-]{22})"/)?.[1] ?? body.match(/channel\/(UC[\w-]{22})/)?.[1];
    if (!id) throw new Error("Couldn't find that YouTube channel");
    return { type: "youtube", channel: id, site: `${name} on YouTube` };
  }
  try {
    const { body, url: final } = await page(url.href);
    if (/^\s*(<\?xml[^>]*>\s*)?<(rss|feed)[\s>]/.test(body)) return { type: "feed", url: final, site: host };
    const tag = body.match(/<link[^>]+type="application\/(?:rss|atom)\+xml"[^>]*>/i)?.[0];
    const href = tag?.match(/href="([^"]+)"/)?.[1];
    if (href) return { type: "feed", url: new URL(href.replace(/&amp;/g, "&"), final).href, site: host };
  } catch {}
  return { type: "site", domain: host };
}

export async function makeTopic(input: { name?: string; words?: string; link?: string }): Promise<Topic> {
  const name = (input.name ?? "").trim().slice(0, 60);
  if (!name) throw new Error("Give the topic a name");
  const words = (input.words ?? "").trim().slice(0, 200) || (name.includes(" ") ? `"${name}"` : name);
  const sources: Source[] = [];
  if (input.link?.trim()) sources.push(await fromLink(input.link.trim(), name));
  sources.push({ type: "news", q: words }, { type: "hn", q: name, min: 50 });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "topic";
  const hash = createHash("sha1").update(JSON.stringify(sources)).digest("hex").slice(0, 6);
  return { id: `x-${slug}-${hash}`, name, group: "Yours", about: input.words?.trim() ? `${name} (searched as: ${words})` : name, sources, custom: true };
}
