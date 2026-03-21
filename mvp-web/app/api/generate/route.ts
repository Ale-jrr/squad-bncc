import { NextResponse } from "next/server";
import { generateActivity } from "@/lib/generate";
import { generateActivityWithOpenAI } from "@/lib/generate-openai";
import { generateRegularActivity } from "@/lib/generate-regular";
import { activityRequestSchema } from "@/types/activity";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = activityRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload inválido", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const fallback =
      parsed.data.targetGroup === "regular"
        ? generateRegularActivity(parsed.data)
        : generateActivity(parsed.data);

    const result = (await generateActivityWithOpenAI(parsed.data)) ?? fallback;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Falha ao processar requisição." }, { status: 500 });
  }
}
