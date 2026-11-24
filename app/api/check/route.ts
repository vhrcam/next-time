import { getTopics } from "@/lib/db";
import { refresh } from "@/lib/refresh";

export const maxDuration = 120;

// Checks one topic's sources, but never more than once an hour, so visitors can't burn through the free AI limit.
export async function POST(req: Request) {
  const id = new URL(req.url).searchParams.get("topic") ?? "";
  const [topic] = await getTopics([id]);
  if (!topic) return Response.json({ error: "Unknown topic" }, { status: 404 });
  if (topic.checked && Date.now() - topic.checked < 3600000) return Response.json({ skipped: true, added: 0 });
  try {
    const result = await refresh(topic);
    if (result.failed.length) console.warn("check problems", id, result.failed);
    return Response.json({ skipped: result.skipped, added: result.added });
  } catch (e) {
    console.error("check failed", id, e);
    return Response.json({ error: "Couldn't check this topic right now" }, { status: 502 });
  }
}
