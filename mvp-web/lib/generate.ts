import type { ActivityRequest, GeneratedActivity } from "@/types/activity";

const supportGuidance: Record<string, string> = {
  leve: "Aumentar autonomia com desafios curtos.",
  moderado: "Roteiro guiado com checkpoints e pausa programada.",
  alto: "Microetapas com mediacao proxima e reducao de carga.",
  muito_alto: "Uma acao por bloco, mediacao constante e previsibilidade maxima."
};

function normalizeLevel(level: string): string {
  return level.trim().toLowerCase().replaceAll(" ", "_");
}

export function generateActivity(input: ActivityRequest): GeneratedActivity {
  const levelKey = normalizeLevel(input.supportLevel);
  const levelAdvice = supportGuidance[levelKey] ?? "Aplicar progressao gradual de apoio conforme resposta do aluno.";
  const profileLabel = input.profiles.join(", ");

  return {
    objective: input.objective,
    bnccCode: input.bnccCode,
    steps: [
      "Apresentar rotina visual: Inicio, Fazer, Finalizar.",
      "Executar em blocos de 3 a 5 minutos.",
      "Aplicar uma instrucao curta por vez e validar compreensao.",
      "Registrar desempenho e encerrar com reforco positivo."
    ],
    adaptations: [
      `Perfis considerados: ${profileLabel}.`,
      `Nivel de suporte: ${input.supportLevel}. ${levelAdvice}`,
      "Hierarquia de prompts: verbal, gestual, modelagem, fisico parcial.",
      "Pausa de regulacao de 1 minuto entre blocos."
    ],
    planB:
      "Se houver recusa/sobrecarga, reduzir para uma unica acao, oferecer duas escolhas, aplicar pausa curta e retomar com menor demanda.",
    successCriteria:
      "Concluir ao menos dois blocos com engajamento funcional e menor necessidade de ajuda no bloco final.",
    printable: {
      title: `Atividade personalizada - ${input.studentName}`,
      blocks: [
        `Componente: ${input.subject}`,
        `Codigo BNCC: ${input.bnccCode}`,
        `Duracao total: ${input.durationMin} min`,
        "Registro: sem ajuda / ajuda parcial / ajuda total"
      ]
    }
  };
}
