import { find } from "@/lib/find";
import { groups } from "@/lib/topics";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { q, browse } = await req.json().catch(() => ({}));
  if (typeof q !== "string" || q.trim().length < 2) return Response.json({ error: "Type at least two letters" }, { status: 400 });
  if (browse && !groups.includes(q)) return Response.json({ error: "Unknown category" }, { status: 400 });
  return Response.json(await find(q, Boolean(browse)));
}
