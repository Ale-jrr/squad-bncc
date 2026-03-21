import OpenAI from "openai";
import { z } from "zod";
import type { ActivityRequest, GeneratedActivity } from "@/types/activity";

const generatedActivitySchema = z.object({
  objective: z.string().trim().min(5),
  bnccCode: z.string().trim().min(1),
  steps: z.array(z.string().trim().min(5)).min(3).max(8),
  adaptations: z.array(z.string().trim().min(5)).min(3).max(10),
  planB: z.string().trim().min(5),
  successCriteria: z.string().trim().min(5),
  printable: z.object({
    title: z.string().trim().min(3),
    blocks: z.array(z.string().trim().min(3)).min(4).max(8)
  })
});

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

function resolveMaxTokens(): number {
  const raw = Number(process.env.OPENAI_MAX_TOKENS ?? "700");
  if (!Number.isFinite(raw) || raw < 200) return 700;
  return Math.min(Math.floor(raw), 1400);
}

export async function generateActivityWithOpenAI(input: ActivityRequest): Promise<GeneratedActivity | null> {
  if (!client) return null;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: resolveMaxTokens(),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Você é um planejador pedagógico BNCC. Responda apenas em JSON válido, sem markdown. Gere atividade curta, prática e pronta para impressão. Se targetGroup for regular, não use linguagem de perfis atípicos."
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Gerar atividade BNCC conforme schema esperado e modo selecionado",
            schema: {
              objective: "string",
              bnccCode: "string",
              steps: ["string"],
              adaptations: ["string"],
              planB: "string",
              successCriteria: "string",
              printable: { title: "string", blocks: ["string"] }
            },
            constraints: [
              "Usar português do Brasil",
              "Manter linguagem clara para professor",
              "Não usar texto muito longo",
              "Retornar exatamente os campos solicitados",
              "Os steps devem ser tarefas reais para a criança executar em sala",
              "Não escrever instruções de planejamento para professor nos steps"
            ],
            input
          })
        }
      ]
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) return null;

    const parsedJson = JSON.parse(rawContent);
    const parsed = generatedActivitySchema.safeParse(parsedJson);
    if (!parsed.success) return null;

    return {
      ...parsed.data,
      bnccCode: input.bnccCode
    };
  } catch {
    return null;
  }
}
