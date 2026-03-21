import type { ActivityRequest } from "@/types/activity";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function objectiveHint(objective: string): string {
  const text = objective.trim().replace(/\.$/, "");
  if (text.length <= 90) return text;
  return `${text.slice(0, 87)}...`;
}

export function buildStudentTasks(input: ActivityRequest): string[] {
  const subject = normalize(input.subject);
  const hint = objectiveHint(input.objective);
  const inclusive = input.targetGroup === "inclusiva";

  if (subject.includes("matemat")) {
    return [
      `Resolva as 6 contas da folha e confira em dupla (${hint}).`,
      "Complete a sequência numérica com os números que faltam.",
      "Leia o problema curto e escreva a resposta com cálculo.",
      inclusive
        ? "Use material concreto (tampinhas ou palitos) para representar uma conta e registrar no quadro."
        : "Crie um problema de matemática do cotidiano e troque com um colega para resolver."
    ];
  }

  if (subject.includes("portugues")) {
    return [
      `Complete as palavras com as letras que faltam (${hint}).`,
      "Organize as sílabas embaralhadas para formar palavras.",
      "Escreva 2 frases usando as palavras da atividade.",
      inclusive
        ? "Leia as frases com apoio visual e marque a opção correta."
        : "Leia um pequeno texto e circule os adjetivos encontrados."
    ];
  }

  if (subject.includes("cien")) {
    return [
      `Observe a imagem/experimento e registre 3 descobertas (${hint}).`,
      "Classifique os elementos em vivo / não vivo.",
      "Ligue cada ser vivo ao ambiente em que vive melhor.",
      inclusive
        ? "Escolha uma descoberta e explique com desenho + uma frase."
        : "Escreva uma conclusão curta sobre o que você aprendeu."
    ];
  }

  if (subject.includes("hist")) {
    return [
      `Observe as imagens e ordene os fatos em antes e depois (${hint}).`,
      "Complete a linha do tempo com os eventos fornecidos.",
      "Compare duas situações históricas com semelhanças e diferenças.",
      "Escreva uma frase explicando por que a ordem dos fatos importa."
    ];
  }

  if (subject.includes("geo")) {
    return [
      `Identifique no mapa os pontos pedidos na atividade (${hint}).`,
      "Descreva o trajeto de casa até a escola com setas e palavras-chave.",
      "Relacione paisagem natural e paisagem modificada por pessoas.",
      "Marque no desenho os elementos do bairro (rua, praça, escola, comércio)."
    ];
  }

  if (subject.includes("arte")) {
    return [
      `Crie uma produção artística seguindo o tema da aula (${hint}).`,
      "Use ao menos 3 cores e 2 formas diferentes na composição.",
      "Dê um título para sua produção e explique sua ideia em 1 frase.",
      "Compartilhe com a turma e registre o que mais gostou em outra produção."
    ];
  }

  return [
    `Realize a atividade principal proposta na aula (${hint}).`,
    "Resolva os itens 1 a 4 com atenção e capricho.",
    "Revise suas respostas e faça correções necessárias.",
    "Registre no final o que você aprendeu hoje."
  ];
}
