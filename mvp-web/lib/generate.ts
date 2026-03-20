import type { ActivityRequest, GeneratedActivity } from "@/types/activity";
import { suggestBnccCode } from "@/lib/bncc-matrix";
import { buildProfileAdaptations, buildSupportAdjustments } from "@/lib/adaptation-engine";

export function generateActivity(input: ActivityRequest): GeneratedActivity {
  const bnccRef = suggestBnccCode(input.grade, input.subject);
  const supportAdjustments = buildSupportAdjustments(input.supportLevel, input.durationMin);
  const profileAdaptations = buildProfileAdaptations(input.profiles);

  const steps = [
    "Apresentar rotina visual: Inicio, Fazer e Finalizar.",
    "Executar em blocos curtos com pausa breve entre blocos.",
    "Aplicar uma instrucao por vez e confirmar compreensao.",
    "Finalizar com registro observavel de desempenho."
  ];

  return {
    objective: input.objective,
    bnccCode: input.bnccCode,
    steps,
    adaptations: [
      ...supportAdjustments,
      ...profileAdaptations
    ],
    planB:
      "Se houver recusa/sobrecarga, reduzir para uma unica acao, oferecer duas escolhas, aplicar pausa curta e retomar com menor demanda.",
    successCriteria:
      "Concluir ao menos dois blocos da atividade com engajamento funcional e menor necessidade de ajuda no bloco final.",
    printable: {
      title: `Atividade personalizada - ${input.studentName}`,
      blocks: [
        `Componente: ${input.subject}`,
        `Codigo BNCC informado: ${input.bnccCode}`,
        bnccRef ? `Referencia BNCC por serie/componente: ${bnccRef.code}` : "Referencia BNCC automatica: nao encontrada para combinacao atual",
        `Duracao total: ${input.durationMin} min`,
        "Registro: sem ajuda / ajuda parcial / ajuda total"
      ]
    }
  };
}
