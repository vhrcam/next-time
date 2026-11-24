import { wantedTopics } from "@/lib/db";
import { refresh } from "@/lib/refresh";

export const maxDuration = 300;

// Runs once a day: checks every topic someone opened in the last 30 days, oldest check first, until time runs short.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new Response("Unauthorized", { status: 401 });
  const start = Date.now();
  const done: { id: string; added: number; failed: string[] }[] = [];
  for (const topic of await wantedTopics(30)) {
    if (Date.now() - start > 240000) break;
    if (topic.checked && Date.now() - topic.checked < 6 * 3600000) continue;
    try {
      const r = await refresh(topic);
      done.push({ id: topic.id, added: r.added, failed: r.failed });
    } catch (e) {
      done.push({ id: topic.id, added: 0, failed: [String(e)] });
    }
  }
  return Response.json({ checked: done.length, done });
}
