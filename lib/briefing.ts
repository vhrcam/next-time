import type { Story } from "./db";

export type Entry = Story & { label?: string };
export type Schedule = "daily" | "two" | "three" | "weekly" | "major" | "manual";
export type Settings = { schedule: Schedule; limit: number; early: boolean };
export type Briefing = {
  id: number;
  issued: number;
  from: number | null;
  interests: string[];
  stories: Entry[];
  extra: Entry[];
  early: Entry[];
};

export const defaults: Settings = { schedule: "daily", limit: 10, early: true };
export const limits = [3, 5, 10, 15, 20];

export const schedules: { id: Schedule; label: string; note: string }[] = [
  { id: "daily", label: "Daily", note: "A new briefing every morning." },
  { id: "two", label: "Every two days", note: "A new briefing every other morning." },
  { id: "three", label: "Every three days", note: "A new briefing every third morning." },
  { id: "weekly", label: "Weekly", note: "One briefing a week." },
  { id: "major", label: "Major developments only", note: "No regular briefing. Only major developments, when they happen." },
  { id: "manual", label: "Manual", note: "A new briefing only when you ask for one." },
];

const every: Partial<Record<Schedule, number>> = { daily: 1, two: 2, three: 3, weekly: 7 };
const WEEK = 7 * 86400000;

export const isMajor = (s: Story) => s.importance >= 3;

export const rank = (a: Story, b: Story) =>
  b.importance - a.importance || b.links.length - a.links.length || b.date.localeCompare(a.date);

// Regular briefings arrive at 6 AM local time, a set number of days after the last one.
export function nextDue(last: Briefing | undefined, s: Settings) {
  const days = every[s.schedule];
  if (!days || !last) return null;
  const d = new Date(last.issued);
  d.setHours(6, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

// Developments not delivered yet. For interests the last briefing covered, anything found since it.
// For new interests, and for the very first briefing, the past week.
export function waiting(entries: Entry[], briefings: Briefing[], interests: string[], now: number) {
  const last = briefings[0];
  const delivered = new Set(briefings.flatMap((b) => [...b.stories, ...b.extra, ...b.early]).map((s) => s.id));
  return entries
    .filter((s) => interests.includes(s.topic) && !delivered.has(s.id))
    .filter((s) => (last?.interests.includes(s.topic) ? s.found > last.issued : Date.parse(s.date) >= now - WEEK))
    .sort(rank);
}

// The limit is a cap, not a target: a quiet week gives a short briefing.
export function issue(list: Entry[], briefings: Briefing[], interests: string[], s: Settings, now: number): Briefing {
  const pick = s.schedule === "major" ? list.filter(isMajor) : list;
  return {
    id: now,
    issued: now,
    from: briefings[0]?.issued ?? null,
    interests,
    stories: pick.slice(0, s.limit),
    extra: pick.slice(s.limit, s.limit + 20),
    early: [],
  };
}

// Runs once the page has fresh developments. Returns the new list of briefings, or null when nothing changes:
// a new briefing when one is due (or interests were added), otherwise major developments added to the current one early.
export function decide(entries: Entry[], briefings: Briefing[], interests: string[], s: Settings, now: number) {
  const last = briefings[0];
  const list = waiting(entries, briefings, interests, now);
  if (s.schedule === "major") return list.some(isMajor) ? [issue(list, briefings, interests, s, now), ...briefings] : null;
  const due = nextDue(last, s);
  if (!last || interests.some((id) => !last.interests.includes(id)) || (due != null && now >= due))
    return [issue(list, briefings, interests, s, now), ...briefings];
  const early = s.early ? list.filter(isMajor) : [];
  return early.length ? [{ ...last, early: [...last.early, ...early] }, ...briefings.slice(1)] : null;
}
