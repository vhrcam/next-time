import { createClient, type InValue } from "@libsql/client";
import type { Topic } from "./topics";

export type Link = { title: string; url: string; site: string };

export type Story = {
  id: number;
  topic: string;
  headline: string;
  summary: string;
  big: boolean;
  date: string;
  found: number;
  links: Link[];
};

export type TopicRow = Topic & { checked: number | null; checking: number | null };

const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let ready: Promise<unknown> | undefined;

function setup() {
  ready ??= db.batch(
    [
      `create table if not exists topics (
        id text primary key, name text not null, grp text not null, about text not null,
        sources text not null, custom integer not null default 0,
        checked_at integer, checking_at integer, wanted_at integer, created_at integer not null)`,
      `create table if not exists stories (
        id integer primary key autoincrement, topic_id text not null, headline text not null,
        summary text not null, big integer not null default 0, date text not null,
        found_at integer not null, links text not null default '[]')`,
      `create index if not exists stories_topic on stories (topic_id, found_at)`,
      `create table if not exists seen (topic_id text not null, url text not null, at integer not null, primary key (topic_id, url))`,
    ],
    "write",
  );
  return ready;
}

async function run(sql: string, args: InValue[] = []) {
  await setup();
  return db.execute({ sql, args });
}

const toTopic = (r: Record<string, unknown>): TopicRow => ({
  id: r.id as string,
  name: r.name as string,
  group: r.grp as string,
  about: r.about as string,
  sources: JSON.parse(r.sources as string),
  custom: Boolean(r.custom),
  checked: (r.checked_at as number) ?? null,
  checking: (r.checking_at as number) ?? null,
});

const toStory = (r: Record<string, unknown>): Story => ({
  id: Number(r.id),
  topic: r.topic_id as string,
  headline: r.headline as string,
  summary: r.summary as string,
  big: Boolean(r.big),
  date: r.date as string,
  found: Number(r.found_at),
  links: JSON.parse(r.links as string),
});

export async function saveTopic(t: Topic) {
  await run(
    `insert into topics (id, name, grp, about, sources, custom, created_at) values (?, ?, ?, ?, ?, ?, ?)
     on conflict (id) do update set name = excluded.name, grp = excluded.grp, about = excluded.about, sources = excluded.sources`,
    [t.id, t.name, t.group, t.about, JSON.stringify(t.sources), t.custom ? 1 : 0, Date.now()],
  );
}

export async function getTopics(ids: string[]) {
  if (!ids.length) return [];
  const rows = await run(`select * from topics where id in (${ids.map(() => "?").join(",")})`, ids);
  return rows.rows.map((r) => toTopic(r as Record<string, unknown>));
}

export async function want(ids: string[]) {
  if (!ids.length) return;
  await run(`update topics set wanted_at = ? where id in (${ids.map(() => "?").join(",")})`, [Date.now(), ...ids]);
}

export async function wantedTopics(days: number) {
  const rows = await run(`select * from topics where wanted_at > ? order by checked_at`, [Date.now() - days * 86400000]);
  return rows.rows.map((r) => toTopic(r as Record<string, unknown>));
}

export async function claim(id: string) {
  const now = Date.now();
  const res = await run(`update topics set checking_at = ? where id = ? and (checking_at is null or checking_at < ?)`, [
    now,
    id,
    now - 180000,
  ]);
  return res.rowsAffected === 1;
}

export async function release(id: string, done: boolean) {
  if (done) await run(`update topics set checking_at = null, checked_at = ? where id = ?`, [Date.now(), id]);
  else await run(`update topics set checking_at = null where id = ?`, [id]);
}

export async function storiesFor(ids: string[], since: number) {
  if (!ids.length) return [];
  const rows = await run(
    `select * from stories where topic_id in (${ids.map(() => "?").join(",")}) and found_at > ? order by date desc, found_at desc`,
    [...ids, since],
  );
  return rows.rows.map((r) => toStory(r as Record<string, unknown>));
}

export async function unseen(topic: string, urls: string[]) {
  if (!urls.length) return new Set<string>();
  const known = new Set<string>();
  for (let i = 0; i < urls.length; i += 200) {
    const part = urls.slice(i, i + 200);
    const rows = await run(`select url from seen where topic_id = ? and url in (${part.map(() => "?").join(",")})`, [topic, ...part]);
    rows.rows.forEach((r) => known.add(r.url as string));
  }
  return new Set(urls.filter((u) => !known.has(u)));
}

export async function markSeen(topic: string, urls: string[]) {
  if (!urls.length) return;
  await setup();
  const now = Date.now();
  await db.batch(
    urls.map((url) => ({ sql: `insert or ignore into seen (topic_id, url, at) values (?, ?, ?)`, args: [topic, url, now] })),
    "write",
  );
}

export async function addStory(topic: string, s: Omit<Story, "id" | "topic" | "found">) {
  await run(`insert into stories (topic_id, headline, summary, big, date, found_at, links) values (?, ?, ?, ?, ?, ?, ?)`, [
    topic,
    s.headline,
    s.summary,
    s.big ? 1 : 0,
    s.date,
    Date.now(),
    JSON.stringify(s.links),
  ]);
}

export async function addLinks(story: Story, links: Link[], big: boolean) {
  const have = new Set(story.links.map((l) => l.url));
  const merged = [...story.links, ...links.filter((l) => !have.has(l.url))].slice(0, 12);
  await run(`update stories set links = ?, big = ? where id = ?`, [JSON.stringify(merged), big || story.big ? 1 : 0, story.id]);
}
