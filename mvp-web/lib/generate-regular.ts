import type { ActivityRequest, GeneratedActivity } from "@/types/activity";
import { suggestBnccCode } from "@/lib/bncc-matrix";
import { buildStudentTasks } from "@/lib/student-tasks";

function buildRegularAdjustments(levelRaw: string, durationMin: number): string[] {
  const normalized = levelRaw.toLowerCase();
  const config =
    normalized === "leve"
      ? { tempo: "6-8 min", etapas: 6, media: "autonomia com checagem pontual" }
      : normalized === "alto"
        ? { tempo: "3-5 min", etapas: 4, media: "mediação intensiva da rotina" }
        : { tempo: "4-6 min", etapas: 5, media: "mediação guiada em momentos-chave" };

  const blocos = Math.max(1, Math.floor(durationMin / 5));
  return [
    `Nível de condução didática: ${levelRaw} (${config.media}).`,
    `Tempo sugerido por bloco: ${config.tempo}.`,
    `Quantidade máxima de etapas por ciclo: ${config.etapas}.`,
    `Total sugerido de blocos na duração informada: ${blocos}.`,
    "Ativar participação da turma com combinados claros e rotina previsível.",
    "Encerrar com síntese oral breve do que foi aprendido."
  ];
}

export function generateRegularActivity(input: ActivityRequest): GeneratedActivity {
  const bnccRef = suggestBnccCode(input.grade, input.subject);
  const regularAdjustments = buildRegularAdjustments(input.supportLevel, input.durationMin);

  return {
    objective: input.objective,
    bnccCode: input.bnccCode,
    steps: buildStudentTasks(input),
    adaptations: regularAdjustments,
    planB:
      "Se houver baixa participação da turma, reduzir a tarefa para um objetivo central, retomar com exemplo concreto e reorganizar em pares.",
    successCriteria:
      "A turma demonstra compreensão do objetivo em atividade prática e registra evidência de aprendizagem no fechamento.",
    printable: {
      title: `Atividade regular BNCC - ${input.studentName}`,
      blocks: [
        `Componente: ${input.subject}`,
        `Código BNCC informado: ${input.bnccCode}`,
        bnccRef
          ? `Referência BNCC por série/componente: ${bnccRef.code}${bnccRef.sourcePage ? ` (p. ${bnccRef.sourcePage})` : ""}`
          : "Referência BNCC automática: não encontrada para combinação atual",
        `Duração total: ${input.durationMin} min`,
        "Registro: atingiu / em desenvolvimento / precisa de retomada"
      ]
    }
  };
}
