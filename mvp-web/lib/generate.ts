import type { ActivityRequest, GeneratedActivity } from "@/types/activity";
import { suggestBnccCode } from "@/lib/bncc-matrix";
import { buildProfileAdaptations, buildSupportAdjustments } from "@/lib/adaptation-engine";
import { buildStudentTasks } from "@/lib/student-tasks";

export function generateActivity(input: ActivityRequest): GeneratedActivity {
  const bnccRef = suggestBnccCode(input.grade, input.subject);
  const supportAdjustments = buildSupportAdjustments(input.supportLevel, input.durationMin);
  const profileAdaptations = buildProfileAdaptations(input.profiles);

  return {
    objective: input.objective,
    bnccCode: input.bnccCode,
    steps: buildStudentTasks(input),
    adaptations: [
      ...supportAdjustments,
      ...profileAdaptations
    ],
    planB:
      "Se houver recusa/sobrecarga, reduzir para uma única ação, oferecer duas escolhas, aplicar pausa curta e retomar com menor demanda.",
    successCriteria:
      "Concluir ao menos dois blocos da atividade com engajamento funcional e menor necessidade de ajuda no bloco final.",
    printable: {
      title: `Atividade personalizada - ${input.studentName}`,
      blocks: [
        `Componente: ${input.subject}`,
        `Código BNCC informado: ${input.bnccCode}`,
        bnccRef
          ? `Referência BNCC por série/componente: ${bnccRef.code}${bnccRef.sourcePage ? ` (p. ${bnccRef.sourcePage})` : ""}`
          : "Referência BNCC automática: não encontrada para combinação atual",
        `Duração total: ${input.durationMin} min`,
        "Registro: sem ajuda / ajuda parcial / ajuda total"
      ]
    }
  };
}
