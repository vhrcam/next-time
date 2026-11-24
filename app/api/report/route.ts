import { getTopics, saveTopic, storiesFor, want } from "@/lib/db";
import { presetById } from "@/lib/topics";

const STALE = 12 * 3600000;

export async function GET(req: Request) {
  const ids = [...new Set((new URL(req.url).searchParams.get("topics") ?? "").split(",").filter(Boolean))].slice(0, 30);
  let rows = await getTopics(ids);
  const missing = ids.filter((id) => presetById.has(id) && !rows.some((r) => r.id === id));
  if (missing.length) {
    await Promise.all(missing.map((id) => saveTopic(presetById.get(id)!)));
    rows = await getTopics(ids);
  }
  await want(rows.map((r) => r.id));
  const stories = await storiesFor(
    rows.map((r) => r.id),
    Date.now() - 31 * 86400000,
  );
  const now = Date.now();
  return Response.json({
    topics: ids
      .map((id) => rows.find((r) => r.id === id))
      .filter((r) => r != null)
      .map((r) => ({
        id: r.id,
        name: r.name,
        custom: r.custom,
        checked: r.checked,
        checking: r.checking != null && now - r.checking < 180000,
        stale: !r.checked || now - r.checked > STALE,
      })),
    stories,
  });
}
