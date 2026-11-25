import { find } from "@/lib/find";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { q } = await req.json().catch(() => ({ q: "" }));
  if (typeof q !== "string" || q.trim().length < 2) return Response.json({ error: "Type at least two letters" }, { status: 400 });
  return Response.json(await find(q));
}
