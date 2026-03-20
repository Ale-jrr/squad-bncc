import { z } from "zod";

export const profilesEnum = z.enum([
  "tea",
  "tdah",
  "dislexia",
  "deficiencia_intelectual",
  "tod",
  "deficiencia_auditiva",
  "deficiencia_visual",
  "tdc",
  "altas_habilidades"
]);

export const activityRequestSchema = z.object({
  studentName: z.string().min(1),
  age: z.number().int().min(4).max(18),
  grade: z.string().min(1),
  supportLevel: z.enum(["leve", "moderado", "alto", "muito_alto"]),
  profiles: z.array(profilesEnum).min(1),
  subject: z.string().min(1),
  bnccCode: z.string().min(4),
  objective: z.string().min(5),
  context: z.enum(["sala_regular", "aee", "casa"]),
  durationMin: z.number().int().min(5).max(90)
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
