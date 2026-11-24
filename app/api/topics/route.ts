import { makeTopic } from "@/lib/custom";
import { saveTopic } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const topic = await makeTopic(await req.json());
    await saveTopic(topic);
    return Response.json({ id: topic.id, name: topic.name });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Couldn't add that topic" }, { status: 400 });
  }
}
