function normalizeProfile(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

const profileMap: Record<string, string[]> = {
  tea: [
    "Usar rotina visual com previsibilidade e fechamento claro.",
    "Reduzir estímulos simultâneos e manter instruções curtas.",
    "Antecipar transições com aviso breve e consistente."
  ],
  tdah: [
    "Dividir tarefa em microetapas com checkpoints frequentes.",
    "Alternar momentos de foco e pausa motora curta.",
    "Manter objetivo visível durante toda a atividade."
  ],
  dislexia: [
    "Priorizar fontes legíveis, espaço entre linhas e apoio visual.",
    "Evitar blocos extensos de texto contínuo.",
    "Oferecer leitura mediada quando necessário."
  ],
  deficiencia_intelectual: [
    "Trabalhar uma habilidade por vez com modelagem concreta.",
    "Repetir padrões de tarefa com progressão gradual.",
    "Usar critério de sucesso enxuto e observável."
  ],
  tod: [
    "Combinar regras curtas e previsíveis antes de iniciar.",
    "Oferecer escolhas limitadas para aumentar adesão.",
    "Reforçar comportamento-alvo de forma imediata."
  ],
  deficiencia_auditiva: [
    "Reforçar instruções com suporte visual e demonstração.",
    "Garantir contato visual e confirmação de compreensão.",
    "Usar sinais/gestos combinados para início e fim das etapas."
  ],
  deficiencia_visual: [
    "Priorizar orientações verbais claras e referência tátil quando possível.",
    "Organizar materiais em posição fixa e previsível.",
    "Remover obstáculos e excesso de elementos visuais dispersos."
  ],
  tdc: [
    "Simplificar demanda motora e oferecer materiais adaptados.",
    "Aumentar tempo de execução das etapas manuais.",
    "Valorizar progresso funcional em vez de velocidade."
  ],
  altas_habilidades: [
    "Incluir opção de extensão com desafio adicional.",
    "Permitir autonomia na escolha de estratégia de resolução.",
    "Propor variacao de complexidade sem aumentar carga de base."
  ]
};

const supportScale: Record<string, { block: string; stepCap: number; mediation: string }> = {
  leve: { block: "5-7 min", stepCap: 6, mediation: "apoio pontual" },
  moderado: { block: "4-6 min", stepCap: 5, mediation: "apoio guiado" },
  alto: { block: "3-5 min", stepCap: 4, mediation: "mediação frequente" },
  muito_alto: { block: "2-4 min", stepCap: 3, mediation: "mediação constante" }
};

export function buildSupportAdjustments(levelRaw: string, durationMin: number): string[] {
  const level = normalizeProfile(levelRaw);
  const config = supportScale[level] ?? { block: "3-5 min", stepCap: 4, mediation: "mediação ajustada em tempo real" };
  const estimatedBlocks = Math.max(1, Math.floor(durationMin / 5));

  return [
    `Nível de suporte aplicado: ${levelRaw} (${config.mediation}).`,
    `Tempo por bloco recomendado: ${config.block}.`,
    `Quantidade máxima de etapas por ciclo: ${config.stepCap}.`,
    `Total sugerido de blocos na duração informada: ${estimatedBlocks}.`
  ];
}

export function buildProfileAdaptations(profilesRaw: string[]): string[] {
  const collected = new Set<string>();

  profilesRaw.forEach((profile) => {
    const key = normalizeProfile(profile);
    const items = profileMap[key];
    if (items) {
      items.forEach((item) => collected.add(item));
    } else {
      collected.add(`Adaptar instruções para o perfil informado (${profile}) com observação contínua da resposta do aluno.`);
    }
  });

  collected.add("Aplicar plano B imediato em caso de recusa ou sobrecarga.");
  return Array.from(collected);
}
