import { z } from "zod";

const bnccCodeRegex = /^[A-Z]{2}\d{2}[A-Z]{2,4}\d{2,3}$/;

export const activityRequestSchema = z.object({
  targetGroup: z.enum(["inclusiva", "regular"]),
  studentName: z.string().trim().min(1),
  age: z.number().int().min(4).max(18),
  grade: z.string().trim().min(1),
  supportLevel: z.string().trim().min(1).max(40),
  profiles: z.array(z.string().trim().min(2).max(60)).max(8),
  subject: z.string().trim().min(1),
  bnccCode: z.string().trim().toUpperCase().regex(bnccCodeRegex, "Código BNCC inválido"),
  objective: z.string().trim().min(5),
  context: z.enum(["sala_regular", "aee", "casa"]),
  durationMin: z.number().int().min(5).max(90)
}).superRefine((data, ctx) => {
  if (data.targetGroup === "inclusiva" && data.profiles.length < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["profiles"],
      message: "Informe ao menos um perfil atípico para o modo inclusivo."
    });
  }
});

export type ActivityRequest = z.infer<typeof activityRequestSchema>;

export type GeneratedActivity = {
  objective: string;
  bnccCode: string;
  steps: string[];
  adaptations: string[];
  planB: string;
  successCriteria: string;
  printable: {
    title: string;
    blocks: string[];
  };
};
