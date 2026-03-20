import { NextResponse } from "next/server";
import { activityRequestSchema } from "@/types/activity";
import { generateActivity } from "@/lib/generate";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = activityRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload invalido", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = generateActivity(parsed.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Falha ao processar requisicao." }, { status: 500 });
  }
}
